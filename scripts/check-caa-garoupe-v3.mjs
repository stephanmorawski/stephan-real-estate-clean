import { chromium } from 'playwright';
import fs from 'node:fs';
import crypto from 'node:crypto';
const slug='2026-11-11-antibes-garoupe-plage-publique';
const repo='artifacts/caa-garoupe-v3';
fs.mkdirSync(repo,{recursive:true});
const article=JSON.parse(fs.readFileSync('content/news/'+slug+'.json','utf8'));
const registry=JSON.parse(fs.readFileSync('content/news-drafts/2026-11-11-editorial-proposals.json','utf8'));
const imgPath='public'+article.image;
const bytes=fs.readFileSync(imgPath);
const sha=crypto.createHash('sha256').update(bytes).digest('hex');
const failures=[];
if(registry.cycleId!=='caa-2026-11-11-editorial'||registry.workflowStatus!=='preparing'||registry.publicationAuthorized!==false)failures.push('unexpected cycle/approval state');
if(article.image!==('/news/'+slug.replace('plage-publique','nini-wisti-pexels')+'.jpg') &&
article.image!=='/news/2026-11-11-antibes-garoupe-nini-wisti-pexels.jpg') failures.push('incorrect image path');
if(registry.selectedArticle.visual.assetSha256!==sha||registry.selectedArticle.visual.assetBytes!==bytes.length)failures.push('JPEG bytes or SHA256 mismatch');
if(article.imageWidth!==1600||article.imageHeight!==1200||article.imageLayout!=='contain')failures.push('incorrect no-crop image dimensions/layout');
if(article.imageCredit?.author!=='Nini Wisti / Pexels'||article.imageCredit.license!=='Pexels License'||!article.imageCredit.licenseUrl.includes('pexels.com/license'))failures.push('missing photo attribution');
if(bytes[0]!==255||bytes[1]!==216||bytes.at(-2)!==255||bytes.at(-1)!==217)failures.push('invalid JPEG signature');
const pages=[];const browser=await chromium.launch({headless:true});
try{
for(const [device,viewport] of Object.entries({desktop:{width:1440,height:900},mobile:{width:390,height:844}})){
for(const lang of ['fr','en']){
for(const suffix of ['/actualites','/actualites/'+slug]){
const p='/'+lang+suffix, label=lang+'-'+device+'-'+(suffix.endsWith(slug)?'article':'index');
const page=await browser.newPage({viewport,deviceScaleFactor:1});
const js=[],net=[];
page.on('pageerror',e=>js.push(e.message));
page.on('console',m=>{if(m.type()==='error')js.push(m.text())});
page.on('response',r=>{if(r.url().startsWith('http://localhost:3000')&&r.status()>=400)net.push(r.status()+' '+r.url())});
try{
const response=await page.goto('http://localhost:3000'+p,{waitUntil:'networkidle',timeout:45000});
await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>null)))});
const out=await page.evaluate(({slug,lang,isArticle})=>{
const text=document.body.innerText;
const img=[...document.images].find(i=>(i.getAttribute('alt')||'').includes(lang==='fr'?'Littoral rocheux':'Sunny rocky'));
const image=img?{src:img.getAttribute('src'),naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,complete:img.complete,fit:getComputedStyle(img).objectFit,visible:!!img.getBoundingClientRect().width&&!!img.getBoundingClientRect().height}:null;
const links=[...document.querySelectorAll('a[href]')].map(a=>a.href);
return {lang:document.documentElement.lang,title:document.title,h1:document.querySelector('h1')?.textContent?.trim(),description:document.querySelector('meta[name="description"]')?.content,canonical:document.querySelector('link[rel="canonical"]')?.href,ogImage:document.querySelector('meta[property="og:image"]')?.content,overflow:document.documentElement.scrollWidth-innerWidth,image,hasCredit:text.includes('Nini Wisti')&&text.includes('Pexels'),hasIllustrationCaveat:/illustrat/i.test(text)&&(/chantier|works/i.test(text)),hasOfficialSource:links.some(l=>l.includes('antibes-juanlespins.com/information/actualites/la-garoupe-accessible')),linked:links.some(l=>l.endsWith('/actualites/'+slug))};
},{slug,lang,isArticle:suffix.endsWith(slug)});
await page.screenshot({path:repo+'/'+label+'.png',fullPage:true});
pages.push({label,path:p,status:response?.status(),...out,jsErrors:js,networkErrors:net});
if(response?.status()!==200||out.lang!==lang||!out.title||!out.description||!out.canonical)failures.push(label+' HTTP/SEO/lang');
if(out.overflow>3)failures.push(label+' horizontal overflow '+out.overflow);
if(js.length||net.length)failures.push(label+' JS/network errors '+JSON.stringify({js,net}));
if(suffix.endsWith(slug)){
if(!out.image||out.image.naturalWidth!==1600||out.image.naturalHeight!==1200||!out.image.complete||out.image.fit!=='contain'||!out.image.visible)failures.push(label+' non-decoded, cropped or hidden image');
if(!out.hasCredit||!out.hasIllustrationCaveat||!out.hasOfficialSource)failures.push(label+' credit/source/caveat');
if(!out.ogImage?.includes('nini-wisti-pexels'))failures.push(label+' OG image');
}else if(!out.linked)failures.push(label+' article not listed');
}catch(e){failures.push(label+': '+e.message)}
finally{await page.close()}
}
}
}
}finally{await browser.close()}
const report={sha:process.env.GITHUB_SHA,visualSha256:sha,visualBytes:bytes.length,articlePath:'content/news/'+slug+'.json',photosAreIllustrative:true,publicationAuthorized:false,pages,failures};
fs.writeFileSync(repo+'/report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({sha:report.sha,visualSha256:sha,checks:pages.length,failures},null,2));
if(failures.length||pages.length!==8)process.exitCode=1;
