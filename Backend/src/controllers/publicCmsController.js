const mongoose = require('mongoose');
const CmsContent = require('../models/CmsContent');

async function listPublishedCms(req, res) {
  const { kind, arenaId } = req.query;
  if (!kind) {
    return res.status(400).json({ error: 'kind query is required' });
  }

  const filter = { kind, isPublished: true };
  if (arenaId) {
    if (!mongoose.isValidObjectId(arenaId)) {
      return res.status(400).json({ error: 'Invalid arenaId query' });
    }
    const oid = new mongoose.Types.ObjectId(arenaId);
    filter.$or = [{ arenaId: null }, { arenaId: oid }];
  }

  const list = await CmsContent.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean();
  return res.json({ contents: list.map((c) => CmsContent.toPublic(c)) });
}

async function getPublishedCmsById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid content id' });
  }
  const doc = await CmsContent.findOne({ _id: id, isPublished: true }).lean();
  if (!doc) {
    return res.status(404).json({ error: 'Content not found' });
  }
  return res.json({ content: CmsContent.toPublic(doc) });
}

module.exports = { listPublishedCms, getPublishedCmsById };
