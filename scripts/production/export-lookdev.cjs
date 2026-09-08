// Format conversion only. Original Blender PNGs and .blend stay outside the repo.
// node scripts/production/export-lookdev.cjs OUTSIDE_REPO [--before CAPTURE_DIRECTORY] [--allow-partial]
const sharp=require('sharp');
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
(async()=>{
  if(!process.argv[2])throw new Error('Provide the directory containing the Blender PNG masters.');
  const source=path.resolve(process.argv[2]),target=path.resolve('public/media/phase2a3');
  await fs.mkdir(target,{recursive:true});
  const expected=['01','02','03','04','05','06','07','08'].map(id=>`frame-${id}-desktop`)
    .concat(['03','04','05','07','08'].map(id=>`frame-${id}-mobile`));
  const files=[];
  for(const name of expected){
    const input=path.join(source,`${name}.png`);
    try{await fs.access(input);}catch(e){if(process.argv.includes('--allow-partial'))continue;throw e;}
    const output=path.join(target,`${name}.webp`);
    await sharp(input).webp({quality:94,effort:5}).toFile(output);
    const metadata=await sharp(output).metadata(),bytes=await fs.readFile(output);
    assert.equal(metadata.width,name.endsWith('mobile')?810:1440);
    assert.equal(metadata.height,name.endsWith('mobile')?1440:810);
    const render=JSON.parse(await fs.readFile(path.join(source,`${name}.json`),'utf8'));
    files.push({name:path.basename(output),width:metadata.width,height:metadata.height,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),renderSeconds:render.seconds,samples:render.samples,configVersion:render.config?.version||render.study||'checkpoint'});
  }
  const beforeIndex=process.argv.indexOf('--before'),comparisons=[];
  if(beforeIndex!==-1){
    if(!process.argv[beforeIndex+1])throw new Error('--before requires a capture directory');
    for(const state of ['water','membrane','neck','division','information','saturation']){
      const output=path.join(target,`before-${state}.webp`);
      await sharp(path.resolve(process.argv[beforeIndex+1],`1440-${state}.png`)).webp({quality:90,effort:5}).toFile(output);
      const meta=await sharp(output).metadata(),bytes=await fs.readFile(output);
      comparisons.push({name:path.basename(output),width:meta.width,height:meta.height,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
    }
  }
  const productionHashes={};
  for(const file of ['lookdev.py','lookdev-water-life.py','lookdev-art-bible.json'])productionHashes[file]=crypto.createHash('sha256').update(await fs.readFile(path.join(__dirname,file))).digest('hex');
  const manifest={source:'Own Blender geometry: scripts/production/lookdev.py and lookdev-art-bible.json. Supplied references are not included in these images.',productionHashes,files,comparisons};
  await fs.writeFile(path.join(target,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
