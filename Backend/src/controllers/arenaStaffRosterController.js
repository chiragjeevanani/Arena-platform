const mongoose = require('mongoose');
const ArenaStaff = require('../models/ArenaStaff');
const User = require('../models/User');
const CoachingBatch = require('../models/CoachingBatch');

const ROLE_LABEL = { ARENA_ADMIN: 'Arena Admin', RECEPTIONIST: 'Receptionist', COACH: 'Coach' };
const nameOf = (u) => u?.name || `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || u?.email || 'Staff';

/**
 * GET /arena-admin/staff-roster
 * Everyone working at the arena: its admins (managers) and the staff under them —
 * receptionists and coaches (with logins) plus roster staff added by the Super Admin.
 */
async function getStaffRoster(req, res) {
  const arenaId = req.arenaScopeId;
  const coachIds = await CoachingBatch.distinct('coachId', { arenaId });
  const [users, roster] = await Promise.all([
    User.find({
      isActive: { $ne: false },
      $or: [
        { assignedArenaId: arenaId, role: { $in: ['ARENA_ADMIN', 'RECEPTIONIST', 'COACH'] } },
        { _id: { $in: coachIds }, role: 'COACH' },
      ],
    }).select('name firstName lastName email phone role').lean(),
    ArenaStaff.find({ arenaId, ...(req.auth.role === 'SUPER_ADMIN' ? {} : { isActive: true }) }).sort({ isActive: -1, name: 1 }).lean(),
  ]);
  const managers = users.filter((u) => u.role === 'ARENA_ADMIN')
    .map((u) => ({ id: String(u._id), name: nameOf(u), email: u.email, phone: u.phone || '' }));
  const staff = [
    ...roster.map((s) => ({ ...ArenaStaff.toPublic(s), kind: 'roster', role: s.jobTitle || 'Staff', hasLogin: false })),
    ...users.filter((u) => u.role !== 'ARENA_ADMIN').map((u) => ({
      id: String(u._id), kind: 'user', name: nameOf(u), role: ROLE_LABEL[u.role] || u.role, jobTitle: ROLE_LABEL[u.role] || u.role,
      phone: u.phone || '', email: u.email, isActive: true, hasLogin: true,
    })),
  ].sort((a, b) => (a.isActive === b.isActive ? a.name.localeCompare(b.name) : a.isActive ? -1 : 1));
  return res.json({ managers, staff });
}

function requireSuperAdmin(req, res) {
  if (req.auth.role !== 'SUPER_ADMIN') { res.status(403).json({ error: 'Only the Super Admin can change the staff list' }); return false; }
  return true;
}
const clean = (b) => ({
  ...(b.name !== undefined ? { name: String(b.name).trim() } : {}),
  ...(b.jobTitle !== undefined ? { jobTitle: String(b.jobTitle).trim() || 'Staff' } : {}),
  ...(b.phone !== undefined ? { phone: String(b.phone).trim() } : {}),
  ...(b.isActive !== undefined ? { isActive: Boolean(b.isActive) } : {}),
});

/** POST /arena-admin/staff-roster  { name, jobTitle, phone }  (Super Admin) */
async function addRosterStaff(req, res) {
  if (!requireSuperAdmin(req, res)) return undefined;
  const data = clean(req.body || {});
  if (!data.name || data.name.length < 2) return res.status(400).json({ error: 'Enter the staff member\'s name' });
  const doc = await ArenaStaff.create({ ...data, arenaId: req.arenaScopeId, createdBy: req.auth.sub });
  return res.status(201).json({ staff: ArenaStaff.toPublic(doc.toObject()) });
}

/** PATCH /arena-admin/staff-roster/:id  { name?, jobTitle?, phone?, isActive? }  (Super Admin) */
async function updateRosterStaff(req, res) {
  if (!requireSuperAdmin(req, res)) return undefined;
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const data = clean(req.body || {});
  if (data.name !== undefined && data.name.length < 2) return res.status(400).json({ error: 'Enter the staff member\'s name' });
  const doc = await ArenaStaff.findOneAndUpdate({ _id: req.params.id, arenaId: req.arenaScopeId }, { $set: data }, { new: true }).lean();
  if (!doc) return res.status(404).json({ error: 'Staff member not found' });
  return res.json({ staff: ArenaStaff.toPublic(doc) });
}

/** DELETE /arena-admin/staff-roster/:id  (Super Admin) — removes from the list; past attendance is kept. */
async function removeRosterStaff(req, res) {
  if (!requireSuperAdmin(req, res)) return undefined;
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const doc = await ArenaStaff.findOneAndUpdate({ _id: req.params.id, arenaId: req.arenaScopeId }, { $set: { isActive: false } }, { new: true }).lean();
  if (!doc) return res.status(404).json({ error: 'Staff member not found' });
  return res.json({ staff: ArenaStaff.toPublic(doc) });
}

module.exports = { getStaffRoster, addRosterStaff, updateRosterStaff, removeRosterStaff };
