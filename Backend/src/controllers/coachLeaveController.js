const CoachLeave = require('../models/CoachLeave');
const { asyncHandler } = require('../utils/asyncHandler');

const listMyLeaves = asyncHandler(async (req, res) => {
  const coachId = req.auth.sub;
  const leaves = await CoachLeave.find({ coachId }).sort({ date: -1 });
  res.json({ leaves: leaves.map(CoachLeave.toPublic) });
});

const createLeave = asyncHandler(async (req, res) => {
  const coachId = req.auth.sub;
  const { date, batchId, reason } = req.body;

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  // Check if already exists
  const existing = await CoachLeave.findOne({ coachId, date, batchId: batchId || null });
  if (existing) {
    return res.status(409).json({ error: 'Leave already marked for this day/batch' });
  }

  const leave = await CoachLeave.create({
    coachId,
    batchId: batchId || null,
    date,
    reason: reason || 'Personal Leave',
    status: 'Approved'
  });

  res.status(201).json({ leave: CoachLeave.toPublic(leave) });
});

const deleteLeave = asyncHandler(async (req, res) => {
  const coachId = req.auth.sub;
  const { leaveId } = req.params;

  const leave = await CoachLeave.findOneAndDelete({ _id: leaveId, coachId });
  if (!leave) {
    return res.status(404).json({ error: 'Leave record not found' });
  }

  res.json({ message: 'Leave removed' });
});

module.exports = {
  listMyLeaves,
  createLeave,
  deleteLeave,
};
