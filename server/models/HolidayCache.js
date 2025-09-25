const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
  countryCode: { type: String, required: true },
  year: { type: Number, required: true },
  holidays: [
    {
      date: String,
      localName: String,
      name: String,
      type: String
    }
  ],
  fetchedAt: { type: Date, default: Date.now }
});

HolidaySchema.index({ countryCode: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('HolidayCache', HolidaySchema);
