import CourtImage from '../assets/court.jpeg';

// Events without an uploaded banner show the arena's own court photo.
const DEFAULT_BANNER = CourtImage;

/**
 * Map CMS `event` content → EventsAdmin.jsx card shape.
 * @param {{
 *   id: string,
 *   title: string,
 *   subtitle?: string,
 *   body?: string,
 *   imageUrl?: string,
 *   linkUrl?: string,
 *   isPublished?: boolean,
 *   createdAt?: string,
 * }} c
 */
export function mapCmsContentToEventCard(c) {
  const created = c.createdAt ? new Date(c.createdAt) : null;
  const dateStr = created
    ? created.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return {
    id: c.id,
    listCode: (c.id || '').slice(-6).toUpperCase(),
    title: c.title,
    banner: c.imageUrl?.trim() ? c.imageUrl : DEFAULT_BANNER,
    type: 'EVENT',
    status: c.isPublished ? 'Live' : 'Drafting',
    date: dateStr,
    participants: 0,
    prize: '—',
    venue: c.subtitle?.trim() || 'Arena',
    body: c.body || '',
    linkUrl: c.linkUrl || '',
    categories: c.eventInfo?.categories || [],
    price: (() => {
      const cats = c.eventInfo?.categories || [];
      if (cats.length) return cats.map((x) => `${x.name} ${Number(x.fee) > 0 ? `${Number(x.fee).toFixed(3)}` : 'free'}`).join(' · ');
      const fee = String(c.subtitle || '').split('|')[3]?.trim();
      return fee ? `${fee} OMR` : '—';
    })(),
  };
}
