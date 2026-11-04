import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';
import { getAllNews } from '@/lib/news';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const title = lang === 'en'
    ? 'Côte d’Azur Agency | Luxury Real Estate on the French Riviera'
    : 'Côte d’Azur Agency | Immobilier de prestige sur la Côte d’Azur';
  const description = lang === 'en'
    ? 'Côte d’Azur Agency advises French and international clients on luxury property sales and acquisitions across the French Riviera.'
    : 'Côte d’Azur Agency accompagne vendeurs et acquéreurs dans leurs projets immobiliers de prestige à Valbonne, Cannes, Mougins, Biot, Antibes et sur la Côte d’Azur.';
  return buildPageMetadata({ title, description, lang, pathname: `/${lang}` });
}

export default async function HomePage({ params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const fr = lang === 'fr';
  const latestNews = (await getAllNews(lang)).slice(0, 3);
  const reviewUrl = `/${lang}/actualites/2026-10-27-temoignage-client-confiance`;

  return (
    <main className="home-page">
      <section className="home-hero">
        <img src="/images/hero-pool.jpg" alt="" className="home-hero-image" fetchPriority="high" />
        <div className="container home-hero-content">
          <div className="home-hero-text">
            <p className="home-kicker">Stephan Morawski · Côte d’Azur Agency</p>
            <h1>{fr ? <>Votre projet immobilier mérite un <em>regard juste.</em></> : <>Your property deserves <em>a clear perspective.</em></>}</h1>
            <p className="home-lead">{fr ? "Depuis plus de dix ans, j’accompagne personnellement mes clients dans les Alpes-Maritimes." : 'For over ten years, I have personally guided my clients across the Alpes-Maritimes.'}</p>
            <p className="home-description">{fr ? 'Mon approche : vous conseiller avec sincérité, estimer votre bien à sa juste valeur et vous accompagner pour vendre dans les meilleures conditions ou trouver le bien qui vous correspond.' : 'My approach: honest advice, an accurate valuation of your property, and personal guidance to sell on the best terms or find the home that is right for you.'}</p>
            <p className="home-signature">Stephan Morawski · Côte d’Azur Agency</p>
            <div className="home-actions">
              <Link href={`/${lang}/contact`} className="home-button">{fr ? 'Me contacter' : 'Contact me'} ↗</Link>
              <a href="#expertise" className="home-button home-button-outline">{fr ? 'Mon approche' : 'My approach'}</a>
            </div>
          </div>
        </div>
        <a href="#expertise" className="home-discover">{fr ? 'Découvrir' : 'Discover'} ↓</a>
      </section>

      <section className="home-section home-about" id="expertise">
        <div className="container home-about-grid">
          <figure className="home-portrait"><img src="/images/founder.jpg" alt="Stephan Morawski" loading="lazy" /></figure>
          <div>
            <p className="home-kicker">{fr ? 'L’expertise, en toute confiance' : 'Expertise you can trust'}</p>
            <h2>{fr ? <>Une relation directe.<br />Un conseil sincère.</> : <>A personal relationship.<br />Honest advice.</>}</h2>
            <p>{fr ? 'Je suis Stephan Morawski, fondatrice de Côte d’Azur Agency. Mon métier est de vous apporter un avis indépendant et précis, loin des estimations de complaisance. Chaque maison, chaque appartement et chaque projet mérite une stratégie adaptée au marché réel.' : 'I am Stephan Morawski, founder of Côte d’Azur Agency. My role is to offer independent, accurate advice and realistic valuations. Every house, apartment and project deserves a strategy tailored to the actual market.'}</p>
            <p>{fr ? 'J’accompagne personnellement vendeurs et acquéreurs dans l’ensemble des Alpes-Maritimes, en français comme en anglais.' : 'I personally support sellers and buyers throughout the Alpes-Maritimes, in both French and English.'}</p>
            <Link className="home-text-link" href={`/${lang}/agence/founder`}>{fr ? 'Découvrir mon parcours' : 'Discover my background'} ↗</Link>
          </div>
        </div>
      </section>

      <section className="home-section home-reviews" id="avis-google">
        <div className="container home-reviews-grid">
          <div>
            <p className="home-kicker">{fr ? 'Ils m’ont fait confiance' : 'Trusted by my clients'}</p>
            <h2>{fr ? 'La confiance se construit dans la durée.' : 'Trust is built over time.'}</h2>
            <p>{fr ? 'Deux ventes, un achat : dix ans d’accompagnement auprès de Maggie et de sa famille.' : 'Two sales, one purchase: ten years of guidance for Maggie and her family.'}</p>
            <a className="home-text-link" href="https://www.google.com/search?q=Stephan+Morawski+C%C3%B4te+d%27Azur+Agency+avis+Google" target="_blank" rel="noopener noreferrer">{fr ? 'Consulter les avis sur Google' : 'View reviews on Google'} ↗</a>
          </div>
          {/* FR: published testimonial; EN: original supplied artwork /news/2026-10-27-maggie-google.png. */}
          <article className="home-review-card">
            <p className="home-stars" aria-label={fr ? 'Avis client : 5 étoiles sur 5' : 'Client review: 5 out of 5 stars'}>★★★★★</p>
            {fr ? <blockquote>« Toujours disponible et très agréable de travailler avec elle. »</blockquote> : <blockquote>“Always available and great to work with.”</blockquote>}
            <footer><strong>Maggie Evans</strong><span>{fr ? 'Avis Google · témoignage publié le 27 octobre 2026' : 'Google review · testimonial published on 27 October 2026'}</span></footer>
            <Link href={reviewUrl} className="home-text-link">{fr ? 'Lire le témoignage original' : 'Read the original testimonial'} ↗</Link>
          </article>
        </div>
      </section>

      {latestNews.length > 0 && <section className="home-section home-news" id="actualites">
        <div className="container">
          <div className="home-news-head">
            <div><p className="home-kicker">{fr ? 'L’actualité de la Côte d’Azur' : 'News from the French Riviera'}</p><h2>{fr ? 'Dernières actualités' : 'Latest news'}</h2></div>
            <Link href={`/${lang}/actualites`} className="home-text-link">{fr ? 'Toutes les actualités' : 'All news'} ↗</Link>
          </div>
          <div className="home-news-grid">
            {latestNews.map(item => <article key={item.id} className="home-news-item">
              {item.image && <Link href={`/${lang}/actualites/${item.slug}`} aria-label={item.title} className="home-news-media"><img src={item.image} alt={item.imageAlt || item.title} loading="lazy" className={/maggie-google|partenariat|logo/i.test(item.image) ? 'home-artwork' : ''} /></Link>}
              <div className="home-news-body">
                <time dateTime={item.publishedAt}>{new Intl.DateTimeFormat(fr ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(item.publishedAt))}</time>
                <h3><Link href={`/${lang}/actualites/${item.slug}`}>{item.title}</Link></h3>
                <p>{item.excerpt}</p>
                <Link href={`/${lang}/actualites/${item.slug}`} className="home-text-link">{fr ? 'Lire l’actualité' : 'Read article'} ↗</Link>
              </div>
            </article>)}
          </div>
        </div>
      </section>}
    </main>
  );
}
