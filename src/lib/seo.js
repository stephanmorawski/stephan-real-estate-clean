export function truncateText(value, max = 160) {
  const input = String(value || '').replace(/\s+/g, ' ').trim();
  if (!input) return '';
  if (input.length <= max) return input;
  return `${input.slice(0, max - 1).trim()}…`;
}

export function buildPageMetadata({
  title,
  description,
  lang,
  pathname,
  image = '/images/hero-pool.jpg',
  includeLanguageAlternates = true,
}) {
  const baseUrl = 'https://www.cotedazuragency.com';
  const url = `${baseUrl}${pathname}`;
  const alternate = lang === 'fr' ? 'en' : 'fr';
  const altPath = pathname.replace(/^\/(fr|en)/, '');
  const alternateUrl = `${baseUrl}/${alternate}${altPath}`;

  const alternates = includeLanguageAlternates
    ? {
        canonical: url,
        languages: {
          fr: lang === 'fr' ? url : alternateUrl,
          en: lang === 'en' ? url : alternateUrl,
          'x-default': `${baseUrl}/fr`,
        },
      }
    : {
        canonical: url,
      };

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Côte d’Azur Agency',
      type: 'website',
      locale: lang === 'fr' ? 'fr_FR' : 'en_GB',
      images: [
        {
          url: `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}${image}`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
