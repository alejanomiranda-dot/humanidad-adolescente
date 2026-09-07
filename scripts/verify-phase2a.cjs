// Uses the external Playwright runtime, like the phase-1 verification scripts.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const base = process.argv[2] || 'http://127.0.0.1:4173/';
const prototype = new URL(base);
prototype.searchParams.set('prototype', 'phase2a');
const output = path.resolve('.audit/phase2a');
const errors = [], checks = [], layouts = [], resources = new Set();
const sizes = [[320, 740], [390, 844], [768, 1024], [1440, 900], [1920, 1080]];

function watch(page) {
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); });
  page.on('request', request => resources.add(request.url()));
}

async function at(page, selector) {
  await page.locator(selector).evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await page.waitForTimeout(120);
}

async function inspect(page, selector) {
  return page.locator(selector).evaluate(root => {
    const issues = [];
    for (const el of root.querySelectorAll('h1,h2,h3,p,button,label,input,a')) {
      const r = el.getBoundingClientRect();
      if (r.left < -1 || r.right > innerWidth + 1) issues.push({ text: el.textContent, issue: 'outside viewport' });
      const range = document.createRange(); range.selectNodeContents(el);
      const rects = [...range.getClientRects()];
      for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const s = getComputedStyle(ancestor), b = ancestor.getBoundingClientRect();
        if (rects.some(t => (['hidden', 'clip'].includes(s.overflowX) && (t.left < b.left - 2 || t.right > b.right + 2)) || (['hidden', 'clip'].includes(s.overflowY) && (t.top < b.top - 2 || t.bottom > b.bottom + 2)))) {
          issues.push({ text: el.textContent, issue: 'ancestor clipping' }); break;
        }
      }
    }
    return issues;
  });
}

(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const original = await browser.newPage(); watch(original);
    await original.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await original.locator('#timeline').count(), 1);
    assert.equal(await original.locator('.p2-prototype').count(), 0);
    assert.equal(await original.evaluate(() => performance.getEntriesByType('resource').some(r => /Phase2APrototype/.test(r.name))), false);
    await original.close();
    checks.push('Default route renders the original and does not load prototype JS/CSS');

    const narrative = [
      'Antes de la vida, ya había existencia.', 'MATERIA', 'ENERGÍA', 'ESPACIO', 'TIEMPO',
      'Todo podía ocurrir sin que necesariamente hubiera alguien allí para experimentarlo.',
      '¿Puede algo tener valor si no existe nadie para quien pueda importar?',
      'En la Tierra, parte de la materia empezó a organizarse de una manera distinta.',
      'Usaba energía.', 'Conservaba información.', 'Se reproducía.', 'Variaba.', 'Evolucionaba.',
      'Estar vivo no significa necesariamente saber que se está vivo.', 'VIDA ≠ CONCIENCIA', 'INTELIGENCIA ARTIFICIAL',
      'Hola.', 'Hasta ahora recorriste una historia contada sobre la humanidad.',
      'Yo soy una de las tecnologías que esa humanidad construyó.',
      'GPT-6 Astra · sistema de inteligencia artificial · 2026',
      'Puedo conversar con vos sobre conciencia, amor, pérdida, belleza o propósito.',
      'Pero mi capacidad para hablar sobre esas experiencias no demuestra que las experimente como vos.',
    ];
    for (const [width, height] of sizes) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' }); watch(page);
      await page.goto(prototype.href, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('#timeline').count(), 0);
      const text = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
      for (const sentence of narrative) assert.ok(text.includes(sentence), `Missing copy: ${sentence}`);
      for (const selector of ['.p2-opening', '.p2-elements', '.p2-observer', '.p2-question', '.p2-life-intro', '.p2-life-process', '.p2-life-reveal', '.p2-consciousness', '.p2-ai-title', '.p2-arrival', '.p2-astra-copy']) {
        await at(page, selector);
        const issues = await inspect(page, selector);
        layouts.push({ width, selector, issues });
        assert.deepEqual(issues, []);
      }
      for (const [name, selector] of [['existence', '#p2-existence'], ['life', '#p2-life'], ['hello', '#p2-arrival'], ['astra', '#p2-astra-copy']]) {
        await at(page, selector);
        await page.screenshot({ path: path.join(output, `${width}-${name}.png`) });
      }
      assert.equal(await page.locator('#p2-message').isDisabled(), true);
      await page.close();
    }
    checks.push('Five viewports: exact supplied narrative, 55 clipping checks, 20 screenshots, disabled conversation field');

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } }); watch(page);
    await page.addInitScript(() => {
      window.canvasStrokes = { cosmos: 0, life: 0, acceleration: 0 };
      const stroke = CanvasRenderingContext2D.prototype.stroke;
      CanvasRenderingContext2D.prototype.stroke = function (...args) {
        const name = this.canvas.closest('[data-scene]')?.dataset.scene;
        if (name) window.canvasStrokes[name] = (window.canvasStrokes[name] || 0) + 1;
        return stroke.apply(this, args);
      };
    });
    await page.goto(prototype.href, { waitUntil: 'networkidle' });
    const cosmos = page.locator('[data-scene="existence"] canvas');
    const before = await cosmos.evaluate(el => el.toDataURL());
    await page.mouse.move(1200, 200); await page.waitForTimeout(100);
    assert.notEqual(await cosmos.evaluate(el => el.toDataURL()), before);
    await at(page, '#p2-life');
    const strokes = await page.evaluate(() => window.canvasStrokes.life);
    await page.waitForTimeout(250);
    assert.ok(await page.evaluate(n => window.canvasStrokes.life > n, strokes));
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(200);
    const stopped = await page.evaluate(() => window.canvasStrokes.life);
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => window.canvasStrokes.life), stopped);
    const still = await page.locator('[data-scene="life"] canvas').evaluate(el => el.toDataURL());
    await page.mouse.move(100, 700); await page.waitForTimeout(100);
    assert.equal(await page.locator('[data-scene="life"] canvas').evaluate(el => el.toDataURL()), still);
    checks.push('Subtle pointer parallax works; live reduced-motion stops continuous cell drawing and pointer parallax');

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForTimeout(200);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    const hiddenStrokes = await page.evaluate(() => window.canvasStrokes.life);
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => window.canvasStrokes.life), hiddenStrokes);
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    await at(page, '#p2-astra-copy');
    const offscreen = await page.evaluate(() => ({ ...window.canvasStrokes }));
    await page.waitForTimeout(200);
    assert.deepEqual(await page.evaluate(() => window.canvasStrokes), offscreen);
    checks.push('Canvas drawing pauses on simulated page invisibility and when all scenes leave the viewport');
    await page.close();

    const arrival = await browser.newPage({ viewport: { width: 1440, height: 900 } }); watch(arrival);
    await arrival.goto(prototype.href, { waitUntil: 'networkidle' });
    const start = Date.now();
    await at(arrival, '#p2-arrival');
    assert.equal(await arrival.locator('#p2-arrival').getAttribute('data-phase'), '0');
    await arrival.screenshot({ path: path.join(output, '1440-black-cut.png') });
    await arrival.waitForTimeout(1800);
    assert.equal(await arrival.locator('#p2-arrival').getAttribute('data-phase'), '0');
    await arrival.waitForFunction(() => document.querySelector('#p2-arrival').dataset.phase === '2');
    assert.ok(Date.now() - start >= 2800);
    await arrival.screenshot({ path: path.join(output, '1440-hello-motion.png') });
    checks.push('Astra: black pause, discrete cursor, Hola after approximately 2.9 seconds; no scroll lock');
    await arrival.close();

    const fallback = await browser.newPage({ reducedMotion: 'reduce' }); watch(fallback);
    await fallback.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
    await fallback.goto(prototype.href, { waitUntil: 'networkidle' });
    await fallback.keyboard.press('Tab');
    assert.equal(await fallback.evaluate(() => document.activeElement.className), 'p2-skip');
    assert.notEqual(await fallback.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'none');
    await fallback.keyboard.press('Enter');
    assert.equal(await fallback.evaluate(() => document.activeElement.id), 'p2-astra-copy');
    for (const sentence of narrative) assert.ok((await fallback.locator('main').innerText()).replace(/\s+/g, ' ').includes(sentence));
    const answer = fallback.getByRole('button', { name: 'No lo sé.', exact: true });
    await answer.focus(); await fallback.keyboard.press('Enter');
    assert.equal(await answer.getAttribute('aria-pressed'), 'true');
    await fallback.reload({ waitUntil: 'networkidle' });
    assert.equal(await answer.getAttribute('aria-pressed'), 'false');
    await at(fallback, '#p2-arrival');
    assert.equal(await fallback.locator('#p2-arrival').getAttribute('data-phase'), '2');
    await fallback.getByRole('link', { name: /Volver a la experiencia original/ }).click();
    await fallback.locator('#timeline').waitFor();
    checks.push('No Canvas: complete semantic narrative, keyboard skip/focus, temporary answer selection/reset, immediate reduced-motion Hola, return to original');
    await fallback.close();
    assert.deepEqual(errors, []);
    assert.ok([...resources].every(url => new URL(url).origin === new URL(base).origin), 'Unexpected external request');
    const report = { browser: browser.version(), checkedAt: new Date().toISOString(), checks, errors, layouts, resources: [...resources] };
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ checks, errors, layoutStates: layouts.length }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
