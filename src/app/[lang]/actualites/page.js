import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';
import { getAllNews } from '@/lib/news';

export async function generateMetadata({ params }) {
  const { lang } = await params;

  return buildPageMetadata({
    title: lang === 'fr'
      ? 'Actualités | Côte d’Azur Agency'
      : 'News | Côte d’Azur Agency',
    description: lang === 'fr'
      ? 'Retrouvez les actualités, prises de parole et publications de Côte d’Azur Agency.'
      : 'Explore the latest updates, publications and insights from Côte d’Azur Agency.',
    lang,
    pathname: `/${lang}/actualites`
  });
}

export default async function NewsPage({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const items = await getAllNews(lang);

  return (
    <main className="container py-16">
      <h1 className="font-luxe text-4xl">
        {lang === 'fr' ? 'Actualités' : 'News'}
      </h1>

      <p className="mt-3 max-w-3xl text-zinc-700">
        {lang === 'fr'
          ? 'Une sélection de publications, prises de parole et analyses autour de l’immobilier sur la Côte d’Azur.'
          : 'A curated selection of publications, insights and market perspectives on real estate on the French Riviera.'}
      </p>

      <div className="mt-10 grid gap-6">
        {items.map((item) => (
          <article key={item.id} className="card-luxe overflow-hidden">
            <div className="grid gap-0 md:grid-cols-[320px_1fr]">
              <div className="bg-zinc-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className={(item.image === '/news/partenariat-financement-2026-10-17-fr.png' || item.image === '/news/partenariat-financement-2026-10-17-en.png') ? 'block h-auto w-full' : 'h-full w-full object-cover'}
                  />
                ) : null}
              </div>

              <div className="p-8">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C6A46C]">
                  {item.source}
                </div>

                <h2 className="mt-3 font-luxe text-3xl text-zinc-900">
                  {item.title}
                </h2>

                <p className="mt-4 text-zinc-700">
                  {item.excerpt}
                </p>

                <div className="mt-6 text-sm text-zinc-500">
                  {item.publishedAt}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`/${lang}/actualites/${item.slug}`}
                    className="inline-flex rounded-full border border-zinc-900 px-6 py-3 text-sm font-medium text-zinc-900"
                  >
                    {lang === 'fr' ? 'Lire l’actualité' : 'Read article'}
                  </Link>

                  {item.linkedinUrl ? (
                    <Link
                      href={item.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700"
                    >
                      LinkedIn
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
