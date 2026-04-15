import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, Users, Clock, MapPin, 
  ChevronRight, Search, Plus, 
  MoreVertical, Video, Info
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const BATCHES = [
  { id: 1, name: 'Morning Elite', level: 'Advanced', students: 12, maxStudents: 15, schedule: 'Mon, Wed, Fri', time: '06:00 AM - 08:00 AM', arena: 'AMM Sports Arena', court: 'Court 1', color: '#CE2029', type: 'Offline' },
  { id: 2, name: 'Junior Stars', level: 'Beginner', students: 8, maxStudents: 20, schedule: 'Tue, Thu, Sat', time: '08:00 AM - 09:30 AM', arena: 'Badminton Hub', court: 'Court 3', color: '#36454F', type: 'Offline' },
  { id: 3, name: 'Pro Analytics', level: 'Intermediate', students: 15, maxStudents: 15, schedule: 'Wed, Sat', time: '01:00 PM - 02:30 PM', arena: 'Online', court: 'Zoom', color: '#6366f1', type: 'Online' },
  { id: 4, name: 'Evening Drill', level: 'Intermediate', students: 10, maxStudents: 18, schedule: 'Mon, Fri', time: '11:00 AM - 01:00 PM', arena: 'AMM Sports Arena', court: 'Court 2', color: '#f59e0b', type: 'Offline' }
];
const CoachBatches = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [batches, setBatches] = useState(BATCHES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBatch, setNewBatch] = useState({ name: '', level: 'Beginner', time: '' });
  const [activeMenuId, setActiveMenuId] = useState(null);

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e) => {
    e.preventDefault();
    
    if (newBatch.id) {
       // Edit mode
       setBatches(batches.map(b => b.id === newBatch.id ? { ...b, name: newBatch.name, level: newBatch.level } : b));
    } else {
       // Create mode
       const colors = ['#CE2029', '#36454F', '#6366f1', '#f59e0b', '#22c55e', '#ec4899'];
       const randomColor = colors[Math.floor(Math.random() * colors.length)];
       const createdBatch = {
         id: Date.now(),
         name: newBatch.name,
         level: newBatch.level,
         students: 0,
         maxStudents: 20,
         schedule: 'TBD',
         time: newBatch.time || '09:00 AM - 11:00 AM',
         arena: 'AMM Sports Arena',
         court: 'Court 1',
         color: randomColor,
         type: 'Offline'
       };
       setBatches([createdBatch, ...batches]);
    }
    
    setShowAddModal(false);
    setNewBatch({ name: '', level: 'Beginner', time: '' });
  };

  const handleDelete = (id) => {
    setBatches(batches.filter(b => b.id !== id));
    setActiveMenuId(null);
  };

  const handleEdit = (batch) => {
    setNewBatch(batch);
    setShowAddModal(true);
    setActiveMenuId(null);
  };

  return (
    <div 
      className={`min-h-screen p-4 md:p-8 pb-32 md:pb-8 ${isDark ? 'text-white' : 'text-slate-800'}`}
      onClick={() => setActiveMenuId(null)}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Active Batches
          </h1>
          <p className={`text-[7px] font-black uppercase tracking-[0.3em] mt-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
             Batch Management System
          </p>
        </div>
        
        <div className="flex items-center gap-2">
            <div className={`relative flex-1 md:w-64 flex items-center px-4 h-11 rounded-xl border transition-all ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            }`}>
                <Search size={16} className="text-slate-400 mr-2" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-transparent border-none outline-none text-xs font-bold w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

        </div>
      </div>

      {/* NEW BATCH MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-md rounded-[32px] p-8 shadow-2xl border ${isDark ? 'bg-[#1a1d24] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
            >
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6">
                {newBatch.id ? 'Edit Batch' : 'Create New Batch'}
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#CE2029]">Batch Name</label>
                  <input 
                    required
                    type="text" 
                    value={newBatch.name}
                    onChange={(e) => setNewBatch({...newBatch, name: e.target.value})}
                    className={`w-full mt-2 bg-transparent border-b-2 outline-none p-2 font-bold text-sm ${isDark ? 'border-white/10 focus:border-[#CE2029]' : 'border-slate-100 focus:border-[#CE2029]'}`}
                    placeholder="e.g. Evening Elite"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#CE2029]">Level</label>
                  <select 
                    value={newBatch.level}
                    onChange={(e) => setNewBatch({...newBatch, level: e.target.value})}
                    className={`w-full mt-2 bg-transparent border-b-2 outline-none p-2 font-bold text-sm ${isDark ? 'border-white/10' : 'border-slate-100'}`}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-4">
                   <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5"
                   >
                     Cancel
                   </button>
                   <button 
                    type="submit"
                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/20"
                   >
                     {newBatch.id ? 'Save Changes' : 'Create Batch'}
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grid Layout - Responsive Adaptive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {filteredBatches.map((batch, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`group relative flex flex-col rounded-2xl border overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
              isDark ? 'bg-[#1a1c1e] border-white/5' : 'bg-white border-slate-100'
            }`}
          >
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: batch.color }} />
            
            <div className="flex flex-col p-3.5 md:p-5 pb-3.5 md:pb-5 flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                 <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 shadow-inner`} style={{ backgroundColor: `${batch.color}10`, color: batch.color }}>
                    {batch.type === 'Online' ? <Video size={15} /> : <Layers size={15} />}
                 </div>
                 
                 <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === batch.id ? null : batch.id);
                      }}
                      className={`p-1 md:p-1.5 rounded-lg transition-all ${
                        activeMenuId === batch.id 
                          ? 'bg-[#CE2029] text-white' 
                          : isDark ? 'hover:bg-white/5 text-white/20' : 'hover:bg-slate-100 text-slate-300'
                      }`}
                    >
                        <MoreVertical size={16} />
                    </button>

                    <AnimatePresence>
                      {activeMenuId === batch.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          className={`absolute right-0 mt-2 w-40 rounded-2xl shadow-2xl border z-50 overflow-hidden ${
                            isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-100'
                          }`}
                        >
                          <div className="p-1.5 space-y-1">
                            <button 
                              onClick={() => handleEdit(batch)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                isDark ? 'hover:bg-white/5 text-white/50' : 'hover:bg-slate-50 text-slate-500'
                              }`}
                            >
                              Edit Batch
                            </button>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(batch.id);
                                setActiveMenuId(null);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                isDark ? 'hover:bg-white/5 text-white/50' : 'hover:bg-slate-50 text-slate-500'
                              }`}
                            >
                              Copy ID
                            </button>
                            <div className={`h-px mx-2 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                            <button 
                              onClick={() => handleDelete(batch.id)}
                              className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
              </div>

              {/* Body */}
              <div className="mb-5">
                 <h3 className="text-xs md:text-base font-black leading-tight tracking-tight uppercase line-clamp-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{batch.name}</h3>
                 <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${
                     isDark ? 'border-white/10 text-white/30' : 'border-slate-200 text-slate-400'
                 } mt-1.5 inline-block`}>{batch.level}</span>
                 {batch.type !== 'Online' && (
                    <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ml-2 ${
                        isDark ? 'bg-[#CE2029]/10 border-[#CE2029]/20 text-[#CE2029]' : 'bg-[#CE2029]/5 border-[#CE2029]/10 text-[#CE2029]'
                    } mt-1.5 inline-block`}>{batch.court}</span>
                 )}
              </div>

              {/* Bottom: Adaptive Actions */}
              <div className="mt-auto space-y-2">
                <button 
                  onClick={() => navigate(`/coach/batches/${batch.id}/students`)}
                  className={`w-full p-2 md:p-2.5 rounded-xl flex items-center justify-between border transition-all hover:border-[#CE2029]/30 active:scale-95 ${
                    isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                    <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-[#CE2029]" />
                        <span className="text-[10px] md:text-xs font-black" style={{ color: batch.color }}>{batch.students} <span className="text-[9px] opacity-40 ml-1">Reg</span></span>
                    </div>
                    <ChevronRight size={10} className="opacity-20" />
                </button>

                <button 
                  onClick={() => navigate(`/coach/batches/${batch.id}`)}
                  className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] border ${
                    isDark ? 'border-white/10 text-white/40 hover:bg-white/5' : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                    <Info size={12} />
                    Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CoachBatches;
