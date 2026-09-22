import Image from 'next/image';

const CONTENT = {
  fr: {
    title: 'Partenaires',
    intro: 'Une sélection de partenaires utiles et complémentaires.',
    partnerCta: 'Visiter le partenaire',
    partnerUrl: 'https://www.currenciesdirect.com/partner/0201110000931505',
    cards: [
      {
        title: 'Notaires et conseils juridiques',
        description: 'Sécurisation juridique et accompagnement des transactions.',
      },
      {
        title: 'Architectes et décorateurs',
        description: 'Conception, rénovation et valorisation des espaces.',
      },
      {
        title: 'Experts techniques et diagnostics',
        description: 'Évaluation, contrôle et expertise technique des biens.',
      },
      {
        title: 'Photographes et valorisation des biens',
        description: 'Mise en image premium et présentation soignée des propriétés.',
      },
      {
        title: 'Artisans et entreprises de confiance',
        description: 'Intervenants sélectionnés pour des réalisations de qualité.',
      },
    ],
    currency: {
      title: 'Currencies Direct',
      description: "Transfert d'argent international",
    },
  },
  en: {
    title: 'Partners',
    intro: 'A selection of useful and complementary partners.',
    partnerCta: 'Visit partner',
    partnerUrl: 'https://www.currenciesdirect.com/partner/0201110000931505',
    cards: [
      {
        title: 'Notaries and legal advisors',
        description: 'Legal support and transaction security.',
      },
      {
        title: 'Architects and interior designers',
        description: 'Design, renovation and enhancement of living spaces.',
      },
      {
        title: 'Technical experts and diagnostics',
        description: 'Assessment, inspection and technical expertise for properties.',
      },
      {
        title: 'Photographers and property presentation',
        description: 'Premium visuals and refined property presentation.',
      },
      {
        title: 'Trusted craftsmen and companies',
        description: 'Carefully selected professionals for quality work.',
      },
    ],
    currency: {
      title: 'Currencies Direct',
      description: 'International money transfer',
    },
  },
};

function StandardCard({ title, description }) {
  return (
    <article className="h-full rounded-[28px] bg-white p-8 md:p-9 shadow-soft ring-1 ring-black/5 flex flex-col justify-between">
      <div>
        <h2 className="font-serif text-[30px] leading-[1.05] tracking-[-0.03em] text-black md:text-[34px]">
          {title}
        </h2>
        <p className="mt-5 text-[17px] leading-[1.6] text-black/75">
          {description}
        </p>
      </div>
    </article>
  );
}

function CurrenciesDirectCard({ data, cta, url }) {
  return (
    <article className="h-full rounded-[28px] bg-white p-8 md:p-9 shadow-soft ring-1 ring-black/5 flex flex-col">
      <div>
        <h2 className="font-serif text-[30px] leading-[1.05] tracking-[-0.03em] text-black md:text-[34px]">
          {data.title}
        </h2>
        <p className="mt-5 text-[17px] leading-[1.6] text-black/75">
          {data.description}
        </p>
      </div>

      <div className="mt-8">
        <div className="relative h-[72px] w-[240px] md:h-[84px] md:w-[280px]">
          <Image
            src="/partners/currencies-direct-logo-display.png"
            alt="Currencies Direct"
            fill
            className="object-contain object-left"
            sizes="280px"
            unoptimized
          />
        </div>
      </div>

      <div className="mt-8">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[58px] items-center justify-center rounded-full border border-black px-8 text-[14px] font-medium uppercase tracking-[0.22em] text-black transition hover:bg-black hover:text-white"
        >
          {cta}
        </a>
      </div>
    </article>
  );
}

export default async function PartenairesPage({ params }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang === 'en' ? 'en' : 'fr';
  const t = CONTENT[lang];

  return (
    <main className="bg-[var(--background)]">
      <section className="mx-auto w-full max-w-[1180px] px-6 pb-16 pt-8 md:px-8 md:pb-24 md:pt-10">
        <div className="rounded-[36px] bg-[#dfdbd3] px-8 py-10 md:px-12 md:py-14">
          <h1 className="font-serif text-[58px] leading-[0.95] tracking-[-0.04em] text-black md:text-[76px]">
            {t.title}
          </h1>
          <p className="mt-6 max-w-[760px] text-[18px] leading-[1.6] text-black/75">
            {t.intro}
          </p>
        </div>

        <div className="mt-9 grid gap-6 md:grid-cols-2">
          {t.cards.slice(0, 2).map((card) => (
            <div key={card.title} className="min-h-[220px]">
              <StandardCard {...card} />
            </div>
          ))}

          {t.cards.slice(2, 4).map((card) => (
            <div key={card.title} className="min-h-[220px]">
              <StandardCard {...card} />
            </div>
          ))}

          <div className="min-h-[220px]">
            <StandardCard {...t.cards[4]} />
          </div>

          <div className="min-h-[220px]">
            <CurrenciesDirectCard
              data={t.currency}
              cta={t.partnerCta}
              url={t.partnerUrl}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
