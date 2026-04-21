const User = require('../models/User');

async function patchMyProfile(req, res) {
  const { name, phone, avatarUrl } = req.body;
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
  if (avatarUrl != null) {
    const s = String(avatarUrl).trim();
    user.avatarUrl = s.length > 500000 ? s.slice(0, 500000) : s;
  }
  await user.save();
  return res.json({ user: User.toPublic(user) });
}

module.exports = { patchMyProfile };
