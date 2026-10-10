'use client';

import { useState } from 'react';

function formatPrice(value, lang) {
  if (!value) return '';

  try {
    return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  } catch {
    return `${value} €`;
  }
}

export function ContactForm({ t, lang = 'fr', property = null }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function onSubmit() {
    if (!form.name || !form.email || !form.message) {
      setFeedback(t.contact.error);
      return;
    }

    setLoading(true);
    setFeedback('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lang,
          propertySlug: property?.slug || ''
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');

      setFeedback(t.contact.success);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setFeedback(t.contact.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      {property ? (
        <div className="mb-2 overflow-hidden rounded-[24px] border border-[#e5ded2] bg-[#f7f4ef]">
          <div className="grid sm:grid-cols-[150px_1fr]">
            {property.image ? (
              <div className="h-[150px] sm:h-full">
                <img
                  src={property.image}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <div className="p-5 sm:p-6">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#C6A46C]">
                {lang === 'fr' ? 'Votre demande concerne' : 'Your enquiry concerns'}
              </div>

              <div className="mt-2 font-luxe text-2xl leading-tight text-zinc-900">
                {property.title}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-sm text-zinc-600">
                {property.location ? <span>{property.location}</span> : null}
                {property.ref ? (
                  <span>· {lang === 'fr' ? 'Réf.' : 'Ref.'} {property.ref}</span>
                ) : null}
              </div>

              {property.price ? (
                <div className="mt-3 text-lg font-medium text-zinc-900">
                  {formatPrice(property.price, lang)}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-medium">{t.contact.name}</label>
        <input name="name" value={form.name} onChange={onChange} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">{t.contact.email}</label>
        <input type="email" name="email" value={form.email} onChange={onChange} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">{t.contact.phone}</label>
        <input name="phone" value={form.phone} onChange={onChange} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">{t.contact.message}</label>
        <textarea rows="5" name="message" value={form.message} onChange={onChange} />
      </div>

      <button type="button" onClick={onSubmit} disabled={loading} className="btn-dark">
        {loading ? t.contact.sending : t.contact.submit}
      </button>

      {feedback ? <p className="text-sm">{feedback}</p> : null}
    </div>
  );
}
