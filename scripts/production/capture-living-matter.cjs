// Isolated art capture with the existing external Playwright runtime.
const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const output=process.argv[2];
const variant=Number(process.argv[3]||1);
const stillsOnly=process.argv.includes('--stills');
if(!output)throw Error('External output directory required');
(async()=>{
 await fs.mkdir(output,{recursive:true});
 const server=await chromium.launchServer({channel:'chrome',headless:true});
 const b=await chromium.connect(server.wsEndpoint());
 try{
 const p=await b.newPage({viewport:{width:1440,height:800},reducedMotion:'reduce'});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4193/experiments/living-matter/?variant='+variant,{waitUntil:'networkidle'});
 await p.waitForFunction(()=>window.study?.ready);
 for(const time of [0,1.75,3.5,5.25,7]){
  await p.evaluate(t=>window.study.draw(t),time);
  await p.locator('canvas').screenshot({path:path.join(output,`variant-${variant}-${time.toFixed(2)}.png`)});
 }
 if(!stillsOnly){
 const frames=path.join(output,`variant-${variant}-frames`);await fs.mkdir(frames,{recursive:true});
 for(let i=0;i<210;i++){
  const jpeg=await p.evaluate(t=>{window.study.draw(t);return document.querySelector('canvas').toDataURL('image/jpeg',.97).split(',')[1]},i/30);
  await fs.writeFile(path.join(frames,String(i).padStart(4,'0')+'.jpg'),Buffer.from(jpeg,'base64'));
 }
 }
 const metrics=await p.evaluate(async()=>{window.study.draw(0);const durations=[];let previous=performance.now();await new Promise(resolve=>{let count=0;function next(now){durations.push(now-previous);previous=now;window.study.draw(count/60);if(++count<90)requestAnimationFrame(next);else resolve();}requestAnimationFrame(next);});durations.sort((a,b)=>a-b);return {renderer:window.study.renderer,sizes:window.study.sizes,medianFrameMs:durations[45],p95FrameMs:durations[85],resolution:[1440,600]}});
 console.log(JSON.stringify({variant,errors,...metrics}));
 if(errors.length)throw Error('Browser reported errors');
 }finally{if(process.platform==='win32')execFileSync('taskkill',['/PID',String(server.process().pid),'/T','/F'],{windowsHide:true,stdio:'pipe'});else await server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
