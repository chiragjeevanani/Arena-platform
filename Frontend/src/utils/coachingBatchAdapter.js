const PLACEHOLDER =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80';

/**
 * Maps public API coaching batch to CoachCard props.
 */
export function mapPublicBatchToCoachCard(batch, arenaName = '') {
  const timing =
    (batch.schedule || '').trim() ||
    `${batch.startDate || ''} – ${batch.endDate || ''}`.trim() ||
    'Schedule TBA';
  return {
    ...batch,
    coachName: batch.title || 'Coaching program',
    timing,
    days: arenaName || 'Arena program',
    fees: Number(batch.price) || 0,
    level: batch.level || 'Open',
    image: PLACEHOLDER,
    capacity: batch.capacity,
    spotsRemaining: batch.spotsRemaining,
    enrolledCount:
      Number.isFinite(batch.capacity) && Number.isFinite(batch.spotsRemaining)
        ? Math.max(0, batch.capacity - batch.spotsRemaining)
        : undefined,
  };
}
