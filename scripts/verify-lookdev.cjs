// Small review-gallery check; uses the existing external Playwright audit runtime.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const base = process.argv[2] || 'http://127.0.0.1:4173/';
const out = path.resolve('.audit/phase2a3');
const errors = [], checks = [];
const record = text => { checks.push(text); console.log(text); };
function watch(page) {
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (['warning','error'].includes(m.type())) errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
}
async function imageReady(page) {
  await page.waitForFunction(() => { const i=document.querySelector('.ld-hero img'); return i?.complete && i.naturalWidth>0; });
}
(async () => {
  await fs.mkdir(out,{recursive:true});
  const server = await chromium.launchServer({channel:'chrome',headless:true});
  const browser = await chromium.connect(server.wsEndpoint());
  try {
    for (const query of ['', '?study=lookdev']) {
      const p=await browser.newPage();watch(p);
      await p.goto(new URL(query,base).href,{waitUntil:'networkidle'});
      assert.equal(await p.locator('#timeline').count(),1);
      assert.equal(await p.evaluate(()=>performance.getEntriesByType('resource').some(r=>/phase2a3|Lookdev/.test(r.name))),false);
      await p.close();
    }
    record('Original route and study without prototype: original app, no lookdev requests');
    const master=await browser.newPage({reducedMotion:'reduce'});watch(master);
    await master.goto(new URL('?prototype=phase2a',base).href,{waitUntil:'networkidle'});
    assert.equal(await master.locator('.ms-frame').getAttribute('data-quality'),'reduced');
    await master.getByRole('button',{name:'Siguiente plano',exact:true}).click();
    assert.equal(await master.locator('.ms-frame').getAttribute('data-time'),'6.80');
    assert.equal(await master.evaluate(()=>performance.getEntriesByType('resource').some(r=>/phase2a3|Lookdev/.test(r.name))),false);
    await master.close();record('Existing 2A.2 reduced-motion/manual navigation preserved, no lookdev requests');
    for (const width of [320,390,768,1440,1920]) {
      const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});watch(p);
      await p.goto(new URL('?prototype=phase2a&study=lookdev',base).href,{waitUntil:'networkidle'});
      await imageReady(p);
      const requested=await p.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/phase2a3\/.*webp/.test(r.name)).map(r=>r.name));
      assert.equal(requested.length,1,'Only the selected hero should load initially');
      assert.ok(requested[0].endsWith(`frame-03-${width<700?'mobile':'desktop'}.webp`));
      assert.equal(await p.locator('canvas,video').count(),0);
      assert.equal(await p.evaluate(()=>performance.getEntriesByType('resource').some(r=>/MasterShot|masterRenderer|phase2a2/.test(r.name))),false);
      for (let i=0;i<8;i++) {
        await p.locator('.ld-frames button').nth(i).click();await imageReady(p);
        assert.equal(await p.locator('.ld-frames button').nth(i).getAttribute('aria-pressed'),'true');
        const issues=await p.evaluate(()=>Array.from(document.querySelectorAll('.ld-frames button,.ld-toolbar button,.ld-toolbar a,.ld-hero img')).filter(el=>{const r=el.getBoundingClientRect();return r.left < -1 || r.right > innerWidth+1;}).map(el=>el.textContent||el.tagName));
        assert.deepEqual(issues,[]);
        if ([2,3,6].includes(i)) await p.screenshot({path:path.join(out,`${width}-frame-${i+1}.png`),fullPage:true});
      }
      await p.locator('.ld-frames button').nth(2).click();await imageReady(p);
      await p.getByRole('button',{name:'Vertical',exact:true}).click();await imageReady(p);
      assert.equal(await p.locator('.ld-hero img').evaluate(i=>i.naturalWidth),810);
      await p.getByRole('button',{name:'Escritorio',exact:true}).click();await imageReady(p);
      assert.equal(await p.locator('.ld-hero img').evaluate(i=>i.naturalWidth),1440);
      await p.locator('.ld-frames button').nth(2).focus();await p.keyboard.press('ArrowRight');
      assert.equal(await p.locator('.ld-frames button').nth(3).evaluate(el=>el===document.activeElement),true);
      await p.keyboard.press('ArrowLeft');await imageReady(p);
      await p.getByRole('button',{name:'Revisar continuidad 03 → 04',exact:true}).click();
      await p.locator('#ld-adjacent').scrollIntoViewIfNeeded();
      await p.waitForFunction(()=>document.querySelector('#ld-adjacent img')?.naturalWidth===1440);
      await p.getByRole('button',{name:'Comparar con el Master Shot 2A.2',exact:true}).click();
      await p.locator('#ld-before').scrollIntoViewIfNeeded();
      await p.waitForFunction(()=>document.querySelector('#ld-before img')?.naturalWidth===1440);
      await p.close();record(`${width}px: eight selections, bounds, portrait camera assets, keyboard and lazy comparisons`);
    }
    assert.deepEqual(errors,[]);
    await fs.writeFile(path.join(out,'report.json'),JSON.stringify({checkedAt:new Date().toISOString(),base,browser:browser.version(),checks,errors},null,2));
    record('Console, page errors and HTTP errors: none');
  } finally {
    // Close only this script's browser; some Windows GPU drivers hang on graceful close.
    if(process.platform==='win32')execFileSync('taskkill',['/PID',String(server.process().pid),'/T','/F'],{windowsHide:true,stdio:'pipe'});
    else await server.kill();
  }
})().then(()=>process.exit(0),e=>{console.error(e);process.exit(1);});
