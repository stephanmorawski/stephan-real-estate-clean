import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const host = 'https://www.cotedazuragency.com';
const out = 'artifacts/vente-typographie';
const expectedSha = process.env.EXPECTED_SHA;
const viewports = [[390, 844], [768, 1024], [1024, 768], [1440, 900]];
const report = { expectedSha, started: new Date().toISOString(), indexes: [], details: [], failures: [] };
const failure = msg => report.failures.push(msg);
const norm = str => str.replace(/\s+/g, ' ').trim();
await fs.mkdir(out, {recursive: true});
let browser;
try {
  const version = await fetch(host + '/api/version', {cache: 'no-store'});
  report.version = await version.json();
  if (report.version.commitSha !== expectedSha) throw Error(`Production is ${report.version.commitSha}, expected ${expectedSha}`);
  browser = await chromium.launch();
  const context = await browser.newContext({viewport:{width:1440, height:900}, deviceScaleFactor:1});
  const catalogs = {};
  for (const lang of ['fr','en']) {
    const page = await context.newPage();
    await page.route('**/*', route => route.request().resourceType() === 'image' ? route.abort() : route.continue());
    const indexURL = `${host}/${lang}/vente`;
    const response = await page.goto(indexURL,{waitUntil:'domcontentloaded'});
    if (response.status() !== 200 || page.url() !== indexURL) failure(`Invalid catalogue ${lang}`);
    const cards = page.locator(`main section a[href^="/${lang}/vente/"]`);
    await cards.first().waitFor();
    catalogs[lang] = await cards.evaluateAll(nodes => nodes.map(a => ({url:a.href,id:a.href.split('-').pop(),title:a.querySelector('h2').textContent.trim()})));
    if (!catalogs[lang].length || new Set(catalogs[lang].map(c=>c.id)).size !== catalogs[lang].length) failure(`Empty or duplicate property list in ${lang}`);
    for (const [width,height] of viewports) {
      await page.setViewportSize({width,height});
      const fonts = await cards.locator('h2').evaluateAll(els => [...new Set(els.map(el=>getComputedStyle(el).fontSize))]);
      const expected = width<768?'14px':'15px';
      if (fonts.length !== 1 || fonts[0] !== expected) failure(`Inconsistent catalogue title sizes ${lang} ${width}: ${fonts}`);
      report.indexes.push({lang,width,cardCount:catalogs[lang].length,titleFontSizes:fonts});
    }
    await page.close();
  }
  if (catalogs.fr.map(c=>c.id).sort().join() !== catalogs.en.map(c=>c.id).sort().join()) failure('FR/EN catalogue IDs differ');
  for (const [lang,properties] of Object.entries(catalogs)) {
    for (const property of properties) {
      const page = await context.newPage();
      try {
        const capture = lang==='fr' && property.id==='86806890';
        let imageCount=0;
        await page.route('**/*', route => {
          if (route.request().resourceType()==='image' && route.request().url().startsWith('https://media.apimo.pro/') && (!capture || ++imageCount > 2)) return route.abort();
          return route.continue();
        });
        const response = await page.goto(property.url, {waitUntil:'load',timeout:30000});
        const title = page.locator('main h1');
        if (response.status() !== 200 || page.url() !== property.url || await title.count() !== 1 || norm(await title.textContent()) !== norm(property.title)) failure(`Wrong page/title ${property.url}`);
        await page.evaluate(()=>document.fonts.ready);
        for (const [width,height] of viewports) {
          await page.setViewportSize({width,height});
          const metrics = await title.evaluate(h => {
            const rect=h.getBoundingClientRect(), style=getComputedStyle(h), card=h.parentElement.getBoundingClientRect();
            const range=document.createRange(); range.selectNodeContents(h);
            const lines=[...range.getClientRects()].filter(r=>r.width>0);
            const fits=(r,box)=>r.top>=box.top-2 && r.bottom<=box.bottom+2 && r.left>=box.left-2 && r.right<=box.right+2;
            return {fontPx:parseFloat(style.fontSize),lineCount:lines.length,fullyDisplayed:lines.length>0 && lines.every(r=>fits(r,rect)&&fits(r,card)) && h.scrollHeight<=h.clientHeight+2 && h.scrollWidth<=h.clientWidth+2 && h.checkVisibility(),horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),titleTopFromDocument:Math.round(rect.top+scrollY),cardWidth:Math.round(card.width)};
          });
          const expected=width<640?26:width<1024?30:36;
          if(metrics.fontPx!==expected || !metrics.fullyDisplayed || metrics.horizontalOverflow>2) failure(`${lang} ${property.id} ${width}px: ${JSON.stringify(metrics)}`);
          report.details.push({lang,url:property.url,id:property.id,title:property.title,width,height,...metrics});
          if(capture && [390,1440].includes(width)) {
            if(width===390) await title.evaluate(h=>window.scrollTo(0,h.getBoundingClientRect().top+scrollY-128));
            else await page.evaluate(()=>window.scrollTo(0,0));
            await page.screenshot({path:`${out}/vence-${width===390?'mobile':'ordinateur'}.jpg`,type:'jpeg',quality:85});
          }
        }
      } catch(e) {failure(`${property.url}: ${e.message}`);} finally {await page.close();}
    }
  }
  const finalVersion = await fetch(host+'/api/version', {cache:'no-store'});
  if ((await finalVersion.json()).commitSha !== expectedSha) failure('Production version changed during QA');
} catch(e) {failure(e.message);} finally {
  if(browser) await browser.close();
  report.finished = new Date().toISOString();
  await fs.writeFile(`${out}/rapport.json`,JSON.stringify(report,null,2));
  const summary={version:report.version?.commitSha, fiches: new Set(report.details.map(e=>e.url)).size, mandats:new Set(report.details.map(e=>e.id)).size, controles:report.details.length, cartes:report.indexes, venceFR:report.details.filter(e=>e.id==='86806890'&&e.lang==='fr'), failures:report.failures};
  console.log(JSON.stringify(summary,null,2));
  if (report.failures.length || !report.details.length) process.exitCode=1;
}
