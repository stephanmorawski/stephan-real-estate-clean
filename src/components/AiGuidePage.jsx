import Link from 'next/link';
import { getAiGuides } from '@/lib/ai-guides';

const labels = {
  fr: {
    directAnswer: 'Réponse directe',
    comparison: 'Comparaison',
    checklist: 'Points de contrôle',
    faq: 'Questions fréquentes',
    sources: 'Sources officielles',
    related: 'Guides associés',
    updated: 'Mis à jour le',
    author: 'Analyse éditoriale : Côte d’Azur Agency · Stephan Morawski',
    disclaimer: 'Ce contenu présente une méthode générale et ne remplace pas un conseil juridique, fiscal, notarial ou technique adapté à votre situation.',
    properties: 'Voir les biens',
    agency: 'Découvrir l’agence',
    guides: 'Tous les guides',
  },
  en: {
    directAnswer: 'Direct answer',
    comparison: 'Comparison',
    checklist: 'Checklist',
    faq: 'Frequently asked questions',
    sources: 'Official sources',
    related: 'Related guides',
    updated: 'Updated',
    author: 'Editorial analysis: Côte d’Azur Agency · Stephan Morawski',
    disclaimer: 'This content provides a general method and does not replace legal, tax, notarial or technical advice tailored to your situation.',
    properties: 'View properties',
    agency: 'About the agency',
    guides: 'All guides',
  },
};

export default function AiGuidePage({ guide, lang }) {
  const copy = labels[lang] || labels.fr;
  const relatedGuides = getAiGuides(lang).filter((item) => item.slug !== guide.slug);

  return (
    <main className="bg-[#f7f3ed]">
      <article>
        <header className="container py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <nav aria-label={lang === 'fr' ? 'Fil d’Ariane' : 'Breadcrumb'} className="text-sm text-zinc-600">
              <Link href={`/${lang}`} className="hover:text-zinc-950">
                {lang === 'fr' ? 'Accueil' : 'Home'}
              </Link>
              <span aria-hidden="true" className="px-2">/</span>
              <Link href={`/${lang}/guides`} className="hover:text-zinc-950">
                Guides
              </Link>
            </nav>

            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a7541]">
              {guide.kicker}
            </p>
            <h1 className="mt-4 font-luxe text-4xl leading-tight text-zinc-950 md:text-6xl">
              {guide.h1}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              {guide.intro}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600">
              <span>{copy.author}</span>
              <time dateTime={guide.updatedAt}>
                {copy.updated} {guide.updatedAt}
              </time>
            </div>
          </div>
        </header>

        <section className="container pb-12 md:pb-16">
          <div className="mx-auto max-w-5xl rounded-[28px] bg-zinc-950 p-8 text-white shadow-soft md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d8bb8d]">
              {copy.directAnswer}
            </p>
            <p className="mt-4 text-lg leading-8 text-zinc-100 md:text-xl">
              {guide.directAnswer}
            </p>
          </div>
        </section>

        <section className="container pb-12 md:pb-16">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            {guide.sections.map((section) => (
              <section
                key={section.heading}
                className="rounded-[28px] bg-white p-7 shadow-soft ring-1 ring-[var(--gold-light)] md:p-9"
              >
                <h2 className="text-2xl font-semibold leading-tight text-zinc-950">
                  {section.heading}
                </h2>
                <p className="mt-4 text-[15px] leading-7 text-zinc-700">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </section>

        {guide.comparison ? (
          <section className="container pb-12 md:pb-16">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-soft ring-1 ring-[var(--gold-light)]">
              <div className="border-b border-zinc-200 p-7 md:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a7541]">
                  {copy.comparison}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                  {guide.comparison.title}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                  <thead className="bg-[#f7f3ed] text-zinc-900">
                    <tr>
                      {guide.comparison.columns.map((column) => (
                        <th key={column} scope="col" className="border-b border-zinc-200 px-6 py-4 font-semibold">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guide.comparison.rows.map((row) => (
                      <tr key={row.join('|')} className="align-top">
                        {row.map((cell, index) => (
                          <td
                            key={`${index}-${cell}`}
                            className={`border-b border-zinc-100 px-6 py-4 leading-6 text-zinc-700 ${
                              index === 0 ? 'font-medium text-zinc-950' : ''
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}

        <section className="container pb-12 md:pb-16">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.35fr]">
            <section className="rounded-[28px] bg-[#efe5d7] p-7 md:p-9">
              <h2 className="text-2xl font-semibold text-zinc-950">{copy.checklist}</h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-800">
                {guide.checklist.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="text-[#9a7541]">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[28px] bg-white p-7 shadow-soft ring-1 ring-[var(--gold-light)] md:p-9">
              <h2 className="text-2xl font-semibold text-zinc-950">{copy.faq}</h2>
              <div className="mt-5 divide-y divide-zinc-200">
                {guide.faq.map((item) => (
                  <section key={item.question} className="py-5 first:pt-0 last:pb-0">
                    <h3 className="text-lg font-semibold leading-7 text-zinc-950">
                      {item.question}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-zinc-700">
                      {item.answer}
                    </p>
                  </section>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="container pb-12 md:pb-16">
          <div className="mx-auto max-w-6xl rounded-[28px] bg-white p-7 shadow-soft ring-1 ring-[var(--gold-light)] md:p-9">
            <h2 className="text-2xl font-semibold text-zinc-950">{copy.sources}</h2>
            <ul className="mt-5 space-y-3">
              {guide.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium leading-6 text-zinc-800 underline decoration-[#c6a46c] decoration-2 underline-offset-4 hover:text-zinc-950"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-5 text-zinc-500">
              {copy.disclaimer}
            </p>
          </div>
        </section>

        <section className="container pb-12 md:pb-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-semibold text-zinc-950">{copy.related}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatedGuides.map((related) => (
                <Link
                  key={related.slug}
                  href={`/${related.lang}/guides/${related.slug}`}
                  className="rounded-[22px] bg-white p-6 shadow-soft ring-1 ring-[var(--gold-light)] transition hover:-translate-y-0.5 hover:ring-[#c6a46c]"
                >
                  <span className="text-base font-semibold leading-6 text-zinc-950">
                    {related.h1}
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-zinc-600">
                    {related.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="container pb-16 md:pb-24">
          <div className="mx-auto max-w-5xl rounded-[28px] bg-zinc-950 p-8 text-center text-white md:p-10">
            <h2 className="text-2xl font-semibold">{guide.cta}</h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={`/${lang}/contact`}
                className="rounded-full bg-white px-7 py-3 text-sm font-medium uppercase tracking-[0.14em] text-zinc-950"
              >
                {lang === 'fr' ? 'Contacter l’agence' : 'Contact the agency'}
              </Link>
              <Link
                href={`/${lang}/vente`}
                className="rounded-full border border-zinc-500 px-7 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white"
              >
                {copy.properties}
              </Link>
              <Link
                href={`/${lang}/guides`}
                className="rounded-full border border-zinc-500 px-7 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white"
              >
                {copy.guides}
              </Link>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
