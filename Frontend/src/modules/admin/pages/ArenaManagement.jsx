import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Plus, Star, Map, Users, Settings, Target, Layers, X, Home, 
  Navigation, ArrowRight, MoreVertical, Eye, Shield, Calendar, BarChart3, Trash2 
} from 'lucide-react';
import { MOCK_DB, getArenaWithDetails } from '../../../data/mockDatabase';
import { useTheme } from '../../user/context/ThemeContext';
import { useAuth } from '../../user/context/AuthContext';

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
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Map className="text-[#22FF88]" /> Arena Portfolio
          </h2>
          <p className={`text-sm mt-1 font-medium ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Manage interconnected hierarchy: Arena &gt; Courts &gt; Slots.</p>
        </div>
        <button 
          onClick={() => setShowNewArenaModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#22FF88]/20"
        >
          <Plus size={16} /> Deploy New Facility
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayArenas.map((arena, idx) => {
          const details = getArenaWithDetails(arena.id);
          return (
            <motion.div
              key={arena.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`group relative rounded-[2.5rem] border overflow-hidden transition-all duration-500 flex flex-col hover:shadow-2xl ${
                isDark 
                  ? 'bg-[#0A1F44]/50 border-white/5 hover:border-[#22FF88]/30 hover:shadow-[#22FF88]/5' 
                  : 'bg-white border-[#0A1F44]/10 shadow-lg shadow-blue-900/5 hover:border-[#22FF88]'
              }`}
            >
              {/* Image Header (Mock Image) */}
              <div className="h-40 w-full relative overflow-hidden bg-[#08142B]">
                 <div className="absolute inset-0 court-lines opacity-20" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] to-transparent" />
                 <span className={`absolute top-5 right-5 backdrop-blur-md px-3 py-1.5 flex items-center gap-2 rounded-xl font-black text-[10px] uppercase tracking-widest border ${
                   isDark ? 'bg-[#22FF88]/10 text-[#22FF88] border-[#22FF88]/20' : 'bg-white/80 text-[#059669] border-black/5'
                 }`}>
                   Operational
                 </span>
                 <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
                    <div>
                      <h3 className="font-black font-display text-white text-xl tracking-tight truncate">{arena.name}</h3>
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mt-1 truncate">
                        <MapPin size={12} className="text-[#22FF88]" /> {arena.locations}
                      </p>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === arena.id ? null : arena.id)}
                        className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-[#22FF88] hover:text-[#0A1F44] hover:border-transparent transition-all"
                      >
                         <MoreVertical size={18} />
                      </button>

                      <AnimatePresence>
                        {activeMenu === arena.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActiveMenu(null)} 
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, x: 20 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95, x: 20 }}
                              className={`absolute right-0 bottom-full mb-2 w-56 p-2 rounded-2xl border z-20 shadow-2xl backdrop-blur-xl ${
                                isDark ? 'bg-[#0A1F44]/90 border-white/10 shadow-black' : 'bg-white/90 border-[#0A1F44]/10 shadow-blue-900/10'
                              }`}
                            >
                              <div className="space-y-1 text-left">
                                {[
                                  { label: 'View Public Page', icon: Eye, color: '#1EE7FF' },
                                  { label: 'Staff Directory', icon: Shield, color: '#22FF88' },
                                  { label: 'Maintenance Plan', icon: Calendar, color: '#FFD600' },
                                  { label: 'Finance Summary', icon: BarChart3, color: '#A855F7' },
                                  { label: 'Safe Delete', icon: Trash2, color: '#FF4B4B' },
                                ].map((opt, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setActiveMenu(null)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                      isDark ? 'hover:bg-white/5 text-white/60 hover:text-white' : 'hover:bg-[#0A1F44]/5 text-[#0A1F44]/60 hover:text-[#0A1F44]'
                                    }`}
                                  >
                                    <div className={`p-1.5 rounded-lg border transition-colors`} style={{ backgroundColor: `${opt.color}10`, borderColor: `${opt.color}20`, color: opt.color }}>
                                      <opt.icon size={12} />
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

              {/* Content Stats - Real Relationships */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className={`rounded-[1.5rem] p-4 border ${isDark ? 'bg-white/2 border-white/5' : 'bg-[#0A1F44]/2 border-black/5'}`}>
                     <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
                        <Target size={14} />
                     </div>
                     <p className="text-[8px] uppercase font-black text-white/20 tracking-[0.2em] mb-1">Managed Courts</p>
                     <p className={`text-lg font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{details.courtDetails.length} Units</p>
                  </div>
                  <div className={`rounded-[1.5rem] p-4 border ${isDark ? 'bg-white/2 border-white/5' : 'bg-[#0A1F44]/2 border-black/5'}`}>
                     <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 mb-2">
                        <Layers size={14} />
                     </div>
                     <p className="text-[8px] uppercase font-black text-white/20 tracking-[0.2em] mb-1">Coach Batches</p>
                     <p className={`text-lg font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{details.batches.length} Active</p>
                  </div>
                </div>

                {/* Status Ticker */}
                <div className="flex items-center gap-4 mb-6 px-1">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className={`w-6 h-6 rounded-full border-2 ${isDark ? 'border-[#0A1F44] bg-white/10' : 'border-white bg-[#0A1F44]/10'}`} />
                      ))}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-black ${isDark ? 'border-[#0A1F44] bg-[#22FF88] text-[#08142B]' : 'border-white bg-[#22FF88] text-[#08142B]'}`}>
                        +4
                      </div>
                   </div>
                   <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Active Staff Members</p>
                </div>

                {/* Actions */}
                <div className={`grid grid-cols-2 gap-3 pt-6 border-t ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
                  <button className={`flex items-center justify-center py-2.5 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest gap-2 ${
                     isDark ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white' : 'bg-[#0A1F44]/5 text-[#0A1F44]/60 hover:bg-[#0A1F44]/10 hover:text-[#0A1F44]'
                  }`}>
                    <Target size={14} className="text-[#22FF88]" /> List Courts
                  </button>
                  <button className={`flex items-center justify-center py-2.5 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest gap-2 shadow-sm ${
                     isDark ? 'border-[#1EE7FF]/30 text-[#1EE7FF] hover:bg-[#1EE7FF]/10' : 'border-[#22FF88]/30 text-[#0A1F44] hover:bg-[#22FF88]/10'
                  }`}>
                    <Settings size={14} /> Config
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
              className={`relative w-full max-w-xl rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10 text-white' : 'bg-white border-black/10 text-[#0A1F44]'} shadow-2xl shadow-black/50`}
            >
              <div className="p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <Map className="text-[#22FF88]" /> Deploy Facility
                  </h3>
                  <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Expansion module: Arena Registration</p>
                </div>
                <button 
                  onClick={() => setShowNewArenaModal(false)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Facility Name</label>
                    <div className="relative">
                      <Home size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-[#22FF88] group-focus-within:opacity-100 transition-all" />
                      <input 
                        type="text" 
                        placeholder="e.g. Phoenix Smash Arena"
                        className={`w-full py-4 pl-12 pr-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Geographic Location</label>
                    <div className="relative">
                      <Navigation size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-[#22FF88] group-focus-within:opacity-100 transition-all" />
                      <input 
                        type="text" 
                        placeholder="e.g. Indiranagar, Bangalore"
                        className={`w-full py-4 pl-12 pr-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Court Count</label>
                      <input 
                        type="number" 
                        defaultValue="6"
                        className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}
                      />
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Admin Assigned</label>
                      <select className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}>
                        <option>Sarah Johnson</option>
                        <option>Mike Ross</option>
                        <option>Create New Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowNewArenaModal(false)}
                  className="w-full py-5 rounded-[1.5rem] bg-[#22FF88] text-[#0A1F44] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:scale-[1.02] transition-all shadow-2xl shadow-[#22FF88]/20 flex items-center justify-center gap-2"
                >
                  Initialize Portfolio Item <ArrowRight size={16} />
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
