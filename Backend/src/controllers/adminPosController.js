const mongoose = require('mongoose');
const InventoryItem = require('../models/InventoryItem');
const Arena = require('../models/Arena');
const PosSale = require('../models/PosSale');

function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100;
}

async function createPosSale(req, res) {
  const { arenaId, lines } = req.body;
  const recordedByUserId = req.auth.sub;

  if (!arenaId || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ error: 'arenaId and non-empty lines are required' });
  }

  if (!mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arena id' });
  }

  const arena = await Arena.findById(arenaId);
  if (!arena) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const normalized = [];
  for (const line of lines) {
    if (!line.inventoryItemId || !line.qty) {
      return res.status(400).json({ error: 'Each line needs inventoryItemId and qty' });
    }
    if (!mongoose.isValidObjectId(line.inventoryItemId)) {
      return res.status(400).json({ error: 'Invalid inventory item id' });
    }
    const qty = Number(line.qty);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const item = await InventoryItem.findById(line.inventoryItemId);
    if (!item || item.arenaId.toString() !== String(arenaId)) {
      return res.status(400).json({ error: 'Inventory item does not belong to this arena' });
    }

    const unitPrice =
      line.unitPrice !== undefined && line.unitPrice !== null
        ? Number(line.unitPrice)
        : Number(item.unitPrice);
    const lineTotal = roundMoney(unitPrice * qty);
    normalized.push({
      inventoryItemId: item._id,
      name: item.name,
      qty,
      unitPrice,
      lineTotal,
    });
  }

  const applied = [];
  try {
    for (const line of normalized) {
      const updated = await InventoryItem.findOneAndUpdate(
        { _id: line.inventoryItemId, arenaId, quantity: { $gte: line.qty } },
        { $inc: { quantity: -line.qty } },
        { new: true }
      );
      if (!updated) {
        throw new Error('STOCK');
      }
      applied.push({ id: line.inventoryItemId, qty: line.qty });
    }

    const totalAmount = roundMoney(normalized.reduce((s, l) => s + l.lineTotal, 0));
    const sale = await PosSale.create({
      arenaId,
      recordedByUserId,
      lines: normalized,
      totalAmount,
    });

    return res.status(201).json({ sale: PosSale.toPublic(sale) });
  } catch (err) {
    for (const a of applied.reverse()) {
      await InventoryItem.findByIdAndUpdate(a.id, { $inc: { quantity: a.qty } });
    }
    if (err.message === 'STOCK') {
      return res.status(400).json({ error: 'Insufficient stock for one or more items' });
    }
    throw err;
  }
}

async function listPosSales(req, res) {
  const { arenaId } = req.query;
  if (!arenaId || !mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Valid arenaId query is required' });
  }

  const list = await PosSale.find({ arenaId }).sort({ createdAt: -1 }).limit(100).lean();
  return res.json({ sales: list.map((s) => PosSale.toPublic(s)) });
}

module.exports = { createPosSale, listPosSales };
