import Link from 'next/link';
import { getSeoPages } from '@/lib/seo-pages';

const methodology = {
  fr: {
    title: 'Une lecture locale avant toute décision',
    paragraphs: [
      'Sur la Côte d’Azur, deux biens proches géographiquement peuvent avoir des valeurs et des profils d’acheteurs très différents. La micro-localisation, la qualité de l’accès, l’exposition, la vue, le calme, les prestations, l’état technique et la proximité des écoles ou des principaux bassins d’emploi doivent être analysés ensemble. Cette lecture locale permet d’éviter les comparaisons trop générales et de positionner plus précisément un projet d’achat, de vente ou d’estimation.',
      'Côte d’Azur Agency privilégie une approche sélective : qualification du besoin, analyse du secteur, comparaison des biens réellement concurrents, vérification des critères déterminants puis accompagnement jusqu’aux étapes de négociation et de transaction. Pour les vendeurs, l’objectif est de construire un positionnement cohérent avec le marché. Pour les acquéreurs, il s’agit de réduire le bruit et de concentrer les visites sur les biens les plus pertinents.',
    ],
    checklistTitle: 'Critères étudiés',
    checklist: [
      'micro-localisation, accès et environnement immédiat',
      'vue, exposition, calme et qualité des extérieurs',
      'état du bien, rénovation, prestations et potentiel',
      'cohérence du prix avec les références comparables',
      'liquidité future et attractivité auprès des acheteurs ciblés',
    ],
    relatedTitle: 'Explorer les secteurs et expertises associées',
    relatedIntro: 'Ces pages complètent l’analyse locale et permettent de comparer les principaux micro-marchés couverts par l’agence.',
    ctaTitle: 'Un projet immobilier sur la Côte d’Azur ?',
    ctaBody: 'Présentez-nous votre recherche, votre bien ou votre besoin d’estimation. Nous vous répondrons avec une première lecture du secteur et des prochaines étapes utiles.',
  },
  en: {
    title: 'Local market analysis before any decision',
    paragraphs: [
      'On the French Riviera, two properties located only a few kilometres apart can have very different values and buyer profiles. Micro-location, access, orientation, views, privacy, condition, amenities, proximity to international schools and travel time to Nice airport all influence marketability. A structured local analysis helps buyers and sellers avoid broad comparisons and focus on the criteria that actually drive demand.',
      'Côte d’Azur Agency follows a selective process: clarify the brief, assess the micro-market, compare relevant competing properties, identify the decisive value factors and support the transaction through negotiation. For sellers, the objective is a market position that is credible and defensible. For buyers, the objective is to reduce noise and concentrate viewings on properties that genuinely match the required lifestyle, location and long-term value profile.',
    ],
    checklistTitle: 'Key criteria reviewed',
    checklist: [
      'micro-location, access and immediate surroundings',
      'views, orientation, privacy and outdoor spaces',
      'property condition, renovation quality and amenities',
      'pricing versus relevant competing properties',
      'future liquidity and appeal to the target buyer profile',
    ],
    relatedTitle: 'Explore related French Riviera expertise',
    relatedIntro: 'These pages provide additional context on the main locations and property searches covered by the agency.',
    ctaTitle: 'Planning a French Riviera property project?',
    ctaBody: 'Tell us about your search, property or valuation requirement. We will provide an initial view of the relevant market and the most useful next steps.',
  },
};

export default function SeoLandingPage({ page, lang }) {
  const contactHref = `/${lang}/contact`;
  const saleHref = `/${lang}/vente`;
  const copy = methodology[lang] || methodology.fr;
  const relatedPages = getSeoPages().filter(
    (candidate) => candidate.lang === lang && candidate.slug !== page.slug,
  );

  return (
    <main className="bg-[#f7f3ed]">
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#C6A46C]">
            {page.kicker}
          </p>
          <h1 className="font-luxe text-4xl leading-tight text-zinc-950 md:text-6xl">
            {page.h1}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-zinc-700">
            {page.lead}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={contactHref} className="rounded-full bg-zinc-950 px-7 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white">
              {page.cta}
            </Link>
            <Link href={saleHref} className="rounded-full border border-zinc-950 px-7 py-3 text-sm font-medium uppercase tracking-[0.14em] text-zinc-950">
              {lang === 'fr' ? 'Voir les biens' : 'View properties'}
            </Link>
          </div>
        </div>
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {page.sections.map((section) => (
            <article key={section.heading} className="rounded-[28px] bg-white p-7 shadow-soft ring-1 ring-[var(--gold-light)]">
              <h2 className="text-xl font-semibold leading-tight text-zinc-950">
                {section.heading}
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-700">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.5fr_1fr]">
          <article className="rounded-[28px] bg-white p-7 shadow-soft ring-1 ring-[var(--gold-light)] md:p-9">
            <h2 className="text-2xl font-semibold leading-tight text-zinc-950">
              {copy.title}
            </h2>
            {copy.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-5 text-[15px] leading-7 text-zinc-700">
                {paragraph}
              </p>
            ))}
          </article>

          <aside className="rounded-[28px] bg-zinc-950 p-7 text-white shadow-soft md:p-9">
            <h2 className="text-xl font-semibold">{copy.checklistTitle}</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-200">
              {copy.checklist.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="text-[#C6A46C]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="mx-auto max-w-6xl rounded-[28px] bg-white p-7 shadow-soft ring-1 ring-[var(--gold-light)] md:p-9">
          <h2 className="text-2xl font-semibold text-zinc-950">{copy.relatedTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-700">{copy.relatedIntro}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPages.map((related) => (
              <Link
                key={related.slug}
                href={`/${related.lang}/${related.slug}`}
                className="rounded-2xl border border-zinc-200 px-5 py-4 text-sm font-medium text-zinc-900 transition hover:border-zinc-400"
              >
                {related.h1}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="mx-auto max-w-5xl rounded-[28px] bg-white p-7 shadow-soft ring-1 ring-[var(--gold-light)]">
          <h2 className="text-lg font-semibold text-zinc-950">
            {lang === 'fr' ? 'Recherches associées' : 'Related searches'}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {page.keywords.map((keyword) => (
              <li key={keyword} className="rounded-full bg-[#f7f3ed] px-4 py-2 text-sm text-zinc-700">
                {keyword}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container pb-16 md:pb-24">
        <div className="mx-auto max-w-5xl rounded-[28px] bg-[#efe5d7] p-8 text-center md:p-10">
          <h2 className="text-2xl font-semibold text-zinc-950">{copy.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-zinc-700">{copy.ctaBody}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={contactHref} className="rounded-full bg-zinc-950 px-7 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white">
              {lang === 'fr' ? 'Contacter l’agence' : 'Contact the agency'}
            </Link>
            <Link href={saleHref} className="rounded-full border border-zinc-950 px-7 py-3 text-sm font-medium uppercase tracking-[0.14em] text-zinc-950">
              {lang === 'fr' ? 'Voir les propriétés' : 'View properties'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
