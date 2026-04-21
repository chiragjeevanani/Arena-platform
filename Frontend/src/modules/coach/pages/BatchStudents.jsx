import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import {
  ChevronLeft, Search,
  MoreHorizontal, MessageSquare,
  Mail, Phone,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { listCoachBatches, listBatchStudents } from '../../../services/coachApi';
import { mapApiBatchToCard } from '../utils/coachBatchUi';

const MEMBERSHIP_TYPES = [
  { code: 'IA', label: 'Individual Annual', color: '#CE2029' },
  { code: 'IHY', label: 'Individual Half Yearly', color: '#f59e0b' },
  { code: 'GAP', label: 'Group Annual Premium', color: '#3b82f6' },
  { code: 'GANP', label: 'Group Annual Non Premium', color: '#10b981' },
  { code: 'GAW', label: 'Group Annual Weekend', color: '#8b5cf6' },
  { code: 'GHYP', label: 'Group Half Yearly Premium', color: '#ec4899' },
  { code: 'GHYNP', label: 'Group Half yearly Non Premium', color: '#6366f1' },
  { code: 'GHYW', label: 'Group Half yearly Weekend', color: '#f97316' },
];

const BatchStudents = () => {
    const { id: batchRouteId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!batchRouteId || !isApiConfigured() || !getAuthToken()) {
      setLoading(false);
      if (!isApiConfigured() || !getAuthToken()) {
        setLoadError('Sign in with the API configured to load this batch.');
      }
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [batchesRes, studRes] = await Promise.all([listCoachBatches(), listBatchStudents(batchRouteId)]);
        if (cancelled) return;
        const raw = (batchesRes.batches || []).find((b) => String(b.id) === String(batchRouteId));
        if (!raw) {
          setBatch(null);
          setStudents([]);
          setLoadError('Batch not found or not assigned to you.');
          return;
        }
        setBatch(mapApiBatchToCard(raw));
        setStudents(studRes.students || []);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e.message || 'Failed to load');
          setBatch(null);
          setStudents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [batchRouteId]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        String(s.userId || '').toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const activeCount = useMemo(
    () => students.filter((s) => s.enrollmentStatus === 'confirmed').length,
    [students]
  );

  const CONTAINER_VARIANTS = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const CARD_VARIANTS = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className={`min-h-[40vh] flex items-center justify-center p-8 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
        <p className="text-sm font-bold">Loading…</p>
      </div>
    );
  }

  if (loadError || !batch) {
    return (
      <div className={`min-h-[40vh] flex flex-col items-center justify-center p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <p className="text-sm font-bold max-w-md">{loadError || 'No batch data for this route.'}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 pb-32 bg-transparent ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <div className="flex items-center justify-between gap-4 mb-4">
        <button type="button" onClick={() => navigate(-1)} className="group relative z-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDark ? 'bg-white/5 border-white/10 group-hover:bg-white/10' : 'bg-white border-slate-200 group-hover:bg-slate-50 shadow-sm border'
            }`}
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </button>
        <div className="text-right">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 mb-0.5">Membership List</h2>
          <p className="text-[9px] font-bold text-[#CE2029] uppercase tracking-wider">
            {batch.name} · {students.length} Members
          </p>
        </div>
      </div>
      <div className="mb-6">
        <h1 className="text-xl font-black tracking-tighter uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Registered <span className="text-[#CE2029]">Students</span>
        </h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
        <div className={`p-3 rounded-xl border min-w-[120px] ${isDark ? 'bg-[#CE2029]/10 border-[#CE2029]/20' : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm'}`}>
          <p className="text-[7px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">Enrollment</p>
          <p className="text-xl font-black leading-none">{students.length}</p>
        </div>
        <div className={`p-3 rounded-xl border min-w-[120px] ${isDark ? 'bg-white/5 border-white/5' : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm'}`}>
          <p className="text-[7px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">Confirmed</p>
          <p className="text-xl font-black leading-none">{activeCount}</p>
        </div>
        <div className={`p-3 rounded-xl border min-w-[120px] ${isDark ? 'bg-white/5 border-white/5' : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm'}`}>
          <p className="text-[7px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">Level</p>
          <p className="text-[10px] font-black leading-none uppercase">{batch.level}</p>
        </div>
      </div>

      <div
        className={`relative flex items-center px-4 mb-6 rounded-xl border h-11 transition-all group ${
          isDark ? 'bg-white/[0.04] border-white/5 focus-within:border-[#CE2029]/30' : 'bg-[#F8FBFF] border-[#3b82f6]/5 focus-within:border-[#3b82f6]/50 shadow-sm'
        }`}
      >
        <Search size={16} className="text-[#3b82f6] mr-3 opacity-40 group-focus-within:opacity-100 transition-opacity" />
        <input
          type="text"
          placeholder="Search member..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-full h-full placeholder:opacity-20"
        />
      </div>

      <motion.div variants={CONTAINER_VARIANTS} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
        {filtered.map((s, sidx) => (
          <motion.div
            key={s.userId || sidx}
            variants={CARD_VARIANTS}
            whileHover={{ y: -2 }}
            className={`group relative p-3.5 rounded-xl border overflow-hidden transition-all duration-300 ${
              isDark ? 'bg-[#1a1c1e] border-white/5 hover:border-[#CE2029]/30' : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm hover:border-[#3b82f6]/20'
            }`}
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black ${
                        isDark ? 'bg-white/5' : 'bg-white/95'
                      }`}
                    >
                      <span style={{ color: '#CE2029' }}>{(sidx + 1).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-inherit flex items-center justify-center text-white">
                      <ShieldCheck size={7} strokeWidth={4} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-black leading-none uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {s.name || 'Student'}
                      </h3>
                    </div>
                    <p className="text-[8px] font-black opacity-50 tracking-wider uppercase mt-0.5">ID: {String(s.userId).slice(-8)}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      {(() => {
                        const mType = MEMBERSHIP_TYPES[sidx % MEMBERSHIP_TYPES.length];
                        return (
                          <span
                            className="text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border flex items-center gap-1"
                            style={{
                              backgroundColor: isDark ? `${mType.color}10` : `${mType.color}05`,
                              borderColor: isDark ? `${mType.color}30` : `${mType.color}20`,
                              color: mType.color,
                            }}
                          >
                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: mType.color }} />
                            {mType.code}
                          </span>
                        );
                      })()}
                      <span
                        className={`text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                          isDark ? 'border-white/20 text-white/50' : 'border-slate-200 text-slate-500'
                        }`}
                      >
                        {s.enrollmentStatus}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/coach/students/${s.userId}/performance?batchId=${encodeURIComponent(batchRouteId)}`)}
                  className={`p-1 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-white/20' : 'hover:bg-slate-100 text-slate-300'}`}
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1">
                {[
                  { icon: MessageSquare, color: '#CE2029', href: `sms:?body=${encodeURIComponent(`Hi ${s.name || ''}`)}` },
                  { icon: Phone, color: '#f59e0b', href: 'tel:' },
                  { icon: Mail, color: '#3b82f6', href: s.email ? `mailto:${s.email}` : '#' },
                ].map((action, aidx) => (
                  <a
                    key={aidx}
                    href={action.href}
                    className={`group/btn h-7 rounded-md flex items-center justify-center transition-all active:scale-95 ${
                      isDark
                        ? 'bg-white/[0.01] border border-white/5 hover:bg-white/[0.04]'
                        : 'bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 shadow-sm'
                    }`}
                  >
                    <action.icon size={11} style={{ color: action.color }} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {!filtered.length ? (
        <p className={`text-center text-sm py-8 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>No students match your search.</p>
      ) : null}
    </div>
  );
};

export default BatchStudents;
