// Read-only AI discoverability checks. This does not measure recommendations in AI answers.
const base = 'https://www.cotedazuragency.com';
const checks = [];
async function check(path, validate) {
  try {
    const response = await fetch(base + path, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    const body = await response.text();
    const result = validate(response, body);
    checks.push({ path, ok: response.ok && result.ok, details: result.details });
  } catch (error) {
    checks.push({ path, ok: false, details: String(error) });
  }
}
await check('/robots.txt', (r, body) => ({
  ok: /OAI-SearchBot|User-agent:\s*\*/i.test(body) && /sitemap:/i.test(body),
  details: 'Robots rules and sitemap declaration; manually review bot-specific disallows',
}));
await check('/sitemap.xml', (r, body) => ({
  ok: /<urlset/i.test(body) && /\/fr\//.test(body) && /\/en\//.test(body),
  details: 'XML sitemap contains French and English URLs',
}));
await check('/fr', (r, body) => ({
  ok: /application\/ld\+json/.test(body) && /RealEstateAgent/.test(body) && !/<meta[^>]+noindex/i.test(body),
  details: 'French homepage exposes agency JSON-LD and no obvious meta noindex',
}));
await check('/en', (r, body) => ({
  ok: /application\/ld\+json/.test(body) && /RealEstateAgent/.test(body) && !/<meta[^>]+noindex/i.test(body),
  details: 'English homepage exposes agency JSON-LD and no obvious meta noindex',
}));
await check('/llms.txt', (r, body) => ({
  ok: /Côte d’Azur Agency/.test(body) && /sitemap\.xml/.test(body),
  details: 'Optional AI-oriented reference file available (not a ranking signal)',
}));
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), site: base, checks, passed: checks.every(x => x.ok), limitation: 'This checks technical discoverability only; it cannot prove AI citations or recommendations.' }, null, 2));
if (checks.some(x => !x.ok)) process.exitCode = 1;
