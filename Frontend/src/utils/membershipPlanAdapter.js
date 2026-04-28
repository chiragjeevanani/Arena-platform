/**
 * Map GET /api/public/arenas/:id/membership-plans row to MembershipPlans.jsx card shape.
 */
export function mapPublicPlanToCard(plan, arenaName) {
  const months = Math.max(1, Math.round(Number(plan.durationDays) / 30));
  const disc = Number(plan.discountPercent) || 0;
  return {
    id: plan.id,
    name: plan.name,
    isGlobal: !!plan.isGlobal,
    duration: `${plan.durationDays} days`,
    durationMonths: months,
    category: disc >= 15 ? 'premium' : 'non-premium',
    price: Number(plan.price) || 0,
    discountPercent: disc,
    access: plan.isGlobal ? 'Valid on All Arenas' : (arenaName ? `Valid at ${arenaName}` : 'Arena membership'),
    bestValue: false,
    status: plan.isActive ? 'active' : 'inactive',
    color: disc >= 15 ? '#f59e0b' : '#6366f1',
    benefits: [
      plan.isGlobal ? 'Valid across all locations' : (arenaName ? `Applies at ${arenaName}` : 'Arena membership'),
      plan.description || `${disc}% off eligible bookings`,
    ].filter(Boolean),
  };
}
