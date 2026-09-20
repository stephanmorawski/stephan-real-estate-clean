import test from 'node:test';
import assert from 'node:assert/strict';
import { readContactInput, ContactInputError } from '../src/lib/contact-security.mjs';
import { POST } from '../src/app/api/contact/route.js';

const valid = { name: 'Security test', email: 'test@example.org', phone: '', message: 'A local test only.' };
function request(body = valid, headers = {}) {
  return new Request('https://www.cotedazuragency.com/api/contact', {
    method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://www.cotedazuragency.com', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}
async function rejects(req, status) {
  await assert.rejects(() => readContactInput(req), error => error instanceof ContactInputError && error.status === status);
}

test('accepts normal contact input', async () => assert.deepEqual(await readContactInput(request()), valid));
test('rejects external origin', async () => rejects(request(valid, { origin: 'https://untrusted.example' }), 403));
test('rejects cross-site request metadata', async () => rejects(request(valid, { 'sec-fetch-site': 'cross-site' }), 403));
test('rejects non-JSON submission', async () => rejects(request(valid, { 'content-type': 'text/plain' }), 415));
test('rejects oversized declared payload', async () => rejects(request(valid, { 'content-length': '999999' }), 413));
test('bounds streamed bodies without content-length', async () => rejects(request('x'.repeat(17000)), 413));
test('rejects malformed JSON', async () => rejects(request('{'), 400));
test('rejects array form data', async () => rejects(request([]), 400));
test('rejects invalid email', async () => rejects(request({ ...valid, email: 'not-an-email' }), 400));
test('rejects control characters', async () => rejects(request({ ...valid, name: 'Name\r\nInjected' }), 400));
test('rejects excessive fields', async () => rejects(request({ ...valid, message: 'x'.repeat(8001) }), 400));
test('invalid form does not contact the mail provider', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('Network forbidden in this test'); };
  try { assert.equal((await POST(request({ ...valid, email: 'bad' }))).status, 400); assert.equal(calls, 0); }
  finally { globalThis.fetch = original; }
});
test('valid mail flow preserves escaping and fixed recipient with mocked Graph', async () => {
  const original = globalThis.fetch;
  const names = ['AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET'];
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
  names.forEach(name => { process.env[name] = 'local-test-placeholder'; });
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    return requests.length === 1 ? Response.json({ access_token: 'not-a-real-token' }) : new Response(null, { status: 202 });
  };
  try {
    const result = await POST(request({ ...valid, name: '<b>Test</b>', message: '<script>test</script>' }));
    assert.equal(result.status, 200);
    assert.equal(requests.length, 2);
    const message = JSON.parse(requests[1].options.body).message;
    assert.equal(message.toRecipients[0].emailAddress.address, process.env.CONTACT_TO || 'contact@cotedazuragency.com');
    assert.equal(message.replyTo[0].emailAddress.address, valid.email);
    assert.ok(message.body.content.includes('&lt;script&gt;'));
    assert.ok(!message.body.content.includes('<script>'));
  } finally {
    globalThis.fetch = original;
    for (const name of names) { if (previous[name] === undefined) delete process.env[name]; else process.env[name] = previous[name]; }
  }
});
