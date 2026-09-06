// Browser-only verification using the same external Playwright runtime as smoke-phase1a.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const url = process.argv[2] || 'http://127.0.0.1:4173';
const output = path.resolve('.audit', 'verification');
const sizes = [[320, 740], [390, 844], [768, 1024], [1440, 900], [1920, 1080]];
const tabs = ['Logros', 'Heridas', 'Riesgos'];
const checks = [], layouts = [], errors = [];

function watch(page) {
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); });
}

// Inspect text rectangles against clipping ancestors, not only document scrollWidth.
async function inspect(page, state) {
  const issues = await page.evaluate(() => {
    const modal = document.querySelector('dialog[open]');
    const visible = el => {
      if (modal && !modal.contains(el)) return false;
      for (let n = el; n; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (n.hidden || n.classList.contains('sr-only') || s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
      }
      return true;
    };
    const issues = [];
    for (const el of document.querySelectorAll('h1,h2,h3,p,li,button,label,#timeline .whitespace-nowrap')) {
      if (!visible(el)) continue;
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = [...range.getClientRects()].filter(r => r.width && r.height);
      if (rects.some(r => r.left < -1 || r.right > innerWidth + 1)) issues.push({ type: 'viewport', text: el.textContent.trim() });
      for (let parent = el.parentElement; parent; parent = parent.parentElement) {
        const s = getComputedStyle(parent), b = parent.getBoundingClientRect();
        const x = ['hidden', 'clip'].includes(s.overflowX), y = ['hidden', 'clip'].includes(s.overflowY);
        if (rects.some(r => (x && (r.left < b.left - 2 || r.right > b.right + 2)) || (y && (r.top < b.top - 2 || r.bottom > b.bottom + 2)))) {
          issues.push({ type: 'ancestor-clipping', text: el.textContent.trim(), ancestor: parent.id || parent.className });
          break;
        }
        if (parent === modal) break; // Top-layer dialog is not clipped by the locked body.
      }
    }
    const buttons = [...document.querySelectorAll('button')].filter(visible);
    for (let i = 0; i < buttons.length; i++) for (let j = i + 1; j < buttons.length; j++) {
      const a = buttons[i].getBoundingClientRect(), b = buttons[j].getBoundingClientRect();
      if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2) issues.push({ type: 'button-overlap', text: [buttons[i].textContent.trim(), buttons[j].textContent.trim()] });
    }
    return issues;
  });
  layouts.push({ width: page.viewportSize().width, state, issues });
}

async function quiz(page, option) {
  for (let q = 0; q < 5; q++) {
    const answer = page.locator('#quiz').getByRole('button').nth(option);
    if (option === 0) {
      await answer.focus();
      await page.keyboard.press('Enter');
    } else await answer.click();
  }
}

(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    // Every stage/perspective, future perspective, question, result and dialog at all five widths.
    for (const [width, height] of (process.argv.includes('--functional') ? [] : sizes)) {
      const page = await browser.newPage({ viewport: { width, height } });
      watch(page);
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await inspect(page, 'initial');
      for (let stage = 1; stage <= 6; stage++) {
        await page.getByRole('group', { name: 'Elegir etapa', exact: true }).getByRole('button').nth(stage - 1).click();
        const active = page.locator(`#stage-${stage}`);
        assert.equal(await page.locator('#timeline [id^="stage-"][role="group"]:visible').count(), 1);
        for (const tab of tabs) {
          await active.getByRole('button', { name: tab, exact: true }).click();
          await page.waitForTimeout(450);
          await inspect(page, `stage-${stage}-${tab}`);
          await active.screenshot({ path: path.join(output, `${width}-stage-${stage}-${tab}.png`) });
        }
      }
      const future = page.locator('section').nth(2);
      for (const tab of tabs) {
        for (const button of await future.getByRole('button', { name: tab, exact: true }).all()) await button.click();
        await inspect(page, `futures-${tab}`);
        await future.screenshot({ path: path.join(output, `${width}-futures-${tab}.png`) });
      }
      for (let q = 0; q < 5; q++) {
        await page.locator('#quiz').scrollIntoViewIfNeeded();
        await inspect(page, `question-${q + 1}`);
        await page.locator('#quiz').screenshot({ path: path.join(output, `${width}-question-${q + 1}.png`) });
        await page.locator('#quiz').getByRole('button').nth(2).click();
      }
      assert.equal(await page.getByRole('heading', { name: 'Eres: Adultez emergente' }).isVisible(), true);
      await inspect(page, 'result');
      await page.locator('#quiz').screenshot({ path: path.join(output, `${width}-result.png`) });
      await page.getByRole('button', { name: 'Compartir resultado', exact: true }).click();
      assert.equal(await page.getByRole('textbox').evaluate(el => el.scrollTop), 0);
      await inspect(page, 'dialog');
      await page.screenshot({ path: path.join(output, `${width}-dialog.png`) });
      const dialog = page.getByRole('dialog');
      // All modal controls can be scrolled into view; both tab directions stay inside.
      for (const key of ['Tab', 'Shift+Tab']) for (let n = 0; n < 12; n++) {
        await page.keyboard.press(key);
        assert.equal(await page.evaluate(() => !!document.activeElement.closest('dialog')), true);
      }
      await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click();
      assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Compartir resultado');
      await page.getByRole('button', { name: 'Compartir resultado', exact: true }).click();
      await page.mouse.click(2, 2);
      assert.equal(await dialog.isVisible(), false);
      await page.getByRole('button', { name: 'Compartir resultado', exact: true }).click();
      await page.keyboard.press('Escape');
      assert.equal(await dialog.isVisible(), false);
      await page.close();
      checks.push(`${width}px: 18 timeline states, 3 future states, 5 questions, result, dialog and both focus-trap directions`);
      await fs.writeFile(path.join(output, 'matrix.json'), JSON.stringify({ url, checks, layouts, errors }, null, 2));
      console.log(`Matrix ${width}px complete`);
    }

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    watch(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    // Keyboard-only route from hero through all sections, then activate each timeline stage.
    await page.keyboard.press('Tab');
    assert.match(await page.evaluate(() => document.activeElement.textContent), /Explorar/);
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'timeline');
    for (let i = 2; i <= 6; i++) {
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator(`#stage-${i}`).isVisible(), true);
    }
    for (let i = 5; i >= 1; i--) await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Control+ArrowRight');
    assert.equal(await page.locator('#stage-1').isVisible(), true);
    const visited = new Set();
    for (let n = 0; n < 55; n++) {
      await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => {
        const el = document.activeElement, s = getComputedStyle(el);
        return { tag: el.tagName, name: el.getAttribute('aria-label') || el.textContent.trim(), hidden: !!el.closest('[hidden]'), outline: s.outlineStyle, width: s.outlineWidth };
      });
      assert.equal(focus.hidden, false);
      if (focus.tag === 'BUTTON') {
        assert.ok(focus.name);
        assert.notEqual(focus.outline, 'none');
        assert.notEqual(focus.width, '0px');
        visited.add(focus.name);
      }
    }
    assert.ok([...visited].some(n => /Twitter/.test(n)));
    checks.push(`Keyboard route: six stages, modified arrows ignored, ${visited.size} named buttons with visible focus, no hidden-stage focus`);

    console.log('Keyboard checks complete');
    // Three complete result paths, real browser clipboard, and denied-clipboard fallback.
    for (const [option, expected] of [[0, 'Adolescencia temprana'], [1, 'Adolescencia plena'], [2, 'Adultez emergente']]) {
      await quiz(page, option);
      assert.equal(await page.getByRole('heading', { name: `Eres: ${expected}` }).isVisible(), true);
      await page.getByRole('button', { name: 'Compartir resultado', exact: true }).click();
      assert.match(await page.getByRole('dialog').getByRole('textbox').inputValue(), new RegExp(expected));
      await page.keyboard.press('Escape');
      if (option < 2) await page.getByRole('button', { name: 'Volver a hacer el quiz', exact: true }).click();
    }
    console.log('Quiz paths complete');
    await page.bringToFront();
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Compartir resultado', exact: true }).click();
    const expectedCopy = await page.getByRole('dialog').getByRole('textbox').inputValue();
    await page.getByRole('button', { name: 'Copiar resultado', exact: true }).click();
    await page.getByText('Resultado copiado. Podés pegarlo en la red que prefieras.', { exact: true }).waitFor();
    assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n'), expectedCopy);
    await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new DOMException('Denied', 'NotAllowedError'); }; });
    await page.getByRole('button', { name: 'Copiar resultado', exact: true }).click();
    await page.getByText('No se pudo copiar automáticamente. El texto quedó seleccionado para que lo copies.', { exact: true }).waitFor();
    const selected = await page.getByRole('textbox').evaluate(el => ({ focused: el === document.activeElement, start: el.selectionStart, end: el.selectionEnd, length: el.value.length }));
    assert.equal(selected.focused, true);
    assert.equal(selected.start, 0);
    assert.equal(selected.end, selected.length);
    await page.keyboard.press('Escape');
    checks.push('All three quiz results; real browser clipboard equals result + URL; denied clipboard selects complete text and announces fallback');

    console.log('Clipboard checks complete');
    // Clock controls only test time; visibilitychange below is explicitly simulated.
    await page.clock.install();
    await page.reload({ waitUntil: 'networkidle' });
    const auto = page.getByRole('button', { name: /Reproducir automático|Pausar/ });
    await auto.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await auto.click();
    assert.equal(await auto.getAttribute('aria-pressed'), 'true');
    console.log('Autoplay started');
    await page.clock.fastForward(29900);
    assert.equal(await page.locator('#stage-1').isVisible(), true);
    await page.clock.fastForward(90000);
    assert.equal(await page.locator('#stage-1').isVisible(), false);
    await page.locator('#timeline [id^="stage-"][role="group"]:visible').getByRole('button', { name: 'Heridas', exact: true }).click();
    assert.equal(await auto.getAttribute('aria-pressed'), 'false');
    await auto.click();
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForTimeout(50);
    assert.equal(await auto.getAttribute('aria-pressed'), 'false');
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForTimeout(50);
    assert.equal(await auto.getAttribute('aria-pressed'), 'false');
    await auto.click();
    await page.locator('footer').last().scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    assert.equal(await auto.getAttribute('aria-pressed'), 'false');
    await auto.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    assert.equal(await auto.getAttribute('aria-pressed'), 'false');
    await page.getByRole('group', { name: 'Elegir etapa', exact: true }).getByRole('button').nth(4).click();
    await auto.click();
    await page.clock.fastForward(180000);
    assert.equal(await page.locator('#stage-6').isVisible(), true);
    assert.equal(await auto.getAttribute('aria-pressed'), 'false');
    assert.equal(await auto.isDisabled(), true);
    await page.getByRole('group', { name: 'Elegir etapa', exact: true }).getByRole('button').first().click();
    await auto.click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(100);
    assert.equal(await auto.getAttribute('aria-pressed'), 'false');
    assert.equal(await auto.isDisabled(), true);
    const motion = await page.evaluate(() => ({ animated: [...document.querySelectorAll('*')].filter(el => getComputedStyle(el).animationName !== 'none').length, scroll: getComputedStyle(document.documentElement).scrollBehavior, avatar: getComputedStyle(document.querySelector('section .animate-fade-in-up')).opacity }));
    assert.deepEqual(motion, { animated: 0, scroll: 'auto', avatar: '1' });
    await page.getByRole('button', { name: 'Etapa siguiente', exact: true }).click();
    assert.equal(await page.locator('#stage-2').isVisible(), true);
    checks.push('Autoplay: >=30s reading, timed advance, perspective interaction, simulated document visibility, actual viewport exit, no automatic resume, last-stage stop; live reduced-motion stops autoplay and all animations');
    console.log('Autoplay checks complete');
    await page.close();

    const touch = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    watch(touch);
    await touch.goto(url, { waitUntil: 'networkidle' });
    // Synthetic TouchEvents exercise handler edge cases; physical scroll arbitration remains a device check.
    async function gesture(kind, selector = '#stage-1 p') {
      await touch.locator(selector).first().evaluate((el, kind) => {
        const point = (x, y, id = 1) => new Touch({ identifier: id, target: el, clientX: x, clientY: y });
        const a = point(kind === 'right' ? 0 : 250, 300), b = point(kind === 'right' ? 150 : 100, kind === 'vertical' ? 500 : kind === 'diagonal' ? 420 : 300);
        const fire = (type, touches, changedTouches) => el.dispatchEvent(new TouchEvent(type, { bubbles: true, touches, targetTouches: touches, changedTouches }));
        fire('touchstart', [a], [a]);
        if (kind === 'multi') fire('touchstart', [a, point(200, 300, 2)], [point(200, 300, 2)]);
        if (kind === 'cancel') fire('touchcancel', [], [a]);
        fire('touchend', [], [b]);
      }, kind);
    }
    for (const kind of ['vertical', 'diagonal', 'multi', 'cancel']) {
      await gesture(kind);
      assert.equal(await touch.locator('#stage-1').isVisible(), true);
    }
    await gesture('left', '#stage-1 button');
    assert.equal(await touch.locator('#stage-1').isVisible(), true);
    await gesture('left');
    assert.equal(await touch.locator('#stage-2').isVisible(), true);
    await gesture('right', '#stage-2 p');
    assert.equal(await touch.locator('#stage-1').isVisible(), true);
    checks.push('Touch handler: left/right including x=0, vertical/diagonal ignored, multi-touch/cancel ignored, gestures starting on controls ignored (synthetic events)');
    await touch.close();

    const report = { url, checkedAt: new Date().toISOString(), browser: browser.version(), checks, errors, layouts };
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    assert.deepEqual(errors, []);
    assert.deepEqual(layouts.filter(l => l.issues.length), []);
    console.log(JSON.stringify({ checks, layoutStates: layouts.length, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(async error => {
  await fs.writeFile(path.join(output, 'failure.json'), JSON.stringify({ message: error.stack, checks, errors, layouts }, null, 2));
  console.error(error);
  process.exitCode = 1;
});
