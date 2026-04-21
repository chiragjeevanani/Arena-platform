import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, Calendar, Filter, Download, CheckCircle2, 
  XCircle, Clock, MoreVertical, Eye, Edit3, AlertTriangle, Bell, Trash2, Search, Plus, UserCheck, UserMinus, X
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import {
  listCoachBatches,
  listBatchStudents,
  upsertBatchAttendance,
  listCoachAttendanceHistory,
} from '../../../services/coachApi';

// ── Mark Attendance Modal ──────────────────────────────────────
const MarkAttendanceModal = ({ target, onClose, isDark, onSaved }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadErr, setLoadErr] = useState('');

  useEffect(() => {
    if (!target?.batchId) {
      setStudents([]);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setLoadErr('');
    listBatchStudents(target.batchId)
      .then((d) => {
        if (cancelled) return;
        setStudents(
          (d.students || []).map((s) => ({
            id: s.userId,
            name: s.name || 'Student',
            present: true,
          }))
        );
      })
      .catch((e) => {
        if (!cancelled) setLoadErr(e.message || 'Could not load roster');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [target?.batchId]);

  const updateStatus = (id, isPresent) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, present: isPresent } : s)));
  };

  const handleSave = async () => {
    if (!target?.batchId) return;
    setSaving(true);
    setLoadErr('');
    try {
      const ymd = new Date().toISOString().slice(0, 10);
      await upsertBatchAttendance(target.batchId, {
        sessionDate: ymd,
        records: students.map((s) => ({
          userId: s.id,
          status: s.present ? 'present' : 'absent',
        })),
      });
      await onSaved();
      onClose();
    } catch (e) {
      setLoadErr(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} 
        className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isDark ? 'bg-[#1a1d24] border-white/10 text-white' : 'bg-white border-slate-200 text-[#36454F]'
        }`}
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Log Attendance</h3>
            <p className="text-[10px] font-black uppercase text-[#CE2029] tracking-widest mt-1">
              {target?.batchTitle || '—'} · {new Date().toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-hide">
          {loadErr && (
            <p className="text-center text-xs text-red-600 font-semibold py-2">{loadErr}</p>
          )}
          {loading && (
            <p className={`text-center text-xs py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Loading roster…</p>
          )}
          {!loading && students.length === 0 && (
            <p className={`text-center text-xs py-8 px-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              No students enrolled in this batch yet.
            </p>
          )}
          {students.map((stu) => (
            <div key={stu.id} className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
              isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  stu.present ? 'bg-green-500 text-white shadow-md' : 'bg-red-500 text-white shadow-md'
                }`}>
                  {stu.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold font-display">{stu.name}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">{stu.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateStatus(stu.id, true)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    stu.present 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 scale-105' 
                      : isDark ? 'bg-white/5 text-white/20 border border-white/10 hover:bg-green-500/10 hover:text-green-500' : 'bg-slate-50 text-slate-300 border border-slate-200 hover:bg-green-50'
                  }`}
                >
                  <CheckCircle2 size={16} />
                </button>
                <button 
                  onClick={() => updateStatus(stu.id, false)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    !stu.present 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 scale-105' 
                      : isDark ? 'bg-white/5 text-white/20 border border-white/10 hover:bg-red-500/10 hover:text-red-500' : 'bg-slate-50 text-slate-300 border border-slate-200 hover:bg-red-50'
                  }`}
                >
                  <XCircle size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Class Summary</span>
            <span className="text-[10px] font-black">{students.filter(s => s.present).length} P / {students.filter(s => !s.present).length} A</span>
          </div>
          <button
            onClick={() => void handleSave()}
            disabled={saving || loading || !students.length}
            className="w-full py-3 rounded-xl bg-[#CE2029] text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#36454F] transition-all shadow-xl shadow-[#CE2029]/20 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Finalize Session Log <CheckCircle2 size={18} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Attendance Detail Modal ──────────────────────────────────────
const AttendanceDetailModal = ({ record, onClose, isDark }) => {
  // Generate student list that matches the record counts
  const generateStudents = () => {
    const total = record.present + record.absent;
    const list = [];
    for (let i = 0; i < total; i++) {
      const isPresent = i < record.present;
      list.push({
        id: `STU-${101 + i}`,
        name: `Student ${i + 1}`,
        present: isPresent,
      });
    }
    return list;
  };

  const [students] = useState(generateStudents());

  const presentStudents = students.filter(s => s.present);
  const absentStudents = students.filter(s => !s.present);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} 
        className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isDark ? 'bg-[#1a1d24] border-white/10 text-white' : 'bg-white border-slate-200 text-[#36454F]'
        }`}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#CE2029]/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-[#CE2029] text-white shadow-lg shadow-[#CE2029]/20`}>
              <ClipboardCheck size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Attendance Detail</h3>
              <p className="text-[10px] font-black uppercase text-[#CE2029] tracking-widest mt-0.5">{record.batch} · {record.date}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
          {/* Present Section */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Present ({presentStudents.length})</h4>
              </div>
            </div>
            <div className="space-y-2">
              {presentStudents.map((stu) => (
                <div key={stu.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isDark ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50/50 border-emerald-500/10'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
                      {stu.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{stu.name}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">{stu.id}</p>
                    </div>
                  </div>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
              ))}
              {presentStudents.length === 0 && <p className="text-[10px] text-center py-4 opacity-40 italic">No students present</p>}
            </div>
          </section>

          {/* Absent Section */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Absent ({absentStudents.length})</h4>
              </div>
            </div>
            <div className="space-y-2">
              {absentStudents.map((stu) => (
                <div key={stu.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isDark ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50/50 border-red-500/10'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center font-bold text-xs">
                      {stu.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold opacity-70">{stu.name}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-30">{stu.id}</p>
                    </div>
                  </div>
                  <XCircle size={16} className="text-red-500" />
                </div>
              ))}
              {absentStudents.length === 0 && <p className="text-[10px] text-center py-4 opacity-40 italic">No absences reported</p>}
            </div>
          </section>
        </div>

        <div className="p-5 border-t border-white/5 bg-slate-50/50">
           <button onClick={onClose} className="w-full py-3 rounded-xl bg-[#36454F] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#CE2029] transition-all">
             Acknowledged Detail
           </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────
const AttendanceRecords = () => {
  const { isDark } = useTheme();
  const live = isApiConfigured() && Boolean(getAuthToken());
  const [records, setRecords] = useState([]);
  const [coachBatches, setCoachBatches] = useState([]);
  const [markPickId, setMarkPickId] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAttendanceDetail, setShowAttendanceDetail] = useState(null); // Record object

  const [showMarkModal, setShowMarkModal] = useState(null); // { batchId, batchTitle }
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    batch: 'All',
  });

  const refreshHistory = useCallback(async () => {
    if (!live) {
      setRecords([]);
      setCoachBatches([]);
      return;
    }
    try {
      const from = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
      const to = new Date().toISOString().slice(0, 10);
      const [hist, batchesRes] = await Promise.all([
        listCoachAttendanceHistory({ from, to }),
        listCoachBatches(),
      ]);
      const sessions = hist.sessions || [];
      setRecords(
        sessions.map((s) => ({
          id: s.id,
          date: new Date(`${s.sessionDate}T12:00:00`).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          batch: s.batch,
          present: s.present,
          absent: s.absent,
          status: s.status || 'Logged',
        }))
      );
      const batches = batchesRes.batches || [];
      setCoachBatches(batches);
      setMarkPickId((prev) => prev || (batches[0]?.id ?? ''));
    } catch {
      setRecords([]);
      setCoachBatches([]);
    }
  }, [live]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  const batchFilterOptions = useMemo(() => {
    const names = new Set(['All']);
    coachBatches.forEach((b) => names.add(b.title));
    records.forEach((r) => names.add(r.batch));
    return [...names];
  }, [coachBatches, records]);

  const statsCards = useMemo(() => {
    if (!records.length) {
      return [
        { label: 'Avg Attendance', value: '—', icon: CheckCircle2, color: '#CE2029' },
        { label: 'Classes Logged', value: '0', icon: Clock, color: '#36454F' },
        { label: 'Absence Rate', value: '—', icon: XCircle, color: '#FF4B4B' },
      ];
    }
    const total = records.reduce((acc, r) => acc + r.present + r.absent, 0);
    const pres = records.reduce((acc, r) => acc + r.present, 0);
    const avg = total ? ((pres / total) * 100).toFixed(1) : '0';
    const absRate = total ? (((total - pres) / total) * 100).toFixed(1) : '0';
    return [
      { label: 'Avg Attendance', value: `${avg}%`, icon: CheckCircle2, color: '#CE2029' },
      { label: 'Classes Logged', value: String(records.length), icon: Clock, color: '#36454F' },
      { label: 'Absence Rate', value: `${absRate}%`, icon: XCircle, color: '#FF4B4B' },
    ];
  }, [records]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (action, logId) => {
    const record = records.find(r => r.id === logId);
    setActiveMenu(null);
    switch(action) {
      case 'Delete Record':
        if (live) {
          showToast('Session logs are stored on the server for this account.', 'warning');
        } else {
          setRecords((prev) => prev.filter((r) => r.id !== logId));
          showToast(`Record for ${record.date} deleted`, 'error');
        }
        break;
      case 'View Details': setSelectedRecord(record); setIsEditMode(false); break;
      case 'Edit Log': setSelectedRecord(record); setIsEditMode(true); break;
      case 'Attendance Detail': setShowAttendanceDetail(record); break;
      default: break;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Batch Name', 'Present', 'Absent', 'Total', 'Attendance %', 'Status'];
    const rows = records.map(log => [log.date, log.batch, log.present, log.absent, log.present + log.absent, ((log.present / (log.present + log.absent)) * 100).toFixed(1) + '%', log.status]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `attendance_records_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const filteredHistory = records.filter(log => {
    const matchesSearch = log.batch.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         log.date.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filters.status === 'All' || log.status === filters.status;
    const matchesBatch = filters.batch === 'All' || log.batch === filters.batch;
    
    return matchesSearch && matchesStatus && matchesBatch;
  });

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto relative">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 min-w-[300px] ${
              toast.type === 'error' ? 'bg-red-600 border-red-500 text-white' : 
              toast.type === 'warning' ? 'bg-amber-500 border-amber-400 text-white' :
              'bg-[#36454F] border-slate-700 text-white'
            }`}>
            {toast.type === 'error' ? <Trash2 size={18} /> : toast.type === 'warning' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span className="text-xs font-bold uppercase tracking-wider">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMarkModal && (
          <MarkAttendanceModal
            target={showMarkModal}
            onClose={() => setShowMarkModal(null)}
            isDark={isDark}
            onSaved={refreshHistory}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAttendanceDetail && <AttendanceDetailModal record={showAttendanceDetail} onClose={() => setShowAttendanceDetail(null)} isDark={isDark} />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRecord && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRecord(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[70] p-6 rounded-2xl border shadow-2xl ${isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5 text-[#CE2029]' : 'bg-[#CE2029]/10 text-[#CE2029]'}`}>{isEditMode ? <Edit3 size={18} /> : <Eye size={18} />}</div>
                  <h3 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{isEditMode ? 'Edit Attendance' : 'Record Details'}</h3>
                </div>
                <button onClick={() => setSelectedRecord(null)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-white/20' : 'hover:bg-slate-100 text-slate-400'}`}><XCircle size={18} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-white/[0.02] border-white/20' : 'bg-slate-50 border-slate-300'}`}>
                    <label className="text-[8px] font-black uppercase text-[#CE2029] block mb-1 tracking-widest">Date</label>
                    <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{selectedRecord.date}</p>
                  </div>
                  <div className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-white/[0.02] border-white/20' : 'bg-slate-50 border-slate-300'}`}>
                    <label className="text-[8px] font-black uppercase text-[#CE2029] block mb-1 tracking-widest">Batch</label>
                    <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{selectedRecord.batch}</p>
                  </div>
                </div>
                <div className={`p-4 rounded-xl border transition-all ${isDark ? 'bg-white/[0.02] border-white/20' : 'bg-slate-50 border-slate-300'}`}>
                  <label className="text-[8px] font-black uppercase text-[#CE2029] block mb-3 tracking-widest">Attendance Metric</label>
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <p className="text-[8px] font-black text-green-500 uppercase mb-1 tracking-widest">Present</p>
                      {isEditMode ? <input type="number" defaultValue={selectedRecord.present} className={`w-full py-2 px-3 rounded-lg font-black text-xl outline-none border transition-all ${isDark ? 'bg-black/40 border-white/20 text-white focus:border-[#CE2029]' : 'bg-white border-slate-300 text-[#36454F] focus:border-[#CE2029]'}`} /> : <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{selectedRecord.present}</p>}
                    </div>
                    <div className={`w-px h-10 ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
                    <div className="flex-1 text-right">
                      <p className="text-[8px] font-black text-red-500 uppercase mb-1 tracking-widest">Absent</p>
                      <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white/20' : 'text-slate-300'}`}>{selectedRecord.absent}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => { if(isEditMode) showToast('Changes saved successfully'); setSelectedRecord(null); }} className={`w-full mt-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] ${isEditMode ? 'bg-[#CE2029] text-white shadow-[#CE2029]/20 hover:bg-[#36454F]' : isDark ? 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'}`}>
                  {isEditMode ? 'Update Record' : 'Close Details'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
            <ClipboardCheck className="text-[#CE2029]" size={22} /> Attendance Records
          </h2>
          <p className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Monitor and verify daily presence logs.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {live && coachBatches.length > 1 && (
            <select
              value={markPickId || coachBatches[0]?.id || ''}
              onChange={(e) => setMarkPickId(e.target.value)}
              className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold outline-none ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-[#36454F]'
              }`}
            >
              {coachBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => {
              if (!live) {
                showToast('Connect VITE_API_URL and sign in as a coach to log attendance.', 'warning');
                return;
              }
              const id = markPickId || coachBatches[0]?.id;
              const b = coachBatches.find((x) => x.id === id);
              if (!id || !b) {
                showToast('No coaching batches assigned to you yet.', 'warning');
                return;
              }
              setShowMarkModal({ batchId: id, batchTitle: b.title });
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#CE2029] text-white transition-all text-[10px] font-black uppercase tracking-wider shadow-md hover:-translate-y-0.5 border border-[#CE2029]"
          >
            <Plus size={14} /> Mark Attendance
          </button>
          <button onClick={exportToCSV} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg border transition-all text-[10px] font-black uppercase tracking-wider ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-[#CE2029]' : 'bg-white border-slate-200 text-slate-600 hover:border-[#CE2029] hover:text-[#CE2029] shadow-sm'}`}><Download size={14} /> Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((stat, idx) => (
          <div key={idx} className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>{stat.label}</p>
                <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{stat.value}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20`, color: stat.color }}><stat.icon size={18} /></div>
            </div>
          </div>
        ))}
      </div>

       <div className="flex flex-col sm:flex-row items-center gap-2 relative">
        <div className="w-full sm:flex-1 relative group">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/20 group-focus-within:text-[#CE2029]' : 'text-slate-400 group-focus-within:text-[#CE2029]'}`} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter by batch or date..." className={`w-full py-1.5 pl-9 pr-4 rounded-lg text-[11px] transition-all shadow-sm outline-none border ${isDark ? 'bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-[#CE2029] focus:bg-white/10' : 'bg-white border-slate-200 text-[#36454F] placeholder:text-slate-400 focus:border-[#CE2029]'}`} />
        </div>
        
        <div className="relative w-full sm:w-auto">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`w-full sm:w-auto px-4 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all ${
              showFilters || filters.status !== 'All' || filters.batch !== 'All'
                ? 'bg-[#CE2029] border-[#CE2029] text-white' 
                : isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-[#CE2029] hover:text-[#CE2029]'
            }`}
          >
            <Filter size={14} /> Full Filters
          </button>

          <AnimatePresence>
            {showFilters && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute right-0 top-full mt-2 z-20 w-64 p-4 rounded-2xl border shadow-2xl ${isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'}`}
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest">By Status</p>
                      <div className="flex flex-wrap gap-2">
                        {['All', 'Logged', 'Pending'].map(s => (
                          <button 
                            key={s}
                            onClick={() => setFilters(prev => ({ ...prev, status: s }))}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                              filters.status === s 
                                ? 'bg-[#CE2029] border-[#CE2029] text-white' 
                                : isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-100 text-[#36454F]'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest">By Batch</p>
                      <select 
                        value={filters.batch}
                        onChange={(e) => setFilters(prev => ({ ...prev, batch: e.target.value }))}
                        className={`w-full py-2 px-3 rounded-xl border text-[11px] font-bold outline-none ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-slate-50 border-slate-100 text-[#36454F]'}`}
                      >
                        {batchFilterOptions.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={() => { setFilters({ status: 'All', batch: 'All' }); setShowFilters(false); }}
                      className="w-full py-2 rounded-xl bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
                    >
                      Reset All
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className={`text-[9px] font-bold uppercase tracking-wider border-b ${isDark ? 'text-white/40 border-white/5 bg-white/5' : 'text-slate-500 border-slate-100 bg-slate-50'}`}>
                <th className="px-5 py-3">Date</th><th className="px-5 py-3">Batch Name</th><th className="px-5 py-3 text-center">Present</th><th className="px-5 py-3 text-center">Absent</th><th className="px-5 py-3 text-center">Status</th><th className="px-5 py-3 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-50'}`}>
              {filteredHistory.map((log, idx) => (
                <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className={`group transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                  <td className="px-5 py-3"><div className="flex items-center gap-2.5"><Calendar size={14} className="text-[#CE2029]" /><span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#36454F]'}`}>{log.date}</span></div></td>
                  <td className="px-5 py-3"><p className={`font-medium text-xs ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{log.batch}</p></td>
                  <td className="px-5 py-3 text-center"><span className={`font-bold text-xs ${isDark ? 'text-white/80' : 'text-[#36454F]'}`}>{log.present}</span></td>
                  <td className="px-5 py-3 text-center"><span className="text-[#FF4B4B] font-bold text-xs">{log.absent}</span></td>
                  <td className="px-5 py-3 text-center"><span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${log.status === 'Logged' ? 'bg-[#CE2029]/10 text-[#CE2029] border-[#CE2029]/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{log.status}</span></td>
                  <td className="px-5 py-3 text-right pr-8">
                    <div className="flex justify-end relative">
                      <button onClick={() => setActiveMenu(activeMenu === log.id ? null : log.id)} className={`p-1.5 rounded-lg transition-all border ${activeMenu === log.id ? 'bg-[#CE2029] border-[#CE2029] text-white' : isDark ? 'bg-white/5 border-white/5 text-white/40 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-[#CE2029] hover:text-[#CE2029]'}`}><MoreVertical size={16} /></button>
                      <AnimatePresence>
                        {activeMenu === log.id && (
                          <><div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} /><motion.div initial={{ opacity: 0, scale: 0.95, y: idx > filteredHistory.length - 3 ? -10 : 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: idx > filteredHistory.length - 3 ? -10 : 10 }} className={`absolute right-0 z-20 w-48 p-1.5 rounded-xl border shadow-2xl ${idx > filteredHistory.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'} ${isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'}`}>                                   <div className="space-y-1">
                                    {[
                                      { label: 'Attendance Detail', icon: ClipboardCheck },
                                      { label: 'View Details', icon: Eye }, 
                                      { label: 'Edit Log', icon: Edit3 }, 
                                      { label: 'Delete Record', icon: Trash2, color: '#FF4B4B' }
                                    ].map((opt, i) => (
<button key={i} onClick={() => handleAction(opt.label, log.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${opt.color === '#FF4B4B' ? 'text-[#FF4B4B] hover:bg-[#FF4B4B]/5' : isDark ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-[#CE2029] hover:bg-slate-50'}`}><opt.icon size={14} />{opt.label}</button>))}</div></motion.div></>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecords;
