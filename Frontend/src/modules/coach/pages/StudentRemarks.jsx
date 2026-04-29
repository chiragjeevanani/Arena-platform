import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Search, Plus, Star, Filter, Share2,
  Send, Quote, Trash2, CheckCircle2, Pin,
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import {
  listCoachBatches,
  listCoachRemarks,
  createCoachRemark,
  deleteCoachRemark,
  patchCoachRemark,
} from '../../../services/coachApi';

const StudentRemarks = () => {
  const { isDark } = useTheme();
  const [remarks, setRemarks] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newRemark, setNewRemark] = useState('');
  const [toast, setToast] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadRemarks = async (bid) => {
    if (!bid) return;
    const res = await listCoachRemarks(bid);
    setRemarks(res.remarks || []);
  };

  useEffect(() => {
    if (!isApiConfigured() || !getAuthToken()) {
      setLoading(false);
      setLoadError('Sign in with the API configured.');
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await listCoachBatches();
        if (cancelled) return;
        const list = data.batches || [];
        setBatches(list);
        if (list.length) {
          const first = list[0].id;
          setBatchId(first);
          await loadRemarks(first);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!batchId || !isApiConfigured() || !getAuthToken()) return undefined;
    let cancelled = false;
    (async () => {
      try {
        await loadRemarks(batchId);
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Failed to load remarks');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [batchId]);

  const handlePost = async () => {
    if (!newRemark.trim() || !batchId) return;
    try {
      await createCoachRemark({
        batchId,
        text: newRemark.trim(),
        rating: 5,
      });
      setNewRemark('');
      await loadRemarks(batchId);
      showToast('Record logged successfully');
    } catch (e) {
      showToast(e.message || 'Failed to post');
    }
  };

  const deleteRemark = async (id) => {
    try {
      await deleteCoachRemark(id);
      setRemarks((prev) => prev.filter((r) => r.id !== id));
      showToast('Remark removed');
    } catch (e) {
      showToast(e.message || 'Delete failed');
    }
  };

  const togglePin = async (id, pinned) => {
    try {
      await patchCoachRemark(id, { pinned: !pinned });
      setRemarks((prev) => prev.map((r) => (r.id === id ? { ...r, pinned: !pinned } : r)));
      showToast('Updated');
    } catch (e) {
      showToast(e.message || 'Failed');
    }
  };

  const filteredRemarks = remarks.filter(
    (r) =>
      (r.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.text || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`p-6 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
        <p className="text-sm font-bold">Loading remarks…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto relative">
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

      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
            <MessageSquare className="text-[#CE2029]" size={22} /> Student Remarks
          </h2>
          <p className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Log progress notes per batch (saved to the server).
          </p>
        </div>
        {batches.length > 1 ? (
          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-xs font-bold ${
              isDark ? 'bg-[#1a1d24] border-white/10 text-white' : 'bg-white border-slate-200'
            }`}
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {loadError ? <p className="text-xs text-red-600">{loadError}</p> : null}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative group">
              <Search
                size={14}
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/20 group-focus-within:text-[#CE2029]' : 'text-slate-400 group-focus-within:text-[#CE2029]'}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find student remarks..."
                className={`w-full py-1.5 pl-9 pr-4 rounded-lg text-[11px] transition-all shadow-sm outline-none border ${
                  isDark
                    ? 'bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-[#CE2029] focus:bg-white/10'
                    : 'bg-white border-slate-200 text-[#36454F] placeholder:text-slate-400 focus:border-[#CE2029]'
                }`}
              />
            </div>
            <button
              type="button"
              className={`p-1.5 rounded-lg border transition-all ${
                isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-[#CE2029] hover:text-[#CE2029]'
              }`}
            >
              <Filter size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {filteredRemarks.map((remark, idx) => (
              <motion.div
                key={remark.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-3.5 rounded-xl border shadow-sm transition-all group relative ${
                  isDark ? 'bg-[#1a1d24] border-white/5 hover:border-[#CE2029]/30' : 'bg-white border-slate-100 hover:border-[#CE2029]/40'
                }`}
              >
                {remark.pinned && <div className="absolute -left-1 top-4 w-1 h-8 bg-[#CE2029] rounded-r-full" />}

                <div className="flex justify-between items-start mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
                        isDark ? 'bg-white/5 border-white/10 text-white/20' : 'bg-slate-50 border-slate-100 text-slate-300'
                      }`}
                    >
                      <Quote size={14} />
                    </div>
                    <div>
                      <h4 className={`font-bold tracking-tight text-xs ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{remark.studentName}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[8px] font-black uppercase text-[#CE2029] tracking-wider">Coach note</span>
                        <span className={`${isDark ? 'text-white/10' : 'text-slate-200'} text-[8px]`}>•</span>
                        <span className={`text-[8px] font-bold uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                          {remark.createdAt ? new Date(remark.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={8}
                        className={`${s <= (remark.rating || 5) ? 'text-[#CE2029] fill-[#CE2029]' : isDark ? 'text-white/5' : 'text-slate-100'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className={`text-[11px] leading-relaxed mb-3 font-medium ${isDark ? 'text-white/60' : 'text-slate-600'}`}>&quot;{remark.text}&quot;</p>

                <div className="flex items-center justify-between pt-2.5 border-t border-dashed border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => showToast('Link copied')}
                      className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-[#CE2029] hover:opacity-80 transition-opacity"
                    >
                      <Share2 size={10} /> Share
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePin(remark.id, remark.pinned)}
                      className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest transition-colors ${
                        remark.pinned ? 'text-[#CE2029]' : isDark ? 'text-white/30 hover:text-white' : 'text-slate-400 hover:text-[#36454F]'
                      }`}
                    >
                      <Pin size={10} className={remark.pinned ? 'fill-[#CE2029]' : ''} /> {remark.pinned ? 'Pinned' : 'Pin'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteRemark(remark.id)}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div
            className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#1a1d24] border-[#CE2029]/20' : 'bg-[#36454F] text-white shadow-lg shadow-[#36454F]/20'}`}
          >
            <h3 className={`font-black uppercase tracking-widest text-[8px] mb-3 ${isDark ? 'text-[#CE2029]' : 'text-white/60'}`}>Quick Observation</h3>
            <textarea
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              placeholder="Type your notes here..."
              className={`w-full h-24 rounded-lg p-3 text-[10px] font-bold outline-none border transition-all resize-none ${
                isDark ? 'bg-black/20 border-white/5 text-white focus:border-[#CE2029]' : 'bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:bg-white/20 focus:border-white'
              }`}
            />
            <button
              type="button"
              onClick={handlePost}
              disabled={!newRemark.trim() || !batchId}
              className={`w-full mt-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark ? 'bg-[#CE2029] text-white hover:bg-white hover:text-[#CE2029]' : 'bg-white text-[#36454F] hover:bg-[#CE2029] hover:text-white shadow-[#CE2029]/10'
              }`}
            >
              <Send size={12} /> Post Note
            </button>
          </div>
        </div>
      </div>

      {!batches.length && !loadError ? (
        <p className={`text-sm text-center py-8 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>No batches assigned — remarks need a batch.</p>
      ) : null}
    </div>
  );
};

export default StudentRemarks;
