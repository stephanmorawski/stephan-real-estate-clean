import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { isLang } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://www.cotedazuragency.com';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildPageMetadata({
    title: lang === 'fr'
      ? 'Stephan Morawski, fondatrice | Côte d’Azur Agency'
      : 'Stephan Morawski, Founder | Côte d’Azur Agency',
    description: lang === 'fr'
      ? 'Découvrez le parcours de Stephan Morawski, fondatrice de Côte d’Azur Agency, et sa vision du conseil immobilier sur la Côte d’Azur.'
      : 'Discover Stephan Morawski’s background, the founder of Côte d’Azur Agency, and her approach to French Riviera property advice.',
    lang,
    pathname: `/${lang}/agence/founder`
  });
}

async function FounderSchema({ lang }) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  const pageUrl = `${BASE_URL}/${lang}/agence/founder`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${pageUrl}#profile`,
    url: pageUrl,
    name: lang === 'fr'
      ? 'Stephan Morawski, fondatrice de Côte d’Azur Agency'
      : 'Stephan Morawski, founder of Côte d’Azur Agency',
    inLanguage: lang === 'fr' ? 'fr-FR' : 'en-GB',
    mainEntity: {
      '@id': `${BASE_URL}/#stephan-morawski`,
    },
    isPartOf: {
      '@id': `${BASE_URL}/#website`,
    },
  };

  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function Heading({ lang }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
      <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a7541]">
        {lang === 'fr' ? 'Fondatrice' : 'Founder'}
      </div>
      <div className="text-xl font-medium tracking-[0.02em] text-zinc-900 md:text-2xl">
        Stephan Morawski
      </div>
    </div>
  );
}

function FRText() {
  return (
    <>
      <Heading lang="fr" />

      <h1 className="mt-4 font-luxe text-4xl leading-tight text-zinc-900 md:text-6xl">
        Une vision exigeante de l’immobilier sur la Côte d’Azur
      </h1>

      <div className="mt-8 rounded-[24px] border border-[var(--gold-light)] bg-white p-6 md:p-8">
        <p className="font-luxe text-2xl leading-relaxed text-zinc-900 md:text-3xl">
          « L’excellence ne se revendique pas, elle se démontre. »
        </p>
      </div>

      <div className="mt-10 space-y-6 text-lg leading-relaxed text-zinc-700">
        <p>
          Depuis plus de dix ans, j’évolue dans l’immobilier sur la Côte d’Azur avec une conviction forte :
          l’excellence ne se revendique pas, elle se démontre.
        </p>
        <p>
          Avant de me consacrer pleinement à l’immobilier de prestige, j’ai occupé pendant dix ans le poste de
          directrice administrative et financière. Cette expérience m’a apporté une maîtrise exigeante du
          management, de la négociation, de la gestion de projet et de la relation client.
        </p>
        <p>
          Mon parcours dans l’hôtellerie de luxe a également renforcé mon sens du service, du détail et des attentes
          d’une clientèle haut de gamme.
        </p>
        <p>
          Après dix années au sein de grandes enseignes de l’immobilier de prestige, j’ai choisi de créer une
          structure à mon image : <span className="font-semibold text-zinc-900">CÔTE D’AZUR AGENCY</span>.
        </p>
        <p>
          Une agence pensée pour une clientèle exigeante, en quête de discrétion, de précision et d’un accompagnement
          irréprochable.
        </p>
      </div>
    </>
  );
}

function ENText() {
  return (
    <>
      <Heading lang="en" />

      <h1 className="mt-4 font-luxe text-4xl leading-tight text-zinc-900 md:text-6xl">
        A demanding vision of real estate on the French Riviera
      </h1>

      <div className="mt-8 rounded-[24px] border border-[var(--gold-light)] bg-white p-6 md:p-8">
        <p className="font-luxe text-2xl leading-relaxed text-zinc-900 md:text-3xl">
          “Excellence is not claimed, it is demonstrated.”
        </p>
      </div>

      <div className="mt-10 space-y-6 text-lg leading-relaxed text-zinc-700">
        <p>
          For more than ten years, I have worked in real estate on the French Riviera with one strong conviction:
          excellence is not claimed, it is demonstrated.
        </p>
        <p>
          Before fully dedicating myself to luxury real estate, I spent ten years as an administrative and finance
          director. This experience gave me a demanding command of management, negotiation, project leadership and
          client relations.
        </p>
        <p>
          My background in luxury hospitality also strengthened my sense of service, detail and the expectations of a
          premium clientele.
        </p>
        <p>
          After ten years within major luxury real estate brands, I chose to create a structure that reflects my own
          standards: <span className="font-semibold text-zinc-900">CÔTE D’AZUR AGENCY</span>.
        </p>
        <p>
          An agency designed for a demanding clientele seeking discretion, precision and impeccable support.
        </p>
      </div>
    </>
  );
}

export default async function FounderPage({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const hasImage = fs.existsSync(path.join(process.cwd(), 'public/images/founder.jpg'));

  return (
    <main className="container py-16">
      <FounderSchema lang={lang} />
      <div className="grid gap-10 lg:grid-cols-[480px_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <div className="overflow-hidden rounded-[32px] bg-zinc-100 shadow-soft ring-1 ring-[var(--gold-light)]">
            {hasImage ? (
              <img
                src="/images/founder.jpg"
                alt="Stephan Morawski, founder of Côte d’Azur Agency"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center bg-zinc-100 text-zinc-500">
                Stephan Morawski
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-soft ring-1 ring-[var(--gold-light)] md:p-12">
          {lang === 'fr' ? <FRText /> : <ENText />}
        </div>
      </div>
    </main>
  );
}