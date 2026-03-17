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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/5">
        <div>
          <h2 className={`text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Trophy className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Arena
          </h2>
          <p className={`text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>League ops.</p>
        </div>
        <button 
          onClick={() => setShowNewEventModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-[#eb483f] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg md:shadow-xl shadow-[#eb483f]/20"
        >
          <Plus size={14} /> Deck
        </button>
      </div>

      {/* Featured Metric */}
      <div className={`p-3 md:p-8 rounded-xl md:rounded-[2.5rem] border relative overflow-hidden ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#eb483f]/20 shadow-sm'}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#eb483f]/5 blur-[60px] -z-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 relative z-10">
          <div className="flex items-center gap-3 md:gap-6">
            <div className={`w-8 h-8 md:w-16 md:h-16 rounded-lg md:rounded-3xl flex items-center justify-center border md:border-2 border-[#eb483f]/30 ${isDark ? 'bg-[#eb483f]/5 text-[#eb483f]' : 'bg-[#eb483f]/5 text-[#eb483f]'}`}>
              <Medal size={14} className="md:w-[32px] md:h-[32px]" />
            </div>
            <div>
              <p className="text-[6px] md:text-[10px] font-black uppercase tracking-widest text-[#eb483f] mb-0.5">Registry</p>
              <h3 className={`text-sm md:text-4xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>3.4K <span className="text-[7px] md:text-sm font-black opacity-10 ml-0.5 uppercase">Elite</span></h3>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className={`flex-1 md:flex-none p-2 md:p-4 rounded-lg md:rounded-2xl border ${isDark ? 'bg-white/2 border-white/5 font-black uppercase' : 'bg-[#0A1F44]/5 border-[#0A1F44]/5'}`}>
               <p className="text-[5px] md:text-[9px] font-black text-white/10 tracking-widest mb-0.5">Wait</p>
               <p className={`text-[10px] md:text-xl font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>12</p>
            </div>
            <div className={`flex-1 md:flex-none p-2 md:p-4 rounded-lg md:rounded-2xl border ${isDark ? 'bg-white/2 border-white/5' : 'bg-[#eb483f]/5 border-[#eb483f]/5 font-black uppercase'}`}>
               <p className="text-[5px] md:text-[9px] font-black text-[#eb483f]/20 tracking-widest mb-0.5">Asset</p>
               <p className="text-[10px] md:text-xl font-black font-display text-[#eb483f]">12.4L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative group">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#eb483f] transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className={`w-full py-2 pl-9 pr-4 rounded-lg md:rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all outline-none border ${
              isDark 
                ? 'bg-white/5 border-white/5 focus:border-[#eb483f]/20 text-white' 
                : 'bg-white border-[#0A1F44]/10 focus:border-[#eb483f] text-[#0A1F44]'
            }`}
          />
        </div>
        <button className={`p-2 rounded-lg border transition-all ${
          isDark ? 'bg-white/5 border-white/5 text-white/20 hover:text-white' : 'bg-white border-[#0A1F44]/10 text-[#0A1F44]/40 hover:text-[#0A1F44]'
        }`}>
          <Filter size={12} />
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-2 md:space-y-4">
        {EVENTS.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-3 md:p-8 rounded-xl md:rounded-[2rem] border group transition-all duration-300 relative ${isDark ? 'bg-[#0A1F44]/50 border-white/5 hover:border-[#eb483f]/20' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 md:gap-6">
              <div className="flex-1 space-y-1 md:space-y-2">
                <div className="flex flex-wrap items-center gap-1.5 md:gap-3">
                  <span className={`px-1.5 py-0.5 rounded text-[6px] md:text-[9px] font-black uppercase tracking-widest border transition-all ${
                    item.status === 'Live' ? 'bg-[#FF4B4B]/10 text-[#FF4B4B] border-[#FF4B4B]/20' :
                    item.status === 'Draft' ? 'bg-white/5 text-white/20 border-white/5' :
                    'bg-[#eb483f]/10 text-[#eb483f] border-[#eb483f]/20'
                  }`}>
                    {item.status.split(' ')[0]}
                  </span>
                  <span className={`text-[6px] md:text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/10' : 'text-[#0A1F44]/20'}`}>ID: {item.id}</span>
                </div>
                <h3 className={`text-xs md:text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.title}</h3>
                <div className="flex flex-wrap items-center gap-3">
                   <div className="flex items-center gap-1 text-[8px] md:text-xs font-black uppercase tracking-widest opacity-20">
                     <Calendar size={10} className="text-[#eb483f]" /> {item.date}
                   </div>
                   <div className="flex items-center gap-1 text-[8px] md:text-xs font-black uppercase tracking-widest opacity-20">
                     <Target size={10} className="text-[#eb483f]" /> {item.venue.split(' ')[0]}
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-4 md:gap-8 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 pt-2.5 md:pt-4 lg:pt-0 lg:pl-8">
                 <div className="text-left md:text-center">
                    <p className="text-[5px] md:text-[10px] font-black text-white/10 uppercase tracking-widest mb-0.5">Pool</p>
                    <p className={`text-[10px] md:text-lg font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.participants}</p>
                 </div>
                 <div className="flex items-center gap-1.5 md:gap-2 ml-auto">
                    <button className={`p-1.5 rounded-lg md:rounded-2xl transition-all ${isDark ? 'bg-white/5 text-white/10 hover:text-white' : 'bg-[#0A1F44]/5 text-[#0A1F44]/20 hover:text-[#0A1F44]'}`}>
                       <Share2 size={10} className="md:w-[20px] md:h-[20px]" />
                    </button>
                    <button className={`px-3 md:px-6 py-1 pr-2 rounded-lg md:rounded-2xl transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 ${isDark ? 'bg-[#eb483f]/10 text-[#eb483f] border border-[#eb483f]/10' : 'bg-[#0284c7] text-white shadow-sm'}`}>
                       Log <ArrowRight size={10} className="md:w-[16px] md:h-[16px]" />
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
                    <Trophy className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Launch
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
                      className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#eb483f]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#eb483f] text-[#0A1F44]'}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="group">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Prize Pool</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#eb483f]">₹</span>
                        <input 
                          type="text" 
                          placeholder="50K"
                          className={`w-full py-3 md:py-4 pl-8 md:pl-10 pr-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#eb483f]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#eb483f] text-[#0A1F44]'}`}
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Venue</label>
                      <select className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#eb483f]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#eb483f] text-[#0A1F44]'}`}>
                        <option>Olympic</option>
                        <option>Hub</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl border border-dashed flex items-center gap-3 md:gap-4 ${isDark ? 'bg-[#eb483f]/5 border-[#eb483f]/20' : 'bg-[#eb483f]/5 border-[#eb483f]/30'}`}>
                   <ShieldCheck className="text-[#eb483f] md:w-[24px] md:h-[24px]" size={20} />
                   <div className="flex-1">
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#eb483f]">Verification</p>
                      <p className="text-[10px] md:text-xs font-bold mt-0.5 opacity-40">Digital ID required</p>
                   </div>
                   <div className="w-8 h-5 md:w-10 md:h-6 bg-[#eb483f] rounded-full relative shadow-lg shadow-[#eb483f]/20">
                      <div className="absolute right-1 top-1 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full" />
                   </div>
                </div>
                <button 
                  onClick={() => setShowNewEventModal(false)}
                  className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-[#eb483f] text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white hover:text-[#eb483f] hover:scale-[1.01] transition-all shadow-xl md:shadow-2xl shadow-[#eb483f]/40 flex items-center justify-center gap-2"
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


