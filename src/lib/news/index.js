import { getKeystaticNewsReader } from '@/lib/keystatic-reader';

function normalizePost({ slug, entry }, lang = 'fr') {
  const localized = entry[lang] || entry.fr || {};

  return {
    id: slug,
    slug,
    status: entry.status || 'published',
    publishedAt: entry.publishedAt || '',
    source: entry.source || 'LinkedIn',
    linkedinUrl: entry.linkedinUrl || null,
    image: entry.imageUpload || entry.image || '/images/hero-pool.jpg',
    title: localized.title || '',
    excerpt: localized.excerpt || '',
    content: Array.isArray(localized.content) ? localized.content : [],
  };
}

export async function getAllNews(lang = 'fr') {
  const { reader, isDraft } = await getKeystaticNewsReader();
  const items = await reader.collections.news.all();

  return items
    .map((item) => normalizePost(item, lang))
    .filter((post) => isDraft || post.status === 'published')
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
}

export async function getNewsBySlug(slug, lang = 'fr') {
  const { reader, isDraft } = await getKeystaticNewsReader();
  const entry = await reader.collections.news.read(slug);

  if (!entry) return null;

  const post = normalizePost({ slug, entry }, lang);
  if (!isDraft && post.status !== 'published') return null;

  return post;
}

export async function getAllNewsSlugs() {
  const { reader } = await getKeystaticNewsReader();
  const items = await reader.collections.news.all();

  return items
    .filter((item) => (item.entry.status || 'published') === 'published')
    .map((item) => item.slug);
}
