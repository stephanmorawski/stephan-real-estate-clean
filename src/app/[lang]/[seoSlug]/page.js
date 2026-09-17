import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';
import SeoLandingPage from '@/components/SeoLandingPage';
import { getSeoPage, getSeoPages } from '@/lib/seo-pages';

export function generateStaticParams() {
  return getSeoPages().map((page) => ({
    lang: page.lang,
    seoSlug: page.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { lang, seoSlug } = await params;
  const page = getSeoPage(lang, seoSlug);
  if (!page) return {};

  return buildPageMetadata({
    title: page.title,
    description: page.description,
    lang,
    pathname: `/${lang}/${page.slug}`,
    // These local SEO landing pages are not one-to-one translations.
    // Emitting hreflang with the same slug in the other language created
    // alternates that resolve to 404s and sent a contradictory indexing signal.
    includeLanguageAlternates: false,
  });
}

export default async function Page({ params }) {
  const { lang, seoSlug } = await params;
  const page = getSeoPage(lang, seoSlug);

  if (!page) notFound();

  return <SeoLandingPage page={page} lang={lang} />;
}
