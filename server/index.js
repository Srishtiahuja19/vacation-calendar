require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Holidays = require('date-holidays');
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

// ------------------- Routes -------------------

// Get holidays for a country/year
app.get('/api/holidays', async (req,res)=>{
  try {
    const country = (req.query.country || 'AT').toUpperCase();
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);

    // Try cache
    let cached = await HolidayCache.findOne({ countryCode: country, year });
    if(cached){
      const ageDays = (Date.now() - cached.fetchedAt.getTime()) / (1000*60*60*24);
      if(ageDays < 7) return res.json({ source:'cache', holidays: cached.holidays });
    }

    // Fetch using date-holidays library
    const hd = new Holidays(country);
    const holidaysRaw = hd.getHolidays(year) || [];

    // Map to simplified format
    const holidays = holidaysRaw.map(h=>({
      date: h.date.split('T')[0],
      localName: h.name,
      name: h.name,
      type: h.type
    }));

    // Save/update cache
    await HolidayCache.findOneAndUpdate(
      { countryCode: country, year },
      { holidays, fetchedAt: new Date() },
      { upsert:true, new:true }
    );

    return res.json({ source:'api', holidays });
  } catch(err){
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, ()=> console.log(`Server listening on ${PORT}`));
