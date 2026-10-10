import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { buildPageMetadata, truncateText } from '@/lib/seo';
import { getAllNewsSlugs, getNewsBySlug } from '@/lib/news';
import { getMandatBySlug } from '@/lib/apimo';
import { headers } from 'next/headers';

function formatPrice(value, lang) {
  if (!value) return '';
  try {
    return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  } catch {
    return `${value} €`;
  }
}

function LocationLine({ label }) {
  return (
    <div className="mt-4 flex items-center gap-3 text-[15px] font-medium uppercase tracking-[0.18em] text-[#C6A46C]">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5 shrink-0 fill-current"
      >
        <path d="M12 22s7-7.33 7-12a7 7 0 1 0-14 0c0 4.67 7 12 7 12Zm0-9.5A2.5 2.5 0 1 1 12 7a2.5 2.5 0 0 1 0 5.5Z" />
      </svg>
      <span>{label}</span>
    </div>
  );
}

async function SaleJsonLd({ mandat, lang }) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  const baseUrl = 'https://www.cotedazuragency.com';
  const url = `${baseUrl}/${lang}/vente/${mandat.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: mandat.title,
    description: truncateText(mandat.description, 300),
    priceCurrency: 'EUR',
    ...(mandat.price ? { price: mandat.price } : {}),
    url,
    availability: 'https://schema.org/InStock',
    itemOffered: {
      '@type': 'Residence',
      name: mandat.title,
      address: {
        '@type': 'PostalAddress',
        addressLocality: mandat.city || mandat.locationLabel,
        postalCode: mandat.postalCode || undefined,
        addressCountry: 'FR'
      },
      ...(mandat.area ? { floorSize: { '@type': 'QuantitativeValue', value: mandat.area, unitCode: 'MTK' } } : {}),
      ...(mandat.rooms ? { numberOfRooms: mandat.rooms } : {}),
      ...(mandat.bedrooms ? { numberOfBedrooms: mandat.bedrooms } : {})
    },
    seller: {
      '@type': 'RealEstateAgent',
      name: 'Côte d’Azur Agency',
      url: baseUrl
    },
    ...(mandat.pictures?.length ? { image: mandat.pictures } : {})
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
  if (!isLang(lang)) {
    return buildPageMetadata({
      title: 'Côte d’Azur Agency',
      description: 'Real estate on the French Riviera',
      lang: 'fr',
      pathname: '/fr'
    });
  }

  let mandat = null;
  try {
    mandat = await getMandatBySlug(slug, lang);
  } catch (e) {
    console.error('SALE_METADATA_APIMO_ERROR', e);
  }

  if (!mandat) {
    return buildPageMetadata({
      title: lang === 'fr' ? 'Bien immobilier | Côte d’Azur Agency' : 'Property | Côte d’Azur Agency',
      description: lang === 'fr' ? 'Bien à la vente sur la Côte d’Azur.' : 'Property for sale on the French Riviera.',
      lang,
      pathname: `/${lang}/vente/${slug}`
    });
  }

  const title = `${mandat.title}${mandat.locationLabel ? ` à ${mandat.locationLabel}` : ''} | Côte d’Azur Agency`;
  const description = truncateText(
    mandat.description ||
      (lang === 'fr'
        ? `Découvrez ce bien à la vente à ${mandat.locationLabel || 'sur la Côte d’Azur'}.`
        : `Discover this property for sale in ${mandat.locationLabel || 'the French Riviera'}.`),
    160
  );

  return buildPageMetadata({
    title,
    description,
    lang,
    pathname: `/${lang}/vente/${slug}`,
    image: mandat.pictures?.[0] || '/images/hero-pool.jpg'
  });
}

export default async function VenteDetailPage({ params }) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();

  let mandat = null;
  try {
    mandat = await getMandatBySlug(slug, lang);
  } catch (e) {
    console.error('VENTE_DETAIL_APIMO_ERROR', e);
  }

  if (!mandat) notFound();

  const pictures = Array.isArray(mandat.pictures) ? mandat.pictures.filter(Boolean) : [];
  const mainPicture = pictures[0] || null;
  const extraPictures = pictures.slice(1);

  return (
    <main className="container py-16">
      <SaleJsonLd mandat={mandat} lang={lang} />

      <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[28px] bg-zinc-100">
            <div className="aspect-[16/10]">
              {mainPicture ? (
                <img src={mainPicture} alt={mandat.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
          </div>

          {extraPictures.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {extraPictures.map((picture, index) => (
                <div key={`${picture}-${index}`} className="overflow-hidden rounded-[24px] bg-zinc-100">
                  <div className="aspect-[4/3]">
                    <img
                      src={picture}
                      alt={`${mandat.title} ${index + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-soft ring-1 ring-[var(--gold-light)] md:p-12">
          <h1 className="text-4xl font-light leading-[1.05] text-zinc-900 md:text-7xl">
            {mandat.title}
          </h1>

          <LocationLine label={mandat.locationLabel} />

          {mandat.price ? (
            <div className="mt-4 text-2xl text-zinc-900 md:text-3xl">
              {formatPrice(mandat.price, lang)}
            </div>
          ) : null}

          {mandat.description ? (
            <div className="mt-10 whitespace-pre-line text-lg leading-relaxed text-zinc-700">
              {mandat.description}
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-6 text-sm uppercase tracking-[0.16em] text-zinc-700">
            {mandat.area ? <span>{mandat.area} m²</span> : null}
            {mandat.rooms ? <span>{mandat.rooms} {lang === 'fr' ? 'pièces' : 'rooms'}</span> : null}
            {mandat.bedrooms ? <span>{mandat.bedrooms} {lang === 'fr' ? 'chambres' : 'bedrooms'}</span> : null}
          </div>

          <div className="mt-12">
            <Link
              href={`/${lang}/contact?property=${encodeURIComponent(mandat.slug)}`}
              className="inline-flex rounded-full border border-zinc-900 px-8 py-4 text-sm font-medium uppercase tracking-[0.16em] text-zinc-900"
            >
              {lang === 'fr' ? 'Demander plus d’information' : 'Request more information'}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
