// Render the procedural backgrounds to clean fallback posters (no UI or text baked in).
// Uses external Playwright + Sharp, not product dependencies. Run against a dev/preview server.
const {chromium}=require('playwright');
const sharp=require('sharp');
const fs=require('node:fs/promises');
const base=process.argv[2]||'http://127.0.0.1:4174/';
(async()=>{
  await fs.mkdir('public/media/phase2a2',{recursive:true});
  const b=await chromium.launch({channel:'chrome',headless:true});
  try{
    const page=await b.newPage({viewport:{width:1440,height:900}});
    await page.goto(new URL('?prototype=phase2a',base).href,{waitUntil:'networkidle'});
    await page.addStyleTag({content:'.ms-edition,.ms-opening,.ms-caption,.ms-ai,.ms-hello,.ms-controls,.ms-life{visibility:hidden!important}'});
    for(const [name,time] of [['cosmos',0],['horizon',6.9],['water',9.4],['information',19.5]]){
      await page.locator('input[type=range]').evaluate((el,t)=>{
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(t));
        el.dispatchEvent(new Event('input',{bubbles:true}));
      },time);
      await page.waitForTimeout(150);
      const bytes=await page.locator('.ms-frame').screenshot();
      await sharp(bytes).webp({quality:88}).toFile(`public/media/phase2a2/${name}.webp`);
    }
  }finally{await b.close();}
  console.log('Four clean procedural posters exported');
})().catch(e=>{console.error(e);process.exitCode=1;});
