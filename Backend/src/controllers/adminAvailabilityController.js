const AvailabilityBlock = require('../models/AvailabilityBlock');

/**
 * Super Admin: List blocks for a specific arena and date
 * GET /api/admin/arenas/:arenaId/blocks?date=YYYY-MM-DD
 */
async function listAdminArenaBlocks(req, res) {
  const { arenaId } = req.params;
  const { date } = req.query;

  const filter = { arenaId };
  if (date) filter.date = date;

  const blocks = await AvailabilityBlock.find(filter)
    .sort({ date: 1, startTime: 1 })
    .lean();

  res.json({
    success: true,
    blocks: blocks.map(b => ({
      id: b._id,
      courtId: b.courtId,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      reason: b.reason,
      note: b.note
    }))
  });
}

module.exports = {
  listAdminArenaBlocks
};
