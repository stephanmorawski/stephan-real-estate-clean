import Link from 'next/link';

const seoLinks = {
  fr: [
    ['Valbonne', '/fr/agence-immobiliere-valbonne'],
    ['Biot', '/fr/agence-immobiliere-biot'],
    ['Mougins', '/fr/immobilier-prestige-mougins'],
    ['Cannes', '/fr/appartement-vue-mer-cannes'],
    ['Théoule-sur-Mer', '/fr/villa-vue-mer-theoule-sur-mer'],
    ['Estimation Côte d’Azur', '/fr/estimation-immobiliere-cote-azur'],
  ],
  en: [
    ['French Riviera real estate', '/en/french-riviera-real-estate'],
    ['Luxury villas French Riviera', '/en/luxury-villa-for-sale-french-riviera'],
  ],
};

export function Footer({ lang, t }) {
  const localLinks = seoLinks[lang] || seoLinks.fr;

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="container py-10 text-sm text-zinc-700">
        <div className="home-footer-contact">
          <div><img src="/branding/logo-full.png" alt="Côte d’Azur Agency" width="190" height="110" /><p>Stephan Morawski<br />{lang === 'fr' ? 'Votre interlocutrice immobilière dans les Alpes-Maritimes.' : 'Your property advisor in the Alpes-Maritimes.'}</p></div>
          <div><h2>{lang === 'fr' ? 'Parlons de votre projet.' : 'Let’s discuss your project.'}</h2><a href="mailto:stephan@cotedazuragency.com">stephan@cotedazuragency.com</a><a href="tel:+33670746549">+33 (0)6 70 74 65 49</a><Link href={`/${lang}/contact`}>{lang === 'fr' ? 'Prendre contact' : 'Get in touch'} ↗</Link></div>
        </div>
        <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:items-start">
          <div>
            <div className="font-medium text-zinc-900">Côte d’Azur Agency</div>
            <div className="mt-3 flex gap-4">
              <Link href={`/${lang}/mentions-legales`}>{t.nav.legal}</Link>
              <Link href={`/${lang}/contact`}>{t.nav.contact}</Link>
            </div>
          </div>

          <nav aria-label={lang === 'fr' ? 'Expertise immobilière locale' : 'French Riviera real estate expertise'}>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {lang === 'fr' ? 'Expertise locale' : 'Explore the French Riviera'}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {localLinks.map(([label, href]) => (
                <Link key={href} href={href} className="hover:text-zinc-950">
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}
