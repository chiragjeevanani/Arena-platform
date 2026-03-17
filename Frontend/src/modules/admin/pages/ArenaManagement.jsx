import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Plus, Star, Map, Users, Settings, Target, Layers, X, Home, 
  Navigation, ArrowRight, MoreVertical, Eye, Shield, Calendar, BarChart3, Trash2 
} from 'lucide-react';
import { MOCK_DB, getArenaWithDetails } from '../../../data/mockDatabase';
import { useTheme } from '../../user/context/ThemeContext';
import { useAuth } from '../../user/context/AuthContext';
import Arena1 from '../../../assets/Arenas/Arena1.jpg';
import Arena2 from '../../../assets/Arenas/Arena2.jpg';
import Arena3 from '../../../assets/Arenas/Arena3.jpg';

// Mapping arena IDs to imported images
const ARENA_IMAGES = {
  'arena-1': Arena1,
  'arena-2': Arena2,
  'arena-3': Arena3
};

const ArenaManagement = () => {
  const { isDark } = useTheme();
  const [showNewArenaModal, setShowNewArenaModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const { user } = useAuth();

  const isArenaAdmin = user?.role === 'ARENA_ADMIN';
  const displayArenas = isArenaAdmin 
    ? MOCK_DB.arenas.filter(a => a.id === user.assignedArena)
    : MOCK_DB.arenas;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Map className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Assets
          </h2>
          <p className={`text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium italic ${isDark ? 'text-[#eb483f]/60' : 'text-[#eb483f]/60'}`}>Facility ops.</p>
        </div>
        <button 
          onClick={() => setShowNewArenaModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-[#eb483f] text-white hover:bg-white hover:text-[#eb483f] hover:scale-105 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg md:shadow-xl shadow-[#eb483f]/20"
        >
          <Plus size={14} /> Deploy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
        {displayArenas.map((arena, idx) => {
          const details = getArenaWithDetails(arena.id);
          return (
            <motion.div
              key={arena.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`group relative rounded-lg md:rounded-[2.5rem] border overflow-hidden transition-all duration-300 flex flex-col hover:shadow-xl ${
                isDark 
                  ? 'bg-[#1a1d24]/50 border-white/5 hover:border-[#eb483f]/30' 
                  : 'bg-white border-[#eb483f]/10 shadow-sm hover:border-[#eb483f]'
              }`}
            >
              {/* Image Header */}
               <div className="h-24 md:h-40 w-full relative overflow-hidden bg-[#08142B]">
                  {ARENA_IMAGES[arena.id] ? (
                    <img 
                      src={ARENA_IMAGES[arena.id]} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      alt={arena.name} 
                    />
                  ) : (
                    <div className="absolute inset-0 court-lines opacity-10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] via-[#0A1F44]/40 to-transparent" />
                  <span className={`absolute top-2 md:top-5 right-2 md:right-5 backdrop-blur-md px-1.5 md:px-3 py-0.5 md:py-1 rounded md:rounded-xl font-black text-[7px] md:text-[9px] uppercase tracking-widest border ${
                    isDark ? 'bg-[#eb483f]/10 text-[#eb483f] border-[#eb483f]/20' : 'bg-white/80 text-[#eb483f] border-black/5'
                  }`}>
                    Live
                  </span>
                  <div className="absolute bottom-2 md:bottom-5 left-3 md:left-6 right-3 md:right-6 flex items-end justify-between">
                     <div className="max-w-[70%]">
                       <h3 className={`font-black font-display text-sm md:text-xl tracking-tight truncate ${isDark ? 'text-white' : '!text-white'}`}>{arena.name.split(' ')[0]}</h3>
                       <p className={`text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1 mt-0.5 truncate ${isDark ? 'text-white/40' : '!text-white/60'}`}>
                         <MapPin size={8} /> {arena.locations.split(',')[0]}
                       </p>
                     </div>
                     <div className="relative">
                        <button 
                          onClick={() => setActiveMenu(arena.id === activeMenu ? null : arena.id)}
                          className={`w-6 h-6 md:w-10 md:h-10 rounded-md md:rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-[#eb483f] hover:text-[#0A1F44] transition-all ${isDark ? 'text-white' : '!text-white'}`}
                        >
                           <MoreVertical size={12} className="md:w-[16px] md:h-[16px]" />
                        </button>

                       <AnimatePresence>
                         {activeMenu === arena.id && (
                           <>
                             <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                             <motion.div
                               initial={{ opacity: 0, scale: 0.95, x: 20 }}
                               animate={{ opacity: 1, scale: 1, x: 0 }}
                               exit={{ opacity: 0, scale: 0.95, x: 20 }}
                               className={`absolute right-0 bottom-full mb-2 w-48 p-1.5 rounded-xl border z-20 shadow-2xl backdrop-blur-xl ${
                                 isDark ? 'bg-[#0A1F44]/90 border-white/10' : 'bg-white/90 border-[#0A1F44]/10'
                               }`}
                             >
                                <div className="space-y-0.5 text-left">
                                 {[
                                   { label: 'View', icon: Eye, color: '#eb483f' },
                                   { label: 'Staff', icon: Shield, color: '#eb483f' },
                                   { label: 'Plan', icon: Calendar, color: '#eb483f' },
                                   { label: 'Delete', icon: Trash2, color: '#FF4B4B' },
                                 ].map((opt, i) => (
                                   <button
                                     key={i}
                                     onClick={() => setActiveMenu(null)}
                                     className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                       isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-[#0A1F44]/5 text-[#0A1F44]/60 hover:text-[#0A1F44]'
                                     }`}
                                   >
                                     <div className={`p-1 rounded-md border transition-colors`} style={{ backgroundColor: `${opt.color}10`, borderColor: `${opt.color}20`, color: opt.color }}>
                                       <opt.icon size={10} />
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
              <div className="p-3 md:p-6 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-6">
                  <div className={`rounded-lg md:rounded-[1.5rem] p-2 md:p-4 border ${isDark ? 'bg-white/2 border-white/5' : 'bg-[#0A1F44]/2 border-black/5'}`}>
                     <div className="w-5 h-5 md:w-7 md:h-7 rounded-md bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f] mb-1 md:mb-2">
                        <Target size={10} className="md:w-[14px] md:h-[14px]" />
                     </div>
                     <p className={`text-[6px] md:text-[8px] uppercase font-black tracking-widest mb-0.5 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>Courts</p>
                     <p className={`text-xs md:text-lg font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{details.courtDetails.length}</p>
                  </div>
                  <div className={`rounded-lg md:rounded-[1.5rem] p-2 md:p-4 border ${isDark ? 'bg-white/2 border-white/5' : 'bg-[#0A1F44]/2 border-black/5'}`}>
                     <div className="w-5 h-5 md:w-7 md:h-7 rounded-md bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f] mb-1 md:mb-2">
                        <Layers size={10} className="md:w-[14px] md:h-[14px]" />
                     </div>
                     <p className={`text-[6px] md:text-[8px] uppercase font-black tracking-widest mb-0.5 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>Groups</p>
                     <p className={`text-xs md:text-lg font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{details.batches.length}</p>
                  </div>
                </div>

                 <div className="flex items-center gap-2 mb-3 md:mb-6 px-0.5">
                   <div className="flex -space-x-1.5">
                      {[1,2,3].map(i => (
                        <div key={i} className={`w-4 h-4 md:w-6 md:h-6 rounded-full border border-inherit ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                      ))}
                      <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border border-inherit flex items-center justify-center text-[6px] md:text-[8px] font-black bg-[#eb483f] text-white`}>
                        +4
                      </div>
                   </div>
                   <p className={`text-[7px] md:text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>Staff active</p>
                </div>

                  <div className={`grid grid-cols-2 gap-2 pt-3 md:pt-6 border-t ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
                   <button className={`flex items-center justify-center py-1.5 md:py-2.5 rounded-lg transition-all text-[7px] md:text-[9px] font-black uppercase tracking-widest gap-1.5 ${
                      isDark ? 'bg-white/5 text-white/40 hover:text-white' : 'bg-[#0A1F44]/5 text-[#0A1F44]/40 hover:text-[#0A1F44]'
                   }`}>
                    <Target size={8} className="text-[#eb483f] md:w-[12px] md:h-[12px]" /> Setup
                  </button>
                  <button className={`flex items-center justify-center py-1.5 md:py-2.5 rounded-lg border transition-all text-[7px] md:text-[9px] font-black uppercase tracking-widest gap-1.5 shadow-sm ${
                     isDark ? 'border-[#eb483f]/20 text-[#eb483f]/60 hover:text-[#eb483f]' : 'border-[#eb483f]/30 text-[#0A1F44]/60 hover:text-[#0A1F44]'
                  }`}>
                    <Settings size={8} className="md:w-[12px] md:h-[12px]" /> Config
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* New Arena Modal */}
      <AnimatePresence>
        {showNewArenaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewArenaModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-xl rounded-3xl md:rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10 text-white' : 'bg-white border-black/10 text-[#0A1F44]'} shadow-2xl shadow-black/50`}
            >
              <div className="p-6 md:p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3">
                    <Map className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Deploy
                  </h3>
                  <p className="text-[10px] md:text-xs font-bold opacity-30 uppercase tracking-widest mt-0.5 md:mt-1">Arena Registration</p>
                </div>
                <button 
                  onClick={() => setShowNewArenaModal(false)}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}
                >
                  <X size={18} className="md:w-[20px] md:h-[20px]" />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="group">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Facility Name</label>
                    <div className="relative">
                      <Home size={12} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-[#eb483f] group-focus-within:opacity-100 transition-all md:w-[14px] md:h-[14px]" />
                      <input 
                        type="text" 
                        placeholder="e.g. Phoenix Arena"
                        className={`w-full py-3 md:py-4 pl-10 md:pl-12 pr-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#eb483f]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#eb483f] text-[#0A1F44]'}`}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Location</label>
                    <div className="relative">
                      <Navigation size={12} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-[#eb483f] group-focus-within:opacity-100 transition-all md:w-[14px] md:h-[14px]" />
                      <input 
                        type="text" 
                        placeholder="e.g. Bangalore"
                        className={`w-full py-3 md:py-4 pl-10 md:pl-12 pr-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#eb483f]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#eb483f] text-[#0A1F0B]'}`}
                      />
                    </div>
                  </div>

                   <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="group">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Courts</label>
                      <input 
                        type="number" 
                        defaultValue="6"
                        className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#eb483f]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#eb483f] text-[#0A1F44]'}`}
                      />
                    </div>
                    <div className="group">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Admin</label>
                      <select className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#eb483f]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#eb483f] text-[#0A1F44]'}`}>
                        <option>Sarah Johnson</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowNewArenaModal(false)}
                  className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-[#eb483f] text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white hover:text-[#eb483f] hover:scale-[1.01] transition-all shadow-xl md:shadow-2xl shadow-[#eb483f]/40 flex items-center justify-center gap-2"
                >
                  Initialize <ArrowRight size={14} className="md:w-[16px] md:h-[16px]" />
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


