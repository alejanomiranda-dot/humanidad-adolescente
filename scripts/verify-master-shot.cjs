// Run against the built preview; Playwright is supplied by the external audit runtime.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const base=process.argv.slice(2).find(arg=>!arg.startsWith('--'))||'http://127.0.0.1:4173/';
const functionalOnly=process.argv.includes('--functional');
const url=new URL('?prototype=phase2a',base).href;
const out=path.resolve('.audit/phase2a2');
const sizes=[[320,740],[390,844],[768,1024],[1440,900],[1920,1080]];
const errors=[],checks=[],measurements=[];
function passed(message){checks.push(message);console.log(message);}
const states=[['cosmos',0],['approach',4.6],['horizon',6.9],['water',8.7],['membrane',10],['division-start',11],['neck',12.5],['separation',13.8],['division',15.5],['information',18],['saturation',20.5],['ai',21.8],['black',23.5],['cursor',24.7],['hello',26]];
function watch(p){p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});}
async function seek(p,time){
  await p.locator('input[type=range]').evaluate((el,t)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(t));el.dispatchEvent(new Event('input',{bubbles:true}));},time);
  await p.waitForFunction(t=>Math.abs(Number(document.querySelector('.ms-frame').dataset.time)-t)<.15,time);
  await p.waitForTimeout(180);
}
async function layout(p){return p.evaluate(()=>{
  const issues=[];
  for(const el of document.querySelectorAll('.ms-frame h1,.ms-frame h2,.ms-caption,.ms-edition,.ms-controls')){
    const r=el.getBoundingClientRect(),s=getComputedStyle(el);
    if(s.visibility==='hidden'||s.display==='none'||Number(s.opacity)===0)continue;
    if(r.left<-1||r.right>innerWidth+1||r.top<-1||r.bottom>innerHeight+1)issues.push(el.className);
  }
  return issues;
});}
(async()=>{
  await fs.mkdir(out,{recursive:true});const b=await chromium.launch({channel:'chrome',headless:true});
  try{
    const original=await b.newPage();watch(original);await original.goto(base,{waitUntil:'networkidle'});
    assert.equal(await original.locator('#timeline').count(),1);
    assert.equal(await original.evaluate(()=>performance.getEntriesByType('resource').some(r=>/MasterShot|masterRenderer|phase2a2/.test(r.name))),false);await original.close();
    passed('Original route intact, no Master Shot assets requested');
    if(!functionalOnly)for(const [width,height] of sizes){
      const p=await b.newPage({viewport:{width,height}});watch(p);
      await p.addInitScript(()=>{window.draws=0;const draw=WebGLRenderingContext.prototype.drawArrays;WebGLRenderingContext.prototype.drawArrays=function(...args){window.draws++;window.firstDraw??=performance.now();return draw.apply(this,args)};});
      await p.goto(url,{waitUntil:'networkidle'});await p.waitForFunction(()=>window.draws>0);
      assert.equal(await p.evaluate(()=>performance.getEntriesByType('resource').some(r=>/\.(webm|mp4)$/.test(r.name))),false);
      for(const [name,t] of states){await seek(p,t);if(t>=10&&t<16){await p.waitForFunction(()=>{const v=document.querySelector('video');return v.readyState>=2&&!v.seeking});await p.waitForTimeout(100);}assert.deepEqual(await layout(p),[]);await p.screenshot({path:path.join(out,`${width}-${name}.png`)});}
      const memory=await p.evaluate(()=>({heap:performance.memory?.usedJSHeapSize,firstDraw:window.firstDraw,quality:document.querySelector('.ms-frame').dataset.quality,video:document.querySelector('video').currentSrc,resources:performance.getEntriesByType('resource').map(r=>({url:r.name,encoded:r.encodedBodySize,transfer:r.transferSize,duration:r.duration}))}));
      measurements.push({width,height,...memory});
      await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(200);assert.equal(await p.locator('.ms-frame').getAttribute('data-quality'),'reduced');
      await p.reload({waitUntil:'networkidle'});assert.equal(await p.evaluate(()=>performance.getEntriesByType('resource').some(r=>/masterRenderer|\.(webm|mp4)$/.test(r.name))),false);
      for(const [name,t] of [['membrane',10],['division',16],['hello',26]]){await seek(p,t);await p.screenshot({path:path.join(out,`${width}-reduced-${name}.png`)});}
      await p.close();
    }
    if(!functionalOnly)passed('Five widths, 75 states + 15 reduced screenshots, viewport bounds, deferred media, initial/live reduced motion');
    const recordContext=await b.newContext({viewport:{width:1440,height:900},recordVideo:{dir:out,size:{width:1440,height:900}}});
    const playback=await recordContext.newPage();watch(playback);
    await playback.goto(url,{waitUntil:'networkidle'});const start=Date.now();await playback.getByRole('button',{name:'Recorrer · 26 s',exact:true}).click();
    await playback.waitForFunction(()=>Number(document.querySelector('.ms-frame').dataset.time)>=10,{},{timeout:20000});
    const client=await playback.context().newCDPSession(playback);await client.send('Performance.enable');const before=await client.send('Performance.getMetrics');
    const videoBefore=await playback.evaluate(()=>document.querySelector('video').getVideoPlaybackQuality().totalVideoFrames);
    await playback.waitForTimeout(1200);const after=await client.send('Performance.getMetrics');
    const playbackStats=await playback.evaluate(()=>{const v=document.querySelector('video'),q=v.getVideoPlaybackQuality();return {time:Number(document.querySelector('.ms-frame').dataset.time),videoTime:v.currentTime,videoDuration:v.duration,decoded:q.totalVideoFrames,dropped:q.droppedVideoFrames,readyState:v.readyState,paused:v.paused};});
    assert.equal(playbackStats.paused,false);assert.ok(playbackStats.decoded>videoBefore);assert.ok(Math.abs(playbackStats.videoTime-(playbackStats.time-9)/7*playbackStats.videoDuration)<.35);
    const value=(metrics,n)=>metrics.metrics.find(m=>m.name===n)?.value||0;
    measurements.push({playback:playbackStats,cpuTaskMs:(value(after,'TaskDuration')-value(before,'TaskDuration'))*1000,sampleMs:1200,decodedDuringSample:playbackStats.decoded-videoBefore});await client.detach();
    await playback.waitForFunction(()=>Number(document.querySelector('.ms-frame').dataset.time)>=26,{},{timeout:25000});assert.ok(Date.now()-start>=25000&&Date.now()-start<32000);
    const recording=playback.video();await recordContext.close();await recording.saveAs(path.join(out,'master-shot-desktop.webm'));
    passed('Full 26-second playback, actual video decode, bounded sync, end at Hola; screen recording');
    const lifecycle=await b.newPage({viewport:{width:390,height:844}});watch(lifecycle);await lifecycle.goto(url,{waitUntil:'networkidle'});
    await lifecycle.getByRole('button',{name:'Recorrer · 26 s',exact:true}).click();await lifecycle.waitForTimeout(250);
    await lifecycle.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await lifecycle.waitForTimeout(100);
    const hidden=await lifecycle.locator('.ms-frame').getAttribute('data-time');await lifecycle.waitForTimeout(200);assert.equal(await lifecycle.locator('.ms-frame').getAttribute('data-time'),hidden);
    await lifecycle.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await lifecycle.waitForTimeout(200);assert.notEqual(await lifecycle.locator('.ms-frame').getAttribute('data-time'),hidden);
    await lifecycle.locator('#ms-transcript').evaluate(el=>{el.querySelector('details').open=true;el.scrollIntoView({behavior:'instant'});});await lifecycle.waitForTimeout(200);const off=await lifecycle.locator('.ms-frame').getAttribute('data-time');await lifecycle.waitForTimeout(200);assert.equal(await lifecycle.locator('.ms-frame').getAttribute('data-time'),off);
    await lifecycle.evaluate(()=>document.querySelector('.ms-background').getContext('webgl').getExtension('WEBGL_lose_context').loseContext());await lifecycle.waitForFunction(()=>document.querySelector('.ms-frame').dataset.quality==='fallback');
    await lifecycle.reload({waitUntil:'networkidle'});assert.notEqual(await lifecycle.locator('.ms-frame').getAttribute('data-quality'),'fallback');await lifecycle.close();
    passed('Visibility/offscreen pause and resume; real context loss to posters, recovery on reload');
    const fallback=await b.newPage({reducedMotion:'reduce'});watch(fallback);await fallback.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null;});await fallback.goto(url,{waitUntil:'networkidle'});
    await fallback.keyboard.press('Tab');assert.equal(await fallback.evaluate(()=>document.activeElement.className),'ms-skip');await fallback.keyboard.press('Enter');assert.equal(await fallback.evaluate(()=>document.activeElement.id),'ms-transcript');
    await fallback.getByRole('button',{name:'Siguiente plano',exact:true}).click();assert.equal(await fallback.locator('.ms-frame').getAttribute('data-time'),'6.80');for(let i=0;i<8;i++)await fallback.getByRole('button',{name:'Siguiente plano',exact:true}).click();assert.equal(await fallback.locator('.ms-hello span').isVisible(),true);assert.equal(await fallback.locator('.ms-frame').getAttribute('data-time'),'26.00');await fallback.close();
    passed('No Canvas: semantic sequence, keyboard skip/focus, manual reduced-motion progression and Hola');
    assert.deepEqual(errors,[]);const report={checkedAt:new Date().toISOString(),browser:b.version(),checks,errors,measurements};await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({checks,errors,measurements:measurements.map(m=>m.width?{width:m.width,quality:m.quality,firstDraw:m.firstDraw,heap:m.heap}:m)},null,2));
  }catch(e){console.error('Verification failed:',e);throw e;}finally{await b.close();console.log('Browser closed');}
})().catch(e=>{console.error(e);process.exitCode=1;});
