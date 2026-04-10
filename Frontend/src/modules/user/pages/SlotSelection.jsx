import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, CalendarDays, X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { ARENAS, COURTS, SLOTS } from '../../../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import CourtSlot from '../components/CourtSlot';
import CourtVisualizer from '../components/CourtVisualizer';
import ShuttleButton from '../components/ShuttleButton';
import { ShuttlecockIcon } from '../components/BadmintonIcons';
import PriceBreakdownCard from '../components/PriceBreakdownCard';

import { useTheme } from '../context/ThemeContext';

const SlotSelection = () => {
  // Read from localStorage as requested
  const storedArena = JSON.parse(localStorage.getItem("selectedArena"));

  const { arenaId, courtId } = useParams();
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const isDark = false;

  // Priority: URL Params > LocalStorage > MockData fallback
  const arena = storedArena || ARENAS.find(a => a.id === parseInt(arenaId));
  // Generate dynamic 7-day timeline starting from today
  const [viewDate, setViewDate] = useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const calendarDays = (() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const prevMonthDays = getDaysInMonth(year, month - 1);
    const cells = [];

    // Padding for previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ date: prevMonthDays - i, monthOffset: -1, fullDate: new Date(year, month - 1, prevMonthDays - i) });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ date: i, monthOffset: 0, fullDate: new Date(year, month, i) });
    }
    // Next month padding
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ date: i, monthOffset: 1, fullDate: new Date(year, month + 1, i) });
    }
    return cells;
  })();

  const changeMonth = (offset) => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + offset);
    setViewDate(d);
  };

  const getSelectedDisplayDate = () => {
    const d = new Date(selectedDate);
    return {
      month: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      date: d.getDate()
    };
  };

  const generateDays = () => {
    const today = new Date();
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() + i);
      return {
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        fullDate: d.toDateString(),
        month: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
    });
  };

  const days = generateDays();

  const [selectedDate, setSelectedDate] = useState(days[0].fullDate);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(storedArena?.selectedCourt?.id || parseInt(courtId));
  const [slotFilter, setSlotFilter] = useState('all'); // 'all' | 'prime' | 'nonPrime'
  const isMember = true; // TODO: replace with auth context — true = logged-in member

  const filteredSlots = SLOTS.filter(slot => {
    if (slotFilter === 'prime') return slot.type === 'prime';
    if (slotFilter === 'nonPrime') return slot.type === 'nonPrime';
    return true;
  });

  const currentCourt = COURTS.find(c => c.id === selectedCourt);
  const arenaCourts = COURTS.filter(c => c.arenaId === parseInt(arenaId));

  return (
    <div className={`min-h-screen pb-36 relative overflow-hidden bg-slate-50`}>
      {/* Premium Desktop Background Decorations */}
      <div className="hidden lg:block absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#CE2029]/5 to-transparent pointer-events-none" />
      <div className="hidden lg:block absolute top-1/4 -right-20 w-80 h-80 bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="hidden lg:block absolute bottom-1/4 -left-20 w-80 h-80 bg-[#CE2029]/5 rounded-full blur-[100px] pointer-events-none" />
      
      {!isDark && (
        <div className="lg:hidden">
          <div className="absolute top-24 -right-20 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-[500px] -left-20 w-64 h-64 bg-[#CE2029]/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      )}

      {/* Header */}
      <div className={`px-6 pt-3 md:pt-4 pb-3 md:pb-4 sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${'bg-[#CE2029] border-white/10 rounded-b-[20px] md:rounded-none shadow-lg'}`}>
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center border active:scale-95 transition-all bg-white/10 border-white/20 text-white shadow-sm hover:bg-white/20`}
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-sm md:text-base font-black text-white uppercase tracking-wider font-display">Select Time Slot</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-4 md:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-x-12 lg:gap-y-8 items-start">
          
          {/* LEFT COLUMN: Arena Info, Available Slots */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            {/* 1. Arena Info Card */}
            <div className={`group relative overflow-hidden rounded-[32px] border transition-all duration-500 bg-white border-blue-50/50 shadow-sm hover:shadow-xl`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#CE2029]/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[28px] bg-slate-900 flex items-center justify-center text-[#CE2029] shadow-2xl shadow-slate-200 overflow-hidden shrink-0">
                  <img 
                    src={arena?.image || "https://images.unsplash.com/photo-1626225967045-9410dd996057?q=80&w=2102&auto=format&fit=crop"} 
                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" 
                    alt="" 
                  />
                </div>
                <div className="text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm border border-amber-100">
                      <Star size={12} fill="currentColor" /> 4.9
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">• 124 Reviewers</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter mb-1">{arena?.name}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1 underline-offset-4 decoration-[#CE2029]/30">
                    <p className="text-slate-500 font-bold text-xs flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#CE2029]" /> {arena?.location}
                    </p>
                    <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-2">
                       <span className="px-2.5 py-0.5 rounded-lg bg-[#CE2029]/5 text-[#CE2029] text-[9px] font-black uppercase tracking-widest border border-[#CE2029]/10 shadow-sm">
                         {currentCourt?.name}
                       </span>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{currentCourt?.type} Court</span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4 mt-6">
                    {[
                      { icon: Star, label: 'Pro Grade' },
                      { icon: CalendarDays, label: 'Instant' },
                      { icon: Info, label: 'Pure Wood' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl hover:bg-white hover:shadow-md transition-all">
                        <item.icon size={12} className="text-[#CE2029]/60" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Mobile-Only Date Picker */}
            <div className="lg:hidden">
               <div className="bg-white rounded-[32px] p-6 border border-blue-50/50 shadow-sm">
                  <div className="flex justify-between items-end mb-6">
                    <button onClick={() => setShowCalendar(true)} className="text-left group transition-all active:scale-[0.98]">
                      <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-[#CE2029]/60 group-hover:text-[#CE2029]">Select Date</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xl font-black text-slate-900 leading-none">{getSelectedDisplayDate().month}</p>
                        <ChevronLeft size={12} className="rotate-[270deg] text-[#CE2029]" />
                      </div>
                    </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {days.slice(0, 8).map((d, i) => (
                      <button key={i} onClick={() => setSelectedDate(d.fullDate)}
                        className={`flex flex-col items-center justify-center min-w-[56px] py-4 rounded-[24px] border relative ${selectedDate === d.fullDate ? "border-[#CE2029]" : "bg-white border-blue-50/80"}`}>
                        <span className={`text-[10px] uppercase font-black tracking-tight relative z-10 ${selectedDate === d.fullDate ? 'text-white' : 'text-slate-400'}`}>{d.dayName}</span>
                        <span className={`text-lg font-black mt-1 relative z-10 ${selectedDate === d.fullDate ? 'text-white' : 'text-[#CE2029]'}`}>{d.date}</span>
                        {selectedDate === d.fullDate && <motion.div layoutId="activeDateMobile" className="absolute inset-0 bg-[#CE2029] rounded-[24px] z-0 shadow-lg shadow-[#CE2029]/30" />}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            {/* 3. Available Slots Section */}
            <div className={`px-6 py-8 md:py-8 md:px-8 rounded-[36px] border transition-all duration-500 bg-white border-blue-50 shadow-[0_12px_40px_rgba(10,31,68,0.05)]`}>
              <div className="mb-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#CE2029]/60 mb-1">Available Slots</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                         {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                       </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" /> Available
                  </div>
                </div>

                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'All Slots', icon: null },
                    { key: 'prime', label: 'Prime', icon: Star },
                    { key: 'nonPrime', label: 'Standard', icon: CalendarDays },
                  ].map(f => (
                    <button key={f.key} onClick={() => setSlotFilter(f.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${slotFilter === f.key ? 'bg-[#CE2029] border-[#CE2029] text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}>
                      {f.icon && <f.icon size={9} fill={slotFilter === f.key && f.key === 'prime' ? 'currentColor' : 'none'} />}
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <motion.div 
                key={selectedDate} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {filteredSlots.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-slate-400"><p className="text-[10px] font-black uppercase tracking-widest">No slots in this category</p></div>
                ) : filteredSlots.map(slot => (
                  <CourtSlot key={slot.id} slot={slot} isSelected={selectedSlot === slot.id} onSelect={setSelectedSlot} />
                ))}
              </motion.div>

              {/* Status Guide */}
              <div className="mt-8 flex flex-wrap gap-y-2 gap-x-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#CE2029]" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-600">Booked</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (Sticky on Desktop) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* 4. Desktop-Only Date Picker */}
            <div className="hidden lg:block bg-white rounded-[32px] p-6 border border-blue-50/50 shadow-sm h-fit">
              <div className="flex justify-between items-end mb-6">
                <button onClick={() => setShowCalendar(true)} className="text-left group transition-all active:scale-[0.98]">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CE2029]/60 group-hover:text-[#CE2029]">Select Date</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xl font-black text-slate-900 leading-none">{getSelectedDisplayDate().month}</p>
                    <ChevronLeft size={12} className="rotate-[270deg] text-[#CE2029]" />
                  </div>
                </button>
                <button onClick={() => setShowCalendar(true)} className="px-4 py-2 bg-[#CE2029]/5 text-[#CE2029] rounded-xl text-[10px] font-black uppercase hover:bg-[#CE2029] hover:text-white transition-all">
                  Full Month
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {days.slice(0, 7).map((d, i) => (
                  <button key={i} onClick={() => setSelectedDate(d.fullDate)}
                    className={`flex flex-col items-center justify-center min-w-[50px] py-4 rounded-[20px] border relative ${selectedDate === d.fullDate ? "border-[#CE2029]" : "bg-white border-blue-50/80 hover:bg-slate-50"}`}>
                    <span className={`text-[9px] uppercase font-black tracking-tight relative z-10 ${selectedDate === d.fullDate ? 'text-white' : 'text-slate-400'}`}>{d.dayName}</span>
                    <span className={`text-base font-black mt-1 relative z-10 ${selectedDate === d.fullDate ? 'text-white' : 'text-[#CE2029]'}`}>{d.date}</span>
                    {selectedDate === d.fullDate && <motion.div layoutId="activeDateDesktop" className="absolute inset-0 bg-[#CE2029] rounded-[20px] z-0 shadow-lg shadow-[#CE2029]/30" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Highlights */}
            <div className="hidden lg:flex items-center justify-between p-5 bg-[#CE2029]/5 rounded-[32px] border border-[#CE2029]/10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#CE2029] shadow-sm"><Star size={20} fill="currentColor" /></div>
                  <div><h5 className="text-[11px] font-black uppercase tracking-widest text-[#CE2029]">Member Perks</h5><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Save OMR 0.500 on prime slots.</p></div>
               </div>
            </div>

            {/* 5. Pricing Summary Card */}
            <div className="space-y-4">
              {selectedSlot ? (
                <PriceBreakdownCard slot={SLOTS.find(s => s.id === selectedSlot)} isMember={isMember} adminOverride={null} />
              ) : (
                <div className="rounded-[32px] p-10 bg-white border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center min-h-[220px]">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4 text-slate-200"><Star size={32} /></div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 max-w-[200px] leading-relaxed">Select a preferred time slot to review pricing</p>
                </div>
              )}
              <button disabled={!selectedSlot} 
                onClick={() => navigate('/booking-summary', { state: { arena, court: currentCourt, date: selectedDate, slot: SLOTS.find(s => s.id === selectedSlot) } })}
                className={`w-full py-4 rounded-[22px] font-black uppercase tracking-widest text-xs transition-all duration-500 ${selectedSlot ? 'bg-[#CE2029] text-white shadow-xl hover:-translate-y-1 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden">
        <div className="backdrop-blur-xl py-3 px-6 flex items-center justify-between bg-white/80 border-t border-blue-50 shadow-[0_-15px_50px_rgba(10,31,68,0.08)] rounded-t-[24px]">
          <PriceBreakdownCard
            slot={SLOTS.find(s => s.id === selectedSlot) || null}
            isMember={isMember}
            adminOverride={null}
            compact
          />
          <button disabled={!selectedSlot} 
            onClick={() => navigate('/booking-summary', { state: { arena, court: currentCourt, date: selectedDate, slot: SLOTS.find(s => s.id === selectedSlot) } })}
            className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${selectedSlot ? 'bg-[#CE2029] text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}>
            Review Order
          </button>
        </div>
      </div>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCalendar(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-6 bg-[#CE2029]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Select Custom Date</p>
                    <div className="flex items-center gap-3">
                       <button onClick={() => changeMonth(-1)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><ChevronLeft size={16} /></button>
                       <h3 className="text-xl font-black text-white min-w-[120px] text-center">
                         {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                       </h3>
                       <button onClick={() => changeMonth(1)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><ChevronRight size={16} /></button>
                    </div>
                  </div>
                  <button onClick={() => setShowCalendar(false)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><X size={18} /></button>
                </div>
              </div>
              <div className="p-6 pt-4">
                <div className="grid grid-cols-7 gap-y-1 text-center mb-2">
                  {['S','M','T','W','T','F','S'].map(d => (
                    <span key={d} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1.5">
                  {calendarDays.map((cell, i) => {
                    const isSelected = selectedDate === cell.fullDate.toDateString();
                    const isCurrentMonth = cell.monthOffset === 0;
                    const isToday = cell.fullDate.toDateString() === new Date().toDateString();
                    
                    return (
                      <div key={i} className="flex justify-center">
                        <button onClick={() => { setSelectedDate(cell.fullDate.toDateString()); setShowCalendar(false); }}
                          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs font-black transition-all relative ${
                            isSelected ? 'bg-[#CE2029] text-white shadow-lg scale-110' : 
                            isCurrentMonth ? 'text-slate-700 hover:bg-[#CE2029]/5' : 
                            'text-slate-200'
                          }`}>
                          {cell.date}
                          {isToday && !isSelected && <div className="w-1 h-1 rounded-full bg-[#CE2029] mt-0.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => setShowCalendar(false)} className="mt-8 w-full h-14 bg-slate-900 rounded-2xl text-white font-black uppercase tracking-widest text-[10px]">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlotSelection;
