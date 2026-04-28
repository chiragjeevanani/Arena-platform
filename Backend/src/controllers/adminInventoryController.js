const mongoose = require('mongoose');
const InventoryItem = require('../models/InventoryItem');
const Arena = require('../models/Arena');

async function createInventoryItem(req, res) {
  const { arenaId, name, sku, quantity, unitPrice, category, minStock } = req.body;
  if (!arenaId || !name) {
    return res.status(400).json({ error: 'arenaId and name are required' });
  }
  if (!mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arena id' });
  }

  const arena = await Arena.findById(arenaId);
  if (!arena) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const item = await InventoryItem.create({
    arenaId,
    name: String(name).trim(),
    sku: sku != null ? String(sku).trim() : '',
    quantity: quantity != null ? Number(quantity) : 0,
    unitPrice: unitPrice != null ? Number(unitPrice) : 0,
    category: category != null ? String(category).trim() : 'Equipment',
    minStock: minStock != null ? Number(minStock) : 5,
  });

  return res.status(201).json({ item: InventoryItem.toPublic(item) });
}

async function listInventoryItems(req, res) {
  const { arenaId } = req.query;
  if (!arenaId || !mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Valid arenaId query is required' });
  }

  const list = await InventoryItem.find({ arenaId }).sort({ name: 1 }).lean();
  return res.json({ items: list.map((i) => InventoryItem.toPublic(i)) });
}

async function updateInventoryItem(req, res) {
  const { itemId } = req.params;
  if (!mongoose.isValidObjectId(itemId)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }

  const item = await InventoryItem.findById(itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const { name, sku, quantity, unitPrice, category, minStock } = req.body;
  if (name !== undefined) item.name = String(name).trim();
  if (sku !== undefined) item.sku = String(sku).trim();
  if (quantity !== undefined) item.quantity = Number(quantity);
  if (unitPrice !== undefined) item.unitPrice = Number(unitPrice);
  if (category !== undefined) item.category = String(category).trim();
  if (minStock !== undefined) item.minStock = Number(minStock);

  await item.save();
  return res.json({ item: InventoryItem.toPublic(item) });
}

async function deleteInventoryItem(req, res) {
  const { itemId } = req.params;
  if (!mongoose.isValidObjectId(itemId)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }

  const item = await InventoryItem.findByIdAndDelete(itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  return res.json({ message: 'Inventory item deleted successfully' });
}

module.exports = { 
  createInventoryItem, 
  listInventoryItems, 
  updateInventoryItem, 
  deleteInventoryItem 
};
