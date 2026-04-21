const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80';

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
  };
}
