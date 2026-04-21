const PLACEHOLDER =
  'https://images.unsplash.com/photo-1626224583764-f87db24d4d83?w=1200&q=80';

export function mapCmsHeroForHome(content) {
  const cta = (content.body || '').trim();
  return {
    id: content.id,
    title: content.title || 'Featured',
    subtitle: content.subtitle || '',
    buttonText: cta || 'Explore',
    image: (content.imageUrl || '').trim() || PLACEHOLDER,
    link: (content.linkUrl || '').trim() || '/arenas',
  };
}

export function mapCmsCategoryForHome(content, index = 0) {
  return {
    id: content.id,
    title: content.title || 'Category',
    image: (content.imageUrl || '').trim() || PLACEHOLDER,
    link: (content.linkUrl || '').trim() || '/arenas',
    delay: index * 0.05,
  };
}
