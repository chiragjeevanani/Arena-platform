import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { ARENAS, COURTS, SLOTS } from '../../../data/mockData';
import { motion } from 'framer-motion';
import CourtSlot from '../components/CourtSlot';
import CourtVisualizer from '../components/CourtVisualizer';
import ShuttleButton from '../components/ShuttleButton';
import { ShuttlecockIcon } from '../components/BadmintonIcons';

import { useTheme } from '../context/ThemeContext';

const SlotSelection = () => {
  // Read from localStorage as requested
  const storedArena = JSON.parse(localStorage.getItem("selectedArena"));

  const { arenaId, courtId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Priority: URL Params > LocalStorage > MockData fallback
  const arena = storedArena || ARENAS.find(a => a.id === parseInt(arenaId));
  const [selectedDate, setSelectedDate] = useState(7);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(storedArena?.selectedCourt?.id || parseInt(courtId));

  const days = [
    { day: 'Sun', date: 1 }, { day: 'Mon', date: 2 }, { day: 'Tue', date: 3 }, { day: 'Wed', date: 4 },
    { day: 'Thu', date: 5 }, { day: 'Fri', date: 6 }, { day: 'Sat', date: 7 }, { day: 'Sun', date: 8 }
  ];

  const currentCourt = COURTS.find(c => c.id === selectedCourt);
  const arenaCourts = COURTS.filter(c => c.arenaId === parseInt(arenaId));

  return (
    <div className={`min-h-screen pb-36 relative overflow-hidden ${isDark ? '' : 'bg-slate-50/50'}`}>
      {!isDark && (
        <>
          <div className="absolute top-24 -right-20 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-[500px] -left-20 w-64 h-64 bg-[#eb483f]/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Header */}
      <div className={`px-6 pt-5 pb-4 sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${isDark ? 'bg-[#F3655D]/80 border-white/5' : 'bg-[#F3655D] border-blue-900/10 rounded-b-[24px] shadow-[0_8px_25px_rgba(10,31,68,0.12)]'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border active:scale-95 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white/10 border-white/20 text-white shadow-sm'}`}
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-bold text-white font-display">Select Time Slot</h1>
        </div>
      </div>


      <div className="px-6 mt-4 space-y-5">
        {/* Arena Info Card */}
        <div className={`flex items-center gap-4 rounded-[24px] p-4 border transition-all duration-300 ${isDark
            ? 'glass-neon border-[#eb483f]/20 bg-white/5'
            : 'bg-white border-blue-50 shadow-[0_6px_20px_rgba(10,31,68,0.04)] hover:shadow-[0_10px_30px_rgba(10,31,68,0.06)]'
          }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 ${isDark ? 'glass-light text-[#eb483f]' : 'bg-blue-50 text-[#F3655D] shadow-inner'
            }`}>
            <ShuttlecockIcon size={20} />
          </div>
          <div>
            <h2 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#F3655D]'}`}>{arena?.name}</h2>
            <div className={`flex items-center text-[8px] gap-1 ${isDark ? 'text-white/40' : 'text-slate-600'}`}>
              <MapPin size={10} />
              {arena?.location}
            </div>
            <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isDark ? 'text-[#eb483f]/60' : 'text-[#eb483f]'}`}>
              {currentCourt?.name} <span className="mx-1 opacity-20">|</span> {currentCourt?.type}
            </p>
          </div>
        </div>

        {/* Court Visualizer */}
        <CourtVisualizer
          courts={arenaCourts}
          selectedCourt={selectedCourt}
          onCourtSelect={setSelectedCourt}
        />

        {/* Date Selection */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-[#F3655D]/70'}`}>March 2026</h3>
            <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all ${isDark ? 'glass-light text-white/40 border-white/5' : 'bg-white text-[#F3655D]/80 border-blue-50 shadow-sm'
              }`}>Month</div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {days.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDate(d.date)}
                className={`flex flex-col items-center justify-center min-w-[48px] py-3 rounded-[20px] transition-all duration-300 border ${selectedDate === d.date
                    ? `bg-[#eb483f]/15 ${isDark ? 'border-[#eb483f]/30 shadow-[0_0_15px_rgba(235, 72, 63,0.2)]' : 'border-[#eb483f]/60 shadow-[0_8px_25px_rgba(235, 72, 63,0.2)]'}`
                    : `${isDark ? 'glass-light border-white/5 hover:border-white/10' : 'bg-white border-blue-50/50 hover:border-blue-200 shadow-[0_4px_15px_rgba(10,31,68,0.04)]'}`
                  }`}
              >
                <span className={`text-[9px] uppercase font-black tracking-tighter ${selectedDate === d.date ? 'text-[#eb483f]' : `${isDark ? 'text-white/25' : 'text-[#F3655D]/60'}`
                  }`}>{d.day}</span>
                <span className={`text-base font-black mt-0.5 ${selectedDate === d.date ? 'text-[#eb483f]' : `${isDark ? 'text-white/40' : 'text-[#F3655D]'}`
                  }`}>{d.date}</span>
              </button>

            ))}
          </div>
        </div>

        <div className={`-mx-6 px-6 py-8 rounded-t-[36px] border-t transition-all duration-500 ${isDark ? 'glass-card border-white/5' : 'bg-white border-blue-50 shadow-[0_-12px_40px_rgba(10,31,68,0.05)]'
          }`}>
          <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDark ? 'text-white/40' : 'text-[#F3655D]/60'}`}>Select your slot</h3>

          {/* Color Guide - Moved below heading */}
          <div className="mb-6 flex flex-wrap gap-y-2 gap-x-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-white/15' : 'bg-slate-200'}`} />
              <span className={`text-[8px] font-black uppercase tracking-wider ${isDark ? 'text-white/20' : 'text-slate-600'}`}>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FFD600]/40" />
              <span className={`text-[8px] font-black uppercase tracking-wider ${isDark ? 'text-white/20' : 'text-slate-600'}`}>Coaching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400/40" />
              <span className={`text-[8px] font-black uppercase tracking-wider ${isDark ? 'text-white/20' : 'text-slate-600'}`}>Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#eb483f]" />
              <span className={`text-[8px] font-black uppercase tracking-wider ${isDark ? 'text-white/20' : 'text-slate-600'}`}>Selected</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SLOTS.map(slot => (
              <CourtSlot
                key={slot.id}
                slot={slot}
                isSelected={selectedSlot === slot.id}
                onSelect={setSelectedSlot}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] md:max-w-[450px] md:mx-auto">
        <div className={`h-[1px] ${isDark ? 'bg-gradient-to-r from-transparent via-[#eb483f]/15 to-transparent' : 'bg-slate-100'}`} />
        <div className={`backdrop-blur-xl p-5 flex items-center justify-between border-t transition-all duration-300 ${isDark ? 'bg-[#F3655D]/95 border-white/5' : 'bg-white border-blue-50 shadow-[0_-15px_50px_rgba(10,31,68,0.08)]'
          }`}>
          <div>
            <p className={`text-[9px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-white/20' : 'text-[#F3655D]/60'}`}>Total Amount</p>
            <span className={`text-2xl font-black font-display ${isDark ? 'text-white' : 'text-[#F3655D]'}`}>
              â‚¹{selectedSlot ? SLOTS.find(s => s.id === selectedSlot)?.price : 0}
            </span>
          </div>

          <ShuttleButton
            variant="primary"
            size="md"
            className="!rounded-2xl px-6"
            disabled={!selectedSlot}
            onClick={() => navigate('/booking-summary', {
              state: {
                arena,
                court: currentCourt,
                date: `March ${selectedDate}, 2026`,
                slot: SLOTS.find(s => s.id === selectedSlot)
              }
            })}
          >
            Review Order
          </ShuttleButton>
        </div>
      </div>
    </div>
  );
};

export default SlotSelection;

