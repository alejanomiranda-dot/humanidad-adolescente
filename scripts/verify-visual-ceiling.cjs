// External Playwright runtime only; no browser dependency in the product.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { gzipSync } = require('node:zlib');
const base = process.argv[2] || 'http://127.0.0.1:4173/';
const url = new URL(base); url.searchParams.set('prototype', 'phase2a');
const output = path.resolve('.audit/visual-ceiling');
const sizes = [[320,740],[390,844],[768,1024],[1440,900],[1920,1080]];
const errors = [], measurements = [], checks = [];
const states = [['opening','existence',0],['descent','existence',0.84],['horizon','existence',0.9],['membrane','life',0],['constriction','life',0.33],['division','life',0.56]];
function watch(page) {
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (['error','warning'].includes(m.type())) errors.push(m.text()); });
}
async function seek(page,scene,progress) {
  await page.locator(`[data-scene="${scene}"]`).evaluate((el,p) => scrollTo({top:scrollY+el.getBoundingClientRect().top+p*(el.offsetHeight-(el.dataset.scene==='life'?innerHeight:0)),behavior:'instant'}), progress);
  await page.waitForTimeout(180);
}
async function instrument(page) {
  await page.addInitScript(() => {
    window.gpuFrames = []; window.gpuTimes = []; window.gpuDeleted = 0;
    const contexts = new WeakMap();
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function(...args) {
      window.gpuFrames.push(performance.now());
      if(!contexts.has(this))contexts.set(this,{ext:this.getExtension('EXT_disjoint_timer_query'),pending:[]});
      const state=contexts.get(this),ext=state.ext;
      if(!ext)return draw.apply(this,args);
      state.pending=state.pending.filter(query=>{
        if(!ext.getQueryObjectEXT(query,ext.QUERY_RESULT_AVAILABLE_EXT))return true;
        if(!this.getParameter(ext.GPU_DISJOINT_EXT))window.gpuTimes.push(ext.getQueryObjectEXT(query,ext.QUERY_RESULT_EXT)/1e6);
        ext.deleteQueryEXT(query);return false;
      });
      if(state.pending.length>=4)return draw.apply(this,args);
      const query=ext.createQueryEXT();ext.beginQueryEXT(ext.TIME_ELAPSED_EXT,query);
      const result=draw.apply(this,args);ext.endQueryEXT(ext.TIME_ELAPSED_EXT);state.pending.push(query);return result;
    };
    const remove = WebGLRenderingContext.prototype.deleteProgram;
    WebGLRenderingContext.prototype.deleteProgram = function(...args) { window.gpuDeleted++; return remove.apply(this,args); };
  });
}
(async()=>{
  await fs.mkdir(output,{recursive:true});
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    for(const [width,height] of sizes) {
      const page=await browser.newPage({viewport:{width,height}}); watch(page); await instrument(page);
      await page.goto(url.href,{waitUntil:'networkidle'});
      await page.waitForFunction(()=>document.querySelector('[data-renderer="webgl"]')?.dataset.view==='existence');
      for(const [name,scene,progress] of states) {
        await seek(page,scene,progress);
        await page.screenshot({path:path.join(output,`${width}-${name}.png`)});
      }
      await seek(page,'life',0.33);
      const client=await page.context().newCDPSession(page);
      await client.send('Performance.enable');
      const first=await client.send('Performance.getMetrics');
      await page.evaluate(()=>{window.gpuFrames=[];window.gpuTimes=[];});
      await page.waitForTimeout(1800);
      const second=await client.send('Performance.getMetrics');
      const metric=(data,name)=>data.metrics.find(x=>x.name===name)?.value || 0;
      const graphics=await page.evaluate(()=>{
        const c=document.querySelector('[data-renderer]'),g=c.getContext('webgl');
        const ext=g.getExtension('WEBGL_debug_renderer_info');
        const times=window.gpuFrames, gaps=times.slice(1).map((t,i)=>t-times[i]).sort((a,b)=>a-b);
        const gpu=window.gpuTimes.slice().sort((a,b)=>a-b);
        return {quality:c.dataset.quality,buffer:[c.width,c.height],frames:times.length,frameGapMedian:gaps[Math.floor(gaps.length/2)],frameGapP95:gaps[Math.floor(gaps.length*.95)],gpuMedianMs:gpu[Math.floor(gpu.length/2)],gpuP95Ms:gpu[Math.floor(gpu.length*.95)],gpuSamples:gpu.length,renderer:ext?g.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,timerQuery:!!g.getExtension('EXT_disjoint_timer_query'),glError:g.getError(),resources:performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,bytes:r.encodedBodySize,duration:r.duration})),loadEvent:performance.getEntriesByType('navigation')[0].loadEventEnd};
      });
      assert.equal(graphics.glError,0);
      measurements.push({width,height,...graphics,cpuTaskMs:1000*(metric(second,'TaskDuration')-metric(first,'TaskDuration')),sampleMs:1800});
      await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
      const hidden=await page.evaluate(()=>gpuFrames.length); await page.waitForTimeout(150);
      assert.equal(await page.evaluate(()=>gpuFrames.length),hidden);
      await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
      await page.locator('#p2-astra-copy').evaluate(el=>el.scrollIntoView({behavior:'instant'})); await page.waitForTimeout(150);
      const off=await page.evaluate(()=>gpuFrames.length); await page.waitForTimeout(150);
      assert.equal(await page.evaluate(()=>gpuFrames.length),off);
      await page.locator('#p2-arrival').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top+(el.offsetHeight-innerHeight)*.35,behavior:'instant'}));
      await page.waitForFunction(()=>document.querySelector('#p2-arrival').dataset.phase==='2');
      await page.screenshot({path:path.join(output,`${width}-hello.png`)});
      await page.emulateMedia({reducedMotion:'reduce'}); await page.waitForTimeout(150);
      assert.equal(await page.locator('[data-renderer="webgl"]').count(),0);
      assert.ok(await page.evaluate(()=>gpuDeleted>0));
      await seek(page,'life',.33);
      await page.screenshot({path:path.join(output,`${width}-reduced.png`)});
      await client.detach();
      await page.close();
    }
    checks.push('5 widths: WebGL visual states, high/medium, GPU errors, timings, hidden/offscreen pause, fast-scroll Hola, live reduced-motion disposal');
    const fallback=await browser.newPage(); watch(fallback);
    await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:get.call(this,type,...args)};});
    await fallback.goto(url.href,{waitUntil:'networkidle'});
    await fallback.waitForFunction(()=>!document.querySelector('[data-renderer]'));
    await seek(fallback,'life',.33);
    assert.ok(await fallback.locator('[data-scene="origins"] canvas').evaluate(el=>el.getContext('2d')!==null));
    await fallback.screenshot({path:path.join(output,'webgl-unavailable.png')}); await fallback.close();
    const loss=await browser.newPage(); watch(loss); await instrument(loss);
    await loss.goto(url.href,{waitUntil:'networkidle'});
    await loss.waitForFunction(()=>document.querySelector('[data-renderer]')?.dataset.view);
    await loss.evaluate(()=>document.querySelector('[data-renderer]').getContext('webgl').getExtension('WEBGL_lose_context').loseContext());
    await loss.waitForFunction(()=>!document.querySelector('[data-renderer]'));
    assert.ok(await loss.evaluate(()=>gpuDeleted>0)); await loss.close();
    checks.push('Unavailable WebGL and real context loss select Canvas fallback without losing the narrative');
    const reduced=await browser.newPage({reducedMotion:'reduce'}); watch(reduced);
    await reduced.goto(url.href,{waitUntil:'networkidle'});
    assert.equal(await reduced.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('originsRenderer'))),false);
    await seek(reduced,'existence',1); const a=await reduced.locator('[data-scene="origins"] canvas').evaluate(el=>el.toDataURL());
    await seek(reduced,'life',0); const b=await reduced.locator('[data-scene="origins"] canvas').evaluate(el=>el.toDataURL());
    assert.equal(a,b); await reduced.close();
    checks.push('Reduced-motion does not fetch WebGL; shared Canvas has identical frames at the Existence/Life boundary');
    const assets=[];
    for(const name of await fs.readdir('dist/assets')){const data=await fs.readFile(path.join('dist/assets',name));assets.push({name,bytes:data.length,gzip:gzipSync(data).length});}
    assert.deepEqual(errors,[]);
    await fs.writeFile(path.join(output,'report.json'),JSON.stringify({checkedAt:new Date().toISOString(),browser:browser.version(),checks,errors,measurements,assets},null,2));
    console.log(JSON.stringify({checks,errors,performance:measurements.map(({width,quality,frames,frameGapMedian,frameGapP95,cpuTaskMs,timerQuery})=>({width,quality,frames,frameGapMedian,frameGapP95,cpuTaskMs,timerQuery})),assets},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
