// External Playwright audit runtime; no dependency added to the application.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {execFileSync}=require('node:child_process');
const base=process.argv.slice(2).find(arg=>!arg.startsWith('--'))||'http://127.0.0.1:4173/';
const checksOnly=process.argv.includes('--checks-only');
const url=new URL('?prototype=phase2a',base).href;
async function seek(p,t){await p.locator('input[type=range]').evaluate((el,t)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(t));el.dispatchEvent(new Event('input',{bubbles:true}));},t);await p.waitForTimeout(250);}
async function instrument(p){await p.addInitScript(()=>{
 window.gpuFrames=[];window.gpuTimes=[];
 const contexts=new Map(),draw=WebGLRenderingContext.prototype.drawArrays;
 window.releaseAuditQueries=()=>{for(const state of contexts.values())for(const q of state.pending)state.ext.deleteQueryEXT(q);contexts.clear();WebGLRenderingContext.prototype.drawArrays=draw;};
 WebGLRenderingContext.prototype.drawArrays=function(...args){
  window.firstDraw??=performance.now();window.gpuFrames.push(performance.now());
  if(!contexts.has(this))contexts.set(this,{ext:this.getExtension('EXT_disjoint_timer_query'),pending:[]});
  const state=contexts.get(this),ext=state.ext;if(!ext)return draw.apply(this,args);
  state.pending=state.pending.filter(q=>{if(!ext.getQueryObjectEXT(q,ext.QUERY_RESULT_AVAILABLE_EXT))return true;if(!this.getParameter(ext.GPU_DISJOINT_EXT))window.gpuTimes.push(ext.getQueryObjectEXT(q,ext.QUERY_RESULT_EXT)/1e6);ext.deleteQueryEXT(q);return false});
  if(state.pending.length>=4)return draw.apply(this,args);
  const q=ext.createQueryEXT();ext.beginQueryEXT(ext.TIME_ELAPSED_EXT,q);const result=draw.apply(this,args);ext.endQueryEXT(ext.TIME_ELAPSED_EXT);state.pending.push(q);return result;
 };
});}
(async()=>{
 const server=await chromium.launchServer({channel:'chrome',headless:true});
 const b=await chromium.connect(server.wsEndpoint()),measurements=[],loads=[],checks=[],errors=[];
 const watch=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(['warning','error'].includes(m.type()))errors.push(m.text())});};
 try{
  if(!checksOnly)for(const [width,height] of [[320,740],[390,844],[768,1024],[1440,900],[1920,1080]]){
   const p=await b.newPage({viewport:{width,height}});watch(p);await instrument(p);await p.goto(url,{waitUntil:'networkidle'});
   const client=await p.context().newCDPSession(p);await client.send('Performance.enable');
   for(const [scene,t] of [['cosmos',1],['water',8.2],['life',12],['information',19]]){
    await seek(p,t);if(scene==='life')await p.waitForFunction(()=>document.querySelector('video').readyState>=2);
    await p.getByRole('button',{name:'Continuar',exact:true}).click();await p.waitForTimeout(150);
    await p.evaluate(()=>{window.gpuFrames=[];window.gpuTimes=[]});const start=await client.send('Performance.getMetrics');
    await p.waitForTimeout(1200);const end=await client.send('Performance.getMetrics');
    const stats=await p.evaluate(()=>{
     const c=document.querySelector('.ms-background'),g=c.getContext('webgl'),ext=g.getExtension('WEBGL_debug_renderer_info');
     const f=window.gpuFrames,gaps=f.slice(1).map((t,i)=>t-f[i]).sort((a,b)=>a-b),gpu=window.gpuTimes.slice().sort((a,b)=>a-b),v=document.querySelector('video'),q=v.getVideoPlaybackQuality();
     return {quality:document.querySelector('.ms-frame').dataset.quality,buffer:[c.width,c.height],frames:f.length,gapMedian:gaps[Math.floor(gaps.length*.5)],gapP95:gaps[Math.floor(gaps.length*.95)],gpuMedian:gpu[Math.floor(gpu.length*.5)],gpuP95:gpu[Math.floor(gpu.length*.95)],gpuSamples:gpu.length,glError:g.getError(),renderer:ext?g.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,video:{src:v.currentSrc,decoded:q.totalVideoFrames,dropped:q.droppedVideoFrames,readyState:v.readyState}};
    });
    const task=m=>m.metrics.find(x=>x.name==='TaskDuration').value;assert.equal(stats.glError,0);
    measurements.push({width,height,scene,sampleMs:1200,cpuTaskMs:(task(end)-task(start))*1000,...stats});
    await p.getByRole('button',{name:'Pausar',exact:true}).click();
   }
   loads.push({width,...await p.evaluate(()=>({firstDraw:window.firstDraw,resources:performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,encoded:r.encodedBodySize,transfer:r.transferSize,duration:r.duration}))}))});
   await p.evaluate(()=>window.releaseAuditQueries());await client.detach();await p.close();console.log(`Measured ${width}: four scenes`);
  }
  const h264=await b.newPage({viewport:{width:1440,height:900}});watch(h264);
  await h264.addInitScript(()=>{const can=HTMLMediaElement.prototype.canPlayType;HTMLMediaElement.prototype.canPlayType=function(type){return type.includes('av01')?'':can.call(this,type)};});
  await h264.goto(url,{waitUntil:'networkidle'});await seek(h264,12);await h264.waitForFunction(()=>document.querySelector('video').readyState>=2);
  assert.ok((await h264.locator('video').evaluate(v=>v.currentSrc)).endsWith('membrane-high.mp4'));await h264.close();checks.push('H264 capability fallback decodes');
  const failure=await b.newPage({viewport:{width:1440,height:900}});watch(failure);
  await failure.route('**/*-av1.webm',r=>r.fulfill({status:200,contentType:'video/webm',body:'invalid media'}));
  await failure.goto(url,{waitUntil:'networkidle'});await seek(failure,12);await failure.waitForFunction(()=>{const v=document.querySelector('video');return v.currentSrc.endsWith('.mp4')&&v.readyState>=2});await failure.close();checks.push('AV1 decode failure retries H264');
  const fallback=await b.newPage({viewport:{width:390,height:844}});watch(fallback);
  await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:get.call(this,type,...args)}});
  await fallback.goto(url,{waitUntil:'networkidle'});await fallback.waitForFunction(()=>document.querySelector('.ms-frame').dataset.quality==='fallback');
  assert.equal(await fallback.locator('.ms-backdrop').evaluate(el=>el.complete&&el.naturalWidth>0),true);await seek(fallback,26);assert.equal(await fallback.locator('.ms-hello span').isVisible(),true);await fallback.close();checks.push('No WebGL without reduced motion uses posters and reaches Hola');
  const black=await b.newPage({viewport:{width:1440,height:900}});watch(black);await black.goto(url,{waitUntil:'networkidle'});await seek(black,23);
  await black.getByRole('button',{name:'Continuar',exact:true}).click();await black.waitForTimeout(150);await black.screenshot({path:'.audit/phase2a2/playing-black.png'});
  assert.equal(await black.locator('.ms-controls').evaluate(el=>getComputedStyle(el).opacity),'0');assert.equal(await black.locator('.ms-hello').count(),0);
  const rgba=await black.locator('.ms-background').evaluate(c=>{const g=c.getContext('webgl'),a=new Uint8Array(4);g.readPixels(1,1,1,1,g.RGBA,g.UNSIGNED_BYTE,a);return Array.from(a)});assert.deepEqual(rgba.slice(0,3),[0,0,0]);await black.close();checks.push('Playback black hides controls and GPU is black before cursor');
  assert.deepEqual(errors,[]);await fs.writeFile(`.audit/phase2a2/${checksOnly?'media-checks':'performance'}.json`,JSON.stringify({browser:b.version(),checkedAt:new Date().toISOString(),measurements,loads,checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
 }catch(e){console.error('Measurement failed:',e);throw e;}finally{
  // Timer-query profiling can stall Chrome's graceful GPU shutdown on Windows.
  // This server belongs only to the audit; all pages have already been closed.
  if(process.platform==='win32')execFileSync('taskkill',['/PID',String(server.process().pid),'/T','/F'],{windowsHide:true,stdio:'pipe'});
  else await server.kill();
  console.log('Audit browser stopped');
 }
})().then(()=>process.exit(0),e=>{console.error(e);process.exit(1)});
