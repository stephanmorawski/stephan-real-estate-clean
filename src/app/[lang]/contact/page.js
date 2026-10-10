import { notFound } from 'next/navigation';
import { isLang, getDict } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';
import { ContactForm } from '@/components/ContactForm';
import { getMandatBySlug } from '@/lib/apimo';

export async function generateMetadata({ params }) {
  const { lang } = await params;

  return buildPageMetadata({
    title: lang === 'fr'
      ? 'Contact immobilier Côte d’Azur | Côte d’Azur Agency'
      : 'Contact French Riviera Real Estate | Côte d’Azur Agency',
    description: lang === 'fr'
      ? 'Contactez Côte d’Azur Agency pour votre projet immobilier à Valbonne et sur la Côte d’Azur.'
      : 'Contact Côte d’Azur Agency for your property project in Valbonne and on the French Riviera.',
    lang,
    pathname: `/${lang}/contact`
  });
}

export default async function ContactPage({ params, searchParams }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const t = await getDict(lang);
  const query = await searchParams;
  const propertySlug = typeof query?.property === 'string' ? query.property : '';

  let property = null;

  if (propertySlug) {
    try {
      const mandat = await getMandatBySlug(propertySlug, lang);

      if (mandat) {
        property = {
          slug: mandat.slug,
          title: mandat.title,
          location: mandat.locationLabel,
          ref: mandat.ref,
          price: mandat.price,
          image: mandat.pictures?.[0] || ''
        };
      }
    } catch (e) {
      console.error('CONTACT_PROPERTY_APIMO_ERROR', e);
    }
  }

  return (
    <main className="container py-16">
      <h1 className="font-luxe text-4xl">{t.contact.title}</h1>
      <p className="mt-3 text-zinc-700">{t.contact.lead}</p>

      <div className="mt-8 max-w-2xl card-luxe p-8">
        <ContactForm t={t} lang={lang} property={property} />
      </div>
    </main>
  );
}
