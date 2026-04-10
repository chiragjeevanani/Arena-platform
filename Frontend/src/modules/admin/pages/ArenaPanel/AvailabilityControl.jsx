import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, ChevronLeft, ChevronRight, X, Wrench, Trophy, 
  UsersRound, PenLine, Plus, ArrowRight, Activity, Clock,
  Trash2, Hash
} from 'lucide-react';
import { format, addDays, startOfToday, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';

const COURTS = [
  { id: 'c1', name: 'Court 1' },
  { id: 'c2', name: 'Court 2' },
  { id: 'c3', name: 'Court 3' },
  { id: 'c4', name: 'Court 4' },
  { id: 'c5', name: 'Court 5' },
];

const BLOCK_TYPES = [
  { id: 'maintenance', label: 'Maintenance', color: '#f59e0b', icon: Wrench },
  { id: 'event', label: 'Event', color: '#6366f1', icon: Trophy },
  { id: 'coaching', label: 'Coaching', color: '#22c55e', icon: UsersRound },
  { id: 'custom', label: 'Custom', color: '#64748b', icon: PenLine },
];

const TIME_SLOTS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

const INITIAL_BLOCKS = [
  { id: 'b1', courtId: 'c1', date: format(addDays(startOfToday(), 1), 'yyyy-MM-dd'), startTime: '09:00', endTime: '11:00', reason: 'maintenance' },
  { id: 'b2', courtId: 'c2', date: format(addDays(startOfToday(), 3), 'yyyy-MM-dd'), startTime: '14:00', endTime: '17:00', reason: 'event' },
  { id: 'b3', courtId: 'c3', date: format(startOfToday(), 'yyyy-MM-dd'), startTime: '07:00', endTime: '09:00', reason: 'coaching' },
];

const MOCK_BOOKINGS = [
  { courtId: 'c1', date: format(startOfToday(), 'yyyy-MM-dd'), startTime: '18:00' },
  { courtId: 'c2', date: format(startOfToday(), 'yyyy-MM-dd'), startTime: '19:00' },
  { courtId: 'c3', date: format(addDays(startOfToday(), 1), 'yyyy-MM-dd'), startTime: '17:00' },
];

const AvailabilityControl = () => {
  const [currentMonth, setCurrentMonth] = useState(startOfToday());
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ courtId: 'c1', startTime: '09:00', endTime: '10:00', reason: 'maintenance' });

  const monthDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const getSlotState = (courtId, time) => {
    const dateStr = selectedDateStr;
    const block = blocks.find(b => b.courtId === courtId && b.date === dateStr && b.startTime <= time && b.endTime > time);
    if (block) return { type: 'blocked', reason: block.reason, id: block.id };

    const booking = MOCK_BOOKINGS.find(b => b.courtId === courtId && b.date === dateStr && b.startTime === time);
    if (booking) return { type: 'booked' };

    const hour = parseInt(time);
    if (hour >= 17 && hour < 20) return { type: 'coaching' };

    return { type: 'available' };
  };

  const getSlotStyle = (state) => {
    switch (state.type) {
      case 'booked': return 'bg-red-50 text-red-600 border-red-200';
      case 'coaching': return 'bg-slate-50 text-slate-500 border-slate-300';
      case 'blocked': return 'bg-gray-50 text-gray-400 border-gray-200';
      default: return 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100 transition-colors cursor-pointer';
    }
  };

  const getSlotLabel = (state) => {
    switch (state.type) {
      case 'booked': return 'Booked';
      case 'coaching': return 'Coaching';
      case 'blocked': return BLOCK_TYPES.find(b => b.id === state.reason)?.label || 'Blocked';
      default: return 'Free';
    }
  };

  const getDayBlocks = (day) => {
    const str = format(day, 'yyyy-MM-dd');
    return blocks.filter(b => b.date === str).length;
  };

  const addBlock = () => {
    setBlocks(prev => [...prev, { id: `b${Date.now()}`, ...form, date: selectedDateStr }]);
    setShowModal(false);
  };

  const removeBlock = (id) => setBlocks(prev => prev.filter(b => b.id !== id));

  const inputCls = "w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#CE2029] focus:bg-white transition-all text-[#36454F]";

  return (
    <div className="font-sans text-[#36454F] max-w-[1600px] mx-auto tracking-tight">
      <div className="mx-auto space-y-6 py-6 px-1 md:px-0">
        
        {/* Modular Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* Calendar Picker (Original Rounded 2XL Design) */}
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
                const blocksCount = getDayBlocks(day);
                return (
                  <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                    className={`relative aspect-square flex flex-col items-center justify-center text-[11px] font-bold transition-all rounded-xl active:scale-95 duration-300 ${
                      isSelected ? 'bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/40 scale-105 z-10' :
                      isToday ? 'bg-[#CE2029]/10 text-[#CE2029] border border-[#CE2029]/20' :
                      'hover:bg-slate-50 text-[#36454F]'
                    }`}>
                    {format(day, 'd')}
                    {blocksCount > 0 && (
                      <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#CE2029]'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
               {[
                 { color: 'bg-green-400', label: 'Available' },
                 { color: 'bg-red-400', label: 'Booked' },
                 { color: 'bg-yellow-400', label: 'Coaching' },
                 { color: 'bg-gray-400', label: 'Blocked' },
               ].map(l => (
                 <div key={l.label} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${l.color}`} />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{l.label}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Availability Grid Card (Original Rounded 2XL Design - WITH 5 COURTS) */}
          <div className="xl:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                 <h3 className="font-bold text-[#36454F] flex items-center gap-2 uppercase tracking-wide text-xs">
                   <CalendarDays size={16} className="text-[#CE2029]" />
                   {format(selectedDate, 'EEEE, MMM dd yyyy')}
                 </h3>
                 <p className="text-[9px] font-medium text-slate-600 mt-0.5 uppercase tracking-wider">Slot availability by court</p>
              </div>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#CE2029] text-white text-[9px] font-semibold uppercase tracking-widest hover:shadow-md transition-all active:translate-y-0.5">
                <Plus size={14} strokeWidth={2.5} /> Block Slot
              </button>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="min-w-[700px]">
                {/* Court Headers */}
                <div className="flex border-b border-slate-100 bg-white sticky top-0 z-10">
                  <div className="w-20 shrink-0 py-4 border-r border-slate-100 flex items-center justify-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">Time</span>
                  </div>
                  {COURTS.map(c => (
                    <div key={c.id} className="flex-1 py-4 text-center">
                      <p className="text-[10px] font-bold text-[#36454F] uppercase tracking-widest">{c.name}</p>
                    </div>
                  ))}
                </div>

                {/* Time Rows */}
                <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto scrollbar-hide">
                  {TIME_SLOTS.map(time => (
                    <div key={time} className="flex items-stretch min-h-[52px]">
                      <div className="w-20 shrink-0 border-r border-slate-100 flex items-center justify-center bg-slate-50/50 hover:bg-slate-100 transition-colors">
                        <span className="text-[11px] font-black text-slate-700">{time}</span>
                      </div>
                      {COURTS.map(court => {
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

        {/* Override Registry (Rounded Design) */}
        {blocks.filter(b => b.date === selectedDateStr).length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-black text-[#36454F] text-sm uppercase tracking-widest mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
               <Hash size={14} className="text-[#CE2029]" /> Blocked Slots — {format(selectedDate, 'MMM dd')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
               {blocks.filter(b => b.date === selectedDateStr).map(block => {
                 const bt = BLOCK_TYPES.find(t => t.id === block.reason);
                 const court = COURTS.find(c => c.id === block.courtId);
                 return (
                   <motion.div key={block.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-300 transition-all">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-slate-200">
                           <bt.icon size={14} style={{ color: bt.color }} />
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-[#36454F] uppercase">{court?.name} · {bt.label}</p>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{block.startTime} — {block.endTime}</p>
                        </div>
                     </div>
                     <button onClick={() => removeBlock(block.id)} className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                   </motion.div>
                 );
               })}
            </div>
          </div>
        )}
      </div>

      {/* Block Modal (Rounded 3XL/XL Design) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">

              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <CalendarDays className="text-[#CE2029]" size={22} strokeWidth={3} /> Block Slots
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">{format(selectedDate, 'MMMM dd, yyyy')}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-100 transition-colors"><X size={18} strokeWidth={2.5} /></button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-1">Court Selection</label>
                  <select value={form.courtId} onChange={e => setForm(p => ({ ...p, courtId: e.target.value }))} className={inputCls}>
                    {COURTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-1">Start Cluster</label>
                    <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-1">End Cluster</label>
                    <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className={inputCls} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block px-1">Displacement Locus</label>
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
                  <button onClick={addBlock}
                    className="w-full h-14 rounded-xl bg-[#CE2029] text-white text-[12px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:shadow-lg shadow-[#CE2029]/20 transition-all active:translate-y-0.5">
                    Initiate Block <ArrowRight size={16} strokeWidth={3} />
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
