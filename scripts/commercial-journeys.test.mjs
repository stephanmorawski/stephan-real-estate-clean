import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium, expect } = createRequire('/tmp/commercial-browser/package.json')('@playwright/test');
const base = 'http://127.0.0.1:3100';
const output = 'commercial-test-results';
fs.mkdirSync(output, { recursive: true });

// Check the published inventory without deleting a different article based on
// an ambiguous request. The January article was withdrawn in the prior release.
const news = fs.readdirSync('content/news').filter(name => name.endsWith('.json')).map(name => ({ name, entry: JSON.parse(fs.readFileSync(`content/news/${name}`, 'utf8')) }));
const withdrawn = news.find(item => item.name === '2026-01-01-sophia-antipolis-essor-ia-interface-trust.json');
assert.equal(withdrawn?.entry.status, 'draft');
const published = news.filter(item => (item.entry.status || 'published') === 'published');
for (const lang of ['fr', 'en']) {
  const titles = published.map(item => item.entry[lang]?.title?.trim().toLowerCase());
  assert.ok(titles.every(Boolean));
  assert.equal(new Set(titles).size, titles.length, `Duplicate published ${lang} title`);
}

let ready = false;
for (let n = 0; n < 60; n++) {
  try { if ((await fetch(base + '/fr')).ok) { ready = true; break; } } catch {}
  await new Promise(resolve => setTimeout(resolve, 500));
}
assert.ok(ready, 'Local server must be ready');
const asset = await fetch(base + '/images/expertises-jardin-vue-mer.avif');
assert.equal(asset.status, 200);
assert.match(asset.headers.get('content-type'), /image\/avif/);
assert.equal((await asset.arrayBuffer()).byteLength, 24197);

const browser = await chromium.launch();
const results = [];
const checkedLinks = new Set();
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 950 } });
    // Prevent any external request from browser tests, including analytics.
    await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const lang of ['fr', 'en']) {
      for (const suffix of ['', '/services', '/agence/expertises', '/agence/partenaires']) {
        const path = `/${lang}${suffix}`;
        const raw = await fetch(base + path);
        assert.equal(raw.status, 200);
        const html = await raw.text();
        assert.match(html, /<title\b[^>]*>[^<]+<\/title>/i);
        await page.goto(base + path);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        // Existing Partners metadata is unchanged by this presentation change.
        if (suffix !== '/agence/partenaires') {
          await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.cotedazuragency.com' + path);
        }
        if (suffix === '/services') {
          await expect(page.locator('main')).not.toContainText(/Stephan/i);
          await expect(page.locator('#home-staging')).toContainText(lang === 'fr' ? 'Nous réalisons des prestations' : 'We provide home staging');
          await expect(page.locator('a[data-conversion="home_staging_contact"]')).toHaveAttribute('href', `/${lang}/contact?projet=vente`);
        }
        if (suffix === '/agence/expertises') {
          const headline = page.locator('#expertise-headline');
          await expect(headline).toContainText(lang === 'fr' ? 'Le marché immobilier a changé.' : 'The real estate market has changed.');
          await expect(headline).toContainText(lang === 'fr' ? 'La manière de chercher doit changer aussi.' : 'The way of searching must evolve as well.');
          const image = page.locator('[data-expertise-hero] img');
          await expect(image).toBeVisible();
          await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
          const photo = await image.boundingBox();
          const text = await headline.boundingBox();
          assert.ok(photo.width > photo.height, 'The supplied photo remains horizontal');
          if (width >= 1024) assert.ok(text.x + text.width <= photo.x + 2, 'Text remains outside and left of the photo');
          else assert.ok(text.y + text.height < photo.y, 'On mobile the readable text precedes the photo');
          await page.locator('[data-expertise-hero]').screenshot({ path: `${output}/${lang}-expertises-hero-${width}.png` });
        }
        if (suffix === '/agence/partenaires') {
          const cards = page.locator('[data-partner-grid] > div');
          await expect(cards).toHaveCount(6);
          await expect(cards.nth(0).locator('h2')).toHaveText(lang === 'fr' ? 'Notaires et conseils juridiques' : 'Notaries and legal advisors');
          await expect(cards.nth(1).locator('h2')).toHaveText('Currencies Direct');
          const first = await cards.nth(0).boundingBox();
          const second = await cards.nth(1).boundingBox();
          if (width >= 768) assert.ok(Math.abs(first.y - second.y) <= 1, 'Partner cards share the first row');
          else assert.ok(second.y > first.y, 'Currency partner follows notaries on mobile');
          const link = page.locator('[data-partner="currencies-direct"] a');
          await expect(link).toHaveAttribute('href', 'https://www.currenciesdirect.com/partner/0201110000931505');
          await expect.poll(() => page.locator('[data-partner="currencies-direct"] img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `No horizontal page overflow: ${path}, ${width}`);
        const hrefs = await page.locator('main a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
        for (const href of hrefs) {
          if (!href?.startsWith('/') || href.startsWith('//') || href.startsWith('/api/') || checkedLinks.has(href)) continue;
          checkedLinks.add(href);
          assert.ok((await fetch(base + href)).status < 400, `Broken local link: ${href}`);
        }
        await page.screenshot({ path: `${output}/${lang}-${suffix.replaceAll('/', '-').slice(1) || 'home'}-${width}.png`, fullPage: true });
        results.push({ path, width, status: 200, responsive: true });
      }
    }

    await page.goto(base + '/fr/services');
    await page.locator('main a[data-conversion="buyer_contact"]').click();
    await expect(page).toHaveURL(base + '/fr/contact?projet=achat');
    await expect(page.locator('h1')).toContainText('recherche');
    assert.equal(await page.locator('form').evaluate(form => form.checkValidity()), false);
    let delivered;
    await page.route('**/api/contact', async route => {
      delivered = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.locator('#contact-name').fill('Local browser test');
    await page.locator('#contact-email').fill('local-test@example.org');
    await page.locator('#contact-message').fill('Only a local mocked test. No email is sent.');
    const response = page.waitForResponse(res => res.url().endsWith('/api/contact'));
    await page.locator('button[type="submit"]').click();
    await response;
    assert.ok(delivered.message.startsWith('[Achat]\n'));
    assert.equal(delivered.email, 'local-test@example.org');
    assert.deepEqual(errors, []);
    await context.close();
  }
} finally { await browser.close(); }

for (const lang of ['fr', 'en']) {
  const index = await fetch(`${base}/${lang}/actualites`);
  assert.equal(index.status, 200);
  assert.ok(!(await index.text()).includes('2026-01-01-sophia-antipolis-essor-ia-interface-trust'));
  const removed = await fetch(`${base}/${lang}/actualites/2026-01-01-sophia-antipolis-essor-ia-interface-trust`);
  assert.equal(removed.status, 404);
}
fs.writeFileSync(`${output}/results.json`, JSON.stringify({ passed: true, checks: results, links: [...checkedLinks], publishedArticles: published.length, duplicateTitles: false, januaryArticleStillWithdrawn: true, contact: 'mocked only; no actual email' }, null, 2));
console.log(JSON.stringify({ passed: true, pageChecks: results.length, linksChecked: checkedLinks.size, publishedArticles: published.length, contact: 'mocked only' }));
