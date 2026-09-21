import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLang, getDict } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';
import { getAllNews } from '@/lib/news';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const title = lang === 'en' ? 'French Riviera Property Sales & Buying Support | Côte d’Azur Agency' : 'Vendre ou acheter sur la Côte d’Azur et dans l’arrière-pays | Côte d’Azur Agency';
  const description = lang === 'en' ? 'Sell or buy on the French Riviera and in its hinterland. Property valuation and local guidance in French and English with Côte d’Azur Agency.' : 'Vendez ou achetez sur la Côte d’Azur et dans l’arrière-pays. Estimation et accompagnement immobilier en français et en anglais avec Côte d’Azur Agency.';
  return buildPageMetadata({ title, description, lang, pathname: `/${lang}` });
}

export default async function HomePage({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const fr = lang === 'fr';
  const t = await getDict(lang);
  const latestNews = (await getAllNews(lang)).slice(0, 3);
  return <main>
    <section className="relative overflow-hidden bg-black text-white">
      <img src="/images/hero-pool.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80"/>
      <div className="absolute inset-0 bg-black/35"/>
      <div className="relative container py-16 md:py-24"><div className="max-w-3xl">
        <p className="text-sm uppercase tracking-widest">Côte d’Azur Agency</p>
        <h1 className="font-luxe text-4xl leading-tight md:text-6xl mt-4">{fr ? 'Votre projet immobilier, accompagné par un interlocuteur local.' : 'Your property plans, supported by a local point of contact.'}</h1>
        <p className="mt-5 max-w-2xl text-lg text-white/90 md:text-xl">{fr ? 'Vendre ou acheter sur la Côte d’Azur et dans l’arrière-pays. Nous vous accompagnons en français et en anglais.' : 'Sell or buy on the French Riviera and in its hinterland. We support you in French and English.'}</p>
        <div className="mt-8 flex flex-wrap gap-4"><Link href={`/${lang}/contact?projet=estimation`} className="btn-gold" data-conversion="valuation_contact">{fr ? 'Faire estimer mon bien' : 'Discuss my property’s value'}</Link><Link href={`/${lang}/contact?projet=achat`} className="btn-dark" data-conversion="buyer_contact">{fr ? 'Confier ma recherche' : 'Discuss my search'}</Link></div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3"><Link href={`/${lang}/vente`} className="underline underline-offset-4">{fr ? 'Voir les biens à la vente' : 'View available properties'} →</Link><Link href={`/${lang}/services#secteurs`} className="underline underline-offset-4">{fr ? 'Découvrir nos secteurs' : 'Explore our areas'} →</Link></div>
      </div></div>
    </section>

    <section className="container py-14"><div className="grid gap-6 md:grid-cols-2">
      <article className="card-luxe p-8"><h2 className="font-luxe text-3xl">{fr ? 'Vous vendez' : 'You are selling'}</h2><p className="mt-4 leading-7 text-zinc-700">{fr ? 'Comprendre votre bien, argumenter son positionnement et convenir d’une stratégie de commercialisation. Découvrez comment se prépare l’accompagnement.' : 'Understand your property, discuss its positioning and agree a marketing strategy. See how the engagement is prepared.'}</p><Link className="inline-block mt-5 underline underline-offset-4" href={`/${lang}/services#vendre`}>{fr ? 'L’accompagnement vendeur' : 'Our seller services'} →</Link></article>
      <article className="card-luxe p-8"><h2 className="font-luxe text-3xl">{fr ? 'Vous achetez' : 'You are buying'}</h2><p className="mt-4 leading-7 text-zinc-700">{fr ? 'Préciser les secteurs, le budget et les critères indispensables, puis organiser une sélection et des visites adaptées à votre projet.' : 'Clarify preferred areas, budget and essential features, then organize a selection and viewings around your plans.'}</p><Link className="inline-block mt-5 underline underline-offset-4" href={`/${lang}/services#acheter`}>{fr ? 'L’accompagnement acquéreur' : 'Our buyer services'} →</Link></article>
    </div></section>

    <section className="container pb-14"><div className="card-luxe p-8"><h2 className="font-luxe text-3xl">{t.home.introTitle}</h2><p className="mt-4 text-zinc-700">{t.home.introText}</p><p className="mt-4 text-zinc-700">{t.home.introText2}</p><Link className="inline-block mt-5 underline underline-offset-4" href={`/${lang}/agence`}>{fr ? 'Rencontrer votre interlocuteur' : 'Meet your local contact'} →</Link></div></section>

    {latestNews.length > 0 ? <section className="container pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C6A46C]">{fr ? 'Actualités' : 'News'}</div><h2 className="mt-2 font-luxe text-3xl">{fr ? 'Dernières actualités' : 'Latest news'}</h2></div><Link href={`/${lang}/actualites`} className="text-sm font-medium text-zinc-800 underline underline-offset-4">{fr ? 'Voir toutes les actualités' : 'View all news'}</Link></div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">{latestNews.map(item => <article key={item.id} className="card-luxe overflow-hidden">{item.image ? <div className="aspect-[16/10] bg-zinc-100"><img src={item.image} alt={item.title} className="h-full w-full object-cover"/></div> : null}<div className="p-6"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C6A46C]">{item.source}</div><h3 className="mt-3 font-luxe text-2xl text-zinc-900">{item.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-700">{item.excerpt}</p><div className="mt-4 text-xs text-zinc-500">{item.publishedAt}</div><Link href={`/${lang}/actualites/${item.slug}`} className="mt-5 inline-flex rounded-full border border-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-900">{fr ? 'Lire l’actualité' : 'Read article'}</Link></div></article>)}</div>
    </section> : null}
  </main>;
}
