import type { MetadataRoute } from 'next'

const PRIVATE_PATHS = ['/api/', '/keystatic/', '/preview/']

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.cotedazuragency.com'

  return {
    rules: [
      {
        userAgent: [
          'OAI-SearchBot',
          'ChatGPT-User',
          'Claude-SearchBot',
          'Claude-User',
          'PerplexityBot',
          'Perplexity-User',
        ],
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot'],
        disallow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
