export function truncateText(value, max = 160) {
  const input = String(value || '').replace(/\s+/g, ' ').trim();
  if (!input) return '';
  if (input.length <= max) return input;
  return `${input.slice(0, max - 1).trim()}…`;
}

function toAbsoluteUrl(value, baseUrl) {
  const input = String(value || '').trim();
  if (!input) return baseUrl;
  if (/^https?:\/\//i.test(input)) return input;
  return `${baseUrl}${input.startsWith('/') ? input : `/${input}`}`;
}

export function buildPageMetadata({
  title,
  description,
  lang,
  pathname,
  image = '/images/hero-pool.jpg',
  imageWidth = 1200,
  imageHeight = 630,
  includeLanguageAlternates = true,
  alternatePath,
}) {
  const baseUrl = 'https://www.cotedazuragency.com';
  const url = `${baseUrl}${pathname}`;
  const imageUrl = toAbsoluteUrl(image, baseUrl);
  const alternate = lang === 'fr' ? 'en' : 'fr';
  const altPath = pathname.replace(/^\/(fr|en)/, '');
  const alternateUrl = toAbsoluteUrl(
    alternatePath || `/${alternate}${altPath}`,
    baseUrl,
  );

  const alternates = includeLanguageAlternates
    ? {
        canonical: url,
        languages: {
          fr: lang === 'fr' ? url : alternateUrl,
          en: lang === 'en' ? url : alternateUrl,
          'x-default': lang === 'fr' ? url : alternateUrl,
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
          url: imageUrl,
          width: imageWidth,
          height: imageHeight,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
