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
  const { toggleTheme } = useTheme();
  const isDark = false;

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
    <div className={`min-h-screen pb-36 relative overflow-hidden ${'bg-slate-50/50'}`}>
      {!isDark && (
        <>
          <div className="absolute top-24 -right-20 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-[500px] -left-20 w-64 h-64 bg-[#eb483f]/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Header */}
      <div className={`px-6 pt-3 md:pt-4 pb-3 md:pb-4 sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${'bg-[#eb483f] border-white/10 rounded-b-[20px] md:rounded-none shadow-lg'}`}>
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center border active:scale-95 transition-all ${'bg-white/10 border-white/20 text-white shadow-sm hover:bg-white/20'}`}
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-sm md:text-base font-black text-white uppercase tracking-wider font-display">Select Time Slot</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-4 md:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          
          {/* Left Column: Info, Visualizer, Date */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            {/* Arena Info Card */}
            <div className={`flex items-center gap-4 rounded-[24px] p-5 border transition-all duration-300 bg-white border-blue-50/50 shadow-sm hover:shadow-md`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 bg-[#eb483f]/5 text-[#eb483f] shadow-inner`}>
                <ShuttlecockIcon size={24} />
              </div>
              <div>
                <h2 className="font-black text-base md:text-lg text-[#eb483f]">{arena?.name}</h2>
                <div className="flex items-center text-[10px] md:text-xs gap-1.5 text-slate-500 font-medium">
                  <MapPin size={12} className="text-[#eb483f]/60" />
                  {arena?.location}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#eb483f]/5 text-[#eb483f] text-[9px] font-black uppercase tracking-widest border border-[#eb483f]/10">
                    {currentCourt?.name}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{currentCourt?.type}</span>
                </div>
              </div>
            </div>

            {/* Court Visualizer */}
            <div className="bg-white/50 backdrop-blur-sm rounded-[32px] p-2 md:p-6 border border-white">
              <CourtVisualizer
                courts={arenaCourts}
                selectedCourt={selectedCourt}
                onCourtSelect={setSelectedCourt}
              />
            </div>

            {/* Date Selection */}
            <div className="bg-white rounded-[32px] p-6 border border-blue-50/50 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-[#eb483f]/60">Select Date</h3>
                  <p className="text-lg font-black text-slate-900 mt-1">March 2026</p>
                </div>
                <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase text-[#eb483f] bg-[#eb483f]/5 border border-[#eb483f]/10 shadow-sm">
                  Full Month
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {days.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(d.date)}
                    className={`flex flex-col items-center justify-center min-w-[56px] py-4 rounded-[24px] transition-all duration-300 border ${selectedDate === d.date
                        ? "bg-[#eb483f] border-[#eb483f] shadow-[0_12px_24px_rgba(235,72,63,0.25)] -translate-y-1"
                        : "bg-white border-blue-50/80 hover:border-[#eb483f]/30 hover:bg-[#eb483f]/5"
                      }`}
                  >
                    <span className={`text-[10px] uppercase font-black tracking-tight ${selectedDate === d.date ? 'text-white/80' : 'text-slate-400'}`}>
                      {d.day}
                    </span>
                    <span className={`text-lg font-black mt-1 ${selectedDate === d.date ? 'text-white' : 'text-[#eb483f]'}`}>
                      {d.date}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Slots & Inline Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`px-6 py-8 md:py-8 md:px-8 rounded-[36px] border transition-all duration-500 bg-white border-blue-50 shadow-[0_12px_40px_rgba(10,31,68,0.05)]`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#eb483f]/60">Available Slots</h3>
                
                {/* Color Guide Desktop Inline */}
                <div className="hidden xl:flex items-center gap-4">
                   <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400">
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                     Booked
                   </div>
                   <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#eb483f]" />
                     Selected
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3">
                {SLOTS.map(slot => (
                  <CourtSlot
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedSlot === slot.id}
                    onSelect={setSelectedSlot}
                  />
                ))}
              </div>

              {/* Mobile Guide only */}
              <div className="mt-8 flex flex-wrap gap-y-2 gap-x-4 xl:hidden">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-slate-200`} />
                  <span className={`text-[8px] font-black uppercase tracking-wider text-slate-600`}>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FFD600]/40" />
                  <span className={`text-[8px] font-black uppercase tracking-wider text-slate-600`}>Coaching</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#eb483f]" />
                  <span className={`text-[8px] font-black uppercase tracking-wider text-slate-600`}>Selected</span>
                </div>
              </div>
            </div>

            {/* Desktop Only Summary Card */}
            <div className="hidden lg:block sticky top-24">
               <div className="rounded-[32px] p-8 bg-white border border-[#eb483f]/10 shadow-[0_20px_50px_rgba(235,72,63,0.08)] relative overflow-hidden">
                 {/* Decorative background circle */}
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#eb483f]/5 rounded-full blur-3xl pointer-events-none" />
                 
                 <div className="relative z-10">
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-[#eb483f] mb-6">Selection Summary</h4>
                   
                   <div className="space-y-4 mb-8">
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500 font-bold tracking-tight">Court Fee</span>
                       <span className="text-slate-900 font-black">₹{selectedSlot ? SLOTS.find(s => s.id === selectedSlot)?.price : 0}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500 font-bold tracking-tight">Taxes & Fees</span>
                       <span className="text-slate-900 font-black">₹0</span>
                     </div>
                     <div className="h-[1px] bg-slate-100 w-full my-2" />
                     <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#eb483f]/40">Total Amount</span>
                       <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black font-display text-[#eb483f]">
                            ₹{selectedSlot ? SLOTS.find(s => s.id === selectedSlot)?.price : 0}
                          </span>
                          <span className="text-[10px] font-black text-[#eb483f]/40 uppercase tracking-widest">INR</span>
                       </div>
                     </div>
                   </div>

                   <button
                     disabled={!selectedSlot}
                     onClick={() => navigate('/booking-summary', {
                       state: {
                         arena,
                         court: currentCourt,
                         date: `March ${selectedDate}, 2026`,
                         slot: SLOTS.find(s => s.id === selectedSlot)
                       }
                     })}
                     className={`w-full py-5 rounded-[20px] font-black uppercase tracking-widest text-xs transition-all duration-500 flex items-center justify-center gap-2 ${
                       selectedSlot 
                        ? 'bg-[#eb483f] text-white shadow-[0_15px_30px_rgba(235,72,63,0.3)] hover:shadow-[0_20px_40px_rgba(235,72,63,0.4)] hover:-translate-y-1 active:scale-95' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                     }`}
                   >
                     Review Order
                   </button>
                   {!selectedSlot && (
                     <p className="text-[9px] text-center mt-4 text-slate-400 font-bold italic uppercase tracking-wider">Please select a time slot to proceed</p>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden">
        <div className={`h-[1px] ${'bg-slate-100'}`} />
        <div className={`backdrop-blur-xl p-5 flex items-center justify-between border-t transition-all duration-300 ${'bg-white border-blue-50 shadow-[0_-15px_50px_rgba(10,31,68,0.08)]'
          }`}>
          <div className="flex flex-col">
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${'text-[#eb483f]/40'}`}>Total Amount</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black font-display tracking-tight ${'text-[#eb483f]'}`}>
                ₹{selectedSlot ? SLOTS.find(s => s.id === selectedSlot)?.price : 0}
              </span>
              <span className={`text-[10px] font-bold ${'text-[#eb483f]/30'}`}>INR</span>
            </div>
          </div>

          <ShuttleButton
            variant="primary"
            size="lg"
            className={`!rounded-2xl px-8 !bg-[#eb483f] !text-white transform transition-all duration-300 ${!selectedSlot ? 'opacity-50 grayscale' : 'hover:scale-105 active:scale-95 shadow-[0_8px_25px_rgba(235,72,63,0.3)]'}`}
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



