import { chromium } from 'playwright';
import fs from 'node:fs';
const base=(process.env.SITE_URL||'https://www.cotedazuragency.com').replace(/\/$/,'');
const dir='artifacts/post-production'; fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
const pages=['/fr','/en','/fr/actualites','/en/actualites','/fr/services','/en/services','/fr/contact','/en/contact'];
for(const [device,viewport] of Object.entries({desktop:{width:1440,height:900},mobile:{width:390,height:844}})){
 const context=await browser.newContext({viewport,deviceScaleFactor:1});
 for(const path of pages){
  const page=await context.newPage(); const label=(path.replaceAll('/','_')||'_home')+'_'+device;
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  try{
   const response=await page.goto(base+path,{waitUntil:'networkidle',timeout:30000});
   if(!response || response.status()>=400) failures.push(label+': HTTP '+response?.status());
   await page.screenshot({path:dir+'/'+label+'.png',fullPage:true});
   const issues=await page.evaluate(()=>{
    const out=[];
    if(document.documentElement.scrollWidth>innerWidth+3) out.push('horizontal overflow');
    for(const img of document.images){
      if(!img.complete||img.naturalWidth===0) out.push('broken image: '+img.src);
      const r=img.getBoundingClientRect(), cs=getComputedStyle(img);
      if(/partner|logo|financer|omage/i.test(img.src) && cs.objectFit==='cover') out.push('partner logo uses cover: '+img.src);
      if(r.width>0&&r.height>0&&img.naturalWidth>0&&img.naturalHeight>0&&/partner|logo|financer|omage/i.test(img.src)&&cs.objectFit==='cover') out.push('logo crop risk');
    }
    return out;
   });
   failures.push(...issues.map(x=>label+': '+x),...errors.map(x=>label+': JS '+x));
  }catch(e){failures.push(label+': '+e.message);}
  await page.close();
 }
 await context.close();
}
await browser.close();
fs.writeFileSync(dir+'/report.json',JSON.stringify({base,failures,checkedAt:new Date().toISOString()},null,2));
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log('Production smoke checks passed');
