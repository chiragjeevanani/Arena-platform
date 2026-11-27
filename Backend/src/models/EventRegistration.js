const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CmsContent',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'PAYMENT_PENDING', 'Approved', 'APPROVED', 'Rejected', 'FAILED_PAYMENT', 'Cancelled', 'REFUNDED', 'EXPIRED'],
      default: 'PAYMENT_PENDING',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    // Entry category (Singles / Doubles / Team …) and the fee charged for this entry.
    categoryId: { type: String, default: '' },
    categoryName: { type: String, default: '' },
    categoryType: { type: String, default: '' }, // single | pair | team
    fee: { type: Number, default: null },
    paymentMethod: { type: String, default: '' }, // wallet | cash | online
    arenaIdNumber: { type: String, default: '', trim: true, maxlength: 40 }, // the player's arena ID (optional)
    teamName: { type: String, default: '', trim: true, maxlength: 80 },
    // Partner / team-mates (not including the person registering)
    players: {
      type: [new mongoose.Schema({ name: { type: String, trim: true, maxlength: 80 }, idNumber: { type: String, default: '', trim: true, maxlength: 40 } }, { _id: false })],
      default: [],
    },
  },
  { timestamps: true }
);

eventRegistrationSchema.index({ eventId: 1, phone: 1 });

function toPublic(doc, extras = {}) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    eventId: String(o.eventId),
    name: o.name,
    phone: o.phone,
    status: o.status,
    userId: o.userId ? String(o.userId) : undefined,
    categoryId: o.categoryId || '',
    categoryName: o.categoryName || '',
    categoryType: o.categoryType || '',
    fee: o.fee ?? null,
    paymentMethod: o.paymentMethod || '',
    arenaIdNumber: o.arenaIdNumber || '',
    teamName: o.teamName || '',
    players: (o.players || []).map((p) => ({ name: p.name, idNumber: p.idNumber || '' })),
    createdAt: o.createdAt,
    ...extras,
  };
}

eventRegistrationSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
