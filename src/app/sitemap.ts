import type { MetadataRoute } from 'next'
import { getSeoPages } from '@/lib/seo-pages'
import { getAllNewsSlugs } from '@/lib/news'

const LANGS = ['fr', 'en'] as const
const SITE_URL = 'https://www.cotedazuragency.com'

async function getSaleUrls(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    const { getMandats } = await import('@/lib/apimo')
    const entries: MetadataRoute.Sitemap = []

    for (const lang of LANGS) {
      const items = await getMandats(lang)

      for (const item of items || []) {
        if (!item?.slug) continue

        entries.push({
          url: `${baseUrl}/${lang}/vente/${item.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    }

    return entries
  } catch (error) {
    console.error('SITEMAP_SALE_URLS_ERROR', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls = [
    '',
    '/vente',
    '/services',
    '/agence',
    '/agence-cote-dazur',
    '/agence-immobiliere-cote-d-azur',
    '/agent-immobilier-cote-d-azur',
    '/cote-d-azur-real-estate',
    '/contact',
    '/mentions-legales',
  ]

  const entries: MetadataRoute.Sitemap = []

  for (const lang of LANGS) {
    for (const path of staticUrls) {
      entries.push({
        url: `${SITE_URL}/${lang}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority:
          path === ''
            ? 1.0
            : (
                path === '/agence-cote-dazur' ||
                path === '/agence-immobiliere-cote-d-azur' ||
                path === '/agent-immobilier-cote-d-azur' ||
                path === '/cote-d-azur-real-estate'
              )
            ? 0.9
            : 0.7,
      })
    }
  }

  const seoEntries: MetadataRoute.Sitemap = getSeoPages().map((page) => ({
    url: `${SITE_URL}/${page.lang}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: page.lang === 'fr' ? 0.85 : 0.8,
  }))

  const newsSlugs = await getAllNewsSlugs()
  const newsEntries: MetadataRoute.Sitemap = newsSlugs.flatMap((slug) =>
    LANGS.map((lang) => ({
      url: `${SITE_URL}/${lang}/actualites/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    }))
  )

  const saleUrls = await getSaleUrls(SITE_URL)

  return [...entries, ...seoEntries, ...newsEntries, ...saleUrls]
}
