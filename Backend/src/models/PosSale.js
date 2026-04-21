const mongoose = require('mongoose');

const saleLineSchema = new mongoose.Schema(
  {
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const posSaleSchema = new mongoose.Schema(
  {
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      required: true,
      index: true,
    },
    recordedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lines: { type: [saleLineSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    arenaId: String(o.arenaId),
    recordedByUserId: String(o.recordedByUserId),
    lines: o.lines,
    totalAmount: o.totalAmount,
    createdAt: o.createdAt,
  };
}

posSaleSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('PosSale', posSaleSchema);
