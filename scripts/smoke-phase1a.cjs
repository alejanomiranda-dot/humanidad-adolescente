// Run with Playwright supplied by an external tooling runtime, not an app dependency.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const output = path.resolve('.audit', 'checkpoint');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  const checks = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); });
  try {
    await page.goto(process.argv[2] || 'http://127.0.0.1:4173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('head').count(), 1);
    assert.equal(await page.locator('head meta[property="og:title"]').count(), 1);
    assert.equal(await page.locator('section .animate-fade-in-up').first().evaluate(el => getComputedStyle(el).opacity), '1');
    assert.equal(await page.getByRole('button', { name: 'Toggle sound' }).count(), 0);
    checks.push('Single head, social metadata, visible hero avatar, no sound control');
    await page.screenshot({ path: path.join(output, '1440-hero.png') });

    await page.getByRole('button', { name: 'Explorar la línea de tiempo', exact: true }).click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'timeline');
    assert.equal(await page.locator('#timeline [role="group"][id^="stage-"]:not([hidden])').count(), 1);
    await page.getByRole('button', { name: 'Etapa siguiente', exact: true }).click();
    assert.equal(await page.locator('#stage-2').isVisible(), true);
    await page.locator('#timeline').press('ArrowLeft');
    assert.equal(await page.locator('#stage-1').isVisible(), true);
    await page.locator('#stage-1').getByRole('button', { name: 'Riesgos', exact: true }).focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => !!document.activeElement.closest('[hidden]')), false);
    checks.push('Timeline navigation, scoped keyboard, inactive stages hidden, no focus in hidden stages');

    const future = page.locator('section').nth(2);
    await future.getByRole('button', { name: 'Heridas', exact: true }).first().click();
    assert.equal(await future.getByText('Duelo colectivo por especies y culturas que ya se perdieron', { exact: true }).isVisible(), true);
    for (let i = 0; i < 5; i++) await page.locator('#quiz').getByRole('button').nth(2).click();
    assert.equal(await page.getByRole('heading', { name: 'Eres: Adultez emergente' }).isVisible(), true);
    await page.getByRole('button', { name: 'Compartir resultado', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#stage-1').isVisible(), true);
    checks.push('Futures tabs, complete quiz result, arrows outside timeline do not change stage');

    await page.getByRole('button', { name: 'Compartir resultado', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Compartir resultado' });
    assert.equal(await dialog.isVisible(), true);
    assert.match(await dialog.getByRole('textbox').inputValue(), /Adultez emergente/);
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => !!document.activeElement.closest('dialog')), true);
    }
    await page.evaluate(() => { window.__shareCalls = []; window.open = (...args) => { window.__shareCalls.push(args); return null; }; });
    await dialog.getByRole('button', { name: '𝕏 (Twitter)', exact: true }).click();
    let calls = await page.evaluate(() => window.__shareCalls);
    assert.match(decodeURIComponent(calls.at(-1)[0]), /Adultez emergente/);
    await dialog.getByRole('button', { name: 'WhatsApp', exact: true }).click();
    calls = await page.evaluate(() => window.__shareCalls);
    assert.match(decodeURIComponent(calls.at(-1)[0]), /Adultez emergente/);
    await page.screenshot({ path: path.join(output, '1440-share-dialog.png') });
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(), false);
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Compartir resultado');
    await page.getByRole('button', { name: '𝕏 X (ex Twitter)', exact: true }).click();
    calls = await page.evaluate(() => window.__shareCalls);
    assert.match(calls.at(-1)[0], /^https:\/\/twitter.com\/intent\/tweet\?/);
    assert.match(calls.at(-1)[2], /noopener/);
    await page.getByRole('button', { name: 'Volver a hacer el quiz', exact: true }).click();
    assert.equal(await page.getByRole('heading', { name: '¿Cómo reaccionas cuando alguien te contradice?' }).isVisible(), true);
    checks.push('Modal focus trap, Escape and focus restore; result URLs and footer X validated without sending; quiz reset');

    await page.setViewportSize({ width: 320, height: 740 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    const bounds = await page.locator('.hero-title').evaluateAll(elements => elements.map(el => ({ left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right })));
    assert.ok(bounds.every(b => b.left >= 0 && b.right <= 320));
    assert.equal(await page.locator('section .animate-fade-in-up').first().evaluate(el => getComputedStyle(el).opacity), '1');
    assert.equal(await page.getByRole('button', { name: 'Reproducir automático' }).isDisabled(), true);
    await page.screenshot({ path: path.join(output, '320-hero.png') });
    checks.push('320px title bounds, reduced motion preserves avatar and disables autoplay');
    assert.deepEqual(errors, []);
    checks.push('No captured console warnings/errors or uncaught runtime errors');
    await fs.writeFile(path.join(output, 'smoke.json'), JSON.stringify({ checkedAt: new Date().toISOString(), checks, errors }, null, 2));
    console.log(JSON.stringify({ passed: checks.length, checks, errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
