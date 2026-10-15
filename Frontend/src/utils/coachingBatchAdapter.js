import { VAT_PERCENT } from './tax';
const PLACEHOLDER =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80';

/**
 * Maps public API coaching batch to CoachCard props.
 */
export function mapPublicBatchToCoachCard(batch, arenaName = '') {
  const timing = batch.scheduleTime || 'See schedule';
  const days = batch.schedule || arenaName || 'Arena program';
  return {
    ...batch,
    id: String(batch.id || batch._id || ''),
    coachName: batch.title || 'Coaching program',
    timing,
    days,
    fees: Number(batch.price) || Number(batch.fees) || 0,
    level: batch.level || 'Open',
    image: batch.coachImage || PLACEHOLDER,
    capacity: batch.capacity,
    spotsRemaining: batch.spotsRemaining,
    enrolledCount:
      Number.isFinite(batch.capacity) && Number.isFinite(batch.spotsRemaining)
        ? Math.max(0, batch.capacity - batch.spotsRemaining)
        : undefined,
    // Number(undefined) is NaN (never nullish), so the old `?? default` never applied.
    registrationFee: batch.registrationFee != null ? Number(batch.registrationFee) || 0 : 0,
    taxPercent: batch.taxPercent != null ? Number(batch.taxPercent) || 0 : VAT_PERCENT,
    rating: batch.rating || 5.0,
    studentCount: `${batch.enrolledCount || 0} Students`,
    experienceYears: batch.experienceYears || '8+ Years',
    benefits: Array.isArray(batch.benefits) && batch.benefits.length > 0 ? batch.benefits : ["Assessment report", "Certified Elite Coach", "Sanitised Arena", "Tournament priority"],
  };
}
