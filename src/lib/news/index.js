import { getKeystaticNewsReader } from '@/lib/keystatic-reader';
import { generatedNews, generatedNewsSlugs } from './generated';

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
    partnerName: entry.partnerName || null,
    partnerUrl: entry.partnerUrl || null,
    partnerLogo: entry.partnerLogo || null,
    title: localized.title || '',
    excerpt: localized.excerpt || '',
    content: Array.isArray(localized.content) ? localized.content : [],
  };
}

async function getDraftNews(lang) {
  const { reader, isDraft } = await getKeystaticNewsReader();
  if (!isDraft) return null;

  const items = await reader.collections.news.all();

  return items
    .map((item) => normalizePost(item, lang))
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
}

export async function getAllNews(lang = 'fr') {
  const draftItems = await getDraftNews(lang);
  if (draftItems) return draftItems;

  return generatedNews
    .map((item) => normalizePost(item, lang))
    .filter((post) => post.status === 'published')
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
}

export async function getNewsBySlug(slug, lang = 'fr') {
  const { reader, isDraft } = await getKeystaticNewsReader();

  if (isDraft) {
    const entry = await reader.collections.news.read(slug);
    if (!entry) return null;
    return normalizePost({ slug, entry }, lang);
  }

  const item = generatedNews.find((candidate) => candidate.slug === slug);
  if (!item) return null;

  const post = normalizePost(item, lang);
  if (post.status !== 'published') return null;

  return post;
}

export async function getAllNewsSlugs() {
  return generatedNews
    .filter((item) => (item.entry.status || 'published') === 'published')
    .map((item) => item.slug);
}

export { generatedNewsSlugs };
