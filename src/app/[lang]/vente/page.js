import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLang, getDict } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';
import { getMandats } from '@/lib/apimo';

function formatPrice(value, lang) {
  if (!value) return '';

  try {
    return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} €`;
  }
}

function getMainPicture(mandat) {
  if (Array.isArray(mandat?.pictures) && mandat.pictures[0]) {
    return mandat.pictures[0];
  }

  if (mandat?.picture) return mandat.picture;
  if (mandat?.image) return mandat.image;

  return '';
}

function getSurfaceLabel(mandat) {
  const surface = mandat?.surface || mandat?.area || mandat?.livingArea;
  if (!surface) return '';

  return `${surface} m²`;
}

function getRoomsLabel(mandat, lang) {
  const rooms = mandat?.rooms || mandat?.pieces || mandat?.nbRooms;
  if (!rooms) return '';

  return lang === 'fr' ? `${rooms} pièces` : `${rooms} rooms`;
}

function getBedroomsLabel(mandat, lang) {
  const bedrooms = mandat?.bedrooms || mandat?.chambres || mandat?.nbBedrooms;
  if (!bedrooms) return '';

  return lang === 'fr' ? `${bedrooms} chambres` : `${bedrooms} bedrooms`;
}

function getGridClass(count) {
  if (count <= 1) {
    return 'mx-auto max-w-md grid-cols-1';
  }

  if (count === 2) {
    return 'mx-auto max-w-3xl grid-cols-2';
  }

  if (count === 3) {
    return 'mx-auto max-w-5xl grid-cols-3';
  }

  if (count === 4) {
    return 'grid-cols-4';
  }

  if (count <= 6) {
    return 'grid-cols-3';
  }

  return 'grid-cols-4';
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const title = lang === 'en' ? 'Sale | Côte d’Azur Agency' : 'Vente | Côte d’Azur Agency';
  const description = lang === 'en'
    ? 'Properties for sale on the French Riviera.'
    : 'Biens à la vente sur la Côte d’Azur.';

  return buildPageMetadata({ title, description, lang, pathname: `/${lang}/vente` });
}

export default async function VentePage({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const t = await getDict(lang);

  let mandats = [];
  try {
    mandats = (await getMandats(lang)).reverse();

    mandats.sort((a, b) => {
      const aLabel = `${a.title || a.name || ''} ${a.locationLabel || ''}`.toLowerCase();
      const bLabel = `${b.title || b.name || ''} ${b.locationLabel || ''}`.toLowerCase();

      const aIsBergerie =
        aLabel.includes('bergerie') &&
        aLabel.includes('tourrettes');

      const bIsBergerie =
        bLabel.includes('bergerie') &&
        bLabel.includes('tourrettes');

      if (aIsBergerie && !bIsBergerie) return 1;
      if (!aIsBergerie && bIsBergerie) return -1;
      return 0;
    });
  } catch (e) {
    console.error('VENTE_APIMO_ERROR', e);
  }

  const visibleMandats = mandats.slice(0, 12);
  const gridClass = getGridClass(visibleMandats.length);

  return (
    <main className="container flex h-[calc(100vh-166px)] min-h-[560px] flex-col overflow-hidden py-5">
      <header className="mx-auto mb-4 max-w-4xl shrink-0 text-center">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C6A46C]">
          {lang === 'fr' ? 'Catalogue des biens' : 'Property catalogue'}
        </p>

        <h1 className="font-luxe text-3xl leading-tight md:text-4xl">
          {t.sale.title}
        </h1>

        <p className="mx-auto mt-2 max-w-2xl text-sm leading-snug text-zinc-700">
          {t.sale.lead}
        </p>
      </header>

      {visibleMandats.length === 0 ? (
        <div className="card-luxe mx-auto max-w-2xl p-6 text-center">
          {t.sale.empty}
        </div>
      ) : (
        <section className={`grid flex-1 auto-rows-fr gap-3 overflow-hidden ${gridClass}`}>
          {visibleMandats.map((m) => {
            const href = `/${lang}/vente/${m.slug}`;
            const picture = getMainPicture(m);
            const title = m.title || m.name || '';
            const surfaceLabel = getSurfaceLabel(m);
            const roomsLabel = getRoomsLabel(m, lang);
            const bedroomsLabel = getBedroomsLabel(m, lang);

            return (
              <Link
                key={m.slug}
                href={href}
                className="group flex min-h-0 flex-col overflow-hidden rounded-[20px] bg-white shadow-soft ring-1 ring-[var(--gold-light)] transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:ring-[#C6A46C]"
              >
                <div className="relative h-[44%] min-h-[92px] overflow-hidden bg-zinc-100">
                  {picture ? (
                    <img
                      src={picture}
                      alt={title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.035]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
                      {lang === 'fr' ? 'Photo à venir' : 'Photo coming soon'}
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent" />

                  {m.price ? (
                    <div className="absolute bottom-2 left-2 rounded-full bg-white/95 px-3 py-1 text-[12px] font-semibold leading-none text-zinc-900">
                      {formatPrice(m.price, lang)}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-3">
                  {m.locationLabel ? (
                    <p className="mb-1 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C6A46C]">
                      {m.locationLabel}
                    </p>
                  ) : null}

                  <h2 className="line-clamp-2 min-h-[38px] text-[15px] font-semibold leading-tight text-zinc-900">
                    {title}
                  </h2>

                  <div className="mt-2 flex min-h-[24px] flex-wrap gap-1.5 overflow-hidden text-[11px] text-zinc-700">
                    {surfaceLabel ? (
                      <span className="rounded-full bg-zinc-100 px-2 py-1 leading-none">
                        {surfaceLabel}
                      </span>
                    ) : null}

                    {roomsLabel ? (
                      <span className="rounded-full bg-zinc-100 px-2 py-1 leading-none">
                        {roomsLabel}
                      </span>
                    ) : null}

                    {bedroomsLabel ? (
                      <span className="rounded-full bg-zinc-100 px-2 py-1 leading-none">
                        {bedroomsLabel}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-auto pt-2">
                    <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-900">
                      {lang === 'fr' ? 'Voir le bien' : 'View listing'}
                      <span className="ml-2 transition group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
