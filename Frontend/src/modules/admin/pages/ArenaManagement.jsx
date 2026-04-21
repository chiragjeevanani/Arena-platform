import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Plus, Map, Users, Settings, Target, Layers, X, Home, 
  Navigation, ArrowRight, MoreVertical, Eye, Shield, Calendar, Trash2 
} from 'lucide-react';

import { useAuth } from '../../user/context/AuthContext';
import { fetchPublicArenas } from '../../../services/arenasApi';
import { normalizeListArena } from '../../../utils/arenaAdapter';
import { isApiConfigured } from '../../../services/config';

const ArenaManagement = () => {
  const [showNewArenaModal, setShowNewArenaModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [arenas, setArenas] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!isApiConfigured()) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublicArenas();
        if (!cancelled) setArenas((data.arenas || []).map(normalizeListArena));
      } catch {
        if (!cancelled) setArenas([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isArenaAdmin = user?.role === 'ARENA_ADMIN';
  const displayArenas = isArenaAdmin
    ? arenas.filter((a) => String(a.id) === String(user?.assignedArena))
    : arenas;

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 text-[#36454F]">
              <Map className="text-[#CE2029] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" strokeWidth={2.5} /> Asset Management
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold text-slate-500">Configure facilities, court availability, and regional operations.</p>
          </div>
          <button 
            onClick={() => setShowNewArenaModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#CE2029] border border-[#CE2029] text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest shadow-sm shadow-[#CE2029]/20"
          >
            <Plus size={16} strokeWidth={3} /> Register Arena
          </button>
        </div>

        {/* Global Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayArenas.map((arena, idx) => {
            const courtCount = Number(arena.courtsCount) || 0;
            const details = {
              courtDetails: Array.from({ length: courtCount }),
              batches: [],
            };
            return (
              <motion.div
                key={arena.id}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 flex flex-col hover:border-[#CE2029]/40 hover:shadow-md"
              >
                {/* Image Header */}
                 <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                    {arena.image ? (
                      <img 
                        src={arena.image} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        alt={arena.name} 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#08142B] opacity-10 flex items-center justify-center">
                        <Map className="text-white opacity-20" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border border-slate-100 text-[#CE2029] shadow-sm">
                      Live
                    </span>
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                       <div className="max-w-[75%]">
                         <h3 className="font-black font-display text-lg tracking-tight text-white drop-shadow-sm">{arena.name}</h3>
                         <p className="text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 mt-0.5 text-white/90 drop-shadow-sm">
                           <MapPin size={10} className="text-[#CE2029]" /> {arena.location || '—'}
                         </p>
                       </div>
                       <div className="relative">
                          <button 
                            onClick={() => setActiveMenu(arena.id === activeMenu ? null : arena.id)}
                            className={`w-9 h-9 rounded-xl transition-all border flex items-center justify-center shadow-sm ${
                              activeMenu === arena.id 
                                ? 'bg-[#CE2029] border-[#CE2029] text-white' 
                                : 'bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-[#CE2029]'
                            }`}
                          >
                             <MoreVertical size={18} strokeWidth={2.5} />
                          </button>

                         <AnimatePresence>
                           {activeMenu === arena.id && (
                             <>
                               <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                               <motion.div
                                 initial={{ opacity: 0, scale: 0.95, x: 20 }}
                                 animate={{ opacity: 1, scale: 1, x: 0 }}
                                 exit={{ opacity: 0, scale: 0.95, x: 20 }}
                                 className="absolute right-0 bottom-full mb-2 w-48 p-1.5 rounded-xl border border-slate-200 bg-white shadow-xl z-20"
                               >
                                  <div className="space-y-1">
                                   {[
                                     { label: 'Overview', icon: Eye, color: '#CE2029' },
                                     { label: 'Staff Hub', icon: Shield, color: '#CE2029' },
                                     { label: 'Schedules', icon: Calendar, color: '#CE2029' },
                                     { label: 'Archive', icon: Trash2, color: '#FF4B4B' },
                                   ].map((opt, i) => (
                                     <button
                                       key={i}
                                       onClick={() => setActiveMenu(null)}
                                       className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                     >
                                       <div className="p-1.5 rounded-md border" style={{ backgroundColor: `${opt.color}10`, borderColor: `${opt.color}30`, color: opt.color }}>
                                         <opt.icon size={12} strokeWidth={2.5} />
                                       </div>
                                       {opt.label}
                                     </button>
                                   ))}
                                 </div>
                               </motion.div>
                             </>
                           )}
                         </AnimatePresence>
                       </div>
                    </div>
                 </div>

                {/* Content Stats */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="rounded-xl p-3.5 border border-slate-100 bg-slate-50 flex flex-col justify-between h-24">
                       <div className="w-8 h-8 rounded-lg bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029]">
                          <Target size={16} strokeWidth={2.5} />
                       </div>
                       <div>
                         <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Total Courts</p>
                         <p className="text-xl font-black text-[#36454F]">{details.courtDetails.length}</p>
                       </div>
                    </div>
                    <div className="rounded-xl p-3.5 border border-slate-100 bg-slate-50 flex flex-col justify-between h-24">
                       <div className="w-8 h-8 rounded-lg bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029]">
                          <Layers size={16} strokeWidth={2.5} />
                       </div>
                       <div>
                         <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Batches</p>
                         <p className="text-xl font-black text-[#36454F]">{details.batches.length}</p>
                       </div>
                    </div>
                  </div>

                   <div className="flex items-center gap-3 mb-5 px-1">
                     <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200" />
                        ))}
                        <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black bg-[#CE2029] text-white">
                          +4
                        </div>
                     </div>
                     <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Active Staff Members</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-5 border-t border-slate-100">
                    <button className="flex items-center justify-center py-3 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest gap-2 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#36454F] border border-transparent">
                      <Target size={12} className="text-[#CE2029]" strokeWidth={2.5} /> Arena Setup
                    </button>
                    <button className="flex items-center justify-center py-3 rounded-xl border border-[#CE2029]/30 transition-all text-[11px] font-black uppercase tracking-widest gap-2 text-slate-500 hover:bg-[#CE2029] hover:text-white group">
                      <Settings size={12} className="text-[#CE2029] group-hover:text-white" strokeWidth={2.5} /> Config
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* New Arena Modal */}
      <AnimatePresence>
        {showNewArenaModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewArenaModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white text-[#36454F] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <Map className="text-[#CE2029]" size={24} strokeWidth={3} /> Deployment
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Initialize facility registry</p>
                </div>
                <button 
                  onClick={() => setShowNewArenaModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-200 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 shadow-sm"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-6 space-y-4 md:space-y-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Facility Name</label>
                    <div className="relative">
                      <Home size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#CE2029] group-focus-within:opacity-100 transition-all" />
                      <input 
                        type="text" 
                        placeholder="e.g. Phoenix Sports Center"
                        className="w-full py-3.5 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#CE2029] focus:bg-white text-[#36454F]"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Location</label>
                    <div className="relative">
                      <Navigation size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#CE2029] group-focus-within:opacity-100 transition-all" />
                      <input 
                        type="text" 
                        placeholder="e.g. Indiranagar, Bangalore"
                        className="w-full py-3.5 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#CE2029] focus:bg-white text-[#36454F]"
                      />
                    </div>
                  </div>

                   <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Total Courts</label>
                      <input 
                        type="number" 
                        defaultValue="6"
                        className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#CE2029] focus:bg-white"
                      />
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Lead Admin</label>
                      <select className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none focus:border-[#CE2029] focus:bg-white">
                        <option>Sarah Johnson</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowNewArenaModal(false)}
                  className="w-full py-4 rounded-xl bg-[#CE2029] border border-[#CE2029] text-white text-[13px] font-bold uppercase tracking-widest hover:shadow-[#CE2029]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Confirm Registry <ArrowRight size={16} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArenaManagement;
