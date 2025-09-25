import React from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, addDays, format,
  isSameMonth, isSunday, isSaturday, addMonths, getMonth, getYear
} from 'date-fns';
import './Calendar.css';

function holidaysSet(hols) {
  const map = {};
  (hols || []).forEach(h => map[h.date] = h);
  return map;
}

function getWeeksInMonth(monthStart) {
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  let weeks = [], day = startDate;
  while(day <= monthEnd || weeks.length < 6) {
    const week = [];
    for(let i=0;i<7;i++){
      week.push(new Date(day));
      day = addDays(day,1);
    }
    weeks.push(week);
  }
  return weeks;
}

function countWeekHolidays(week, holMap){
  return week.reduce((acc,d)=> acc + (holMap[format(d,'yyyy-MM-dd')] ? 1 : 0), 0);
}

export default function Calendar({ date, view='month', holidays=[], onMonthChange }){
  const holMap = holidaysSet(holidays);
  return view === 'month'
    ? <MonthView date={date} holMap={holMap} onMonthChange={onMonthChange} />
    : <QuarterView date={date} holMap={holMap} onMonthChange={onMonthChange} />;
}

// ---------------- Month View ----------------
function MonthView({ date, holMap, onMonthChange }){
  const monthStart = startOfMonth(date);
  const weeks = getWeeksInMonth(monthStart);

  return (
    <div className="calendar">
      <div className="header">
        <button onClick={()=> onMonthChange(addMonths(date, -1))}>◀ Prev</button>
        <div className="header-title">{format(date,'MMMM yyyy')}</div>
        <button onClick={()=> onMonthChange(addMonths(date,1))}>Next ▶</button>
      </div>

      <div className="week-days">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> <div key={d}>{d}</div>)}
      </div>

      {weeks.map((week,i)=>{
        const weekHolidayCount = countWeekHolidays(week,holMap);
        return (
          <div key={i} className="week-row">
            {week.map(d=>{
              const iso = format(d,'yyyy-MM-dd');
              const isCurrentMonth = isSameMonth(d, monthStart);
              const isWeekend = isSunday(d) || isSaturday(d);
              const hol = holMap[iso];
              let bg = '#fff';
              if(isCurrentMonth){
                if(weekHolidayCount === 1) bg = '#f0f0f0';
                if(weekHolidayCount > 1) bg = '#c2c2c2';
                if(isWeekend && weekHolidayCount === 0) bg = '#f9f9f9';
              } else bg = '#fafafa';

              return (
                <div key={iso} className="day-cell" style={{backgroundColor:bg}}>
                  <div className="day-number">{format(d,'d')}</div>
                  {hol && <div className="holiday-name" title={hol.name}>{hol.name}</div>}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ---------------- Quarter View ----------------
function QuarterView({ date, holMap, onMonthChange }){
  const startMonthOfQuarter = Math.floor(getMonth(date)/3)*3;
  const months = [startMonthOfQuarter, startMonthOfQuarter+1, startMonthOfQuarter+2];
  return (
    <div className="calendar">
      <div className="header">
        <button onClick={()=> onMonthChange(addMonths(date,-3))}>◀ Prev Qtr</button>
        <div className="header-title">Q{Math.floor(getMonth(date)/3)+1} {getYear(date)}</div>
        <button onClick={()=> onMonthChange(addMonths(date,3))}>Next Qtr ▶</button>
      </div>

      <div className="quarter-grid">
        {months.map(m=> 
          <div key={m} className="mini-month">
            <MiniMonth monthIndex={m} year={getYear(date)} holMap={holMap} />
          </div>
        )}
      </div>
    </div>
  )
}

function MiniMonth({ monthIndex, year, holMap }){
  const monthStart = new Date(year, monthIndex,1);
  const weeks = getWeeksInMonth(monthStart);

  return (
    <div>
      <div className="mini-month-title">{format(monthStart,'MMMM')}</div>
      <div className="mini-week-days">
        {['S','M','T','W','T','F','S'].map(x=> <div key={x}>{x}</div>)}
      </div>
      {weeks.map((week,i)=>{
        const weekHolidayCount = countWeekHolidays(week,holMap);
        return (
          <div key={i} className="week-row">
            {week.map(d=>{
              const iso = format(d,'yyyy-MM-dd');
              const isCurrentMonth = d.getMonth()===monthIndex;
              const isWeekend = isSunday(d) || isSaturday(d);
              let bg='#fff';
              if(isCurrentMonth){
                if(weekHolidayCount===1) bg='#f0f0f0';
                if(weekHolidayCount>1) bg='#c2c2c2';
                if(isWeekend && weekHolidayCount===0) bg='#f9f9f9';
              } else bg='#fafafa';
              return <div key={iso} className="day-cell" style={{backgroundColor:bg}}></div>
            })}
          </div>
        )
      })}
    </div>
  )
}
