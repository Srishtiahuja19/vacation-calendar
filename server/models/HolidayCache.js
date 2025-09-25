const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
  countryCode: { type: String, required: true }, // ISO2 code, e.g., "US"
  year: { type: Number, required: true },
  holidays: [
    {
      date: String,
      localName: String,
      name: String,
      fixed: Boolean,
      global: Boolean,
      counties: [String],
      launchYear: Number,
      types: [String]
    }
  ],
  fetchedAt: { type: Date, default: Date.now }
});

// Ensure unique per country/year
HolidaySchema.index({ countryCode: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('HolidayCache', HolidaySchema);
