import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, Search, Filter, MoreHorizontal, MessageSquare, 
  Star, GraduationCap, XCircle, Trash2, CheckCircle2, UserCheck 
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const INITIAL_STUDENTS = [
  { id: 'STU-001', name: 'Arjun Mehta', batch: 'Morning Elite', level: 'Advanced', attendance: '95%', rating: 4.8, status: 'Active' },
  { id: 'STU-002', name: 'Sanya Gupta', batch: 'Morning Elite', level: 'Advanced', attendance: '88%', rating: 4.5, status: 'Active' },
  { id: 'STU-003', name: 'Kabir Singh', batch: 'Junior Stars', level: 'Beginner', attendance: '92%', rating: 4.2, status: 'Active' },
  { id: 'STU-004', name: 'Rohan Verma', batch: 'Junior Stars', level: 'Beginner', attendance: '75%', rating: 3.9, status: 'Medical' },
  { id: 'STU-005', name: 'Ananya Rao', batch: 'Pro Analytics', level: 'Intermediate', attendance: '100%', rating: 4.9, status: 'Active' },
];

const MyStudents = () => {
  const { isDark } = useTheme();
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const deleteStudent = (id) => {
    const student = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    showToast(`Student ${student.name} removed from roster`);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl bg-[#1a2b3c] border border-slate-700 text-white flex items-center gap-3 min-w-[300px]`}
          >
            <CheckCircle2 size={18} className="text-[#eb483f]" />
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[70] p-6 rounded-2xl border shadow-2xl ${
                isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>Student Profile</h3>
                <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <XCircle size={20} className="text-slate-400" />
                </button>
              </div>
              
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-[#eb483f]/10 border-2 border-[#eb483f]/20 flex items-center justify-center text-[#eb483f] font-bold text-3xl mb-3">
                  {selectedStudent.name.charAt(0)}
                </div>
                <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>{selectedStudent.name}</h4>
                <p className="text-[10px] font-bold text-[#eb483f] uppercase tracking-widest">{selectedStudent.id}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Batch</span>
                  <span className={`text-[11px] font-bold ${isDark ? 'text-white/60' : 'text-[#1a2b3c]'}`}>{selectedStudent.batch}</span>
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

              <div className="grid grid-cols-1 gap-2 mt-8">
                <button className="w-full py-3 bg-[#eb483f] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#1a2b3c] transition-all">
                   Manage Schedule
                </button>
                <button 
                  onClick={() => deleteStudent(selectedStudent.id) || setSelectedStudent(null)}
                  className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all`}
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
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>
            <Users className="text-[#eb483f]" size={22} /> My Students
          </h2>
          <p className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Track and manage your mentee progress and performance.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="w-full sm:flex-1 relative group">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/20 group-focus-within:text-[#eb483f]' : 'text-slate-400 group-focus-within:text-[#eb483f]'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or ID..."
            className={`w-full py-1.5 pl-9 pr-4 rounded-lg text-[11px] transition-all shadow-sm outline-none border ${
              isDark 
                ? 'bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-[#eb483f] focus:bg-white/10' 
                : 'bg-white border-slate-200 text-[#1a2b3c] placeholder:text-slate-400 focus:border-[#eb483f]'
            }`}
          />
        </div>
        <button className={`w-full sm:w-auto px-4 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all ${
          isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-[#eb483f] hover:text-[#eb483f]'
        }`}>
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStudents.map((student, idx) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            className={`bg-white rounded-xl border shadow-sm transition-all hover:border-[#eb483f]/40 overflow-hidden group ${
              isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'
            }`}
          >
            <div className="p-3.5">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#eb483f]/10 to-[#FF4B4B]/10 border border-[#eb483f]/20 flex items-center justify-center text-[#eb483f] font-bold text-base">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`font-bold tracking-tight text-sm ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>{student.name}</h3>
                      <p className="text-[8px] font-bold text-[#eb483f] uppercase tracking-wider">{student.id}</p>
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
                    <span className={isDark ? 'text-white/80' : 'text-[#1a2b3c]'}>{student.batch}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold">
                    <span className={`${isDark ? 'text-white/40' : 'text-slate-400'} uppercase tracking-wider`}>Level</span>
                    <span className="text-blue-500">{student.level}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold">
                    <span className={`${isDark ? 'text-white/40' : 'text-slate-400'} uppercase tracking-wider`}>Attnd</span>
                    <span className="text-[#eb483f]">{student.attendance}</span>
                 </div>
              </div>

              <div className={`p-2 rounded-lg border flex items-center justify-between mb-3 ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                 <div className="space-y-0.5">
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Rating</span>
                    <div className="flex items-center gap-1">
                       <Star size={10} className="text-[#eb483f] fill-[#eb483f]" />
                       <span className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>{student.rating}</span>
                    </div>
                 </div>
                 <div className="text-right space-y-0.5">
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Status</span>
                    <p className={`text-[9px] font-bold uppercase ${student.status === 'Active' ? 'text-[#eb483f]' : 'text-slate-400'}`}>{student.status}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                 <button 
                  onClick={() => setSelectedStudent(student)}
                  className="py-1.5 rounded-lg bg-[#eb483f] text-white flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider hover:bg-[#1a2b3c] transition-all"
                 >
                    <GraduationCap size={12} /> View Student Profile
                 </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyStudents;
