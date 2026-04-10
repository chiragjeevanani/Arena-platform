import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Star, User, ChevronDown, ChevronUp, Search,
  Award, Target, Activity, BookOpen, BarChart2, X, CheckCircle2, Edit3, Settings2
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const INITIAL_STUDENTS = [
  {
    id: 1, name: 'Ananya Rao', batch: 'Morning Elite', level: 'Intermediate', avatar: 'AR',
    attendance: 92, overall: 88,
    skills: [
      { name: 'Footwork', score: 90 },
      { name: 'Smash Power', score: 82 },
      { name: 'Backhand', score: 75 },
      { name: 'Net Play', score: 88 },
      { name: 'Stamina', score: 94 },
    ],
    trend: '+6%',
    remarks: 3,
  },
  {
    id: 2, name: 'Arjun Mehta', batch: 'Morning Elite', level: 'Advanced', avatar: 'AM',
    attendance: 97, overall: 94,
    skills: [
      { name: 'Footwork', score: 95 },
      { name: 'Smash Power', score: 93 },
      { name: 'Backhand', score: 90 },
      { name: 'Net Play', score: 96 },
      { name: 'Stamina', score: 98 },
    ],
    trend: '+3%',
    remarks: 5,
  },
  {
    id: 3, name: 'Sanya Gupta', batch: 'Junior Stars', level: 'Advanced', avatar: 'SG',
    attendance: 78, overall: 74,
    skills: [
      { name: 'Footwork', score: 72 },
      { name: 'Smash Power', score: 78 },
      { name: 'Backhand', score: 68 },
      { name: 'Net Play', score: 80 },
      { name: 'Stamina', score: 70 },
    ],
    trend: '-2%',
    remarks: 2,
  },
  {
    id: 4, name: 'Kabir Singh', batch: 'Junior Stars', level: 'Beginner', avatar: 'KS',
    attendance: 85, overall: 65,
    skills: [
      { name: 'Footwork', score: 60 },
      { name: 'Smash Power', score: 55 },
      { name: 'Backhand', score: 62 },
      { name: 'Net Play', score: 70 },
      { name: 'Stamina', score: 78 },
    ],
    trend: '+12%',
    remarks: 4,
  },
];

const LEVEL_COLOR = {
  Beginner: '#22c55e',
  Intermediate: '#f59e0b',
  Advanced: '#CE2029',
};

const SkillBar = ({ name, score, isDark }) => (
  <div className="mb-2">
    <div className="flex justify-between items-center mb-1">
      <span className={`text-[10px] font-semibold uppercase tracking-wide ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{name}</span>
      <span className={`text-[10px] font-bold ${score >= 85 ? 'text-[#CE2029]' : isDark ? 'text-white/70' : 'text-slate-700'}`}>{score}%</span>
    </div>
    <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: score >= 85 ? '#CE2029' : score >= 70 ? '#f59e0b' : '#94a3b8' }}
      />
    </div>
  </div>
);

// ── Edit Progress Modal ───────────────────────────────────────
const EditProgressModal = ({ student, onSave, onClose, isDark }) => {
  const [skills, setSkills] = useState([...student.skills]);
  const [saving, setSaving] = useState(false);

  const updateScore = (name, val) => {
    setSkills(prev => prev.map(s => s.name === name ? { ...s, score: parseInt(val) } : s));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave(student.id, skills);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className={`relative w-full max-w-sm rounded-[2.5rem] border shadow-2xl p-8 overflow-hidden ${isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ backgroundColor: LEVEL_COLOR[student.level] }}>{student.avatar}</div>
          <div>
            <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{student.name}</h3>
            <p className="text-[10px] font-black uppercase text-[#CE2029] tracking-widest">{student.batch}</p>
          </div>
        </div>
        <div className="space-y-6">
          {skills.map((skill) => (
            <div key={skill.name}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{skill.name}</span>
                <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{skill.score}%</span>
              </div>
              <input type="range" min="0" max="100" value={skill.score} onChange={(e) => updateScore(skill.name, e.target.value)}
                className="w-full accent-[#CE2029] h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer" />
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full mt-10 py-4 rounded-2xl bg-[#CE2029] text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-[#CE2029]/20">
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Save Progress <CheckCircle2 size={18} /></>}
        </button>
      </motion.div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────
const ProgressTracker = () => {
  const { isDark } = useTheme();
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('overall');
  const [toast, setToast] = useState(null);
  const [editStudent, setEditStudent] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleSaveProgress = (id, newSkills) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const newOverall = Math.round(newSkills.reduce((a, sk) => a + sk.score, 0) / newSkills.length);
        return { ...s, skills: newSkills, overall: newOverall };
      }
      return s;
    }));
    showToast('Student metrics updated');
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.batch.toLowerCase().includes(search.toLowerCase())).sort((a, b) => {
    if (sortBy === 'overall') return b.overall - a.overall;
    if (sortBy === 'attendance') return b.attendance - a.attendance;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const avgValue = (key) => Math.round(students.reduce((a, s) => a + s[key], 0) / students.length);

  return (
    <div className="space-y-3 max-w-[1600px] mx-auto relative px-1">
      <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] bg-[#36454F] border border-slate-700 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 min-w-[240px]"><CheckCircle2 size={16} className="text-[#CE2029]" /><span className="text-[10px] font-bold uppercase tracking-widest">{toast}</span></motion.div>}</AnimatePresence>
      <AnimatePresence>{editStudent && <EditProgressModal student={editStudent} onSave={handleSaveProgress} onClose={() => setEditStudent(null)} isDark={isDark} />}</AnimatePresence>

      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div><h2 className={`text-xl font-semibold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#36454F]'}`}><TrendingUp className="text-[#CE2029]" size={20} /> Progress Tracker</h2><p className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Per-student performance metrics, skill ratings, and attendance history.</p></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Students', value: students.length, icon: User, color: '#CE2029' },
          { label: 'Avg Overall', value: `${avgValue('overall')}%`, icon: Target, color: '#6366f1' },
          { label: 'Avg Attendance', value: `${avgValue('attendance')}%`, icon: Activity, color: '#22c55e' },
          { label: 'Total Remarks', value: students.reduce((a, s) => a + s.remarks, 0), icon: BookOpen, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className={`p-2.5 rounded-xl border shadow-sm flex items-center gap-2.5 ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15`, color: s.color }}><s.icon size={16} /></div>
            <div><p className={`text-[7px] font-semibold uppercase tracking-widest leading-none mb-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{s.label}</p><p className={`text-lg font-bold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="flex-1 relative group w-full"><Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/20' : 'text-slate-400'}`} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or batch..." className={`w-full pl-9 pr-4 py-1.5 rounded-lg text-[11px] border outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-[#CE2029]' : 'bg-white border-slate-200 text-[#36454F] focus:border-[#CE2029]'}`} /></div>
        <div className="flex items-center gap-1 shrink-0"><span className={`text-[8px] font-semibold uppercase tracking-widest mr-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Sort:</span>{['overall', 'attendance', 'name'].map(opt => (<button key={opt} onClick={() => setSortBy(opt)} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${sortBy === opt ? 'bg-[#CE2029] text-white border-[#CE2029] shadow-sm' : isDark ? 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-500 hover:border-[#CE2029]'}`}>{opt}</button>))}</div>
      </div>

      <div className="space-y-2">
        {filtered.map((student, idx) => {
          const isOpen = expanded === student.id;
          const trendUp = student.trend.startsWith('+');
          return (
            <motion.div key={student.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
              <button className="w-full flex items-center gap-4 p-2.5 sm:px-4 text-left" onClick={() => setExpanded(isOpen ? null : student.id)}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 text-white" style={{ backgroundColor: LEVEL_COLOR[student.level] }}>{student.avatar}</div>
                <div className="flex-1 min-w-0"><div className="flex items-center gap-1.5 leading-none"><h4 className={`font-bold text-sm tracking-tight truncate ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{student.name}</h4>{student.overall >= 90 && <Award size={12} className="text-yellow-500 fill-yellow-500 shrink-0" />}</div><p className={`text-[9px] font-semibold uppercase tracking-wider mt-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{student.batch} · <span style={{ color: LEVEL_COLOR[student.level] }}>{student.level}</span></p></div>
                <div className="flex items-center gap-4 sm:gap-6 shrink-0"><div className="text-center hidden sm:block"><p className={`text-[9px] font-semibold uppercase tracking-widest mb-0.5 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Overall</p><p className={`text-base font-bold leading-none ${student.overall >= 85 ? 'text-[#CE2029]' : isDark ? 'text-white' : 'text-[#36454F]'}`}>{student.overall}%</p></div><div className="text-center hidden sm:block"><p className={`text-[9px] font-semibold uppercase tracking-widest mb-0.5 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Attendance</p><p className={`text-base font-bold leading-none ${student.attendance >= 90 ? 'text-green-500' : 'text-amber-500'}`}>{student.attendance}%</p></div><div className={`flex items-center gap-0.5 text-xs font-bold ${trendUp ? 'text-green-500' : 'text-red-400'}`}>{trendUp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}{student.trend}</div><div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#CE2029]' : 'text-slate-400'}`}><ChevronDown size={16} /></div></div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className={`px-4 pb-4 pt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-100'} ${isDark ? 'bg-white/[0.01]' : 'bg-slate-50/30'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div><p className={`text-[9px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}><BarChart2 size={11} className="text-[#CE2029]" /> Skill Breakdown</p><div className="space-y-1">{student.skills.map(s => (<SkillBar key={s.name} name={s.name} score={s.score} isDark={isDark} />))}</div></div>
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-2 gap-2"><div className={`p-2.5 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'}`}><p className={`text-[8px] font-semibold uppercase tracking-widest mb-1 text-[#CE2029]`}>Attendance</p><div className="flex items-baseline gap-1"><span className={`text-xl font-bold ${student.attendance >= 90 ? 'text-green-500' : 'text-amber-500'}`}>{student.attendance}%</span><span className={`text-[8px] font-semibold ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Total</span></div></div><div className={`p-2.5 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'}`}><p className={`text-[8px] font-semibold uppercase tracking-widest mb-1 text-[#CE2029]`}>Monthly Trend</p><div className={`text-xl font-bold flex items-center gap-1 ${trendUp ? 'text-green-500' : 'text-red-400'}`}>{trendUp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}{student.trend}</div></div></div>
                          <div className={`flex-1 p-3 rounded-xl border flex flex-col justify-center ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'}`}><p className={`text-[8px] font-semibold uppercase tracking-widest mb-1 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Top Achievement</p><p className={`text-xs font-bold italic ${isDark ? 'text-white/80' : 'text-[#36454F]'}`}>"Exhibits exceptional {student.skills.slice().sort((a,b) => b.score - a.score)[0].name.toLowerCase()} in all drills"</p></div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditStudent(student)} className={`flex-1 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${isDark ? 'bg-[#CE2029] text-white border-[#CE2029]' : 'bg-[#36454F] text-white border-[#36454F] hover:bg-[#CE2029]'}`}>Update Skills</button>
                            <button onClick={() => showToast(`Generating PDF report for ${student.name}...`)} className={`flex-1 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${isDark ? 'border-white/10 text-white/50 hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:border-[#CE2029]'}`}>Export PDF</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
