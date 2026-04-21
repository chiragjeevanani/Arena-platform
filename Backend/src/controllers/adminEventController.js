const EventRegistration = require('../models/EventRegistration');
const { asyncHandler } = require('../utils/asyncHandler');

const listEventRegistrations = asyncHandler(async (req, res) => {
  const { eventId } = req.query;

  const query = {};
  if (eventId) query.eventId = eventId;

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
