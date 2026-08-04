import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Search, Filter, MoreHorizontal, MessageSquare, 
  Star, GraduationCap, XCircle, Trash2, CheckCircle2, UserCheck, Target,
  Calendar, TrendingUp, BarChart3, ChevronLeft, ChevronRight, AlertCircle, Clock
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { listCoachStudentsAll, getStudentAttendance, removeStudentFromBatch } from '../../../services/coachApi';

const INITIAL_STUDENTS = [];

const MyStudents = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toast, setToast] = useState(null);
  const [attendanceTab, setAttendanceTab] = useState('daily'); // 'daily' | 'monthly' | 'yearly'

  // Remove / Unenroll Student Modal State
  const [unenrollStudentTarget, setUnenrollStudentTarget] = useState(null);
  const [unenrollReason, setUnenrollReason] = useState('Student Requested Withdrawal');
  const [unenrollNotes, setUnenrollNotes] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);

  // Real Attendance Logs & Summary State for selected student
  const [studentLogs, setStudentLogs] = useState([]);
  const [studentSummary, setStudentSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, percentage: 0, streak: 0 });
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (!selectedStudent) {
      setStudentLogs([]);
      setStudentSummary({ total: 0, present: 0, absent: 0, late: 0, percentage: 0, streak: 0 });
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoadingLogs(true);
      try {
        if (isApiConfigured() && getAuthToken()) {
          const res = await getStudentAttendance(selectedStudent.id);
          if (!cancelled) {
            setStudentLogs(res.sessions || []);
            setStudentSummary(res.summary || { total: 0, present: 0, absent: 0, late: 0, percentage: 0, streak: 0 });
          }
        }
      } catch (err) {
        console.error('Failed to load student attendance:', err);
      } finally {
        if (!cancelled) setLoadingLogs(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedStudent]);
  
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    batch: 'All',
    level: 'All',
    status: 'All'
  });

  useEffect(() => {
    if (!isApiConfigured() || !getAuthToken()) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const data = await listCoachStudentsAll();
        if (cancelled) return;
        const rows = data.students || [];
        setStudents(
          rows.map((s) => ({
            enrollmentId: s.enrollmentId || `${s.batchId}_${s.userId || s.id}`,
            id: s.userId || s.id,
            studentId: s.userId || s.id,
            name: s.name || 'Student',
            batch: s.batch || '—',
            level: s.level || '—',
            status: s.status || 'Active',
            email: s.email,
            batchId: s.batchId,
          }))
        );
      } catch {
        if (!cancelled) setStudents([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleConfirmRemoveStudent = async () => {
    if (!unenrollStudentTarget || !unenrollReason) return;
    setIsRemoving(true);
    try {
      if (isApiConfigured() && getAuthToken() && unenrollStudentTarget.batchId) {
        await removeStudentFromBatch(unenrollStudentTarget.batchId, unenrollStudentTarget.id, {
          reason: unenrollReason,
          notes: unenrollNotes,
        });
      }
      setStudents((prev) =>
        prev.filter(
          (s) =>
            s.enrollmentId !== unenrollStudentTarget.enrollmentId &&
            !(s.batchId === unenrollStudentTarget.batchId && s.id === unenrollStudentTarget.id)
        )
      );
      showToast(`${unenrollStudentTarget.name} removed from ${unenrollStudentTarget.batch}`);
      setUnenrollStudentTarget(null);
      setUnenrollReason('Student Requested Withdrawal');
      setUnenrollNotes('');
    } catch (err) {
      console.error('Failed to remove student from batch:', err);
      showToast(err?.message || 'Failed to remove student from batch');
    } finally {
      setIsRemoving(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = activeFilters.batch === 'All' || s.batch === activeFilters.batch;
    const matchesLevel = activeFilters.level === 'All' || s.level === activeFilters.level;
    const matchesStatus = activeFilters.status === 'All' || s.status === activeFilters.status;
    
    return matchesSearch && matchesBatch && matchesLevel && matchesStatus;
  });

  const batches = ['All', ...new Set(students.map((s) => s.batch))];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const statuses = ['All', 'Active', 'Medical'];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto relative px-4 md:px-0">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl bg-[#36454F] border border-slate-700 text-white flex items-center gap-3 min-w-[300px]`}
          >
            <CheckCircle2 size={18} className="text-[#CE2029]" />
            <span className="text-xs font-bold uppercase tracking-wider">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enterprise Attendance Analytics Dashboard Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110]" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[120] p-6 sm:p-7 rounded-[28px] border shadow-2xl overflow-y-auto max-h-[90vh] ${
                isDark ? 'bg-[#161922] border-white/10 text-white' : 'bg-white border-slate-200 text-[#36454F]'
              }`}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#CE2029]/20 to-red-500/10 border border-[#CE2029]/30 flex items-center justify-center text-[#CE2029] font-black text-xl shadow-sm">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black tracking-tight">{selectedStudent.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {selectedStudent.status || 'Active'}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                      ID: <span className="text-[#CE2029]">{selectedStudent.id}</span> · {selectedStudent.batch}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400 transition-colors">
                  <XCircle size={20} />
                </button>
              </div>

              {/* Overall Attendance Rate Header Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 mb-5 space-y-2.5">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Overall Attendance Rate</span>
                    <h4 className="text-3xl font-black tracking-tight text-[#CE2029] mt-0.5">
                      {loadingLogs ? '...' : `${studentSummary.percentage}%`}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                    studentSummary.percentage >= 80 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : studentSummary.percentage >= 60 
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {studentSummary.percentage >= 80 ? 'High Engagement' : studentSummary.percentage >= 60 ? 'Moderate' : 'Low Engagement'}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${studentSummary.percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      studentSummary.percentage >= 80 ? 'bg-emerald-500' : studentSummary.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>

              {/* Quick Statistics Grid */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-center">
                  <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Total</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5 block">{studentSummary.total}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400 block tracking-wider">Present</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{studentSummary.present}</span>
                </div>
                <div className="p-3 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-center">
                  <span className="text-[8px] font-black uppercase text-red-600 dark:text-red-400 block tracking-wider">Absent</span>
                  <span className="text-lg font-black text-red-600 dark:text-red-400 mt-0.5 block">{studentSummary.absent}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-center">
                  <span className="text-[8px] font-black uppercase text-amber-600 dark:text-amber-400 block tracking-wider">Streak</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{studentSummary.streak}🔥</span>
                </div>
              </div>

              {/* Real Session Attendance Timeline */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-400">
                    <Calendar size={14} className="text-[#CE2029]" /> Session Attendance History
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">{studentLogs.length} Sessions Logged</span>
                </div>

                {loadingLogs ? (
                  <div className="py-8 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-[#CE2029] rounded-full animate-spin" /> Loading attendance...
                  </div>
                ) : studentLogs.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {studentLogs.map((session, idx) => (
                      <div 
                        key={session.sessionId || idx}
                        className="p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between transition-all hover:border-[#CE2029]/30"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800 dark:text-white">{session.date}</span>
                            <span className="text-[10px] font-semibold text-slate-400">({session.startTime} - {session.endTime})</span>
                          </div>
                          <p className="text-[9px] font-bold text-slate-400">{session.batchName} · {session.coachName}</p>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                          session.status === 'present'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : session.status === 'late'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/[0.01]">
                    <Clock size={24} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-400">No attendance sessions recorded yet</p>
                    <p className="text-[9px] font-medium text-slate-400 mt-0.5">Attendance logs will appear as the coach submits session records.</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2 mt-8">
                <button 
                  onClick={() => {
                    const target = selectedStudent;
                    setSelectedStudent(null);
                    setUnenrollStudentTarget(target);
                  }}
                  className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all`}
                >
                   Remove from Batch
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
            <Users className="text-[#CE2029]" size={22} /> My Students
          </h2>
          <p className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Track and manage your mentee progress and performance.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-2 relative z-30">
        <div className="w-full sm:flex-1 relative group">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/20 group-focus-within:text-[#CE2029]' : 'text-slate-400 group-focus-within:text-[#CE2029]'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or ID..."
            className={`w-full py-1.5 pl-9 pr-4 rounded-lg text-[11px] transition-all shadow-sm outline-none border ${
              isDark 
                ? 'bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-[#CE2029] focus:bg-white/10' 
                : 'bg-white border-slate-200 text-[#36454F] placeholder:text-slate-400 focus:border-[#CE2029]'
            }`}
          />
        </div>
        
        <div className="relative w-full sm:w-auto">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full sm:w-auto px-4 py-1.5 rounded-lg border flex items-center justify-center gap-2 text-[11px] font-bold transition-all ${
              showFilters || Object.values(activeFilters).some(v => v !== 'All')
                ? 'bg-[#CE2029] border-[#CE2029] text-white shadow-lg shadow-[#CE2029]/20'
                : isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-[#CE2029] hover:text-[#CE2029]'
            }`}
          >
            <Filter size={14} /> 
            Filters
            {Object.values(activeFilters).some(v => v !== 'All') && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute right-0 mt-2 w-64 p-4 rounded-2xl shadow-2xl border z-[60] ${
                  isDark ? 'bg-[#1a1d24] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#CE2029] mb-2 block">Batch</label>
                    <div className="flex flex-wrap gap-1.5">
                      {batches.map(v => (
                        <button
                          key={v}
                          onClick={() => setActiveFilters({...activeFilters, batch: v})}
                          className={`px-2 py-1 rounded-md text-[9px] font-bold border transition-all ${
                            activeFilters.batch === v 
                              ? 'bg-[#CE2029] border-[#CE2029] text-white'
                              : isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-100 text-slate-500'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#CE2029] mb-2 block">Level</label>
                    <div className="flex flex-wrap gap-1.5">
                      {levels.map(v => (
                        <button
                          key={v}
                          onClick={() => setActiveFilters({...activeFilters, level: v})}
                          className={`px-2 py-1 rounded-md text-[9px] font-bold border transition-all ${
                            activeFilters.level === v 
                              ? 'bg-[#CE2029] border-[#CE2029] text-white'
                              : isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-100 text-slate-500'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#CE2029] mb-2 block">Status</label>
                    <div className="flex flex-wrap gap-1.5">
                      {statuses.map(v => (
                        <button
                          key={v}
                          onClick={() => setActiveFilters({...activeFilters, status: v})}
                          className={`px-2 py-1 rounded-md text-[9px] font-bold border transition-all ${
                            activeFilters.status === v 
                              ? 'bg-[#CE2029] border-[#CE2029] text-white'
                              : isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-100 text-slate-500'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                        setActiveFilters({ batch: 'All', level: 'All', status: 'All' });
                        setShowFilters(false);
                    }}
                    className="w-full py-2 bg-slate-100 dark:bg-white/5 text-[9px] font-bold uppercase tracking-widest rounded-lg"
                  >
                    Reset All
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, idx) => (
            <motion.div
              key={student.enrollmentId || `${student.batchId}_${student.id}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              className={`bg-white rounded-xl border shadow-sm transition-all hover:border-[#CE2029]/40 overflow-hidden group ${
                isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'
              }`}
            >
              <div className="p-3.5">
                <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#CE2029]/10 to-[#FF4B4B]/10 border border-[#CE2029]/20 flex items-center justify-center text-[#CE2029] font-bold text-base">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className={`font-bold tracking-tight text-sm ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{student.name}</h3>
                        <p className="text-[8px] font-bold text-[#CE2029] uppercase tracking-wider">{student.id}</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setUnenrollStudentTarget(student)}
                    title="Remove student from this batch"
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-red-500 hover:bg-white/5' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'}`}
                   >
                      <Trash2 size={16} />
                   </button>
                </div>

                <div className="space-y-1.5 mb-3">
                   <div className="flex justify-between text-[10px] font-bold">
                      <span className={`${isDark ? 'text-white/40' : 'text-slate-400'} uppercase tracking-wider`}>Batch</span>
                      <span className={isDark ? 'text-white/80' : 'text-[#36454F]'}>{student.batch}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-bold">
                      <span className={`${isDark ? 'text-white/40' : 'text-slate-400'} uppercase tracking-wider`}>Level</span>
                      <span className="text-blue-500">{student.level}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-bold">
                      <span className={`${isDark ? 'text-white/40' : 'text-slate-400'} uppercase tracking-wider`}>Attnd</span>
                      <span className="text-[#CE2029]">{student.attendance}</span>
                   </div>
                </div>

                <div className={`p-2 rounded-lg border flex items-center justify-between mb-3 ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                   <div className="space-y-0.5">
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Rating</span>
                      <div className="flex items-center gap-1">
                         <Star size={10} className="text-[#CE2029] fill-[#CE2029]" />
                         <span className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{student.rating}</span>
                      </div>
                   </div>
                   <div className="text-right space-y-0.5">
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Status</span>
                      <p className={`text-[9px] font-bold uppercase ${student.status === 'Active' ? 'text-[#CE2029]' : 'text-slate-400'}`}>{student.status}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                   <button 
                    onClick={() => setSelectedStudent(student)}
                    className="py-1.5 rounded-lg bg-[#CE2029] text-white flex items-center justify-center gap-1 text-[8px] font-bold uppercase tracking-wider hover:bg-[#36454F] transition-all"
                   >
                      <GraduationCap size={12} /> Profile
                   </button>
                   <button 
                    onClick={() =>
                      navigate(
                        `/coach/students/${student.id}/performance?batchId=${encodeURIComponent(student.batchId || '')}`
                      )
                    }
                    className={`py-1.5 rounded-lg flex items-center justify-center gap-1 text-[8px] font-bold uppercase tracking-wider transition-all border ${
                      isDark ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                   >
                      <Target size={12} className="text-[#CE2029]" /> Matrix
                   </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
             <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-slate-200" />
             </div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No students match your filters</p>
          </div>
        )}
      </div>

      {/* Remove Student from Batch Confirmation Modal */}
      <AnimatePresence>
        {unenrollStudentTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUnenrollStudentTarget(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[130]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[140] p-6 sm:p-7 rounded-[28px] border shadow-2xl ${
                isDark ? 'bg-[#161922] border-white/10 text-white' : 'bg-white border-slate-200 text-[#36454F]'
              }`}
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">Remove Student from Batch</h3>
                    <p className="text-[10px] font-semibold text-slate-400">Unenroll student while preserving historical logs</p>
                  </div>
                </div>
                <button onClick={() => setUnenrollStudentTarget(null)} className="text-slate-400 hover:text-white">
                  <XCircle size={18} />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 mb-4 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Student:</span>
                  <span className="text-slate-800 dark:text-white font-black">{unenrollStudentTarget.name}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Current Batch:</span>
                  <span className="text-[#CE2029] font-black">{unenrollStudentTarget.batch}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                    Reason for Removal *
                  </label>
                  <select
                    value={unenrollReason}
                    onChange={(e) => setUnenrollReason(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold transition-all ${
                      isDark ? 'bg-[#12151c] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="Student Requested Withdrawal">Student Requested Withdrawal</option>
                    <option value="Shifted to Another Batch">Shifted to Another Batch</option>
                    <option value="Long-term Absence">Long-term Absence</option>
                    <option value="Disciplinary Action">Disciplinary Action</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={unenrollNotes}
                    onChange={(e) => setUnenrollNotes(e.target.value)}
                    placeholder="Provide additional details regarding this unenrollment..."
                    className={`w-full p-3 rounded-xl border text-xs font-medium transition-all ${
                      isDark ? 'bg-[#12151c] border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setUnenrollStudentTarget(null)}
                  disabled={isRemoving}
                  className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRemoveStudent}
                  disabled={isRemoving}
                  style={{ color: '#ffffff', backgroundColor: '#CE2029' }}
                  className="flex-1 py-3.5 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 hover:bg-[#b01b22] transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  {isRemoving ? 'Removing...' : 'Remove from Batch'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyStudents;
