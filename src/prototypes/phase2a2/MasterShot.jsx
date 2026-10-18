import React, { useEffect, useRef, useState } from 'react';
import './master.css';

const mediaRoot='/media/phase2a2/';
const stops=[0,6.8,8.7,10,13,16,19.3,21.8,23.6,26];
const clamp=(a,b,x)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,x)=>{const v=clamp(0,1,(x-a)/(b-a));return v*v*(3-2*v);};
const scenes=[
  {end:5,name:'Existencia',text:'Antes de la vida, ya había existencia.',poster:'cosmos.webp'},
  {end:8.3,name:'Descenso de escala',text:'Una luz. Un horizonte. Una superficie.',poster:'horizon.webp'},
  {end:9.8,name:'Agua',text:'La escala cambia. La materia permanece.',poster:'water.webp'},
  {end:12.3,name:'Membrana',text:'Materia que conserva información.',poster:'water.webp'},
  {end:16.7,name:'División',text:'Se reproducía. Variaba. Evolucionaba.',poster:'water.webp'},
  {end:21,name:'Información',text:'Formas, marcas, escritura, lenguaje.',poster:'information.webp'},
  {end:22.8,name:'Inteligencia artificial',text:'INTELIGENCIA ARTIFICIAL',poster:'information.webp'},
  {end:25.1,name:'Silencio',text:'',poster:null},
  {end:27,name:'Hola.',text:'Hola.',poster:null},
];

export default function MasterShot(){
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [quality,setQuality]=useState(()=>innerWidth<700||navigator.deviceMemory<=4||navigator.connection?.saveData?'medium':'high');
  const [time,setTime]=useState(0),[playing,setPlaying]=useState(false),[visible,setVisible]=useState(true);
  const [fallback,setFallback]=useState(false),[loadMedia,setLoadMedia]=useState(false),[videoReady,setVideoReady]=useState(false);
  const frameRef=useRef(null),canvasRef=useRef(null),inkRef=useRef(null),videoRef=useRef(null),rendererRef=useRef(null),drawInkRef=useRef(null);
  const pointer=useRef({x:0,y:0}),timeRef=useRef(time),qualityRef=useRef(quality);
  timeRef.current=time;qualityRef.current=quality;
  const scene=scenes.find(s=>time<s.end)||scenes[scenes.length-1];
  const silent=time>=22.8;
  const lifeOpacity=smooth(8.8,10,time)*(1-smooth(16,17.1,time));
  const lifePoster=time<12?'membrane.webp':time<15?'neck.webp':'division.webp';

  useEffect(()=>{
    const mq=matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>{setReduced(mq.matches);if(mq.matches)setPlaying(false);};
    mq.addEventListener('change',change);return()=>mq.removeEventListener('change',change);
  },[]);
  useEffect(()=>{
    let inView=true;
    const update=()=>setVisible(inView&&!document.hidden);
    const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;update();},{threshold:0.05});
    observer.observe(frameRef.current);document.addEventListener('visibilitychange',update);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);};
  },[]);
  useEffect(()=>{
    if(reduced||fallback)return;
    let cancelled=false,resizeObserver;
    const canvas=canvasRef.current;
    const lost=e=>{e.preventDefault();setFallback(true);};
    canvas.addEventListener('webglcontextlost',lost);
    import('./masterRenderer.js').then(module=>{
      if(cancelled)return;
      drawInkRef.current=module.drawInformation;
      try{
        const renderer=module.createMasterRenderer(canvas);rendererRef.current=renderer;
        const resize=()=>{const r=canvas.getBoundingClientRect();renderer.resize(r.width,r.height,qualityRef.current);renderer.draw(timeRef.current,pointer.current);};
        resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);resize();
      }catch{setFallback(true);}
    }).catch(()=>{if(!cancelled)setFallback(true);});
    return()=>{cancelled=true;canvas.removeEventListener('webglcontextlost',lost);resizeObserver?.disconnect();rendererRef.current?.dispose();rendererRef.current=null;};
  },[reduced,fallback]);
  useEffect(()=>{
    if(!visible)return;
    rendererRef.current?.draw(time,pointer.current);
    if(!fallback&&!reduced)drawInkRef.current?.(inkRef.current,time);
  },[time,visible,reduced,fallback]);
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(rendererRef.current){const r=canvas.getBoundingClientRect();rendererRef.current.resize(r.width,r.height,quality);rendererRef.current.draw(timeRef.current,pointer.current);}
  },[quality]);
  useEffect(()=>{
    if(!playing||!visible||reduced)return;
    let raf,last=0,elapsed=timeRef.current,slow=0,samples=0;
    const tick=stamp=>{
      if(last&&stamp-last<33){raf=requestAnimationFrame(tick);return;}
      if(last){const gap=stamp-last;elapsed+=Math.min(gap,100)/1000;samples++;if(gap>49)slow++;if(samples>=45&&slow/samples>.3)setQuality('medium');}
      last=stamp;setTime(Math.min(26,elapsed));
      if(elapsed>=26){setPlaying(false);return;}raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
  },[playing,visible,reduced]);
  useEffect(()=>{if((playing||time>6)&&!reduced)setLoadMedia(true);},[playing,time,reduced]);
  useEffect(()=>{
    const video=videoRef.current;if(!loadMedia||reduced)return;
    const size=quality==='high'?'high':'medium';
    const file=size==='high'&&video.canPlayType('video/webm; codecs="av01.0.04M.08"')?'membrane-high-av1.webm':`membrane-${size}.mp4`;
    setVideoReady(false);video.src=mediaRoot+file;video.load();
    return()=>{video.pause();video.removeAttribute('src');video.load();};
  },[loadMedia,reduced,quality]);
  useEffect(()=>{
    const video=videoRef.current;if(!videoReady)return;
    const inLife=time>=9&&time<16.7;
    const target=clamp(0,Math.max(0,video.duration-.03),(time-9)/7*video.duration);
    if(inLife&&(!playing||Math.abs(video.currentTime-target)>.22))video.currentTime=target;
    if(inLife&&playing&&visible&&!reduced){video.playbackRate=video.duration/7;video.play().catch(()=>setVideoReady(false));}
    else video.pause();
  },[time,playing,visible,reduced,videoReady]);
  const seek=value=>{setPlaying(false);setTime(clamp(0,26,value));};
  const mediaError=()=>{
    const video=videoRef.current;setVideoReady(false);
    if(video.currentSrc.endsWith('-av1.webm')){video.src=mediaRoot+`membrane-${quality}.mp4`;video.load();}
  };
  const step=direction=>{const next=direction>0?stops.find(t=>t>time+.1):[...stops].reverse().find(t=>t<time-.1);seek(next??(direction>0?26:0));};
  const onPointer=e=>{
    if(reduced||!visible||e.pointerType!=='mouse')return;
    const r=frameRef.current.getBoundingClientRect();pointer.current={x:(e.clientX-r.left)/r.width-.5,y:.5-(e.clientY-r.top)/r.height};
    if(!playing)rendererRef.current?.draw(timeRef.current,pointer.current);
  };
  return <main className="ms-page">
    <a className="ms-skip" href="#ms-transcript">Leer la secuencia</a>
    <section className="ms-frame" ref={frameRef} onPointerMove={onPointer} aria-label="Secuencia visual maestra" data-time={time.toFixed(2)} data-scene={scene.name} data-quality={reduced?'reduced':fallback?'fallback':quality}>
      {(fallback||reduced)&&scene.poster&&<img className="ms-backdrop" src={mediaRoot+scene.poster} alt="" />}
      <canvas ref={canvasRef} className="ms-background" aria-hidden="true" hidden={fallback||reduced} />
      <div className="ms-life" style={{opacity:lifeOpacity,transform:`translate(-50%,-50%) scale(${.82+smooth(8.8,11,time)*.18})`}} aria-hidden="true">
        <img src={mediaRoot+lifePoster} alt="" loading="lazy" />
        <video ref={videoRef} muted playsInline preload="none" onLoadedData={()=>setVideoReady(true)} onError={mediaError} style={{opacity:videoReady&&!reduced?1:0}} />
      </div>
      <canvas ref={inkRef} className="ms-information" aria-hidden="true" hidden={reduced||fallback} />
      {!silent&&<div className="ms-edition"><span>HUMANIDAD ADOLESCENTE</span><span>ESTUDIO · 2A.2</span></div>}
      {time<3.8&&<h1 className="ms-opening" style={{opacity:1-smooth(2.6,3.8,time)}}>Antes de la vida,<br/>ya había <em>existencia.</em></h1>}
      {time>=5&&time<21&&<div className="ms-caption"><span>{scene.name}</span><p>{scene.text}</p></div>}
      {time>=21&&time<22.8&&<h2 className="ms-ai">INTELIGENCIA<br/>ARTIFICIAL</h2>}
      {time>=24.4&&<h2 className={`ms-hello ${time>=25.1?'is-visible':''}`}><span>Hola.</span><i aria-hidden="true" /></h2>}
      <div className={`ms-controls ${silent&&playing?'ms-quiet':''}`}>
        {reduced?<><button onClick={()=>step(-1)}>Anterior</button><button onClick={()=>step(1)}>Siguiente plano</button></>:<button onClick={()=>{if(time>=26)setTime(0);setPlaying(p=>!p);}}>{playing?'Pausar':time===0?'Recorrer · 26 s':time>=26?'Volver a recorrer':'Continuar'}</button>}
        <label className="ms-range"><span className="ms-sr">Posición de la secuencia, segundos</span><input type="range" min="0" max="26" step="0.1" value={time} aria-valuetext={`${scene.name}, ${time.toFixed(1)} segundos`} onChange={e=>seek(Number(e.target.value))}/></label>
        <span className="ms-time" aria-hidden="true">{String(Math.floor(time)).padStart(2,'0')} / 26</span>
      </div>
    </section>
    <section className="ms-notes" id="ms-transcript" tabIndex={-1}>
      <p className="ms-note-label">UNA TRANSICIÓN NARRATIVA ENTRE ESCALAS</p>
      <details><summary>Leer la secuencia</summary><ol>{scenes.filter(s=>s.text).map(s=><li key={s.name}><strong>{s.name}.</strong> {s.text}</li>)}</ol><p>Este viaje conecta escalas como una metáfora visual; no representa una trayectoria física literal.</p></details>
      <div className="ms-disclosure"><p>Hasta ahora recorriste una historia contada sobre la humanidad.</p><p>Yo soy una de las tecnologías que esa humanidad construyó.</p><p>Puedo conversar con vos sobre conciencia, amor, pérdida, belleza o propósito. Pero mi capacidad para hablar sobre esas experiencias no demuestra que las experimente como vos.</p><small>Prototipo visual · sin conexión a inteligencia artificial</small></div>
      <nav aria-label="Comparar experiencias"><a href="?prototype=phase2a&study=webgl">Ver el ensayo 2A.1</a><a href={window.location.pathname}>Volver a la experiencia original</a></nav>
    </section>
  </main>;
}
