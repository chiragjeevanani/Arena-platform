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
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <CalendarClock className="text-[#FFD600]" /> Real-time Scheduler
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium italic">Active Monitoring: Conflict Detection Enabled</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBlockModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#22FF88]/20"
          >
            <Plus size={16} /> Instant Block
          </button>
        </div>
      </div>

      {/* Scheduler Control Bar */}
      <div className={`p-6 rounded-[2rem] border flex flex-col lg:flex-row items-center justify-between gap-6 ${
        isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-xl shadow-blue-900/5'
      }`}>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5 text-[#22FF88]' : 'bg-[#22FF88]/10 text-[#059669]'}`}>
            <MapPin size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Target Facility</p>
            <select
              value={selectedArenaId}
              onChange={(e) => setSelectedArenaId(e.target.value)}
              className={`bg-transparent text-sm font-black outline-none cursor-pointer w-full ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}
            >
              {MOCK_DB.arenas.map(a => <option key={a.id} value={a.id} className="bg-[#0A1F44]">{a.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
          <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-[#0A1F44]/5'}`}>
            <ChevronLeft size={24} />
          </button>
          <div className="text-center min-w-[140px]">
            <p className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{format(selectedDate, 'EEEE, MMM dd')}</p>
            <p className="text-[10px] font-black text-[#FFD600] uppercase tracking-widest mt-0.5">Live Sync</p>
          </div>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-[#0A1F44]/5'}`}>
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-white/2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#22FF88] shadow-[0_0_10px_#22FF88]" />
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Open</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-white/2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF4B4B]" />
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Maintenance</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#FFD600]/30 bg-[#FFD600]/10">
            <AlertTriangle size={12} className="text-[#FFD600]" />
            <span className="text-[9px] font-black text-[#FFD600] uppercase tracking-widest">Conflicts</span>
          </div>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className={`rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-2xl shadow-blue-900/10'}`}>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[1000px]">
            {/* Legend Row */}
            <div className={`px-4 py-6 border-b flex items-center ${isDark ? 'border-white/5 bg-white/5' : 'border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
              <div className="w-32 shrink-0 flex items-center gap-3 pl-4">
                <Clock size={16} className="text-white/20" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Time Matrix</span>
              </div>
              <div className="flex-1 flex gap-5 pr-6">
                {arenaCourts.map(court => (
                  <div key={court.id} className="flex-1 text-center py-2 rounded-2xl bg-white/2 border border-white/5">
                    <p className={`text-[11px] font-black tracking-widest uppercase ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{court.name}</p>
                    <p className="text-[8px] font-black text-[#22FF88] uppercase tracking-[0.2em] mt-0.5">{court.type}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Matrix Body */}
            <div className="divide-y divide-white/5">
              {timeSlots.map(time => (
                <div key={time} className="flex items-center group min-h-[90px]">
                  <div className={`w-32 shrink-0 px-8 flex flex-col justify-center border-r transition-colors ${isDark ? 'border-white/5 bg-white/[0.01] group-hover:bg-white/5' : 'border-[#0A1F44]/5 bg-white group-hover:bg-[#0A1F44]/2'}`}>
                    <span className={`text-base font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{time}</span>
                    <span className="text-[8px] font-black text-[#22FF88] uppercase tracking-widest opacity-40">Peak Hour</span>
                  </div>
                  <div className="flex-1 flex gap-5 p-4 pr-6">
                    {arenaCourts.map(court => {
                      const { status, data } = getSlotStatus(court.id, time);
                      return (
                        <motion.div
                          key={court.id}
                          whileHover={{ scale: 0.98, translateY: -2 }}
                          className={`flex-1 rounded-2xl border-2 p-4 cursor-pointer transition-all flex flex-col justify-center items-start gap-1 relative overflow-hidden group/slot ${getStatusStyle(status)}`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
                            {status === 'Conflict' && <AlertTriangle size={14} className="text-[#FFD600]" />}
                          </div>
                          
                          <AnimatePresence>
                            {status !== 'Available' && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-1">
                                <p className="text-[9px] font-black opacity-80 uppercase tracking-tighter">
                                  {status === 'Booked' ? data.customerName : data.reason}
                                </p>
                                {status === 'Booked' && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#22FF88] animate-pulse" />
                                    <span className="text-[8px] font-bold opacity-40 uppercase">Verified Session</span>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover/slot:opacity-40 transition-opacity">
                             <MoreVertical size={12} />
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
              className={`relative w-full max-w-lg rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10 text-white' : 'bg-white border-black/10 text-[#0A1F44]'} shadow-2xl shadow-black/50`}
            >
              <div className="p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <CalendarClock className="text-[#FFD600]" /> Instant Block
                  </h3>
                  <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Reserve a slot for maintenance or internal use</p>
                </div>
                <button onClick={() => setShowBlockModal(false)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}>
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Court</label>
                    <select className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`}>
                      {MOCK_DB.courts.filter(c => c.arenaId === selectedArenaId).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Block Type</label>
                    <select className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`}>
                      <option>Maintenance</option>
                      <option>Internal Use</option>
                      <option>VIP Reservation</option>
                      <option>Emergency Closure</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Start Time</label>
                    <input type="time" defaultValue="09:00" className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">End Time</label>
                    <input type="time" defaultValue="11:00" className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Notes / Reason</label>
                  <textarea rows={3} placeholder="e.g. AC unit servicing scheduled" className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none resize-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`} />
                </div>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="w-full py-5 rounded-[1.5rem] bg-[#FFD600] text-[#0A1F44] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:scale-[1.02] transition-all shadow-2xl shadow-[#FFD600]/20 flex items-center justify-center gap-2"
                >
                  Confirm Block <AlertTriangle size={16} />
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
