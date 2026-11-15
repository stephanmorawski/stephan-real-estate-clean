import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { isLang } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';
import AiGuidePage from '@/components/AiGuidePage';
import { getAiGuide, getAiGuides } from '@/lib/ai-guides';

const BASE_URL = 'https://www.cotedazuragency.com';

export function generateStaticParams() {
  return getAiGuides().map((guide) => ({
    lang: guide.lang,
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const guide = getAiGuide(lang, slug);
  if (!guide) return {};

  const alternateLang = lang === 'fr' ? 'en' : 'fr';

  return buildPageMetadata({
    title: guide.title,
    description: guide.description,
    lang,
    pathname: `/${lang}/guides/${guide.slug}`,
    alternatePath: `/${alternateLang}/guides/${guide.alternateSlug}`,
  });
}

async function GuideJsonLd({ guide, lang }) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  const url = `${BASE_URL}/${lang}/guides/${guide.slug}`;
  const guidesUrl = `${BASE_URL}/${lang}/guides`;

  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: guide.title,
      description: guide.description,
      datePublished: guide.updatedAt,
      dateModified: guide.updatedAt,
      inLanguage: lang === 'fr' ? 'fr-FR' : 'en-GB',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      about: { '@id': `${BASE_URL}/#organization` },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      mainEntity: { '@id': `${url}#article` },
    },
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: guide.h1,
      description: guide.description,
      datePublished: guide.updatedAt,
      dateModified: guide.updatedAt,
      inLanguage: lang === 'fr' ? 'fr-FR' : 'en-GB',
      mainEntityOfPage: { '@id': `${url}#webpage` },
      author: { '@id': `${BASE_URL}/#stephan-morawski` },
      publisher: { '@id': `${BASE_URL}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: lang === 'fr' ? 'Accueil' : 'Home',
          item: `${BASE_URL}/${lang}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Guides',
          item: guidesUrl,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: guide.h1,
          item: url,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: guide.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function GuidePage({ params }) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();

  const guide = getAiGuide(lang, slug);
  if (!guide) notFound();

  return (
    <>
      <GuideJsonLd guide={guide} lang={lang} />
      <AiGuidePage guide={guide} lang={lang} />
    </>
  );
}
