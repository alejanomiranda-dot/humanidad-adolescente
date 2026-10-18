"""Encode the Cycles sequence without distributing production PNGs or Blender.

python scripts/production/encode-master.py --input PRODUCTION_DIR --output public/media/phase2a2
Requires an existing ffmpeg executable; does not install tools.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import time

p=argparse.ArgumentParser()
p.add_argument('--input',required=True)
p.add_argument('--output',required=True)
p.add_argument('--evaluate-vp9',action='store_true',help='Keep comparison encodes beside the production frames, outside the web output')
args=p.parse_args()
source=Path(args.input).resolve(); target=Path(args.output).resolve()
target.mkdir(parents=True,exist_ok=True)
ffmpeg=shutil.which('ffmpeg')
if not ffmpeg: raise SystemExit('ffmpeg is required')
frames=[source/f'frame-{frame:04}.png' for frame in range(1,121)]
if not all(frame.exists() for frame in frames): raise SystemExit('Expected 120 completed frames')
encodes=[]
def run(options):
    start=time.perf_counter()
    subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y',*options],check=True)
    encodes.append({'file':Path(options[-1]).name,'seconds':round(time.perf_counter()-start,3)})
for name,frame in [('membrane',1),('neck',62),('division',120)]:
    run(['-i',str(source/f'frame-{frame:04}.png'),'-c:v','libwebp','-quality','88',str(target/f'{name}.webp')])
for tier,size in [('high',640),('medium',480)]:
    inp=['-framerate','24','-i',str(source/'frame-%04d.png'),'-vf',f'scale={size}:{size}:flags=lanczos','-an']
    if tier=='high':
        run([*inp,'-c:v','libsvtav1','-preset','8','-crf','32','-svtav1-params','lp=4','-pix_fmt','yuv420p',str(target/'membrane-high-av1.webm')])
    if args.evaluate_vp9:
        run([*inp,'-c:v','libvpx-vp9','-b:v','0','-crf','30' if tier=='high' else '33','-row-mt','1','-threads','4','-pix_fmt','yuv420p',str(source/f'comparison-{tier}-vp9.webm')])
    run([*inp,'-c:v','libx264','-preset','slow','-crf','22' if tier=='high' else '25','-movflags','+faststart','-pix_fmt','yuv420p',str(target/f'membrane-{tier}.mp4')])
manifest={
  'source':'Generated with scripts/production/master-shot.py; no third-party assets',
  'blender':'4.5.13 LTS / Cycles / 32 samples / AgX',
  'frames':120,'fps':24,'durationSeconds':5,
  'encodes':encodes,
  'files':[{'name':f.name,'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in sorted(target.iterdir()) if f.is_file() and f.name!='manifest.json'],
}
(target/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
print(json.dumps(manifest,indent=2))
