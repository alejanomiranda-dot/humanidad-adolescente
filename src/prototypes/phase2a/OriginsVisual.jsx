import React, { useEffect, useRef, useState } from 'react';
import SceneCanvas from './SceneCanvas.jsx';

function GPUOrigins() {
  const canvasRef=useRef(null);
  const [failed,setFailed]=useState(false);
  useEffect(() => {
    if(failed)return;
    let cancelled=false, dispose;
    import('./originsRenderer.js').then(({createOriginsRenderer}) => {
      if(cancelled)return;
      dispose=createOriginsRenderer(canvasRef.current,()=>setFailed(true));
    }).catch(()=>{if(!cancelled)setFailed(true);});
    return ()=>{cancelled=true;dispose?.();};
  },[failed]);
  if(failed)return <SceneCanvas kind="origins" reduced={false} />;
  return <div className="p2-visual" aria-hidden="true"><canvas ref={canvasRef} data-renderer="webgl" /></div>;
}

export default function OriginsVisual({reduced}) {
  return reduced ? <SceneCanvas kind="origins" reduced /> : <GPUOrigins />;
}
