import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, ChevronLeft, ChevronRight, Clock, MapPin, Filter, MoreVertical, Plus, AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { MOCK_DB } from '../../../data/mockDatabase';
import { format, addDays, startOfToday } from 'date-fns';

const SlotSchedule = () => {
  const { isDark } = useTheme();
  const [selectedArenaId, setSelectedArenaId] = useState(MOCK_DB.arenas[0].id);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [showBlockModal, setShowBlockModal] = useState(false);

  const arena = MOCK_DB.arenas.find(a => a.id === selectedArenaId);
  const arenaCourts = MOCK_DB.courts.filter(c => c.arenaId === selectedArenaId);
  
  const timeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  // Helper to get status from MOCK_DB
  const getSlotStatus = (courtId, time) => {
    const booking = MOCK_DB.bookings.find(b => b.courtId === courtId && b.time === time);
    if (booking) return { status: 'Booked', data: booking };
    
    const inventoryConflict = MOCK_DB.inventory.some(i => i.arenaId === selectedArenaId && i.stock < i.minStock && i.name.includes('Shuttlecock'));
    
    // Demo logic for conflict patterns
    const hour = parseInt(time.split(':')[0]);
    if (hour === 12 && courtId === 'court-1') return { status: 'Maintenance', data: { reason: 'Surface Cleaning' } };
    if (hour === 18 && courtId === 'court-1') return { status: 'Conflict', data: { reason: 'Overlapping Event' } };
    
    return { status: 'Available', data: null };
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Booked': return isDark ? 'bg-[#1EE7FF]/10 text-[#1EE7FF] border-[#1EE7FF]/20' : 'bg-[#0284c7]/10 text-[#0284c7] border-[#0284c7]/20';
      case 'Maintenance': return isDark ? 'bg-[#FF4B4B]/10 text-[#FF4B4B] border-[#FF4B4B]/20' : 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20';
      case 'Conflict': return isDark ? 'bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600] animate-pulse' : 'bg-[#d97706]/10 text-[#d97706] border-[#d97706] animate-pulse';
      default: return isDark ? 'bg-[#22FF88]/10 text-[#22FF88] border-[#22FF88]/20 hover:bg-[#22FF88]/20' : 'bg-[#059669]/5 text-[#059669] border-[#059669]/10 hover:bg-[#059669]/10';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-lg md:text-2xl font-black font-display tracking-wide flex items-center gap-2 md:gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <CalendarClock className="text-[#FFD600] w-[18px] h-[18px] md:w-5 md:h-5" /> Queue
          </h2>
          <p className={`text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Slot intelligence.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowBlockModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg md:shadow-xl shadow-[#22FF88]/20"
          >
            <Plus size={12} className="md:w-[14px] md:h-[14px]" /> Block
          </button>
        </div>
      </div>

      {/* Scheduler Control Bar */}
      <div className={`p-3 md:p-6 rounded-xl md:rounded-[2rem] border ${
        isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'
      }`}>
        {/* Row 1: Facility + Date (always side by side) */}
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Facility Selector */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className={`w-7 h-7 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5 text-[#22FF88]' : 'bg-[#22FF88]/10 text-[#059669]'}`}>
              <MapPin size={14} className="md:w-[22px] md:h-[22px]" />
            </div>
            <div>
              <p className="text-[6px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-0.5 md:mb-1">Facility</p>
              <select
                value={selectedArenaId}
                onChange={(e) => setSelectedArenaId(e.target.value)}
                className={`bg-transparent text-[10px] md:text-sm font-black outline-none cursor-pointer ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}
              >
                {MOCK_DB.arenas.map(a => <option key={a.id} value={a.id} className="bg-[#0A1F44] text-white">{a.name.split(' ')[0]}</option>)}
              </select>
            </div>
          </div>

          {/* Date Navigator */}
          <div className={`flex items-center gap-2 md:gap-6 bg-white/5 px-3 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-2xl border border-white/5`}>
            <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className={`p-1 rounded-md md:p-1.5 md:rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-[#0A1F44]/5'}`}>
              <ChevronLeft size={14} className="md:w-[24px] md:h-[24px]" />
            </button>
            <div className="text-center min-w-[70px] md:min-w-[140px]">
              <p className={`text-[10px] md:text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{format(selectedDate, 'MMM dd')}</p>
              <p className="text-[7px] md:text-[10px] font-black text-[#FFD600] uppercase tracking-widest leading-none">Sync</p>
            </div>
            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className={`p-1 rounded-md md:p-1.5 md:rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-[#0A1F44]/5'}`}>
              <ChevronRight size={14} className="md:w-[24px] md:h-[24px]" />
            </button>
          </div>
        </div>

        {/* Row 2: Status Legend */}
        <div className="flex items-center gap-2 md:gap-4 mt-3 md:mt-4">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg md:rounded-xl border border-white/5 bg-white/2">
            <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-[#22FF88]" />
            <span className="text-[7px] md:text-[9px] font-black text-white/20 uppercase tracking-widest">Open</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg md:rounded-xl border border-white/5 bg-white/2">
            <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-[#FF4B4B]" />
            <span className="text-[7px] md:text-[9px] font-black text-white/20 uppercase tracking-widest">Block</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg md:rounded-xl border border-[#FFD600]/20 bg-[#FFD600]/10">
            <AlertTriangle size={8} className="md:w-[12px] md:h-[12px] text-[#FFD600]" />
            <span className="text-[7px] md:text-[9px] font-black text-[#FFD600]/60 uppercase tracking-widest">Issues</span>
          </div>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className={`rounded-2xl md:rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg'}`}>
        {/* Mobile scroll hint */}
        <div className="md:hidden flex items-center justify-center gap-1.5 py-2 border-b border-white/5">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">← Scroll to see all courts →</span>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[600px] md:min-w-[800px]">
            {/* Legend Row */}
            <div className={`px-2 md:px-4 py-3 md:py-6 border-b flex items-center ${isDark ? 'border-white/5 bg-white/5' : 'border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
              <div className="w-20 md:w-32 shrink-0 flex items-center gap-2 md:gap-3 pl-2 md:pl-4">
                <Clock size={12} className="md:w-[16px] md:h-[16px] opacity-20" />
                <span className="text-[8px] md:text-[10px] font-black text-white/20 uppercase tracking-widest">Slots</span>
              </div>
              <div className="flex-1 flex gap-2 md:gap-5 pr-4 md:pr-6">
                {arenaCourts.map(court => (
                   <div key={court.id} className="flex-1 text-center py-1.5 md:py-2 rounded-lg md:rounded-2xl bg-white/5 border border-white/5">
                    <p className={`text-[9px] md:text-[11px] font-black tracking-widest uppercase ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{court.name.split(' ')[0]}</p>
                    <p className="text-[6px] md:text-[8px] font-black text-[#22FF88] uppercase tracking-tighter opacity-40 leading-none">{court.type.split(' ')[0]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Matrix Body */}
            <div className="divide-y divide-white/5">
              {timeSlots.map(time => (
                 <div key={time} className="flex items-center group min-h-[50px] md:min-h-[90px]">
                  <div className={`w-20 md:w-32 shrink-0 px-4 md:px-8 flex flex-col justify-center border-r transition-colors ${isDark ? 'border-white/5 bg-white/[0.01] group-hover:bg-white/5' : 'border-[#0A1F44]/5 bg-white group-hover:bg-[#0A1F44]/2'}`}>
                    <span className={`text-xs md:text-base font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{time}</span>
                    <span className="text-[6px] md:text-[8px] font-black text-[#22FF88] uppercase tracking-widest opacity-20 md:opacity-40">Peak</span>
                  </div>
                  <div className="flex-1 flex gap-2 md:gap-5 p-2 md:p-4 pr-4 md:pr-6">
                    {arenaCourts.map(court => {
                      const { status, data } = getSlotStatus(court.id, time);
                      return (
                        <motion.div
                          key={court.id}
                          whileHover={{ scale: 0.98, translateY: -1 }}
                          className={`flex-1 rounded-lg md:rounded-2xl border md:border-2 p-1.5 md:p-4 cursor-pointer transition-all flex flex-col justify-center items-start gap-0.5 relative overflow-hidden group/slot ${getStatusStyle(status)}`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[6px] md:text-[10px] font-black uppercase tracking-widest">{status.split(' ')[0]}</span>
                            {status === 'Conflict' && <AlertTriangle size={8} className="md:w-[14px] md:h-[14px] text-[#FFD600]" />}
                          </div>
                          
                          <AnimatePresence>
                            {status !== 'Available' && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-0.5 md:mt-2 space-y-0.5 md:space-y-1">
                                <p className="text-[7px] md:text-[9px] font-black opacity-60 uppercase tracking-tighter truncate max-w-full">
                                  {status === 'Booked' ? data.customerName.split(' ')[0] : data.reason.split(' ')[0]}
                                </p>
                                {status === 'Booked' && (
                                  <div className="flex items-center gap-1 md:gap-1.5">
                                    <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-[#22FF88] opacity-50" />
                                    <span className="text-[6px] md:text-[8px] font-bold opacity-30 uppercase">ID</span>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="absolute bottom-1 right-1 opacity-0 group-hover/slot:opacity-20 transition-opacity">
                             <MoreVertical size={10} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Instant Block Modal */}
      <AnimatePresence>
        {showBlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlockModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-lg rounded-3xl md:rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10 text-white' : 'bg-white border-black/10 text-[#0A1F44]'} shadow-2xl shadow-black/50`}
            >
            <div className="p-5 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-lg md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3">
                    <CalendarClock className="text-[#FFD600] w-[18px] h-[18px] md:w-6 md:h-6" /> Block
                  </h3>
                  <p className="text-[9px] md:text-xs font-bold opacity-30 uppercase tracking-widest mt-0.5 md:mt-1">Reserve maintenance</p>
                </div>
                <button onClick={() => setShowBlockModal(false)} className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}>
                  <X size={16} className="md:w-[20px] md:h-[20px]" />
                </button>
              </div>
              <div className="p-5 md:p-8 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Court</label>
                    <select className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`}>
                      {MOCK_DB.courts.filter(c => c.arenaId === selectedArenaId).map(c => (
                        <option key={c.id} value={c.id} className="bg-[#0A1F44] text-white">{c.name.split(' ')[1]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Mode</label>
                    <select className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`}>
                      <option className="bg-[#0A1F44] text-white">Ops</option>
                      <option className="bg-[#0A1F44] text-white">VIP</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Start</label>
                    <input type="time" defaultValue="09:00" className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`} />
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">End</label>
                    <input type="time" defaultValue="11:00" className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`} />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1 block">Reason</label>
                  <textarea rows={2} placeholder="Brief note..." className={`w-full py-3 px-4 rounded-xl border text-[11px] font-bold outline-none resize-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`} />
                </div>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-[#FFD600] text-[#0A1F44] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white hover:scale-[1.01] transition-all shadow-xl md:shadow-2xl shadow-[#FFD600]/20 flex items-center justify-center gap-2"
                >
                  Block <AlertTriangle size={14} className="md:w-[16px] md:h-[16px]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlotSchedule;
