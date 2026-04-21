const mongoose = require('mongoose');

const arenaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, default: '', trim: true },
    category: { type: String, default: 'Badminton', trim: true },
    description: { type: String, default: '' },
    amenities: { type: [String], default: [] },
    pricePerHour: { type: Number, required: true, min: 0, default: 0 },
    imageUrl: { type: String, default: '' },
    isPublished: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    distance: { type: String, default: '' },
    courtsCount: { type: Number, default: 0, min: 0 },
    contact: { type: String, default: '', trim: true },
    openTime: { type: String, default: '06:00' },
    closeTime: { type: String, default: '22:00' },
    priceConfig: {
      primeRate: { type: Number, default: 0 },
      nonPrimeRate: { type: Number, default: 0 },
      peakEnabled: { type: Boolean, default: false },
      peakStart: { type: String, default: '17:00' },
      peakEnd: { type: String, default: '20:00' },
      peakPrice: { type: Number, default: 0 },
      weekendEnabled: { type: Boolean, default: false },
      weekendPrice: { type: Number, default: 0 },
      memberDiscountEnabled: { type: Boolean, default: false },
      memberDiscountType: { type: String, default: 'percentage' }, // percentage | flat
      memberDiscountPrime: { type: Number, default: 0 },
      memberDiscountNonPrime: { type: Number, default: 0 },
      holidayOverrides: [
        {
          id: String,
          name: String,
          startDate: String,
          endDate: String,
          primeRate: Number,
          nonPrimeRate: Number
        }
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Arena', arenaSchema);
