import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, ChevronLeft, ChevronRight, Clock, MapPin, Plus, AlertTriangle, X, MoreVertical } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { fetchPublicArenas, fetchPublicArenaById } from '../../../services/arenasApi';
import { normalizeListArena } from '../../../utils/arenaAdapter';
import { isApiConfigured } from '../../../services/config';

const SlotSchedule = () => {
  const [arenas, setArenas] = useState([]);
  const [selectedArenaId, setSelectedArenaId] = useState('');
  const [arenaCourts, setArenaCourts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [showBlockModal, setShowBlockModal] = useState(false);

  useEffect(() => {
    if (!isApiConfigured()) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublicArenas();
        if (cancelled) return;
        const list = (data.arenas || []).map(normalizeListArena);
        setArenas(list);
        if (list.length) {
          setSelectedArenaId((prev) => prev || String(list[0].id));
        }
      } catch {
        if (!cancelled) setArenas([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isApiConfigured() || !selectedArenaId) {
      setArenaCourts([]);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const payload = await fetchPublicArenaById(selectedArenaId);
        if (cancelled) return;
        const raw = payload?.arena?.courts || [];
        setArenaCourts(
          raw.map((c) => ({
            id: c.id,
            arenaId: String(selectedArenaId),
            name: c.name,
            type: c.type || 'Court',
          }))
        );
      } catch {
        if (!cancelled) setArenaCourts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedArenaId]);
  
  const timeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  const getSlotStatus = () => ({ status: 'Available', data: null });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Booked': return 'bg-slate-50 border-slate-200 text-[#36454F] hover:bg-slate-100';
      case 'Maintenance': return 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100/50';
      case 'Alert': return 'bg-red-50 border-[#CE2029]/30 text-[#CE2029] animate-pulse';
      default: return 'bg-white border-dashed border-slate-200 text-slate-300 hover:border-[#CE2029]/40 hover:bg-slate-50/50';
    }
  };

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans text-[#36454F]">
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 text-[#36454F]">
              <CalendarClock className="text-[#CE2029] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" strokeWidth={2.5} /> Inventory Queue
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold text-slate-500">Real-time slot intelligence and facility occupancy matrix.</p>
          </div>
          <button
            onClick={() => setShowBlockModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#CE2029] border border-[#CE2029] text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest shadow-sm shadow-[#CE2029]/20"
          >
            <Plus size={16} strokeWidth={3} /> Reserve Maintenance
          </button>
        </div>

        {/* Scheduler Control Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {/* Facility Selector Card */}
           <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:border-[#CE2029]/40">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#CE2029] shadow-sm">
                <MapPin size={22} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Arena Hub</p>
                <select
                  value={selectedArenaId}
                  onChange={(e) => setSelectedArenaId(e.target.value)}
                  className="w-full bg-transparent text-sm font-black text-[#36454F] outline-none cursor-pointer appearance-none"
                >
                  {arenas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
           </div>

           {/* Date Navigator Card */}
           <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4 transition-all hover:border-[#CE2029]/40">
              <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-all border border-transparent hover:border-slate-100">
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <div className="text-center group cursor-pointer">
                <p className="text-sm font-black text-[#36454F] tracking-tight">{format(selectedDate, 'MMMM dd, yyyy')}</p>
                <p className="text-[10px] font-black text-[#CE2029] uppercase tracking-[0.2em] leading-none mt-1 group-hover:tracking-[0.3em] transition-all">Live Sync</p>
              </div>
              <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-all border border-transparent hover:border-slate-100">
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
           </div>

           {/* Legend Card */}
           <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-around gap-2 md:col-span-2 lg:col-span-1 border-dashed">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#CE2029]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#36454F]/10" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open</span>
              </div>
           </div>
        </div>

        {/* Grid Container */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-[#CE2029]/40">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="min-w-[900px]">
              {/* Sticky Court Header */}
              <div className="flex items-center sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md border-b border-slate-100">
                <div className="w-28 md:w-36 shrink-0 py-6 px-4 border-r border-slate-100 flex items-center justify-center">
                  <Clock size={18} className="text-slate-300" strokeWidth={2.5} />
                </div>
                <div className="flex-1 flex divide-x divide-slate-100">
                  {arenaCourts.map(court => (
                    <div key={court.id} className="flex-1 py-6 text-center group">
                      <p className="text-[11px] font-black text-[#36454F] uppercase tracking-widest group-hover:text-[#CE2029] transition-colors">{court.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic leading-none">{court.type}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Matrix */}
              <div className="divide-y divide-slate-50">
                {timeSlots.map(time => (
                  <div key={time} className="flex items-stretch group min-h-[100px]">
                    {/* Time Column */}
                    <div className="w-28 md:w-36 shrink-0 flex flex-col items-center justify-center border-r border-slate-100 bg-slate-50/30 group-hover:bg-slate-50 transition-colors">
                      <span className="text-lg font-black font-display text-[#36454F]">{time}</span>
                      <span className="text-[9px] font-black text-[#CE2029] uppercase tracking-widest opacity-30 mt-1">Peak PR</span>
                    </div>

                    {/* Court Slots Column */}
                    <div className="flex-1 flex divide-x divide-slate-50 p-3 gap-3">
                      {arenaCourts.map(court => {
                        const { status, data } = getSlotStatus();
                        return (
                          <motion.div
                            key={court.id}
                            whileHover={{ scale: 0.98 }}
                            className={`flex-1 rounded-2xl border-2 p-4 transition-all relative overflow-hidden flex flex-col justify-between ${getStatusStyle(status)} group/slot shadow-sm`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{status}</span>
                              {status === 'Alert' && <AlertTriangle size={14} className="text-[#CE2029]" strokeWidth={2.5} />}
                            </div>

                            {status !== 'Available' ? (
                              <div className="space-y-1">
                                <p className="text-xs font-black truncate text-[#36454F]">
                                  {status === 'Booked' ? data.customerName : data.reason}
                                </p>
                                <div className="flex items-center gap-1.5 opacity-40">
                                   <div className="w-1 h-1 rounded-full bg-[#36454F]" />
                                   <p className="text-[9px] font-black uppercase tracking-tighter">Verified Entry</p>
                                </div>
                              </div>
                            ) : (
                               <div className="flex flex-col items-center justify-center h-full opacity-0 group-hover/slot:opacity-100 transition-all">
                                  <Plus size={16} className="text-[#CE2029]" strokeWidth={3} />
                                  <span className="text-[8px] font-black text-[#CE2029] uppercase tracking-widest mt-1">Reserve</span>
                               </div>
                            )}

                            <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover/slot:opacity-20 transition-all">
                               <MoreVertical size={14} />
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
      </div>

      {/* Block Modal */}
      <AnimatePresence>
        {showBlockModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBlockModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white text-[#36454F] shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <CalendarClock className="text-[#CE2029]" size={24} strokeWidth={3} /> Block Protocol
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Initialize temporary facility closure</p>
                </div>
                <button onClick={() => setShowBlockModal(false)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-200 text-slate-300 bg-white border border-slate-200 shadow-sm"><X size={20} strokeWidth={2.5} /></button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Target Court</label>
                    <select className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none focus:border-[#CE2029] focus:bg-white text-[#36454F] shadow-inner">
                      {arenaCourts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Protocol Type</label>
                    <select className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none focus:border-[#CE2029] focus:bg-white text-[#36454F] shadow-inner">
                      <option>Maintenance</option>
                      <option>Privilege Block</option>
                      <option>Tournament</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Window Start</label>
                    <input type="time" defaultValue="09:00" className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#CE2029] focus:bg-white text-[#36454F]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Window End</label>
                    <input type="time" defaultValue="11:00" className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#CE2029] focus:bg-white text-[#36454F]" />
                  </div>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Verification Note</label>
                   <textarea placeholder="e.g. Surface polishing and light fixture repair..." rows={2} className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#CE2029] focus:bg-white text-[#36454F] resize-none" />
                </div>

                <button
                  onClick={() => setShowBlockModal(false)}
                  className="w-full py-4 rounded-xl bg-[#CE2029] border border-[#CE2029] text-white text-[13px] font-bold uppercase tracking-widest hover:shadow-[#CE2029]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Confirm Blockage <AlertTriangle size={18} strokeWidth={3} />
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
