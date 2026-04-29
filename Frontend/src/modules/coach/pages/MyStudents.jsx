import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Search, Filter, MoreHorizontal, MessageSquare, 
  Star, GraduationCap, XCircle, Trash2, CheckCircle2, UserCheck, Target,
  Calendar, TrendingUp, BarChart3, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { listCoachStudentsAll } from '../../../services/coachApi';

const INITIAL_STUDENTS = [];

const MyStudents = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toast, setToast] = useState(null);
  const [attendanceTab, setAttendanceTab] = useState('daily'); // 'daily' | 'monthly' | 'yearly'
  
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
            id: s.userId || s.id,
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

  const deleteStudent = (id) => {
    if (isApiConfigured() && getAuthToken()) {
      showToast('Enrollments are managed in the admin or customer app.');
      return;
    }
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showToast(`Student ${student?.name || ''} removed from roster`);
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

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[120] p-6 rounded-2xl border shadow-2xl overflow-y-auto max-h-[85vh] ${
                isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#36454F]'}`}>Student Profile</h3>
                <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <XCircle size={20} className="text-slate-400" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#CE2029]/10 border-2 border-[#CE2029]/20 flex items-center justify-center text-[#CE2029] font-bold text-2xl flex-shrink-0">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{selectedStudent.name}</h4>
                  <p className="text-[10px] font-bold text-[#CE2029] uppercase tracking-widest">{selectedStudent.id}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Batch</span>
                  <span className={`text-[11px] font-bold ${isDark ? 'text-white/60' : 'text-[#36454F]'}`}>{selectedStudent.batch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skill Level</span>
                  <span className="text-[11px] font-bold text-blue-500">{selectedStudent.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Attendance</span>
                  <span className="text-[11px] font-bold text-green-500">{selectedStudent.attendance}</span>
                </div>
              </div>

              {/* Attendance Reporting Section */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
                  <Calendar size={16} className="text-[#CE2029]" /> Attendance Reports
                </h4>
                
                {/* Report Type Tabs */}
                <div className="flex gap-2 mb-4">
                  {[
                    { id: 'daily', label: 'Daily', icon: Calendar },
                    { id: 'monthly', label: 'Monthly', icon: BarChart3 },
                    { id: 'yearly', label: 'Yearly', icon: TrendingUp }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAttendanceTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        attendanceTab === tab.id
                          ? 'bg-[#CE2029] text-white shadow-md'
                          : isDark
                            ? 'bg-white/5 text-white/60 hover:bg-white/10'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <tab.icon size={12} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Report Content */}
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  {attendanceTab === 'daily' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">This Week</h5>
                        <div className="flex gap-1">
                          <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10">
                            <ChevronLeft size={14} className={isDark ? 'text-white/60' : 'text-slate-400'} />
                          </button>
                          <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10">
                            <ChevronRight size={14} className={isDark ? 'text-white/60' : 'text-slate-400'} />
                          </button>
                        </div>
                      </div>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                        <div key={day} className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{day}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            [0, 2, 3, 4, 6].includes(idx) 
                              ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' 
                              : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                          }`}>
                            {[0, 2, 3, 4, 6].includes(idx) ? 'Present' : 'Absent'}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Weekly Rate</span>
                        <span className="text-[11px] font-bold text-[#CE2029]">71.4%</span>
                      </div>
                    </div>
                  )}

                  {attendanceTab === 'monthly' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">April 2026</h5>
                        <div className="flex gap-1">
                          <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10">
                            <ChevronLeft size={14} className={isDark ? 'text-white/60' : 'text-slate-400'} />
                          </button>
                          <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10">
                            <ChevronRight size={14} className={isDark ? 'text-white/60' : 'text-slate-400'} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {[
                          { week: 'Week 1', present: 5, total: 6 },
                          { week: 'Week 2', present: 6, total: 6 },
                          { week: 'Week 3', present: 4, total: 6 },
                          { week: 'Week 4', present: 5, total: 6 },
                        ].map((week) => (
                          <div key={week.week} className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{week.week}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#CE2029] rounded-full transition-all"
                                  style={{ width: `${(week.present / week.total) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-[#CE2029]">{week.present}/{week.total}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Rate</span>
                        <span className="text-[11px] font-bold text-[#CE2029]">83.3%</span>
                      </div>
                    </div>
                  )}

                  {attendanceTab === 'yearly' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2026</h5>
                        <div className="flex gap-1">
                          <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10">
                            <ChevronLeft size={14} className={isDark ? 'text-white/60' : 'text-slate-400'} />
                          </button>
                          <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10">
                            <ChevronRight size={14} className={isDark ? 'text-white/60' : 'text-slate-400'} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {[
                          { month: 'Jan', rate: 92 },
                          { month: 'Feb', rate: 88 },
                          { month: 'Mar', rate: 95 },
                          { month: 'Apr', rate: 83 },
                        ].map((month) => (
                          <div key={month.month} className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{month.month}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#CE2029] rounded-full transition-all"
                                  style={{ width: `${month.rate}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-[#CE2029]">{month.rate}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Yearly Average</span>
                        <span className="text-[11px] font-bold text-[#CE2029]">89.5%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mt-8">
                <button 
                  onClick={() => deleteStudent(selectedStudent.id) || setSelectedStudent(null)}
                  className={`w-full py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all`}
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
              key={student.id}
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
                    onClick={() => deleteStudent(student.id)}
                    className={`p-1 rounded-md transition-colors ${isDark ? 'text-white/20 hover:text-red-500 hover:bg-white/5' : 'text-slate-400 hover:text-red-500 hover:bg-slate-50'}`}
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
    </div>
  );
};

export default MyStudents;
