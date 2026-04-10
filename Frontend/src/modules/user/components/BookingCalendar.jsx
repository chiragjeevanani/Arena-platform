import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dateRange, addDays } from '../../../data/conflictMockData';

/**
 * BookingCalendar
 * Props:
 *   classifyDate(dateStr) → 'booked' | 'event' | 'overlap' | 'extended' | 'none'
 *   startDate  – string yyyy-mm-dd (first highlighted date)
 *   finalEndDate – string yyyy-mm-dd (last highlighted date)
 */
const BookingCalendar = ({ classifyDate, startDate, finalEndDate }) => {
  // start display at the month of startDate
  const initDate = new Date(startDate + 'T00:00:00');
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth()); // 0-based

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    cells.push(`${viewYear}-${mm}-${dd}`);
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });

  const cellStyle = (dateStr) => {
    if (!dateStr) return '';
    const kind = classifyDate(dateStr);
    switch (kind) {
      case 'booked':
        return 'bg-emerald-100 text-emerald-700 font-black border border-emerald-300 rounded-lg';
      case 'overlap':
        return 'bg-gradient-to-br from-orange-400 to-red-500 text-white font-black rounded-lg shadow-md shadow-orange-200 ring-1 ring-orange-300';
      case 'event':
        return 'bg-red-50 text-red-600 font-black border border-red-200 rounded-lg';
      case 'extended':
        return 'bg-blue-50 text-blue-700 font-black border border-blue-200 rounded-lg';
      default:
        return 'text-slate-400 hover:bg-slate-50 rounded-lg';
    }
  };

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { color: 'bg-emerald-400', label: 'Booked' },
          { color: 'bg-gradient-to-r from-orange-400 to-red-400', label: 'Blocked (Overlap)' },
          { color: 'bg-blue-400', label: 'Extended' },
          { color: 'bg-red-300', label: 'Event' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all text-slate-500"
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
        </button>
        <span className="text-[11px] font-black uppercase tracking-widest text-[#36454F]">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all text-slate-500"
        >
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-[9px] font-black uppercase text-slate-300 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {cells.map((dateStr, i) => (
          <div
            key={i}
            className={`aspect-square flex items-center justify-center text-[10px] sm:text-[11px] transition-all cursor-default select-none
              ${dateStr ? cellStyle(dateStr) : ''}`}
          >
            {dateStr ? parseInt(dateStr.split('-')[2]) : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingCalendar;
