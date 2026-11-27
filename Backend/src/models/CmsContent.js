const mongoose = require('mongoose');

const KINDS = ['hero', 'event', 'category'];

const cmsContentSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: KINDS, required: true, index: true },
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      default: null,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    body: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '', trim: true },
    linkUrl: { type: String, default: '', trim: true },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    inclusions: { type: [String], default: [] },
    // Events: registration limit (0 = unlimited); enforced by public event registration.
    maxParticipants: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    // Events: schedule, the courts the event blocks, and entry categories (each with its own fee).
    eventInfo: {
      type: new mongoose.Schema(
        {
          startDate: { type: String, default: '' }, // YYYY-MM-DD
          days: { type: Number, default: 1, min: 1, max: 30 },
          endDate: { type: String, default: '' }, // computed: last day (inclusive)
          allDay: { type: Boolean, default: true },
          startTime: { type: String, default: '00:00' }, // HH:MM
          endTime: { type: String, default: '00:00' }, // HH:MM ('00:00' = midnight)
          holdArenaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arena', default: null },
          courtIds: { type: [mongoose.Schema.Types.ObjectId], default: [] }, // courts blocked (empty = none)
          holdId: { type: mongoose.Schema.Types.ObjectId, ref: 'ArenaDayBooking', default: null },
          categories: {
            type: [
              new mongoose.Schema({
                name: { type: String, required: true, trim: true, maxlength: 60 },
                type: { type: String, enum: ['single', 'pair', 'team'], default: 'single' },
                minPlayers: { type: Number, default: 1, min: 1, max: 30 },
                maxPlayers: { type: Number, default: 1, min: 1, max: 30 },
                fee: { type: Number, default: 0, min: 0 },
                maxEntries: { type: Number, default: 0, min: 0 }, // 0 = no limit
              }),
            ],
            default: [],
          },
        },
        { _id: false }
      ),
      default: null,
    },
  },
  { timestamps: true }
);

function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    kind: o.kind,
    arenaId: o.arenaId ? String(o.arenaId) : null,
    title: o.title,
    subtitle: o.subtitle || '',
    body: o.body || '',
    imageUrl: o.imageUrl || '',
    linkUrl: o.linkUrl || '',
    sortOrder: o.sortOrder,
    isPublished: o.isPublished,
    inclusions: o.inclusions || [],
    maxParticipants: Number(o.maxParticipants) || 0,
    startDate: o.startDate ? o.startDate.toISOString() : null,
    endDate: o.endDate ? o.endDate.toISOString() : null,
    eventInfo: o.eventInfo ? {
      startDate: o.eventInfo.startDate || '',
      days: o.eventInfo.days || 1,
      endDate: o.eventInfo.endDate || o.eventInfo.startDate || '',
      allDay: o.eventInfo.allDay !== false,
      startTime: o.eventInfo.startTime || '00:00',
      endTime: o.eventInfo.endTime || '00:00',
      holdArenaId: o.eventInfo.holdArenaId ? String(o.eventInfo.holdArenaId) : null,
      courtIds: (o.eventInfo.courtIds || []).map(String),
      holdId: o.eventInfo.holdId ? String(o.eventInfo.holdId) : null,
      categories: (o.eventInfo.categories || []).map((c) => ({
        id: String(c._id), name: c.name, type: c.type || 'single',
        minPlayers: c.minPlayers || 1, maxPlayers: c.maxPlayers || 1, fee: Number(c.fee) || 0, maxEntries: c.maxEntries || 0,
      })),
    } : null,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

cmsContentSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('CmsContent', cmsContentSchema);
