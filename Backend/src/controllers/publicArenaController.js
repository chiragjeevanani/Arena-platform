const mongoose = require('mongoose');
const Arena = require('../models/Arena');
const Court = require('../models/Court');

function mapCourt(c) {
  return {
    id: c._id.toString(),
    name: c.name,
    type: c.type,
    pricePerHour: c.pricePerHour,
    arenaId: c.arenaId.toString(),
  };
}

async function listPublishedArenas(req, res) {
  const arenas = await Arena.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .lean();

  const out = await Promise.all(
    arenas.map(async (a) => ({
      id: a._id.toString(),
      name: a.name,
      location: a.location,
      pricePerHour: a.pricePerHour,
      courtsCount: a.courtsCount || (await Court.countDocuments({ arenaId: a._id })),
      image: a.imageUrl || '',
      category: a.category,
      amenities: a.amenities || [],
      description: a.description || '',
      rating: a.rating,
      reviews: a.reviewsCount,
      distance: a.distance || '',
    }))
  );

  return res.json({ arenas: out });
}

async function getPublishedArenaById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid arena id' });
  }

  const arena = await Arena.findOne({ _id: id, isPublished: true }).lean();
  if (!arena) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const courts = await Court.find({ arenaId: arena._id }).sort({ name: 1 }).lean();
  const courtsCount = courts.length;

  return res.json({
    arena: {
      id: arena._id.toString(),
      name: arena.name,
      location: arena.location,
      pricePerHour: arena.pricePerHour,
      courtsCount: arena.courtsCount || courts.length,
      image: arena.imageUrl || '',
      category: arena.category,
      amenities: arena.amenities || [],
      description: arena.description || '',
      rating: arena.rating,
      reviews: arena.reviewsCount,
      distance: arena.distance || '',
      courts: courts.map(mapCourt),
    },
  });
}

module.exports = { listPublishedArenas, getPublishedArenaById };
