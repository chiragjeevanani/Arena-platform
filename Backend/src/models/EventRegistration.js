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
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    }
  },
  { timestamps: true }
);

eventRegistrationSchema.index({ eventId: 1, phone: 1 }, { unique: true });

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
    createdAt: o.createdAt,
    ...extras,
  };
}

eventRegistrationSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
