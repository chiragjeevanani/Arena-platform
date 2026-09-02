// Mirrors CATEGORY_META in admin/pages/ArenaPanel/MembershipAdmin.jsx — keep in sync.
const CATEGORY_COLOR = {
  premium: '#f59e0b',
  'non-premium': '#6366f1',
  individual: '#22c55e',
};

/**
 * Map GET /api/public/arenas/:id/membership-plans row to MembershipPlans.jsx card shape.
 */
export function mapPublicPlanToCard(plan, arenaName) {
  const months = Math.max(1, Math.round(Number(plan.durationDays) / 30));
  const disc = Number(plan.discountPercent) || 0;
  // Trust the server's own category field — it's admin-configured and can't be
  // reliably reconstructed from discountPercent (e.g. an "individual" plan has
  // no discount signature at all).
  const category = plan.category || 'non-premium';
  return {
    id: plan.id,
    name: plan.name,
    isGlobal: !!plan.isGlobal,
    duration: `${plan.durationDays} days`,
    durationMonths: months,
    category,
    price: Number(plan.price) || 0,
    discountPercent: disc,
    access: plan.isGlobal ? 'Valid on All Arenas' : (arenaName ? `Valid at ${arenaName}` : 'Arena membership'),
    bestValue: false,
    status: plan.isActive ? 'active' : 'inactive',
    color: CATEGORY_COLOR[category] || CATEGORY_COLOR['non-premium'],
    benefits: [
      plan.isGlobal ? 'Valid across all locations' : (arenaName ? `Applies at ${arenaName}` : 'Arena membership'),
      plan.description || `${disc}% off eligible bookings`,
    ].filter(Boolean),
  };
}
