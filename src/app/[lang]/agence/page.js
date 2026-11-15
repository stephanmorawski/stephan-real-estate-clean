import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildPageMetadata({
    title: lang === 'fr'
      ? 'À propos de Côte d’Azur Agency | Stephan Morawski'
      : 'About Côte d’Azur Agency | Stephan Morawski',
    description: lang === 'fr'
      ? 'Découvrez le parcours de Stephan Morawski, l’approche indépendante de Côte d’Azur Agency et son réseau de partenaires dans les Alpes-Maritimes.'
      : 'Meet Stephan Morawski and discover Côte d’Azur Agency’s independent approach, local expertise and trusted partner network in the Alpes-Maritimes.',
    lang,
    pathname: `/${lang}/agence`
  });
}

const cards = {
  fr: [
    {
      title: 'Fondateur',
      text: 'Le parcours de Stephan Morawski, sa culture du service et son approche de l’immobilier sur la Côte d’Azur.',
      href: '/agence/founder',
      cta: 'Découvrir'
    },
    {
      title: 'Expertises',
      text: 'Une lecture moderne du marché, enrichie par l’expertise terrain et les nouveaux outils de recherche.',
      href: '/agence/expertises',
      cta: 'Explorer'
    },
    {
      title: 'Guides',
      text: 'Des réponses structurées sur le choix d’un conseiller, le mandat de recherche, la valorisation et le processus d’achat.',
      href: '/guides',
      cta: 'Lire les guides'
    },
    {
      title: 'Partenaires',
      text: 'Un réseau de partenaires de confiance pour accompagner chaque projet avec précision.',
      href: '/agence/partenaires',
      cta: 'Voir plus'
    }
  ],
  en: [
    {
      title: 'Founder',
      text: 'Stephan Morawski’s background, service culture and approach to French Riviera real estate.',
      href: '/agence/founder',
      cta: 'Discover'
    },
    {
      title: 'Expertise',
      text: 'A modern reading of the market, combining local expertise with intelligent research tools.',
      href: '/agence/expertises',
      cta: 'Explore'
    },
    {
      title: 'Guides',
      text: 'Structured answers on choosing an advisor, search mandates, property valuation and the buying process.',
      href: '/guides',
      cta: 'Read the guides'
    },
    {
      title: 'Partners',
      text: 'A trusted network of partners to support each project with precision.',
      href: '/agence/partenaires',
      cta: 'Learn more'
    }
  ]
};

export default async function AgencePage({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const list = cards[lang] || cards.fr;

  return (
    <main className="container py-16">
      <h1 className="font-luxe text-4xl">
        {lang === 'fr' ? 'À propos de Côte d’Azur Agency' : 'About Côte d’Azur Agency'}
      </h1>
      <p className="mt-3 max-w-3xl text-zinc-700">
        {lang === 'fr'
          ? 'Découvrez Stephan Morawski, sa méthode de conseil immobilier indépendant, son parcours et les expertises réunies par Côte d’Azur Agency.'
          : 'Meet Stephan Morawski and discover the independent advisory approach, background and trusted expertise behind Côte d’Azur Agency.'}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {list.map((item) => (
          <div key={item.title} className="card-luxe flex flex-col p-8">
            <h2 className="font-luxe text-3xl text-zinc-900">{item.title}</h2>
            <p className="mt-4 flex-1 text-zinc-700">{item.text}</p>
            <div className="mt-8">
              <Link
                href={`/${lang}${item.href}`}
                className="inline-flex rounded-full border border-zinc-900 px-6 py-3 text-sm font-medium text-zinc-900"
              >
                {item.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
