import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Users, Search, Filter, Mail, Video, Zap, GraduationCap, ChevronRight, X, Calendar, Clock, MapPin, Edit3, CheckCircle2, Image as ImageIcon, Upload, Banknote, Trash2, Fingerprint, History, Settings, Award, UserCheck, TrendingUp, Activity, LayoutGrid } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

import Court1 from '../../../assets/Courts/court1.jpeg';
import Court2 from '../../../assets/Courts/court2.jpeg';
import Court3 from '../../../assets/Courts/court3.jpeg';
import { fetchPublicArenas } from '../../../services/arenasApi';
import { normalizeListArena } from '../../../utils/arenaAdapter';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { listAdminCoachingBatches, listStaffAttendance } from '../../../services/adminOpsApi';
import { listAdminUsers } from '../../../services/adminUsersApi';
import { listAdminBookings } from '../../../services/adminBookingsApi';
import CoachingStudentMatrix from '../components/CoachingStudentMatrix';
import { useAuth } from '../../../modules/user/context/AuthContext';



const COACHES_DATA = [];
const REQUESTED_COACHES = [];
const ATTENDANCE_DATA = [];
const COACHING_TYPES = [];
const PRICING_SLABS = [];
const BATCHES_DATA = [];
const STUDENT_DIRECTORY = [];
const OFFICIAL_PROGRAMS = {
  Weekdays: [],
  Weekends: [],
  Special: [],
};
const STUDENT_ATTENDANCE_STATS = {
  daily: [],
  monthly: [],
  yearly: [],
};
const BOOKINGS_DATA = [];
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  const ampm = h < 12 ? 'AM' : 'PM';
  const hh = h % 12 || 12;
  return `${String(hh).padStart(2, '0')}:${m} ${ampm}`;
});

const CoachingAdmin = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'ARENA_ADMIN';

  const [view, setView] = useState('students');
  const [studentAttendanceMode, setStudentAttendanceMode] = useState('daily'); // daily | monthly | yearly
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [selectedBatchDays, setSelectedBatchDays] = useState([]);
  const [batchStartTime, setBatchStartTime] = useState('07:00 AM');
  const [batchEndTime, setBatchEndTime] = useState('08:00 AM');
  const toggleDay = (day) => {
    setSelectedBatchDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAttendanceStudentsModal, setShowAttendanceStudentsModal] = useState(false);
  const [selectedStatStudents, setSelectedStatStudents] = useState({ court: '', present: [], absent: [] });


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
  
  const nameRef = useRef();
  const roleRef = useRef();
  const specialtyRef = useRef();
  const salaryRef = useRef();
  const experienceRef = useRef();
  const statusRef = useRef();
  const batchNameRef = useRef();
  const batchCoachRef = useRef();
  const batchCapacityRef = useRef();
  const batchArenaRef = useRef();
  const batchPriceRef = useRef();
  const batchStartDateRef = useRef();
  const batchEndDateRef = useRef();
  const batchScheduleRef = useRef();
  const batchTimeRef = useRef();
  const batchPublishedRef = useRef();
  const batchRegistrationFeeRef = useRef();
  const batchTaxPercentRef = useRef();
  const batchLevelRef = useRef();
  const batchRatingRef = useRef();
  const batchStudentCountRef = useRef();
  const batchExperienceYearsRef = useRef();
  const batchBenefitsRef = useRef();

  const [arenas, setArenas] = useState([]);
  const [selectedArenaId, setSelectedArenaId] = useState('');
  const [selectedBatchImage, setSelectedBatchImage] = useState(null);

  const loadBatches = async (aid) => {
    try {
      const cb = await listAdminCoachingBatches(String(aid));
      const br = (cb.batches || []).map((b) => ({
        id: b.id,
        name: b.title,
        coach: b.coachName || '—',
        coachId: b.coachId,
        capacity: b.capacity,
        enrolled: b.enrolledCount || 0,
        fee: b.price ?? 0,
        frequency: b.schedule || '',
        time: b.scheduleTime || '',
        arena: b.arenaName || '',
        arenaId: b.arenaId,
        startDate: b.startDate,
        endDate: b.endDate,
        isPublished: b.isPublished,
        description: b.description,
        registrationFee: b.registrationFee,
        taxPercent: b.taxPercent,
        level: b.level,
        coachImage: b.coachImage,
        rating: b.rating,
        studentCount: b.studentCount,
        experienceYears: b.experienceYears,
        benefits: b.benefits || [],
        enrolledCount: b.enrolledCount || 0
      }));
      setBatches(br);
    } catch (err) {
      console.error('Error loading batches:', err);
    }
  };

  const [isRefreshingAtt, setIsRefreshingAtt] = useState(false);

  const fetchAttendanceLogs = async () => {
    try {
      setIsRefreshingAtt(true);
      const att = await listStaffAttendance();
      const attRows = (att.attendance || []).map(a => ({
        id: a._id,
        coachName: a.staffId?.name || `${a.staffId?.firstName || ''} ${a.staffId?.lastName || ''}`.trim() || 'Unknown',
        arenaName: a.arenaId?.name || '—',
        checkIn: a.checkIn || '—',
        checkOut: a.checkOut || '—',
        status: a.status,
        date: a.date
      }));
      setAttendance(attRows);
    } catch (err) {
      console.error('Error loading staff attendance:', err);
    } finally {
      setIsRefreshingAtt(false);
    }
  };

  useEffect(() => {
    if (!isApiConfigured() || !getAuthToken()) return undefined;
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const ar = await fetchPublicArenas();
        const list = (ar.arenas || []).map(normalizeListArena);
        if (cancelled) return;
        setArenas(list);
        
        const aid = list[0]?.id;
        if (aid) {
          setSelectedArenaId(String(aid));
          loadBatches(aid);
          
          // Independent fetches
          listAdminBookings({ arenaId: String(aid) })
            .then(bk => {
              if (cancelled) return;
              const rows = (bk.bookings || []).slice(0, 20).map((b) => ({
                id: b.id,
                date: b.date,
                court: b.courtName || '—',
                player: b.userName || `User …${String(b.userId || '').slice(-6)}`,
                phone: b.userPhone || '',
                time: b.timeSlot || '',
                status: b.status,
              }));
              if (rows.length) setBookings(rows);
            })
            .catch(err => console.error('Error loading bookings:', err));
        }

        // Fetch coaches independently
        listAdminUsers({ role: 'COACH' })
          .then(cu => {
            if (cancelled) return;
            const fetchedCoaches = (cu.users || []).map(user => ({
              id: user.id,
              name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Coach',
              role: 'Professional Coach',
              specialty: 'Academy Training',
              salary: 0,
              experience: 'Staff',
              status: user.isActive ? 'Active' : 'Inactive',
              image: '',
              students: 0,
              rating: 5.0,
              reviews: []
            }));
            setCoaches(fetchedCoaches);
          })
          .catch(err => console.error('Error loading coaches:', err));

        // Fetch staff attendance independently
        fetchAttendanceLogs();

      } catch (err) {
        console.error('Error fetching arenas:', err);
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);


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
        image: selectedImage || '',
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
    // Parse "Mon-Wed-Fri" into ["Mon", "Wed", "Fri"]
    const days = (batch.frequency || '').split('-').filter(d => DAYS_OF_WEEK.includes(d));
    setSelectedBatchDays(days);
    
    // Parse "07:30 AM – 08:30 AM" or "07:30 AM - 08:30 AM"
    const times = (batch.time || '').split(/[-–]/).map(s => s.trim());
    if (times.length === 2) {
      setBatchStartTime(times[0]);
      setBatchEndTime(times[1]);
    } else {
      setBatchStartTime('07:00 AM');
      setBatchEndTime('08:00 AM');
    }
    
    setShowNewBatchModal(true);
  };

  const handleNewBatch = () => {
    setEditingBatch(null);
    setSelectedBatchDays([]);
    setBatchStartTime('07:00 AM');
    setBatchEndTime('08:00 AM');
    setShowNewBatchModal(true);
  };

  const handleSaveBatch = async () => {
    const title = batchNameRef.current.value;
    const coachId = batchCoachRef.current.value;
    const arenaId = batchArenaRef.current.value;
    const capacity = Number(batchCapacityRef.current.value);
    const price = Number(batchPriceRef.current.value);
    const startDate = batchStartDateRef.current.value;
    const endDate = batchEndDateRef.current.value;
    const schedule = selectedBatchDays.join('-');
    const scheduleTime = `${batchStartTime} – ${batchEndTime}`;
    const isPublished = batchPublishedRef.current.checked;
    const registrationFee = Number(batchRegistrationFeeRef.current.value);
    const taxPercent = Number(batchTaxPercentRef.current.value);
    const level = batchLevelRef.current.value;
    const rating = Number(batchRatingRef.current.value);
    const studentCount = batchStudentCountRef.current.value;
    const experienceYears = batchExperienceYearsRef.current.value;
    const benefits = (batchBenefitsRef.current.value || '').split(',').map(s => s.trim()).filter(Boolean);

    const missingFields = [];
    if (!title) missingFields.push('Program Name');
    if (!coachId) missingFields.push('Coach');
    if (!arenaId) missingFields.push('Arena');
    if (!startDate) missingFields.push('Start Date');
    if (!endDate) missingFields.push('End Date');
    if (selectedBatchDays.length === 0) missingFields.push('Schedule Days');

    if (missingFields.length > 0) {
      setToast(`Missing: ${missingFields.join(', ')}`);
      setTimeout(() => setToast(null), 4000);
      return;
    }

    try {
      let finalCoachImage = editingBatch?.coachImage || '';

      if (selectedBatchImage) {
        setToast('Uploading image…');
        const uploadRes = await import('../../../services/adminOpsApi').then(api => api.uploadAdminImage(selectedBatchImage));
        finalCoachImage = uploadRes.url;
      }

      const payload = {
        title,
        coachId,
        arenaId,
        capacity,
        price,
        startDate,
        endDate,
        schedule,
        scheduleTime,
        isPublished,
        registrationFee,
        taxPercent,
        level,
        coachImage: finalCoachImage,
        rating,
        studentCount,
        experienceYears,
        benefits,
      };

      if (editingBatch) {
        await import('../../../services/adminOpsApi').then(api => api.updateAdminCoachingBatch(editingBatch.id, payload));
        setToast('Batch updated successfully');
      } else {
        await import('../../../services/adminOpsApi').then(api => api.createAdminCoachingBatch(payload));
        setToast('New batch created successfully');
      }
      await loadBatches(selectedArenaId);
      setShowNewBatchModal(false);
      setEditingBatch(null);
      setSelectedBatchImage(null);
    } catch (err) {
      console.error('Save batch error:', err);
      alert(err.message || 'Failed to save batch');
    }

    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteBatch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await import('../../../services/adminOpsApi').then(api => api.deleteAdminCoachingBatch(id));
      setToast('Batch deleted successfully');
      await loadBatches(selectedArenaId);
    } catch (err) {
      console.error('Delete batch error:', err);
      alert(err.message || 'Failed to delete batch');
    }
    setTimeout(() => setToast(null), 3000);
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
      id: editingBooking?.id || `BK-${Date.now()}`,
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
        <div className="max-w-full overflow-x-auto custom-scrollbar pb-2">
          <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-[28px] shadow-sm w-fit whitespace-nowrap">
            {[
              { id: 'students', label: 'Student Directory', icon: Users },
              { id: 'batches', label: 'Batch Control', icon: Zap },
              { id: 'coaches', label: 'Coaching Staff', icon: Award },
              { id: 'bookings', label: 'Booking Registry', icon: Calendar },
              { id: 'student-attendance', label: 'Academy Attendance', icon: UserCheck },
              { id: 'attendance', label: 'Staff Logs', icon: Fingerprint },
              { id: 'programs', label: 'Master Catalog', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
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
        </div>

        {/* Content Area */}
        <div className="min-h-[600px]">
          {view === 'students' && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <CoachingStudentMatrix arenaId={selectedArenaId} batches={batches} />
             </motion.div>
          )}

          {view === 'batches' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-[#1e293b] uppercase italic leading-none">Batch Control Center</h3>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#CE2029] animate-pulse" />
                     Schedule & Load Monitoring
                  </div>
                </div>
                {!isReadOnly && (
                  <button 
                    onClick={handleNewBatch}
                    className="px-6 py-3 bg-[#CE2029] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#CE2029]/20 hover:-translate-y-1 transition-all"
                  >
                    Create New Batch
                  </button>
                )}
              </div>

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
                         <span className="font-black text-[#CE2029] uppercase tracking-tighter">{batch.time || '—'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditBatch(batch)}
                        className="flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-[#CE2029] text-white hover:bg-[#CE2029]/90 shadow-lg shadow-[#CE2029]/10"
                      >
                        Manage
                      </button>
                      <button 
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="px-4 py-3.5 rounded-2xl border border-slate-100 text-slate-400 hover:text-[#CE2029] hover:bg-[#CE2029]/5 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                </motion.div>
                ))}
              </div>
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

          {view === 'student-attendance' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm gap-4">
                  <div>
                    <h3 className="text-lg font-black text-[#1e293b] uppercase italic leading-none">Academy Attendance Dashboard</h3>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#CE2029] animate-pulse" />
                       Real-time Student Footprint Monitoring
                    </div>
                  </div>
                  <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 w-full md:w-auto overflow-x-auto">
                    {['daily', 'monthly', 'yearly'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setStudentAttendanceMode(mode)}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                          studentAttendanceMode === mode ? 'bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/20' : 'text-slate-400 hover:text-[#CE2029]'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
               </div>

               {studentAttendanceMode === 'daily' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                     {STUDENT_ATTENDANCE_STATS.daily.map((stat, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="rounded-[28px] bg-white border border-slate-100 shadow-sm hover:border-[#CE2029] transition-all group overflow-hidden flex flex-col"
                        >
                           <div className="h-28 w-full overflow-hidden relative">
                              <img src={stat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={stat.court} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute bottom-3 left-4">
                                 <h4 className="font-black text-white text-[15px] uppercase tracking-tighter leading-none">{stat.court}</h4>
                                 <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mt-1">{stat.batch}</p>
                              </div>
                              <div className="absolute top-3 right-4 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
                                 {stat.time}
                              </div>
                           </div>
                           
                           <div className="p-5 flex-1 flex flex-col justify-between">
                              <div className="flex items-center gap-3 mb-4">
                                 <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-[#CE2029] border border-slate-100 shadow-inner group-hover:bg-[#CE2029] group-hover:text-white transition-all">
                                    <LayoutGrid size={18} />
                                 </div>
                                 <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${(stat.present / stat.total) * 100}%` }}
                                       className="h-full bg-[#CE2029] rounded-full"
                                    />
                                 </div>
                              </div>

                              <div className="flex items-end justify-between">
                                 <div 
                                    onClick={() => {
                                       setSelectedStatStudents({ 
                                          court: stat.court, 
                                          present: stat.presentStudents, 
                                          absent: stat.absentStudents 
                                       });
                                       setShowAttendanceStudentsModal(true);
                                    }}
                                    className="cursor-pointer hover:scale-105 transition-transform origin-left group/count"
                                 >

                                    <p className="text-2xl font-black tracking-tighter text-[#1e293b] leading-none group-hover/count:text-[#CE2029] flex items-baseline gap-1">
                                       {stat.present}
                                       <span className="text-[10px] text-slate-300 font-black">/ {stat.total}</span>
                                    </p>
                                    <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5 leading-none">
                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                       Present Now
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-lg font-black text-[#CE2029] leading-none tracking-tighter">
                                       {stat.total > 0 ? ((stat.present / stat.total) * 100).toFixed(0) : 0}%
                                    </p>
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1.5 leading-none">Court Load</p>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               )}

               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-[12px] font-black uppercase text-[#1e293b] italic tracking-tighter flex items-center gap-2">
                        <Users size={16} className="text-[#CE2029]" />
                        Live Staff Presence
                     </h4>
                     <button onClick={() => setView('attendance')} className="text-[9px] font-black text-[#CE2029] uppercase tracking-widest hover:underline">View Detailed Logs</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {attendance.slice(0, 4).map((log, i) => (
                        <motion.div 
                           key={i}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.1 }}
                           className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"
                        >
                           <div className="w-10 h-10 rounded-2xl bg-[#CE2029]/5 flex items-center justify-center text-[#CE2029] text-xs font-black border border-[#CE2029]/10">
                              {log.coachName.charAt(0)}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-black text-[#1e293b] uppercase truncate">{log.coachName}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{log.arenaName}</p>
                           </div>
                           <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                              log.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 
                              log.status === 'late' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                           }`}>
                              {log.status}
                           </div>
                        </motion.div>
                     ))}
                     {attendance.length === 0 && (
                        <div className="col-span-full py-10 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No staff logs for today yet</p>
                        </div>
                     )}
                  </div>
               </div>

               {(studentAttendanceMode === 'monthly' || studentAttendanceMode === 'yearly') && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <div className="lg:col-span-2 p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm h-[420px] relative">
                        <div className="flex items-center justify-between mb-8">
                           <div>
                              <h4 className="text-[12px] font-black uppercase text-[#1e293b] italic tracking-tighter flex items-center gap-2">
                                 <TrendingUp size={16} className="text-[#CE2029]" />
                                 {studentAttendanceMode === 'monthly' ? 'Attendance Volume (30 Days)' : 'Yearly Performance Matrix'}
                              </h4>
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Academy-wide activity index</p>
                           </div>
                        </div>
                        <div className="h-[280px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              {studentAttendanceMode === 'monthly' ? (
                                 <AreaChart data={STUDENT_ATTENDANCE_STATS.monthly}>
                                    <defs>
                                       <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#CE2029" stopOpacity={0.1}/>
                                          <stop offset="95%" stopColor="#CE2029" stopOpacity={0}/>
                                       </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94A3B8'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94A3B8'}} />
                                    <Tooltip 
                                       contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontWeight: 'bold', fontSize: '10px'}}
                                       cursor={{stroke: '#CE2029', strokeWidth: 2}}
                                    />
                                    <Area type="monotone" dataKey="present" stroke="#CE2029" strokeWidth={4} fillOpacity={1} fill="url(#colorPresent)" />
                                 </AreaChart>
                              ) : (
                                 <BarChart data={STUDENT_ATTENDANCE_STATS.yearly}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94A3B8'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94A3B8'}} domain={[0, 100]} />
                                    <Tooltip 
                                       contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontWeight: 'bold', fontSize: '10px'}}
                                       cursor={{fill: '#f8fafc'}}
                                    />
                                    <Bar dataKey="rate" radius={[8, 8, 0, 0]} barSize={32}>
                                       {STUDENT_ATTENDANCE_STATS.yearly.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={index === 9 ? '#CE2029' : '#36454F'} />
                                       ))}
                                    </Bar>
                                 </BarChart>
                              )}
                           </ResponsiveContainer>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm group hover:border-[#CE2029] transition-all relative overflow-hidden">
                           <div className="relative z-10">
                              <Activity className="text-[#CE2029] mb-4" size={28} />
                              <h5 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mb-1">Peak Attendance</h5>
                              <p className="text-4xl font-black text-[#1e293b] tracking-tighter italic leading-none">96.8%</p>
                              <div className="text-[9px] font-black text-slate-400 uppercase mt-3 flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                 Recorded in October 2025
                              </div>
                           </div>
                           <TrendingUp className="absolute -right-4 -bottom-4 opacity-[0.03] text-[#CE2029]" size={140} />
                        </div>
                        
                        <div className="p-8 bg-[#36454F] rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                           <div className="relative z-10">
                              <Users className="text-white/30 mb-4" size={28} />
                              <h5 className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-1">Total Impact</h5>
                              <p className="text-4xl font-black text-white tracking-tighter italic leading-none">1.2K+</p>
                              <p className="text-[9px] font-black text-white/20 uppercase mt-3">Active Student Sessions</p>
                           </div>
                        </div>

                        <div className="p-6 bg-slate-50/50 rounded-[32px] border border-slate-100">
                           <div className="space-y-4">
                              {[
                                 { label: 'Retention Rate', val: '92.4%', color: 'text-emerald-500' },
                                 { label: 'Court Efficiency', val: '88.1%', color: 'text-[#CE2029]' },
                                 { label: 'Quarterly Growth', val: '+12.5%', color: 'text-blue-500' }
                              ].map((item, i) => (
                                 <div key={i} className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                                    <span className={`text-[12px] font-black ${item.color}`}>{item.val}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </motion.div>
          )}

          {view === 'attendance' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">


                <div className="p-8 rounded-[38px] bg-white border-2 border-slate-100 text-[#1e293b] shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                   <div className="relative z-10">
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3 leading-none">Monthly Insight</p>
                      <h4 className="text-4xl font-black tracking-tighter italic text-[#CE2029]">98.5%</h4>
                      <div className="text-[10px] uppercase font-black tracking-widest text-[#1e293b] mt-2 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#CE2029] animate-ping" />
                         Exceptional Retention
                      </div>
                   </div>
                   <History className="absolute -right-4 -bottom-4 opacity-5 text-slate-200" size={120} />
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                     <h3 className="text-lg font-black text-[#1e293b] uppercase italic leading-none">Attendance Matrix</h3>
                     <button 
                        onClick={fetchAttendanceLogs}
                        disabled={isRefreshingAtt}
                        className={`px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest transition-all ${isRefreshingAtt ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#CE2029] hover:text-[#CE2029]'}`}
                     >
                        {isRefreshingAtt ? 'Syncing...' : 'Refresh Logs'}
                     </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-8 py-5 text-left">Coach</th>
                          <th className="px-8 py-5 text-left">Arena</th>
                          <th className="px-8 py-5 text-left">Date</th>
                          <th className="px-8 py-5 text-left">Check-In</th>
                          <th className="px-8 py-5 text-left">Check-Out</th>
                          <th className="px-8 py-5 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {attendance.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black text-[#1e293b] uppercase italic tracking-tighter">{log.coachName}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">ID: {log.id.slice(-6).toUpperCase()}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-[10px] font-black text-[#CE2029] uppercase tracking-widest">{log.arenaName}</td>
                            <td className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{log.date}</td>
                            <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.checkIn}</td>
                            <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.checkOut}</td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                log.status === 'present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                log.status === 'late' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                'bg-red-50 text-red-600 border border-red-100'
                              }`}>
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
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                         Centralized Court Reservation Monitoring
                      </div>
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
                               <div className="flex flex-col gap-0.5">
                                 <p className="text-[11px] font-black text-[#1e293b] uppercase leading-tight">{bk.customer}</p>
                                 {bk.phone && <p className="text-[9px] font-bold text-slate-400">{bk.phone}</p>}
                               </div>
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
                              <span className="text-[10px] font-black text-[#1e293b]">OMR {(bk.amount || 0).toFixed(2)}</span>
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
                                      <span className="text-[10px] font-black text-[#1e293b] uppercase leading-none">{prog.title}</span>
                                   </div>
                                   <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Base Subscription Plan</span>
                                </div>
                                <div className="text-right">
                                   <span className="text-[12px] font-black text-[#CE2029] tracking-tighter leading-none block">OMR {(prog.fee || 0).toFixed(2)}</span>
                                   <span className="text-[7px] font-black text-slate-300 uppercase mt-0.5 block">Per Month</span>
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
              key={editingBatch?.id || 'new'}
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg max-h-[95vh] flex flex-col rounded-3xl border-2 border-slate-200 bg-white shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Zap className="text-[#CE2029]" size={22} /> {editingBatch ? 'Modify Program' : 'Initialize Program'}
                </h3>
                <button onClick={() => setShowNewBatchModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                 <div className="space-y-4">
                       <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Program Name</label>
                         <input ref={batchNameRef} type="text" defaultValue={editingBatch?.name || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Arena</label>
                            <select ref={batchArenaRef} defaultValue={editingBatch?.arenaId || selectedArenaId} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold">
                               <option value="" disabled>Select Arena</option>
                               {arenas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Coach</label>
                            <select ref={batchCoachRef} defaultValue={editingBatch?.coachId || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold">
                               <option value="" disabled>Select Coach</option>
                               {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Monthly Fee (OMR)</label>
                            <input ref={batchPriceRef} type="number" defaultValue={editingBatch?.fee || '0'} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Capacity</label>
                            <input ref={batchCapacityRef} type="number" defaultValue={editingBatch?.capacity || "15"} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Start Date</label>
                            <input ref={batchStartDateRef} type="date" defaultValue={editingBatch?.startDate || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">End Date</label>
                            <input ref={batchEndDateRef} type="date" defaultValue={editingBatch?.endDate || ''} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[13px] font-bold" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Schedule Days</label>
                             <div className="flex flex-wrap gap-1.5">
                                {DAYS_OF_WEEK.map(day => (
                                   <button 
                                     key={day}
                                     type="button"
                                     onClick={() => toggleDay(day)}
                                     className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                                       selectedBatchDays.includes(day)
                                         ? 'bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/20'
                                         : 'bg-slate-50 text-slate-400 border-2 border-slate-100 hover:border-slate-200'
                                     }`}
                                   >
                                      {day}
                                   </button>
                                ))}
                             </div>
                             <input ref={batchScheduleRef} type="hidden" value={selectedBatchDays.join('-')} />
                           </div>
                           <div>
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Session Timing</label>
                             <div className="grid grid-cols-2 gap-2">
                                <select 
                                  value={batchStartTime}
                                  onChange={(e) => setBatchStartTime(e.target.value)}
                                  className="w-full py-3 px-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold"
                                >
                                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <select 
                                  value={batchEndTime}
                                  onChange={(e) => setBatchEndTime(e.target.value)}
                                  className="w-full py-3 px-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold"
                                >
                                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                             </div>
                             <input ref={batchTimeRef} type="hidden" value={`${batchStartTime} – ${batchEndTime}`} />
                           </div>
                       </div>

                       <div className="h-px bg-slate-100 my-2" />
                       <p className="text-[9px] font-black text-[#CE2029] uppercase tracking-widest">Premium Details & Mocks</p>

                       <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Level</label>
                            <select ref={batchLevelRef} defaultValue={editingBatch?.level || 'Open'} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold">
                               <option value="Open">Open</option>
                               <option value="Beginner">Beginner</option>
                               <option value="Intermediate">Intermediate</option>
                               <option value="Advanced">Advanced</option>
                               <option value="Elite">Elite</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Reg Fee</label>
                            <input ref={batchRegistrationFeeRef} type="number" defaultValue={editingBatch?.registrationFee ?? 500} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Tax %</label>
                            <input ref={batchTaxPercentRef} type="number" defaultValue={editingBatch?.taxPercent ?? 18} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                          </div>
                       </div>

                       <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Rating</label>
                            <input ref={batchRatingRef} type="number" step="0.1" defaultValue={editingBatch?.rating ?? 5.0} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Registered Students</label>
                            <input readOnly value={editingBatch?.enrolledCount || 0} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-100 outline-none text-[12px] font-black text-[#CE2029]" />
                            <input ref={batchStudentCountRef} type="hidden" defaultValue={editingBatch?.enrolledCount || 0} />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Experience</label>
                            <input ref={batchExperienceYearsRef} type="text" defaultValue={editingBatch?.experienceYears || "8+ Years"} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold" />
                          </div>
                       </div>

                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Academy Benefits (Comma separated)</label>
                          <textarea ref={batchBenefitsRef} defaultValue={(editingBatch?.benefits || []).join(', ') || "Assessment report, Certified Elite Coach, Sanitised Arena, Tournament priority"} className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold h-20 resize-none" />
                       </div>

                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Coach Image</label>
                          <div className="flex items-center gap-4">
                             {editingBatch?.coachImage && !selectedBatchImage && (
                               <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-slate-100">
                                 <img src={editingBatch.coachImage} className="w-full h-full object-cover" alt="Coach" />
                               </div>
                             )}
                             <input 
                               type="file" 
                               accept="image/*"
                               onChange={(e) => setSelectedBatchImage(e.target.files[0])}
                               className="flex-1 text-[11px] font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#CE2029]/10 file:text-[#CE2029] hover:file:bg-[#CE2029]/20" 
                             />
                          </div>
                       </div>

                       <div className="flex items-center gap-3 py-1">
                          <input ref={batchPublishedRef} id="batchPublished" type="checkbox" defaultChecked={editingBatch?.isPublished ?? false} className="w-5 h-5 accent-[#CE2029]" />
                          <label htmlFor="batchPublished" className="text-[11px] font-black uppercase tracking-widest text-slate-600 cursor-pointer">Publish to User App</label>
                       </div>
                    <button 
                      onClick={handleSaveBatch}
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

      {/* Attendance Students Modal */}
      <AnimatePresence>
        {showAttendanceStudentsModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAttendanceStudentsModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-md rounded-[32px] border-2 border-slate-200 bg-white shadow-2xl overflow-hidden"
            >
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-lg font-black text-[#1e293b] uppercase italic leading-none">{selectedStatStudents.court}</h3>
                    <p className="text-[9px] font-black text-[#CE2029] uppercase tracking-[0.2em] mt-2 leading-none">Attendance Registry</p>
                  </div>
                  <button onClick={() => setShowAttendanceStudentsModal(false)} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all"><X size={20} /></button>
               </div>
               
               <div className="p-6 max-h-[400px] overflow-y-auto space-y-6">
                  {/* Present Students */}
                  <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#CE2029]">In Attendance ({selectedStatStudents.present.length})</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                       {selectedStatStudents.present.map((name, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 group hover:border-emerald-500 transition-all">
                             <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white shadow-emerald-500/20 shadow-lg">
                                <CheckCircle2 size={14} />
                             </div>
                             <span className="text-[11px] font-black text-[#36454F] uppercase group-hover:text-[#1e293b] transition-colors">{name}</span>
                          </div>
                       ))}
                    </div>
                  </div>

                  {/* Absent Students */}
                  {selectedStatStudents.absent.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marked Absent ({selectedStatStudents.absent.length})</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                         {selectedStatStudents.absent.map((name, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-red-400 opacity-60 hover:opacity-100 transition-all">
                               <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-red-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-red-500/20 transition-all">
                                  <X size={14} />
                               </div>
                               <span className="text-[11px] font-black text-slate-400 uppercase group-hover:text-[#1e293b] transition-colors line-through italic">{name}</span>
                            </div>
                         ))}
                      </div>
                    </div>
                  )}
               </div>

               <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Session Sync Active</p>
                  <p className="text-[11px] font-black text-[#1e293b] uppercase tracking-tighter">Total Batch Strength: {selectedStatStudents.present.length + selectedStatStudents.absent.length}</p>
               </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachingAdmin;
