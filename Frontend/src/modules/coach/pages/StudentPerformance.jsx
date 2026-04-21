import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Trophy, Save, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import {
  listCoachBatchesForStudent,
  listBatchProgress,
  upsertBatchProgress,
} from '../../../services/coachApi';
import {
  COACH_PERFORMANCE_RUBRIC,
  buildMetricsPayloadFromRubric,
  scoresFromApiMetrics,
} from '../utils/performanceRubric';

const StudentPerformance = () => {
  const { id: studentUserId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDark } = useTheme();

  const [batchId, setBatchId] = useState(() => searchParams.get('batchId') || '');
  const [batchOptions, setBatchOptions] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [scores, setScores] = useState({});
  const [remarks, setRemarks] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  const rubric = useMemo(() => COACH_PERFORMANCE_RUBRIC, []);

  useEffect(() => {
    const initial = {};
    rubric.forEach((group) => {
      group.metrics.forEach((m) => {
        initial[m.id] = 0;
      });
    });
    setScores(initial);
  }, [rubric]);

  useEffect(() => {
    if (!isApiConfigured() || !getAuthToken() || !studentUserId) {
      setLoading(false);
      setLoadError('Sign in with the API configured to load assessments.');
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const batchesRes = await listCoachBatchesForStudent(studentUserId);
        if (cancelled) return;
        const opts = batchesRes.batches || [];
        setBatchOptions(opts);
        const fromUrl = searchParams.get('batchId');
        let chosen = fromUrl || batchId;
        if (chosen && opts.some((b) => b.id === chosen)) {
          setBatchId(chosen);
        } else if (opts.length) {
          chosen = opts[0].id;
          setBatchId(chosen);
          setSearchParams({ batchId: chosen }, { replace: true });
        } else {
          setLoadError('This student is not enrolled in any of your batches.');
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e.message || 'Failed to load batches');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentUserId]);

  useEffect(() => {
    if (!isApiConfigured() || !getAuthToken() || !studentUserId) {
      setLoading(false);
      return undefined;
    }
    if (!batchId) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const prog = await listBatchProgress(batchId, studentUserId);
        if (cancelled) return;
        const rec = (prog.records && prog.records[0]) || {};
        setStudentName(rec.studentName || '');
        setRemarks(rec.remarks || '');
        const merged = { ...scoresFromApiMetrics(rec.metrics) };
        rubric.forEach((group) => {
          group.metrics.forEach((m) => {
            if (merged[m.id] === undefined) merged[m.id] = 0;
          });
        });
        setScores((prev) => ({ ...prev, ...merged }));
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Failed to load progress');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentUserId, batchId, rubric]);

  const handleScoreChange = (metricId, newScore) => {
    setScores((prev) => ({
      ...prev,
      [metricId]: parseInt(newScore, 10),
    }));
  };

  const calculateGlobalScore = () => {
    const keys = rubric.flatMap((g) => g.metrics.map((m) => m.id));
    const values = keys.map((k) => scores[k] ?? 0);
    if (values.length === 0) return '0';
    const sum = values.reduce((a, b) => a + b, 0);
    return (sum / values.length).toFixed(1);
  };

  const handleSave = async () => {
    if (!batchId || !studentUserId) return;
    setIsSaving(true);
    try {
      const metrics = buildMetricsPayloadFromRubric(rubric, scores);
      await upsertBatchProgress(batchId, {
        userId: studentUserId,
        metrics,
        remarks,
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      setLoadError(e.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-8 ${isDark ? 'bg-[#0f1115] text-white' : 'bg-[#F8FAFC] text-slate-800'}`}>
        <p className="text-sm font-bold">Loading assessment…</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 pb-32 ${isDark ? 'bg-[#0f1115] text-white' : 'bg-[#F8FAFC] text-slate-800'}`}>
      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={() => navigate(-1)} className="group">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isDark ? 'bg-white/5 group-hover:bg-white/10 text-white/40' : 'bg-white group-hover:bg-slate-50 text-slate-400 shadow-sm border border-slate-200'
            }`}
          >
            <ChevronLeft size={18} />
          </div>
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !batchId}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 ${
              isSaving || !batchId ? 'opacity-50 cursor-not-allowed' : 'bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/20'
            }`}
          >
            {isSaving ? 'Processing...' : (
              <>
                <Save size={12} /> Save Matrix
              </>
            )}
          </button>
        </div>
      </div>

      {loadError ? <p className="text-xs text-red-600 font-medium mb-4">{loadError}</p> : null}

      <div className="mb-4">
        <h1 className="text-xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {studentName || 'Student'}{' '}
          <span className="text-[#CE2029]">Performance</span>
        </h1>
        {batchOptions.length > 1 ? (
          <div className="mt-3">
            <label htmlFor="batch-select" className="text-[9px] font-black uppercase text-[#CE2029] tracking-widest">
              Batch
            </label>
            <select
              id="batch-select"
              value={batchId}
              onChange={(e) => {
                const v = e.target.value;
                setBatchId(v);
                setSearchParams({ batchId: v });
              }}
              className={`mt-1 block w-full max-w-md rounded-lg border px-3 py-2 text-xs font-bold ${
                isDark ? 'bg-[#1a1c1e] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {batchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div
        className={`mb-6 p-4 rounded-xl border ${
          isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Coach remarks</p>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
          className={`w-full rounded-lg border px-3 py-2 text-xs font-medium outline-none ${
            isDark ? 'bg-[#1a1c1e] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
          placeholder="Session notes, focus areas…"
        />
      </div>

      <div
        className={`mb-8 p-4 rounded-xl border flex items-center justify-between overflow-hidden relative ${
          isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="relative z-10">
          <p className="text-[7px] font-black uppercase tracking-widest opacity-70">Live Weighted Average</p>
          <p className="text-2xl font-black mt-1 leading-none text-[#CE2029]">{calculateGlobalScore()}</p>
        </div>
        <Trophy size={40} className="absolute -right-2 -bottom-2 opacity-[0.05] -rotate-12" />
        <div className="flex flex-col items-end relative z-10">
          <div className="px-2 py-0.5 rounded-full bg-[#CE2029]/10 text-[#CE2029] text-[7px] font-black uppercase tracking-widest border border-[#CE2029]/30">
            Assessment Active
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {rubric.map((group, gidx) => (
          <motion.div
            key={group.category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gidx * 0.05 }}
          >
            <h3 className="text-[8px] font-black uppercase tracking-[0.25em] text-[#CE2029] mb-3 ml-1">{group.category}</h3>
            <div className="grid grid-cols-1 gap-1.5">
              {group.metrics.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-lg border flex items-center justify-between group transition-all ${
                    isDark ? 'bg-[#1a1c1e] border-white/5' : 'bg-white border-slate-100 shadow-sm'
                  }`}
                >
                  <div className="flex-1 mr-4">
                    <p className="text-[9px] font-black uppercase tracking-tight opacity-70 leading-none">{m.name}</p>
                    <div className="flex gap-0.5 mt-2 h-1 overflow-hidden">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-700 ${
                            i < (scores[m.id] || 0) ? 'bg-[#CE2029]' : isDark ? 'bg-white/5' : 'bg-slate-50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-black tracking-tighter text-[#CE2029]">{scores[m.id] || 0}</span>
                      <span className={`text-[7px] font-black ml-0.5 ${isDark ? 'text-white/80' : 'text-slate-800'}`}>/10</span>
                    </div>
                    <div className="relative">
                      <select
                        value={scores[m.id] || 0}
                        onChange={(e) => handleScoreChange(m.id, e.target.value)}
                        className={`appearance-none bg-transparent outline-none text-[9px] font-black px-2.5 py-1.5 border rounded-lg min-w-[50px] text-center cursor-pointer transition-all ${
                          isDark ? 'border-white/40 hover:bg-white/10 text-white/90' : 'border-slate-400 hover:bg-slate-50 text-slate-900'
                        }`}
                      >
                        {Array.from({ length: 11 }).map((_, i) => (
                          <option key={i} value={i} className={isDark ? 'bg-[#0f1115] text-white' : 'bg-white text-slate-900'}>
                            {i}.0
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-2xl bg-emerald-500 text-white shadow-xl flex items-center gap-3 whitespace-nowrap"
        >
          <CheckCircle2 size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Performance Updated Successfully</span>
        </motion.div>
      )}
    </div>
  );
};

export default StudentPerformance;
