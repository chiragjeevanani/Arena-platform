const mongoose = require('mongoose');

const batchEnrollmentSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoachingBatch',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'removed'],
      default: 'confirmed',
    },
    enrollmentType: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online',
    },
    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    removedAt: {
      type: Date,
    },
    removalReason: {
      type: String,
      trim: true,
    },
    removalNotes: {
      type: String,
      trim: true,
    },
    // Monthly coaching fee: the last day (YYYY-MM-DD, inclusive) the student has paid for.
    // null = no fee recorded yet (paid at the arena / added at the desk) — the arena records it.
    paidUntil: { type: String, default: null },
    feePayments: {
      type: [
        new mongoose.Schema(
          {
            kind: { type: String, enum: ['join', 'renewal'], default: 'renewal' },
            from: String,
            to: String,
            months: Number,
            amount: { type: Number, default: 0 },
            method: { type: String, default: 'cash' }, // wallet | online | cash | card | waived
            recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
            at: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    // Which reminders were already sent, so each is sent once per paid period.
    feeReminders: {
      dueFor: { type: String, default: null },
      overdueFor: { type: String, default: null },
      overdueCount: { type: Number, default: 0 },
      lastOverdueAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

batchEnrollmentSchema.index(
  { batchId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed'] },
    },
  }
);

function toPublic(doc, extras = {}) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    batchId: String(o.batchId),
    userId: String(o.userId),
    status: o.status,
    enrollmentType: o.enrollmentType,
    removedBy: o.removedBy ? String(o.removedBy) : null,
    removedAt: o.removedAt || null,
    removalReason: o.removalReason || '',
    removalNotes: o.removalNotes || '',
    paidUntil: o.paidUntil || null,
    createdAt: o.createdAt,
    ...extras,
  };
}

batchEnrollmentSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('BatchEnrollment', batchEnrollmentSchema);
