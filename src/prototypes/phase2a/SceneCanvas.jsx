import React, { useEffect, useRef } from 'react';

const clamp = value => Math.max(0, Math.min(1, value));
const ease = (a, b, value) => { const x = clamp((value - a) / (b - a)); return x * x * (3 - 2 * x); };

function createStars() {
  let seed = 2046;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  return Array.from({ length: 430 }, (_, index) => {
    const band = index > 220;
    const x = band ? 0.68 + (random() - 0.5) * 0.85 : random();
    return { x, y: band ? 0.48 + (x - 0.68) * 0.8 + (random() - 0.5) * 0.11 : random(), z: random(), light: random() };
  });
}

function glow(ctx, x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function cellFrame(w, h, pointer) {
  const mobile = w < 700;
  return {
    x: w * (mobile ? 0.58 : 0.7) + pointer.x * 5,
    y: h * (mobile ? 0.63 : 0.5) + pointer.y * 4,
    r: Math.min(w * (mobile ? 0.27 : 0.17), h * 0.24),
    light: Math.max(w, h) * 0.65,
  };
}

function cosmos(ctx, w, h, p, pointer, stars) {
  const descent = ease(0.65, 0.94, p);
  ctx.fillStyle = 'rgb(2,' + Math.round(3 + descent * 6) + ',' + Math.round(5 + descent * 3) + ')';
  ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.globalAlpha = 1 - descent;
  ctx.translate(w * 0.69, h * 0.47); ctx.rotate(0.56); ctx.scale(1, 0.18);
  glow(ctx, 0, 0, w * 0.43, 'rgba(173,153,115,.19)');
  ctx.restore();
  for (const star of stars) {
    const depth = 0.3 + star.z * 0.7;
    const zoom = 1 + descent * 5;
    const x = (star.x - 0.65) * w * zoom + w * 0.65 + pointer.x * depth * 9;
    const y = (star.y - 0.48) * h * zoom + h * 0.48 + pointer.y * depth * 7 - p * depth * 35;
    const alpha = (0.16 + star.light * 0.7) * (1 - descent);
    const radius = (0.3 + star.z * star.z * 1.2) * (1 + descent);
    ctx.fillStyle = 'rgba(226,222,209,' + alpha + ')';
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    if (star.light > 0.97 && star.z > 0.5) glow(ctx, x, y, 8, 'rgba(215,227,239,' + alpha * 0.22 + ')');
  }
  if (descent > 0) {
    const target = cellFrame(w, h, pointer);
    const expand = ease(0, 0.38, descent), settle = ease(0.38, 1, descent);
    const horizon = Math.max(w, h) * 0.86;
    const radius = (Math.min(w, h) * 0.025 + expand * (horizon - Math.min(w, h) * 0.025)) * (1 - settle) + target.r * settle;
    const x = w * 0.65 * (1 - settle) + target.x * settle;
    const y = (h * (0.48 + expand * 0.8)) * (1 - settle) + target.y * settle;
    const organic = ease(0.62, 0.96, descent);
    glow(ctx, target.x, target.y, target.light, 'rgba(22,97,87,' + 0.18 * settle + ')');
    glow(ctx, x, y, radius * 1.6, 'rgba(42,126,130,' + (1 - organic) * 0.1 + ')');
    membrane(ctx, x, y, radius, 0, 0, ease(0, 0.1, descent), 0, organic);
  }
}

function membrane(ctx, x, y, r, time, variant, alpha, pinch = 0, organic = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(variant * 0.2);
  ctx.globalAlpha = alpha;
  const color = variant > 1.5 ? '184,160,103' : variant > 0.5 ? '127,178,158' : '137,190,160';
  glow(ctx, 0, 0, r * 1.6, 'rgba(' + color + ',.07)');
  for (let layer = 3; layer >= 0; layer--) {
    ctx.beginPath();
    for (let step = 0; step <= 120; step++) {
      const a = step / 120 * Math.PI * 2;
      const deform = 1 + organic * (0.07 * Math.sin(a * 3 + time * 0.22 + variant) + 0.026 * Math.sin(a * 7 - time * 0.13));
      const radius = r * deform * (1 + layer * 0.025 * organic);
      const waist = 1 - pinch * 0.985 * Math.exp(-Math.pow(Math.cos(a) / 0.36, 2));
      const px = Math.cos(a) * radius * (1 + pinch * 0.55);
      const py = Math.sin(a) * radius * (1 - organic * 0.11) * (1 - pinch * 0.12) * waist;
      if (step === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (layer === 0) { ctx.fillStyle = 'rgba(' + color + ',.035)'; ctx.fill(); }
    ctx.lineWidth = layer === 0 ? 1.3 : 0.65;
    ctx.strokeStyle = 'rgba(' + color + ',' + (layer === 0 ? 0.8 : 0.15 * organic) + ')'; ctx.stroke();
  }
  // The same irregular interior is advected into the two lobes, then clipped to the membrane.
  ctx.clip();
  const noise = n => { const value = Math.sin(n * 127.1 + variant * 13.7) * 43758.5453; return value - Math.floor(value); };
  for (let n = 0; n < 28; n++) {
    const a = noise(n + 1) * Math.PI * 2;
    const radius = r * Math.sqrt(noise(n + 40)) * 0.77;
    const dx = Math.cos(a) * radius;
    const px = dx + Math.sign(dx) * pinch * r * 0.32 + Math.sin(time * 0.13 + n) * r * 0.018;
    const py = Math.sin(a) * radius * 0.8 + Math.cos(time * 0.09 + n * 2) * r * 0.013;
    const length = r * (0.018 + noise(n + 80) * 0.075);
    ctx.beginPath(); ctx.moveTo(px, py);
    ctx.bezierCurveTo(px + length * 0.4, py - length, px + length, py + length * 0.6, px + length * 1.3, py + length * 0.1);
    ctx.strokeStyle = 'rgba(' + color + ',' + organic * (0.12 + noise(n + 100) * 0.28) + ')';
    ctx.lineWidth = 0.5 + noise(n + 120) * 0.7; ctx.stroke();
  }
  ctx.restore();
}

function life(ctx, w, h, p, pointer, time) {
  ctx.fillStyle = '#020908'; ctx.fillRect(0, 0, w, h);
  const fade = 1 - ease(0.73, 1, p) * 0.85;
  const frame = cellFrame(w, h, pointer);
  const division = ease(0.1, 0.52, p);
  const x = frame.x - division * w * (w < 700 ? 0.06 : 0.02), y = frame.y, r = frame.r;
  const pinch = ease(0, 0.8, division);
  const separation = ease(0.78, 1, division);
  glow(ctx, frame.x, frame.y, frame.light, 'rgba(22,97,87,' + 0.18 * fade + ')');
  if (separation < 1) membrane(ctx, x, y, r, time, 0, fade * (1 - separation), pinch);
  if (separation > 0) {
    const distance = r * (0.83 + separation * 0.16);
    membrane(ctx, x - distance, y - r * 0.06 * separation, r * 0.73, time, 0, separation * fade);
    membrane(ctx, x + distance, y + r * 0.08 * separation, r * 0.68, time, 0.8, separation * fade);
  }
  const offspring = ease(0.56, 0.7, p);
  if (offspring > 0) {
    membrane(ctx, x - r * 0.3, y + r * 1.6, r * 0.24, time, 2, offspring * fade);
    membrane(ctx, x + r * 1.2, y - r * 1.05, r * 0.29, time, 2.5, offspring * (1 - ease(0.7, 0.86, p)) * fade);
  }
  ctx.fillStyle = 'rgba(0,0,0,' + ease(0.8, 1, p) + ')'; ctx.fillRect(0, 0, w, h);
}

function acceleration(ctx, w, h, p, time) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
  const structure = ease(0, 0.28, p);
  const marks = ease(0.06, 0.2, p) * (1 - ease(0.32, 0.46, p));
  const symbols = ease(0.22, 0.42, p) * (1 - ease(0.5, 0.66, p));
  const language = ease(0.4, 0.65, p);
  const formal = ease(0.6, 0.8, p);
  const code = ease(0.78, 0.96, p);
  const saturation = ease(0.6, 1, p);
  if (p < 0.5) {
    membrane(ctx, w * 0.5, h * 0.5, Math.min(w, h) * 0.22 * (1 - structure * 0.4), time, 0, 1 - structure);
    for (let line = 0; line < 7; line++) {
      ctx.beginPath();
      for (let step = 0; step <= 60; step++) {
        const x = step / 60 * w;
        const y = h * (0.32 + line * 0.06) + Math.sin(step * 0.15 + line) * h * 0.09 * (1 - structure);
        if (step === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(181,186,168,' + (structure * (1 - language) * 0.2) + ')';
      ctx.lineWidth = 0.7; ctx.stroke();
    }
  }
  for (let n = 0; n < 24; n++) {
    const angle = n * 2.4;
    const align = ease(0.08, 0.48, p);
    const x = (w * 0.5 + Math.cos(angle) * Math.min(w, h) * 0.25) * (1 - align) + w * (0.1 + (n % 8) / 9) * align;
    const y = (h * 0.5 + Math.sin(angle) * h * 0.24) * (1 - align) + h * (0.3 + Math.floor(n / 8) * 0.2) * align;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 7, y - 10 * (1 - align), x + 13, y + 2 * (1 - align));
    ctx.strokeStyle = 'rgba(195,197,174,' + marks * 0.45 + ')'; ctx.lineWidth = 1; ctx.stroke();
    ctx.font = '20px Georgia, serif';
    ctx.fillStyle = 'rgba(213,205,187,' + symbols * 0.38 + ')';
    ctx.fillText(['∑', '→', '≠', '·'][n % 4], x, y);
  }
  const words = ['MATERIA', 'ENERGÍA', 'VIDA'];
  for (let row = 0; row < 4; row++) {
    const size = Math.max(w * (0.1 + row * 0.025), 65);
    const velocity = time * (5 + saturation * 45) * (row % 2 ? 1 : -1);
    ctx.font = '300 ' + size + 'px "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(220,212,193,' + (language * (0.08 + row * 0.02)) + ')';
    const text = words[row % words.length];
    const span = ctx.measureText(text).width + size;
    const offset = ((velocity + row * w * 0.18) % span + span) % span;
    for (let x = offset - span; x < w; x += span) ctx.fillText(text, x, h * (0.24 + row * 0.22));
  }
  const fragments = ['∑  [ ]  ≠  { }', '[  ]  →  {  }', '∑  →  ≠'];
  const rows = 3 + Math.floor(saturation * 10);
  for (let row = 0; row < rows; row++) {
    const size = 11 + (row % 3) * 3;
    const travel = time * (12 + saturation * 140) * (row % 2 ? 1 : -1);
    const fragment = fragments[row % fragments.length];
    ctx.font = size + 'px ui-monospace, monospace';
    const span = ctx.measureText(fragment).width + 80;
    const offset = ((travel + row * 117) % span + span) % span;
    ctx.save();
    ctx.translate(0, h * (0.12 + row / rows * 0.82));
    ctx.rotate((row % 3 - 1) * 0.018 * (1 - formal));
    ctx.fillStyle = 'rgba(227,215,191,' + (formal * (0.09 + (row % 3) * 0.04)) + ')';
    for (let x = offset - span; x < w; x += span) ctx.fillText(fragment, x, 0);
    ctx.fillStyle = 'rgba(227,215,191,' + code * 0.17 + ')';
    for (let x = offset - span + 35; x < w; x += span) ctx.fillText(row % 2 ? '0101 → 1010' : '0010 → 0110', x, 18);
    ctx.restore();
  }
}

export default function SceneCanvas({ kind, reduced }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scene = canvas.closest('[data-scene]');
    const cosmosScene = kind === 'origins' ? scene.querySelector('[data-scene="existence"]') : null;
    const lifeScene = kind === 'origins' ? scene.querySelector('[data-scene="life"]') : null;
    const stars = createStars();
    let frame = 0, visible = false, last = 0, time = 0;
    let width = 0, height = 0, dpr = 1;
    const pointer = { x: 0, y: 0 };
    const draw = timestamp => {
      frame = 0;
      if (!visible || document.hidden) return;
      const lifeRect = lifeScene?.getBoundingClientRect();
      const activeKind = kind === 'origins' ? (lifeRect.top <= 0 ? 'life' : 'cosmos') : kind;
      const animated = !reduced && activeKind !== 'cosmos';
      if (animated && timestamp - last < 33) { frame = requestAnimationFrame(draw); return; }
      if (last && animated) time += Math.min(timestamp - last, 80) / 1000;
      last = timestamp;
      const rect = activeKind === 'cosmos' ? cosmosScene.getBoundingClientRect() : lifeRect || scene.getBoundingClientRect();
      const p = clamp(-rect.top / Math.max(1, rect.height - (activeKind === 'cosmos' ? 0 : height)));
      canvas.dataset.view = activeKind === 'cosmos' ? 'existence' : activeKind;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (activeKind === 'cosmos') cosmos(ctx, width, height, p, reduced ? { x: 0, y: 0 } : pointer, stars);
      if (activeKind === 'life') life(ctx, width, height, p, reduced ? { x: 0, y: 0 } : pointer, reduced ? 0 : time);
      if (activeKind === 'acceleration') acceleration(ctx, width, height, p, reduced ? 0 : time);
      if (animated) frame = requestAnimationFrame(draw);
    };
    const requestDraw = () => { if (visible && !document.hidden && !frame) frame = requestAnimationFrame(draw); };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      requestDraw();
    };
    const onPointer = event => {
      if (reduced || event.pointerType !== 'mouse') return;
      pointer.x = (event.clientX / Math.max(width, 1) - 0.5) * 2;
      pointer.y = (event.clientY / Math.max(height, 1) - 0.5) * 2;
      requestDraw();
    };
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; last = 0; }
      else requestDraw();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestDraw();
      else { cancelAnimationFrame(frame); frame = 0; last = 0; }
    });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas); observer.observe(scene);
    scene.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', requestDraw, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    resize();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect();
      scene.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', requestDraw);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [kind, reduced]);
  return <div className="p2-visual" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
