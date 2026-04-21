const Arena = require('../models/Arena');
const Court = require('../models/Court');
const mongoose = require('mongoose');

function mapArena(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    location: doc.location,
    category: doc.category,
    description: doc.description,
    amenities: doc.amenities || [],
    pricePerHour: doc.pricePerHour,
    imageUrl: doc.imageUrl || '',
    isPublished: doc.isPublished,
    rating: doc.rating,
    reviewsCount: doc.reviewsCount,
    distance: doc.distance || '',
    courtsCount: doc.courtsCount || 0,
    contact: doc.contact || '',
    openTime: doc.openTime || '06:00',
    closeTime: doc.closeTime || '22:00',
    priceConfig: doc.priceConfig || {},
  };
}

async function getMyArena(req, res) {
  const arena = await Arena.findById(req.arenaScopeId).lean();
  if (!arena) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const courts = await Court.find({ arenaId: arena._id }).lean();
  
  return res.json({ 
    arena: mapArena(arena),
    courts: courts.map(c => ({
      id: c._id.toString(),
      name: c.name,
      type: c.type,
      status: c.status,
      imageUrl: c.imageUrl
    }))
  });
}

async function patchMyArena(req, res) {
  const arena = await Arena.findById(req.arenaScopeId);
  if (!arena) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const {
    name,
    location,
    contact,
    openTime,
    closeTime,
    amenities,
    priceConfig,
    imageUrl,
    description
  } = req.body;

  if (name !== undefined) arena.name = String(name).trim();
  if (location !== undefined) arena.location = String(location).trim();
  if (contact !== undefined) arena.contact = String(contact).trim();
  if (openTime !== undefined) arena.openTime = String(openTime);
  if (closeTime !== undefined) arena.closeTime = String(closeTime);
  if (description !== undefined) arena.description = String(description);
  if (imageUrl !== undefined) arena.imageUrl = String(imageUrl);
  if (amenities !== undefined) arena.amenities = Array.isArray(amenities) ? amenities : [];
  
  if (priceConfig !== undefined) {
    arena.priceConfig = {
      ...(arena.priceConfig || {}),
      ...priceConfig
    };
    // Also sync base pricePerHour if primeRate is provided
    if (priceConfig.primeRate !== undefined) {
      arena.pricePerHour = Number(priceConfig.primeRate) || 0;
    }
  }

  await arena.save();
  return res.json({ arena: mapArena(arena) });
}

module.exports = { getMyArena, patchMyArena };
