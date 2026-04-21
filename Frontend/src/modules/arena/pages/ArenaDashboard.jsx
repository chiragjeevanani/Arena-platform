import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, DollarSign, CalendarX2, Activity, Layers, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../user/context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { listArenaAdminBookings, listArenaAdminCoachingBatches } from '../../../services/arenaAdminApi';
import { getArenaStaffArenaId } from '../../../utils/arenaStaffScope';
import { isMongoObjectId } from '../../../utils/mongoId';
import { listMyCourts, listMyBlocks, listMyCourtSlots } from '../../../services/arenaStaffApi';

const DAY_MAP = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };

const BRAND_RED = '#CE2029';
const BOOKED_RED = '#E65055'; // Lighter, vibrant shade of #CE2029

const STAT_DEFS = [
  { key: 'courts', label: 'Total Courts', defaultValue: '—', sub: 'Live metrics when API is connected', icon: Target, color: BRAND_RED, path: '/arena/courts' },
  { key: 'todaySlots', label: 'Today\'s Slots', defaultValue: '—', sub: 'Booked / free from schedule API', icon: Clock, color: '#6366f1', path: '/arena/slots' },
  { key: 'revenue', label: 'Revenue Today', defaultValue: '—', sub: 'Settlement data from backend', icon: DollarSign, color: '#10b981', path: '/arena/pricing' },
  { key: 'blocked', label: 'Blocked Slots', defaultValue: '—', sub: 'Maintenance & holds', icon: CalendarX2, color: '#f59e0b', path: '/arena/availability' },
  { key: 'activeBookings', label: 'Active Bookings', defaultValue: '—', sub: 'For selected date', icon: Activity, color: '#0ea5e9', path: '/arena/slots' },
  { key: 'class', label: 'Upcoming Class', defaultValue: '—', sub: 'Coaching schedule', icon: Layers, color: '#a855f7', path: '/arena/availability' },
];

const COURTS = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5'];

const ArenaDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [arenaBookings, setArenaBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [courtSlots, setCourtSlots] = useState({}); // Current day specific
  const [weekdayTemplate, setWeekdayTemplate] = useState({});
  const [weekendTemplate, setWeekendTemplate] = useState({});
  const [coachingBatches, setCoachingBatches] = useState([]);
  const [arenaLoading, setArenaLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [arenaError, setArenaError] = useState('');

  useEffect(() => {
    const arenaId = getArenaStaffArenaId(user);
    const canFetch =
      isApiConfigured() && getAuthToken() && arenaId && isMongoObjectId(arenaId);

    if (!canFetch) {
      setArenaBookings([]);
      setArenaError('');
      setArenaLoading(false);
      return undefined;
    }

    let cancelled = false;
    setArenaLoading(true);
    setArenaError('');

    Promise.allSettled([
      listArenaAdminBookings({ arenaId, date: selectedDate }),
      listMyCourts(),
      listMyBlocks({ date: selectedDate }),
      listArenaAdminCoachingBatches(arenaId)
    ]).then(async (results) => {
      if (cancelled) return;
      
      const [bookingsRes, courtsRes, blocksRes, batchesRes] = results;
      
      let fetchedCourts = [];
      if (bookingsRes.status === 'fulfilled') {
        setArenaBookings(Array.isArray(bookingsRes.value.bookings) ? bookingsRes.value.bookings : []);
      }
      if (courtsRes.status === 'fulfilled') {
        fetchedCourts = Array.isArray(courtsRes.value.courts) ? courtsRes.value.courts : [];
        setCourts(fetchedCourts);
      }
      if (blocksRes.status === 'fulfilled') {
        setBlocks(Array.isArray(blocksRes.value.blocks) ? blocksRes.value.blocks : []);
      }
      if (batchesRes.status === 'fulfilled') {
        setCoachingBatches(Array.isArray(batchesRes.value.batches) ? batchesRes.value.batches : []);
      }

      // Second wave: fetch templates + active slots
      if (fetchedCourts.length > 0) {
        setLoadingSlots(true);
        try {
          const dayName = DAY_MAP[new Date(selectedDate).getDay()];
          // Fetch Mon (Weekday), Sat (Weekend) and Current
          const [monRes, satRes, currentRes] = await Promise.all([
            Promise.all(fetchedCourts.map(c => listMyCourtSlots(c.id, 'Mon'))),
            Promise.all(fetchedCourts.map(c => listMyCourtSlots(c.id, 'Sat'))),
            Promise.all(fetchedCourts.map(c => listMyCourtSlots(c.id, dayName)))
          ]);
          
          const monMap = {};
          const satMap = {};
          const currentMap = {};
          
          fetchedCourts.forEach((c, idx) => {
            monMap[c.id] = monRes[idx].slots || [];
            satMap[c.id] = satRes[idx].slots || [];
            currentMap[c.id] = currentRes[idx].slots || [];
          });
          
          if (!cancelled) {
            setWeekdayTemplate(monMap);
            setWeekendTemplate(satMap);
            setCourtSlots(currentMap);
          }
        } catch (err) {
          console.error('Dashboard slot fetch failed', err);
        } finally {
          if (!cancelled) setLoadingSlots(false);
        }
      }
    }).catch((err) => {
      if (!cancelled) setArenaError(err.message || 'Could not load dashboard data');
    }).finally(() => {
      if (!cancelled) setArenaLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user, selectedDate]);

  const stats = useMemo(() => {
    const arenaId = getArenaStaffArenaId(user);
    const canUseApi =
      isApiConfigured() && getAuthToken() && arenaId && isMongoObjectId(arenaId);

    const activeCount = arenaBookings.filter(
      (b) =>
        b.date === selectedDate && (b.status === 'pending' || b.status === 'confirmed')
    ).length;
    const dayTotal = arenaBookings.filter((b) => b.date === selectedDate).length;
    const dayRevenue = arenaBookings
      .filter(b => b.date === selectedDate && b.status === 'confirmed')
      .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    return STAT_DEFS.map((def) => {
      if (!canUseApi) {
        return { ...def, value: def.defaultValue, sub: def.sub };
      }
      if (def.key === 'courts') {
        return { 
          ...def, 
          value: arenaLoading ? '…' : String(courts.length),
          sub: 'Registered Arena Assets' 
        };
      }
      if (def.key === 'todaySlots') {
        return {
          ...def,
          value: arenaLoading ? '…' : String(dayTotal),
          sub: `All statuses · ${selectedDate}`,
        };
      }
      if (def.key === 'revenue') {
        return { 
          ...def, 
          value: arenaLoading ? '…' : `OMR ${dayRevenue.toFixed(3)}`,
          sub: 'Total Confirmed Revenue' 
        };
      }
      if (def.key === 'blocked') {
        return { 
          ...def, 
          value: arenaLoading ? '…' : String(blocks.length),
          sub: 'Maintenance & Holds' 
        };
      }
      if (def.key === 'activeBookings') {
        return {
          ...def,
          value: arenaLoading ? '…' : String(activeCount),
          sub: 'Pending + confirmed',
        };
      }
      if (def.key === 'class') {
        const activeBatches = coachingBatches.filter(b => b.status === 'active');
        return { 
          ...def, 
          value: arenaLoading ? '…' : String(activeBatches.length),
          sub: activeBatches.length > 0 ? `Next: ${activeBatches[0].name}` : 'Coaching Schedule'
        };
      }
      return { ...def, value: def.defaultValue, sub: def.sub };
    });
  }, [user, selectedDate, arenaBookings, arenaLoading, courts, blocks, coachingBatches]);

  const currentGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }, []);

  const getColumns = (map) => {
    const all = new Set();
    Object.values(map).forEach(slots => slots.forEach(s => all.add(s.timeSlot)));
    return Array.from(all).sort((a, b) => {
      const getVal = (str) => {
        const [time, period] = str.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h * 60 + (m || 0);
      };
      const valA = getVal(a.split('-')[0].trim() + (a.includes('PM') ? ' PM' : ' AM'));
      const valB = getVal(b.split('-')[0].trim() + (b.includes('PM') ? ' PM' : ' AM'));
      return valA - valB;
    });
  };

  const WEEKDAY_COLS = useMemo(() => getColumns(weekdayTemplate), [weekdayTemplate]);
  const WEEKEND_COLS = useMemo(() => getColumns(weekendTemplate), [weekendTemplate]);

  const isWeekend = useMemo(() => {
    const d = new Date(selectedDate).getDay();
    return d === 0 || d === 6;
  }, [selectedDate]);

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
            Good <span style={{ color: BRAND_RED }}>{currentGreeting}</span> 👋
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

      {arenaError ? (
        <div className="max-w-[1440px] mx-auto rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {arenaError}
        </div>
      ) : null}

      {/* Stats Grid */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-6 gap-3">
        {stats.map((stat, i) => (
          <button 
            key={stat.key || i}
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

      {/* Booking Schedule - Dual Dynamic Containers */}
      <div className="max-w-[1440px] mx-auto space-y-6 pb-12">
        {[
          { id: 'weekday', label: 'WEEKDAYS (MON - FRI)', cols: WEEKDAY_COLS, template: weekdayTemplate, active: !isWeekend },
          { id: 'weekend', label: 'WEEKEND (SAT - SUN)', cols: WEEKEND_COLS, template: weekendTemplate, active: isWeekend }
        ].map((section, sIdx) => (
          <div key={section.id} className="bg-white rounded-xl overflow-hidden shadow-[0_5px_20px_rgba(0,0,0,0.02)] border border-slate-100">
            <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: sIdx === 1 ? BRAND_RED : '#36454F' }}>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">{section.label}</h2>
                    {section.active && (
                       <span className="bg-white/20 px-1.5 py-0.5 rounded text-[7px] font-black text-white/90 uppercase tracking-widest border border-white/10 animate-pulse">ACTIVE DATE</span>
                    )}
                </div>
                <p className="text-[7px] font-black text-white/40 uppercase tracking-[0.15em] mt-0.5">
                  {section.id === 'weekday' ? 'Regular Session Schedule' : 'Premium Rates & High Demand'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none">LIVE REPORT</p>
                <div className="flex items-center gap-2 mt-1">
                    {loadingSlots && <Loader2 size={8} className="animate-spin text-white/40" />}
                    <p className="text-[7px] font-black text-white/50 uppercase tracking-tight">
                    {section.active ? new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TEMPLATE PREVIEW'}
                    </p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="sticky left-0 z-20 bg-slate-50 p-3 border-r border-slate-100 min-w-[120px]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Arena Node</span>
                    </th>
                    {section.cols.length === 0 ? (
                        <th className="px-3 py-2 border-r border-slate-50 min-w-[100px] text-center">
                            <span className="text-[10px] font-black uppercase tracking-tight text-slate-400 italic">No Slots Configured</span>
                        </th>
                    ) : section.cols.map((time, tIdx) => (
                      <th key={tIdx} className="px-3 py-2 border-r border-slate-50 min-w-[100px] text-center">
                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-600 whitespace-nowrap">{time}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courts.length === 0 ? (
                    <tr>
                      <td colSpan={Math.max(section.cols.length, 1) + 1} className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                         No Registered Nodes Found
                      </td>
                    </tr>
                  ) : courts.map((court, cIdx) => (
                    <tr key={court.id || cIdx} className="group">
                      <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 p-3 border-r border-b border-slate-50 font-black text-[12px] text-[#36454F] uppercase tracking-tight">
                        {court.name}
                      </td>
                      {section.cols.length === 0 ? (
                         <td className="p-1 border-r border-b border-slate-50 relative group/cell min-w-[100px]">
                            <div className="h-10 bg-slate-50/30 rounded flex items-center justify-center">
                                <span className="text-[7px] font-bold text-slate-200">OFFLINE</span>
                            </div>
                         </td>
                      ) : section.cols.map((time, tIdx) => {
                        const templateSlot = (section.template[court.id] || []).find(s => s.timeSlot === time);
                        
                        // We ONLY show dynamic bookings/blocks if this section is ACTIVE for the selectedDate
                        const isBooked = section.active && arenaBookings.some(b => 
                          b.courtId === (court.id || court._id) && 
                          b.date === selectedDate && 
                          (b.status === 'confirmed' || b.status === 'pending') &&
                          b.timeSlot === time
                        );

                        const isMaintenance = section.active && blocks.some(bl => 
                           bl.courtId === (court.id || court._id) && 
                           bl.date === selectedDate &&
                           (bl.startTime === time || bl.timeSlot === time)
                        );

                        const isClosed = !templateSlot;
                        
                        return ( section.active ? (
                          <td key={tIdx} className="p-1 border-r border-b border-slate-50 relative group/cell min-w-[100px]">
                            <div className={`h-10 rounded transition-all flex items-center justify-center relative overflow-hidden ${
                                isClosed ? 'bg-slate-50/50' :
                                isBooked ? 'shadow shadow-red-500/10' : 
                                isMaintenance ? 'shadow shadow-amber-500/10' : 
                                'bg-white hover:bg-slate-50 cursor-pointer shadow-sm border border-slate-100'
                            }`}
                                 style={{ 
                                    backgroundColor: isClosed ? '#fafafa' : isBooked ? BOOKED_RED : isMaintenance ? '#f59e0b' : ''
                                 }}>
                                {isClosed ? (
                                    <span className="text-[7px] font-black text-slate-200 uppercase tracking-widest leading-none">CLOSED</span>
                                ) : isBooked ? (
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
                        ) : (
                          <td key={tIdx} className="p-1 border-r border-b border-slate-50 relative group/cell min-w-[100px]">
                            <div className={`h-10 rounded transition-all flex items-center justify-center relative overflow-hidden ${
                                isClosed ? 'bg-slate-50/10' : 'bg-slate-50/50 border border-dashed border-slate-200'
                            }`}>
                               {isClosed ? (
                                   <span className="text-[7px] font-black text-slate-200 uppercase tracking-widest leading-none">NA</span>
                               ) : (
                                   <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter leading-none">{templateSlot.slotClass === 'prime' ? 'PRIME' : 'NORM'}</span>
                               )}
                            </div>
                          </td>
                        ));
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
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#fafafa] border border-slate-100" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#36454F]">Closed</span>
        </div>
      </div>
    </div>
  );
};

export default ArenaDashboard;
