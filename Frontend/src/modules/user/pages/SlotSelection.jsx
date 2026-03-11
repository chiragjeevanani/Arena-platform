import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, CalendarToday, AccessTime, Info } from '@mui/icons-material';
import { ARENAS, COURTS, SLOTS } from '../../../data/mockData';
import { motion } from 'framer-motion';

const SlotSelection = () => {
  const { arenaId, courtId } = useParams();
  const navigate = useNavigate();
  const arena = ARENAS.find(a => a.id === parseInt(arenaId));
  const [selectedDate, setSelectedDate] = useState(7); // Default to March 7 as per image
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(parseInt(courtId));

  const days = [
    { day: 'Sun', date: 1 }, { day: 'Mon', date: 2 }, { day: 'Tue', date: 3 }, { day: 'Wed', date: 4 },
    { day: 'Thu', date: 5 }, { day: 'Fri', date: 6 }, { day: 'Sat', date: 7 }, { day: 'Sun', date: 8 }
  ];

  const getStatusColor = (status, isSelected) => {
    if (isSelected) return 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 border-emerald-600';
    switch (status) {
      case 'Available': return 'bg-slate-50 text-slate-900 border-slate-100 hover:border-emerald-500';
      case 'Booked': return 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed';
      case 'Coaching': return 'bg-indigo-100 text-indigo-600 border-indigo-200 cursor-not-allowed';
      case 'Blocked': return 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed';
      case 'Maintenance': return 'bg-amber-100 text-amber-600 border-amber-200 cursor-not-allowed';
      default: return 'bg-slate-50';
    }
  };

  const currentCourt = COURTS.find(c => c.id === selectedCourt);

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
          <ArrowBack className="text-slate-900" sx={{ fontSize: 20 }} />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Book a Court</h1>
      </div>

      <div className="px-6 mt-6 space-y-8">
        {/* Arena Info Small */}
        <div className="flex items-center space-x-3 bg-emerald-50/50 p-4 rounded-[24px] border border-emerald-100">
           <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
             🏸
           </div>
           <div>
              <h2 className="font-bold text-slate-900">{arena?.name}</h2>
              <p className="text-xs text-emerald-600 font-medium">{currentCourt?.name} • {currentCourt?.type}</p>
           </div>
        </div>

        {/* Court Selection */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-widest">Select a Court</h3>
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
             {COURTS.filter(c => c.arenaId === parseInt(arenaId)).map(court => (
               <button 
                 key={court.id}
                 onClick={() => setSelectedCourt(court.id)}
                 className={`min-w-[56px] h-14 rounded-2xl font-bold border-2 transition-all ${
                   selectedCourt === court.id 
                   ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                   : 'bg-slate-50 border-slate-50 text-slate-400'
                 }`}
               >
                 {court.name.split(' ')[1]}
               </button>
             ))}
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">March 2026</h3>
             <button className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-xs font-bold">Month</button>
          </div>
          <div className="flex justify-between overflow-x-auto pb-2 scrollbar-hide">
             {days.map((d, i) => (
               <button 
                 key={i}
                 onClick={() => setSelectedDate(d.date)}
                 className={`flex flex-col items-center justify-center min-w-[50px] py-4 rounded-3xl transition-all ${
                   selectedDate === d.date 
                   ? 'bg-[#03396C] text-white shadow-lg shadow-blue-100' 
                   : 'text-slate-400'
                 }`}
               >
                 <span className="text-[10px] uppercase font-bold tracking-tighter">{d.day}</span>
                 <span className="text-lg font-bold mt-1">{d.date}</span>
               </button>
             ))}
          </div>
        </div>

        {/* Slot Grid */}
        <div className="bg-slate-50 -mx-6 px-6 py-8 rounded-t-[40px] border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-widest">Pick a time</h3>
          <div className="grid grid-cols-2 gap-4">
            {SLOTS.map(slot => {
              const isSelected = selectedSlot === slot.id;
              const isAvailable = slot.status === 'Available';
              
              return (
                <motion.button 
                  key={slot.id}
                  whileTap={isAvailable ? { scale: 0.95 } : {}}
                  disabled={!isAvailable}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`py-4 px-4 rounded-2xl text-xs font-bold border-2 text-center transition-all ${getStatusColor(slot.status, isSelected)}`}
                >
                  {slot.time}
                  {!isAvailable && <span className="block text-[8px] opacity-70 mt-1 uppercase">{slot.status}</span>}
                </motion.button>
              );
            })}
          </div>

          {/* Color Guide */}
          <div className="mt-8 grid grid-cols-2 gap-y-3">
             <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booked</span>
             </div>
             <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-indigo-100" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coaching</span>
             </div>
             <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-amber-100" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maintenance</span>
             </div>
             <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#03396C]" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected</span>
             </div>
          </div>
        </div>
      </div>

      {/* Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 flex items-center justify-between z-[60] shadow-2xl">
         <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Amount</p>
            <div className="flex items-center">
               <span className="text-2xl font-bold text-slate-900">₹{selectedSlot ? SLOTS.find(s => s.id === selectedSlot)?.price : 0}</span>
            </div>
         </div>
         <button 
           disabled={!selectedSlot}
           onClick={() => navigate('/booking-summary', { state: { 
             arena, 
             court: currentCourt, 
             date: `March ${selectedDate}, 2026`, 
             slot: SLOTS.find(s => s.id === selectedSlot) 
           }})}
           className={`px-10 py-4 rounded-3xl font-bold shadow-xl transition-all text-base ${
             selectedSlot 
             ? 'bg-[#03396C] text-white shadow-blue-200 active:scale-95' 
             : 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed'
           }`}
         >
           Book Now
         </button>
      </div>
    </div>
  );
};

export default SlotSelection;
