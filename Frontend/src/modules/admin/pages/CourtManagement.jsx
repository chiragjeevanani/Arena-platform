import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Search, Filter, Settings2, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { COURTS, ARENAS } from '../../../data/mockData';

const CourtManagement = () => {
  const { isDark } = useTheme();
  const [selectedArena, setSelectedArena] = useState(ARENAS[0].id);

  // Filter courts by arena
  const filteredCourts = COURTS.filter(court => court.arenaId === selectedArena);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-black text-white font-display tracking-wide flex items-center gap-3">
            <Target className="text-[#22FF88]" /> Court Management
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium">Manage court configurations, status, and amenities.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-[#1EE7FF] transition-all text-sm font-bold shadow-[0_0_15px_rgba(34,255,136,0.3)]">
          <Plus size={16} /> Add Court
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#22FF88] transition-colors" />
          <input
            type="text"
            placeholder="Search courts..."
            className={`w-full py-2.5 pl-11 pr-4 rounded-xl text-sm font-medium transition-all outline-none border ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/5 focus:border-[#22FF88]/50 text-white' 
                : 'bg-white border-[#0A1F44]/10 focus:border-[#22FF88] text-[#0A1F44]'
            }`}
          />
        </div>
        
        <select
          value={selectedArena}
          onChange={(e) => setSelectedArena(Number(e.target.value))}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all outline-none border cursor-pointer ${
            isDark 
              ? 'bg-[#0A1F44]/50 border-white/5 text-white focus:border-[#22FF88]/50' 
              : 'bg-white border-[#0A1F44]/10 text-[#0A1F44] focus:border-[#22FF88]'
          }`}
        >
          {ARENAS.map(arena => (
            <option key={arena.id} value={arena.id}>{arena.name}</option>
          ))}
        </select>

        <button className={`p-2.5 rounded-xl border transition-all ${
          isDark 
            ? 'bg-[#0A1F44]/50 border-white/5 text-white/60 hover:text-white hover:border-[#22FF88]/50' 
            : 'bg-white border-[#0A1F44]/10 text-[#0A1F44]/60 hover:text-[#0A1F44] hover:border-[#22FF88]'
        }`}>
          <Filter size={18} />
        </button>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourts.map((court, idx) => (
          <motion.div
            key={court.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`group rounded-3xl p-5 border transition-all duration-300 relative overflow-hidden ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/5 hover:border-[#22FF88]/30' 
                : 'bg-white border-[#0A1F44]/10 hover:shadow-xl'
            }`}
          >
            {/* Status Indicator */}
            <div className="flex justify-between items-start mb-4">
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                court.status === 'Active' 
                  ? 'bg-[#22FF88]/10 text-[#22FF88] border border-[#22FF88]/20' 
                  : 'bg-[#FF4B4B]/10 text-[#FF4B4B] border border-[#FF4B4B]/20'
              }`}>
                {court.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                {court.status}
              </div>
              <div className="flex gap-2">
                <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-[#0A1F44]/5 text-[#0A1F44]/40'}`}>
                  <Edit2 size={14} />
                </button>
                <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#FF4B4B]/10 text-[#FF4B4B]/60' : 'hover:bg-[#FF4B4B]/5 text-[#FF4B4B]/60'}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <h3 className={`text-xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                {court.name}
              </h3>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>
                {court.type} Court
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-[#0A1F44]/5 border-[#0A1F44]/5'}`}>
                <p className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/30'}`}>Base Rate</p>
                <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{court.baseRate}/hr</p>
              </div>
              <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-[#0A1F44]/5 border-[#0A1F44]/5'}`}>
                <p className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/30'}`}>Capacity</p>
                <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{court.capacity || 4} Pax</p>
              </div>
            </div>

            {/* Amenities icons */}
            <div className="flex gap-2 mb-6">
              {['AC', 'LED', 'CCTV'].map(tag => (
                <span key={tag} className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                  isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 text-[#0A1F44]/40'
                }`}>
                  {tag}
                </span>
              ))}
            </div>

            <button className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white hover:bg-[#22FF88] hover:text-[#0A1F44] hover:border-transparent' 
                : 'bg-white border-[#0A1F44]/10 text-[#0A1F44] hover:bg-[#0A1F44] hover:text-white hover:border-transparent'
            }`}>
              <Settings2 size={14} /> Configure Slots
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CourtManagement;
