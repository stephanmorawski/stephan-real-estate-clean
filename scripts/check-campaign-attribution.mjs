import assert from 'node:assert/strict';
import { CAMPAIGN, captureCampaign, validateAttribution } from '../src/lib/campaign-attribution.mjs';

const query = new URLSearchParams(CAMPAIGN);
const start = 100000;
assert.equal(captureCampaign('https://www.cotedazuragency.com/fr', start), null);
assert.equal(validateAttribution({ ...CAMPAIGN, utm_source: 'google' }), null);
assert.equal(validateAttribution({ utm_source: 'chatgpt' }), null);
assert.equal(validateAttribution([]), null);
assert.deepEqual(validateAttribution({ ...CAMPAIGN, email: 'private@example.com', click_id: 'secret' }), CAMPAIGN);
assert.deepEqual(captureCampaign('https://www.cotedazuragency.com/fr/vente?' + query, start), CAMPAIGN);
assert.deepEqual(captureCampaign('https://www.cotedazuragency.com/fr/contact?email=private@example.com', start + 1000), CAMPAIGN);
assert.deepEqual(captureCampaign('invalid URL', start + 2000), CAMPAIGN);
const copy = captureCampaign('https://www.cotedazuragency.com/fr', start + 3000);
copy.utm_source = 'changed';
assert.deepEqual(captureCampaign('https://www.cotedazuragency.com/fr', start + 4000), CAMPAIGN);
assert.equal(captureCampaign('https://www.cotedazuragency.com/fr', start + 30 * 60 * 1000), null);
console.log('Campaign attribution: validation, internal navigation, privacy and expiry passed.');
