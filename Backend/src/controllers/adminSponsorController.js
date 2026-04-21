const mongoose = require('mongoose');
const Sponsor = require('../models/Sponsor');

async function listSponsors(req, res) {
  const status = (req.query.status || '').trim();
  const q = {};
  if (status) q.status = status;
  const list = await Sponsor.find(q).sort({ createdAt: -1 }).lean();
  return res.json({ sponsors: list.map((s) => Sponsor.toPublic(s)) });
}

async function createSponsor(req, res) {
  const { name, email, company, status, contractStart, contractEnd, equity, notes, linkedEventId } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  const doc = await Sponsor.create({
    name: String(name).trim(),
    email: email != null ? String(email).trim() : '',
    company: company != null ? String(company).trim() : '',
    status: ['Active', 'Expired', 'Draft'].includes(status) ? status : 'Active',
    contractStart: contractStart ? new Date(contractStart) : null,
    contractEnd: contractEnd ? new Date(contractEnd) : null,
    equity: Number.isFinite(Number(equity)) ? Math.max(0, Number(equity)) : 0,
    notes: notes != null ? String(notes) : '',
    linkedEventId: linkedEventId != null ? String(linkedEventId) : '',
  });
  return res.status(201).json({ sponsor: Sponsor.toPublic(doc) });
}

async function patchSponsor(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
  const doc = await Sponsor.findById(id);
  if (!doc) return res.status(404).json({ error: 'Sponsor not found' });

  const fields = ['name', 'email', 'company', 'status', 'notes', 'linkedEventId', 'equity'];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      if (f === 'equity') doc.equity = Math.max(0, Number(req.body[f]) || 0);
      else if (f === 'status' && ['Active', 'Expired', 'Draft'].includes(req.body[f])) doc[f] = req.body[f];
      else if (f !== 'status' && f !== 'equity') doc[f] = String(req.body[f] ?? '');
    }
  }
  if (req.body.contractStart !== undefined) {
    doc.contractStart = req.body.contractStart ? new Date(req.body.contractStart) : null;
  }
  if (req.body.contractEnd !== undefined) {
    doc.contractEnd = req.body.contractEnd ? new Date(req.body.contractEnd) : null;
  }
  await doc.save();
  return res.json({ sponsor: Sponsor.toPublic(doc) });
}

async function deleteSponsor(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
  const r = await Sponsor.deleteOne({ _id: id });
  if (r.deletedCount === 0) return res.status(404).json({ error: 'Sponsor not found' });
  return res.json({ ok: true });
}

module.exports = { listSponsors, createSponsor, patchSponsor, deleteSponsor };
