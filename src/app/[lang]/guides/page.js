import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';
import { getAiGuides } from '@/lib/ai-guides';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  return buildPageMetadata({
    title: lang === 'fr'
      ? 'Guides immobiliers Côte d’Azur | Côte d’Azur Agency'
      : 'French Riviera Property Guides | Côte d’Azur Agency',
    description: lang === 'fr'
      ? 'Guides pratiques pour choisir un conseiller, comprendre le mandat de recherche, évaluer un bien et préparer un achat immobilier sur la Côte d’Azur.'
      : 'Practical guides to choosing an advisor, understanding a search mandate, valuing property and preparing a French Riviera purchase.',
    lang,
    pathname: `/${lang}/guides`,
  });
}

export default async function GuidesPage({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const guides = getAiGuides(lang);

  return (
    <main className="bg-[#f7f3ed]">
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a7541]">
            {lang === 'fr' ? 'Méthodes · décisions · sources officielles' : 'Methods · decisions · official sources'}
          </p>
          <h1 className="mt-4 font-luxe text-4xl leading-tight text-zinc-950 md:text-6xl">
            {lang === 'fr' ? 'Guides immobiliers Côte d’Azur' : 'French Riviera property guides'}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
            {lang === 'fr'
              ? 'Des réponses structurées aux questions les plus importantes avant de choisir un conseiller, signer un mandat, évaluer un prix ou acheter un bien sur la Côte d’Azur.'
              : 'Structured answers to the most important questions before choosing an advisor, signing a search mandate, assessing a price or buying property on the French Riviera.'}
          </p>
        </div>
      </section>

      <section className="container pb-16 md:pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <article
              key={guide.slug}
              className="flex flex-col rounded-[28px] bg-white p-7 shadow-soft ring-1 ring-[var(--gold-light)] md:p-9"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a7541]">
                {guide.kicker}
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-zinc-950">
                {guide.h1}
              </h2>
              <p className="mt-4 flex-1 text-sm leading-7 text-zinc-700">
                {guide.description}
              </p>
              <div className="mt-6">
                <Link
                  href={`/${guide.lang}/guides/${guide.slug}`}
                  className="inline-flex rounded-full border border-zinc-900 px-6 py-3 text-sm font-medium text-zinc-900"
                >
                  {lang === 'fr' ? 'Lire le guide' : 'Read the guide'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
