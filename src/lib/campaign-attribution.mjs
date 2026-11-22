// One first-party campaign; no cookie, browser storage or advertising identifier.
export const CAMPAIGN = Object.freeze({
  utm_source: 'chatgpt',
  utm_medium: 'cpc',
  utm_campaign: 'caa_acquereurs_test',
  utm_content: 'annonce_01',
});
const MAX_AGE_MS = 30 * 60 * 1000;
let current = null;
let capturedAt = 0;

export function validateAttribution(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (!Object.entries(CAMPAIGN).every(([key, expected]) => value[key] === expected)) return null;
  return { ...CAMPAIGN };
}

export function captureCampaign(href, now = Date.now()) {
  try {
    const url = new URL(href);
    const attribution = validateAttribution(Object.fromEntries(url.searchParams));
    if (attribution) {
      current = attribution;
      capturedAt = now;
    }
  } catch {
    // Tracking must never interrupt browsing or form submission.
  }
  if (!current || now - capturedAt >= MAX_AGE_MS) {
    current = null;
    return null;
  }
  return { ...current };
}

export function getCampaignAttribution() {
  if (typeof window === 'undefined') return null;
  return captureCampaign(window.location.href);
}
