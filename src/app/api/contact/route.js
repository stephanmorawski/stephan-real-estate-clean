import { ContactInputError, readContactInput } from '../../../lib/contact-security.mjs';

function required(name, value) {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function getGraphToken() {
  const tenantId = required('AZURE_TENANT_ID', process.env.AZURE_TENANT_ID);
  const clientId = required('AZURE_CLIENT_ID', process.env.AZURE_CLIENT_ID);
  const clientSecret = required('AZURE_CLIENT_SECRET', process.env.AZURE_CLIENT_SECRET);
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });
  const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!res.ok || !data?.access_token) throw new Error(`Graph token request failed: ${res.status}`);
  return data.access_token;
}

async function sendMailViaGraph({ mailbox, from, replyTo, subject, html }) {
  const token = await getGraphToken();
  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: 'HTML', content: html },
        toRecipients: [{ emailAddress: { address: mailbox } }],
        from: { emailAddress: { address: from } },
        replyTo: replyTo ? [{ emailAddress: { address: replyTo } }] : [],
      },
      saveToSentItems: true,
    }),
  });
  if (!res.ok) throw new Error(`Graph sendMail request failed: ${res.status}`);
}

export async function POST(req) {
  try {
    const { name, email, phone, message } = await readContactInput(req);
    const mailbox = process.env.CONTACT_TO || 'contact@cotedazuragency.com';
    const from = process.env.CONTACT_FROM || 'contact@cotedazuragency.com';
    const subject = `Nouveau message site web - ${name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Nouveau message depuis le site Côte d’Azur Agency</h2>
        <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
        <p><strong>Email :</strong> ${escapeHtml(email)}</p>
        <p><strong>Téléphone :</strong> ${escapeHtml(phone || '-')}</p>
        <p><strong>Message :</strong></p>
        <div style="white-space: pre-wrap;">${escapeHtml(message)}</div>
      </div>
    `;
    await sendMailViaGraph({ mailbox, from, replyTo: email, subject, html });
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    if (e instanceof ContactInputError) {
      return Response.json({ error: e.message }, { status: e.status, headers: { 'Cache-Control': 'no-store' } });
    }
    console.error('CONTACT_ROUTE_ERROR', e instanceof Error ? e.message : 'Unknown error');
    return Response.json({ error: 'Server error while sending email' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
