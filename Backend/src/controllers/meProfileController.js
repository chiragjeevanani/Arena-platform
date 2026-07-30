const User = require('../models/User');

async function patchMyProfile(req, res) {
  const { name, phone, address, country, location, profilePicture, avatarUrl } = req.body;
  const user = await User.findById(req.auth.sub);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (name != null && String(name).trim()) {
    user.name = String(name).trim();
  }
  if (phone != null) {
    user.phone = String(phone).trim().slice(0, 32);
  }
  if (address != null) {
    user.address = String(address).trim().slice(0, 200);
  }
  if (country != null) {
    user.country = String(country).trim().slice(0, 100);
  }
  if (location != null) {
    user.location = String(location).trim().slice(0, 100);
  }
  const imgVal = profilePicture != null ? profilePicture : avatarUrl;
  if (imgVal != null) {
    const s = String(imgVal).trim();
    user.profilePicture = s.length > 500000 ? s.slice(0, 500000) : s;
  }
  if (req.body.bio !== undefined) user.bio = String(req.body.bio).trim();
  if (req.body.experience !== undefined) user.experience = String(req.body.experience).trim();
  if (req.body.achievements !== undefined && Array.isArray(req.body.achievements)) {
    user.achievements = req.body.achievements;
  }
  if (req.body.hours !== undefined) user.hours = String(req.body.hours).trim();
  if (req.body.wins !== undefined) user.wins = String(req.body.wins).trim();
  await user.save();
  return res.json({ user: User.toPublic(user) });
}

module.exports = { patchMyProfile };
