const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ROLES = ['SUPER_ADMIN', 'ARENA_ADMIN', 'RECEPTIONIST', 'COACH', 'CUSTOMER'];

async function listAdminUsers(req, res) {
  const q = {};
  const role = (req.query.role || '').trim();
  if (role && ROLES.includes(role)) q.role = role;
  const search = (req.query.q || '').trim();
  if (search) {
    q.$or = [
      { email: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { name: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    ];
  }
  const skip = Math.min(500, Math.max(0, parseInt(req.query.skip, 10) || 0));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const [users, total] = await Promise.all([
    User.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(q),
  ]);
  return res.json({
    users: users.map((u) => User.toPublic(u)),
    total,
  });
}

async function patchAdminUser(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, email, role, assignedArenaId, isActive, phone } = req.body;
  if (name != null && String(name).trim()) {
    user.name = String(name).trim();
  }
  if (email != null && String(email).trim()) {
    user.email = String(email).trim().toLowerCase();
  }
  if (phone != null) {
    user.phone = String(phone).trim();
  }
  if (role != null) {
    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (String(user._id) === String(req.auth.sub) && role !== user.role) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }
    user.role = role;
  }
  if (assignedArenaId !== undefined) {
    user.assignedArenaId = assignedArenaId ? String(assignedArenaId) : null;
  }
  if (isActive !== undefined) {
    if (String(user._id) === String(req.auth.sub) && isActive === false) {
      return res.status(400).json({ error: 'Cannot deactivate yourself' });
    }
    user.isActive = Boolean(isActive);
  }
  await user.save();
  return res.json({ user: User.toPublic(user) });
}

async function createAdminUser(req, res) {
  const { name, email, password, role, assignedArenaId, phone } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  if (!ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      passwordHash,
      role,
      assignedArenaId: assignedArenaId ? String(assignedArenaId) : null,
      phone: phone ? String(phone).trim() : '',
      isActive: true,
      isEmailVerified: true,
    });

    return res.status(201).json({ user: User.toPublic(user) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    throw err;
  }
}

module.exports = { listAdminUsers, patchAdminUser, createAdminUser };
