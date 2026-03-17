import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Plus, Search, Filter, Settings2, Trash2, Edit2, CheckCircle2, 
  XCircle, X, ArrowRight, DollarSign, Users, MoreVertical, Eye, FileText, Activity
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { COURTS, ARENAS } from '../../../data/mockData';

const CourtManagement = () => {
  const { isDark } = useTheme();
  const [selectedArena, setSelectedArena] = useState(ARENAS[0].id);
  const [showAddCourtModal, setShowAddCourtModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  // Filter courts by arena
  const filteredCourts = COURTS.filter(court => court.arenaId === selectedArena);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Target className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Units
          </h2>
          <p className={`text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Facility hub.</p>
        </div>
        <button
          onClick={() => setShowAddCourtModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-[#eb483f] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg md:shadow-xl shadow-[#eb483f]/20"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <div className="flex-1 min-w-[150px] relative group">
          <Search size={12} className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/30 group-focus-within:text-[#eb483f]' : 'text-[#0A1F44]/30'}`} />
          <input
            type="text"
            placeholder="Query..."
            className={`w-full py-2 md:py-2.5 pl-8 md:pl-11 pr-4 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold transition-all outline-none border ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' 
                : 'bg-[#0A1F44]/2 border-[#0A1F44]/10 text-[#0A1F44] shadow-sm'
            }`}
          />
        </div>
        
        <select
          value={selectedArena}
          onChange={(e) => setSelectedArena(Number(e.target.value))}
          className={`px-2.5 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-sm font-black transition-all outline-none border cursor-pointer uppercase tracking-widest ${
            isDark 
              ? 'bg-white/5 border-white/10 text-white focus:border-[#eb483f]/50' 
              : 'bg-[#0A1F44]/2 border-[#0A1F44]/10 text-[#0A1F44] shadow-sm'
          }`}
        >
          {ARENAS.map(arena => (
            <option key={arena.id} value={arena.id}>{arena.name.split(' ')[0]}</option>
          ))}
        </select>

        <button className={`p-2 rounded-lg md:rounded-xl border transition-all ${
          isDark 
            ? 'bg-white/5 border-white/10 text-white/40 hover:text-white' 
            : 'bg-[#0A1F44]/2 border-[#0A1F44]/10 text-[#0A1F44]/40 hover:text-[#0A1F44]'
        }`}>
          <Filter size={12} className="md:w-[18px] md:h-[18px]" />
        </button>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        {filteredCourts.map((court, idx) => (
          <motion.div
            key={court.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`group rounded-xl md:rounded-3xl p-3 md:p-5 border transition-all duration-300 relative overflow-hidden ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/5 hover:border-[#eb483f]/30' 
                : 'bg-white border-[#0A1F44]/10 hover:shadow-lg'
            }`}
          >
            {/* Status Indicator */}
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <div className={`px-2 py-0.5 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                court.status === 'Active' 
                  ? 'bg-[#eb483f]/10 text-[#eb483f] border border-[#eb483f]/20' 
                  : 'bg-[#FF4B4B]/10 text-[#FF4B4B] border border-[#FF4B4B]/20'
              }`}>
                {court.status === 'Active' ? <CheckCircle2 size={8} /> : <XCircle size={8} />}
                {court.status === 'Active' ? 'Operational' : 'Halt'}
              </div>
              <div className="flex gap-2 relative">
                <button 
                  onClick={() => setActiveMenu(activeMenu === court.id ? null : court.id)}
                  className={`p-1.5 rounded-lg transition-all border ${
                    activeMenu === court.id
                      ? 'bg-[#eb483f] border-[#eb483f] text-[#0A1F44]'
                      : isDark 
                        ? 'bg-white/5 border-white/5 text-white/40 hover:text-white' 
                        : 'bg-black/5 border-black/10 text-[#0A1F44]/40 hover:text-black'
                  }`}
                >
                  <MoreVertical size={12} />
                </button>

                <AnimatePresence>
                  {activeMenu === court.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className={`absolute right-0 top-full mt-1.5 w-48 p-1.5 rounded-xl border z-20 shadow-2xl backdrop-blur-xl ${
                          isDark ? 'bg-[#0A1F44]/90 border-white/10' : 'bg-white/90 border-[#0A1F44]/10'
                        }`}
                      >
                         <div className="space-y-0.5 text-left">
                          {[
                            { label: 'Edit', icon: Edit2, color: '#eb483f' },
                            { label: 'Setup', icon: Settings2, color: '#eb483f' },
                            { label: 'Log', icon: FileText, color: '#eb483f' },
                            { label: 'Stats', icon: Activity, color: '#A855F7' },
                            { label: 'Halt', icon: Trash2, color: '#FF4B4B' },
                          ].map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveMenu(null)}
                              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-[#0A1F44]/5 text-[#0A1F44]/60 hover:text-[#0A1F0A]'
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

            <div className="space-y-0.5 md:space-y-1 mb-2 md:mb-4">
              <h3 className={`text-sm md:text-xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                {court.name}
              </h3>
              <p className={`text-[7px] md:text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>
                {court.type} Surface
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3 md:mb-4">
              <div className={`p-1.5 md:p-3 rounded-lg border ${isDark ? 'bg-white/5 border-white/5' : 'bg-[#0A1F44]/5 border-[#0A1F44]/5'}`}>
                <p className={`text-[6px] md:text-[9px] font-black uppercase tracking-widest mb-0.5 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>Rate</p>
                <p className={`text-[10px] md:text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{court.baseRate}</p>
              </div>
              <div className={`p-1.5 md:p-3 rounded-lg border ${isDark ? 'bg-white/5 border-white/5' : 'bg-[#0A1F44]/5 border-[#0A1F44]/5'}`}>
                <p className={`text-[6px] md:text-[9px] font-black uppercase tracking-widest mb-0.5 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>Pax</p>
                <p className={`text-[10px] md:text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{court.capacity || 4}</p>
              </div>
            </div>

            {/* Amenities icons */}
            <div className="flex gap-1 mb-3 md:mb-6">
              {['AC', 'LED', 'CCTV'].map(tag => (
                <span key={tag} className={`px-1 py-0.5 rounded text-[6px] font-black uppercase tracking-widest border transition-colors ${
                  isDark ? 'bg-white/5 border-white/10 text-white/20 hover:text-[#eb483f]' : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 text-[#0A1F44]/30'
                }`}>
                  {tag}
                </span>
              ))}
            </div>

            <button className={`w-full py-2 rounded-lg md:rounded-xl text-[8px] md:text-xs font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white hover:bg-[#eb483f] hover:text-[#0A1F44]' 
                : 'bg-white border-[#0A1F44]/10 text-[#0A1F44] hover:bg-[#0A1F44] hover:text-white'
            }`}>
              <Settings2 size={10} /> Queue
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add Court Modal */}
      <AnimatePresence>
        {showAddCourtModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddCourtModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-lg rounded-3xl md:rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10 text-white' : 'bg-white border-black/10 text-[#0A1F44]'} shadow-2xl shadow-black/50`}
            >
              <div className="p-6 md:p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3">
                    <Target className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Register Court
                  </h3>
                  <p className="text-[10px] md:text-xs font-bold opacity-30 uppercase tracking-widest mt-0.5 md:mt-1">Add facility unit</p>
                </div>
                <button
                  onClick={() => setShowAddCourtModal(false)}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}
                >
                  <X size={18} className="md:w-[20px] md:h-[20px]" />
                </button>
              </div>              <div className="p-6 md:p-8 space-y-4 md:space-y-5">
                <div className="group">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Name</label>
                  <input type="text" placeholder="e.g. Court 7" className={`w-full py-3 md:py-4 px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#eb483f]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#eb483f] text-[#0A1F44]'}`} />
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="group">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Surface</label>
                    <select className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#eb483f]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#eb483f] text-[#0A1F44]'}`}>
                      <option>Synthetic</option>
                      <option>Wooden</option>
                      <option>PU Surface</option>
                      <option>Mat</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Pax</label>
                    <input type="number" defaultValue="4" className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#eb483f]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#eb483f] text-[#0A1F44]'}`} />
                  </div>
                </div>
                <div className="group">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Rate (₹/hr)</label>
                  <input type="number" defaultValue="800" className={`w-full py-3 md:py-4 px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#eb483f]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#eb483f] text-[#0A1F44]'}`} />
                </div>
                <button
                  onClick={() => setShowAddCourtModal(false)}
                  className="w-full py-4 md:py-5 rounded-xl md:rounded-[1.5rem] bg-[#eb483f] text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white hover:text-[#eb483f] hover:scale-[1.01] transition-all shadow-xl md:shadow-2xl shadow-[#eb483f]/40 flex items-center justify-center gap-2"
                >
                  Deploy Unit <ArrowRight size={14} className="md:w-[16px] md:h-[16px]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourtManagement;


