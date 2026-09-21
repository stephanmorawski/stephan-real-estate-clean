import Link from 'next/link';

// Service confirmed by Stephan via the site owner. No invented portfolio,
// pricing, included furnishings or guaranteed sale outcomes are displayed.
export default function HomeStagingSection({ fr }) {
  const lang = fr ? 'fr' : 'en';
  const benefits = fr ? [
    ['Révéler les espaces', 'Mettre en valeur les volumes, la lumière et les atouts du bien.'],
    ['Faciliter la projection', 'Aider les acquéreurs à imaginer leur futur lieu de vie.'],
    ['Soigner la première impression', 'Créer une présentation élégante, harmonieuse et accueillante.'],
  ] : [
    ['Reveal the space', 'Highlight the property’s proportions, natural light and distinctive features.'],
    ['Help buyers picture life there', 'Make it easier for buyers to imagine the property as their future home.'],
    ['Make a considered first impression', 'Create an elegant, harmonious and welcoming presentation.'],
  ];
  return (
    <section id="home-staging" className="mt-10 scroll-mt-36 card-luxe p-6 md:p-9" aria-labelledby="home-staging-title">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.35fr] lg:gap-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">{fr ? 'Préparation à la vente · Home staging' : 'Preparing your property for sale · Home staging'}</p>
          <h3 id="home-staging-title" className="mt-4 font-luxe text-3xl leading-tight md:text-4xl">{fr ? 'Home staging : révéler le potentiel de votre bien.' : 'Home staging: reveal your property’s potential.'}</h3>
          <p className="mt-5 text-lg leading-8 text-zinc-800">{fr ? 'Nous réalisons des prestations de home staging pour mettre en valeur votre propriété et aider les acquéreurs à s’y projeter.' : 'We provide home staging services to showcase your property and help buyers picture themselves living there.'}</p>
          <p className="mt-4 leading-7 text-zinc-700">{fr ? 'Une mise en scène élégante, pensée comme un outil de valorisation au service de votre projet de vente.' : 'An elegant presentation, designed to bring out your property’s qualities as part of your sales strategy.'}</p>
        </div>
        <div className="space-y-4 leading-7 text-zinc-700">
          <p>{fr ? 'Un espace vide, un intérieur très personnel ou une présentation insuffisamment soignée peuvent rendre la projection difficile. Même de beaux volumes, une belle lumière ou un emplacement de qualité ne suffisent pas toujours à faire percevoir immédiatement le potentiel d’un bien.' : 'Empty rooms, a highly personal interior or a property that has not been presented at its best can make it difficult for buyers to see its potential. Generous proportions, natural light and a desirable location do not always tell the whole story at first glance.'}</p>
          <p>{fr ? 'Le home staging va au-delà de la décoration. Il vise à rendre les espaces plus lisibles, à souligner leurs atouts et à créer une atmosphère dans laquelle les visiteurs peuvent imaginer leur futur lieu de vie.' : 'Home staging goes beyond decoration. It makes the layout easier to understand, highlights the property’s strengths and creates an atmosphere in which viewers can imagine their future home.'}</p>
          <p>{fr ? 'Dans l’immobilier haut de gamme, une présentation harmonieuse et soignée aide les acquéreurs à apprécier un lieu prêt à vivre ou plus facile à s’approprier. Une mise en scène équilibrée peut aussi parler à une clientèle internationale aux sensibilités variées.' : 'In the high-end property market, a harmonious, thoughtfully presented interior can help buyers appreciate a home that feels ready to enjoy or easier to make their own. A balanced presentation can also appeal to international buyers with different tastes.'}</p>
          <p>{fr ? 'L’objectif est de rendre le bien plus lisible, plus attractif et plus facile à s’approprier, tout en renforçant son impact dès les premières impressions et lors des visites.' : 'The aim is to make the property easier to understand, more inviting and easier to connect with, strengthening its impact from the first impression through to the viewing.'}</p>
        </div>
      </div>
      <div className="mt-8 grid gap-5 border-t border-zinc-200 pt-7 md:grid-cols-3">{benefits.map(([title, text]) => <div key={title}><h4 className="font-luxe text-xl text-zinc-900">{title}</h4><p className="mt-2 text-sm leading-6 text-zinc-700">{text}</p></div>)}</div>
      <div className="mt-8 border-t border-zinc-200 pt-7">
        <p className="max-w-3xl text-sm leading-6 text-zinc-600">{fr ? 'Le home staging représente un investissement à apprécier selon le bien et la stratégie de vente. Échangeons sur les interventions à envisager, leur périmètre et leur budget, sans garantie de prix ou de délai de vente.' : 'Home staging is an investment to consider in relation to the property and the sales strategy. Let’s discuss the work to consider, its scope and budget, without any guarantee of a selling price or timescale.'}</p>
        <Link className="btn-gold inline-flex mt-5 text-center" href={`/${lang}/contact?projet=vente`} data-conversion="home_staging_contact">{fr ? 'Parlons de la mise en valeur de votre bien' : 'Discuss how to showcase your property'}</Link>
      </div>
    </section>
  );
}
