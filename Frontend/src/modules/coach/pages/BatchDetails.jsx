import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Calendar, Clock, MapPin,
  Video, Users, Search,
  Zap, ShieldCheck, Activity,
  MessageSquare, Mail, Phone, MoreHorizontal,
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

const BatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!id || !isApiConfigured() || !getAuthToken()) {
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
        const [batchesRes, studRes] = await Promise.all([listCoachBatches(), listBatchStudents(id)]);
        if (cancelled) return;
        const raw = (batchesRes.batches || []).find((b) => String(b.id) === String(id));
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
          setLoadError(e.message || 'Failed to load batch');
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
  }, [id]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        String(s.userId || '').toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  if (loading) {
    return (
      <div className={`min-h-[40vh] flex items-center justify-center p-8 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
        <p className="text-sm font-bold">Loading batch…</p>
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

  const occupancy = batch.maxStudents ? Math.min(100, (batch.students / batch.maxStudents) * 100) : 0;

  return (
    <div className={`min-h-screen p-4 md:p-8 pb-32 animate-in fade-in duration-500 bg-transparent ${isDark ? 'text-white' : 'text-slate-950'}`}>
      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={() => navigate(-1)} className="group">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isDark ? 'bg-white/5 group-hover:bg-white/10 text-white/40' : 'bg-white group-hover:bg-[#F8FBFF] text-slate-800 border border-slate-200'
            }`}
          >
            <ChevronLeft size={18} />
          </div>
        </button>
        <div className="text-right">
          <h2 className={`text-[8px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/30' : 'text-slate-500'}`}>Batch Master</h2>
          <p className="text-[10px] font-black text-[#CE2029] uppercase tracking-widest leading-none mt-1">{batch.name}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl border-b pb-8 px-2 ${isDark ? 'border-white/5' : 'border-[#CE2029]/10'}`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#CE2029]/[0.05] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-50" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CE2029]" />
                  <span className={`text-[7.5px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/80' : 'text-black'}`}>
                    Live Session Profile
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {batch.name}
                </h1>
              </div>
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-white/5 border border-white/5' : 'bg-[#F8FBFF] border border-[#3b82f6]/5 shadow-sm'
                }`}
              >
                {batch.type === 'Online' ? <Video size={20} className="text-blue-500" /> : <Zap size={20} className="text-[#CE2029]" />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm'}`}>
                <p className={`text-[6.5px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/80' : 'text-slate-600'}`}>Rank Level</p>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#CE2029]" />
                  <p className="text-[12px] font-black uppercase tracking-wide">{batch.level}</p>
                </div>
              </div>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm'}`}>
                <p className={`text-[6.5px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/80' : 'text-slate-600'}`}>Total Intake</p>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[#CE2029]" />
                  <p className="text-[12px] font-black uppercase tracking-wide">
                    {batch.students} / {batch.maxStudents}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Calendar, val: batch.schedule, label: 'Schedule', color: '#CE2029' },
            { icon: Clock, val: batch.time, label: 'Duration', color: '#f59e0b' },
            { icon: MapPin, val: batch.arena, label: 'Arena Location', color: '#3b82f6' },
            { icon: Activity, val: `${Math.round(occupancy)}%`, label: 'Occupancy', color: '#10b981' },
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-xl border ${isDark ? 'bg-[#1a1c1e] border-white/5' : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm'}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                <item.icon size={14} />
              </div>
              <p className={`text-[7px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white/80' : 'text-black'}`}>{item.label}</p>
              <p className="text-[11px] font-black uppercase tracking-tight truncate">{item.val}</p>
            </div>
          ))}
        </div>

        <div className="pt-6 flex items-center justify-between">
          <h2 className="text-base font-black uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Registered <span className="text-[#CE2029]">Students</span>
          </h2>
          <div
            className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${
              isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-[#F8FBFF] border-[#3b82f6]/10 text-[#3b82f6]'
            }`}
          >
            {students.length} Members
          </div>
        </div>

        <div
          className={`relative flex items-center px-4 rounded-xl border h-12 transition-all shadow-sm ${
            isDark
              ? 'bg-white/[0.03] border-white/5 focus-within:border-[#CE2029]/30'
              : 'bg-[#F8FBFF] border-[#3b82f6]/5 focus-within:border-[#3b82f6]/50'
          }`}
        >
          <Search size={16} className="text-[#3b82f6] mr-3 opacity-60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for member..."
            className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest w-full h-full placeholder:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
          {filteredStudents.map((s, sidx) => (
            <motion.div
              key={s.userId || sidx}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(sidx * 0.05, 0.5) }}
              className={`group relative p-4 rounded-xl border overflow-hidden transition-all duration-300 ${
                isDark
                  ? 'bg-[#1a1c1e] border-white/5 hover:border-[#CE2029]/30'
                  : 'bg-[#F8FBFF] border-[#3b82f6]/5 shadow-sm hover:border-[#3b82f6]/20'
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black ${
                          isDark ? 'bg-white/5' : 'bg-white/95'
                        }`}
                      >
                        <span style={{ color: '#CE2029' }}>{(sidx + 1).toString().padStart(2, '0')}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-inherit flex items-center justify-center text-white">
                        <ShieldCheck size={8} strokeWidth={4} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-black leading-none uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {s.name || 'Student'}
                        </h3>
                        {(() => {
                          const mType = MEMBERSHIP_TYPES[sidx % MEMBERSHIP_TYPES.length];
                          return (
                            <span
                              className="text-[6px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded border flex items-center gap-1"
                              style={{
                                backgroundColor: isDark ? `${mType.color}10` : `${mType.color}05`,
                                borderColor: isDark ? `${mType.color}30` : `${mType.color}20`,
                                color: mType.color,
                              }}
                            >
                              {mType.code}
                            </span>
                          );
                        })()}
                      </div>
                      <p className={`text-[9px] font-black tracking-wider uppercase mt-1 ${isDark ? 'text-white/80' : 'text-slate-900'}`}>
                        ID: {String(s.userId).slice(-8)}
                      </p>
                      <p className={`text-[8px] font-black mt-0.5 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{s.enrollmentStatus}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/coach/students/${s.userId}/performance?batchId=${encodeURIComponent(id)}`)}
                    className={`p-2 rounded-lg transition-all ${
                      isDark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-[#3b82f6]/20 text-slate-600'
                    }`}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: MessageSquare, color: '#CE2029' },
                    { icon: Phone, color: '#f59e0b' },
                    { icon: Mail, color: '#3b82f6' },
                  ].map((action, aidx) => (
                    <a
                      key={aidx}
                      href={
                        aidx === 0
                          ? `sms:?body=${encodeURIComponent(`Hi ${s.name || 'there'}`)}`
                          : aidx === 1
                            ? 'tel:'
                            : `mailto:${encodeURIComponent(s.email || '')}`
                      }
                      className={`h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 ${
                        isDark ? 'bg-white/[0.02] border border-white/5' : 'bg-white border border-slate-100 shadow-sm hover:bg-[#F8FBFF]'
                      }`}
                    >
                      <action.icon size={13} style={{ color: action.color }} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!filteredStudents.length ? (
          <p className={`text-center text-sm pb-8 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>No students match your search.</p>
        ) : null}
      </div>
    </div>
  );
};

export default BatchDetails;
