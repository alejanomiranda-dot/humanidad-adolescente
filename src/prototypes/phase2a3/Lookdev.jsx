import React, { useState } from 'react';
import './lookdev.css';

const frames=[
  {id:'01',name:'Existencia'},
  {id:'02',name:'Destino / horizonte'},
  {id:'03',name:'Agua / descenso',mobile:true,before:'water'},
  {id:'04',name:'Vida',mobile:true,before:'membrane'},
  {id:'05',name:'Constricción',mobile:true,before:'neck'},
  {id:'06',name:'Dos descendientes',before:'division'},
  {id:'07',name:'Vida → información',mobile:true,before:'information'},
  {id:'08',name:'Información / IA',mobile:true,before:'saturation'},
];
const root='/media/phase2a3/';

export default function Lookdev(){
  const [selected,setSelected]=useState(2);
  const [vertical,setVertical]=useState(()=>matchMedia('(max-width: 699px)').matches);
  const [comparison,setComparison]=useState(false);
  const [continuity,setContinuity]=useState(false);
  const frame=frames[selected],portrait=vertical&&frame.mobile;
  const adjacent=({'03':'04','04':'03','06':'07','07':'06'})[frame.id];
  const src=`${root}frame-${frame.id}-${portrait?'mobile':'desktop'}.webp`;
  return <main className="ld-page">
    <header className="ld-header"><a href="?prototype=phase2a">Humanidad Adolescente</a><p>ESTUDIO 2A.3 · LOOK DEVELOPMENT</p></header>
    <nav className="ld-frames" aria-label="Fotogramas del estudio" onKeyDown={e=>{
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
        e.preventDefault();const next=(selected+(e.key==='ArrowRight'?1:-1)+frames.length)%frames.length;
        setSelected(next);e.currentTarget.querySelectorAll('button')[next].focus();
      }
    }}>{frames.map((f,i)=><button key={f.id} aria-pressed={i===selected} onClick={()=>setSelected(i)}><span>{f.id}</span>{f.name}</button>)}</nav>
    <div className="ld-toolbar"><h1>{frame.id} / {frame.name}</h1><div>
      <button aria-pressed={!portrait} onClick={()=>setVertical(false)}>Escritorio</button>
      <button aria-pressed={!!portrait} disabled={!frame.mobile} onClick={()=>setVertical(true)}>Vertical</button>
      <a href={src} target="_blank" rel="noopener noreferrer">Abrir imagen</a>
    </div></div>
    <figure className={`ld-hero ${portrait?'ld-portrait':''}`}>
      <img key={src} src={src} alt={`Estudio visual ${frame.id}: ${frame.name}. Composición ${portrait?'vertical':'horizontal'}.`} width={portrait?810:1440} height={portrait?1440:810} decoding="async" />
      <figcaption>Fotograma de estudio · {portrait?'810 × 1440':'1440 × 810'} · imagen estática</figcaption>
    </figure>
    {adjacent&&<section className="ld-comparison"><button aria-expanded={continuity} aria-controls="ld-adjacent" onClick={()=>setContinuity(v=>!v)}>Revisar continuidad {['03','04'].includes(frame.id)?'03 → 04':'06 → 07'}</button>
      {continuity&&<figure id="ld-adjacent"><img src={`${root}frame-${adjacent}-desktop.webp`} alt={`Fotograma ${adjacent} para revisar continuidad con ${frame.id}`} width="1440" height="810" loading="lazy" /><figcaption>Fotograma {adjacent} · misma escena y familia de superficies</figcaption></figure>}
    </section>}
    {frame.before&&<section className="ld-comparison"><button aria-expanded={comparison} aria-controls="ld-before" onClick={()=>setComparison(v=>!v)}>Comparar con el Master Shot 2A.2</button>
      {comparison&&<figure id="ld-before"><img src={`${root}before-${frame.before}.webp`} alt={`Referencia anterior de 2A.2: ${frame.name}`} width="1440" height="900" loading="lazy" /><figcaption>2A.2 · captura de la experiencia anterior</figcaption></figure>}
    </section>}
    <footer className="ld-footer"><p>Tablero de revisión artística. La animación no forma parte de este estudio.</p><a href="?prototype=phase2a">Volver al Master Shot</a><a href={window.location.pathname}>Experiencia original</a></footer>
  </main>;
}
