import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Search, Filter, Calendar, Users, Target, ChevronRight, Share2, Medal, X, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const EVENTS = [
  { id: 1, title: 'Summer Smash 2026', type: 'Open Tournament', date: 'March 25-27', venue: 'Olympic Smash', status: 'Registration Open', prize: '₹50,000', participants: 128 },
  { id: 2, title: 'Junior Championship', type: 'U-17 Boys/Girls', date: 'April 05', venue: 'Olympic Smash', status: 'Draft', prize: 'Trophies & Gears', participants: 0 },
  { id: 3, title: 'Corporate League', type: 'Teams of 4', date: 'Ongoing', venue: 'Badminton Hub', status: 'Live', prize: 'Corporate Trophy', participants: 16 },
];

const EventsAdmin = () => {
  const { isDark } = useTheme();
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className={`text-xl md:text-2xl font-black font-display tracking-wide flex items-center gap-2 md:gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Trophy className="text-[#FFD600] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Arena
          </h2>
          <p className={`text-[11px] md:text-sm mt-0.5 md:mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Event ops.</p>
        </div>
        <button 
          onClick={() => setShowNewEventModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg md:shadow-xl shadow-[#22FF88]/20"
        >
          <Plus size={14} /> Tournament
        </button>
      </div>

      {/* Featured Metric */}
      <div className={`p-3 md:p-8 rounded-xl md:rounded-[2.5rem] border relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#0A1F44] to-[#08142B] border-[#FFD600]/20' : 'bg-white border-[#FFD600]/30 shadow-sm'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD600]/10 blur-[100px] -z-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 relative z-10">
          <div className="flex items-center gap-3 md:gap-6">
            <div className={`w-8 h-8 md:w-16 md:h-16 rounded-lg md:rounded-3xl flex items-center justify-center border md:border-2 border-[#FFD600] ${isDark ? 'bg-[#FFD600]/5 text-[#FFD600]' : 'bg-[#FFD600]/10 text-[#d97706]'}`}>
              <Medal size={16} className="md:w-[32px] md:h-[32px]" />
            </div>
            <div>
              <p className="text-[6px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD600] mb-0.5 md:mb-1">Registrations</p>
              <h3 className={`text-sm md:text-4xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>3.4K <span className="text-[7px] md:text-sm font-bold opacity-30 ml-1">Players</span></h3>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className={`flex-1 md:flex-none p-2 md:p-4 rounded-lg md:rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 shadow-sm'}`}>
               <p className="text-[6px] md:text-[9px] font-bold text-white/20 uppercase tracking-widest mb-0.5 md:mb-1">Upcoming</p>
               <p className={`text-xs md:text-xl font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>12</p>
            </div>
            <div className={`flex-1 md:flex-none p-2 md:p-4 rounded-lg md:rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#22FF88]/5 border-[#22FF88]/10 shadow-sm'}`}>
               <p className="text-[6px] md:text-[9px] font-bold text-[#22FF88]/40 uppercase tracking-widest mb-0.5 md:mb-1">Value</p>
               <p className="text-xs md:text-xl font-black font-display text-[#22FF88]">₹12.4L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative group">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#FFD600] transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className={`w-full py-2.5 pl-10 pr-4 rounded-lg md:rounded-xl text-[11px] font-medium transition-all outline-none border ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/5 focus:border-[#FFD600]/50 text-white' 
                : 'bg-white border-[#0A1F44]/10 focus:border-[#FFD600] text-[#0A1F44]'
            }`}
          />
        </div>
        <button className={`p-2.5 rounded-lg border transition-all ${
          isDark ? 'bg-[#0A1F44]/50 border-white/5 text-white/60 hover:text-white' : 'bg-white border-[#0A1F44]/10 text-[#0A1F44]/60 hover:text-[#0A1F44]'
        }`}>
          <Filter size={14} />
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3 md:space-y-4">
        {EVENTS.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-3 md:p-8 rounded-xl md:rounded-[2rem] border group transition-all duration-300 relative ${isDark ? 'bg-[#0A1F44]/50 border-white/5 hover:border-[#1EE7FF]/20 hover:bg-[#0A1F44]' : 'bg-white border-[#0A1F44]/10 shadow-sm hover:shadow-xl'}`}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 md:gap-6">
              <div className="flex-1 space-y-1 md:space-y-2">
                <div className="flex flex-wrap items-center gap-1.5 md:gap-3">
                  <span className={`px-1.5 py-0.5 rounded text-[7px] md:text-[9px] font-black uppercase tracking-widest ${
                    item.status === 'Live' ? 'bg-[#FF4B4B]/10 text-[#FF4B4B]' :
                    item.status === 'Draft' ? 'bg-white/10 text-white/40' :
                    'bg-[#22FF88]/10 text-[#22FF88]'
                  }`}>
                    {item.status.split(' ')[0]}
                  </span>
                  <span className={`text-[7px] md:text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-[#0A1F44]/20'}`}>EV-{item.id}</span>
                </div>
                <h3 className={`text-sm md:text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.title}</h3>
                <div className="flex flex-wrap items-center gap-3 md:gap-6">
                   <div className="flex items-center gap-1 text-[9px] md:text-xs font-bold opacity-30">
                     <Calendar size={10} className="text-[#1EE7FF]" /> {item.date}
                   </div>
                   <div className="flex items-center gap-1 text-[9px] md:text-xs font-bold opacity-30">
                     <Target size={10} className="text-[#22FF88]" /> {item.venue.split(' ')[0]}
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-4 md:gap-8 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 pt-2 md:pt-4 lg:pt-0 lg:pl-8">
                 <div className="text-left md:text-center">
                    <p className="text-[6px] md:text-[10px] font-bold opacity-20 uppercase tracking-[0.2em] mb-0.5">Pool</p>
                    <p className={`text-xs md:text-lg font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.participants}</p>
                 </div>
                 <div className="flex items-center gap-1.5 md:gap-2 ml-auto">
                    <button className={`p-1.5 md:p-2 rounded-lg md:rounded-2xl transition-all ${isDark ? 'bg-white/5 text-white/40 hover:text-white' : 'bg-[#0A1F44]/5 text-[#0A1F44]/40 hover:text-[#0A1F44]'}`}>
                       <Share2 size={12} className="md:w-[20px] md:h-[20px]" />
                    </button>
                    <button className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-2xl transition-all text-[7px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 ${isDark ? 'bg-[#1EE7FF]/10 text-[#1EE7FF] border border-[#1EE7FF]/20' : 'bg-[#0284c7] text-white shadow-sm'}`}>
                       View <ArrowRight size={10} className="md:w-[16px] md:h-[16px]" />
                    </button>
                 </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Tournament Modal */}
      <AnimatePresence>
        {showNewEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewEventModal(false)}
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
                    <Trophy className="text-[#FFD600] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Launch
                  </h3>
                  <p className="text-[10px] md:text-xs font-bold opacity-30 uppercase tracking-widest mt-0.5 md:mt-1">Tournament frame</p>
                </div>
                <button 
                  onClick={() => setShowNewEventModal(false)}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}
                >
                  <X size={18} className="md:w-[20px] md:h-[20px]" />
                </button>
              </div>              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="group">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Tounament Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Smash Masters 2026"
                      className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="group">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Prize Pool</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#22FF88]">₹</span>
                        <input 
                          type="text" 
                          placeholder="50K"
                          className={`w-full py-3 md:py-4 pl-8 md:pl-10 pr-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Venue</label>
                      <select className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`}>
                        <option>Olympic</option>
                        <option>Hub</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl border border-dashed flex items-center gap-3 md:gap-4 ${isDark ? 'bg-[#FFD600]/5 border-[#FFD600]/20' : 'bg-[#FFD600]/5 border-[#FFD600]/30'}`}>
                   <ShieldCheck className="text-[#FFD600] md:w-[24px] md:h-[24px]" size={20} />
                   <div className="flex-1">
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#FFD600]">Verification</p>
                      <p className="text-[10px] md:text-xs font-bold mt-0.5 opacity-40">Digital ID required</p>
                   </div>
                   <div className="w-8 h-5 md:w-10 md:h-6 bg-[#FFD600] rounded-full relative shadow-lg shadow-[#FFD600]/20">
                      <div className="absolute right-1 top-1 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full" />
                   </div>
                </div>
                <button 
                  onClick={() => setShowNewEventModal(false)}
                  className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-[#FFD600] text-[#0A1F44] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white hover:scale-[1.01] transition-all shadow-xl md:shadow-2xl shadow-[#FFD600]/20 flex items-center justify-center gap-2"
                >
                  Create <ArrowRight size={14} className="md:w-[16px] md:h-[16px]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsAdmin;
