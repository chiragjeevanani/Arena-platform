const mongoose = require('mongoose');

const coachingBatchSchema = new mongoose.Schema(
  {
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Arena',
      required: true,
      index: true,
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    capacity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0, default: 0 },
    startDate: { type: String, required: true, trim: true },
    endDate: { type: String, required: true, trim: true },
    schedule: { type: String, default: '', trim: true },
    scheduleTime: { type: String, default: '', trim: true },
    isPublished: { type: Boolean, default: false },
    registrationFee: { type: Number, default: 500 },
    taxPercent: { type: Number, default: 18 },
    level: { type: String, default: 'Open' },
    coachImage: { type: String, default: '' },
    rating: { type: Number, default: 5.0 },
    studentCount: { type: String, default: '500+' },
    experienceYears: { type: String, default: '8+ Years' },
    benefits: { type: [String], default: [] },
  },
  { timestamps: true }
);

function toPublic(doc, extras = {}) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    arenaId: o.arenaId && o.arenaId._id ? String(o.arenaId._id) : String(o.arenaId),
    coachId: o.coachId && o.coachId._id ? String(o.coachId._id) : String(o.coachId),
    title: o.title,
    description: o.description || '',
    capacity: o.capacity,
    price: o.price,
    startDate: o.startDate,
    endDate: o.endDate,
    schedule: o.schedule || '',
    scheduleTime: o.scheduleTime || '',
    isPublished: o.isPublished,
    registrationFee: o.registrationFee,
    taxPercent: o.taxPercent,
    level: o.level,
    coachImage: o.coachImage,
    rating: o.rating,
    studentCount: o.studentCount,
    experienceYears: o.experienceYears,
    benefits: o.benefits || [],
    createdAt: o.createdAt,
    coachName: o.coachId?.name || '',
    coachAvatar: o.coachId?.avatarUrl || o.coachImage || '',
    coachBio: o.coachId?.bio || '',
    coachAchievements: o.coachId?.achievements || [],
    coachHours: o.coachId?.hours || '',
    coachWins: o.coachId?.wins || '',
    coachExperience: o.coachId?.experience || o.experienceYears || '',
    ...extras,
  };
}

coachingBatchSchema.statics.toPublic = toPublic;

module.exports = mongoose.model('CoachingBatch', coachingBatchSchema);
