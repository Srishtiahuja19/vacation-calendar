require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const HolidayCache = require('./models/HolidayCache');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

// Connect MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('Mongo connected'))
  .catch(err => console.error('Mongo connect error', err));

// ------------------- Helper -------------------

// fetch holidays from Nager.Date using native fetch (Node.js 18+)
const Holidays = require('date-holidays');

async function fetchHolidays(countryCode, year){
  const hd = new Holidays(countryCode);
  const holidays = hd.getHolidays(year); // returns array of holidays
  return holidays.map(h => ({
    date: h.date,          // yyyy-mm-dd
    localName: h.localName,
    name: h.name,
    type: h.type || [],
  }));
}


// ------------------- Routes -------------------

// Get holidays for a country/year
app.get('/api/holidays', async (req, res) => {
  try {
    const country = (req.query.country || 'IN').toUpperCase();
    const year = parseInt(req.query.year || (new Date()).getFullYear(), 10);

    // Try cache
    let cached = await HolidayCache.findOne({ countryCode: country, year });
    if(cached){
      const ageDays = (Date.now() - cached.fetchedAt.getTime()) / (1000*60*60*24);
      if(ageDays < 7) return res.json({ source: 'cache', holidays: cached.holidays });
    }

    // Fetch from Nager.Date
    const holidays = await fetchFromNager(country, year);

    // Update cache
    await HolidayCache.findOneAndUpdate(
      { countryCode: country, year },
      { holidays, fetchedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.json({ source: 'nager', holidays });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Add custom holiday (optional)
app.post('/api/holidays/custom', async (req,res)=>{
  try {
    const { countryCode, year, holiday } = req.body;
    if(!countryCode || !year || !holiday || !holiday.date) return res.status(400).json({ error:'missing fields' });

    const existing = await HolidayCache.findOne({ countryCode: countryCode.toUpperCase(), year });
    if(existing){
      existing.holidays.push(holiday);
      existing.fetchedAt = new Date();
      await existing.save();
    } else {
      await HolidayCache.create({
        countryCode: countryCode.toUpperCase(),
        year,
        holidays: [holiday],
        fetchedAt: new Date()
      });
    }
    return res.json({ ok:true });
  } catch(err){
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
