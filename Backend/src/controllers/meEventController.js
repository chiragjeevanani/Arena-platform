const EventRegistration = require('../models/EventRegistration');
const CmsContent = require('../models/CmsContent');
const { asyncHandler } = require('../utils/asyncHandler');

const listMyEventRegistrations = asyncHandler(async (req, res) => {
  const userId = req.auth.sub;
  console.log('DEBUG: listMyEventRegistrations for userId:', userId);
  
  // Find current user to get their phone number if any
  const User = require('../models/User');
  const user = await User.findById(userId).lean();
  
  const query = {
    $or: [{ userId }]
  };
  if (user && user.phone) {
    query.$or.push({ phone: user.phone });
  }

  const registrations = await EventRegistration.find(query)
    .sort({ createdAt: -1 })
    .lean();
    
  const out = await Promise.all(
    registrations.map(async (r) => {
      const event = await CmsContent.findById(r.eventId).lean();
      return {
        ...EventRegistration.toPublic(r),
        eventTitle: event?.title || 'Tournament',
        eventImage: event?.imageUrl,
        eventSubtitle: event?.subtitle,
        inclusions: event?.inclusions || []
      };
    })
  );
  
  res.json({ registrations: out });
});

module.exports = {
  listMyEventRegistrations
};
