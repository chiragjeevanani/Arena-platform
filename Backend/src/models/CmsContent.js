const mongoose = require('mongoose');

const KINDS = ['hero', 'event', 'category'];

const cmsContentSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: KINDS, required: true, index: true },
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      default: null,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    body: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '', trim: true },
    linkUrl: { type: String, default: '', trim: true },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    inclusions: { type: [String], default: [] },
  },
  { timestamps: true }
);

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    kind: o.kind,
    arenaId: o.arenaId ? String(o.arenaId) : null,
    title: o.title,
    subtitle: o.subtitle || '',
    body: o.body || '',
    imageUrl: o.imageUrl || '',
    linkUrl: o.linkUrl || '',
    sortOrder: o.sortOrder,
    isPublished: o.isPublished,
    inclusions: o.inclusions || [],
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

cmsContentSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('CmsContent', cmsContentSchema);
