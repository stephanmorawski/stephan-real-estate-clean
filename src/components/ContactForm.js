'use client';

import { useState } from 'react';

export function ContactForm({ t, projectLabel = '', messagePlaceholder = '' }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (loading) return;
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFeedback(t.contact.error);
      return;
    }
    setLoading(true);
    setFeedback('');
    try {
      const payload = { ...form, message: projectLabel ? `[${projectLabel}]\n${form.message}` : form.message };
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
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

  return <form className="grid gap-4" onSubmit={onSubmit}>
    {projectLabel ? <p className="text-sm font-semibold">{projectLabel}</p> : null}
    <div><label htmlFor="contact-name" className="mb-2 block text-sm font-medium">{t.contact.name}</label><input id="contact-name" name="name" autoComplete="name" required maxLength={160} value={form.name} onChange={onChange}/></div>
    <div><label htmlFor="contact-email" className="mb-2 block text-sm font-medium">{t.contact.email}</label><input id="contact-email" type="email" name="email" autoComplete="email" required maxLength={254} value={form.email} onChange={onChange}/></div>
    <div><label htmlFor="contact-phone" className="mb-2 block text-sm font-medium">{t.contact.phone}</label><input id="contact-phone" type="tel" name="phone" autoComplete="tel" maxLength={50} value={form.phone} onChange={onChange}/></div>
    <div><label htmlFor="contact-message" className="mb-2 block text-sm font-medium">{t.contact.message}</label><textarea id="contact-message" rows="6" name="message" required maxLength={7600} placeholder={messagePlaceholder} value={form.message} onChange={onChange}/></div>
    <button type="submit" disabled={loading} className="btn-dark">{loading ? t.contact.sending : t.contact.submit}</button>
    {feedback ? <p className="text-sm" role="status" aria-live="polite">{feedback}</p> : null}
  </form>;
}
