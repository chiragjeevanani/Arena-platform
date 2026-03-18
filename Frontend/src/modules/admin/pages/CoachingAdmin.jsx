import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Users, Search, Filter, Mail, Video, Zap, GraduationCap, ChevronRight, X, Calendar, Clock, MapPin } from 'lucide-react';

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
  const [view, setView] = useState('batches'); // batches | coaches
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 md:pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 text-[#1a2b3c]">
            <GraduationCap className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" strokeWidth={2.5} /> 
            Academy Programs
          </h2>
          <p className="text-[10px] md:text-sm mt-0.5 md:mt-1 font-bold text-slate-500">
            Manage batches, schedules, and coaching staff.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="p-2 md:p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:text-[#eb483f] text-slate-400 transition-all shadow-sm">
            <Mail size={16} strokeWidth={2.5} className="md:w-[20px] md:h-[20px]" />
          </button>
          <button 
            onClick={() => setShowNewBatchModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 md:px-6 py-2 md:py-3 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-[11px] md:text-[13px] font-bold uppercase tracking-widest shadow-sm shadow-[#eb483f]/20"
          >
            <Plus size={16} strokeWidth={3} /> New Program
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide w-full md:w-auto mb-4 border-b border-slate-100">
        <button
          onClick={() => setView('batches')}
          className={`whitespace-nowrap px-6 py-2.5 rounded-t-lg text-[13px] font-bold transition-all border-b-2 ${
            view === 'batches' 
              ? 'border-[#eb483f] text-[#eb483f] bg-[#eb483f]/5' 
              : 'border-transparent text-slate-500 hover:text-[#1a2b3c] hover:bg-slate-50'
          }`}
        >
          Active Units
        </button>
        <button
          onClick={() => setView('coaches')}
          className={`whitespace-nowrap px-6 py-2.5 rounded-t-lg text-[13px] font-bold transition-all border-b-2 ${
            view === 'coaches' 
              ? 'border-[#eb483f] text-[#eb483f] bg-[#eb483f]/5' 
              : 'border-transparent text-slate-500 hover:text-[#1a2b3c] hover:bg-slate-50'
          }`}
        >
          Coaching Staff
        </button>
      </div>

      {/* Content */}
      <div className="pt-2">
      {view === 'batches' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch content-start">
          {BATCHES.map((batch, idx) => (
            <motion.div
              layout
              key={batch.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 md:p-5 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-[#eb483f]/50 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group overflow-hidden"
            >
                <div>
                  <div className="flex justify-between items-start mb-3">
                     <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#eb483f]/5 border border-[#eb483f]/10 text-[#eb483f] group-hover:scale-105 transition-transform">
                        <Zap size={14} strokeWidth={2.5} />
                     </div>
                     <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${batch.enrolled >= batch.capacity ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-slate-50 border border-slate-100 text-slate-500'}`}>
                        {batch.enrolled}/{batch.capacity} Load
                     </span>
                  </div>
                  <h3 className="font-extrabold text-[#1a2b3c] text-[15px] leading-tight mb-0.5 group-hover:text-[#eb483f] transition-colors">{batch.name}</h3>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5 text-slate-400">
                    <Users size={12} className="text-[#eb483f]" /> {batch.coach}
                  </p>
                </div>
                
                <div className="w-full h-[1px] bg-slate-100 mb-3" />

                <div className="space-y-2 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center text-[11px]">
                     <span className="font-bold text-slate-400 uppercase tracking-widest">Mode</span>
                     <span className="font-black text-[#1a2b3c]">{batch.frequency}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                     <span className="font-bold text-slate-400 uppercase tracking-widest">Slot</span>
                     <span className="font-black text-[#eb483f]">{batch.time}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto pt-2">
                  <button className="flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all bg-[#1a2b3c] border border-[#1a2b3c] text-white hover:bg-white hover:text-[#1a2b3c] shadow-sm">
                    Roster
                  </button>
                  <button className="w-12 h-[44px] rounded-xl flex items-center justify-center transition-all bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-600 hover:text-white hover:border-sky-600 shadow-sm">
                    <Video size={16} strokeWidth={2.5} />
                  </button>
                </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 content-start items-stretch">
          {COACHES.map((coach, idx) => (
            <motion.div
              layout
              key={coach.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 md:p-5 rounded-xl border border-slate-100 shadow-sm bg-white hover:border-[#eb483f]/60 hover:shadow-md flex items-center gap-4 transition-all group overflow-hidden"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border border-slate-100 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <img src={coach.image} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-[14px] md:text-[15px] font-extrabold tracking-tight text-[#1a2b3c] truncate pr-2">{coach.name}</h3>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#eb483f]/10 border border-[#eb483f]/10 text-[#eb483f] text-[9px] font-bold uppercase flex items-center gap-0.5 shrink-0">
                    <Star size={10} fill="#eb483f" /> {coach.rating}
                  </span>
                </div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate tracking-tight">{coach.role} • {coach.specialty}</p>
                 <div className="mt-2.5 flex items-center justify-between">
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-[#eb483f] uppercase tracking-widest">
                     <Users size={12} strokeWidth={3} /> {coach.students} LOAD
                   </div>
                 </div>
              </div>
              <button className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-all bg-slate-50 text-slate-400 border border-slate-200 hover:bg-[#eb483f] hover:border-[#eb483f] hover:text-white group-hover:shadow-sm">
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
      </div>

      {/* New Batch Modal */}
      <AnimatePresence>
        {showNewBatchModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewBatchModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border-2 border-slate-200 bg-white text-[#1a2b3c] shadow-2xl overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-3xl">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2">
                    <Zap className="text-[#eb483f]" size={22} strokeWidth={3} /> Create Unit
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Initialize academy program</p>
                </div>
                <button 
                  onClick={() => setShowNewBatchModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-200 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 shadow-sm"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-5 md:p-6 space-y-5">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Name</label>
                    <div className="relative">
                      <Zap size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#eb483f] transition-all" strokeWidth={2.5} />
                      <input 
                        type="text" 
                        placeholder="e.g. Elite Performance"
                        className="w-full py-3 md:py-4 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] placeholder:text-slate-400"
                      />
                    </div>
                  </div>
 
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Coach</label>
                      <select className="w-full py-3 md:py-4 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]">
                        <option>Vikram</option>
                        <option>Anjali</option>
                        <option>Siddharth</option>
                      </select>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Cap</label>
                      <input 
                        type="number" 
                        defaultValue="15"
                        className="w-full py-3 md:py-4 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]"
                      />
                    </div>
                  </div>
 
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Frequency</label>
                    <div className="flex gap-2">
                       {['M', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, idx) => (
                         <button key={idx} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all border-2 ${idx < 5 ? 'bg-[#eb483f]/5 text-[#eb483f] border-[#eb483f]/20' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}>
                           {day}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
 
                <div className="p-4 rounded-xl border-2 border-slate-100 bg-slate-50 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#eb483f]">
                      <Clock size={18} strokeWidth={2.5} />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Time Slot</p>
                      <p className="text-[13px] font-extrabold text-[#1a2b3c]">06:00 AM - 08:30 AM</p>
                   </div>
                   <button className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-[#eb483f] shadow-sm hover:border-[#eb483f] transition-colors">Edit</button>
                </div>
 
                <button 
                  onClick={() => setShowNewBatchModal(false)}
                  className="w-full py-4 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white text-[13px] font-bold uppercase tracking-widest hover:shadow-[#eb483f]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  Deploy Batch <Plus size={16} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default CoachingAdmin;
