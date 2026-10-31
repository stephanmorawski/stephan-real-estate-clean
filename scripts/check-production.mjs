import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const base = (process.env.SITE_URL || 'https://www.cotedazuragency.com').replace(/\/$/, '');
const expectedSha = (process.env.EXPECTED_SHA || '').trim();
const dir = 'artifacts/post-production';

fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });

const failures = [];
const evidence = {
  base,
  expectedSha: expectedSha || null,
  startedAt: new Date().toISOString(),
  version: null,
  changedFiles: [],
  assets: [],
  httpRoutes: [],
  browserPages: [],
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const safe = (value) => value.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'root';

function isEditorialPhoto(src = '') {
  return /\/news\//.test(src) &&
    !/partner|logo|financer|omage|maggie-google|partenariat-financement-2026-10-17/i.test(src);
}

function brandIssues({
  src = '',
  objectFit = '',
  renderedHeight = 0,
  parentHeight = 0,
  parentBg = '',
  imgBg = '',
}) {
  const out = [];
  const brand = /partner|logo|financer|omage/i.test(src);

  if (brand && objectFit === 'cover') {
    out.push('brand asset uses object-cover');
  }

  if (
    /partenariat-financement-2026-10-17/i.test(src) &&
    parentHeight - renderedHeight > 3
  ) {
    out.push('partner card media cell stretches below artwork');
  }

  if (
    /partenariat-financement-2026-10-17/i.test(src) &&
    parentHeight - renderedHeight > 3 &&
    !(/255, 255, 255/.test(parentBg) && /255, 255, 255/.test(imgBg))
  ) {
    out.push('visible non-white area below partner artwork');
  }

  return out;
}

// The CAA financing partnership banner is artwork, not editorial photography.
assert.equal(isEditorialPhoto('/news/partenariat-financement-2026-10-17-fr.png'), false);
assert.equal(isEditorialPhoto('/news/partenariat-financement-2026-10-17-en.png'), false);
assert.equal(isEditorialPhoto('/news/biot-village-art-nature.jpg'), true);

// Self-tests prove that known negative visual patterns are rejected.
assert.deepEqual(
  brandIssues({ src: '/news/omage-logo.png', objectFit: 'cover' }),
  ['brand asset uses object-cover']
);
assert.deepEqual(
  brandIssues({
    src: '/news/partenariat-financement-2026-10-17-fr.png',
    objectFit: 'fill',
    renderedHeight: 238,
    parentHeight: 374,
    parentBg: 'rgb(255, 255, 255)',
    imgBg: 'rgb(255, 255, 255)',
  }),
  ['partner card media cell stretches below artwork']
);
assert.deepEqual(
  brandIssues({
    src: '/news/partenariat-financement-2026-10-17-fr.png',
    objectFit: 'fill',
    renderedHeight: 238,
    parentHeight: 238,
    parentBg: 'rgb(255, 255, 255)',
    imgBg: 'rgb(255, 255, 255)',
  }),
  []
);

try {
  evidence.changedFiles = execFileSync(
    'git',
    ['diff', '--name-only', 'HEAD^', 'HEAD'],
    { encoding: 'utf8' }
  )
    .trim()
    .split('\n')
    .filter(Boolean);
} catch {
  evidence.changedFiles = [];
}

const qaOnlyChange = evidence.changedFiles.length > 0 &&
  evidence.changedFiles.every((file) => file === 'scripts/check-production.mjs');
evidence.qaOnlyChange = qaOnlyChange;

// A QA-script-only commit changes the verifier, not the deployed website.
// Preserve exact-SHA enforcement for all changes that can affect production content.
if (expectedSha && !qaOnlyChange) {
  let matched = false;

  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await fetch(`${base}/api/version`, { cache: 'no-store' });
      if (response.ok) {
        const version = await response.json();
        evidence.version = version;
        if (version.commitSha === expectedSha) {
          matched = true;
          break;
        }
      }
    } catch {
      // Retry while the deployment alias propagates.
    }

    await sleep(10_000);
  }

  if (!matched) {
    failures.push(
      `deployed commit mismatch: expected ${expectedSha}, got ${evidence.version?.commitSha || 'unavailable'}`
    );
  }
}

const expectedAssets = [
  {
    path: '/news/partenariat-financement-2026-10-17-fr.png',
    contentType: 'image/png',
    bytes: 1986059,
    sha256: '3fcfc687e600cf03c54dc1fd87d70303716dcd3460ce66b08f1704ea129e714d',
  },
  {
    path: '/news/partenariat-financement-2026-10-17-en.png',
    contentType: 'image/png',
    bytes: 2120041,
    sha256: 'b61aaeaa89cbd4e00f245549efd31279ca0b3b0d289cdab770329c9e9d78033e',
  },
];

for (const asset of expectedAssets) {
  try {
    const response = await fetch(`${base}${asset.path}`, { cache: 'no-store' });
    const buffer = Buffer.from(await response.arrayBuffer());
    const result = {
      ...asset,
      status: response.status,
      servedType: response.headers.get('content-type'),
      servedBytes: buffer.length,
      servedSha256: sha256(buffer),
    };

    evidence.assets.push(result);

    if (response.status !== 200) {
      failures.push(`${asset.path}: HTTP ${response.status}`);
    }
    if (!result.servedType?.startsWith(asset.contentType)) {
      failures.push(`${asset.path}: content-type ${result.servedType}`);
    }
    if (buffer.length !== asset.bytes) {
      failures.push(`${asset.path}: bytes ${buffer.length} != ${asset.bytes}`);
    }
    if (result.servedSha256 !== asset.sha256) {
      failures.push(`${asset.path}: SHA256 mismatch`);
    }
  } catch (error) {
    failures.push(`${asset.path}: ${error.message}`);
  }
}

const newsDir = 'content/news';
const articles = [];

if (fs.existsSync(newsDir)) {
  for (const file of fs.readdirSync(newsDir).filter((name) => name.endsWith('.json')).sort()) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(newsDir, file), 'utf8'));
      if (data.status === 'draft') continue;

      articles.push({
        file,
        slug: file.replace(/\.json$/, ''),
        data,
      });
    } catch (error) {
      failures.push(`${file}: invalid JSON ${error.message}`);
    }
  }
}

// Every published FR/EN article must be reachable and contain the expected localized title.
for (const { slug, data } of articles) {
  for (const lang of ['fr', 'en']) {
    const route = `/${lang}/actualites/${slug}`;

    try {
      const response = await fetch(`${base}${route}`, {
        redirect: 'follow',
        cache: 'no-store',
      });
      const html = await response.text();
      const expectedTitle = data[lang]?.title;
      const record = {
        route,
        status: response.status,
        titlePresent: expectedTitle ? html.includes(expectedTitle) : null,
      };

      evidence.httpRoutes.push(record);

      if (response.status !== 200) {
        failures.push(`${route}: HTTP ${response.status}`);
      }
      if (expectedTitle && !record.titlePresent) {
        failures.push(`${route}: localized title missing`);
      }
    } catch (error) {
      failures.push(`${route}: ${error.message}`);
    }
  }
}

const browserSet = new Set([
  '/fr',
  '/en',
  '/fr/actualites',
  '/en/actualites',
  '/fr/services',
  '/en/services',
  '/fr/contact',
  '/en/contact',
  '/fr/agence/partenaires',
  '/en/agence/partenaires',
  '/fr/actualites/2026-10-15-partenariat-vousfinancer-omage',
  '/en/actualites/2026-10-15-partenariat-vousfinancer-omage',
]);

// Add all article routes and list pages impacted by the deployed commit.
for (const file of evidence.changedFiles) {
  const match = file.match(/^content\/news\/(.+)\.json$/);
  if (match) {
    browserSet.add(`/fr/actualites/${match[1]}`);
    browserSet.add(`/en/actualites/${match[1]}`);
  }

  if (file.startsWith('public/news/')) {
    const name = path.basename(file);
    for (const article of articles) {
      if (JSON.stringify(article.data).includes(name)) {
        browserSet.add(`/fr/actualites/${article.slug}`);
        browserSet.add(`/en/actualites/${article.slug}`);
      }
    }
  }

  if (
    file.includes('actualites') ||
    file.endsWith('.css') ||
    file.includes('src/lib/news')
  ) {
    browserSet.add('/fr/actualites');
    browserSet.add('/en/actualites');
  }
}

const browserPages = [...browserSet];
const launchOptions = {
  headless: true,
  ...(process.env.CHROME_PATH
    ? {
        executablePath: process.env.CHROME_PATH,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      }
    : {}),
};

for (const [device, viewport] of Object.entries({
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
})) {
  for (const pagePath of browserPages) {
    // A fresh browser per page bounds memory use for full-page screenshots.
    const browser = await chromium.launch(launchOptions);
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const label = `${safe(pagePath)}_${device}`;
    const errors = [];
    const badResponses = [];

    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (
        response.url().startsWith(base) &&
        response.status() >= 400 &&
        ['document', 'image', 'script', 'stylesheet'].includes(response.request().resourceType())
      ) {
        badResponses.push(`${response.status()} ${response.url()}`);
      }
    });

    try {
      const response = await page.goto(`${base}${pagePath}`, {
        waitUntil: 'networkidle',
        timeout: 60_000,
      });

      if (!response || response.status() >= 400) {
        failures.push(`${label}: HTTP ${response?.status()}`);
      }

      await page.evaluate(async () => {
        const step = Math.max(300, Math.floor(innerHeight * 0.75));
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 25));
        }
        scrollTo(0, 0);
        await Promise.all(
          [...document.images].map((image) => image.decode?.().catch(() => null))
        );
      });

      const evaluated = await page.evaluate(() => {
        const strings = [];
        const images = [];
        // Desktop editorial cards must retain the shared 320px media column.
        // A special layout for one story is a production regression.
        if (innerWidth >= 768 && /\/(fr|en)\/actualites$/.test(location.pathname)) {
          for (const card of document.querySelectorAll('article.card-luxe')) {
            const mediaCell = card.querySelector('.grid > div:first-child');
            const mediaImage = mediaCell?.querySelector('img');
            if (!mediaCell || !mediaImage) continue;
            const width = mediaCell.getBoundingClientRect().width;
            if (Math.abs(width - 320) > 3) {
              strings.push(`inconsistent news card media width: ${Math.round(width)}px (expected 320px)`);
            }
            if (/2026-10-29-biot-place-des-arcades/.test(mediaImage.getAttribute('src') || '')) {
              const style = getComputedStyle(mediaImage);
              if (style.objectFit !== 'cover') {
                strings.push('Biot image must cover the card media area');
              }
            }
          }
        }

        if (document.documentElement.scrollWidth > innerWidth + 3) {
          strings.push(
            `horizontal overflow ${document.documentElement.scrollWidth - innerWidth}px`
          );
        }

        for (const image of document.images) {
          const rect = image.getBoundingClientRect();
          const parent = image.parentElement;
          const parentRect = parent?.getBoundingClientRect();
          const style = getComputedStyle(image);
          const parentStyle = parent ? getComputedStyle(parent) : null;

          images.push({
            src: image.getAttribute('src') || image.currentSrc,
            complete: image.complete,
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
            renderedWidth: rect.width,
            renderedHeight: rect.height,
            parentHeight: parentRect?.height || 0,
            newsCardMedia: Boolean(image.closest('article.card-luxe') && image.closest('article.card-luxe')?.parentElement?.classList.contains('grid')),
            objectFit: style.objectFit,
            parentBg: parentStyle?.backgroundColor || '',
            imgBg: style.backgroundColor,
          });
        }

        return { strings, images };
      });

      const record = {
        path: pagePath,
        device,
        status: response?.status(),
        errors,
        badResponses,
        images: evaluated.images,
      };

      evidence.browserPages.push(record);

      for (const issue of evaluated.strings) {
        failures.push(`${label}: ${issue}`);
      }
      for (const image of record.images) {
        if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
          failures.push(`${label}: broken image ${image.src}`);
        }
        // Editorial photography must fill its allocated card media cell;
        // logos and explicitly contained brand artworks are intentionally exempt.
        if (
          pagePath.endsWith('/actualites') &&
          image.newsCardMedia &&
          isEditorialPhoto(image.src) &&
          (image.objectFit !== 'cover' || image.parentHeight - image.renderedHeight > 3)
        ) {
          failures.push(`${label}: news photo does not fill card media cell: ${image.src}`);
        }
        for (const issue of brandIssues(image)) {
          failures.push(`${label}: ${issue}: ${image.src}`);
        }
      }
      for (const error of errors) {
        failures.push(`${label}: JS ${error}`);
      }
      for (const error of badResponses) {
        failures.push(`${label}: resource ${error}`);
      }

      await page.screenshot({
        path: path.join(dir, `${label}.png`),
        fullPage: true,
      });
    } catch (error) {
      failures.push(`${label}: ${error.message}`);
    } finally {
      await context.close();
      await browser.close();
    }
  }
}

evidence.finishedAt = new Date().toISOString();
evidence.failures = failures;
fs.writeFileSync(
  path.join(dir, 'report.json'),
  JSON.stringify(evidence, null, 2)
);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Production QA passed: ${articles.length * 2} article routes, ${browserPages.length} browser pages x 2 viewports, ${expectedAssets.length} binary assets`
  );
}
