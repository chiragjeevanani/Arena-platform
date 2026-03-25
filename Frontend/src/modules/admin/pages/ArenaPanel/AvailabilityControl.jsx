import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, X, Wrench, Trophy, UsersRound, PenLine, Plus, ArrowRight } from 'lucide-react';
import { format, addDays, startOfToday, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, isBefore } from 'date-fns';

const COURTS = [
  { id: 'c1', name: 'Court A' },
  { id: 'c2', name: 'Court B' },
  { id: 'c3', name: 'Court C' },
  { id: 'c4', name: 'Court D' },
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
  const [selectedCourt, setSelectedCourt] = useState('c1');
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
      case 'booked': return 'bg-red-50 border-red-200 text-red-600';
      case 'coaching': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'blocked': {
        const bt = BLOCK_TYPES.find(b => b.id === state.reason);
        return `bg-gray-100 border-gray-300 text-gray-500`;
      }
      default: return 'bg-green-50 border-green-200 text-green-600 cursor-pointer hover:bg-green-100';
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

  const inputCls = "w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#eb483f] focus:bg-white transition-all text-[#1a2b3c]";

  return (
    <div className="space-y-6">
      {/* Calendar + Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Calendar Picker */}
        <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <h3 className="font-semibold text-[#1a2b3c] text-sm uppercase tracking-wider">{format(currentMonth, 'MMMM yyyy')}</h3>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array(getDay(startOfMonth(currentMonth))).fill(null).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {monthDays.map(day => {
              const isToday = isSameDay(day, startOfToday());
              const isSelected = isSameDay(day, selectedDate);
              const hasBlocks = getDayBlocks(day) > 0;
              return (
                <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-[11px] font-bold transition-all duration-300 active:scale-95 ${
                    isSelected ? 'bg-[#eb483f] text-white shadow-lg shadow-[#eb483f]/40 scale-105 z-10' :
                    isToday ? 'bg-[#eb483f]/10 text-[#eb483f] border border-[#eb483f]/20' :
                    'hover:bg-slate-50 text-[#1a2b3c]'
                  }`}>
                  {format(day, 'd')}
                  {hasBlocks && (
                    <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#eb483f]'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
            {[
              { color: 'bg-green-400', label: 'Available' },
              { color: 'bg-red-400', label: 'Booked' },
              { color: 'bg-yellow-400', label: 'Coaching' },
              { color: 'bg-gray-400', label: 'Blocked' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slot Grid */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#1a2b3c] flex items-center gap-2 uppercase tracking-wide text-xs">
                <CalendarDays size={16} className="text-[#eb483f]" />
                {format(selectedDate, 'EEEE, MMM dd yyyy')}
              </h3>
              <p className="text-[9px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">Slot availability by court</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#eb483f] text-white text-[9px] font-semibold uppercase tracking-widest hover:shadow-md transition-all">
              <Plus size={14} strokeWidth={2.5} /> Block Slot
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <div className="min-w-[700px]">
              {/* Court Headers */}
              <div className="flex border-b border-slate-100 bg-slate-50/80">
                <div className="w-20 shrink-0 py-4 border-r border-slate-100 flex items-center justify-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Time</span>
                </div>
                {COURTS.map(c => (
                  <div key={c.id} className="flex-1 py-4 text-center">
                    <p className="text-[10px] font-bold text-[#1a2b3c] uppercase tracking-widest">{c.name}</p>
                  </div>
                ))}
              </div>

              {/* Time Rows */}
              <div className="max-h-80 overflow-y-auto scrollbar-hide divide-y divide-slate-50">
                {TIME_SLOTS.map(time => (
                  <div key={time} className="flex items-stretch min-h-[52px]">
                    <div className="w-20 shrink-0 border-r border-slate-100 flex items-center justify-center bg-slate-50/50">
                      <span className="text-[11px] font-black text-slate-500">{time}</span>
                    </div>
                    {COURTS.map(court => {
                      const state = getSlotState(court.id, time);
                      return (
                        <div key={court.id} className="flex-1 p-1.5">
                          <div className={`h-full min-h-[38px] rounded-lg border text-[9px] font-black uppercase tracking-widest flex items-center justify-center px-2 transition-all ${getSlotStyle(state)}`}>
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

      {/* Active Blocks List */}
      {blocks.filter(b => b.date === selectedDateStr).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-black text-[#1a2b3c] text-sm uppercase tracking-widest mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
            <X size={14} className="text-[#eb483f]" /> Blocked Slots — {format(selectedDate, 'MMM dd')}
          </h3>
          <div className="space-y-2">
            <AnimatePresence>
              {blocks.filter(b => b.date === selectedDateStr).map(block => {
                const bt = BLOCK_TYPES.find(t => t.id === block.reason);
                const court = COURTS.find(c => c.id === block.courtId);
                return (
                  <motion.div key={block.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between py-3 px-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${bt.color}20` }}>
                        <bt.icon size={14} style={{ color: bt.color }} />
                      </div>
                      <div>
                        <p className="font-black text-[#1a2b3c] text-[12px]">{court?.name} · {bt.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{block.startTime} – {block.endTime}</p>
                      </div>
                    </div>
                    <button onClick={() => removeBlock(block.id)}
                      className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:border-red-400 hover:text-red-500 transition-all">
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Block Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">

              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <CalendarDays className="text-[#eb483f]" size={22} strokeWidth={3} /> Block Slots
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{format(selectedDate, 'MMMM dd, yyyy')}</p>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-100">
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Court</label>
                  <select value={form.courtId} onChange={e => setForm(p => ({ ...p, courtId: e.target.value }))} className={inputCls}>
                    {COURTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">From</label>
                    <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Until</label>
                    <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Block Reason</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BLOCK_TYPES.map(bt => (
                      <button key={bt.id} onClick={() => setForm(p => ({ ...p, reason: bt.id }))}
                        className={`flex items-center gap-2 py-3 px-4 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                          form.reason === bt.id
                            ? 'text-white border-transparent'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                        style={form.reason === bt.id ? { backgroundColor: bt.color, borderColor: bt.color } : {}}>
                        <bt.icon size={13} /> {bt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={addBlock}
                  className="w-full py-4 rounded-xl bg-[#eb483f] text-white text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#eb483f]/30 hover:-translate-y-0.5 transition-all mt-2">
                  Confirm Block <ArrowRight size={16} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AvailabilityControl;
