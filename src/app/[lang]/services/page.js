import { notFound } from 'next/navigation';
import { isLang, getDict } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { lang } = await params;

  return buildPageMetadata({
    title: lang === 'fr'
      ? 'Services immobiliers sur la Côte d’Azur | Côte d’Azur Agency'
      : 'Real Estate Services on the French Riviera | Côte d’Azur Agency',
    description: lang === 'fr'
      ? 'Vente, accompagnement achat villa, chasseur immobilier et estimation sur la Côte d’Azur.'
      : 'Sales advisory, villa buying support, property finder and valuation on the French Riviera.',
    lang,
    pathname: `/${lang}/services`
  });
}

export default async function ServicesPage({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = await getDict(lang);

  return (
    <main className="container py-16">
      <h1 className="font-luxe text-4xl">{t.services.title}</h1>
      <p className="mt-3 text-zinc-700">{t.services.lead}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {t.services.items.map((item) => (
          <div key={item} className="card-luxe p-6">{item}</div>
        ))}
      </div>
    </main>
  );
}
