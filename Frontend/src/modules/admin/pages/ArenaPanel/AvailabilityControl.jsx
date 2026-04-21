import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, ChevronLeft, ChevronRight, X, Wrench, Trophy, 
  UsersRound, PenLine, Plus, ArrowRight, Activity, Clock,
  Trash2, Hash, Loader2
} from 'lucide-react';
import { format, addDays, startOfToday, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { useArenaPanel } from '../../context/ArenaPanelContext';
import { listMyBlocks, listMyBookings, createMyBlock, deleteMyBlock, getBlockSummary, listMyCourtSlots } from '../../../../services/arenaStaffApi';
import { showToast } from '../../../../utils/toast';

const BLOCK_TYPES = [
  { id: 'maintenance', label: 'Maintenance', color: '#f59e0b', icon: Wrench },
  { id: 'event', label: 'Event', color: '#6366f1', icon: Trophy },
  { id: 'coaching', label: 'Coaching', color: '#22c55e', icon: UsersRound },
  { id: 'custom', label: 'Custom', color: '#64748b', icon: PenLine },
];

const timeToMinutes = (t) => {
  if (!t) return 0;
  const parts = t.trim().split(' ');
  const [h, m] = parts[0].split(':').map(Number);
  let finalH = h;
  if (parts.length > 1) {
    const period = parts[1].toUpperCase();
    if (period === 'PM' && h !== 12) finalH += 12;
    if (period === 'AM' && h === 12) finalH = 0;
  }
  return finalH * 60 + (m || 0);
};

const timeTo24h = (t) => {
  if (!t) return '00:00';
  if (!t.includes(' ')) return t; // Already 24h or near it
  const parts = t.trim().split(' ');
  let [h, m] = parts[0].split(':').map(Number);
  const period = parts[1].toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
};

const AvailabilityControl = () => {
  const { arena, courts, loading: contextLoading } = useArenaPanel();
  const [currentMonth, setCurrentMonth] = useState(startOfToday());
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [blocks, setBlocks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [courtSlots, setCourtSlots] = useState({}); // { courtId: [slots] }
  const [summary, setSummary] = useState({}); // { '2025-04-20': count }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ courtId: '', startTime: '09:00', endTime: '10:00', reason: 'maintenance', note: '' });

  const monthDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const fetchData = useCallback(async () => {
    if (!arena || !courts) return;
    setLoading(true);
    try {
      const dayName = format(selectedDate, 'eee'); // 'Mon', 'Tue' etc
      const [blockRes, bookingRes, ...slotRes] = await Promise.all([
        listMyBlocks({ date: selectedDateStr }),
        listMyBookings({ date: selectedDateStr, arenaId: arena.id }),
        ...courts.map(c => listMyCourtSlots(c.id, dayName))
      ]);
      
      setBlocks(blockRes.blocks || []);
      setBookings(bookingRes.bookings || []);
      
      const slotMap = {};
      courts.forEach((c, i) => {
        slotMap[c.id] = slotRes[i].slots || [];
      });
      setCourtSlots(slotMap);
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('Failed to sync availability data', 'error');
    } finally {
      setLoading(false);
    }
  }, [arena, selectedDateStr, courts]);

  const fetchSummary = useCallback(async () => {
    if (!arena) return;
    try {
      const monthStr = format(currentMonth, 'yyyy-MM');
      const res = await getBlockSummary(monthStr);
      const counts = {};
      (res.summary || []).forEach(s => {
        counts[s.date] = s.count;
      });
      setSummary(counts);
    } catch (err) {
      console.error('Summary error:', err);
    }
  }, [arena, currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (courts?.length > 0 && !form.courtId) {
      setForm(prev => ({ ...prev, courtId: courts[0].id }));
    }
  }, [courts]);

  const DYNAMIC_TIME_SLOTS = useMemo(() => {
    const all = new Set();
    Object.values(courtSlots).forEach(slots => {
      slots.forEach(s => {
        const start = s.timeSlot.split(' - ')[0];
        all.add(start);
      });
    });
    return Array.from(all).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  }, [courtSlots]);

  const getSlotState = (courtId, startTime) => {
    const daySlots = courtSlots[courtId] || [];
    const config = daySlots.find(s => s.timeSlot.startsWith(startTime));
    
    if (!config) return { type: 'closed' };

    const time24 = timeTo24h(startTime);

    // Check Blocks
    const block = blocks.find(b => 
      b.courtId === courtId && 
      b.startTime <= time24 && 
      b.endTime > time24
    );
    if (block) return { type: 'blocked', reason: block.reason, id: block.id };

    // Check Bookings
    const booking = bookings.find(b => 
      b.courtId === courtId && 
      b.timeSlot === config.timeSlot &&
      (b.status === 'confirmed' || b.status === 'pending')
    );
    if (booking) return { type: 'booked', id: booking.id };

    return { type: 'available' };
  };

  const getSlotStyle = (state) => {
    switch (state.type) {
      case 'booked': return 'bg-red-50 text-red-600 border-red-200';
      case 'blocked': return 'bg-gray-50 text-gray-400 border-gray-200';
      case 'closed': return 'bg-slate-50 text-slate-300 border-slate-100 opacity-60';
      default: return 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100 transition-colors cursor-pointer';
    }
  };

  const getSlotLabel = (state) => {
    switch (state.type) {
      case 'booked': return 'Booked';
      case 'blocked': return BLOCK_TYPES.find(b => b.id === state.reason)?.label || 'Blocked';
      case 'closed': return 'NA';
      default: return 'Free';
    }
  };

  const handleAddBlock = async () => {
    if (!form.courtId || !form.startTime || !form.endTime) return;
    setSaving(true);
    try {
      await createMyBlock({ ...form, date: selectedDateStr });
      showToast('Availability block initiated', 'success');
      setShowModal(false);
      fetchData();
      fetchSummary();
    } catch (err) {
      showToast(err.message || 'Failed to block slot', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBlock = async (id) => {
    try {
      await deleteMyBlock(id);
      showToast('Slot block released', 'success');
      fetchData();
      fetchSummary();
    } catch (err) {
      showToast('Failed to release block', 'error');
    }
  };

  const inputCls = "w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#CE2029] focus:bg-white transition-all text-[#36454F]";

  if (contextLoading && !arena) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 text-[#CE2029] animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Grid Matrix...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-[#36454F] max-w-[1600px] mx-auto tracking-tight">
      <div className="mx-auto space-y-6 py-6 px-1 md:px-0">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* Calendar Picker */}
          <div className="xl:col-span-4 bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all"><ChevronLeft size={18} strokeWidth={2.5} /></button>
              <h3 className="font-semibold text-[#36454F] text-sm uppercase tracking-wider">{format(currentMonth, 'MMMM yyyy')}</h3>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all"><ChevronRight size={18} strokeWidth={2.5} /></button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-500 py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array(getDay(startOfMonth(currentMonth))).fill(null).map((_, i) => (<div key={i} />))}
              {monthDays.map(day => {
                const isToday = isSameDay(day, startOfToday());
                const isSelected = isSameDay(day, selectedDate);
                const dayStr = format(day, 'yyyy-MM-dd');
                const hasBlocks = summary[dayStr] > 0;
                return (
                  <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                    className={`relative aspect-square flex flex-col items-center justify-center text-[11px] font-bold transition-all rounded-xl active:scale-95 duration-300 ${
                      isSelected ? 'bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/40 scale-105 z-10' :
                      isToday ? 'bg-[#CE2029]/10 text-[#CE2029] border border-[#CE2029]/20' :
                      'hover:bg-slate-50 text-[#36454F]'
                    }`}>
                    {format(day, 'd')}
                    {hasBlocks && (
                      <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#CE2029]'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
               {[
                 { color: 'bg-green-400', label: 'Available' },
                 { color: 'bg-red-400', label: 'Occupied' },
                 { color: 'bg-gray-400', label: 'Staff Block' },
                 { color: 'bg-slate-200', label: 'Not Configured' },
               ].map(l => (
                 <div key={l.label} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${l.color}`} />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{l.label}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Availability Grid Card */}
          <div className="xl:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full relative">
            {loading && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-[20] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#CE2029]" size={24} />
              </div>
            )}
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                 <h3 className="font-bold text-[#36454F] flex items-center gap-2 uppercase tracking-wide text-xs">
                   <CalendarDays size={16} className="text-[#CE2029]" />
                   {format(selectedDate, 'EEEE, MMM dd yyyy')}
                 </h3>
                 <p className="text-[9px] font-medium text-slate-600 mt-0.5 uppercase tracking-wider">Locus occupancy matrix</p>
              </div>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#CE2029] text-white text-[9px] font-semibold uppercase tracking-widest hover:shadow-md transition-all active:translate-y-0.5">
                <Plus size={14} strokeWidth={2.5} /> Deploy Block
              </button>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="min-w-[700px]">
                {/* Court Headers */}
                <div className="flex border-b border-slate-100 bg-white sticky top-0 z-10">
                  <div className="w-20 shrink-0 py-4 border-r border-slate-100 flex items-center justify-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">Time</span>
                  </div>
                  {courts?.map(c => (
                    <div key={c.id} className="flex-1 py-4 text-center">
                      <p className="text-[10px] font-bold text-[#36454F] uppercase tracking-widest">{c.name}</p>
                    </div>
                  ))}
                </div>

                {/* Time Rows */}
                <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto scrollbar-hide">
                  {DYNAMIC_TIME_SLOTS.map(time => (
                    <div key={time} className="flex items-stretch min-h-[52px]">
                      <div className="w-20 shrink-0 border-r border-slate-100 flex items-center justify-center bg-slate-50/50">
                        <span className="text-[11px] font-black text-slate-700">{time}</span>
                      </div>
                      {courts?.map(court => {
                        const state = getSlotState(court.id, time);
                        return (
                          <div key={court.id} className="flex-1 p-1.5 border-r border-slate-50 last:border-0">
                            <div className={`h-full min-h-[38px] rounded-lg border text-[9px] font-black uppercase tracking-widest flex items-center justify-center px-2 transition-all shadow-sm ${getSlotStyle(state)}`}>
                              {getSlotLabel(state)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registry Summary */}
        <AnimatePresence>
          {blocks.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
              <h3 className="font-black text-[#36454F] text-sm uppercase tracking-widest mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                 <Hash size={14} className="text-[#CE2029]" /> Blocked Registries — {format(selectedDate, 'MMM dd')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                 {blocks.map(block => {
                   const bt = BLOCK_TYPES.find(t => t.id === block.reason);
                   const court = courts?.find(c => c.id === block.courtId);
                   return (
                     <div key={block.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-slate-200">
                             {bt ? <bt.icon size={14} style={{ color: bt.color }} /> : <PenLine size={14} />}
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-[#36454F] uppercase">{court?.name || 'Invalid Court'} · {bt?.label || 'Custom'}</p>
                             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{block.startTime} — {block.endTime}</p>
                          </div>
                       </div>
                       <button onClick={() => handleRemoveBlock(block.id)} className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                     </div>
                   );
                 })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Block Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">

              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <CalendarDays className="text-[#CE2029]" size={22} strokeWidth={3} /> Initiate Override
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">{format(selectedDate, 'MMMM dd, yyyy')}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-100 transition-colors"><X size={18} strokeWidth={2.5} /></button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-1">Target Court</label>
                  <select value={form.courtId} onChange={e => setForm(p => ({ ...p, courtId: e.target.value }))} className={inputCls}>
                    <option value="" disabled>Select a court</option>
                    {courts?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-1">Start Phase</label>
                    <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-1">End Phase</label>
                    <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className={inputCls} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-1">Block Logotype</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BLOCK_TYPES.map(bt => (
                      <button key={bt.id} onClick={() => setForm(p => ({ ...p, reason: bt.id }))}
                        className={`flex items-center gap-2 py-3 px-4 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                          form.reason === bt.id ? 'text-white border-transparent' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                        style={form.reason === bt.id ? { backgroundColor: bt.color } : {}}>
                        <bt.icon size={13} /> {bt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button onClick={handleAddBlock} disabled={saving}
                    className={`w-full h-14 rounded-xl text-white text-[12px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all active:translate-y-0.5 ${
                      saving ? 'bg-slate-400' : 'bg-[#CE2029] hover:shadow-lg shadow-[#CE2029]/20'
                    }`}>
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Activity size={16} strokeWidth={3} />}
                    {saving ? 'Processing Vector...' : 'Execute Override'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AvailabilityControl;
