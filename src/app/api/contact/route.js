import { getMandatBySlug } from '@/lib/apimo';

function required(name, value) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
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

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();

  if (!res.ok || !data?.access_token) {
    throw new Error(`Graph token error: ${JSON.stringify(data)}`);
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
    const errText = await res.text();
    throw new Error(`Graph sendMail error: ${res.status} ${errText}`);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim();
    const phone = String(body?.phone || '').trim();
    const message = String(body?.message || '').trim();
    const propertySlug = String(body?.propertySlug || '').trim();
    const lang = body?.lang === 'en' ? 'en' : 'fr';

    if (!name || !email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let property = null;

    if (propertySlug) {
      try {
        property = await getMandatBySlug(propertySlug, lang);
      } catch (e) {
        console.error('CONTACT_PROPERTY_LOOKUP_ERROR', e);
      }
    }

    const mailbox = process.env.CONTACT_TO || 'contact@cotedazuragency.com';
    const from = process.env.CONTACT_FROM || 'contact@cotedazuragency.com';

    const propertyLabel = property
      ? [
          property.title,
          property.locationLabel,
          property.ref ? `Réf. ${property.ref}` : ''
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
              property.ref ? `Réf. ${property.ref}` : ''
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

    return Response.json({ ok: true });
  } catch (e) {
    console.error('CONTACT_ROUTE_ERROR', e);
    return Response.json(
      {
        error: 'Server error while sending email',
        details: process.env.NODE_ENV !== 'production' ? String(e?.message || e) : undefined,
      },
      { status: 500 }
    );
  }
}
