import { getMandatBySlug } from '@/lib/apimo';

const RATE_WINDOW_IP_MS = 15 * 60 * 1000;
const RATE_WINDOW_EMAIL_MS = 60 * 60 * 1000;
const RATE_LIMIT_IP = 5;
const RATE_LIMIT_EMAIL = 3;
const MAX_BODY_BYTES = 16 * 1024;

const rateStore = globalThis.__caaContactRateStore || new Map();
globalThis.__caaContactRateStore = rateStore;

function required(name, value) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function json(payload, status = 200, headers = {}) {
  return Response.json(payload, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      ...headers,
    },
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function cleanSingleLine(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function cleanMessage(value, maxLength) {
  return String(value || '')
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, maxLength);
}

function isValidEmail(value) {
  if (!value || value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

function allowedOrigins() {
  const allowed = new Set([
    'https://www.cotedazuragency.com',
    'https://cotedazuragency.com',
  ]);

  for (const host of [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    if (host && /^[a-z0-9.-]+\.vercel\.app$/i.test(host)) {
      allowed.add(`https://${host}`);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    allowed.add('http://localhost:3000');
  }

  return allowed;
}

function requestOriginAllowed(req) {
  const origin = req.headers.get('origin');
  if (!origin || !allowedOrigins().has(origin)) return false;

  const fetchSite = req.headers.get('sec-fetch-site');
  return !fetchSite || fetchSite === 'same-origin' || fetchSite === 'same-site';
}

function clientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  const first = forwarded.split(',')[0]?.trim();
  return (first || req.headers.get('x-real-ip') || 'unknown').slice(0, 64);
}

function consumeRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const recent = (rateStore.get(key) || []).filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= limit) {
    const retryAfterMs = windowMs - (now - recent[0]);
    rateStore.set(key, recent);
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  recent.push(now);
  rateStore.set(key, recent);

  if (rateStore.size > 5000) {
    for (const [storedKey, timestamps] of rateStore.entries()) {
      if (!timestamps.some((timestamp) => now - timestamp < RATE_WINDOW_EMAIL_MS)) {
        rateStore.delete(storedKey);
      }
      if (rateStore.size <= 4000) break;
    }
  }

  return { allowed: true, retryAfter: 0 };
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

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.access_token) {
    console.error('GRAPH_TOKEN_ERROR', { status: res.status });
    throw new Error('Unable to authenticate the email service');
  }

  return data.access_token;
}

async function sendMailViaGraph({ mailbox, from, replyTo, subject, html }) {
  const token = await getGraphToken();

  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}/sendMail`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    body: JSON.stringify({
      message: {
        subject,
        body: {
          contentType: 'HTML',
          content: html,
        },
        toRecipients: [
          {
            emailAddress: {
              address: mailbox,
            },
          },
        ],
        from: {
          emailAddress: {
            address: from,
          },
        },
        replyTo: replyTo
          ? [
              {
                emailAddress: {
                  address: replyTo,
                },
              },
            ]
          : [],
      },
      saveToSentItems: true,
    }),
  });

  if (!res.ok) {
    console.error('GRAPH_SENDMAIL_ERROR', { status: res.status });
    throw new Error('Unable to send the contact email');
  }
}

export async function POST(req) {
  try {
    if (!requestOriginAllowed(req)) {
      return json({ error: 'Request origin not allowed' }, 403);
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('application/json')) {
      return json({ error: 'Unsupported content type' }, 415);
    }

    const contentLength = Number.parseInt(req.headers.get('content-length') || '0', 10);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return json({ error: 'Request body too large' }, 413);
    }

    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return json({ error: 'Invalid request body' }, 400);
    }

    // Honeypot: silently accept automated submissions without sending an email.
    if (cleanSingleLine(body?.website, 200)) {
      return json({ ok: true });
    }

    const name = cleanSingleLine(body?.name, 120);
    const email = cleanSingleLine(body?.email, 254).toLowerCase();
    const phone = cleanSingleLine(body?.phone, 40);
    const message = cleanMessage(body?.message, 5000);
    const propertySlug = cleanSingleLine(body?.propertySlug, 200);
    const lang = body?.lang === 'en' ? 'en' : 'fr';

    if (name.length < 2 || !isValidEmail(email) || message.length < 10) {
      return json({ error: 'Invalid required fields' }, 400);
    }

    const ip = clientIp(req);
    const ipLimit = consumeRateLimit(`ip:${ip}`, RATE_LIMIT_IP, RATE_WINDOW_IP_MS);
    const emailLimit = consumeRateLimit(`email:${email}`, RATE_LIMIT_EMAIL, RATE_WINDOW_EMAIL_MS);

    if (!ipLimit.allowed || !emailLimit.allowed) {
      const retryAfter = Math.max(ipLimit.retryAfter, emailLimit.retryAfter);
      return json(
        { error: 'Too many contact requests' },
        429,
        { 'Retry-After': String(retryAfter) }
      );
    }

    let property = null;
    if (propertySlug) {
      try {
        property = await getMandatBySlug(propertySlug, lang);
      } catch (error) {
        console.error('CONTACT_PROPERTY_LOOKUP_ERROR', error);
      }
    }

    const mailbox = process.env.CONTACT_TO || 'contact@cotedazuragency.com';
    const from = process.env.CONTACT_FROM || 'contact@cotedazuragency.com';

    const propertyLabel = property
      ? [
          property.title,
          property.locationLabel,
          property.ref ? `Réf. ${property.ref}` : '',
        ].filter(Boolean).join(' — ')
      : '';

    const subject = propertyLabel
      ? `Demande bien — ${propertyLabel}`
      : `Nouveau message site web — ${name}`;

    const propertyUrl = property
      ? `https://www.cotedazuragency.com/${lang}/vente/${property.slug}`
      : '';

    const propertyHtml = property
      ? `
        <div style="margin:0 0 28px;padding:20px 22px;border:1px solid #ded5c6;border-radius:14px;background:#f7f4ef;">
          <div style="margin-bottom:7px;color:#a7864f;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">
            Bien concerné
          </div>
          <div style="font-size:20px;font-weight:600;color:#18181b;">
            ${escapeHtml(property.title)}
          </div>
          <div style="margin-top:7px;color:#52525b;font-size:14px;">
            ${escapeHtml([
              property.locationLabel,
              property.ref ? `Réf. ${property.ref}` : '',
            ].filter(Boolean).join(' · '))}
          </div>
          <div style="margin-top:13px;">
            <a href="${escapeHtml(propertyUrl)}" style="color:#18181b;font-size:13px;font-weight:600;text-decoration:underline;">
              Voir la fiche du bien
            </a>
          </div>
        </div>
      `
      : '';

    const html = `
      <div style="max-width:720px;font-family:Arial,sans-serif;line-height:1.6;color:#27272a;">
        <h2 style="margin:0 0 24px;color:#18181b;">
          Nouvelle demande — Côte d’Azur Agency
        </h2>

        ${propertyHtml}

        <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;font-size:15px;">
          <tr>
            <td style="padding:5px 20px 5px 0;font-weight:600;width:110px;">Nom</td>
            <td style="padding:5px 0;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding:5px 20px 5px 0;font-weight:600;">Email</td>
            <td style="padding:5px 0;">
              <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:5px 20px 5px 0;font-weight:600;">Téléphone</td>
            <td style="padding:5px 0;">${escapeHtml(phone || '-')}</td>
          </tr>
        </table>

        <div style="border-left:3px solid #C6A46C;padding-left:18px;">
          <div style="margin-bottom:8px;font-weight:600;">Message</div>
          <div style="white-space:pre-wrap;">${escapeHtml(message)}</div>
        </div>
      </div>
    `;

    await sendMailViaGraph({
      mailbox,
      from,
      replyTo: email,
      subject,
      html,
    });

    return json({ ok: true });
  } catch (error) {
    console.error('CONTACT_ROUTE_ERROR', error);
    return json(
      {
        error: 'Server error while sending email',
        details: process.env.NODE_ENV !== 'production'
          ? String(error?.message || error)
          : undefined,
      },
      500
    );
  }
}
