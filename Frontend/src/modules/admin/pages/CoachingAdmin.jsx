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
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <GraduationCap className="text-[#FFD600]" /> Academy Hub
          </h2>
          <p className={`text-sm mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Manage coaching batches, academy subscriptions, and trainers.</p>
        </div>
        <div className="flex gap-2">
          <button className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-[#0A1F44]/50 border-white/5 text-white/40 hover:text-white' : 'bg-white border-black/10 text-black/40 hover:text-black'}`}>
            <Mail size={18} />
          </button>
          <button 
            onClick={() => setShowNewBatchModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#22FF88]/20"
          >
            <Plus size={16} /> New Batch
          </button>
        </div>
      </div>

      {/* View Switcher omitted for clarity but remains same logic */}
      <div className={`flex gap-1 p-1 rounded-2xl w-fit border ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
        <button
          onClick={() => setView('batches')}
          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'batches' ? 'bg-[#22FF88] text-[#0A1F44] shadow-lg' : isDark ? 'text-white/40 hover:text-white' : 'text-[#0A1F44]/40 hover:text-[#0A1F44]'}`}
        >
          Batches
        </button>
        <button
          onClick={() => setView('coaches')}
          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'coaches' ? 'bg-[#22FF88] text-[#0A1F44] shadow-lg' : isDark ? 'text-white/40 hover:text-white' : 'text-[#0A1F44]/40 hover:text-[#0A1F44]'}`}
        >
          Coaches
        </button>
      </div>

      {view === 'batches' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BATCHES.map((batch, idx) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-3xl border group hover:border-[#22FF88]/30 transition-all ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isDark ? 'bg-white/5 border-white/10 text-[#FFD600]' : 'bg-[#FFD600]/10 border-[#FFD600]/20 text-[#d97706]'}`}>
                  <Zap size={24} />
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${batch.enrolled >= batch.capacity ? 'bg-[#FF4B4B]/10 text-[#FF4B4B]' : 'bg-[#22FF88]/10 text-[#22FF88]'}`}>
                  {batch.enrolled}/{batch.capacity} Filled
                </span>
              </div>
              <h3 className={`text-xl font-black font-display tracking-tight mb-1 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{batch.name}</h3>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users size={12} className="text-[#1EE7FF]" /> Led by {batch.coach}
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/30 font-bold uppercase tracking-widest">Frequency</span>
                  <span className={`font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{batch.frequency}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/30 font-bold uppercase tracking-widest">Time Slot</span>
                  <span className="text-[#FFD600] font-black">{batch.time}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/30 font-bold uppercase tracking-widest">Location</span>
                  <span className={`font-black truncate max-w-[120px] ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{batch.arena}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-black/60 hover:bg-black/10'}`}>
                  Manage Roster
                </button>
                <button className={`w-12 h-10 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-[#1EE7FF]/10 text-[#1EE7FF] border border-[#1EE7FF]/20 hover:bg-[#1EE7FF] hover:text-[#0A1F44]' : 'bg-[#0284c7]/5 text-[#0284c7] border border-[#0284c7]/10 hover:bg-[#0284c7] hover:text-white'}`}>
                  <Video size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {COACHES.map((coach, idx) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-3xl border flex items-center gap-4 group transition-all ${isDark ? 'bg-[#0A1F44]/50 border-white/5 hover:bg-[#0A1F44]' : 'bg-white border-[#0A1F44]/10 hover:shadow-lg'}`}
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/5 group-hover:border-[#22FF88]/50 transition-colors">
                <img src={coach.image} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{coach.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-[#FFD600]/10 text-[#FFD600] text-[9px] font-black uppercase flex items-center gap-1">
                    <Star size={8} fill="#FFD600" /> {coach.rating}
                  </span>
                </div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mt-0.5">{coach.role} • {coach.specialty}</p>
                <div className="mt-2 flex items-center gap-4">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-[#1EE7FF]">
                     <Users size={12} /> {coach.students} Enrolled
                   </div>
                </div>
              </div>
              <button className={`p-4 rounded-2xl transition-all ${isDark ? 'bg-white/5 text-white/40 hover:text-white hover:bg-[#22FF88]/20' : 'bg-black/5 text-black/40 hover:text-black hover:bg-[#22FF88]/20'}`}>
                <ChevronRight size={20} />
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
              className={`relative w-full max-w-lg rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10 text-white' : 'bg-white border-black/10 text-[#0A1F44]'} shadow-2xl shadow-black/50`}
            >
              <div className="p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <Zap className="text-[#22FF88]" /> Initialize Batch
                  </h3>
                  <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Configure academy program parameters</p>
                </div>
                <button 
                  onClick={() => setShowNewBatchModal(false)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Program Name</label>
                    <div className="relative">
                      <Zap size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-[#22FF88] group-focus-within:opacity-100 transition-all font-black text-[13px]" />
                      <input 
                        type="text" 
                        placeholder="e.g. Elite Morning Smash"
                        className={`w-full py-4 pl-12 pr-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Lead Coach</label>
                      <select className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}>
                        <option>Vikram Singh</option>
                        <option>Anjali Sharma</option>
                        <option>Siddharth Roy</option>
                      </select>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Cap (Students)</label>
                      <input 
                        type="number" 
                        defaultValue="15"
                        className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Frequency & Schedule</label>
                    <div className="flex gap-2">
                       {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                         <button key={idx} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${idx < 5 ? 'bg-[#22FF88]/20 text-[#22FF88] border border-[#22FF88]/30' : 'bg-white/5 text-white/20 border border-white/5'}`}>
                           {day}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
                   <div className="w-10 h-10 rounded-xl bg-[#1EE7FF]/10 flex items-center justify-center text-[#1EE7FF]">
                      <Clock size={18} />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none">Standard Slot</p>
                      <p className="text-xs font-bold mt-1 opacity-40 italic">06:00 AM - 08:30 AM</p>
                   </div>
                   <button className="text-[10px] font-black uppercase text-[#1EE7FF] hover:underline">Revise</button>
                </div>

                <button 
                  onClick={() => setShowNewBatchModal(false)}
                  className="w-full py-5 rounded-[1.5rem] bg-[#22FF88] text-[#0A1F44] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:scale-[1.02] transition-all shadow-2xl shadow-[#22FF88]/20 flex items-center justify-center gap-2"
                >
                  Confirm Registration <Plus size={16} />
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
