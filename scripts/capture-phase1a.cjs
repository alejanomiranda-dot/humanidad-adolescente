// Uses the externally available Playwright runtime; no project dependency is added.
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');

const label = process.argv[2] || 'after';
const url = process.argv[3] || 'http://127.0.0.1:4173';
const output = path.resolve('.audit', label);
const sizes = [[320, 740], [390, 844], [768, 1024], [1440, 900], [1920, 1080]];

(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  try {
    for (const [width, height] of sizes) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
      });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1100);
      await page.screenshot({ path: path.join(output, `${width}-hero.png`) });
      await page.screenshot({ path: path.join(output, `${width}-full.png`), fullPage: true });
      await page.locator('#timeline').screenshot({ path: path.join(output, `${width}-timeline.png`) });
      await page.locator('section').nth(2).screenshot({ path: path.join(output, `${width}-futures.png`) });
      await page.locator('#quiz').screenshot({ path: path.join(output, `${width}-quiz.png`) });
      const metrics = await page.evaluate(() => {
        const hidden = el => {
          for (let node = el; node; node = node.parentElement) {
            const style = getComputedStyle(node);
            if (node.hidden || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return true;
          }
          return false;
        };
        const content = [...document.querySelectorAll('h1,h2,h3,p,li,button')].filter(el => !hidden(el));
        const clipped = content.flatMap(el => {
          const rect = el.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(el);
          const textRects = [...range.getClientRects()];
          const outsideViewport = rect.left < -1 || rect.right > document.documentElement.clientWidth + 1;
          const outsideText = textRects.some(r => r.left < -1 || r.right > document.documentElement.clientWidth + 1);
          if (!outsideViewport && !outsideText && el.scrollWidth <= el.clientWidth + 1) return [];
          return [{ text: el.textContent.trim().slice(0, 90), left: rect.left, right: rect.right, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }];
        });
        return {
          width: innerWidth,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          heroAvatarOpacity: getComputedStyle(document.querySelector('section .animate-float')).opacity,
          headCount: document.querySelectorAll('head').length,
          hiddenStageButtons: document.querySelectorAll('#timeline .pointer-events-none button').length,
          clipped,
        };
      });
      results.push({ width, height, errors, ...metrics });
      await page.close();
    }
  } finally {
    await browser.close();
  }
  await fs.writeFile(path.join(output, 'metrics.json'), JSON.stringify({ url, capturedAt: new Date().toISOString(), results }, null, 2));
  console.log(JSON.stringify(results, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
