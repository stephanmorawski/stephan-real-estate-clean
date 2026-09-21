import Image from 'next/image';
import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return buildPageMetadata({
    title: 'Expertises | Côte d’Azur Agency',
    description: lang === 'fr'
      ? 'Une approche moderne et exigeante du marché immobilier sur la Côte d’Azur.'
      : 'A modern and demanding approach to real estate on the French Riviera.',
    lang,
    pathname: `/${lang}/agence/expertises`,
    image: '/images/expertises-jardin-vue-mer.avif',
  });
}

export default async function ExpertisesPage({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const fr = lang === 'fr';
  return <main className="container py-12 md:py-16">
    <h1 className="font-luxe text-4xl">Expertises</h1>

    <section data-expertise-hero className="mt-8 overflow-hidden rounded-[28px] border border-zinc-200 bg-[#f4f1eb]" aria-labelledby="expertise-headline">
      <div className="grid items-center gap-0 lg:grid-cols-[0.95fr_1.25fr]">
        <div className="min-w-0 p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">{fr ? 'Expertise locale · Recherche sur mesure' : 'Local expertise · Tailored property search'}</p>
          <h2 id="expertise-headline" className="mt-5 font-luxe text-3xl leading-tight text-zinc-900 sm:text-4xl lg:text-[40px]">
            <span className="block">{fr ? 'Le marché immobilier a changé.' : 'The real estate market has changed.'}</span>
            <span className="mt-4 block">{fr ? 'La manière de chercher doit changer aussi.' : 'The way of searching must evolve as well.'}</span>
          </h2>
        </div>
        <figure className="min-w-0 bg-zinc-100">
          <Image
            src="/images/expertises-jardin-vue-mer.avif"
            alt={fr ? 'Jardin paysager, palmiers, piscine et vue sur la mer.' : 'Landscaped garden, palm trees, swimming pool and a view of the sea.'}
            width={1000}
            height={666}
            sizes="(min-width: 1280px) 650px, (min-width: 1024px) 55vw, 100vw"
            className="block h-auto w-full"
            preload
          />
        </figure>
      </div>
    </section>

    <section className="mt-9 card-luxe p-6 md:p-9" aria-labelledby="expertise-approach">
      <h2 id="expertise-approach" className="font-luxe text-3xl text-zinc-900">{fr ? 'Le regard terrain, enrichi par les nouveaux outils.' : 'Local judgement, enhanced by modern tools.'}</h2>
      {fr ? <div className="mt-6 grid gap-7 text-lg leading-relaxed text-zinc-700 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-5">
          <p>Aujourd’hui, les acquéreurs ne découvrent plus un bien comme hier. Ils explorent, comparent, filtrent et affinent leurs attentes avec des outils de plus en plus puissants. L’intelligence artificielle, la recherche augmentée et l’analyse rapide de l’information transforment déjà la façon dont les clients identifient les meilleures opportunités.</p>
          <p>Dans ce nouveau contexte, le rôle d’une agence ne peut plus se limiter à diffuser des annonces. Il doit être plus précis, plus stratégique, plus réactif.</p>
          <p>C’est la vision de Côte d’Azur Agency. Nous accompagnons nos clients avec une approche indépendante et sur mesure, en associant expertise terrain, lecture fine du marché local et usage intelligent des nouveaux outils de recherche et d’analyse.</p>
        </div>
        <div className="space-y-5">
          <p>L’IA ne remplace ni le regard, ni l’expérience, ni la négociation. En revanche, elle permet d’aller plus vite, plus loin, et de concentrer l’attention sur ce qui compte vraiment : les biens pertinents, les bons arbitrages et les bonnes décisions.</p>
          <p>Sur la Côte d’Azur, où chaque projet est singulier, cette approche offre un avantage décisif : moins de dispersion, plus de justesse, et un accompagnement réellement adapté à une clientèle exigeante et internationale.</p>
        </div>
      </div> : <div className="mt-6 grid gap-7 text-lg leading-relaxed text-zinc-700 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-5">
          <p>Today, buyers no longer discover a property the way they used to. They explore, compare, filter and refine their expectations with increasingly powerful tools. Artificial intelligence, enhanced search and rapid information analysis are already transforming the way clients identify the best opportunities.</p>
          <p>In this new context, the role of an agency can no longer be limited to publishing listings. It has to be more precise, more strategic and more responsive.</p>
          <p>That is the vision behind Côte d’Azur Agency. We support our clients through an independent and tailored approach that combines local expertise, deep market understanding and intelligent use of modern research and analysis tools.</p>
        </div>
        <div className="space-y-5">
          <p>AI does not replace judgement, experience or negotiation. What it does is help move faster, see further and focus on what truly matters: relevant properties, sound trade-offs and the right decisions.</p>
          <p>On the French Riviera, where every project is unique, this approach creates a real advantage: less dispersion, more accuracy, and support truly adapted to a demanding international clientele.</p>
        </div>
      </div>}
    </section>
  </main>;
}
