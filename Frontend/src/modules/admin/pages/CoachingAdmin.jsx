import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Users, Search, Filter, Mail, Video, Zap, GraduationCap, ChevronRight, X, Calendar, Clock, MapPin, Edit3, CheckCircle2, Image as ImageIcon, Upload, Banknote } from 'lucide-react';

const COACHES_DATA = [
  { id: 1, name: 'Vikram Singh', role: 'Head Coach', specialty: 'Elite Training', students: 48, rating: 4.9, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=150&auto=format&fit=crop', plan: 'Elite Partner', court: 'Court 01 - Main Arena', timing: '06:00 AM - 12:00 PM' },
  { id: 2, name: 'Anjali Sharma', role: 'Senior Pro', specialty: 'Junior Academy', students: 32, rating: 4.8, image: 'https://images.unsplash.com/photo-1548690312-e3b507d17a12?q=80&w=150&auto=format&fit=crop', plan: 'Standard Trainer', court: 'Court 03 - Smash Zone', timing: '04:00 PM - 08:30 PM' },
  { id: 3, name: 'Siddharth Roy', role: 'Trainer', specialty: 'Beginner Foundations', students: 25, rating: 4.7, image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop', plan: 'Basic', court: 'Court 02 - Pro Arena', timing: '07:30 AM - 10:00 AM' },
];

const REQUESTED_COACHES = [
  { id: 4, name: 'Rahul Khanna', role: 'Applicant', specialty: 'Strength & Conditioning', dateApplied: '2 hours ago', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop', plan: 'Pending Approval', court: 'TBD', timing: 'TBD' },
];

const BATCHES_DATA = [
  { id: 'B-11', name: 'Elite Performance', coach: 'Vikram Singh', arena: 'Olympic Smash', frequency: 'Daily', time: '06:00 AM', enrolled: 12, capacity: 15, fee: 3500 },
  { id: 'B-12', name: 'Morning Stars', coach: 'Anjali Sharma', arena: 'Badminton Hub', frequency: 'Mon-Wed-Fri', time: '07:30 AM', enrolled: 8, capacity: 10, fee: 2800 },
  { id: 'B-13', name: 'Junior Pro', coach: 'Vikram Singh', arena: 'Badminton Hub', frequency: 'Sat-Sun', time: '04:00 PM', enrolled: 15, capacity: 15, fee: 2200 },
];

const CoachingAdmin = () => {
  const [view, setView] = useState('batches'); // batches | coaches
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [batches, setBatches] = useState(BATCHES_DATA);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [coaches, setCoaches] = useState(COACHES_DATA);
  const [requestedCoaches, setRequestedCoaches] = useState(REQUESTED_COACHES);
  const [selectedImage, setSelectedImage] = useState(null);
  const [toast, setToast] = useState(null);
  const [viewingCoachDetails, setViewingCoachDetails] = useState(null);

  // Form refs
  const nameRef = useRef();
  const roleRef = useRef();
  const specialtyRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCoach = () => {
    const name = nameRef.current.value;
    const role = roleRef.current.value;
    const specialty = specialtyRef.current.value;

    if (!name || !role) return;

    if (editingCoach) {
      // Update
      setCoaches(prev => prev.map(c => c.id === editingCoach.id ? {
        ...c,
        name,
        role,
        specialty,
        image: selectedImage || c.image
      } : c));
      setToast('Coach updated successfully!');
    } else {
      // Add New
      const newCoach = {
        id: Date.now(),
        name,
        role,
        specialty,
        image: selectedImage || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=150&auto=format&fit=crop',
        students: 0,
        rating: 5.0
      };
      setCoaches(prev => [newCoach, ...prev]);
      setToast('Coach added successfully!');
    }

    setTimeout(() => setToast(null), 3000);
    setShowCoachModal(false);
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setShowNewBatchModal(true);
  };

  const handleNewBatch = () => {
    setEditingBatch(null);
    setShowNewBatchModal(true);
  };

  const handleEditCoach = (coach) => {
    setEditingCoach(coach);
    setSelectedImage(coach.image);
    setShowCoachModal(true);
  };

  const handleAddCoach = () => {
    setEditingCoach(null);
    setSelectedImage(null);
    setShowCoachModal(true);
  };

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[1000] px-6 py-3 rounded-2xl bg-[#1a2b3c] text-white text-[13px] font-bold shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
               <CheckCircle2 size={14} />
            </div>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
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
          <button 
            onClick={view === 'batches' ? handleNewBatch : handleAddCoach}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 md:px-6 py-2 md:py-3 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-[11px] md:text-[13px] font-bold uppercase tracking-widest shadow-sm shadow-[#eb483f]/20"
          >
            <Plus size={16} strokeWidth={3} /> {view === 'batches' ? 'New Program' : 'Add Coach'}
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
          {batches.map((batch, idx) => (
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
                     <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${batch.enrolled >= batch.capacity ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-slate-50 border border-slate-100 text-slate-500'}`}>
                           {batch.enrolled}/{batch.capacity} Load
                        </span>
                        <p className="text-[12px] font-black text-[#1a2b3c]">₹{batch.fee}</p>
                     </div>
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
                  <button 
                    onClick={() => handleEditBatch(batch)}
                    className="w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all bg-[#1a2b3c] border border-[#1a2b3c] text-white hover:bg-white hover:text-[#1a2b3c] shadow-sm"
                  >
                    Manage Unit
                  </button>
                </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {/* Currently Active coaches */}
          <div>
            <div className="flex items-center gap-4 mb-8">
               <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm animate-pulse-subtle">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Active System</span>
               </div>
               <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
               <h3 className="text-[16px] md:text-[18px] font-black text-[#1a2b3c] tracking-tight">Currently Active Coaches</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 content-start items-stretch">
              {coaches.map((coach, idx) => (
                <motion.div
                  layout
                  key={coach.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setViewingCoachDetails(coach)}
                  className="p-4 md:p-5 rounded-xl border border-slate-100 shadow-sm bg-white hover:border-[#eb483f]/60 hover:shadow-md flex items-center gap-4 transition-all group overflow-hidden cursor-pointer"
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
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEditCoach(coach); }}
                      className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-all bg-[#eb483f]/5 text-[#eb483f] border border-[#eb483f]/20 hover:bg-[#eb483f] hover:text-white group-hover:shadow-sm"
                    >
                      <Edit3 size={16} strokeWidth={2.5} />
                    </button>
                    <button className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-all bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100">
                      <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Requested coaches */}
          <div>
            <div className="flex items-center gap-4 mb-8">
               <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                  <Plus size={14} strokeWidth={3} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Incoming Requests</span>
               </div>
               <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
               <h3 className="text-[16px] md:text-[18px] font-black text-[#192b3c] tracking-tight">Requested Coaches</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 content-start items-stretch opacity-80">
              {requestedCoaches.map((coach, idx) => (
                <motion.div
                  layout
                  key={coach.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setViewingCoachDetails(coach)}
                  className="p-4 md:p-5 rounded-xl border border-slate-100 shadow-sm bg-slate-50/50 hover:border-slate-300 hover:shadow-md flex items-center gap-4 transition-all group overflow-hidden cursor-pointer grayscale hover:grayscale-0"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border border-slate-100 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                    <img src={coach.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-[14px] md:text-[15px] font-extrabold tracking-tight text-[#1a2b3c] truncate pr-2">{coach.name}</h3>
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-600 text-[8px] font-black uppercase tracking-widest shrink-0">
                        New
                      </span>
                    </div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate tracking-tight">Applied {coach.dateApplied}</p>
                     <div className="mt-2.5 flex gap-2">
                        <button className="flex-1 h-8 rounded-lg bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors">Approve</button>
                        <button className="flex-1 h-8 rounded-lg bg-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:bg-slate-300 transition-colors">Decline</button>
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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
                    <Zap className="text-[#eb483f]" size={22} strokeWidth={3} /> {editingBatch ? 'Edit Unit' : 'Create Unit'}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{editingBatch ? 'Update academy program details' : 'Initialize academy program'}</p>
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
                        defaultValue={editingBatch?.name || ''}
                        placeholder="e.g. Elite Performance"
                        className="w-full py-3 md:py-4 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] placeholder:text-slate-400"
                      />
                    </div>
                  </div>
 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Choose Coach</label>
                      <select 
                        defaultValue={editingBatch?.coach || ''}
                        className="w-full py-3 md:py-4 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]"
                      >
                         <option value="" disabled>Select Coach</option>
                         {coaches.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                         ))}
                      </select>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Capacity (PPL)</label>
                      <input 
                        type="number" 
                        defaultValue={editingBatch?.capacity || "15"}
                        className="w-full py-3 md:py-4 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]"
                      />
                    </div>
                  </div>

                  <div className="group">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Monthly Fee (₹)</label>
                     <div className="relative">
                        <Banknote size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#eb483f] transition-all" strokeWidth={2.5} />
                        <input 
                           type="number" 
                           defaultValue={editingBatch?.fee || ''}
                           placeholder="e.g. 2500"
                           className="w-full py-3 md:py-4 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] placeholder:text-slate-400"
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
                  {editingBatch ? 'Save Changes' : 'Deploy Batch'} <Plus size={16} strokeWidth={3} className={editingBatch ? 'hidden' : ''} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Coach Modal */}
      <AnimatePresence>
        {showCoachModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCoachModal(false)}
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
                    <Users className="text-[#eb483f]" size={22} strokeWidth={3} /> {editingCoach ? 'Edit Coach' : 'Add Coach'}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Manage coaching staff details</p>
                </div>
                <button 
                  onClick={() => setShowCoachModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-200 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 shadow-sm"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-5 md:p-6 space-y-5">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Name</label>
                    <input 
                      ref={nameRef}
                      type="text" 
                      defaultValue={editingCoach?.name || ''}
                      placeholder="e.g. Vikram Singh"
                      className="w-full py-3 md:py-4 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] placeholder:text-slate-400"
                    />
                  </div>
  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Role</label>
                      <input 
                        ref={roleRef}
                        type="text" 
                        defaultValue={editingCoach?.role || ''}
                        placeholder="e.g. Head Coach"
                        className="w-full py-3 md:py-4 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] placeholder:text-slate-400"
                      />
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Specialty</label>
                      <input 
                        ref={specialtyRef}
                        type="text" 
                        defaultValue={editingCoach?.specialty || ''}
                        placeholder="e.g. Elite Training"
                        className="w-full py-3 md:py-4 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c] placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Coach Profile Picture</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        id="coach-image-upload"
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <label 
                        htmlFor="coach-image-upload"
                        className={`w-full h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-[#eb483f] group-hover:bg-white overflow-hidden ${selectedImage ? 'border-none' : ''}`}
                      >
                        {selectedImage ? (
                          <div className="relative w-full h-full group/preview">
                            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                               <p className="text-white text-[10px] font-black uppercase tracking-widest">Change Image</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 mb-2 group-hover:text-[#eb483f] transition-colors">
                              <ImageIcon size={20} />
                            </div>
                            <p className="text-[11px] font-bold text-slate-500">Tap to upload from Gallery</p>
                            <p className="text-[9px] font-medium text-slate-400 mt-0.5">JPG, PNG up to 5MB</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSaveCoach}
                  className="w-full py-4 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white text-[13px] font-bold uppercase tracking-widest hover:shadow-[#eb483f]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {editingCoach ? 'Update details' : 'Add Coach'} <CheckCircle2 size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Coach Details View Modal */}
      <AnimatePresence>
        {viewingCoachDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingCoachDetails(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-xl rounded-[40px] bg-white text-[#1a2b3c] shadow-2xl overflow-hidden"
            >
              {/* Profile Header */}
              <div className="h-48 bg-gradient-to-br from-[#eb483f] to-[#ff6b6b] relative">
                 <button 
                  onClick={() => setViewingCoachDetails(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-[#eb483f] transition-all border border-white/20"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="px-8 pb-10">
                <div className="-mt-16 flex items-end gap-6 mb-8 relative z-10">
                  <div className="w-32 h-32 rounded-[32px] overflow-hidden border-8 border-white shadow-xl">
                    <img src={viewingCoachDetails.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="pb-2">
                    <h2 className="text-3xl font-black tracking-tight">{viewingCoachDetails.name}</h2>
                    <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#eb483f]">{viewingCoachDetails.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Billing Plan</p>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                            <Zap size={18} fill="currentColor" />
                         </div>
                         <p className="font-extrabold text-[15px]">{viewingCoachDetails.plan}</p>
                      </div>
                   </div>
                   <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Rating</p>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                            <Star size={18} fill="currentColor" />
                         </div>
                         <p className="font-extrabold text-[15px]">{viewingCoachDetails.rating} / 5.0</p>
                      </div>
                   </div>
                </div>

                <div className="mt-4 space-y-4">
                   <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <MapPin size={22} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Court</p>
                            <p className="font-black text-[16px]">{viewingCoachDetails.court}</p>
                         </div>
                      </div>
                   </div>

                   <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                            <Clock size={22} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Slot</p>
                            <p className="font-black text-[16px]">{viewingCoachDetails.timing}</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-8 flex gap-3">
                   <button className="flex-1 py-4 rounded-2xl bg-[#eb483f] text-white text-[12px] font-black uppercase tracking-widest hover:shadow-lg transition-all">Send Message</button>
                   <button className="flex-1 py-4 rounded-2xl bg-[#1a2b3c] text-white text-[12px] font-black uppercase tracking-widest hover:shadow-lg transition-all">View Analytics</button>
                </div>
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
