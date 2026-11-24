import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
const base='https://www.cotedazuragency.com',dir='artifacts/vente-typographie';
const expectedSha=process.env.EXPECTED_SHA;
const viewports=[[390,844],[768,1024],[1024,768],[1440,900]];
const report={expectedSha,started:new Date().toISOString(),indexes:[],details:[],failures:[]};
let session,driver;
const local='http://127.0.0.1:9515';
await fs.mkdir(dir,{recursive:true});
async function call(path,body,method=body===undefined?'GET':'POST'){
  const response=await fetch(local+path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(45000)});
  const {value}=await response.json(); if(!response.ok || value?.error)throw Error(`${path} ${value?.error}: ${value?.message}`);return value;
}
const cmd=(path,body)=>call('/session/'+session+path,body);
const cdp=(name,params)=>cmd('/goog/cdp/execute',{cmd:name,params});
const run=(fn,...args)=>cmd('/execute/sync',{script:'return ('+fn.toString()+').apply(null,arguments)',args});
const goto=async url=>{await cmd('/url',{url});await run(()=>document.fonts.ready.then(()=>true));};
const size=([width,height])=>cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
async function version(){return (await fetch(base+'/api/version',{cache:'no-store'})).json()}
const equals=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
try{
  report.version=await version();if(report.version.commitSha!==expectedSha)throw Error(`Wrong revision ${report.version.commitSha}`);
  driver=spawn('chromedriver',['--port=9515'],{stdio:['ignore','inherit','inherit']});
  for(let i=0;i<50;i++){try{await call('/status');break;}catch(e){if(i===49)throw e;await delay(150);}}
  const s=await call('/session',{capabilities:{alwaysMatch:{browserName:'chrome',pageLoadStrategy:'eager','goog:chromeOptions':{args:['--headless','--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars']}}}});
  session=s.sessionId;
  report.browser=s.capabilities.browserVersion;
  await cdp('Network.enable',{});
  await cdp('Network.setBlockedURLs',{urls:['https://media.apimo.pro/*']});
  const properties={};
  for(const lang of ['fr','en']){
    await goto(`${base}/${lang}/vente`);
    for(const viewport of viewports){
      await size(viewport);
      const data=await run((lang)=>[...document.querySelectorAll(`main section a[href^="/${lang}/vente/"]`)].map(a=>({title:a.querySelector('h2').textContent.trim(),font:getComputedStyle(a.querySelector('h2')).fontSize,url:a.href,id:a.href.split('-').pop()})),lang);
      if(!data.length||new Set(data.map(c=>c.id)).size!==data.length||data.some(c=>c.font!==(viewport[0]<768?'14px':'15px')))report.failures.push(`Invalid catalogue (${lang}, ${viewport})`);
      report.indexes.push({lang,width:viewport[0],cards:data.length,fonts:[...new Set(data.map(c=>c.font))]});properties[lang]=data;
    }
  }
  if(!equals(properties.fr.map(c=>c.id).sort(),properties.en.map(c=>c.id).sort()))report.failures.push('Different catalogue IDs across languages');
  for(const [lang,items] of Object.entries(properties))for(const p of items){
    try{
      await goto(p.url);
      const screenshot=lang==='fr'&&p.id==='86806890';
      if(screenshot){await cdp('Network.setBlockedURLs',{urls:[]});await cmd('/refresh',{});await run(()=>Promise.all([document.fonts.ready,...[...document.querySelectorAll('main img')].map(i=>i.decode().catch(()=>{}))]).then(()=>true));}
      for(const viewport of viewports){
        await size(viewport);
        const result=await run(()=>{
          const h=document.querySelector('main h1'),r=h.getBoundingClientRect(),s=getComputedStyle(h),c=h.parentElement.getBoundingClientRect();const rg=document.createRange();rg.selectNodeContents(h);
          const lines=[...rg.getClientRects()].filter(i=>i.width>0);const fits=(b,x)=>b.left>=x.left-2&&b.right<=x.right+2&&b.top>=x.top-2&&b.bottom<=x.bottom+2;
          return {url:location.href,title:h.textContent.trim(),font:parseFloat(s.fontSize),lines:lines.length,titleTop:Math.round(r.top+scrollY),fullyVisible:lines.length>0&&h.checkVisibility()&&lines.every(b=>fits(b,r)&&fits(b,c))&&h.scrollWidth<=h.clientWidth+2&&h.scrollHeight<=h.clientHeight+2,horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),h1Count:document.querySelectorAll('main h1').length};
        });
        const width=viewport[0];if(result.url!==p.url||result.title.replace(/\s+/g,' ')!==p.title.replace(/\s+/g,' ')||result.h1Count!==1||result.font!==(width<640?26:width<1024?30:36)||!result.fullyVisible||result.horizontalOverflow>2)report.failures.push(`${lang} ${p.id} ${width} ${JSON.stringify(result)}`);
        report.details.push({lang,id:p.id,width,...result});
        if(screenshot&&[390,1440].includes(width)){
          await run(w=>{const h=document.querySelector('main h1');const header=document.querySelector('body > header') || document.querySelector('header');const inset=Math.max(245,header.getBoundingClientRect().height+60);window.scrollTo({top:w===390?h.getBoundingClientRect().top+scrollY-inset:0,behavior:'instant'});return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))));},width);
          const displayed=await run(()=>{const h=document.querySelector('main h1'),r=h.getBoundingClientRect();const p=document.elementFromPoint(r.left+Math.min(25,r.width/2),r.top+r.height/2);return Boolean(p && (p===h || h.contains(p)) && r.top>=0 && r.bottom<=innerHeight);});
          if(!displayed)throw Error(`Title obscured in screenshot at ${width}px`);
          const {data}=await cdp('Page.captureScreenshot',{format:'jpeg',quality:85,fromSurface:true,captureBeyondViewport:false});await fs.writeFile(`${dir}/vence-${width===390?'mobile':'ordinateur'}.jpg`,Buffer.from(data,'base64'));
        }
      }
      if(screenshot)await cdp('Network.setBlockedURLs',{urls:['https://media.apimo.pro/*']});
    }catch(e){report.failures.push(`${p.url}: ${e.message}`)}
  }
  if((await version()).commitSha!==expectedSha)report.failures.push('Version changed during QA');
}catch(e){report.failures.push(e.message)}finally{
  if(session)try{await call('/session/'+session,undefined,'DELETE')}catch{}
  if(driver)driver.kill();
  report.finished=new Date().toISOString();await fs.writeFile(`${dir}/rapport.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify({version:report.version,mandats:new Set(report.details.map(d=>d.id)).size,fiches:new Set(report.details.map(d=>d.url)).size,controles:report.details.length,indexes:report.indexes,vence:report.details.filter(d=>d.lang==='fr'&&d.id==='86806890'),failures:report.failures},null,2));
  if(!report.details.length||report.failures.length)process.exitCode=1;
}

