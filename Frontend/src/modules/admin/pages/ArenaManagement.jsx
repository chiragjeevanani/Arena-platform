import { motion } from 'framer-motion';
import { MapPin, Plus, Star, Map, Users, Settings } from 'lucide-react';
import { ARENAS } from '../../../data/mockData';

import { useTheme } from '../../user/context/ThemeContext';

const ArenaManagement = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Map className="text-[#22FF88]" /> Arena Portfolio
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium">Monitor facility performance, manage staff, and scale your operations.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-[#1EE7FF] transition-all text-sm font-bold shadow-[0_0_20px_rgba(34,255,136,0.2)]">
          <Plus size={16} /> Add New Facility
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ARENAS.map((arena, idx) => (
          <motion.div
            key={arena.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`group relative rounded-[2.5rem] border overflow-hidden transition-all duration-500 flex flex-col hover:shadow-2xl ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/5 hover:border-[#22FF88]/30 hover:shadow-[#22FF88]/5' 
                : 'bg-white border-[#0A1F44]/10 shadow-lg shadow-blue-900/5 hover:border-[#1EE7FF]'
            }`}
          >
            {/* Image Header */}
            <div className="h-48 w-full relative overflow-hidden">
               <img src={arena.image} alt={arena.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
               <span className="absolute top-5 right-5 bg-white/10 backdrop-blur-md px-3 py-1.5 flex items-center gap-2 rounded-xl font-black text-[10px] text-white border border-white/20 uppercase tracking-widest">
                 <Star size={12} className="text-[#FFD600] fill-[#FFD600]" /> {arena.rating} Rating
               </span>
               <div className="absolute bottom-5 left-6 right-6">
                 <h3 className="font-black font-display text-white text-2xl tracking-tight truncate">{arena.name}</h3>
                 <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mt-1 truncate">
                   <MapPin size={12} className="text-[#1EE7FF]" /> {arena.location}
                 </p>
               </div>
            </div>

            {/* Content Stats */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`rounded-3xl p-4 border ${isDark ? 'bg-white/2 border-white/5' : 'bg-[#0A1F44]/2 border-black/5'}`}>
                   <p className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em] mb-1">Total Courts</p>
                   <p className={`text-xl font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{arena.courtsCount} Units</p>
                </div>
                <div className={`rounded-3xl p-4 border ${isDark ? 'bg-white/2 border-white/5' : 'bg-[#0A1F44]/2 border-black/5'}`}>
                   <p className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em] mb-1">Base Rate</p>
                   <p className="text-xl font-black text-[#22FF88] font-display">₹{arena.pricePerHour}<span className="text-[10px] text-white/20 ml-1">/hr</span></p>
                </div>
              </div>

              {/* Actions */}
              <div className={`grid grid-cols-2 gap-3 pt-6 border-t ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
                <button className={`flex items-center justify-center py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest gap-2 shadow-sm ${
                   isDark ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white' : 'bg-[#0A1F44]/5 text-[#0A1F44]/60 hover:bg-[#0A1F44]/10 hover:text-[#0A1F44]'
                }`}>
                  <Settings size={14} className="text-[#1EE7FF]" /> Settings
                </button>
                <button className={`flex items-center justify-center py-3 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest gap-2 ${
                   isDark ? 'border-[#1EE7FF]/30 text-[#1EE7FF] hover:bg-[#1EE7FF]/10' : 'border-[#1EE7FF]/30 text-[#0A1F44] hover:bg-[#1EE7FF]/5'
                }`}>
                  <Users size={14} /> Staff (12)
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


export default ArenaManagement;
