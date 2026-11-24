const EventRegistration = require('../models/EventRegistration');
const CmsContent = require('../models/CmsContent');
const { asyncHandler } = require('../utils/asyncHandler');

const listEventRegistrations = asyncHandler(async (req, res) => {
  const { eventId } = req.query;

  const query = {};
  if (eventId) query.eventId = eventId;

  // Arena staff see registrations for their arena's events and for global (all-arena) events.
  if (req.arenaScopeId) {
    const visible = (await CmsContent.find({ kind: 'event', arenaId: { $in: [req.arenaScopeId, null] } }).distinct('_id')).map(String);
    if (eventId && !visible.includes(String(eventId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!eventId) query.eventId = { $in: visible };
  }

  const registrations = await EventRegistration.find(query).sort({ createdAt: -1 });

  res.json({
    registrations: registrations.map(r => EventRegistration.toPublic(r))
  });
});

const updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  if (req.arenaScopeId) {
    const reg = await EventRegistration.findById(id).select('eventId').lean();
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    const ok = await CmsContent.exists({ _id: reg.eventId, kind: 'event', arenaId: { $in: [req.arenaScopeId, null] } });
    if (!ok) return res.status(403).json({ error: 'Forbidden' });
  }

  const registration = await EventRegistration.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!registration) {
    return res.status(404).json({ error: 'Registration not found' });
  }

  res.json({
    message: 'Status updated',
    registration: EventRegistration.toPublic(registration)
  });
});

module.exports = {
  listEventRegistrations,
  updateRegistrationStatus
};
