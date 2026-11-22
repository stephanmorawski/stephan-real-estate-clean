import { notFound } from 'next/navigation';
import SeoLandingPage from '@/components/SeoLandingPage';
import { buildPageMetadata } from '@/lib/seo';

const page = {
  lang: 'en',
  slug: 'luxury-villa-for-sale-french-riviera',
  title: 'Luxury Villas & Homes for Sale on the French Riviera',
  description:
    'Search for luxury villas and homes for sale on the French Riviera with local guidance across Cannes, Mougins, Valbonne, Biot and Théoule-sur-Mer.',
  h1: 'Luxury villas and homes for sale on the French Riviera',
  kicker: 'Sea-view villas · family homes · discreet property searches',
  lead:
    'A focused property search for buyers comparing luxury villas, houses and second homes across the French Riviera, from residential family markets to rare sea-view locations.',
  cta: 'Discuss a villa search',
  keywords: [
    'luxury villas for sale French Riviera',
    'French Riviera villas for sale',
    'French Riviera homes for sale',
    'buy villa French Riviera',
    "luxury villas Côte d’Azur",
  ],
  sections: [
    {
      heading: 'Luxury villas, houses and homes for sale',
      body:
        'The search should begin with the intended lifestyle and micro-location: year-round family living near international schools, proximity to Cannes and Nice airport, sea views, privacy, outdoor space, architectural quality or a property suitable for a second home. Valbonne, Biot, Mougins, Cannes and Théoule-sur-Mer answer different priorities and should be compared accordingly.',
    },
    {
      heading: 'How to buy a villa on the French Riviera',
      body:
        'A structured acquisition combines a precise brief, a realistic review of asking prices, targeted viewings and appropriate legal and technical due diligence. Côte d’Azur Agency coordinates the search and transaction with the relevant professionals, including the notaires, from the initial selection through the offer and completion stages.',
    },
    {
      heading: 'Selling a luxury villa to qualified buyers',
      body:
        'A successful sale depends on an evidence-based valuation, careful property presentation, qualified enquiries and consistent follow-up. The agency remains involved throughout negotiations, document collection and exchanges with the notaires so that the transaction can progress efficiently to the final deed.',
    },
  ],
};

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (lang !== 'en') return {};

  return buildPageMetadata({
    title: page.title,
    description: page.description,
    lang: 'en',
    pathname: '/en/luxury-villa-for-sale-french-riviera',
    includeLanguageAlternates: false,
  });
}

export default async function LuxuryVillaFrenchRivieraPage({ params }) {
  const { lang } = await params;
  if (lang !== 'en') notFound();

  return <SeoLandingPage page={page} lang="en" />;
}
