/**
 * Admin UI shells use empty relations until wired to the API.
 * Demo snapshot: `Frontend/demo-backup/mockDatabase.js`.
 */

export const MOCK_DB = {
  arenas: [],
  courts: [],
  coaches: [],
  batches: [],
  inventory: [],
  bookings: [],
  users: [],
};

export const getArenaWithDetails = (arenaId) => {
  const arena = MOCK_DB.arenas.find((a) => a.id === arenaId);
  if (!arena) return null;
  return {
    ...arena,
    courtDetails: MOCK_DB.courts.filter((c) => c.arenaId === arenaId),
    batches: MOCK_DB.batches.filter((b) => b.arenaId === arenaId),
  };
};

export const getDashStats = (selectedArenaId = 'all') => {
  const relevantBookings =
    selectedArenaId === 'all'
      ? MOCK_DB.bookings
      : MOCK_DB.bookings.filter((b) => b.arenaId === selectedArenaId);
  const totalRevenue = relevantBookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  return {
    totalRevenue,
    bookingCount: relevantBookings.length,
    occupancy: 0,
    lowStockCount: MOCK_DB.inventory.filter((i) => i.stock < 10).length,
  };
};
