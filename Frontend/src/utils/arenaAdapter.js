import CourtImage from '../assets/court.jpeg';

/**
 * Map API list/detail fields to UI components that expect mockData-style arenas.
 */
export function normalizeListArena(a) {
  const amenities =
    Array.isArray(a.amenities) && a.amenities.length > 0
      ? a.amenities
      : ['Courts'];

  return {
    id: a.id,
    name: a.name,
    location: a.location || '',
    distance: a.distance || '—',
    rating: typeof a.rating === 'number' ? a.rating : 0,
    reviews: typeof a.reviewsCount === 'number' ? a.reviewsCount : (typeof a.reviews === 'number' ? a.reviews : 0),
    pricePerHour: Number(a.pricePerHour) || 0,
    courtsCount: typeof a.courtsCount === 'number' ? a.courtsCount : 0,
    image: a.image && String(a.image).trim() ? a.image : CourtImage,
    category: a.category || 'Badminton',
    amenities,
    description: a.description || '',
  };
}

/** Detail payload from GET /api/public/arenas/:id */
export function normalizeDetailArena(payload) {
  const a = payload.arena || payload;
  const courts = (a.courts || []).map((c) => ({
    id: c.id,
    arenaId: a.id,
    name: c.name,
    type: c.type || 'Court',
  }));
  return {
    ...normalizeListArena({
      ...a,
      courtsCount: a.courtsCount ?? courts.length,
    }),
    courts,
  };
}
