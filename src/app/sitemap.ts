import type { MetadataRoute } from 'next'
import { getSeoPages } from '@/lib/seo-pages'
import { getAllNewsSlugs } from '@/lib/news'
import { getAiGuides } from '@/lib/ai-guides'

const LANGS = ['fr', 'en'] as const
const SITE_URL = 'https://www.cotedazuragency.com'

const STATIC_URLS = {
  fr: [
    '',
    '/vente',
    '/services',
    '/agence',
    '/actualites',
    '/guides',
    '/agence-immobiliere-cote-d-azur',
    '/agent-immobilier-cote-d-azur',
    '/contact',
    '/mentions-legales',
  ],
  en: [
    '',
    '/vente',
    '/services',
    '/agence',
    '/actualites',
    '/guides',
    '/contact',
    '/mentions-legales',
  ],
} as const

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
  const entries: MetadataRoute.Sitemap = []

  for (const lang of LANGS) {
    for (const path of STATIC_URLS[lang]) {
      entries.push({
        url: `${SITE_URL}/${lang}${path}`,
        changeFrequency:
          path === '' || path === '/actualites' || path === '/guides'
            ? 'weekly'
            : 'monthly',
        priority:
          path === ''
            ? 1.0
            : path === '/agence-immobiliere-cote-d-azur'
              ? 0.9
              : path === '/actualites' || path === '/guides'
                ? 0.8
                : 0.7,
      })
    }
  }

  const seoEntries: MetadataRoute.Sitemap = getSeoPages().map((page) => ({
    url: `${SITE_URL}/${page.lang}/${page.slug}`,
    changeFrequency: 'weekly',
    priority: page.lang === 'fr' ? 0.85 : 0.8,
  }))

  const guideEntries: MetadataRoute.Sitemap = getAiGuides().map((guide) => ({
    url: `${SITE_URL}/${guide.lang}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.82,
  }))

  const newsSlugs: string[] = await getAllNewsSlugs()
  const newsEntries: MetadataRoute.Sitemap = newsSlugs.flatMap((slug) =>
    LANGS.map((lang) => ({
      url: `${SITE_URL}/${lang}/actualites/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    }))
  )

  const saleUrls = await getSaleUrls(SITE_URL)

  return [
    ...entries,
    ...seoEntries,
    ...guideEntries,
    ...newsEntries,
    ...saleUrls,
  ]
}
