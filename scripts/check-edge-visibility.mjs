import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Read-only production audit. No account, secret, form submission or publication.
const base = 'https://www.cotedazuragency.com';
const expectedSha = (process.env.EXPECTED_SHA || '').trim();
const dir = 'artifacts/edge-visibility';
const sizes = [[320, 844], [390, 844], [768, 1024], [1024, 768], [1440, 720], [1440, 900], [1920, 1080]];
const report = { base, scope: 'Public production in Microsoft Edge; not a Bing index report', startedAt: new Date().toISOString(), platform: os.platform(), channel: 'msedge', expectedSha: expectedSha || null, version: null, browserVersion: null, userAgent: null, pages: [], crawlChecks: [], failures: [] };
fs.mkdirSync(dir, { recursive: true });
let browser;

async function get(url) {
  const response = await fetch(url, { redirect: 'follow', cache: 'no-store', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${new URL(url).pathname}: HTTP ${response.status}`);
  return response;
}
function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1] || '';
}

// CSS line-height is not a clipping boundary when overflow is visible. Windows
// font metrics can exceed that line box. Check actual text against real clips.
function auditCards(selector) {
  const rect = r => ({ top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height });
  const cards = [...document.querySelectorAll(selector)].map(card => {
    const title = card.querySelector('h2');
    const price = [...(title?.parentElement?.children || [])].find(el => el.tagName === 'DIV' && /€|prix sur demande|price on request/i.test(el.textContent || ''));
    const issues = [];
    let geometry = null;
    if (!price) issues.push('price or on-request label missing');
    if (price) {
      const r = price.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(price);
      const text = range.getBoundingClientRect();
      geometry = { element: rect(r), text: rect(text), lineHeight: getComputedStyle(price).lineHeight, overflow: getComputedStyle(price).overflow };
      if (r.width <= 0 || r.height <= 0 || text.width <= 0 || text.height <= 0) issues.push('price has no visible size');
      for (let el = price; el && el !== document.body; el = el.parentElement) {
        const css = getComputedStyle(el);
        const outer = el.getBoundingClientRect();
        if (css.display === 'none' || css.visibility === 'hidden' || css.contentVisibility === 'hidden' || Number(css.opacity) === 0) issues.push('price hidden');
        if (/hidden|clip|auto|scroll/.test(css.overflowY) && (text.top < outer.top - 2 || text.bottom > outer.bottom + 2)) issues.push('price text clipped vertically by overflow');
        if (/hidden|clip|auto|scroll/.test(css.overflowX) && (text.left < outer.left - 2 || text.right > outer.right + 2)) issues.push('price text clipped horizontally by overflow');
      }
      const outer = card.getBoundingClientRect();
      if (text.top < outer.top - 2 || text.bottom > outer.bottom + 2 || text.left < outer.left - 2 || text.right > outer.right + 2) issues.push('price text outside card');
    }
    const images = [...card.querySelectorAll('img')].map(img => ({ complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight }));
    if (images.some(img => !img.complete || !img.naturalWidth)) issues.push('property image not decoded');
    return { href: card.getAttribute('href'), title: title?.textContent?.trim(), price: price?.textContent?.trim() || null, geometry, images, issues: [...new Set(issues)] };
  });
  return { cards, horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth) };
}

async function verifyAssertions(browser) {
  const context = await browser.newContext({ viewport: { width: 800, height: 600 } });
  const page = await context.newPage();
  const cases = [
    { name: 'small line-height with visible overflow', priceCss: 'font-size:20px;line-height:10px;overflow:visible', expected: null },
    { name: 'price clipped by its own overflow', priceCss: 'height:1px;overflow:hidden', expected: 'clipped vertically' },
    { name: 'price clipped by ancestor', containerCss: 'height:25px;overflow:hidden', expected: 'clipped vertically' },
    { name: 'price missing', missing: true, expected: 'missing' },
    { name: 'price display none', priceCss: 'display:none', expected: 'hidden' },
  ];
  const results = [];
  try {
    for (const test of cases) {
      await page.setContent(`<div class="card" style="display:block;width:300px;padding:30px;overflow:hidden;font:16px Arial"><div style="${test.containerCss || ''}"><h2 style="margin:0 0 10px;font-size:16px;line-height:20px">Test property</h2>${test.missing ? '' : `<div style="${test.priceCss || ''}">1 890 000 €</div>`}</div></div>`);
      const result = await page.evaluate(auditCards, '.card');
      const issues = result.cards[0].issues;
      const passed = test.expected ? issues.some(issue => issue.includes(test.expected)) : issues.length === 0;
      results.push({ name: test.name, passed, issues, geometry: result.cards[0].geometry });
    }
  } finally {
    await context.close();
  }
  report.assertionSelfTests = results;
  if (results.some(test => !test.passed)) throw new Error('Price visibility assertion self-test failed');
}

try {
  report.version = await (await get(`${base}/api/version`)).json();
  if (!/^[a-f0-9]{40}$/i.test(report.version.commitSha || '')) throw new Error('No valid deployed SHA');
  if (expectedSha && report.version.commitSha !== expectedSha) throw new Error(`Expected ${expectedSha}, served ${report.version.commitSha}`);
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  report.browserVersion = browser.version();
  await verifyAssertions(browser);

  for (const lang of ['fr', 'en']) {
    let reference;
    for (const [width, height] of sizes) {
      const label = `${lang}_${width}x${height}`;
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        const response = await page.goto(`${base}/${lang}/vente`, { waitUntil: 'load', timeout: 45000 });
        if (response?.status() !== 200) throw new Error(`HTTP ${response?.status()}`);
        const ua = await page.evaluate(() => navigator.userAgent);
        report.userAgent ||= ua;
        if (!/Edg\//.test(ua)) throw new Error('Browser is not Microsoft Edge');
        const selector = `main section.grid > a[href^="/${lang}/vente/"]`;
        const cards = page.locator(selector);
        await cards.first().waitFor({ state: 'visible', timeout: 15000 });
        for (let i = 0; i < await cards.count(); i++) {
          await cards.nth(i).scrollIntoViewIfNeeded();
          await page.waitForTimeout(100);
        }
        await page.evaluate(async () => {
          await Promise.race([Promise.all([...document.querySelectorAll('main section.grid img')].map(img => img.decode().catch(() => null))), new Promise(resolve => setTimeout(resolve, 12000))]);
          await document.fonts.ready;
          scrollTo({ top: 0, left: 0, behavior: 'instant' });
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        const result = await page.evaluate(auditCards, selector);
        if (!result.cards.length) throw new Error('Empty catalogue');
        const signature = JSON.stringify(result.cards.map(({ href, price }) => ({ href, price })));
        if (reference && reference !== signature) report.failures.push(`${label}: catalogue changed during audit`);
        reference ||= signature;
        if (result.horizontalOverflow > 3) report.failures.push(`${label}: horizontal overflow ${result.horizontalOverflow}px`);
        for (const card of result.cards) for (const issue of card.issues) report.failures.push(`${label} ${card.href}: ${issue}`);
        for (const error of errors) report.failures.push(`${label}: JavaScript ${error}`);
        await page.screenshot({ path: path.join(dir, `${label}.png`), fullPage: true });
        report.pages.push({ lang, width, height, ...result, javascriptErrors: errors, screenshot: `${label}.png` });
      } catch (error) {
        report.failures.push(`${label}: ${error.message}`);
      } finally {
        await context.close();
      }
    }
  }

  // Ordinary anonymous HTTP retrieval, not a spoofed Bingbot or a Bing index inspection.
  const sitemap = await (await get(`${base}/sitemap.xml`)).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  const commercial = urls.filter(url => url.startsWith(`${base}/`) && /^\/(fr|en)(\/vente(\/[^?#]+)?)?$/.test(new URL(url).pathname));
  if (commercial.length < 4) throw new Error('Commercial URLs missing from sitemap');
  for (const url of commercial) {
    try {
      const response = await get(url);
      const html = await response.text();
      const canonicalTag = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]).find(tag => attribute(tag, 'rel').toLowerCase() === 'canonical');
      const canonical = canonicalTag ? attribute(canonicalTag, 'href').replace(/&amp;/g, '&') : '';
      const robots = [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => match[0]).filter(tag => /^(robots|bingbot)$/i.test(attribute(tag, 'name'))).map(tag => attribute(tag, 'content')).join(', ');
      const noindex = /\bnoindex\b/i.test(`${robots},${response.headers.get('x-robots-tag') || ''}`);
      const record = { url, finalUrl: response.url, status: response.status, canonical, noindex };
      report.crawlChecks.push(record);
      if (response.url !== url || canonical !== url || noindex) report.failures.push(`${new URL(url).pathname}: redirect, canonical or noindex mismatch`);
    } catch (error) {
      report.failures.push(error.message);
    }
  }
  report.finalVersion = await (await get(`${base}/api/version`)).json();
  if (report.finalVersion.commitSha !== report.version.commitSha) report.failures.push('Production SHA changed during audit; results need a stable-SHA rerun');
} catch (error) {
  report.failures.push(error.message);
} finally {
  if (browser) await browser.close();
  report.finishedAt = new Date().toISOString();
  report.cardChecks = report.pages.reduce((sum, page) => sum + page.cards.length, 0);
  report.passed = report.failures.length === 0 && report.pages.length === sizes.length * 2 && report.crawlChecks.length >= 4;
  fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, platform: report.platform, channel: report.channel, browserVersion: report.browserVersion, testedSha: report.version?.commitSha, viewports: report.pages.length, cardChecks: report.cardChecks, crawlChecks: report.crawlChecks.length, failures: report.failures }, null, 2));
  if (!report.passed) process.exitCode = 1;
}
