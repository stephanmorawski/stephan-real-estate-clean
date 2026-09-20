const MAX_BODY_BYTES = 16 * 1024;

export class ContactInputError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function readContactInput(request) {
  const origin = request.headers.get('origin');
  const allowedOrigins = new Set([
    new URL(request.url).origin,
    'https://cotedazuragency.com',
    'https://www.cotedazuragency.com',
  ]);
  if ((origin && !allowedOrigins.has(origin)) || request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new ContactInputError('Origin not allowed', 403);
  }
  if (!/^application\/json(?:\s*;|\s*$)/i.test(request.headers.get('content-type') || '')) {
    throw new ContactInputError('JSON content type required', 415);
  }
  const declared = request.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > MAX_BODY_BYTES)) {
    throw new ContactInputError('Request body too large', 413);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new ContactInputError('Request body required');
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new ContactInputError('Request body too large', 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  let body;
  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new ContactInputError('Invalid JSON');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ContactInputError('Invalid form');
  const limits = { name: 160, email: 254, phone: 50, message: 8000 };
  const result = {};
  for (const [field, max] of Object.entries(limits)) {
    const value = body[field] ?? '';
    if (typeof value !== 'string' || value.length > max) throw new ContactInputError(`Invalid ${field}`);
    result[field] = value.trim();
  }
  if (!result.name || !result.email || !result.message) throw new ContactInputError('Missing required fields');
  if (/[\r\n\u0000]/.test(result.name + result.email + result.phone) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(result.email)) {
    throw new ContactInputError('Invalid contact details');
  }
  return result;
}
