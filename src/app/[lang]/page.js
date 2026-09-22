import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLang, getDict } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';
import { getAllNews } from '@/lib/news';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const title = lang === 'en'
    ? 'Côte d’Azur Agency | Luxury Real Estate on the French Riviera'
    : 'Côte d’Azur Agency | Immobilier de prestige sur la Côte d’Azur';
  const description = lang === 'en'
    ? 'Côte d’Azur Agency advises French and international clients on luxury property sales and acquisitions across the French Riviera.'
    : 'Côte d’Azur Agency accompagne vendeurs et acquéreurs dans leurs projets immobiliers de prestige à Valbonne, Cannes, Mougins, Biot, Antibes et sur la Côte d’Azur.';
  return buildPageMetadata({ title, description, lang, pathname: `/${lang}` });
}

export default async function HomePage({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = await getDict(lang);
  const latestNews = (await getAllNews(lang)).slice(0, 3);

  return (
    <main>
      <section className="relative overflow-hidden bg-black text-white">
        <img src="/images/hero-pool.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative container py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="font-luxe text-4xl leading-tight md:text-6xl lg:text-[64px]">
              {t.home.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/90 md:text-xl">
              {t.home.heroLead}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={`/${lang}/contact`} className="btn-gold">{t.home.ctaPrimary}</Link>
              <Link href={`/${lang}/vente`} className="btn-dark">{t.home.ctaSecondary}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="card-luxe p-8">
          <h2 className="font-luxe text-3xl">{t.home.introTitle}</h2>
          <p className="mt-4 text-zinc-700">{t.home.introText}</p>
          <p className="mt-4 text-zinc-700">{t.home.introText2}</p>
        </div>
      </section>

      {latestNews.length > 0 ? (
        <section className="container pb-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C6A46C]">
                {lang === 'fr' ? 'Actualités' : 'News'}
              </div>
              <h2 className="mt-2 font-luxe text-3xl">
                {lang === 'fr' ? 'Dernières actualités' : 'Latest news'}
              </h2>
            </div>
            <Link
              href={`/${lang}/actualites`}
              className="text-sm font-medium text-zinc-800 underline underline-offset-4"
            >
              {lang === 'fr' ? 'Voir toutes les actualités' : 'View all news'}
            </Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {latestNews.map((item) => (
              <article key={item.id} className="card-luxe overflow-hidden">
                {item.image ? (
                  <div className="aspect-[16/10] bg-zinc-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C6A46C]">
                    {item.source}
                  </div>
                  <h3 className="mt-3 font-luxe text-2xl text-zinc-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-700">
                    {item.excerpt}
                  </p>
                  <div className="mt-4 text-xs text-zinc-500">{item.publishedAt}</div>
                  <Link
                    href={`/${lang}/actualites/${item.slug}`}
                    className="mt-5 inline-flex rounded-full border border-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-900"
                  >
                    {lang === 'fr' ? 'Lire l’actualité' : 'Read article'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
