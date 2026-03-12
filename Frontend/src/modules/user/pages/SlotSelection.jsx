import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ARENAS, COURTS, SLOTS } from '../../../data/mockData';
import { motion } from 'framer-motion';
import CourtSlot from '../components/CourtSlot';
import CourtVisualizer from '../components/CourtVisualizer';
import ShuttleButton from '../components/ShuttleButton';
import { ShuttlecockIcon } from '../components/BadmintonIcons';

const SlotSelection = () => {
  const { arenaId, courtId } = useParams();
  const navigate = useNavigate();
  const arena = ARENAS.find(a => a.id === parseInt(arenaId));
  const [selectedDate, setSelectedDate] = useState(7);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(parseInt(courtId));

  const days = [
    { day: 'Sun', date: 1 }, { day: 'Mon', date: 2 }, { day: 'Tue', date: 3 }, { day: 'Wed', date: 4 },
    { day: 'Thu', date: 5 }, { day: 'Fri', date: 6 }, { day: 'Sat', date: 7 }, { day: 'Sun', date: 8 }
  ];

  const currentCourt = COURTS.find(c => c.id === selectedCourt);
  const arenaCourts = COURTS.filter(c => c.arenaId === parseInt(arenaId));

  return (
    <div className="min-h-screen pb-36">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl glass-light flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
        >
          <ArrowLeft size={18} className="text-white/60" />
        </button>
        <h1 className="text-lg font-bold text-white font-display">Book a Court</h1>
      </div>

      <div className="px-6 mt-4 space-y-6">
        {/* Arena Info */}
        <div className="flex items-center gap-3 glass-neon rounded-2xl p-4">
          <div className="w-11 h-11 rounded-xl glass-light flex items-center justify-center text-[#22FF88]">
            <ShuttlecockIcon size={20} />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">{arena?.name}</h2>
            <p className="text-[10px] text-[#22FF88]/60 font-medium">{currentCourt?.name} • {currentCourt?.type}</p>
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
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">March 2026</h3>
            <div className="glass-light px-3 py-1.5 rounded-xl text-[10px] font-bold text-white/40 border border-white/5">Month</div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {days.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDate(d.date)}
                className={`flex flex-col items-center justify-center min-w-[48px] py-3 rounded-2xl transition-all duration-300 ${
                  selectedDate === d.date
                    ? 'bg-[#22FF88]/15 border border-[#22FF88]/30 neon-glow'
                    : 'glass-light border border-white/5 hover:border-white/10'
                }`}
              >
                <span className={`text-[9px] uppercase font-bold tracking-tighter ${
                  selectedDate === d.date ? 'text-[#22FF88]/70' : 'text-white/25'
                }`}>{d.day}</span>
                <span className={`text-base font-bold mt-1 ${
                  selectedDate === d.date ? 'text-[#22FF88]' : 'text-white/40'
                }`}>{d.date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots — Tournament Schedule Board */}
        <div className="glass-card -mx-6 px-6 py-6 rounded-t-[32px] border-t border-white/5">
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-5">Pick a time</h3>
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

          {/* Color Guide */}
          <div className="mt-6 grid grid-cols-2 gap-y-3 gap-x-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFD600]/40" />
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">Coaching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/40" />
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22FF88]" />
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">Selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] md:max-w-[450px] md:mx-auto">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#22FF88]/15 to-transparent" />
        <div className="bg-[#08142B]/95 backdrop-blur-xl p-5 flex items-center justify-between border-t border-white/5">
          <div>
            <p className="text-white/20 text-[9px] font-bold uppercase tracking-[0.15em]">Total Amount</p>
            <span className="text-2xl font-bold text-white font-display">
              ₹{selectedSlot ? SLOTS.find(s => s.id === selectedSlot)?.price : 0}
            </span>
          </div>
          <ShuttleButton
            variant="primary"
            size="lg"
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
            Book Now
          </ShuttleButton>
        </div>
      </div>
    </div>
  );
};

export default SlotSelection;
