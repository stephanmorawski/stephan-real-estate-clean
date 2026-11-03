# Homepage reference integration — 3 November 2026

Reference: `Cote_d_Azur_Agency_accueil_avec_avis_actualites.html`, attachment to the linked conversation “Mise en production autonome”. The standalone document was inspected, not installed as the application.

The existing Next.js homepage now uses the reference's personal introduction, portrait, testimonial, and three-news layout in French and English. Existing routing, metadata, shared navigation, local expertise links and published-news loader remain in use. Homepage styling is scoped with `.home-page` and `body:has(.home-page)`.

## Content provenance

- Hero and portrait: existing `/images/hero-pool.jpg` and `/images/founder.jpg` (same imagery as the reference).
- Maggie Evans: approved, published `content/news/2026-10-27-temoignage-client-confiance.json`; publication authorization and original image provenance in `content/news-drafts/2026-10-27-client-testimonial-maggie.json`.
- French quotation: exact excerpt of the published French testimonial.
- English quotation: exact excerpt of the supplied, unmodified `public/news/2026-10-27-maggie-google.png`, visually inspected.
- Five stars describe this individual review. No current aggregate rating, review count or aggregate-rating structured data has been added. The reference's “18 reviews” is not independently supported; the older approved news artwork remains unmodified.
- News: latest three published entries from `getAllNews(lang)`, not hardcoded copies. At integration: Biot (29 October), Maggie (27 October), Nice flights (26 October). Drafts are excluded. Testimonial/partner artwork uses `object-fit: contain`.

## Verification

`npm ci` and `npm run build`; targeted ESLint using the installed Next.js flat configuration; `git diff --check`.

The repository's existing `npm run lint` expects a missing ESLint 9 flat configuration. Targeted lint runs use `artifacts/homepage/eslint.config.mjs`; only existing-style `no-img-element` warnings are permitted. Local build completes while reporting missing local APIMO credentials for sale sitemap generation; production uses its existing environment.

Browser QA: install Playwright without changing the package manifest or lockfile, then run `node scripts/check-homepage.mjs`. Uses installed Chrome by default; `PLAYWRIGHT_CHANNEL=chromium` selects bundled Chromium. `SITE_URL` and `QA_OUTPUT` select the target and evidence folder.

Both languages are tested at 390, 768 and 1440 px: HTTP 200, document language, single H1, no horizontal overflow, loaded homepage images, three working news destinations, no page errors, no header/hero text overlap, contact action, approach anchor and language switch. Full-page screenshots and JSON are generated. Production verification also matches `/api/version` against the exact deployed commit, Vercel READY state and domain aliases.
