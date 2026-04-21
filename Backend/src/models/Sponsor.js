const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true },
    company: { type: String, default: '', trim: true },
    status: { type: String, enum: ['Active', 'Expired', 'Draft'], default: 'Active' },
    contractStart: { type: Date, default: null },
    contractEnd: { type: Date, default: null },
    equity: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '' },
    linkedEventId: { type: String, default: '' },
  },
  { timestamps: true }
);

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    name: o.name,
    email: o.email || '',
    company: o.company || '',
    status: o.status,
    contractStart: o.contractStart ? o.contractStart.toISOString() : null,
    contractEnd: o.contractEnd ? o.contractEnd.toISOString() : null,
    equity: o.equity,
    notes: o.notes || '',
    linkedEventId: o.linkedEventId || '',
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

sponsorSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('Sponsor', sponsorSchema);
