import { notFound } from 'next/navigation';
import { isLang, getDict } from '@/lib/i18n';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { headers } from 'next/headers';

async function AgencySchema() {
  const nonce = (await headers()).get('x-nonce') || undefined;
  const baseUrl = 'https://www.cotedazuragency.com';
  const organizationId = `${baseUrl}/#organization`;
  const founderId = `${baseUrl}/#stephan-morawski`;
  const websiteId = `${baseUrl}/#website`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['RealEstateAgent', 'Organization'],
        '@id': organizationId,
        name: 'Côte d’Azur Agency',
        alternateName: ["Cote d'Azur Agency", 'Côte d’Azur Agency'],
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/branding/logo-full.png`,
        },
        image: `${baseUrl}/images/hero-pool.jpg`,
        email: 'stephan@cotedazuragency.com',
        telephone: '+33 6 70 74 65 49',
        founder: { '@id': founderId },
        knowsLanguage: ['fr', 'en'],
        address: {
          '@type': 'PostalAddress',
          streetAddress: '296 Chemin Clos de Brasset',
          postalCode: '06560',
          addressLocality: 'Valbonne',
          addressCountry: 'FR',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'real estate enquiries',
          telephone: '+33 6 70 74 65 49',
          email: 'stephan@cotedazuragency.com',
          availableLanguage: ['French', 'English'],
          areaServed: 'FR',
        },
        areaServed: [
          'French Riviera',
          'Côte d’Azur',
          'Valbonne',
          'Mougins',
          'Biot',
          'Cannes',
          'Antibes',
          'Théoule-sur-Mer',
          'Vence',
          'Tourrettes-sur-Loup',
        ],
        sameAs: [
          'https://fr.linkedin.com/company/c%C3%B4tedazuragency',
        ],
      },
      {
        '@type': 'Person',
        '@id': founderId,
        name: 'Stephan Morawski',
        url: `${baseUrl}/fr/agence/founder`,
        jobTitle: 'Founder and real estate advisor',
        worksFor: { '@id': organizationId },
        knowsLanguage: ['French', 'English'],
        sameAs: [
          'https://www.linkedin.com/in/stephan-morawski/',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${baseUrl}/`,
        name: "Côte d'Azur Agency",
        alternateName: ["Cote d'Azur Agency", 'Côte d’Azur Agency'],
        publisher: { '@id': organizationId },
        inLanguage: ['fr-FR', 'en-GB'],
      },
    ],
  };

  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function LangLayout({ children, params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = await getDict(lang);

  return (
    <>
      <AgencySchema />
      <Header lang={lang} t={t} />
      {children}
      <Footer lang={lang} t={t} />
    </>
  );
}
