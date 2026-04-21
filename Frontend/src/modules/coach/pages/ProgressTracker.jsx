import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Star, User, ChevronDown, Search,
  Award, Target, Activity, BookOpen, BarChart2, X, CheckCircle2, Edit3,
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import {
  listCoachStudentsAll,
  listCoachProgressSummary,
  upsertBatchProgress,
} from '../../../services/coachApi';
import {
  COACH_PERFORMANCE_RUBRIC,
  buildMetricsPayloadFromRubric,
  scoresFromApiMetrics,
} from '../utils/performanceRubric';

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

function metricsToSkills(metrics) {
  return (metrics || []).map((m) => ({
    name: m.name || m.metricKey,
    score: Math.min(100, Math.round((Number(m.score) || 0) * 10)),
  }));
}

function overallPct(metrics) {
  if (!metrics?.length) return 0;
  const avg = metrics.reduce((a, m) => a + (Number(m.score) || 0), 0) / metrics.length;
  return Math.min(100, Math.round(avg * 10));
}

const EditProgressModal = ({ student, onSave, onClose, isDark }) => {
  const rubric = COACH_PERFORMANCE_RUBRIC;
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = {};
    rubric.forEach((g) => {
      g.metrics.forEach((m) => {
        init[m.id] = 0;
      });
    });
    const fromApi = scoresFromApiMetrics(student._apiMetrics);
    setScores({ ...init, ...fromApi });
  }, [student, rubric]);

  const updateScore = (key, val) => {
    setScores((prev) => ({ ...prev, [key]: parseInt(val, 10) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const metrics = buildMetricsPayloadFromRubric(rubric, scores);
      await upsertBatchProgress(student.batchId, {
        userId: student.userId,
        metrics,
      });
      onSave();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className={`relative w-full max-w-sm rounded-[2.5rem] border shadow-2xl p-8 overflow-hidden ${
          isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
            style={{ backgroundColor: LEVEL_COLOR[student.level] || '#6366f1' }}
          >
            {(student.name || '?').slice(0, 1)}
          </div>
          <div>
            <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{student.name}</h3>
            <p className="text-[10px] font-black uppercase text-[#CE2029] tracking-widest">{student.batch}</p>
          </div>
        </div>
        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
          {rubric.flatMap((g) =>
            g.metrics.map((m) => (
              <div key={m.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    {g.category} · {m.name}
                  </span>
                  <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{scores[m.id] ?? 0}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={scores[m.id] ?? 0}
                  onChange={(e) => updateScore(m.id, e.target.value)}
                  className="w-full accent-[#CE2029] h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer"
                />
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-10 py-4 rounded-2xl bg-[#CE2029] text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-[#CE2029]/20"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Save Progress <CheckCircle2 size={18} /></>}
        </button>
      </motion.div>
    </div>
  );
};

const ProgressTracker = () => {
  const { isDark } = useTheme();
  const [students, setStudents] = useState([]);
  const [progressByKey, setProgressByKey] = useState({});
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('overall');
  const [toast, setToast] = useState(null);
  const [editStudent, setEditStudent] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const reload = async () => {
    if (!isApiConfigured() || !getAuthToken()) {
      setLoading(false);
      setLoadError('API not configured');
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      const [stuRes, progRes] = await Promise.all([listCoachStudentsAll(), listCoachProgressSummary()]);
      const rows = stuRes.students || [];
      const progRows = progRes.records || [];
      const map = {};
      progRows.forEach((r) => {
        map[`${r.batchId}-${r.studentUserId}`] = r;
      });
      setProgressByKey(map);
      const merged = rows.map((s) => {
        const pr = map[`${s.batchId}-${s.userId}`];
        const metrics = pr?.metrics || [];
        const skills = metricsToSkills(metrics);
        const overall = overallPct(metrics);
        const level = overall >= 80 ? 'Advanced' : overall >= 55 ? 'Intermediate' : 'Beginner';
        return {
          id: `${s.batchId}-${s.userId}`,
          userId: s.userId,
          batchId: s.batchId,
          name: s.name,
          batch: s.batch || '',
          level,
          overall,
          attendance: 0,
          trend: '+0%',
          skills: skills.length ? skills : [{ name: 'Footwork', score: 0 }],
          remarks: 0,
          avatar: (s.name || '?').slice(0, 1),
          _apiMetrics: metrics,
        };
      });
      setStudents(merged);
    } catch (e) {
      setLoadError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleSaveProgress = () => {
    reload();
    showToast('Student metrics updated');
  };

  const filtered = useMemo(() => {
    const f = students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.batch.toLowerCase().includes(search.toLowerCase())
    );
    return [...f].sort((a, b) => {
      if (sortBy === 'overall') return b.overall - a.overall;
      if (sortBy === 'attendance') return b.attendance - a.attendance;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [students, search, sortBy]);

  const avgValue = (key) => {
    if (!students.length) return 0;
    return Math.round(students.reduce((a, s) => a + s[key], 0) / students.length);
  };

  if (loading) {
    return (
      <div className={`p-6 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
        <p className="text-sm font-bold">Loading progress…</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-[1600px] mx-auto relative px-1">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] bg-[#36454F] border border-slate-700 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 min-w-[240px]"
          >
            <CheckCircle2 size={16} className="text-[#CE2029]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editStudent && (
          <EditProgressModal student={editStudent} onSave={handleSaveProgress} onClose={() => setEditStudent(null)} isDark={isDark} />
        )}
      </AnimatePresence>

      {loadError ? <p className="text-xs text-red-600 font-medium">{loadError}</p> : null}

      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl font-semibold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
            <TrendingUp className="text-[#CE2029]" size={20} /> Progress Tracker
          </h2>
          <p className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Per-student performance metrics from saved assessments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Students', value: students.length, icon: User, color: '#CE2029' },
          { label: 'Avg Overall', value: `${avgValue('overall')}%`, icon: Target, color: '#6366f1' },
          { label: 'Avg Attendance', value: `${avgValue('attendance')}%`, icon: Activity, color: '#22c55e' },
          { label: 'With data', value: Object.keys(progressByKey).length, icon: BookOpen, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className={`p-2.5 rounded-xl border shadow-sm flex items-center gap-2.5 ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
              <s.icon size={16} />
            </div>
            <div>
              <p className={`text-[7px] font-semibold uppercase tracking-widest leading-none mb-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{s.label}</p>
              <p className={`text-lg font-bold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="flex-1 relative group w-full">
          <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/20' : 'text-slate-400'}`} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or batch..."
            className={`w-full pl-9 pr-4 py-1.5 rounded-lg text-[11px] border outline-none transition-all ${
              isDark ? 'bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-[#CE2029]' : 'bg-white border-slate-200 text-[#36454F] focus:border-[#CE2029]'
            }`}
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[8px] font-semibold uppercase tracking-widest mr-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Sort:</span>
          {['overall', 'attendance', 'name'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSortBy(opt)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${
                sortBy === opt
                  ? 'bg-[#CE2029] text-white border-[#CE2029] shadow-sm'
                  : isDark
                    ? 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-[#CE2029]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((student, idx) => {
          const isOpen = expanded === student.id;
          const trendUp = student.trend.startsWith('+');
          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}
            >
              <button
                type="button"
                className="w-full flex items-center gap-4 p-2.5 sm:px-4 text-left"
                onClick={() => setExpanded(isOpen ? null : student.id)}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 text-white"
                  style={{ backgroundColor: LEVEL_COLOR[student.level] || '#6366f1' }}
                >
                  {student.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 leading-none">
                    <h4 className={`font-bold text-sm tracking-tight truncate ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{student.name}</h4>
                    {student.overall >= 90 && <Award size={12} className="text-yellow-500 fill-yellow-500 shrink-0" />}
                  </div>
                  <p className={`text-[9px] font-semibold uppercase tracking-wider mt-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                    {student.batch} · <span style={{ color: LEVEL_COLOR[student.level] }}>{student.level}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                  <div className="text-center hidden sm:block">
                    <p className={`text-[9px] font-semibold uppercase tracking-widest mb-0.5 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Overall</p>
                    <p className={`text-base font-bold leading-none ${student.overall >= 85 ? 'text-[#CE2029]' : isDark ? 'text-white' : 'text-[#36454F]'}`}>{student.overall}%</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className={`text-[9px] font-semibold uppercase tracking-widest mb-0.5 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Attendance</p>
                    <p className={`text-base font-bold leading-none ${student.attendance >= 90 ? 'text-green-500' : 'text-amber-500'}`}>{student.attendance}%</p>
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-bold ${trendUp ? 'text-green-500' : 'text-red-400'}`}>
                    {trendUp ? <ChevronDown size={14} className="rotate-180" /> : <ChevronDown size={14} />}
                    {student.trend}
                  </div>
                  <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#CE2029]' : 'text-slate-400'}`}>
                    <ChevronDown size={16} />
                  </div>
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className={`px-4 pb-4 pt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-100'} ${isDark ? 'bg-white/[0.01]' : 'bg-slate-50/30'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div>
                          <p className={`text-[9px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                            <BarChart2 size={11} className="text-[#CE2029]" /> Skill Breakdown
                          </p>
                          <div className="space-y-1">
                            {student.skills.map((sk) => (
                              <SkillBar key={sk.name} name={sk.name} score={sk.score} isDark={isDark} />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditStudent(student)}
                              className={`flex-1 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${
                                isDark ? 'bg-[#CE2029] text-white border-[#CE2029]' : 'bg-[#36454F] text-white border-[#36454F] hover:bg-[#CE2029]'
                              }`}
                            >
                              Update Skills
                            </button>
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

      {!filtered.length && !loadError ? (
        <p className={`text-sm text-center py-8 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>No students in your batches yet.</p>
      ) : null}
    </div>
  );
};

export default ProgressTracker;
