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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Trophy className="text-[#FFD600]" /> Events & Tournaments
          </h2>
          <p className={`text-sm mt-1 font-medium ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Create tournaments, manage brackets, and track registrations.</p>
        </div>
        <button 
          onClick={() => setShowNewEventModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#22FF88]/20"
        >
          <Plus size={16} /> New Tournament
        </button>
      </div>

      {/* Featured Metric */}
      <div className={`p-6 rounded-[2.5rem] border relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#0A1F44] to-[#08142B] border-[#FFD600]/20' : 'bg-white border-[#FFD600]/30 shadow-xl'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD600]/10 blur-[100px] -z-10" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border-2 border-[#FFD600] ${isDark ? 'bg-[#FFD600]/5 text-[#FFD600]' : 'bg-[#FFD600]/10 text-[#d97706]'}`}>
              <Medal size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD600] mb-1">Active Registrations</p>
              <h3 className={`text-4xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>3,412 <span className="text-sm font-bold opacity-30 ml-2">Participants</span></h3>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className={`flex-1 md:flex-none p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#0A1F44]/5 border-[#0A1F44]/10'}`}>
               <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Upcoming Events</p>
               <p className={`text-xl font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>12</p>
            </div>
            <div className={`flex-1 md:flex-none p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#0A1F44]/5 border-[#0A1F44]/10'}`}>
               <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Revenue</p>
               <p className="text-xl font-black font-display text-[#22FF88]">₹12.4L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[250px] relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#FFD600] transition-colors" />
          <input
            type="text"
            placeholder="Search events..."
            className={`w-full py-3 pl-11 pr-4 rounded-xl text-sm font-medium transition-all outline-none border ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/5 focus:border-[#FFD600]/50 text-white' 
                : 'bg-white border-[#0A1F44]/10 focus:border-[#FFD600] text-[#0A1F44]'
            }`}
          />
        </div>
        <button className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
          isDark ? 'bg-[#0A1F44]/50 border-white/5 text-white/60 hover:text-white' : 'bg-white border-[#0A1F44]/10 text-[#0A1F44]/60 hover:text-[#0A1F44]'
        }`}>
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {EVENTS.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-6 rounded-[2rem] border group transition-all duration-300 relative ${isDark ? 'bg-[#0A1F44]/50 border-white/5 hover:border-[#1EE7FF]/20 hover:bg-[#0A1F44]' : 'bg-white border-[#0A1F44]/10 shadow-sm hover:shadow-xl'}`}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                    item.status === 'Live' ? 'bg-[#FF4B4B]/10 text-[#FF4B4B] animate-pulse' :
                    item.status === 'Draft' ? 'bg-white/10 text-white/40' :
                    'bg-[#22FF88]/10 text-[#22FF88]'
                  }`}>
                    {item.status}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-[#0A1F44]/30'}`}>#{item.id}092</span>
                </div>
                <h3 className={`text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.title}</h3>
                <div className="flex flex-wrap items-center gap-6 mt-1">
                   <div className="flex items-center gap-2 text-xs font-bold opacity-40">
                     <Calendar size={14} className="text-[#1EE7FF]" /> {item.date}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold opacity-40">
                     <Target size={14} className="text-[#22FF88]" /> {item.venue}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-[#FFD600]">
                     <Medal size={14} /> {item.prize} Prize
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-8 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-8">
                 <div className="text-center">
                   <p className="text-[10px] font-bold opacity-20 uppercase tracking-[0.2em] mb-1">Participants</p>
                   <p className={`text-lg font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.participants}</p>
                 </div>
                 <div className="flex items-center gap-2 ml-auto">
                    <button className={`p-3 rounded-2xl transition-all ${isDark ? 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10' : 'bg-[#0A1F44]/5 text-[#0A1F44]/40 hover:text-[#0A1F44] hover:bg-[#0A1F44]/10'}`}>
                      <Share2 size={20} />
                    </button>
                    <button className={`px-6 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'bg-[#1EE7FF]/10 text-[#1EE7FF] border border-[#1EE7FF]/20 hover:bg-[#1EE7FF] hover:text-[#0A1F44]' : 'bg-[#0284c7] text-white hover:bg-[#0c4a6e]'}`}>
                      View Brackets <ArrowRight size={16} />
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
              className={`relative w-full max-w-xl rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10 text-white' : 'bg-white border-black/10 text-[#0A1F44]'} shadow-2xl shadow-black/50`}
            >
              <div className="p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <Trophy className="text-[#FFD600]" /> Launch Tournament
                  </h3>
                  <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Configure competition framework</p>
                </div>
                <button 
                  onClick={() => setShowNewEventModal(false)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Tournament Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Smash Masters Championship 2026"
                      className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Prize Pool</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#22FF88]">₹</span>
                        <input 
                          type="text" 
                          placeholder="50,000"
                          className={`w-full py-4 pl-8 pr-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Event Venue</label>
                      <select className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`}>
                        <option>Olympic Smash Arena</option>
                        <option>Elite Badminton Hub</option>
                        <option>Global Sports Complex</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border border-dashed flex items-center gap-4 ${isDark ? 'bg-[#FFD600]/5 border-[#FFD600]/20' : 'bg-[#FFD600]/5 border-[#FFD600]/30'}`}>
                   <ShieldCheck className="text-[#FFD600]" size={24} />
                   <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD600]">Verification Mode</p>
                      <p className="text-xs font-bold mt-1 opacity-40">Require digital ID for participant registration</p>
                   </div>
                   <div className="w-10 h-6 bg-[#FFD600] rounded-full relative shadow-lg shadow-[#FFD600]/20">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                   </div>
                </div>

                <button 
                  onClick={() => setShowNewEventModal(false)}
                  className="w-full py-5 rounded-[1.5rem] bg-[#FFD600] text-[#0A1F44] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:scale-[1.02] transition-all shadow-2xl shadow-[#FFD600]/20 flex items-center justify-center gap-2"
                >
                  Create Tournament <ArrowRight size={16} />
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
