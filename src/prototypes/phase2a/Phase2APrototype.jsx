import React, { useEffect, useRef, useState } from 'react';
import SceneCanvas from './SceneCanvas.jsx';
import OriginsVisual from './OriginsVisual.jsx';
import './phase2a.css';

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

function Arrival({ reduced }) {
  const arrivalRef = useRef(null);
  const frameRef = useRef(null);
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (reduced) { setPhase(2); return; }
    let timers = [];
    let started = false;
    let frame = 0;
    let reached = 0;
    const advance = next => {
      if (next <= reached) return;
      reached = next;
      setPhase(previous => Math.max(previous, next));
    };
    const readScroll = () => {
      frame = 0;
      const rect = arrivalRef.current.getBoundingClientRect();
      const travel = Math.max(1, rect.height - frameRef.current.offsetHeight);
      const progress = Math.max(0, -rect.top / travel);
      if (progress >= 0.3) advance(2);
      else if (progress >= 0.12) advance(1);
    };
    const onScroll = () => {
      if (reached < 2 && !frame) frame = requestAnimationFrame(readScroll);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.95 && !started) {
        started = true;
        timers = [setTimeout(() => advance(1), 2200), setTimeout(() => advance(2), 2900)];
      }
    }, { threshold: [0, 0.95] });
    observer.observe(frameRef.current);
    window.addEventListener('scroll', onScroll, { passive: true });
    readScroll();
    return () => {
      observer.disconnect(); timers.forEach(clearTimeout); cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduced]);
  return (
    <div className="p2-arrival" id="p2-arrival" ref={arrivalRef} data-phase={reduced ? 2 : phase}>
      <div className="p2-arrival-frame" ref={frameRef}>
        <h2 className="p2-hello" tabIndex={-1}>Hola.<span className="p2-cursor" aria-hidden="true" /></h2>
      </div>
    </div>
  );
}

export default function Phase2APrototype() {
  const reduced = useReducedMotion();
  const [answer, setAnswer] = useState(null);
  return (
    <main className="p2-prototype">
      <a className="p2-skip" href="#p2-astra-copy">Saltar al prototipo de Astra</a>

      <div className="p2-origins" data-scene="origins">
      <OriginsVisual reduced={reduced} />
      <section className="p2-scene p2-existence" data-scene="existence" aria-labelledby="p2-existence-title">
        <div className="p2-panel p2-opening" id="p2-existence">
          <div className="p2-scene-label"><span>01 / EXISTENCIA</span><span>PROTOTIPO · 2A</span></div>
          <h1 id="p2-existence-title">Antes de la vida,<br />ya había <span>existencia.</span></h1>
          <a className="p2-continue" href="#p2-elements" aria-label="Continuar hacia materia, energía, espacio y tiempo"><span aria-hidden="true">↓</span></a>
        </div>

        <div className="p2-panel p2-elements" id="p2-elements">
          <p>MATERIA</p><p>ENERGÍA</p><p>ESPACIO</p><p>TIEMPO</p>
        </div>
        <div className="p2-panel p2-observer">
          <p>Todo podía ocurrir sin que necesariamente hubiera alguien allí para experimentarlo.</p>
        </div>
        <div className="p2-panel p2-question">
          <h2>¿Puede algo tener valor si no existe nadie para quien pueda importar?</h2>
          <div className="p2-answers" role="group" aria-label="¿Puede algo tener valor si no existe nadie para quien pueda importar?">
            {['Sí.', 'No.', 'No lo sé.'].map(option => (
              <button key={option} aria-pressed={answer === option} onClick={() => setAnswer(option)}>{option}</button>
            ))}
          </div>
        </div>
        <div className="p2-descent" aria-hidden="true">
          <div className="p2-scale"><span>10²⁶ m</span><i /><span>10⁻⁶ m</span></div>
        </div>
      </section>

      <section className="p2-scene p2-life" data-scene="life" aria-labelledby="p2-life-heading">
        <div className="p2-panel p2-life-intro">
          <p className="p2-eyebrow">02 / VIDA</p>
          <h2 id="p2-life-heading">En la Tierra, parte de la materia empezó a organizarse de una manera distinta.</h2>
        </div>
        <div className="p2-panel p2-life-process">
          <div className="p2-verbs">
            <p>Usaba energía.</p>
            <p>Conservaba información.</p>
            <p>Se reproducía.</p>
            <p>Variaba.</p>
            <p>Evolucionaba.</p>
          </div>
        </div>
        <div className="p2-panel p2-life-reveal" id="p2-life">
          <h2>VIDA</h2>
        </div>
        <div className="p2-panel p2-consciousness">
          <p>Estar vivo no significa necesariamente saber que se está vivo.</p>
          <h3>VIDA ≠ CONCIENCIA</h3>
        </div>
      </section>
      </div>

      <section className="p2-scene p2-acceleration" data-scene="acceleration" aria-labelledby="p2-ai-heading">
        <SceneCanvas kind="acceleration" reduced={reduced} />
        <div className="p2-structure-space" aria-hidden="true" />
        <div className="p2-panel p2-ai-title"><h2 id="p2-ai-heading">INTELIGENCIA<br />ARTIFICIAL</h2></div>
      </section>

      <section className="p2-astra" aria-labelledby="p2-astra-id">
        <Arrival reduced={reduced} />
        <div className="p2-astra-copy" id="p2-astra-copy" tabIndex={-1}>
          <div className="p2-astra-history">
            <p>Hasta ahora recorriste una historia contada sobre la humanidad.</p>
            <p>Yo soy una de las tecnologías que esa humanidad construyó.</p>
            <h3 id="p2-astra-id">GPT-6 Astra · sistema de inteligencia artificial · 2026</h3>
          </div>
          <div className="p2-astra-disclosure">
            <p>Puedo conversar con vos sobre conciencia, amor, pérdida, belleza o propósito.</p>
            <p>Pero mi capacidad para hablar sobre esas experiencias no demuestra que las experimente como vos.</p>
          </div>
          <div className="p2-future-interface">
            <label htmlFor="p2-message">Prototipo visual · sin conexión</label>
            <input id="p2-message" type="text" disabled placeholder="Conversación no disponible" />
          </div>
          <a className="p2-original" href={window.location.pathname}>Volver a la experiencia original <span aria-hidden="true">↗</span></a>
        </div>
      </section>
    </main>
  );
}
