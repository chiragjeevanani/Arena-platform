import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Users, Search, Filter, Mail, Video, Zap, GraduationCap, ChevronRight, X, Calendar, Clock, MapPin, Edit3, CheckCircle2, Image as ImageIcon, Upload, Banknote, Trash2, Fingerprint, History, Settings, Award } from 'lucide-react';

const COACHES_DATA = [
  { id: 1, name: 'Vikram Singh', role: 'Head Coach', specialty: 'Elite Training', students: 48, rating: 4.9, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=150&auto=format&fit=crop', plan: 'Elite Partner', court: 'Court 01 - Main Arena', timing: '06:00 AM - 12:00 PM', salary: 45000, experience: '8 Years', status: 'Active', reviews: [{ user: 'Rahul A.', rating: 5, comment: 'Excellent technical skills.', date: '2 days ago' }] },
  { id: 2, name: 'Anjali Sharma', role: 'Senior Pro', specialty: 'Junior Academy', students: 32, rating: 4.8, image: 'https://images.unsplash.com/photo-1548690312-e3b507d17a12?q=80&w=150&auto=format&fit=crop', plan: 'Standard Trainer', court: 'Court 03 - Smash Zone', timing: '04:00 PM - 08:30 PM', salary: 32000, experience: '5 Years', status: 'Active', reviews: [] },
  { id: 3, name: 'Siddharth Roy', role: 'Trainer', specialty: 'Beginner Foundations', students: 25, rating: 4.7, image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop', plan: 'Basic', court: 'Court 02 - Pro Arena', timing: '07:30 AM - 10:00 AM', salary: 18000, experience: '2 Years', status: 'Inactive', reviews: [] },
];

const REQUESTED_COACHES = [
  { id: 4, name: 'Rahul Khanna', role: 'Applicant', specialty: 'Strength & Conditioning', dateApplied: '2 hours ago', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop', plan: 'Pending Approval', court: 'TBD', timing: 'TBD', salary: 25000, experience: '4 Years', status: 'Inactive' },
];

const ATTENDANCE_DATA = [
  { id: 1, coachName: 'Vikram Singh', checkIn: '05:55 AM', checkOut: '01:15 PM', date: 'Today', status: 'On-time' },
  { id: 2, coachName: 'Anjali Sharma', checkIn: '03:50 PM', checkOut: 'Pending', date: 'Today', status: 'On-time' },
];

const COACHING_TYPES = [
  { id: 1, name: 'Weekday', description: 'Regular mon-fri training sessions', status: 'Active' },
  { id: 2, name: 'Weekend Morning', description: 'Intensive weekend early sessions', status: 'Active' },
  { id: 3, name: 'Weekend Evening', description: 'Advanced evening drills', status: 'Active' },
  { id: 4, name: 'Special Coaching (Single)', description: 'One-on-one focused sessions', status: 'Active' },
  { id: 5, name: 'Special Coaching (Double)', description: 'Pair training drills', status: 'Active' },
  { id: 6, name: 'Group Coaching', description: 'Large group recreational sessions', status: 'Active' },
];

const PRICING_SLABS = [
  { id: 1, typeId: 1, price: 3500, duration: 'Monthly', status: 'Active' },
  { id: 2, typeId: 4, price: 500, duration: 'Per Session', status: 'Active' },
  { id: 3, typeId: 6, price: 2000, duration: 'Monthly', status: 'Active' },
];

const BATCHES_DATA = [
  { id: 'B-11', name: 'Elite Performance', coach: 'Vikram Singh', arena: 'Olympic Smash', frequency: 'Daily', time: '06:00 AM', enrolled: 12, capacity: 15, fee: 3500 },
  { id: 'B-12', name: 'Morning Stars', coach: 'Anjali Sharma', arena: 'Badminton Hub', frequency: 'Mon-Wed-Fri', time: '07:30 AM', enrolled: 8, capacity: 10, fee: 2800 },
  { id: 'B-13', name: 'Junior Pro', coach: 'Vikram Singh', arena: 'Badminton Hub', frequency: 'Sat-Sun', time: '04:00 PM', enrolled: 15, capacity: 15, fee: 2200 },
];

const CoachingAdmin = () => {
  const [view, setView] = useState('batches'); // batches | coaches | attendance | programs
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [batches, setBatches] = useState(BATCHES_DATA);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [coaches, setCoaches] = useState(COACHES_DATA);
  const [requestedCoaches, setRequestedCoaches] = useState(REQUESTED_COACHES);
  const [attendance, setAttendance] = useState(ATTENDANCE_DATA);
  const [coachingTypes, setCoachingTypes] = useState(COACHING_TYPES);
  const [pricingSlabs, setPricingSlabs] = useState(PRICING_SLABS);
  const [selectedImage, setSelectedImage] = useState(null);
  const [toast, setToast] = useState(null);
  const [viewingCoachDetails, setViewingCoachDetails] = useState(null);

  // Form refs
  const nameRef = useRef();
  const roleRef = useRef();
  const specialtyRef = useRef();
  const salaryRef = useRef();
  const experienceRef = useRef();
  const statusRef = useRef();

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
    const salary = salaryRef.current.value;
    const experience = experienceRef.current.value;
    const status = statusRef.current.value;

    if (!name || !role) return;

    if (editingCoach) {
      setCoaches(prev => prev.map(c => c.id === editingCoach.id ? {
        ...c,
        name,
        role,
        specialty,
        salary: Number(salary),
        experience,
        status,
        image: selectedImage || c.image
      } : c));
      setToast('Coach updated successfully!');
    } else {
      const newCoach = {
        id: Date.now(),
        name,
        role,
        specialty,
        salary: Number(salary),
        experience,
        status,
        image: selectedImage || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=150&auto=format&fit=crop',
        students: 0,
        rating: 5.0,
        reviews: []
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
              Academy Coaching
            </h2>
            <p className="text-[10px] md:text-sm mt-0.5 md:mt-1 font-bold text-slate-500">
              Manage batches, schedules, and coaching staff portfolio.
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
          {[
            { id: 'batches', label: 'Active Units' },
            { id: 'coaches', label: 'Coaching Staff' },
            { id: 'attendance', label: 'Attendance' },
            { id: 'programs', label: 'Programs & Pricing' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-t-lg text-[13px] font-bold transition-all border-b-2 ${
                view === tab.id 
                  ? 'border-[#eb483f] text-[#eb483f] bg-[#eb483f]/5' 
                  : 'border-transparent text-slate-500 hover:text-[#1a2b3c] hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="pt-2">
          {view === 'batches' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch content-start">
              {batches.map((batch, idx) => (
                <motion.div
                  layout
                  key={batch.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
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
                    <button 
                      onClick={() => handleEditBatch(batch)}
                      className="w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all bg-[#1a2b3c] border border-[#1a2b3c] text-white hover:bg-white hover:text-[#1a2b3c] shadow-sm"
                    >
                      Manage Unit
                    </button>
                </motion.div>
              ))}
            </div>
          )}

          {view === 'coaches' && (
            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-4 mb-8">
                   <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Active System</span>
                   </div>
                   <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                   <h3 className="text-[16px] md:text-[18px] font-black text-[#1a2b3c] tracking-tight">Coaching Staff</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {coaches.map((coach, idx) => (
                    <motion.div
                      layout
                      key={coach.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setViewingCoachDetails(coach)}
                      className="p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm bg-white hover:border-[#eb483f]/40 hover:shadow-md flex items-center gap-4 transition-all group cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                        <img src={coach.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="text-[15px] font-extrabold text-[#1a2b3c] truncate pr-2">{coach.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${coach.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                              {coach.status}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-[#eb483f]/10 text-[#eb483f] text-[9px] font-bold flex items-center gap-0.5">
                              <Star size={10} fill="#eb483f" /> {coach.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">{coach.role} • {coach.specialty}</p>
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-[#eb483f] uppercase tracking-widest">
                            <Users size={12} strokeWidth={3} /> {coach.students} LOAD
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{coach.experience} Exp.</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditCoach(coach); }}
                          className="p-2 rounded-lg bg-[#eb483f]/5 text-[#eb483f] hover:bg-[#eb483f] hover:text-white transition-all"
                        >
                          <Edit3 size={14} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if(window.confirm('Delete this coach?')) setCoaches(prev => prev.filter(c => c.id !== coach.id));
                          }}
                          className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'attendance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <div className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm text-center space-y-4">
                    <div 
                      onClick={() => {
                        const newLog = { id: Date.now(), coachName: 'Vikram Singh', checkIn: '05:55 AM', checkOut: '01:15 PM', date: 'Today', status: 'On-time' };
                        setAttendance(prev => [newLog, ...prev]);
                        setToast('Attendance marked successfully!');
                        setTimeout(() => setToast(null), 3000);
                      }}
                      className="w-20 h-20 rounded-3xl bg-[#eb483f]/5 border border-[#eb483f]/10 text-[#eb483f] flex items-center justify-center mx-auto transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-inner"
                    >
                      <Fingerprint size={40} strokeWidth={1.5} />
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-[#1a2b3c]">Check-in Console</h3>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tap fingerprint to log presence</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-[32px] bg-[#1a2b3c] text-white space-y-2 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                      <History size={120} strokeWidth={1} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">System Insight</p>
                    <h4 className="text-2xl font-black">98.5% Punctuality</h4>
                    <p className="text-[11px] font-medium opacity-60">High attendance reliability maintained this quarter.</p>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                       <h3 className="text-base font-black text-[#1a2b3c] flex items-center gap-2">
                         <History className="text-[#eb483f]" size={18} /> Attendance Logs
                       </h3>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50">
                              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Coach</th>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Check In</th>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Check Out</th>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {attendance.map(log => (
                              <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="text-[13px] font-black text-[#1a2b3c]">{log.coachName}</span>
                                </td>
                                <td className="px-6 py-4 text-[12px] font-bold text-slate-500">{log.checkIn}</td>
                                <td className="px-6 py-4 text-[12px] font-bold text-slate-500">{log.checkOut}</td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    {log.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                       </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'programs' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                   <h3 className="text-base font-black text-[#1a2b3c] flex items-center gap-2">
                     <Settings className="text-[#eb483f]" size={18} /> Program Tiers
                   </h3>
                </div>
                <div className="p-6 space-y-3">
                  {coachingTypes.map(type => (
                    <div key={type.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between items-center group hover:border-[#eb483f]/20 transition-all">
                       <div>
                         <h4 className="text-[14px] font-black text-[#1a2b3c]">{type.name}</h4>
                         <p className="text-[11px] font-medium text-slate-500">{type.description}</p>
                       </div>
                       <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
                         {type.status}
                       </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                   <h3 className="text-base font-black text-[#1a2b3c] flex items-center gap-2">
                     <Banknote className="text-[#eb483f]" size={18} /> Fee Structure
                   </h3>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full border-collapse">
                      <tbody className="divide-y divide-slate-50">
                        {pricingSlabs.map(slab => {
                          const type = coachingTypes.find(t => t.id === slab.typeId);
                          return (
                            <tr key={slab.id} className="hover:bg-slate-50/30 transition-colors">
                              <td className="px-6 py-5">
                                 <p className="text-[13px] font-black text-[#1a2b3c]">{type?.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{slab.duration}</p>
                              </td>
                              <td className="px-6 py-5 text-right">
                                 <div className="bg-[#eb483f]/5 border border-[#eb483f]/10 rounded-xl px-4 py-2 inline-block">
                                    <span className="text-[16px] font-black text-[#eb483f]">₹{slab.price}</span>
                                 </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                   </table>
                </div>
              </div>
            </div>
          )}
        </div>
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
              className="relative w-full max-w-lg rounded-3xl border-2 border-slate-200 bg-white shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Zap className="text-[#eb483f]" size={22} /> {editingBatch ? 'Modify Program' : 'Initialize Program'}
                </h3>
                <button onClick={() => setShowNewBatchModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="space-y-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Program Name</label>
                      <input type="text" defaultValue={editingBatch?.name || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#eb483f] outline-none text-[13px] font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Coach</label>
                         <select className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#eb483f] outline-none text-[13px] font-bold">
                            {coaches.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                         </select>
                       </div>
                       <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Capacity</label>
                         <input type="number" defaultValue="15" className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#eb483f] outline-none text-[13px] font-bold" />
                       </div>
                    </div>
                    <button 
                      onClick={() => setShowNewBatchModal(false)}
                      className="w-full py-4 rounded-xl bg-[#eb483f] text-white text-[13px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                    >
                      {editingBatch ? 'Save Changes' : 'Launch Program'}
                    </button>
                 </div>
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
              className="relative w-full max-w-lg rounded-[32px] border-2 border-slate-200 bg-white shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                 <h3 className="text-xl font-black flex items-center gap-2">
                   <Users className="text-[#eb483f]" size={22} /> {editingCoach ? 'Modify Profile' : 'Onboard Coach'}
                 </h3>
                 <button onClick={() => setShowCoachModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-5">
                 <div className="space-y-4">
                   <div className="group">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Full Name</label>
                     <input ref={nameRef} type="text" defaultValue={editingCoach?.name || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#eb483f] outline-none text-[13px] font-bold" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Role</label>
                        <input ref={roleRef} type="text" defaultValue={editingCoach?.role || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#eb483f] outline-none text-[13px] font-bold" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Specialty</label>
                        <input ref={specialtyRef} type="text" defaultValue={editingCoach?.specialty || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#eb483f] outline-none text-[13px] font-bold" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Monthly Salary (₹)</label>
                        <input ref={salaryRef} type="number" defaultValue={editingCoach?.salary || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#eb483f] outline-none text-[13px] font-bold" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Experience</label>
                        <input ref={experienceRef} type="text" defaultValue={editingCoach?.experience || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#eb483f] outline-none text-[13px] font-bold" />
                      </div>
                   </div>
                   <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Status</label>
                     <select ref={statusRef} defaultValue={editingCoach?.status || 'Active'} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#eb483f] outline-none text-[13px] font-bold">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                     </select>
                   </div>
                   <button 
                    onClick={handleSaveCoach}
                    className="w-full py-4 rounded-xl bg-[#eb483f] text-white text-[13px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                   >
                     {editingCoach ? 'Sync Profile' : 'Onboard Coach'}
                   </button>
                 </div>
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
              <div className="h-40 bg-gradient-to-br from-[#eb483f] to-[#ff6b6b] p-8 flex justify-end">
                 <button 
                  onClick={() => setViewingCoachDetails(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-[#eb483f] transition-all"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="px-8 pb-10">
                <div className="-mt-12 flex items-center gap-6 mb-8 relative z-10">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                    <img src={viewingCoachDetails.image} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{viewingCoachDetails.name}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#eb483f]">{viewingCoachDetails.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center"><Banknote size={18} /></div>
                      <div>
                        <p className="text-[14px] font-black">₹{viewingCoachDetails.salary || 'N/A'}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Monthly Salary</p>
                      </div>
                   </div>
                   <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center"><Award size={18} /></div>
                      <div>
                        <p className="text-[14px] font-black">{viewingCoachDetails.experience || 'NEW'}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Experience</p>
                      </div>
                   </div>
                </div>

                <div className="mt-6 space-y-4">
                   <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><Clock size={14} /> Assignment</h4>
                      <div className="flex justify-between items-center">
                         <div className="text-[12px] font-bold text-[#1a2b3c]">{viewingCoachDetails.timing}</div>
                         <div className="text-[12px] font-black text-[#eb483f]">{viewingCoachDetails.court}</div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Star size={14} /> Performance</h4>
                      {viewingCoachDetails.reviews?.map((r, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                           <div className="flex justify-between text-[11px] font-black mb-0.5">
                              <span>{r.user}</span>
                              <span className="text-[#eb483f]">{r.rating}★</span>
                           </div>
                           <p className="text-[10px] text-slate-500 font-medium">{r.comment}</p>
                        </div>
                      ))}
                      {!viewingCoachDetails.reviews?.length && <p className="text-[11px] text-center text-slate-400 font-bold uppercase tracking-widest py-4">No reviews yet</p>}
                   </div>
                </div>

                <button 
                  onClick={() => setViewingCoachDetails(null)}
                  className="w-full py-4 mt-8 rounded-2xl bg-[#1a2b3c] text-white text-[12px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                >
                  Close Portfolio
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
