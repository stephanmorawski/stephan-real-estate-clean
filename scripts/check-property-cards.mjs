import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const base = (process.env.SITE_URL || 'https://www.cotedazuragency.com').replace(/\/$/, '');
const expectedSha = (process.env.EXPECTED_SHA || '').trim();
const dir = 'artifacts/post-production/sales';
fs.mkdirSync(dir, { recursive: true });
const report = { base, scope: base.includes('127.0.0.1') ? 'PR build with public catalogue fixtures' : 'live deployment', expectedSha, startedAt: new Date().toISOString(), version: null, pages: [], failures: [] };
const sizes = [[320, 844], [390, 844], [768, 1024], [1024, 768], [1440, 720], [1440, 900], [1920, 1080]];
let browser;
try {
  const versionResponse = await fetch(`${base}/api/version`, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
  if (!versionResponse.ok) throw new Error(`Version endpoint HTTP ${versionResponse.status}`);
  report.version = await versionResponse.json();
  if (expectedSha && report.version.commitSha !== expectedSha) throw new Error(`Expected ${expectedSha}, served ${report.version.commitSha}`);
  browser = await chromium.launch({ headless: true });
  for (const lang of ['fr', 'en']) {
    let referenceCards;
    for (const [width, height] of sizes) {
      const label = `${lang}_${width}x${height}`;
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        const response = await page.goto(`${base}/${lang}/vente`, { waitUntil: 'load', timeout: 45000 });
        if (!response || response.status() !== 200) throw new Error(`Catalogue HTTP ${response?.status()}`);
        const selector = `main section.grid > a[href^="/${lang}/vente/"]`;
        await page.locator(selector).first().waitFor({ state: 'visible', timeout: 15000 });
        const links = page.locator(selector);
        for (let i = 0; i < await links.count(); i++) {
          await links.nth(i).scrollIntoViewIfNeeded();
          await page.waitForTimeout(80);
        }
        await page.evaluate(async () => {
          await Promise.race([
            Promise.all([...document.querySelectorAll('main section.grid img')].map(image => image.decode().catch(() => null))),
            new Promise(resolve => setTimeout(resolve, 12000)),
          ]);
          await document.fonts.ready;
          scrollTo({ top: 0, left: 0, behavior: 'instant' });
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        const result = await page.evaluate(selector => {
          const visible = element => {
            for (let current = element; current; current = current.parentElement) {
              const style = getComputedStyle(current);
              if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
            }
            return true;
          };
          const cards = [...document.querySelectorAll(selector)].map(card => {
            const title = card.querySelector('h2');
            const content = title?.parentElement;
            const price = content ? [...content.children].find(el => el.tagName === 'DIV' && /€|price on request|prix sur demande/i.test(el.textContent || '')) : null;
            const issues = [];
            if (!price) issues.push('missing price or explicit on-request label');
            if (price) {
              const bounds = price.getBoundingClientRect();
              if (!visible(price) || bounds.width <= 0 || bounds.height <= 0) issues.push('price hidden');
              const range = document.createRange();
              range.selectNodeContents(price);
              const textBounds = range.getBoundingClientRect();
              if (textBounds.width > bounds.width + 2 || textBounds.height > bounds.height + 2) issues.push('price text overflows its box');
              for (let parent = price.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
                const outer = parent.getBoundingClientRect();
                const style = getComputedStyle(parent);
                if (/hidden|clip|scroll|auto/.test(style.overflowY) && (bounds.top < outer.top - 2 || bounds.bottom > outer.bottom + 2)) issues.push('price clipped vertically by ancestor');
                if (/hidden|clip|scroll|auto/.test(style.overflowX) && (bounds.left < outer.left - 2 || bounds.right > outer.right + 2)) issues.push('price clipped horizontally by ancestor');
              }
              const outer = card.getBoundingClientRect();
              if (bounds.bottom > outer.bottom + 2 || bounds.top < outer.top - 2) issues.push('price outside card');
            }
            for (const image of card.querySelectorAll('img')) {
              if (!image.complete || image.naturalWidth === 0) issues.push('undecoded property image');
            }
            return { href: card.getAttribute('href'), title: title?.textContent?.trim(), price: price?.textContent?.trim() || null, issues };
          });
          return { cards, horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth) };
        }, selector);
        if (!result.cards.length) throw new Error('No property cards');
        const signature = result.cards.map(({ href, price }) => ({ href, price }));
        if (referenceCards && JSON.stringify(signature) !== JSON.stringify(referenceCards)) report.failures.push(`${label}: catalogue or prices changed between viewports`);
        referenceCards ||= signature;
        if (result.horizontalOverflow > 3) report.failures.push(`${label}: page horizontal overflow ${result.horizontalOverflow}px`);
        for (const card of result.cards) for (const issue of card.issues) report.failures.push(`${label} ${card.href}: ${issue}`);
        for (const error of errors) report.failures.push(`${label}: JavaScript ${error}`);
        const screenshot = `${label}.png`;
        await page.screenshot({ path: path.join(dir, screenshot), fullPage: true });
        report.pages.push({ lang, width, height, cardCount: result.cards.length, ...result, javascriptErrors: errors, screenshot });
      } catch (error) {
        report.failures.push(`${label}: ${error.message}`);
      } finally {
        await context.close();
      }
    }
  }
} catch (error) {
  report.failures.push(error.message);
} finally {
  if (browser) await browser.close();
  report.finishedAt = new Date().toISOString();
  report.passed = report.failures.length === 0 && report.pages.length === sizes.length * 2;
  fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, pages: report.pages.length, checks: report.pages.reduce((sum, page) => sum + page.cardCount, 0), failures: report.failures }, null, 2));
  if (!report.passed) process.exitCode = 1;
}
