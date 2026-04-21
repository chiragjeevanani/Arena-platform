const mongoose = require('mongoose');

const coachingBatchSchema = new mongoose.Schema(
  {
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      required: true,
      index: true,
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    capacity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0, default: 0 },
    startDate: { type: String, required: true, trim: true },
    endDate: { type: String, required: true, trim: true },
    schedule: { type: String, default: '', trim: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

function toPublic(doc, extras = {}) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    arenaId: String(o.arenaId),
    coachId: String(o.coachId),
    title: o.title,
    description: o.description || '',
    capacity: o.capacity,
    price: o.price,
    startDate: o.startDate,
    endDate: o.endDate,
    schedule: o.schedule || '',
    isPublished: o.isPublished,
    createdAt: o.createdAt,
    ...extras,
  };
}

coachingBatchSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('CoachingBatch', coachingBatchSchema);
