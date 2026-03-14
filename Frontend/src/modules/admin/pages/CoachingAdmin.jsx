import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Users, Search, Filter, Mail, Video, Zap, GraduationCap, ChevronRight, X, Calendar, Clock, MapPin } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const COACHES = [
  { id: 1, name: 'Vikram Singh', role: 'Head Coach', specialty: 'Elite Training', students: 48, rating: 4.9, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=150&auto=format&fit=crop' },
  { id: 2, name: 'Anjali Sharma', role: 'Senior Pro', specialty: 'Junior Academy', students: 32, rating: 4.8, image: 'https://images.unsplash.com/photo-1548690312-e3b507d17a12?q=80&w=150&auto=format&fit=crop' },
  { id: 3, name: 'Siddharth Roy', role: 'Trainer', specialty: 'Beginner Foundations', students: 25, rating: 4.7, image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop' },
];

const BATCHES = [
  { id: 'B-11', name: 'Elite Performance', coach: 'Vikram Singh', arena: 'Olympic Smash', frequency: 'Daily', time: '06:00 AM', enrolled: 12, capacity: 15 },
  { id: 'B-12', name: 'Morning Stars', coach: 'Anjali Sharma', arena: 'Badminton Hub', frequency: 'Mon-Wed-Fri', time: '07:30 AM', enrolled: 8, capacity: 10 },
  { id: 'B-13', name: 'Junior Pro', coach: 'Vikram Singh', arena: 'Badminton Hub', frequency: 'Sat-Sun', time: '04:00 PM', enrolled: 15, capacity: 15 },
];

const CoachingAdmin = () => {
  const { isDark } = useTheme();
  const [view, setView] = useState('batches'); // batches | coaches
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <GraduationCap className="text-[#FFD600] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Academy
          </h2>
          <p className={`text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Programs hub.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className={`p-2 rounded-lg md:rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-white border-black/10 text-black/40 shadow-sm'}`}>
            <Mail size={12} className="md:w-[18px] md:h-[18px]" />
          </button>
          <button 
            onClick={() => setShowNewBatchModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg md:shadow-xl shadow-[#22FF88]/20"
          >
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      <div className={`flex gap-1 p-1 rounded-lg md:rounded-2xl w-fit border ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/10'}`}>
        <button
          onClick={() => setView('batches')}
          className={`px-4 md:px-8 py-1.5 md:py-2.5 rounded-md md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${view === 'batches' ? 'bg-[#22FF88] text-[#0A1F44]' : isDark ? 'text-white/20' : 'text-[#0A1F44]/40'}`}
        >
          Units
        </button>
        <button
          onClick={() => setView('coaches')}
          className={`px-4 md:px-8 py-1.5 md:py-2.5 rounded-md md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${view === 'coaches' ? 'bg-[#22FF88] text-[#0A1F44]' : isDark ? 'text-white/20' : 'text-[#0A1F44]/40'}`}
        >
          Staff
        </button>
      </div>

      {view === 'batches' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {BATCHES.map((batch, idx) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-3 md:p-6 rounded-xl md:rounded-3xl border group transition-all ${isDark ? 'bg-[#0A1F44]/50 border-white/5 hover:border-[#22FF88]/30' : 'bg-white border-[#0A1F44]/10'}`}
            >
              <div className="flex justify-between items-start mb-2 md:mb-4">
                <div className={`w-7 h-7 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center border ${isDark ? 'bg-white/5 border-white/10 text-[#FFD600]' : 'bg-[#FFD600]/10 border-[#FFD600]/20 text-[#d97706]'}`}>
                  <Zap size={12} className="md:w-[20px] md:h-[20px]" />
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[7px] md:text-[9px] font-black uppercase tracking-widest ${batch.enrolled >= batch.capacity ? 'bg-[#FF4B4B]/10 text-[#FF4B4B]/60' : 'bg-[#22FF88]/10 text-[#22FF88]/60'}`}>
                  {batch.enrolled}/{batch.capacity} Load
                </span>
              </div>
              <h3 className={`text-sm md:text-xl font-black font-display tracking-tight mb-0.5 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{batch.name}</h3>
              <p className={`text-[8px] md:text-xs font-black uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-1.5 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/40'}`}>
                <Users size={10} className="text-[#1EE7FF] opacity-60" /> {batch.coach.split(' ')[0]}
              </p>
              
              <div className="space-y-1.5 md:space-y-3 mb-4 md:mb-6">
                <div className="flex justify-between items-center text-[8px] md:text-xs">
                   <span className={`font-black uppercase tracking-widest ${isDark ? 'text-white/10' : 'text-[#0A1F44]/20'}`}>Mode</span>
                  <span className={`font-black ${isDark ? 'text-white/40' : 'text-[#0A1F44]/60'}`}>{batch.frequency}</span>
                </div>
                <div className="flex justify-between items-center text-[8px] md:text-xs">
                   <span className={`font-black uppercase tracking-widest ${isDark ? 'text-white/10' : 'text-[#0A1F44]/20'}`}>Slot</span>
                  <span className="text-[#FFD600] font-black">{batch.time}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className={`flex-1 py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-white/40 hover:text-white' : 'bg-black/5 text-black/40 hover:text-black'}`}>
                  Roster
                </button>
                <button className={`w-9 md:w-12 h-8 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-[#1EE7FF]/10 text-[#1EE7FF] border border-[#1EE7FF]/20' : 'bg-[#0284c7]/5 text-[#0284c7] border border-[#0284c7]/10'}`}>
                  <Video size={14} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {COACHES.map((coach, idx) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-2 md:p-4 rounded-xl md:rounded-3xl border flex items-center gap-3 group transition-all ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10'}`}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-2xl overflow-hidden border border-white/5">
                <img src={coach.image} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`text-[10px] md:text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{coach.name}</h3>
                  <span className="px-1.5 py-0.5 rounded bg-[#FFD600]/10 text-[#FFD600] text-[7px] font-black uppercase flex items-center gap-0.5">
                    <Star size={6} fill="#FFD600" /> {coach.rating}
                  </span>
                </div>
                 <p className={`text-[7px] md:text-xs font-black uppercase tracking-widest mt-0.5 ${isDark ? 'text-white/20' : 'text-[#0A1F44]/40'}`}>{coach.role} • {coach.specialty}</p>
                <div className="mt-1 flex items-center gap-4">
                   <div className="flex items-center gap-1 text-[8px] font-black text-[#1EE7FF] opacity-60">
                     <Users size={10} /> {coach.students} LOAD
                   </div>
                </div>
              </div>
              <button className={`p-2.5 rounded-lg transition-all ${isDark ? 'bg-white/5 text-white/20 hover:text-white' : 'bg-black/5 text-black/20 hover:text-black'}`}>
                <ChevronRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Batch Modal */}
      <AnimatePresence>
        {showNewBatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewBatchModal(false)}
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
                    <Zap className="text-[#22FF88] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Create Batch
                  </h3>
                  <p className="text-[10px] md:text-xs font-bold opacity-30 uppercase tracking-widest mt-0.5 md:mt-1">Initialize academy program</p>
                </div>
                <button 
                  onClick={() => setShowNewBatchModal(false)}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}
                >
                  <X size={18} className="md:w-[20px] md:h-[20px]" />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="group">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Name</label>
                    <div className="relative">
                      <Zap size={12} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-[#22FF88] group-focus-within:opacity-100 transition-all" />
                      <input 
                        type="text" 
                        placeholder="e.g. Elite Performance"
                        className={`w-full py-3 md:py-4 pl-10 md:pl-12 pr-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}
                      />
                    </div>
                  </div>
 
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="group">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Coach</label>
                      <select className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}>
                        <option>Vikram</option>
                        <option>Anjali</option>
                        <option>Siddharth</option>
                      </select>
                    </div>
                    <div className="group">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Cap</label>
                      <input 
                        type="number" 
                        defaultValue="15"
                        className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}
                      />
                    </div>
                  </div>
 
                  <div className="group">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Frequency</label>
                    <div className="flex gap-1.5 md:gap-2">
                       {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                         <button key={idx} className={`w-7 h-7 md:w-8 md:h-8 rounded-lg text-[9px] md:text-[10px] font-black transition-all ${idx < 5 ? 'bg-[#22FF88]/20 text-[#22FF88] border border-[#22FF88]/30' : 'bg-white/5 text-white/20 border border-white/5'}`}>
                           {day}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
 
                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl border flex items-center gap-3 md:gap-4 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#1EE7FF]/10 flex items-center justify-center text-[#1EE7FF]">
                      <Clock size={16} className="md:w-[18px] md:h-[18px]" />
                   </div>
                   <div className="flex-1">
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none">Slot</p>
                      <p className="text-[11px] md:text-xs font-bold mt-1 opacity-40 italic">06:00 AM - 08:30 AM</p>
                   </div>
                   <button className="text-[9px] md:text-[10px] font-black uppercase text-[#1EE7FF] hover:underline">Edit</button>
                </div>
 
                <button 
                  onClick={() => setShowNewBatchModal(false)}
                  className="w-full py-4 md:py-5 rounded-xl md:rounded-[1.5rem] bg-[#22FF88] text-[#0A1F44] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white hover:scale-[1.01] transition-all shadow-xl md:shadow-2xl shadow-[#22FF88]/20 flex items-center justify-center gap-2"
                >
                  Deploy Batch <Plus size={14} className="md:w-[16px] md:h-[16px]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachingAdmin;
