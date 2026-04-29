import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GraduationCap, Star, Target, ChevronRight, Trophy, X, Activity } from 'lucide-react';
import { listAdminBatchStudents } from '../../../services/adminOpsApi';
import { COACH_PERFORMANCE_RUBRIC } from '../../coach/utils/performanceRubric';

const CoachingStudentMatrix = ({ arenaId, batches = [] }) => {
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(batches[0].id);
    }
  }, [batches]);

  useEffect(() => {
    if (!selectedBatchId) return;
    loadStudents(selectedBatchId);
  }, [selectedBatchId]);

  const loadStudents = async (batchId) => {
    setLoading(true);
    try {
      const res = await listAdminBatchStudents(batchId);
      setStudents(res.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="shrink-0">
             <label className="text-[9px] font-black uppercase text-[#CE2029] tracking-widest block mb-1">Target Batch</label>
             <select 
               value={selectedBatchId}
               onChange={(e) => setSelectedBatchId(e.target.value)}
               className="py-2 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-black min-w-[200px]"
             >
               {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
             </select>
          </div>
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             <input 
               type="text"
               placeholder="Search Roster..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full py-2 pl-9 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#CE2029] outline-none text-[12px] font-bold"
             />
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right">
              <p className="text-2xl font-black text-[#1e293b] leading-none">{students.length}</p>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Enrolled Students</p>
           </div>
           <div className="h-10 w-px bg-slate-100" />
           <div className="text-right">
              <p className="text-2xl font-black text-[#CE2029] leading-none">
                 {students.length > 0 ? (students.reduce((acc, s) => acc + Number(s.performanceScore), 0) / students.length).toFixed(1) : '0.0'}
              </p>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Avg Performance</p>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
           <div className="w-10 h-10 border-4 border-slate-100 border-t-[#CE2029] rounded-full animate-spin mx-auto" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Syncing Student Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group p-5 rounded-[28px] bg-white border border-slate-100 shadow-sm hover:border-[#CE2029] hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer"
              onClick={() => setSelectedStudent(student)}
            >
               <div>
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#CE2029] font-black text-xl group-hover:bg-[#CE2029] group-hover:text-white transition-all">
                        {student.name.charAt(0)}
                     </div>
                     <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                           <Star size={14} className="text-orange-400 fill-orange-400" />
                           <span className="text-[18px] font-black text-[#1e293b] tracking-tighter">{student.performanceScore}</span>
                        </div>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Weighted Score</span>
                     </div>
                  </div>
                  <h3 className="text-[15px] font-black text-[#1e293b] uppercase italic leading-none truncate group-hover:text-[#CE2029] transition-colors">{student.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1.5 truncate">{student.email}</p>
               </div>

               <div className="mt-6 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center text-[10px] font-black">
                     <span className="text-slate-400 uppercase tracking-widest">Attendance</span>
                     <span className="text-[#1e293b]">{student.attendancePercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-[#CE2029] rounded-full" 
                        style={{ width: `${student.attendancePercentage}%` }}
                     />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black pt-1">
                     <span className="text-slate-400 uppercase tracking-widest">Last Update</span>
                     <span className="text-slate-500">{student.lastProgressUpdate ? new Date(student.lastProgressUpdate).toLocaleDateString() : 'Never'}</span>
                  </div>
               </div>
               
               <button className="w-full mt-4 py-3 rounded-xl border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-[#CE2029] group-hover:text-white group-hover:border-[#CE2029] transition-all flex items-center justify-center gap-2">
                  <Target size={12} /> View Full Matrix
               </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Student Matrix Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] rounded-[40px] bg-white shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-[#CE2029] text-white flex items-center justify-center text-2xl font-black">
                      {selectedStudent.name.charAt(0)}
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-[#1e293b] uppercase italic leading-none">{selectedStudent.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                         <GraduationCap size={14} className="text-[#CE2029]" /> Performance Assessment Matrix
                      </p>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#CE2029] transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                 <div className="grid grid-cols-3 gap-4">
                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Overall Score</p>
                       <p className="text-3xl font-black text-[#CE2029] tracking-tighter italic">{selectedStudent.performanceScore}</p>
                    </div>
                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                       <p className="text-3xl font-black text-[#1e293b] tracking-tighter italic">{selectedStudent.attendancePercentage}%</p>
                    </div>
                    <div className="p-5 rounded-3xl bg-[#1e293b] border border-white/5">
                       <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Assessment</p>
                       <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                          <Activity size={12} /> Live Sync
                       </p>
                    </div>
                 </div>

                 <div className="space-y-8">
                    {COACH_PERFORMANCE_RUBRIC.map((group) => (
                       <div key={group.category}>
                          <h4 className="text-[10px] font-black text-[#CE2029] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                             <div className="w-4 h-px bg-[#CE2029]/20" /> {group.category}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {group.metrics.map((m) => {
                                const score = selectedStudent.metrics?.find(sm => sm.metricKey === m.id)?.score || 0;
                                return (
                                   <div key={m.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                                      <div className="flex-1 pr-4">
                                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{m.name}</p>
                                         <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                                            {Array.from({ length: 10 }).map((_, i) => (
                                               <div key={i} className={`flex-1 rounded-full ${i < score ? 'bg-[#CE2029]' : 'bg-slate-200/50'}`} />
                                            ))}
                                         </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                         <span className="text-[14px] font-black text-[#1e293b] tracking-tighter">{score}.0</span>
                                      </div>
                                   </div>
                                );
                             })}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50 shrink-0">
                 <div className="flex items-center gap-3">
                    <Trophy className="text-[#CE2029]" size={20} />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                       Assessment data is managed by the assigned Coach. Arena Admin view is read-only.
                    </p>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachingStudentMatrix;
