import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, ChevronLeft, ChevronRight, Clock, MapPin, Filter, MoreVertical, Plus } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { ARENAS, COURTS } from '../../../data/mockData';
import { format, addDays, startOfToday } from 'date-fns';

const SlotSchedule = () => {
  const { isDark } = useTheme();
  const [selectedArena, setSelectedArena] = useState(ARENAS[0].id);
  const [selectedDate, setSelectedDate] = useState(startOfToday());

  const arenaCourts = COURTS.filter(c => c.arenaId === selectedArena);
  
  const timeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  // Helper to get random status for demo
  const getSlotStatus = (courtId, time) => {
    const hash = (courtId * 100) + parseInt(time.split(':')[0]);
    if (hash % 3 === 0) return 'Booked';
    if (hash % 5 === 0) return 'Coach';
    if (hash % 7 === 0) return 'Maintenance';
    return 'Available';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Booked': return isDark ? 'bg-[#1EE7FF]/10 text-[#1EE7FF] border-[#1EE7FF]/20' : 'bg-[#0284c7]/10 text-[#0284c7] border-[#0284c7]/20';
      case 'Coach': return isDark ? 'bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/20' : 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20';
      case 'Maintenance': return isDark ? 'bg-[#FF4B4B]/10 text-[#FF4B4B] border-[#FF4B4B]/20' : 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20';
      default: return isDark ? 'bg-[#22FF88]/10 text-[#22FF88] border-[#22FF88]/20 hover:bg-[#22FF88]/20' : 'bg-[#059669]/5 text-[#059669] border-[#059669]/10 hover:bg-[#059669]/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-black text-white font-display tracking-wide flex items-center gap-3">
            <CalendarClock className="text-[#FFD600]" /> Slot Schedule
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium">Visual calendar of court availability and bookings.</p>
        </div>
        <div className="flex gap-2">
          <button className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white border-black/10 text-black/60'}`}>
            <Filter size={18} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-[#1EE7FF] transition-all text-sm font-bold shadow-[0_0_15px_rgba(34,255,136,0.3)]">
            <Plus size={16} /> Block Slots
          </button>
        </div>
      </div>

      {/* Scheduler Header */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDark ? 'bg-white/5 text-[#22FF88]' : 'bg-[#22FF88]/10 text-[#059669]'}`}>
            <MapPin size={18} />
          </div>
          <select
            value={selectedArena}
            onChange={(e) => setSelectedArena(Number(e.target.value))}
            className={`bg-transparent text-sm font-black outline-none cursor-pointer ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}
          >
            {ARENAS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-[#0A1F44]/5'}`}>
            <ChevronLeft size={20} />
          </button>
          <div className="text-center min-w-[150px]">
            <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{format(selectedDate, 'EEEE, MMM dd')}</p>
            <p className="text-[10px] font-bold text-[#FFD600] uppercase tracking-widest mt-0.5">Today</p>
          </div>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-[#0A1F44]/5'}`}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#22FF88]" />
            <span className="text-[10px] font-bold text-white/40 uppercase">Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#1EE7FF]" />
            <span className="text-[10px] font-bold text-white/40 uppercase">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FFD600]" />
            <span className="text-[10px] font-bold text-white/40 uppercase">Coach</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg'}`}>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className={`p-4 border-b flex items-center ${isDark ? 'border-white/5 bg-white/5' : 'border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
              <div className="w-24 shrink-0 flex items-center gap-2">
                <Clock size={14} className="text-white/20" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Time</span>
              </div>
              <div className="flex-1 flex gap-4 pr-4">
                {arenaCourts.map(court => (
                  <div key={court.id} className="flex-1 text-center">
                    <p className={`text-xs font-black tracking-wide ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{court.name}</p>
                    <p className="text-[9px] font-bold text-[#22FF88] uppercase tracking-widest">{court.type}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Rows */}
            <div className="divide-y divide-white/5">
              {timeSlots.map(time => (
                <div key={time} className="flex items-center group">
                  <div className={`w-24 shrink-0 px-4 py-6 border-r transition-colors ${isDark ? 'border-white/5 bg-white/[0.02] group-hover:bg-white/5' : 'border-[#0A1F44]/5 bg-[#0A1F44]/2 group-hover:bg-[#0A1F44]/5'}`}>
                    <span className={`text-[11px] font-black font-display tracking-wider ${isDark ? 'text-white/60' : 'text-[#0A1F44]/60'}`}>{time}</span>
                  </div>
                  <div className="flex-1 flex gap-4 p-2 pr-4">
                    {arenaCourts.map(court => {
                      const status = getSlotStatus(court.id, time);
                      return (
                        <motion.div
                          key={court.id}
                          whileHover={{ scale: 0.98 }}
                          className={`flex-1 min-h-[50px] rounded-xl border p-2 cursor-pointer transition-all flex flex-col justify-center items-center gap-1 ${getStatusColor(status)}`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
                          {status === 'Coach' && <p className="text-[8px] font-bold opacity-60">Pro Batch A</p>}
                          {status === 'Booked' && <p className="text-[8px] font-bold opacity-60">ID #8210</p>}
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-white/20 hover:text-white transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotSchedule;
