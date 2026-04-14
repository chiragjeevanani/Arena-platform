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
  { id: 'B-11', name: 'Elite Performance', coach: 'Vikram Singh', arena: 'Olympic Smash', frequency: 'Daily', time: '06:00 AM', enrolled: 12, capacity: 15, fee: 30 },
  { id: 'B-12', name: 'Morning Stars', coach: 'Anjali Sharma', arena: 'Badminton Hub', frequency: 'Mon-Wed-Fri', time: '07:30 AM', enrolled: 8, capacity: 10, fee: 20 },
];

const STUDENT_DIRECTORY = [
  { id: 1, name: 'RIA G SEBASTIAN', parent: 'GINEETH SEBASTIAN', group: 2, type: 'WEEKDAYS 4DW / WEEK SIB', price: 25, slot: '7 PM - 8 PM', level: 'ADVANCED', phone: '98878936', status: 'PAID', date: '30-Mar-26', paid: 25, pending: 0 },
  { id: 2, name: 'IAN GEORGE', parent: 'SUDHIN GEORGE', group: 2, type: 'WEEKDAYS 4DW / WEEK SIB', price: 25, slot: '7 PM - 8 PM', level: 'ADVANCED', phone: '97756891', status: 'PAID', date: '30-Mar-26', paid: 25, pending: 0 },
  { id: 3, name: 'ATHARV PARSEKAR', parent: 'DUTTA PARSEKAR', group: 1, type: 'WEEKDAYS 4DW / WEEK', price: 30, slot: '7 PM - 8 PM', level: 'ADVANCED', phone: 'N/A', status: 'PAID', date: '30-Mar-26', paid: 30, pending: 0 },
  { id: 4, name: 'NAKSHATHRA', parent: 'N/A', group: 1, type: 'WEEKDAYS 4DW / WEEK', price: 30, slot: '7 PM - 8 PM', level: 'ADVANCED', phone: 'N/A', status: 'PARTLY PAID', date: '30-Mar-26', paid: 20, pending: 10 },
];

const OFFICIAL_PROGRAMS = {
  Weekdays: [
    { id: 1, title: 'WEEKDAYS 4DW / WEEK', fee: 30 },
    { id: 2, title: 'WEEKDAYS 4DW / WEEK SIB', fee: 25 },
    { id: 3, title: 'WEEKDAYS 3DW / WEEK', fee: 20 },
    { id: 4, title: 'WEEKDAYS 15 DAYS / MONTH', fee: 15 },
  ],
  Weekends: [
    { id: 5, title: 'WEEKEND SESSIONS', fee: 30 },
    { id: 6, title: 'WEEKEND SIBLING', fee: 25 },
  ],
  Special: [
    { id: 7, title: 'ADULT TRAINING', fee: 30 },
    { id: 8, title: 'SPECIAL SINGLE', fee: 7 },
    { id: 9, title: 'SPECIAL DOUBLE', fee: 5 },
    { id: 10, title: 'SPECIAL SIBLING', fee: 3 },
    { id: 11, title: 'SPECIAL MONTHLY', fee: 80 },
  ]
};

const BOOKINGS_DATA = [
  { id: 'BK-1001', customer: 'Amit Sharma', court: 'Court 1', arena: 'Amm Sports', date: '12-03-2026', time: '7:00 AM', amount: 4.5, status: 'Completed', payment: 'Paid' },
  { id: 'BK-1002', customer: 'Rajesh Kumar', court: 'Court 3', arena: 'Amm Sports', date: '12-03-2026', time: '9:00 AM', amount: 3.5, status: 'Upcoming', payment: 'Pending' },
  { id: 'BK-1003', customer: 'Sanya Mirza', court: 'Court 2', arena: 'Amm Sports', date: '12-03-2026', time: '4:00 PM', amount: 5, status: 'Upcoming', payment: 'Paid' },
  { id: 'BK-1004', customer: 'Vikram Singh', court: 'Court 1', arena: 'Amm Sports', date: '12-03-2026', time: '5:00 PM', amount: 4, status: 'Cancelled', payment: 'Refunded' },
  { id: 'BK-1005', customer: 'Neha Malik', court: 'Court 4', arena: 'Amm Sports', date: '13-03-2026', time: '6:00 AM', amount: 4.5, status: 'Upcoming', payment: 'Paid' },
];

const CoachingAdmin = () => {
  const [view, setView] = useState('students'); // students | batches | coaches | attendance | programs | bookings
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [batches, setBatches] = useState(BATCHES_DATA);
  const [students, setStudents] = useState(STUDENT_DIRECTORY);
  const [bookings, setBookings] = useState(BOOKINGS_DATA);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [coaches, setCoaches] = useState(COACHES_DATA);
  const [requestedCoaches, setRequestedCoaches] = useState(REQUESTED_COACHES);
  const [attendance, setAttendance] = useState(ATTENDANCE_DATA);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowStudentModal(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowStudentModal(true);
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      setToast('Student removed successfully');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const studentData = {
      id: editingStudent?.id || Date.now(),
      name: formData.get('name'),
      parent: formData.get('parent'),
      group: formData.get('group'),
      type: formData.get('type'),
      price: Number(formData.get('price')),
      slot: formData.get('slot'),
      level: formData.get('level'),
      phone: formData.get('phone'),
      status: formData.get('status'),
      date: formData.get('date'),
      paid: Number(formData.get('paid')),
      pending: Number(formData.get('pending')),
    };

    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? studentData : s));
      setToast('Student record updated');
    } else {
      setStudents(prev => [studentData, ...prev]);
      setToast('New student added successfully');
    }

    setShowStudentModal(false);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveBooking = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bookingData = {
      id: editingBooking?.id || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: formData.get('customer'),
      court: formData.get('court'),
      arena: formData.get('arena'),
      date: formData.get('date'),
      time: formData.get('time'),
      amount: Number(formData.get('amount')),
      status: formData.get('status'),
      payment: formData.get('payment'),
    };

    if (editingBooking) {
      setBookings(prev => prev.map(b => b.id === editingBooking.id ? bookingData : b));
      setToast('Booking record updated');
    } else {
      setBookings(prev => [bookingData, ...prev]);
      setToast('New booking added to registry');
    }

    setShowBookingModal(false);
    setTimeout(() => setToast(null), 3000);
  };

  // Searching logic
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.parent.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.coach.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCoaches = coaches.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(bk => 
    bk.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    bk.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 lg:p-8 font-display relative overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[1000] px-6 py-3 rounded-2xl bg-[#1e293b] text-white text-[13px] font-bold shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
               <CheckCircle2 size={14} />
            </div>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Decorative background element */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CE2029]/5 rounded-full blur-[120px] pointer-events-none" />

       <div className="max-w-[1600px] mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-[#1e293b] flex items-center gap-3">
              ACADEMY <span className="text-[#CE2029]">COMMAND</span>
            </h2>
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-400 mt-1">Unified Coaching & Student Management</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Universal Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-slate-100 text-xs font-bold w-64 focus:border-[#CE2029] outline-none shadow-sm transition-all"
                />
             </div>
             <button className="px-6 py-3 rounded-2xl bg-[#CE2029] text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#CE2029]/20 hover:-translate-y-0.5 transition-all">Export Report</button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-[28px] shadow-sm w-fit">
          {[
            { id: 'students', label: 'Student Directory', icon: Users },
            { id: 'batches', label: 'Batch Control', icon: Zap },
            { id: 'coaches', label: 'Coaching Staff', icon: Award },
            { id: 'bookings', label: 'Booking Registry', icon: Calendar },
            { id: 'attendance', label: 'Attendance', icon: Fingerprint },
            { id: 'programs', label: 'Master Catalog', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${
                view === tab.id 
                  ? 'bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/20' 
                  : 'text-[#36454F] hover:text-[#CE2029] hover:bg-[#CE2029]/5'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[600px]">
          {view === 'students' && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
               <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                 <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-[#1e293b] uppercase italic leading-none">Student Registry</h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         Real-time Enrollment Monitoring
                      </p>
                    </div>
                    <button onClick={handleAddStudent} className="px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[#1e293b] text-[10px] font-black uppercase tracking-widest hover:border-[#CE2029] transition-all">Add Student</button>
                 </div>
                 
                 <div className="overflow-x-auto">
                   <table className="w-full">
                     <thead>
                       <tr className="bg-slate-50/50">
                         {['#', 'Student Name', 'Parent Name', 'Group', 'Coaching Type', 'Price', 'Time Slot', 'Level', 'Phone', 'Status', 'Date', 'Paid', 'Pending', 'Actions'].map((h, i) => (
                           <th key={i} className="px-4 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 whitespace-nowrap">{h}</th>
                         ))}
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                       {filteredStudents.map((stu, i) => (
                         <tr key={stu.id} className="hover:bg-slate-50 transition-colors group">
                           <td className="px-4 py-4">
                             <span className="text-[10px] font-black text-slate-300">{i + 1}</span>
                           </td>
                           <td className="px-4 py-4">
                              <p className="text-[10px] font-black text-[#1e293b] uppercase leading-none whitespace-nowrap">{stu.name}</p>
                           </td>
                           <td className="px-4 py-4">
                              <p className="text-[10px] font-black text-slate-500 uppercase leading-none whitespace-nowrap">{stu.parent}</p>
                           </td>
                           <td className="px-4 py-4">
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-black text-[#1e293b]">G{stu.group}</span>
                           </td>
                           <td className="px-4 py-4">
                              <p className="text-[10px] font-black text-[#CE2029] tracking-tighter uppercase leading-none whitespace-nowrap">{stu.type}</p>
                           </td>
                           <td className="px-4 py-4">
                              <p className="text-[10px] font-black text-[#1e293b] whitespace-nowrap">OMR {stu.price}.00</p>
                           </td>
                           <td className="px-4 py-4 whitespace-nowrap">
                              <p className="text-[10px] font-black text-[#1e293b] uppercase leading-none">{stu.slot}</p>
                           </td>
                           <td className="px-4 py-4">
                              <p className="text-[9px] font-black text-[#CE2029] tracking-widest leading-none uppercase">{stu.level}</p>
                           </td>
                           <td className="px-4 py-4">
                              <p className="text-[10px] font-black text-slate-400 leading-none">{stu.phone}</p>
                           </td>
                           <td className="px-4 py-4">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                stu.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                              }`}>
                                {stu.status}
                              </span>
                           </td>
                           <td className="px-4 py-4">
                              <p className="text-[10px] font-black text-slate-400 leading-none whitespace-nowrap">{stu.date}</p>
                           </td>
                           <td className="px-4 py-4">
                              <p className="text-[10px] font-black text-emerald-600 whitespace-nowrap">OMR {stu.paid}.00</p>
                           </td>
                           <td className="px-4 py-4">
                              <p className={`text-[10px] font-black whitespace-nowrap ${stu.pending > 0 ? 'text-orange-600' : 'text-slate-300'}`}>OMR {stu.pending}.00</p>
                           </td>
                           <td className="px-4 py-4">
                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditStudent(stu)} className="p-1.5 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-[#CE2029] transition-all shadow-sm"><Edit3 size={11} /></button>
                                <button onClick={() => handleDeleteStudent(stu.id)} className="p-1.5 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-[#CE2029] transition-all shadow-sm"><Trash2 size={11} /></button>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             </motion.div>
          )}

          {view === 'batches' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch content-start">
              {filteredBatches.map((batch, idx) => (
                <motion.div
                  layout
                  key={batch.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-[28px] bg-white border border-slate-100 shadow-sm hover:border-[#CE2029] hover:shadow-xl transition-all flex flex-col justify-between group overflow-hidden"
                >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                         <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#CE2029]/5 border border-[#CE2029]/10 text-[#CE2029] group-hover:scale-105 transition-transform shadow-inner">
                            <Zap size={18} strokeWidth={2.5} />
                         </div>
                         <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${batch.enrolled >= batch.capacity ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-slate-50 border border-slate-100 text-slate-400'}`}>
                               {batch.enrolled}/{batch.capacity} LOAD
                            </span>
                            <div className="flex items-baseline gap-1">
                               <span className="text-[9px] font-black text-slate-300 uppercase">OMR</span>
                               <p className="text-[16px] font-black text-[#1e293b] tracking-tighter leading-none">{batch.fee}</p>
                            </div>
                         </div>
                      </div>
                      <h3 className="font-black text-[#1e293b] text-[16px] leading-tight mb-1 uppercase group-hover:text-[#CE2029] transition-colors">{batch.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-5 flex items-center gap-1.5 text-slate-400 opacity-60">
                        {batch.coach}
                      </p>
                    </div>
                    <div className="space-y-3 mb-5 bg-slate-50 p-3 rounded-[20px] border border-slate-100 shadow-inner">
                      <div className="flex justify-between items-center text-[10px]">
                         <span className="font-black text-slate-400 uppercase tracking-widest">Frequency</span>
                         <span className="font-black text-[#1e293b] uppercase tracking-tighter">{batch.frequency}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                         <span className="font-black text-slate-400 uppercase tracking-widest">Time Slot</span>
                         <span className="font-black text-[#CE2029] uppercase tracking-tighter">{batch.time}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleEditBatch(batch)}
                      className="w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-[#CE2029] text-white hover:bg-[#CE2029]/90 shadow-lg shadow-[#CE2029]/10"
                    >
                      Manage Batch
                    </button>
                </motion.div>
              ))}
            </div>
          )}

          {view === 'coaches' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCoaches.map((coach, idx) => (
                <motion.div
                  layout
                  key={coach.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setViewingCoachDetails(coach)}
                  className="p-5 rounded-[32px] border border-slate-100 shadow-md bg-white hover:border-[#CE2029] hover:shadow-xl flex items-center gap-5 transition-all group cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-[24px] overflow-hidden border border-slate-200 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                    <img src={coach.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-[16px] font-black text-[#1e293b] truncate pr-2 leading-none uppercase italic tracking-tighter">{coach.name}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-lg bg-[#CE2029]/10 text-[#CE2029] text-[9px] font-black flex items-center gap-0.5">
                          {coach.rating}★
                        </span>
                      </div>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 truncate opacity-70 mb-3">{coach.role}</p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                      <div className="px-3 py-1 bg-[#CE2029] rounded-full text-[8px] font-black text-white uppercase tracking-widest">
                        {coach.students} LOAD
                      </div>
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">{coach.experience} EXP</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {view === 'attendance' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">


                <div className="p-8 rounded-[38px] bg-white border-2 border-slate-100 text-[#1e293b] shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                   <div className="relative z-10">
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3 leading-none">Monthly Insight</p>
                      <h4 className="text-4xl font-black tracking-tighter italic text-[#CE2029]">98.5%</h4>
                      <p className="text-[10px] uppercase font-black tracking-widest text-[#1e293b] mt-2 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#CE2029] animate-ping" />
                         Exceptional Retention
                      </p>
                   </div>
                   <History className="absolute -right-4 -bottom-4 opacity-5 text-slate-200" size={120} />
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                     <h3 className="text-lg font-black text-[#1e293b] uppercase italic leading-none">Attendance Matrix</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-8 py-5 text-left">Coach</th>
                          <th className="px-8 py-5 text-left">Entry</th>
                          <th className="px-8 py-5 text-left">Exit</th>
                          <th className="px-8 py-5 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {attendance.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-8 py-5 text-[11px] font-black text-[#1e293b] uppercase italic tracking-tighter">{log.coachName}</td>
                            <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.checkIn}</td>
                            <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.checkOut}</td>
                            <td className="px-8 py-5">
                              <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
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
          )}

          {view === 'bookings' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
               <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                 <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-[#1e293b] uppercase italic leading-none">Global Booking Log</h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                         Centralized Court Reservation Monitoring
                      </p>
                    </div>
                    <button onClick={() => { setEditingBooking(null); setShowBookingModal(true); }} className="px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[#1e293b] text-[10px] font-black uppercase tracking-widest hover:border-[#CE2029] transition-all">New Booking</button>
                 </div>
                 
                 <div className="overflow-x-auto">
                   <table className="w-full">
                     <thead>
                       <tr className="bg-slate-50/50">
                         {['Booking ID', 'Customer', 'Court', 'Arena', 'Date', 'Time', 'Amount', 'Status', 'Payment'].map((h, i) => (
                           <th key={i} className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{h}</th>
                         ))}
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                       {filteredBookings.map((bk) => (
                         <tr key={bk.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4">
                              <span className="text-[10px] font-black text-[#1e293b]">{bk.id}</span>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-[10px] font-black text-[#1e293b] uppercase leading-none">{bk.customer}</p>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-[10px] font-black text-slate-500 uppercase leading-none">{bk.court}</p>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-[10px] font-black text-[#CE2029] tracking-tighter uppercase leading-none">{bk.arena}</p>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-[10px] font-black text-slate-400 leading-none">{bk.date}</p>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-[10px] font-black text-[#1e293b] uppercase leading-none">{bk.time}</p>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-[10px] font-black text-[#1e293b]">OMR {bk.amount.toFixed(2)}</p>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                bk.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                                bk.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                {bk.status}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                bk.payment === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
                                bk.payment === 'Refunded' ? 'bg-slate-100 text-slate-500' : 'bg-orange-50 text-orange-600'
                              }`}>
                                {bk.payment}
                              </span>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            </motion.div>
          )}

          {view === 'programs' && (
            <div className="space-y-6">
               <div className="p-8 bg-white border-2 border-[#CE2029]/10 rounded-[40px] relative overflow-hidden shadow-xl shadow-slate-200/50">
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#CE2029]/5 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div>
                         <h2 className="text-3xl font-black text-[#1e293b] italic tracking-tighter uppercase leading-none">Master Academy <span className="text-[#CE2029]">Catalog</span></h2>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Official Tuition & Program Tiers 2026</p>
                       </div>
                       <button className="px-8 py-4 bg-[#CE2029] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#CE2029]/20 hover:-translate-y-1 transition-all">Add New Program</button>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {['Weekdays', 'Weekends', 'Special'].map((cat) => (
                    <div key={cat} className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
                       <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                          <h4 className="text-[14px] font-black text-[#1e293b] uppercase italic tracking-tighter">
                             {cat} <span className="text-[#CE2029]">Spectrum</span>
                          </h4>
                       </div>
                       <div className="p-4 space-y-2 flex-1">
                          {OFFICIAL_PROGRAMS[cat].map(prog => (
                             <div key={prog.id} className="p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-[#CE2029]/20 hover:bg-white transition-all group flex items-center justify-between">
                                <div>
                                   <div className="flex items-center gap-2 mb-1">
                                      <span className="w-5 h-5 rounded bg-[#1e293b] flex items-center justify-center text-[7px] font-black text-white">G{prog.id}</span>
                                      <p className="text-[10px] font-black text-[#1e293b] uppercase leading-none">{prog.title}</p>
                                   </div>
                                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Base Subscription Plan</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[12px] font-black text-[#CE2029] tracking-tighter leading-none">OMR {prog.fee.toFixed(2)}</p>
                                   <p className="text-[7px] font-black text-slate-300 uppercase mt-0.5">Per Month</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
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
                  <Zap className="text-[#CE2029]" size={22} /> {editingBatch ? 'Modify Program' : 'Initialize Program'}
                </h3>
                <button onClick={() => setShowNewBatchModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="space-y-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Program Name</label>
                      <input type="text" defaultValue={editingBatch?.name || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Coach</label>
                         <select className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold">
                            {coaches.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                         </select>
                       </div>
                       <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Capacity</label>
                         <input type="number" defaultValue="15" className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold" />
                       </div>
                    </div>
                    <button 
                      onClick={() => setShowNewBatchModal(false)}
                      className="w-full py-4 rounded-xl bg-[#CE2029] text-white text-[13px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
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
                   <Users className="text-[#CE2029]" size={22} /> {editingCoach ? 'Modify Profile' : 'Onboard Coach'}
                 </h3>
                 <button onClick={() => setShowCoachModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-5">
                 <div className="space-y-4">
                   <div className="group">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Full Name</label>
                     <input ref={nameRef} type="text" defaultValue={editingCoach?.name || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Role</label>
                        <input ref={roleRef} type="text" defaultValue={editingCoach?.role || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Specialty</label>
                        <input ref={specialtyRef} type="text" defaultValue={editingCoach?.specialty || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Monthly Salary (OMR)</label>
                        <input ref={salaryRef} type="number" defaultValue={editingCoach?.salary || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Experience</label>
                        <input ref={experienceRef} type="text" defaultValue={editingCoach?.experience || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold" />
                      </div>
                   </div>
                   <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Status</label>
                     <select ref={statusRef} defaultValue={editingCoach?.status || 'Active'} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                     </select>
                   </div>
                   <button 
                    onClick={handleSaveCoach}
                    className="w-full py-4 rounded-xl bg-[#CE2029] text-white text-[13px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
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
              className="relative w-full max-w-xl rounded-[40px] bg-white text-[#36454F] shadow-2xl overflow-hidden"
            >
              <div className="h-40 bg-gradient-to-br from-[#CE2029] to-[#ff6b6b] p-8 flex justify-end">
                 <button 
                  onClick={() => setViewingCoachDetails(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-[#CE2029] transition-all"
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
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#CE2029]">{viewingCoachDetails.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center"><Banknote size={18} /></div>
                      <div>
                        <p className="text-[14px] font-black">{viewingCoachDetails.salary || 'N/A'} OMR</p>
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
                         <div className="text-[12px] font-bold text-[#36454F]">{viewingCoachDetails.timing}</div>
                         <div className="text-[12px] font-black text-[#CE2029]">{viewingCoachDetails.court}</div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Star size={14} /> Performance</h4>
                      {viewingCoachDetails.reviews?.map((r, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                           <div className="flex justify-between text-[11px] font-black mb-0.5">
                              <span>{r.user}</span>
                              <span className="text-[#CE2029]">{r.rating}★</span>
                           </div>
                           <p className="text-[10px] text-slate-500 font-medium">{r.comment}</p>
                        </div>
                      ))}
                      {!viewingCoachDetails.reviews?.length && <p className="text-[11px] text-center text-slate-400 font-bold uppercase tracking-widest py-4">No reviews yet</p>}
                   </div>
                </div>

                <button 
                  onClick={() => setViewingCoachDetails(null)}
                  className="w-full py-4 mt-8 rounded-2xl bg-[#CE2029] text-white text-[12px] font-black uppercase tracking-widest hover:shadow-lg shadow-[#CE2029]/10 transition-all"
                >
                  Close Portfolio
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Student Management Modal */}
      <AnimatePresence>
        {showStudentModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStudentModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-2xl rounded-[32px] border-2 border-slate-200 bg-white shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSaveStudent}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <GraduationCap className="text-[#CE2029]" size={22} /> {editingStudent ? 'Update Record' : 'Enroll New Student'}
                  </h3>
                  <button type="button" onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Student Name</label>
                      <input name="name" required defaultValue={editingStudent?.name || ''} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Parent Name</label>
                      <input name="parent" required defaultValue={editingStudent?.parent || ''} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Group Number</label>
                      <select name="group" defaultValue={editingStudent?.group || '1'} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => <option key={n} value={n}>Group G{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Coaching Type</label>
                      <input name="type" required placeholder="e.g. WEEKDAYS 4DW / WEEK" defaultValue={editingStudent?.type || ''} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Total Price (OMR)</label>
                      <input name="total_price" type="number" required defaultValue={editingStudent?.price || ''} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Time Slot</label>
                      <input name="slot" required placeholder="e.g. 7 PM - 8 PM" defaultValue={editingStudent?.slot || ''} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Student Level</label>
                      <select name="level" defaultValue={editingStudent?.level || 'ADVANCED'} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold">
                        <option value="BEGINNER">BEGINNER</option>
                        <option value="INTERMEDIATE">INTERMEDIATE</option>
                        <option value="ADVANCED">ADVANCED</option>
                        <option value="PRO">PRO</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Telephone Number</label>
                      <input name="phone" required defaultValue={editingStudent?.phone || ''} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Payment Status</label>
                      <select name="status" defaultValue={editingStudent?.status || 'PAID'} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold">
                        <option value="PAID">PAID</option>
                        <option value="PARTLY PAID">PARTLY PAID</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Date of Payment</label>
                      <input name="date" type="text" placeholder="30-Mar-26" defaultValue={editingStudent?.date || ''} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Amount Paid (OMR)</label>
                      <input name="paid" type="number" required defaultValue={editingStudent?.paid || ''} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Amount Pending (OMR)</label>
                      <input name="pending" type="number" required defaultValue={editingStudent?.pending || 0} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100">
                  <button 
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#CE2029] text-white text-[13px] font-black uppercase tracking-widest hover:shadow-lg shadow-[#CE2029]/20 transition-all"
                  >
                    {editingStudent ? 'Sync Record' : 'Confirm Enrollment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg rounded-[32px] border-2 border-slate-200 bg-white shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSaveBooking}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Calendar className="text-[#CE2029]" size={22} /> {editingBooking ? 'Update Booking' : 'Create Reserve'}
                  </h3>
                  <button type="button" onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Customer Name</label>
                      <input name="customer" required defaultValue={editingBooking?.customer || ''} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Arena</label>
                        <select name="arena" defaultValue={editingBooking?.arena || 'Amm Sports'} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold">
                          <option value="Amm Sports">Amm Sports</option>
                          <option value="Olympic Hub">Olympic Hub</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Court</label>
                        <select name="court" defaultValue={editingBooking?.court || 'Court 1'} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold">
                          <option value="Court 1">Court 1</option>
                          <option value="Court 2">Court 2</option>
                          <option value="Court 3">Court 3</option>
                          <option value="Court 4">Court 4</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Date</label>
                        <input name="date" type="text" placeholder="12-03-2026" required defaultValue={editingBooking?.date || ''} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Time</label>
                        <input name="time" placeholder="7:00 AM" required defaultValue={editingBooking?.time || ''} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Status</label>
                        <select name="status" defaultValue={editingBooking?.status || 'Upcoming'} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold">
                          <option value="Upcoming">Upcoming</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Payment</label>
                        <select name="payment" defaultValue={editingBooking?.payment || 'Paid'} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold">
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Amount (OMR)</label>
                      <input name="amount" type="number" step="0.1" required defaultValue={editingBooking?.amount || ''} className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100">
                  <button 
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#CE2029] text-white text-[13px] font-black uppercase tracking-widest hover:shadow-lg shadow-[#CE2029]/20 transition-all"
                  >
                    {editingBooking ? 'Update Reservation' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachingAdmin;
