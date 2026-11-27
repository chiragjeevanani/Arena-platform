/**
 * Broadcast messages: the Super Admin (all users) or an arena admin (customers + their arena's
 * staff) sends a title + message, optionally with an image, to many users' notifications at once.
 */
const Broadcast = require('../models/Broadcast');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendPushNotification } = require('../services/fcmService');

const STAFF_ROLES = ['ARENA_ADMIN', 'RECEPTIONIST', 'COACH'];
const TEST_EMAIL = /@ammarena-test\.invalid$/i;

/** Who receives it. Arena admins reach all customers plus the staff of their own arena. */
async function recipientsFor(audience, arenaObj) {
  const arenaId = arenaObj ? String(arenaObj) : null; // users store assignedArenaId as text
  const q = { isActive: { $ne: false } };
  if (audience === 'customers') q.role = 'CUSTOMER';
  else if (audience === 'staff') {
    q.role = { $in: STAFF_ROLES };
    if (arenaId) q.$or = [{ assignedArenaId: arenaId }, { role: 'COACH' }];
  } else {
    q.role = arenaId ? { $in: ['CUSTOMER', ...STAFF_ROLES] } : { $in: ['CUSTOMER', ...STAFF_ROLES, 'SUPER_ADMIN'] };
    if (arenaId) q.$or = [{ role: { $in: ['CUSTOMER', 'COACH'] } }, { assignedArenaId: arenaId }];
  }
  const users = await User.find(q).select('_id email').lean();
  return users;
}

function validate(b) {
  const title = String(b.title || '').trim();
  const message = String(b.message || '').trim();
  const imageUrl = String(b.imageUrl || '').trim();
  const audience = ['customers', 'staff', 'everyone'].includes(b.audience) ? b.audience : 'customers';
  if (!title) return { error: 'Enter a title' };
  if (title.length > 80) return { error: 'Title can be at most 80 characters' };
  if (!message) return { error: 'Enter the message' };
  if (message.length > 1000) return { error: 'Message can be at most 1000 characters' };
  if (imageUrl && !/^https:\/\/[^\s]+$/i.test(imageUrl)) return { error: 'The image must be uploaded first' };
  return { title, message, imageUrl, audience };
}

const publicOf = (b) => ({
  id: String(b._id), title: b.title, message: b.message, imageUrl: b.imageUrl || '', audience: b.audience,
  recipients: b.recipients, sentByName: b.sentByName || '', arenaId: b.arenaId ? String(b.arenaId) : null, createdAt: b.createdAt,
});

/**
 * POST …/broadcasts { title, message, imageUrl?, audience?, preview?, testToMe? }
 * preview: only counts recipients · testToMe: sends the same message only to the sender (not saved in history).
 */
async function sendBroadcast(req, res) {
  if (req.baseUrl.includes('arena-admin') && !['ARENA_ADMIN', 'SUPER_ADMIN'].includes(req.auth?.role)) return res.status(403).json({ error: 'Only the arena admin can send broadcasts' });
  const v = validate(req.body || {});
  if (v.error) return res.status(400).json({ error: v.error });
  const arenaId = req.arenaScopeId || null; // set on arena-admin routes (incl. Super Admin via X-Arena-Id)
  const scopeArena = req.baseUrl.includes('arena-admin') ? arenaId : null;
  const me = await User.findById(req.auth.sub).select('name email').lean();
  if (req.body?.testToMe) {
    await Notification.create({ userId: req.auth.sub, title: v.title, message: v.message, type: 'info', metadata: { kind: 'broadcast', test: true, ...(v.imageUrl ? { imageUrl: v.imageUrl } : {}) } });
    return res.status(201).json({ test: true, sentTo: me?.email || '' });
  }
  const users = await recipientsFor(v.audience, scopeArena);
  if (req.body?.preview) return res.json({ recipients: users.length });
  if (!users.length) return res.status(400).json({ error: 'Nobody to send to' });
  const b = await Broadcast.create({ ...v, arenaId: scopeArena, sentBy: req.auth.sub, sentByName: me?.name || me?.email || '', recipients: users.length });
  const metadata = { kind: 'broadcast', broadcastId: String(b._id), ...(v.imageUrl ? { imageUrl: v.imageUrl } : {}) };
  const now = new Date();
  // Insert in chunks so a large audience doesn't build one huge request.
  for (let i = 0; i < users.length; i += 500) {
    await Notification.insertMany(users.slice(i, i + 500).map((u) => ({ userId: u._id, title: v.title, message: v.message, type: 'info', metadata, createdAt: now, updatedAt: now })), { ordered: false });
  }
  // Phone push in the background (no-op where push isn't configured).
  setImmediate(async () => {
    for (const u of users) {
      if (TEST_EMAIL.test(u.email || '')) continue;
      try { await sendPushNotification(u._id, v.title, v.message, { type: 'info', ...metadata }); } catch (e) { /* ignore */ }
    }
  });
  return res.status(201).json({ broadcast: publicOf(b) });
}

/** GET …/broadcasts — history (an arena admin sees their arena's; Super Admin sees all). */
async function listBroadcasts(req, res) {
  const q = req.baseUrl.includes('arena-admin') ? { arenaId: req.arenaScopeId } : {};
  const list = await Broadcast.find(q).sort({ createdAt: -1 }).limit(100).lean();
  return res.json({ broadcasts: list.map(publicOf) });
}

module.exports = { sendBroadcast, listBroadcasts };
