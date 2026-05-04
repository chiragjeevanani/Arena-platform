const mongoose = require('mongoose');
const CmsContent = require('../models/CmsContent');

async function createCmsContent(req, res) {
  const { kind, arenaId, title, subtitle, body, imageUrl, linkUrl, sortOrder, isPublished, inclusions } = req.body;

  if (!kind || !title) {
    return res.status(400).json({ error: 'kind and title are required' });
  }

  if (arenaId != null && arenaId !== '' && !mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arena id' });
  }

  try {
    const doc = await CmsContent.create({
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
    });

    return res.status(201).json({ content: CmsContent.toPublic(doc) });
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
  if (arenaId !== undefined) {
    doc.arenaId = arenaId && arenaId !== '' && mongoose.isValidObjectId(arenaId) ? arenaId : null;
  }
  if (title !== undefined) doc.title = String(title).trim();
  if (subtitle !== undefined) doc.subtitle = String(subtitle);
  if (body !== undefined) doc.body = String(body);
  if (imageUrl !== undefined) doc.imageUrl = String(imageUrl);
  if (linkUrl !== undefined) doc.linkUrl = String(linkUrl);
  if (sortOrder !== undefined) doc.sortOrder = Number(sortOrder);
  if (isPublished !== undefined) doc.isPublished = Boolean(isPublished);
  if (inclusions !== undefined) {
    doc.inclusions = Array.isArray(inclusions) ? inclusions : [];
  }

  await doc.save();
  return res.json({ content: CmsContent.toPublic(doc) });
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

  return res.status(204).send();
}

module.exports = { createCmsContent, listCmsContent, updateCmsContent, deleteCmsContent };

