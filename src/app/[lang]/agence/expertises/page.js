import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildPageMetadata({
    title: 'Expertises | Côte d’Azur Agency',
    description: lang === 'fr'
      ? 'Une approche moderne et exigeante du marché immobilier sur la Côte d’Azur.'
      : 'A modern and demanding approach to real estate on the French Riviera.',
    lang,
    pathname: `/${lang}/agence/expertises`
  });
}

export default async function ExpertisesPage({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <main className="container py-16">
      <h1 className="font-luxe text-4xl">Expertises</h1>

      <div className="mt-10 card-luxe p-8">
        {lang === 'fr' ? (
          <div className="space-y-5 text-lg leading-relaxed text-zinc-700">
            <p>Le marché immobilier a changé. La manière de chercher doit changer aussi.</p>
            <p>Aujourd’hui, les acquéreurs ne découvrent plus un bien comme hier. Ils explorent, comparent, filtrent et affinent leurs attentes avec des outils de plus en plus puissants. L’intelligence artificielle, la recherche augmentée et l’analyse rapide de l’information transforment déjà la façon dont les clients identifient les meilleures opportunités.</p>
            <p>Dans ce nouveau contexte, le rôle d’une agence ne peut plus se limiter à diffuser des annonces. Il doit être plus précis, plus stratégique, plus réactif.</p>
            <p>C’est la vision de Côte d’Azur Agency. J’accompagne mes clients avec une approche indépendante et sur mesure, en associant expertise terrain, lecture fine du marché local et usage intelligent des nouveaux outils de recherche et d’analyse.</p>
            <p>L’IA ne remplace ni le regard, ni l’expérience, ni la négociation. En revanche, elle permet d’aller plus vite, plus loin, et de concentrer l’attention sur ce qui compte vraiment : les biens pertinents, les bons arbitrages et les bonnes décisions.</p>
            <p>Sur la Côte d’Azur, où chaque projet est singulier, cette approche offre un avantage décisif : moins de dispersion, plus de justesse, et un accompagnement réellement adapté à une clientèle exigeante et internationale.</p>
          </div>
        ) : (
          <div className="space-y-5 text-lg leading-relaxed text-zinc-700">
            <p>The real estate market has changed. The way of searching must evolve as well.</p>
            <p>Today, buyers no longer discover a property the way they used to. They explore, compare, filter and refine their expectations with increasingly powerful tools. Artificial intelligence, enhanced search and rapid information analysis are already transforming the way clients identify the best opportunities.</p>
            <p>In this new context, the role of an agency can no longer be limited to publishing listings. It has to be more precise, more strategic and more responsive.</p>
            <p>That is the vision behind Côte d’Azur Agency. I support my clients through an independent and tailored approach that combines local expertise, deep market understanding and intelligent use of modern research and analysis tools.</p>
            <p>AI does not replace judgement, experience or negotiation. What it does is help move faster, see further and focus on what truly matters: relevant properties, sound trade-offs and the right decisions.</p>
            <p>On the French Riviera, where every project is unique, this approach creates a real advantage: less dispersion, more accuracy, and support truly adapted to a demanding international clientele.</p>
          </div>
        )}
      </div>
    </main>
  );
}
