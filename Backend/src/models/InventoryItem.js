const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    sku: { type: String, default: '', trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    unitPrice: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, default: 'Equipment', trim: true },
    minStock: { type: Number, default: 5, min: 0 },
  },
  { timestamps: true }
);

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    arenaId: String(o.arenaId),
    name: o.name,
    sku: o.sku || '',
    quantity: o.quantity,
    unitPrice: o.unitPrice,
    category: o.category || 'Equipment',
    minStock: o.minStock != null ? o.minStock : 5,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

inventoryItemSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
