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

function getCityLabel(mandat) {
  return mandat?.locationLabel || mandat?.city || mandat?.location || '';
}

function getGridClass(count) {
  if (count <= 1) return 'grid-cols-1 mx-auto w-full max-w-md';
  if (count === 2) return 'grid-cols-2 mx-auto w-full max-w-3xl';
  if (count <= 4) return 'grid-cols-2 lg:grid-cols-4';
  if (count <= 6) return 'grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
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
    <main className="container flex min-h-[calc(100vh-166px)] flex-col px-4 py-5 md:h-[calc(100vh-166px)] md:min-h-[560px] md:overflow-hidden md:py-5">
      <header className="mx-auto mb-4 max-w-4xl shrink-0 text-center md:mb-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C6A46C] md:text-[11px]">
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
        <section className={`grid flex-1 auto-rows-auto gap-3 overflow-visible md:auto-rows-fr md:gap-3 md:overflow-hidden ${gridClass}`}>
          {visibleMandats.map((m) => {
            const href = `/${lang}/vente/${m.slug}`;
            const picture = getMainPicture(m);
            const city = getCityLabel(m);
            const title = m.title || m.name || '';

            return (
              <Link
                key={m.slug}
                href={href}
                className="group flex min-h-0 flex-col overflow-hidden rounded-[18px] bg-white shadow-soft ring-1 ring-[var(--gold-light)] transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:ring-[#C6A46C]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 md:aspect-auto md:h-[62%] md:min-h-[132px]">
                  {picture ? (
                    <img
                      src={picture}
                      alt={title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.035]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                      {lang === 'fr' ? 'Photo à venir' : 'Photo coming soon'}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-3 md:p-3">
                  {city ? (
                    <p className="mb-1 truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-[#C6A46C] md:text-[10px]">
                      {city}
                    </p>
                  ) : null}

                  <h2 className="line-clamp-3 text-[14px] font-semibold leading-tight text-zinc-900 md:text-[15px]">
                    {title}
                  </h2>

                  {m.price ? (
                    <div className="mt-2 text-[11px] font-medium leading-none text-zinc-700 md:text-[11px]">
                      {formatPrice(m.price, lang)}
                    </div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
