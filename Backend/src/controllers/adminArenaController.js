const mongoose = require('mongoose');
const Arena = require('../models/Arena');
const Court = require('../models/Court');

function mapArena(doc) {
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
  };
}

function mapCourt(doc) {
  return {
    id: doc._id.toString(),
    arenaId: doc.arenaId.toString(),
    name: doc.name,
    type: doc.type,
    pricePerHour: doc.pricePerHour,
    status: doc.status || 'active',
    imageUrl: doc.imageUrl || '',
  };
}

async function createArena(req, res) {
  const {
    name,
    location,
    category,
    description,
    amenities,
    pricePerHour,
    imageUrl,
    isPublished,
    rating,
    reviewsCount,
    distance,
    courtsCount,
  } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const price =
    typeof pricePerHour === 'number' && !Number.isNaN(pricePerHour)
      ? pricePerHour
      : Number(pricePerHour);
  if (Number.isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'pricePerHour must be a number >= 0' });
  }

  const arena = await Arena.create({
    name: name.trim(),
    location: (location || '').trim(),
    category: (category || 'Badminton').trim(),
    description: description || '',
    amenities: Array.isArray(amenities) ? amenities : [],
    pricePerHour: price,
    imageUrl: imageUrl || '',
    isPublished: typeof isPublished === 'boolean' ? isPublished : true,
    rating: Number(rating) || 0,
    reviewsCount: Number(reviewsCount) || 0,
    distance: distance || '',
    courtsCount: Number(courtsCount) || 0,
  });

  // Automatically create individual court records if courtsCount > 0
  const finalCourtsCount = Number(courtsCount) || 0;
  if (finalCourtsCount > 0) {
    const courtPromises = [];
    for (let i = 1; i <= finalCourtsCount; i++) {
      courtPromises.push(
        Court.create({
          arenaId: arena._id,
          name: `Court ${i}`,
          type: 'Wooden',
          status: 'active'
        })
      );
    }
    await Promise.all(courtPromises);
  }

  return res.status(201).json({ arena: mapArena(arena) });
}

async function createCourt(req, res) {
  const { arenaId } = req.params;
  if (!mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arena id' });
  }

  const arena = await Arena.findById(arenaId);
  if (!arena) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const { name, type, pricePerHour } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Court name is required' });
  }

  let courtPrice = null;
  if (pricePerHour !== undefined && pricePerHour !== null && pricePerHour !== '') {
    const p = Number(pricePerHour);
    if (Number.isNaN(p) || p < 0) {
      return res.status(400).json({ error: 'pricePerHour must be a number >= 0' });
    }
    courtPrice = p;
  }

  const court = await Court.create({
    arenaId: arena._id,
    name: name.trim(),
    type: (type || 'Wooden').trim(),
    pricePerHour: courtPrice,
  });

  // Sync arena.courtsCount
  await Arena.findByIdAndUpdate(arena._id, { $inc: { courtsCount: 1 } });

  return res.status(201).json({ court: mapCourt(court) });
}

async function deleteCourt(req, res) {
  const { courtId } = req.params;
  if (!mongoose.isValidObjectId(courtId)) {
    return res.status(400).json({ error: 'Invalid court id' });
  }

  const court = await Court.findByIdAndDelete(courtId);
  if (!court) {
    return res.status(404).json({ error: 'Court not found' });
  }

  // Sync arena.courtsCount
  await Arena.findByIdAndUpdate(court.arenaId, { $inc: { courtsCount: -1 } });

  return res.json({ ok: true });
}

async function patchArena(req, res) {
  const { arenaId } = req.params;
  if (!mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arena id' });
  }
  const arena = await Arena.findById(arenaId);
  if (!arena) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const {
    name,
    location,
    category,
    description,
    amenities,
    pricePerHour,
    imageUrl,
    isPublished,
    rating,
    reviewsCount,
    distance,
    courtsCount,
  } = req.body;

  if (name !== undefined) arena.name = String(name).trim();
  if (location !== undefined) arena.location = String(location).trim();
  if (category !== undefined) arena.category = String(category).trim();
  if (description !== undefined) arena.description = String(description);
  if (amenities !== undefined) arena.amenities = Array.isArray(amenities) ? amenities : [];
  if (pricePerHour !== undefined && pricePerHour !== null) {
    const p = Number(pricePerHour);
    if (Number.isNaN(p) || p < 0) {
      return res.status(400).json({ error: 'pricePerHour must be >= 0' });
    }
    arena.pricePerHour = p;
  }
  if (imageUrl !== undefined) arena.imageUrl = String(imageUrl || '');
  if (typeof isPublished === 'boolean') arena.isPublished = isPublished;
  if (rating !== undefined) arena.rating = Number(rating) || 0;
  if (reviewsCount !== undefined) arena.reviewsCount = Number(reviewsCount) || 0;
  if (distance !== undefined) arena.distance = String(distance);
  if (courtsCount !== undefined) {
    const newCount = Number(courtsCount) || 0;
    const existingCourtsCount = await Court.countDocuments({ arenaId: arena._id });
    
    if (newCount > existingCourtsCount) {
      const courtPromises = [];
      for (let i = existingCourtsCount + 1; i <= newCount; i++) {
        courtPromises.push(
          Court.create({
            arenaId: arena._id,
            name: `Court ${i}`,
            type: 'Wooden',
            status: 'active'
          })
        );
      }
      await Promise.all(courtPromises);
    }
    
    // We update the counter to the newCount requested.
    // If it's less than existingCourtsCount, we just update the label (no deletions for safety).
    arena.courtsCount = newCount;
  }

  await arena.save();
  return res.json({ arena: mapArena(arena) });
}

async function getAdminArena(req, res) {
  const { arenaId } = req.params;
  if (!mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arena id' });
  }

  const arena = await Arena.findById(arenaId).lean();
  if (!arena) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const courts = await Court.find({ arenaId: arena._id }).lean();

  return res.json({
    arena: mapArena(arena),
    courts: courts.map(mapCourt)
  });
}

async function updateCourt(req, res) {
  const { courtId } = req.params;
  if (!mongoose.isValidObjectId(courtId)) {
    return res.status(400).json({ error: 'Invalid court id' });
  }

  const { name, type, status, pricePerHour, imageUrl } = req.body;
  const court = await Court.findById(courtId);
  if (!court) {
    return res.status(404).json({ error: 'Court not found' });
  }

  if (name !== undefined) court.name = String(name).trim();
  if (type !== undefined) court.type = String(type).trim();
  if (status !== undefined) court.status = status;
  if (pricePerHour !== undefined) {
    const p = pricePerHour === null || pricePerHour === '' ? null : Number(pricePerHour);
    if (p !== null && (Number.isNaN(p) || p < 0)) {
      return res.status(400).json({ error: 'pricePerHour must be >= 0' });
    }
    court.pricePerHour = p;
  }
  if (imageUrl !== undefined) court.imageUrl = String(imageUrl || '');

  await court.save();
  return res.json({ court: mapCourt(court) });
}

async function listAdminArenas(req, res) {
  const arenas = await Arena.find().sort({ createdAt: -1 }).lean();
  return res.json({ arenas: arenas.map(mapArena) });
}

module.exports = {
  createArena,
  createCourt,
  deleteCourt,
  patchArena,
  listAdminArenas,
  getAdminArena,
  updateCourt,
};
