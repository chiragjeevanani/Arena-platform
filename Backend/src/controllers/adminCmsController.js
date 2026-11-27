const mongoose = require('mongoose');
const CmsContent = require('../models/CmsContent');

/** Event registration limit from the form: a whole number, 0 (or blank) = unlimited. */
const toLimit = (v) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const holds = require('../services/courtHolds');
const bad = (message) => Object.assign(new Error(message), { status: 400 });

/**
 * Validates an event's schedule, blocked courts and entry categories.
 * Returns the eventInfo to store (or null when the form sent none).
 */
async function parseEventInfo(raw, req) {
  if (!raw || typeof raw !== 'object') return null;
  const startDate = String(raw.startDate || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) throw bad('Choose the event start date');
  const days = Math.round(Number(raw.days || 1));
  if (!(days >= 1 && days <= 30)) throw bad('Number of days must be 1 to 30');
  const allDay = !(raw.allDay === false || raw.allDay === 'false');
  const startTime = allDay ? '00:00' : String(raw.startTime || '');
  const endTime = allDay ? '00:00' : String(raw.endTime || '');
  if (!allDay) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) throw bad('Choose the event start and end time');
    if (endTime !== '00:00' && endTime <= startTime) throw bad('The end time must be after the start time');
  }
  // Arena staff can only hold courts of their own arena.
  const holdArenaId = req.arenaScopeId ? String(req.arenaScopeId) : (raw.holdArenaId && mongoose.isValidObjectId(raw.holdArenaId) ? String(raw.holdArenaId) : null);
  const courtIds = Array.isArray(raw.courtIds) ? raw.courtIds.filter((c) => mongoose.isValidObjectId(c)).map(String) : [];
  if (courtIds.length && !holdArenaId) throw bad('Choose the arena whose courts the event uses');
  const categories = [];
  for (const c of Array.isArray(raw.categories) ? raw.categories : []) {
    const name = String(c?.name || '').trim();
    if (!name) throw bad('Every category needs a name');
    const type = ['single', 'pair', 'team'].includes(c.type) ? c.type : 'single';
    let minPlayers = 1; let maxPlayers = 1;
    if (type === 'pair') { minPlayers = 2; maxPlayers = 2; }
    if (type === 'team') {
      minPlayers = Math.round(Number(c.minPlayers)); maxPlayers = Math.round(Number(c.maxPlayers));
      if (!(minPlayers >= 2 && maxPlayers >= minPlayers && maxPlayers <= 30)) throw bad(`"${name}": team size must be from 2 up to 30 players (min ≤ max)`);
    }
    const fee = Math.round(Number(c.fee || 0) * 1000) / 1000;
    if (!(fee >= 0)) throw bad(`"${name}": fee must be 0 or more`);
    const maxEntries = toLimit(c.maxEntries);
    categories.push({ ...(c.id && mongoose.isValidObjectId(c.id) ? { _id: c.id } : {}), name, type, minPlayers, maxPlayers, fee, maxEntries });
  }
  if (categories.length > 12) throw bad('At most 12 categories');
  const end = new Date(`${startDate}T12:00:00Z`); end.setUTCDate(end.getUTCDate() + days - 1);
  return { startDate, days, endDate: end.toISOString().slice(0, 10), allDay, startTime, endTime, holdArenaId, courtIds, categories };
}

/** Refuses (400/409) before saving when the event's courts clash with another hold. */
async function checkEventCourts(info, existingHoldId = null) {
  if (!info || !info.holdArenaId || !info.courtIds.length) return;
  const p = await holds.previewHold(info.holdArenaId, { date: info.startDate, days: info.days, allDay: info.allDay, startTime: info.startTime, endTime: info.endTime, courtIds: info.courtIds }, existingHoldId);
  if (p.clash) throw Object.assign(new Error(`Those courts are already held by ${p.clash.kind === 'event' ? `the event "${p.clash.bookedFor}"` : `a whole-arena booking (${p.clash.bookedFor})`} on ${p.clash.when}.`), { status: 409 });
}

/** After saving: create / update / release the event's court hold; returns the hold summary. */
async function applyEventHold(doc, req) {
  if (doc.kind !== 'event' || !doc.eventInfo) return null;
  const hold = await holds.syncEventHold(doc, req.auth?.sub || null);
  const newId = hold ? hold._id : null;
  if (String(doc.eventInfo.holdId || '') !== String(newId || '')) {
    doc.eventInfo.holdId = newId;
    doc.markModified('eventInfo');
    await doc.save();
  }
  return hold ? { id: String(hold._id), affected: (hold.affected || []).filter((a) => a.state === 'pending').length } : null;
}

async function createCmsContent(req, res) {
  const { kind, arenaId, title, subtitle, body, imageUrl, linkUrl, sortOrder, isPublished, inclusions } = req.body;

  if (!kind || !title) {
    return res.status(400).json({ error: 'kind and title are required' });
  }

  if (arenaId != null && arenaId !== '' && !mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arena id' });
  }

  let eventInfo = null;
  if (kind === 'event' && req.body.eventInfo) {
    try {
      eventInfo = await parseEventInfo(req.body.eventInfo, req);
      if (req.body.isPublished !== false) await checkEventCourts(eventInfo);
    } catch (e) { return res.status(e.status || 400).json({ error: e.message }); }
  }

  try {
    const doc = await CmsContent.create({
      eventInfo,
      kind,
      arenaId: arenaId && arenaId !== '' ? arenaId : null,
      title: String(title).trim(),
      subtitle: subtitle != null ? String(subtitle) : '',
      body: body != null ? String(body) : '',
      imageUrl: imageUrl != null ? String(imageUrl) : '',
      linkUrl: linkUrl != null ? String(linkUrl) : '',
      sortOrder: sortOrder != null ? Number(sortOrder) : 0,
      isPublished: Boolean(isPublished),
      inclusions: Array.isArray(inclusions) ? inclusions : [],
      maxParticipants: toLimit(req.body.maxParticipants),
      startDate: req.body.startDate ? new Date(req.body.startDate) : null,
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
    });

    let hold = null;
    try { hold = await applyEventHold(doc, req); } catch (e) {
      await CmsContent.deleteOne({ _id: doc._id });
      return res.status(e.status || 500).json({ error: e.message });
    }
    return res.status(201).json({ content: CmsContent.toPublic(doc), hold });
  } catch (err) {
    console.error('CMS Create Error:', err);
    return res.status(500).json({
      error: 'Failed to create CMS content',
      details: err.message,
      code: err.code // Helps identify MongoDB limits (e.g. 10334 for BSON size)
    });
  }
}

async function listCmsContent(req, res) {
  const filter = {};
  if (req.query.kind) filter.kind = req.query.kind;
  if (req.query.arenaId) {
    if (!mongoose.isValidObjectId(req.query.arenaId)) {
      return res.status(400).json({ error: 'Invalid arenaId query' });
    }
    filter.arenaId = req.query.arenaId;
    // Arena staff also see the Super Admin's global (all-arena) events; they still can't edit them.
    if (req.arenaScopeId && filter.kind === 'event') filter.arenaId = { $in: [req.query.arenaId, null] };
  }

  const list = await CmsContent.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean();
  return res.json({ contents: list.map((c) => CmsContent.toPublic(c)) });
}

async function updateCmsContent(req, res) {
  const { contentId } = req.params;
  if (!mongoose.isValidObjectId(contentId)) {
    return res.status(400).json({ error: 'Invalid content id' });
  }

  const doc = await CmsContent.findById(contentId);
  if (!doc) {
    return res.status(404).json({ error: 'Content not found' });
  }

  const { kind, arenaId, title, subtitle, body, imageUrl, linkUrl, sortOrder, isPublished, inclusions } = req.body;
  if (kind !== undefined) doc.kind = kind;
  // Arena staff (req.arenaScopeId set) may not move content to another arena or make it global.
  if (arenaId !== undefined && !req.arenaScopeId) {
    doc.arenaId = arenaId && arenaId !== '' && mongoose.isValidObjectId(arenaId) ? arenaId : null;
  }
  if (title !== undefined) doc.title = String(title).trim();
  if (subtitle !== undefined) doc.subtitle = String(subtitle);
  if (body !== undefined) doc.body = String(body);
  if (imageUrl !== undefined) doc.imageUrl = String(imageUrl);
  if (linkUrl !== undefined) doc.linkUrl = String(linkUrl);
  if (sortOrder !== undefined) doc.sortOrder = Number(sortOrder);
  if (isPublished !== undefined) doc.isPublished = Boolean(isPublished);
  if (req.body.maxParticipants !== undefined) {
    doc.maxParticipants = toLimit(req.body.maxParticipants);
  }
  if (inclusions !== undefined) {
    doc.inclusions = Array.isArray(inclusions) ? inclusions : [];
  }
  if (req.body.startDate !== undefined) {
    doc.startDate = req.body.startDate ? new Date(req.body.startDate) : null;
  }
  if (req.body.endDate !== undefined) {
    doc.endDate = req.body.endDate ? new Date(req.body.endDate) : null;
  }
  if (doc.kind === 'event' && req.body.eventInfo !== undefined) {
    try {
      const info = req.body.eventInfo ? await parseEventInfo(req.body.eventInfo, req) : null;
      if (info) {
        info.holdId = doc.eventInfo?.holdId || null;
        if (doc.isPublished) await checkEventCourts(info, info.holdId);
      }
      doc.eventInfo = info ? { ...info, holdId: doc.eventInfo?.holdId || null } : null;
      doc.markModified('eventInfo');
    } catch (e) { return res.status(e.status || 400).json({ error: e.message }); }
  }

  await doc.save();
  let hold = null;
  try { hold = await applyEventHold(doc, req); } catch (e) { return res.status(e.status || 500).json({ error: e.message }); }
  return res.json({ content: CmsContent.toPublic(doc), hold });
}

async function deleteCmsContent(req, res) {
  const { contentId } = req.params;
  if (!mongoose.isValidObjectId(contentId)) {
    return res.status(400).json({ error: 'Invalid content id' });
  }

  const doc = await CmsContent.findByIdAndDelete(contentId);
  if (!doc) {
    return res.status(404).json({ error: 'Content not found' });
  }
  // A deleted event no longer holds its courts (affected bookings stay where they are).
  if (doc.kind === 'event' && doc.eventInfo?.holdId) {
    const hold = await require('../models/ArenaDayBooking').findById(doc.eventInfo.holdId);
    if (hold) await holds.cancelHold(hold, req.auth?.sub || null);
  }

  return res.status(204).send();
}

module.exports = { createCmsContent, listCmsContent, updateCmsContent, deleteCmsContent };

