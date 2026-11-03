import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.SITE_URL || 'http://localhost:3000';
const output = process.env.QA_OUTPUT || 'artifacts/homepage';
await fs.mkdir(output,{recursive:true});
const browser = await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL || 'chrome',headless:true});
const results=[];
try {
 for (const lang of ['fr','en']) for (const width of [390,768,1440]) {
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(`${base}/${lang}`,{waitUntil:'networkidle'});
  await page.locator('#actualites').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const data=await page.evaluate(()=>({lang:document.documentElement.lang,h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.querySelectorAll('main img')].map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})),news:[...document.querySelectorAll('.home-news-body h3 a')].map(a=>a.getAttribute('href')),review:document.querySelector('.home-review-card').innerText,headerBottom:document.querySelector('body > header').getBoundingClientRect().height,heroTextTop:document.querySelector('.home-hero-text').offsetTop}));
  assert.equal(response.status(),200);assert.equal(data.lang,lang);assert.equal(data.h1,1);assert.equal(data.overflow,false);assert(data.images.every(i=>i.ok),JSON.stringify(data.images));assert.equal(data.news.length,3);assert.equal(errors.length,0,errors.join('\n'));assert(data.heroTextTop>=data.headerBottom);
  for (const href of data.news) {const res=await page.request.get(`${base}${href}`);assert.equal(res.status(),200,href);}
  await page.goto(`${base}/${lang}`,{waitUntil:'networkidle'});
  await page.screenshot({path:`${output}/${lang}-${width}.png`,fullPage:true});
  await page.locator('.home-button').first().click();await page.waitForURL(`**/${lang}/contact`);
  await page.goto(`${base}/${lang}`);await page.locator('.home-button-outline').click();assert(new URL(page.url()).hash==='#expertise');
  const other=lang==='fr'?'en':'fr';await page.locator(`header a[href="/${other}"]:visible`).filter({hasText:other.toUpperCase()}).click();await page.waitForURL(`**/${other}`);
  results.push({lang,width,status:response.status(),...data,errors});await page.close();
 }
} finally {await browser.close();await fs.writeFile(`${output}/report.json`,JSON.stringify({base,checkedAt:new Date().toISOString(),results},null,2));}
console.log(JSON.stringify({base,passed:results.length,output}));
