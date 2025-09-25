import React, { useState, useEffect } from 'react';
import Calendar from './component/Calendar';

const API_BASE = 'http://localhost:8000/api';

const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'AU', name: 'Australia' },
  // add more as needed
];

export default function App(){
  const [country, setCountry] = useState('IN');
  const [view, setView] = useState('month'); // 'month' or 'quarter'
  const [date, setDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const y = date.getFullYear();
    setLoading(true);
    fetch(`${API_BASE}/holidays?country=${country}&year=${y}`)
      .then(r => r.json())
      .then(d => {
        setHolidays(d.holidays || []);
      })
      .catch(err => {
        console.error(err);
        setHolidays([]);
      })
      .finally(()=> setLoading(false));
  }, [country, date]);

  return (
    <div style={{padding:20, fontFamily:'Inter, Arial'}}>
      <h1>Vacation Calendar</h1>
      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
        <label>
          Country:
          <select value={country} onChange={e=>setCountry(e.target.value)} style={{marginLeft:8}}>
            {COUNTRIES.map(c=> <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>

        <label>
          View:
          <select value={view} onChange={e=>setView(e.target.value)} style={{marginLeft:8}}>
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
          </select>
        </label>

        <button onClick={()=> setDate(new Date(date.getFullYear(), date.getMonth()-1, 1))}>Prev</button>
        <button onClick={()=> setDate(new Date())}>Today</button>
        <button onClick={()=> setDate(new Date(date.getFullYear(), date.getMonth()+1, 1))}>Next</button>

        <div style={{marginLeft:'auto'}}>
          {loading ? 'Loading holidays...' : `${holidays.length} holidays loaded`}
        </div>
      </div>

      <Calendar date={date} view={view} holidays={holidays} onMonthChange={setDate} />
    </div>
  );
}
