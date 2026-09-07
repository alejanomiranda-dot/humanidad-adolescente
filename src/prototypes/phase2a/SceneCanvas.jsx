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

function cosmos(ctx, w, h, p, pointer, stars) {
  const descent = ease(0.73, 1, p);
  ctx.fillStyle = '#020305'; ctx.fillRect(0, 0, w, h);
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
    ctx.fillStyle = `rgba(226,222,209,${alpha})`;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    if (star.light > 0.97 && star.z > 0.5) glow(ctx, x, y, 8, `rgba(215,227,239,${alpha * 0.22})`);
  }
  if (descent > 0) {
    const radius = Math.min(w, h) * (0.035 + descent * 1.5);
    const x = w * 0.65, y = h * (0.52 + descent * 0.7);
    glow(ctx, x, y, radius * 1.6, `rgba(42,126,130,${descent * 0.38})`);
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#02080c'; ctx.fill();
    ctx.strokeStyle = `rgba(134,200,183,${descent * 0.65})`; ctx.lineWidth = 1.2; ctx.stroke();
    glow(ctx, w * 0.65, h, h * 0.9, `rgba(20,89,85,${descent * 0.22})`);
  }
}

function membrane(ctx, x, y, r, time, variant, alpha) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(variant * 0.6);
  ctx.globalAlpha = alpha;
  const color = variant > 1.5 ? '184,160,103' : '137,190,160';
  glow(ctx, 0, 0, r * 1.6, `rgba(${color},.07)`);
  for (let layer = 3; layer >= 0; layer--) {
    ctx.beginPath();
    for (let step = 0; step <= 100; step++) {
      const a = step / 100 * Math.PI * 2;
      const deform = 1 + 0.07 * Math.sin(a * 3 + time * 0.22 + variant) + 0.035 * Math.sin(a * 7 - time * 0.13);
      const radius = r * deform * (1 + layer * 0.045);
      const px = Math.cos(a) * radius, py = Math.sin(a) * radius * 0.89;
      if (step === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (layer === 0) { ctx.fillStyle = `rgba(${color},.035)`; ctx.fill(); }
    ctx.lineWidth = layer === 0 ? 1.3 : 0.65;
    ctx.strokeStyle = `rgba(${color},${layer === 0 ? 0.8 : 0.15})`; ctx.stroke();
  }
  for (let n = 0; n < 14; n++) {
    const a = n * 2.4 + variant;
    const radius = r * (0.12 + (n % 5) * 0.13);
    const px = Math.cos(a + time * 0.013) * radius, py = Math.sin(a + time * 0.013) * radius * 0.8;
    ctx.beginPath(); ctx.ellipse(px, py, r * 0.045, r * 0.017, a, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color},.3)`; ctx.lineWidth = 0.8; ctx.stroke();
  }
  ctx.restore();
}

function life(ctx, w, h, p, pointer, time) {
  ctx.fillStyle = '#020908'; ctx.fillRect(0, 0, w, h);
  const fade = 1 - ease(0.73, 1, p) * 0.85;
  const mobile = w < 700;
  const x = w * (mobile ? 0.58 : 0.7) + pointer.x * 5;
  const y = h * (mobile ? 0.63 : 0.5) + pointer.y * 4;
  const r = Math.min(w * (mobile ? 0.27 : 0.17), h * 0.24);
  const division = ease(0.08, 0.5, p);
  glow(ctx, x, y, Math.max(w, h) * 0.65, `rgba(22,97,87,${0.18 * fade})`);
  membrane(ctx, x - division * r * 0.88, y - division * r * 0.2, r * (1 - division * 0.28), time, 0, fade);
  if (division > 0) membrane(ctx, x + division * r * 0.88, y + division * r * 0.33, r * (0.5 + division * 0.12), time, 1, division * fade);
  const offspring = ease(0.35, 0.65, p);
  if (offspring > 0) {
    membrane(ctx, x - r * 0.3, y + r * 1.6, r * 0.24, time, 2, offspring * fade);
    membrane(ctx, x + r * 1.4, y - r * 1.05, r * 0.32, time, 2.5, offspring * (1 - ease(0.64, 0.83, p)) * fade);
  }
  ctx.fillStyle = `rgba(0,0,0,${ease(0.8, 1, p)})`; ctx.fillRect(0, 0, w, h);
}

function acceleration(ctx, w, h, p, time) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
  const structure = ease(0, 0.4, p);
  const language = ease(0.15, 0.65, p);
  const saturation = ease(0.4, 1, p);
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
  const fragments = ['A C G T  →  A G C T', '∑  [ ]  ≠  { }', '0101  →  1010  →  0110', '{  [  ]  }  ∑  →'];
  const rows = 3 + Math.floor(saturation * 16);
  for (let row = 0; row < rows; row++) {
    const size = 11 + (row % 4) * 5;
    const travel = time * (12 + saturation * 140) * (row % 2 ? 1 : -1);
    const fragment = fragments[row % fragments.length];
    ctx.font = size + 'px ui-monospace, monospace';
    const span = ctx.measureText(fragment).width + 80;
    const offset = ((travel + row * 117) % span + span) % span;
    ctx.save();
    ctx.translate(0, h * (0.12 + row / rows * 0.82));
    ctx.rotate((row % 3 - 1) * 0.018 * saturation);
    ctx.fillStyle = 'rgba(227,215,191,' + (language * (0.09 + (row % 3) * 0.04)) + ')';
    for (let x = offset - span; x < w; x += span) ctx.fillText(fragment, x, 0);
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
    const stars = createStars();
    let frame = 0, visible = false, last = 0, time = 0;
    let width = 0, height = 0, dpr = 1;
    const pointer = { x: 0, y: 0 };
    const draw = timestamp => {
      frame = 0;
      if (!visible || document.hidden) return;
      if (!reduced && kind !== 'cosmos' && timestamp - last < 33) { frame = requestAnimationFrame(draw); return; }
      if (last) time += Math.min(timestamp - last, 80) / 1000;
      last = timestamp;
      const rect = scene.getBoundingClientRect();
      const p = clamp(-rect.top / Math.max(1, rect.height - height));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (kind === 'cosmos') cosmos(ctx, width, height, p, reduced ? { x: 0, y: 0 } : pointer, stars);
      if (kind === 'life') life(ctx, width, height, p, reduced ? { x: 0, y: 0 } : pointer, reduced ? 0 : time);
      if (kind === 'acceleration') acceleration(ctx, width, height, p, reduced ? 0 : time);
      if (!reduced && kind !== 'cosmos') frame = requestAnimationFrame(draw);
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
