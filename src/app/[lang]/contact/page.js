import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLang, getDict } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';
import { ContactForm } from '@/components/ContactForm';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return buildPageMetadata({
    title: lang === 'fr' ? 'Contact immobilier Côte d’Azur | Côte d’Azur Agency' : 'Contact French Riviera Real Estate | Côte d’Azur Agency',
    description: lang === 'fr' ? 'Contactez Côte d’Azur Agency pour votre projet immobilier à Valbonne et sur la Côte d’Azur.' : 'Contact Côte d’Azur Agency for your property project in Valbonne and on the French Riviera.',
    lang, pathname: `/${lang}/contact`,
  });
}

export default async function ContactPage({ params, searchParams }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = await getDict(lang);
  const query = await searchParams;
  const fr = lang === 'fr';
  // Only predefined intent labels may be included in a message; never echo raw query input.
  const projects = fr ? {
    estimation: { label: 'Estimation', title: 'Parlons de la valeur de votre bien.', hint: 'Commune, type de bien, caractéristiques principales et calendrier envisagé.' },
    vente: { label: 'Vente', title: 'Préparons la vente de votre bien.', hint: 'Commune, type de bien, objectifs et calendrier envisagé.' },
    achat: { label: 'Achat', title: 'Précisez votre recherche immobilière.', hint: 'Secteurs souhaités, budget envisagé, calendrier et critères indispensables.' },
  } : {
    estimation: { label: 'Valuation', title: 'Discuss your property’s value.', hint: 'Location, property type, main features and your planned timing.' },
    vente: { label: 'Selling', title: 'Prepare the sale of your property.', hint: 'Location, property type, objectives and your planned timing.' },
    achat: { label: 'Buying', title: 'Tell us about your property search.', hint: 'Preferred areas, indicative budget, timing and essential features.' },
  };
  const key = typeof query?.projet === 'string' && Object.hasOwn(projects, query.projet) ? query.projet : '';
  const project = key ? projects[key] : null;
  return <main className="container py-16">
    <h1 className="font-luxe text-4xl">{project?.title || t.contact.title}</h1>
    <p className="mt-3 text-zinc-700">{project?.hint || t.contact.lead}</p>
    <div className="mt-8 max-w-2xl card-luxe p-8"><ContactForm key={key || 'general'} t={t} projectLabel={project?.label || ''} messagePlaceholder={project?.hint || ''}/></div>
    <p className="mt-5 text-sm text-zinc-600">{fr ? 'N’envoyez pas de documents sensibles dans ce premier message.' : 'Please do not send sensitive documents in your first message.'}</p>
    <Link className="inline-block mt-5 underline underline-offset-4" href={`/${lang}/services`}>{fr ? 'Revoir les accompagnements vendeurs et acquéreurs' : 'Review our selling and buying services'}</Link>
  </main>;
}
