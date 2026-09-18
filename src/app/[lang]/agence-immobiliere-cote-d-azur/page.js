import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const isFr = lang === 'fr';

  return buildPageMetadata({
    title: isFr
      ? "Agence immobilière Côte d’Azur | Côte d’Azur Agency"
      : "French Riviera Real Estate Agency | Côte d’Azur Agency",
    description: isFr
      ? "Agence immobilière de prestige sur la Côte d’Azur : achat, vente et recherche sur mesure à Valbonne, Mougins, Biot, Cannes et Théoule-sur-Mer."
      : "Luxury real estate agency on the French Riviera for tailored property sales and acquisitions in Valbonne, Mougins, Biot, Cannes and Théoule-sur-Mer.",
    lang,
    pathname: isFr ? '/fr/agence-immobiliere-cote-d-azur' : '/en/agence-immobiliere-cote-d-azur',
    image: '/images/hero-pool.jpg'
  });
}

export default async function Page({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const isFr = lang === 'fr';

  return (
    <main>
      <section className="relative overflow-hidden bg-black text-white">
        <img
          src="/images/hero-pool.jpg"
          alt={isFr ? "Villa avec piscine sur la Côte d’Azur" : "Luxury villa with pool on the French Riviera"}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black/35"></div>
        <div className="relative container py-16 md:py-24">
          <div className="max-w-4xl">
            <h1 className="font-luxe text-4xl leading-tight md:text-6xl lg:text-[64px]">
              {isFr ? "Agence immobilière sur la Côte d’Azur" : "Real estate agency on the French Riviera"}
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-white/90">
              {isFr
                ? "Côte d’Azur Agency accompagne les projets immobiliers haut de gamme sur la Côte d’Azur, avec une approche confidentielle, exigeante et sur mesure."
                : "Côte d’Azur Agency supports high-end real estate projects on the French Riviera with a confidential, selective and tailored approach."}
            </p>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="card-luxe p-8">
          <h2 className="font-luxe text-3xl">
            {isFr ? "Un accompagnement premium, ancré localement" : "A premium service with genuine local roots"}
          </h2>
          <p className="mt-4 text-zinc-700">
            {isFr
              ? "Notre agence immobilière intervient sur la Côte d’Azur avec un positionnement orienté qualité, discrétion et personnalisation. Nous accompagnons les projets d’achat, de vente et de recherche ciblée de villas, appartements et propriétés de prestige, depuis la qualification du besoin jusqu’à la négociation et à la coordination des étapes de la transaction."
              : "Our agency operates across the French Riviera with a quality-driven, discreet and highly personalised approach. We support purchases, sales and targeted searches for villas, apartments and prime residences, from the initial brief through negotiation and coordination of the transaction."}
          </p>
          <p className="mt-4 text-zinc-700">
            {isFr
              ? "Nos zones de prédilection couvrent notamment Valbonne, Mougins, Biot, Cannes, Théoule-sur-Mer, Antibes et les secteurs résidentiels recherchés des Alpes-Maritimes. Cette connaissance locale permet d’adapter le positionnement d’un bien, la stratégie de commercialisation et la sélection des opportunités au profil réel du marché."
              : "Our preferred areas include Valbonne, Mougins, Biot, Cannes, Théoule-sur-Mer, Antibes and other sought-after residential markets in the Alpes-Maritimes. This local knowledge helps align property positioning, marketing strategy and opportunity selection with real market conditions."}
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article>
              <h2 className="font-luxe text-2xl">
                {isFr ? "Acheter sur la Côte d’Azur" : "Buying on the French Riviera"}
              </h2>
              <p className="mt-3 text-zinc-700">
                {isFr
                  ? "Nous aidons les acquéreurs à structurer leurs critères, comparer les micro-marchés et concentrer les visites sur des biens cohérents avec leur projet, leur budget et leur calendrier."
                  : "We help buyers structure their criteria, compare local micro-markets and focus visits on properties aligned with their project, budget and timetable."}
              </p>
            </article>
            <article>
              <h2 className="font-luxe text-2xl">
                {isFr ? "Vendre un bien de prestige" : "Selling a prime property"}
              </h2>
              <p className="mt-3 text-zinc-700">
                {isFr
                  ? "Pour les vendeurs, l’enjeu est de définir un prix défendable, une présentation adaptée et une diffusion cohérente avec le niveau de confidentialité souhaité afin d’attirer des acquéreurs qualifiés."
                  : "For sellers, the focus is on a defensible asking price, appropriate presentation and a marketing approach consistent with the desired level of discretion, in order to attract qualified buyers."}
              </p>
            </article>
            <article>
              <h2 className="font-luxe text-2xl">
                {isFr ? "Des marchés locaux très différents" : "Distinct local property markets"}
              </h2>
              <p className="mt-3 text-zinc-700">
                {isFr
                  ? "Une villa familiale à Valbonne, une propriété à Mougins ou une résidence avec vue mer à Cannes ou Théoule-sur-Mer ne répondent pas aux mêmes attentes. Notre approche tient compte de ces différences de marché."
                  : "A family villa in Valbonne, a property in Mougins or a sea-view residence in Cannes or Théoule-sur-Mer serve different buyer expectations. Our approach reflects those local market differences."}
              </p>
            </article>
          </div>

          <div className="mt-10">
            <h2 className="font-luxe text-2xl">
              {isFr ? "Explorer nos expertises locales" : "Explore our local expertise"}
            </h2>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
              {isFr ? (
                <>
                  <a href="/fr/agence-immobiliere-valbonne">Agence immobilière Valbonne</a>
                  <a href="/fr/agence-immobiliere-biot">Immobilier à Biot</a>
                  <a href="/fr/immobilier-prestige-mougins">Immobilier de prestige à Mougins</a>
                  <a href="/fr/appartement-vue-mer-cannes">Immobilier vue mer à Cannes</a>
                  <a href="/fr/villa-vue-mer-theoule-sur-mer">Villas à Théoule-sur-Mer</a>
                </>
              ) : (
                <>
                  <a href="/en/french-riviera-real-estate">French Riviera real estate</a>
                  <a href="/en/luxury-villa-for-sale-french-riviera">Luxury villas on the French Riviera</a>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a className="btn-gold" href={isFr ? "/fr/contact" : "/en/contact"}>
              {isFr ? "Contacter l’agence" : "Contact the agency"}
            </a>
            <a className="btn-dark" href={isFr ? "/fr/vente" : "/en/vente"}>
              {isFr ? "Voir les biens à la vente" : "View properties for sale"}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
