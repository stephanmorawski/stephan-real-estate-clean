import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { buildPageMetadata, truncateText } from '@/lib/seo';
import { getAllNewsSlugs, getNewsBySlug } from '@/lib/news';
import { headers } from 'next/headers';

export async function generateStaticParams() {
  const slugs = await getAllNewsSlugs();
  return slugs.flatMap((slug) => [{ lang: 'fr', slug }, { lang: 'en', slug }]);
}

async function NewsJsonLd({ article, lang }) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  const baseUrl = 'https://www.cotedazuragency.com';
  const url = `${baseUrl}/${lang}/actualites/${article.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    mainEntityOfPage: url,
    image: article.image ? [`${baseUrl}${article.image}`] : undefined,
    author: {
      '@type': 'Organization',
      name: 'Côte d’Azur Agency'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Côte d’Azur Agency',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/branding/logo-full.png`
      }
    }
  };

  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;

  const article = await getNewsBySlug(slug, lang);
  if (!article) {
    return buildPageMetadata({
      title: 'Actualités | Côte d’Azur Agency',
      description: 'Actualités de Côte d’Azur Agency.',
      lang,
      pathname: `/${lang}/actualites/${slug}`
    });
  }

  return buildPageMetadata({
    title: `${article.title} | Côte d’Azur Agency`,
    description: truncateText(article.excerpt || article.title, 160),
    lang,
    pathname: `/${lang}/actualites/${slug}`,
    image: article.image || '/images/hero-pool.jpg'
  });
}

export default async function NewsDetailPage({ params }) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();

  const article = await getNewsBySlug(slug, lang);
  if (!article) notFound();

  return (
    <main className="container py-16">
      <NewsJsonLd article={article} lang={lang} />

      <article className="mx-auto max-w-4xl">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C6A46C]">
          {article.source}
        </div>

        <h1 className="mt-4 font-luxe text-4xl leading-tight text-zinc-900 md:text-6xl">
          {article.title}
        </h1>

        <div className="mt-6 text-sm text-zinc-500">
          {article.publishedAt}
        </div>

        {article.image ? (
          <div className="mt-10 overflow-hidden rounded-[28px] bg-zinc-100">
            <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
          </div>
        ) : null}

        <div className="mt-10 space-y-6 text-lg leading-relaxed text-zinc-700">
          {article.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {article.partnerUrl ? (
          <aside className="mt-10 rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
            {article.partnerLogo ? (
              <a
                href={article.partnerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
                aria-label={article.partnerName || 'Partner'}
              >
                <img
                  src={article.partnerLogo}
                  alt={article.partnerName || 'Partner'}
                  className="h-14 w-auto max-w-[280px] object-contain md:h-16"
                />
              </a>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href={article.partnerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-zinc-900 px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-900 hover:text-white"
              >
                {lang === 'fr'
                  ? `Découvrir ${article.partnerName || 'le partenaire'}`
                  : `Visit ${article.partnerName || 'partner'}`}
              </a>
            </div>
          </aside>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={`/${lang}/actualites`}
            className="inline-flex rounded-full border border-zinc-900 px-6 py-3 text-sm font-medium text-zinc-900"
          >
            {lang === 'fr' ? 'Retour aux actualités' : 'Back to news'}
          </Link>

          {article.linkedinUrl ? (
            <Link
              href={article.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700"
            >
              LinkedIn
            </Link>
          ) : null}
        </div>
      </article>
    </main>
  );
}
