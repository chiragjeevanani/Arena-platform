/**
 * Maps CMS `event` rows to user-app event shapes.
 *
 * Optional subtitle layout (pipe-separated) for detail meta:
 *   `Date | Time | Venue | Price | …extra tagline`
 * If fewer than 4 parts, remaining detail fields fall back to sensible defaults.
 */

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1626224583764-f87db24d4d83?w=1200&q=80';

export function isCmsEventId(id) {
  if (id == null || typeof id !== 'string') return false;
  return /^[a-f\d]{24}$/i.test(id);
}

export function inferEventCategory(title, subtitle) {
  const blob = `${title || ''} ${subtitle || ''}`.toLowerCase();
  if (blob.includes('badminton')) return 'Badminton';
  if (blob.includes('table tennis') || blob.includes('ping pong')) return 'Table Tennis';
  const colon = (title || '').indexOf(':');
  if (colon > 0) {
    const tag = (title || '').slice(0, colon).trim();
    if (['Badminton', 'Table Tennis', 'General'].includes(tag)) return tag;
  }
  return 'General';
}

function parseSubtitlePipe(subtitle) {
  if (!subtitle || typeof subtitle !== 'string') {
    return { tagline: '', date: '', time: '', location: '', price: '' };
  }
  const parts = subtitle.split('|').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 4) {
    const [date, time, location, price, ...rest] = parts;
    return {
      date,
      time,
      location,
      price,
      tagline: rest.join(' · '),
    };
  }
  if (parts.length === 1) {
    return { tagline: parts[0], date: '', time: '', location: '', price: '' };
  }
  return {
    date: parts[0] || '',
    time: parts[1] || '',
    tagline: parts.slice(2).join(' · '),
    location: '',
    price: '',
  };
}

export function parseHighlightsFromBody(body) {
  if (!body || typeof body !== 'string') return [];
  return body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^[-*•]\s+/.test(l))
    .map((l) => l.replace(/^[-*•]\s+/, ''))
    .filter(Boolean);
}

function contactFromLinkUrl(linkUrl) {
  const u = (linkUrl || '').trim();
  if (!u) return { contact: 'Contact the arena for details', contactHref: null };
  if (u.startsWith('tel:') || u.startsWith('http://') || u.startsWith('https://')) {
    return { contact: u.replace(/^tel:/i, ''), contactHref: u.startsWith('tel:') ? u : u };
  }
  const digits = u.replace(/[^\d+]/g, '');
  if (digits.length >= 8) {
    return { contact: u, contactHref: `tel:${digits}` };
  }
  return { contact: u, contactHref: u };
}

/** Card / list row */
export function normalizeCmsEventForList(content) {
  const id = content.id;
  const title = content.title || 'Event';
  const category = inferEventCategory(content.title, content.subtitle);
  const image = (content.imageUrl || '').trim() || PLACEHOLDER_IMAGE;
  return {
    id,
    title,
    image,
    category,
    link: `/events/${id}`,
  };
}

/** Event detail page */
export function normalizeCmsEventForDetail(content) {
  const meta = parseSubtitlePipe(content.subtitle);
  const highlights = parseHighlightsFromBody(content.body);

  const { contact, contactHref } = contactFromLinkUrl(content.linkUrl);

  const description =
    (content.body || '').replace(/^\s*[-*•]\s+.+\n?/gm, '').trim() ||
    (content.subtitle || '').trim() ||
    'Stay tuned for more about this event.';

  const badge = ((content.title || 'EVENT').slice(0, 36) + (content.title?.length > 36 ? '…' : '')).toUpperCase();

  return {
    id: content.id,
    title: content.title || 'Event',
    subtitle: meta.tagline || (content.subtitle || '').replace(/\s*\|\s*/g, ' · ') || 'Arena event',
    image: (content.imageUrl || '').trim() || PLACEHOLDER_IMAGE,
    date: meta.date || 'Schedule TBA',
    time: meta.time || 'TBA',
    location: meta.location || 'See venue',
    price: meta.price || 'TBA',
    category: inferEventCategory(content.title, content.subtitle),
    description,
    highlights,
    contact,
    contactHref,
    badge,
    _source: 'cms',
    inclusions: content.inclusions || [],
  };
}
