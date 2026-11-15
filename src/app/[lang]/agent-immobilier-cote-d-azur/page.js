import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const isFr = lang === 'fr';

  return buildPageMetadata({
    title: isFr
      ? "Agent immobilier Côte d’Azur | Côte d’Azur Agency"
      : "French Riviera Property Advisor | Côte d’Azur Agency",
    description: isFr
      ? "Agent immobilier sur la Côte d’Azur pour un accompagnement discret et sur mesure dans les projets de vente, d’acquisition et de recherche de biens haut de gamme."
      : "Property advisor on the French Riviera for discreet, tailored support in acquisition, sale and high-end property search projects.",
    lang,
    pathname: isFr ? '/fr/agent-immobilier-cote-d-azur' : '/en/agent-immobilier-cote-d-azur',
    image: '/images/hero-pool.jpg',
    // The English route now redirects to the dedicated property guide.
    includeLanguageAlternates: false,
  });
}

export default async function Page({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const isFr = lang === 'fr';

  return (
    <main>
      <section className="container py-16 md:py-24">
        <div className="card-luxe p-8 md:p-12">
          <h1 className="font-luxe text-4xl leading-tight md:text-6xl">
            {isFr ? "Agent immobilier sur la Côte d’Azur" : "Property advisor on the French Riviera"}
          </h1>
          <p className="mt-6 max-w-3xl text-zinc-700">
            {isFr
              ? "Côte d’Azur Agency propose un accompagnement exigeant pour les projets immobiliers sur la Côte d’Azur, en privilégiant la qualité de sélection, la discrétion et la compréhension fine du marché."
              : "Côte d’Azur Agency provides a selective and refined approach to real estate projects on the French Riviera, with a strong focus on market understanding, discretion and quality of execution."}
          </p>
          <p className="mt-4 max-w-3xl text-zinc-700">
            {isFr
              ? "Nous intervenons sur les projets de vente, d’acquisition, de valorisation et de recherche ciblée dans des secteurs comme Valbonne, Vence ou Tourrettes-sur-Loup."
              : "We support sales, acquisitions, asset positioning and targeted searches in areas such as Valbonne, Vence and Tourrettes-sur-Loup."}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a className="btn-gold" href={isFr ? "/fr/contact" : "/en/contact"}>
              {isFr ? "Échanger avec nous" : "Get in touch"}
            </a>
            <a className="btn-dark" href={isFr ? "/fr/agence" : "/en/agence"}>
              {isFr ? "Découvrir l’agence" : "Discover the agency"}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}