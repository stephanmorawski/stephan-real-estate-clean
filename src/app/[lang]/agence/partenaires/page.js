import Image from 'next/image';

const CONTENT = {
  fr: {
    title: 'Partenaires',
    intro: 'Une sélection de partenaires utiles et complémentaires.',
    cta: 'Visiter le partenaire',
    currency: {
      title: 'Currencies Direct',
      description: "Transfert d'argent international",
      url: 'https://www.currenciesdirect.com/partner/0201110000931505',
    },
    financing: {
      title: 'Financement & Crédit immobilier',
      intro: 'Des solutions de financement adaptées aux projets immobiliers en France et à une clientèle internationale.',
      partners: [
        {
          name: 'VousFinancer',
          description: 'Financement immobilier en France pour les résidents fiscaux français : prêt immobilier classique, prêt relais, achat-revente et solutions hypothécaires.',
          url: 'https://courtier.vousfinancer.com/provence-alpes-cote-d-azur/alpes-maritimes/cannes/courtier-en-credit-a-cannes-06-18',
          logo: '/partners/vousfinancer-logo.png',
        },
        {
          name: 'OMAGE Finance Conseil',
          description: 'Financement immobilier pour une clientèle internationale et non-résidente, avec accompagnement des dossiers nécessitant une structuration financière ou patrimoniale spécifique.',
          url: 'https://www.omagefinance.fr/',
          logo: '/partners/omage-finance-logo.jpg',
        },
      ],
    },
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
  },
  en: {
    title: 'Partners',
    intro: 'A selection of useful and complementary partners.',
    cta: 'Visit partner',
    currency: {
      title: 'Currencies Direct',
      description: 'International money transfer',
      url: 'https://www.currenciesdirect.com/partner/0201110000931505',
    },
    financing: {
      title: 'Mortgage & Property Finance',
      intro: 'Financing solutions tailored to property projects in France and to international buyers.',
      partners: [
        {
          name: 'VousFinancer',
          description: 'Property finance in France for French tax residents, including standard mortgages, bridge loans, buy-to-resell financing and mortgage-backed solutions.',
          url: 'https://courtier.vousfinancer.com/provence-alpes-cote-d-azur/alpes-maritimes/cannes/courtier-en-credit-a-cannes-06-18',
          logo: '/partners/vousfinancer-logo.png',
        },
        {
          name: 'OMAGE Finance Conseil',
          description: 'Property finance for international and non-resident clients, including cases requiring specific financial or wealth structuring.',
          url: 'https://www.omagefinance.fr/',
          logo: '/partners/omage-finance-logo.jpg',
        },
      ],
    },
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
  },
};

function StandardCard({ title, description }) {
  return (
    <article className="h-full rounded-[28px] bg-white p-8 md:p-9 shadow-soft ring-1 ring-black/5">
      <h2 className="font-serif text-[30px] leading-[1.05] tracking-[-0.03em] text-black md:text-[34px]">
        {title}
      </h2>
      <p className="mt-5 text-[17px] leading-[1.6] text-black/75">
        {description}
      </p>
    </article>
  );
}

function CurrenciesDirectCard({ data, cta }) {
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

      <div className="mt-7">
        <div className="relative h-[76px] w-[250px] md:h-[88px] md:w-[290px]">
          <Image
            src="/partners/currencies-direct-logo-display.png"
            alt="Currencies Direct"
            fill
            className="object-contain object-left"
            sizes="290px"
            unoptimized
          />
        </div>
      </div>

      <div className="mt-7">
        <a
          href={data.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-black px-8 text-[13px] font-medium uppercase tracking-[0.22em] text-black transition hover:bg-black hover:text-white"
        >
          {cta}
        </a>
      </div>
    </article>
  );
}

function FinanceCard({ data, cta }) {
  return (
    <article className="rounded-[28px] bg-white p-8 md:p-10 shadow-soft ring-1 ring-black/5 md:col-span-2">
      <div className="max-w-[820px]">
        <h2 className="font-serif text-[34px] leading-[1.05] tracking-[-0.03em] text-black md:text-[42px]">
          {data.title}
        </h2>
        <p className="mt-4 text-[17px] leading-[1.65] text-black/70">
          {data.intro}
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {data.partners.map((partner) => (
          <div
            key={partner.name}
            className="flex h-full flex-col rounded-[22px] bg-[#f7f4ef] p-6 ring-1 ring-black/5 md:p-7"
          >
            <div className="flex min-h-[88px] items-center gap-5">
              <div className="relative h-[76px] w-[90px] shrink-0">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain object-left"
                  sizes="90px"
                  unoptimized
                />
              </div>
              <div className="font-serif text-[25px] leading-tight text-black md:text-[28px]">
                {partner.name}
              </div>
            </div>

            <p className="mt-5 flex-1 text-[16px] leading-[1.65] text-black/72">
              {partner.description}
            </p>

            <div className="mt-6">
              <a
                href={partner.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-black px-6 text-[12px] font-medium uppercase tracking-[0.19em] text-black transition hover:bg-black hover:text-white"
              >
                {cta}
              </a>
            </div>
          </div>
        ))}
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
          <div className="min-h-[220px]">
            <StandardCard {...t.cards[0]} />
          </div>

          <div className="min-h-[220px]">
            <CurrenciesDirectCard data={t.currency} cta={t.cta} />
          </div>

          <FinanceCard data={t.financing} cta={t.cta} />

          <div className="min-h-[220px]">
            <StandardCard {...t.cards[1]} />
          </div>

          <div className="min-h-[220px]">
            <StandardCard {...t.cards[2]} />
          </div>

          <div className="min-h-[220px]">
            <StandardCard {...t.cards[3]} />
          </div>

          <div className="min-h-[220px]">
            <StandardCard {...t.cards[4]} />
          </div>
        </div>
      </section>
    </main>
  );
}
