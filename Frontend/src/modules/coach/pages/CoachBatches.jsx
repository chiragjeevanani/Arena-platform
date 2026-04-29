import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Layers, Users, Clock, MapPin,
  ChevronRight, Search,
  MoreVertical, Video, Info,
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { listCoachBatches } from '../../../services/coachApi';
import { mapApiBatchToCard } from '../utils/coachBatchUi';

const CoachBatches = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    if (!isApiConfigured() || !getAuthToken()) {
      setLoading(false);
      setBatches([]);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const data = await listCoachBatches();
        if (cancelled) return;
        const rows = (data.batches || []).map(mapApiBatchToCard);
        setBatches(rows);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e.message || 'Could not load batches');
          setBatches([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBatches = useMemo(
    () =>
      batches.filter(
        (b) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.level.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [batches, searchQuery]
  );

  return (
    <div
      className={`min-h-screen p-4 md:p-8 pb-32 md:pb-8 ${isDark ? 'text-white' : 'text-slate-800'}`}
      onClick={() => setActiveMenuId(null)}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Active Batches
          </h1>
          <p className={`text-[7px] font-black uppercase tracking-[0.3em] mt-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
            Assigned coaching batches (managed by admin)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`relative flex-1 md:w-64 flex items-center px-4 h-11 rounded-xl border transition-all ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            }`}
          >
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

      {loadError ? <p className="text-xs text-red-600 font-medium mb-4">{loadError}</p> : null}
      {!loading && !loadError && isApiConfigured() && getAuthToken() ? (
        <p
          className={`text-[10px] font-medium mb-4 max-w-xl ${isDark ? 'text-white/40' : 'text-slate-500'}`}
        >
          New batches are created by arena or super admin. This list is read-only.
        </p>
      ) : null}
      {!isApiConfigured() || !getAuthToken() ? (
        <p className={`text-xs font-medium mb-6 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
          Sign in with the API configured to load your assigned batches.
        </p>
      ) : null}
      {loading ? (
        <p className={`text-sm ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Loading batches…</p>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {filteredBatches.map((batch, idx) => (
          <motion.div
            key={batch.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`group relative flex flex-col rounded-2xl border overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
              isDark ? 'bg-[#1a1c1e] border-white/5' : 'bg-white border-slate-100'
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: batch.color }} />

            <div className="flex flex-col p-3.5 md:p-5 pb-3.5 md:pb-5 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 shadow-inner"
                  style={{ backgroundColor: `${batch.color}10`, color: batch.color }}
                >
                  {batch.type === 'Online' ? <Video size={15} /> : <Layers size={15} />}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === batch.id ? null : batch.id);
                    }}
                    className={`p-1 md:p-1.5 rounded-lg transition-all ${
                      activeMenuId === batch.id
                        ? 'bg-[#CE2029] text-white'
                        : isDark
                          ? 'hover:bg-white/5 text-white/20'
                          : 'hover:bg-slate-100 text-slate-300'
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
                        className={`absolute right-0 mt-2 w-40 rounded-2xl shadow-2xl border z-30 overflow-hidden ${
                          isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-100'
                        }`}
                      >
                        <div className="p-1.5 space-y-1">
                          <button
                            type="button"
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
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mb-5">
                <h3
                  className="text-xs md:text-base font-black leading-tight tracking-tight uppercase line-clamp-2"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {batch.name}
                </h3>
                <span
                  className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${
                    isDark ? 'border-white/10 text-white/30' : 'border-slate-200 text-slate-400'
                  } mt-1.5 inline-block`}
                >
                  {batch.level}
                </span>
                {batch.type !== 'Online' ? (
                  <span
                    className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ml-2 ${
                      isDark ? 'bg-[#CE2029]/10 border-[#CE2029]/20 text-[#CE2029]' : 'bg-[#CE2029]/5 border-[#CE2029]/10 text-[#CE2029]'
                    } mt-1.5 inline-block`}
                  >
                    {batch.court}
                  </span>
                ) : null}
              </div>

              <div className="mt-auto space-y-2">
                <button
                  type="button"
                  onClick={() => navigate(`/coach/batches/${batch.id}/students`)}
                  className={`w-full p-2 md:p-2.5 rounded-xl flex items-center justify-between border transition-all hover:border-[#CE2029]/30 active:scale-95 ${
                    isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-[#CE2029]" />
                    <span className="text-[10px] md:text-xs font-black" style={{ color: batch.color }}>
                      {batch.students} <span className="text-[9px] opacity-40 ml-1">/ {batch.maxStudents}</span>
                    </span>
                  </div>
                  <ChevronRight size={10} className="opacity-20" />
                </button>

                <button
                  type="button"
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

      {!loading && !filteredBatches.length && !loadError && isApiConfigured() && getAuthToken() ? (
        <p className={`text-sm text-center py-12 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
          No batches assigned yet.
        </p>
      ) : null}
    </div>
  );
};

export default CoachBatches;
