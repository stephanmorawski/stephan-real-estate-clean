// Test-only API fixture. Reads already-public catalogue cards, never private APIMO data.
// Used only for pull-request browser tests; never imported by the application.
import { chromium } from 'playwright';
import http from 'node:http';

const origin = 'https://www.cotedazuragency.com';
const records = new Map();
const browser = await chromium.launch({ headless: true });
try {
  for (const lang of ['fr', 'en']) {
    const page = await browser.newPage();
    const response = await page.goto(`${origin}/${lang}/vente`, { waitUntil: 'load', timeout: 45000 });
    if (response?.status() !== 200) throw new Error(`Public catalogue ${lang} HTTP ${response?.status()}`);
    const cards = await page.locator(`main section.grid > a[href^="/${lang}/vente/"]`).evaluateAll(links => links.map(link => {
      const title = link.querySelector('h2');
      const content = title?.parentElement;
      const price = content ? [...content.children].find(el => el.tagName === 'DIV' && /€/.test(el.textContent || '')) : null;
      return { href: link.getAttribute('href'), title: title?.textContent?.trim(), city: content?.querySelector('p')?.textContent?.trim(), price: price?.textContent?.trim(), image: link.querySelector('img')?.getAttribute('src') };
    }));
    if (!cards.length) throw new Error(`No public cards in ${lang}; refusing an empty test fixture`);
    for (const card of cards) {
      const id = card.href?.match(/-(\d+)$/)?.[1];
      if (!id || !card.title) throw new Error('Cannot correlate a public card');
      const amount = card.price ? Number(card.price.replace(/[^0-9]/g, '')) : null;
      const record = records.get(id) || { id: Number(id), reference: `QA-${id}`, city: { name: card.city || '' }, price: { value: amount }, pictures: card.image ? [{ url: new URL(card.image, origin).href }] : [], comments: [] };
      record.comments.push({ language: lang, title: card.title, comment: 'Layout test fixture derived from the public catalogue; not a property description.' });
      records.set(id, record);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
for (const record of records.values()) {
  if (record.comments.length !== 2) throw new Error('A public property is missing a language counterpart');
}
const payload = JSON.stringify({ properties: [...records.values()] });
http.createServer((req, res) => {
  if (req.method !== 'GET' || req.url !== '/agencies/qa/properties') {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(payload);
}).listen(4174, '127.0.0.1', () => console.log(`QA fixture ready: ${records.size} public properties, two languages, no private API access`));
