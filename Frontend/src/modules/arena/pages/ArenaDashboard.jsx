import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, DollarSign, CalendarX2, Activity, Layers, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BRAND_RED = '#CE2029';
const BOOKED_RED = '#E65055'; // Lighter, vibrant shade of #CE2029

const STATS = [
  { label: 'Total Courts', value: '5', sub: '4 active now', icon: Target, color: BRAND_RED, path: '/arena/courts' },
  { label: 'Today\'s Slots', value: '35', sub: '22 booked · 13 free', icon: Clock, color: '#6366f1', path: '/arena/slots' },
  { label: 'Revenue Today', value: '8.450', sub: '+15% vs yesterday', icon: DollarSign, color: '#10b981', path: '/arena/pricing' },
  { label: 'Blocked Slots', value: '2', sub: '1 maintenance · 1 event', icon: CalendarX2, color: '#f59e0b', path: '/arena/availability' },
  { label: 'Active Bookings', value: '22', sub: 'For today', icon: Activity, color: '#0ea5e9', path: '/arena/slots' },
  { label: 'Upcoming Class', value: '1', sub: 'Elite Group Session', icon: Layers, color: '#a855f7', path: '/arena/availability' },
];

const TIME_SLOTS = [
  '5-6 AM', '6-7 AM', '7-8 AM', '8-9 AM', '9-10 AM', '10-11 AM', '11-12 PM',
  '12-1 PM', '1-2 PM', '2-3 PM', '3-4 PM', '4-5 PM', '5-6 PM', '6-7 PM',
  '7-8 PM', '8-9 PM', '9-10 PM', '10-11 PM', '11-12 AM'
];

const COURTS = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5'];

const ArenaDashboard = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-[#fffafa] p-4 md:p-6 lg:px-12 lg:py-6 space-y-4 text-[#36454F]">
      {/* High-Impact Header */}
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-5 h-[2.5px]" style={{ backgroundColor: BRAND_RED }} />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: BRAND_RED }}>Control Center</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-[#36454F] leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Good <span style={{ color: BRAND_RED }}>Evening</span> 👋
          </h1>
        </div>

        {/* Date Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CE2029]">
              <CalendarX2 size={14} />
            </div>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#36454F] outline-none focus:ring-2 focus:ring-[#CE2029]/20 transition-all shadow-sm"
            />
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 shadow-sm rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-widest text-[#36454F]">System Live</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-6 gap-3">
        {STATS.map((stat, i) => (
          <button 
            key={i}
            onClick={() => navigate(stat.path)}
            className="group relative bg-white border border-slate-100 rounded-xl p-4 text-left transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex flex-col h-[130px]"
          >
            <div className="w-8 h-8 rounded flex items-center justify-center mb-2 shadow-sm"
              style={{ backgroundColor: `${stat.color}15` }}>
              <stat.icon size={16} style={{ color: stat.color }} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500 mb-0.5">{stat.label}</p>
              <h3 className="text-xl font-black text-[#36454F] tracking-tighter leading-tight">{stat.value}</h3>
            </div>
            <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50">
                <p className="text-[9px] font-black text-slate-800 uppercase tracking-tighter leading-none opacity-80">{stat.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Booking Schedule - Sharp & Brand Aligned */}
      <div className="max-w-[1440px] mx-auto space-y-4 pb-12">
        {['WEEKDAYS (MON - FRI)', 'WEEKEND (SAT - SUN)'].map((title, sIdx) => (
          <div key={sIdx} className="bg-white rounded-xl overflow-hidden shadow-[0_5px_20px_rgba(0,0,0,0.02)] border border-slate-100">
            <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: sIdx === 0 ? '#36454F' : BRAND_RED }}>
              <div className="flex flex-col">
                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">{title}</h2>
                <p className="text-[7px] font-black text-white/40 uppercase tracking-[0.15em] mt-0.5">
                  {sIdx === 0 ? 'Regular Session Schedule' : 'Premium Rates & High Demand'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none">LIVE REPORT</p>
                <p className="text-[7px] font-black text-white/50 uppercase tracking-tight mt-1">
                  {new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="sticky left-0 z-20 bg-slate-50 p-3 border-r border-slate-100 min-w-[120px]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Arena Node</span>
                    </th>
                    {TIME_SLOTS.map((time, tIdx) => (
                      <th key={tIdx} className="px-3 py-2 border-r border-slate-50 min-w-[100px] text-center">
                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-600 whitespace-nowrap">{time}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COURTS.map((court, cIdx) => (
                    <tr key={cIdx} className="group">
                      <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 p-3 border-r border-b border-slate-50 font-black text-[12px] text-[#36454F] uppercase tracking-tight">
                        {court}
                      </td>
                      {TIME_SLOTS.map((_, tIdx) => {
                        const isBooked = (tIdx === 1 && cIdx < 3) || (tIdx > 11 && tIdx < 16 && (cIdx === 0 || cIdx === 2)) || (tIdx >= 16 && tIdx <= 18);
                        const isMaintenance = (tIdx > 12 && tIdx < 15 && cIdx === 4);
                        
                        return (
                          <td key={tIdx} className="p-1 border-r border-b border-slate-50 relative group/cell min-w-[100px]">
                            <div className={`h-10 rounded transition-all flex items-center justify-center cursor-pointer relative overflow-hidden ${
                                isBooked ? 'shadow shadow-red-500/10' : 
                                isMaintenance ? 'shadow shadow-amber-500/10' : 
                                'bg-white hover:bg-slate-50'
                            }`}
                                 style={{ 
                                    backgroundColor: isBooked ? BOOKED_RED : isMaintenance ? '#f59e0b' : ''
                                 }}>
                                {isBooked ? (
                                    <div className="flex flex-col items-center">
                                        <Activity size={10} className="text-white/30 mb-0.5" />
                                        <span className="text-[8px] font-black text-white uppercase tracking-tighter leading-none">BOOKED</span>
                                    </div>
                                ) : isMaintenance ? (
                                    <span className="text-[8px] font-black text-white uppercase tracking-tighter leading-none">BLOCKED</span>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-0.5 opacity-100 group-hover/cell:opacity-100 transition-opacity">
                                        <div className="w-1.5 h-1.5 rounded-sm border border-slate-300" />
                                        <span className="text-[8px] font-black uppercase text-slate-400">Available</span>
                                    </div>
                                )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center gap-8 pb-4 opacity-50">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: BOOKED_RED }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#36454F]">Booked</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#f59e0b]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#36454F]">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm border border-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#36454F]">Available</span>
        </div>
      </div>
    </div>
  );
};

export default ArenaDashboard;
