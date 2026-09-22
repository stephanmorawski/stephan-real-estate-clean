'use client';

import { useState } from 'react';

export function ContactForm({ t }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
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
        body: JSON.stringify(form)
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
    <div className="grid gap-4">
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
