import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Pencil, X, RefreshCw } from 'lucide-react';
import { useArenaPanel } from '../../context/ArenaPanelContext';
import { getAttendanceRegister, updateAttendanceSession } from '../../../../services/arenaStaffApi';

const ymd = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => ymd(new Date(Date.now() - n * 864e5));
const fmtDate = (s) => {
  const d = new Date(`${s}T12:00:00`);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtTime = (v) => (v ? new Date(v).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');

const STATUS_STYLE = {
  present: 'bg-green-100 text-green-700 border-green-200',
  late: 'bg-amber-100 text-amber-800 border-amber-200',
  absent: 'bg-red-100 text-red-700 border-red-200',
  excused: 'bg-slate-100 text-slate-600 border-slate-200',
};

function SessionCard({ s, arenaId, onChanged }) {
  const [open, setOpen] = useState(!s.verifiedAt);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const save = async (body) => {
    setBusy(true); setErr('');
    try {
      await updateAttendanceSession(s.id, body, arenaId);
      setEditing(false); setDraft({});
      await onChanged();
    } catch (e) {
      setErr(e.message || 'Could not save');
    } finally {
      setBusy(false);
    }
  };
  const changes = Object.entries(draft).map(([userId, status]) => ({ userId, status }));

  return (
    <div className={`bg-white rounded-2xl border shadow-sm ${s.verifiedAt ? 'border-slate-100' : 'border-amber-300'}`} data-testid="register-session">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full text-left p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <p className="text-[13px] font-black text-[#36454F]">{fmtDate(s.sessionDate)}</p>
          <p className="text-[11px] font-bold text-slate-500">{s.batchTitle} · Coach {s.coachName}</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-black">
          <span className="px-2 py-1 rounded-lg bg-green-50 text-green-700">{s.presentCount} present</span>
          <span className="px-2 py-1 rounded-lg bg-red-50 text-red-700">{s.absentCount} absent</span>
        </div>
        {s.verifiedAt ? (
          <span className="flex items-center gap-1 text-[11px] font-black text-green-700"><CheckCircle2 size={14} /> Verified</span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-black text-amber-700"><AlertCircle size={14} /> Needs check</span>
        )}
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 mt-3">
            Marked by {s.markedBy?.name || s.coachName} · {fmtTime(s.markedAt)}
            {s.correctedAt ? ` · corrected by ${s.correctedBy?.name || 'staff'} ${fmtTime(s.correctedAt)}` : ''}
            {s.verifiedAt ? ` · verified by ${s.verifiedBy?.name || 'staff'} ${fmtTime(s.verifiedAt)}` : ''}
          </p>
          <div className="mt-3 divide-y divide-slate-100">
            {s.records.length === 0 && <p className="py-3 text-[12px] text-slate-400">No students were marked in this session.</p>}
            {s.records.map((r) => {
              const cur = draft[r.userId] || r.status;
              return (
                <div key={r.userId} className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[#36454F] truncate">{r.name}</p>
                    {r.phone ? <p className="text-[10px] text-slate-400">{r.phone}</p> : null}
                  </div>
                  {editing ? (
                    <div className="flex gap-1">
                      {['present', 'absent', 'late'].map((st) => (
                        <button key={st} type="button" onClick={() => setDraft((d) => ({ ...d, [r.userId]: st }))}
                          className={`px-2 py-1 rounded-lg border text-[10px] font-black uppercase ${cur === st ? STATUS_STYLE[st] : 'bg-white text-slate-400 border-slate-200'}`}>{st}</button>
                      ))}
                    </div>
                  ) : (
                    <span className={`px-2 py-1 rounded-lg border text-[10px] font-black uppercase ${STATUS_STYLE[r.status] || STATUS_STYLE.excused}`}>{r.status}</span>
                  )}
                </div>
              );
            })}
          </div>
          {err && <p className="mt-2 text-[11px] font-bold text-red-600">{err}</p>}
          <div className="mt-3 flex flex-wrap gap-2 justify-end">
            {editing ? (
              <>
                <button type="button" disabled={busy} onClick={() => { setEditing(false); setDraft({}); }} className="px-3 py-2 rounded-xl border border-slate-200 text-[11px] font-black text-slate-500 flex items-center gap-1"><X size={13} /> Cancel</button>
                <button type="button" disabled={busy} onClick={() => save({ records: changes, verified: true })} className="px-3 py-2 rounded-xl bg-[#CE2029] text-white text-[11px] font-black disabled:opacity-50">Save corrections &amp; verify</button>
              </>
            ) : (
              <>
                {s.records.length > 0 && (
                  <button type="button" disabled={busy} onClick={() => setEditing(true)} className="px-3 py-2 rounded-xl border border-slate-200 text-[11px] font-black text-[#36454F] flex items-center gap-1"><Pencil size={13} /> Correct</button>
                )}
                {s.verifiedAt ? (
                  <button type="button" disabled={busy} onClick={() => save({ verified: false })} className="px-3 py-2 rounded-xl border border-slate-200 text-[11px] font-black text-slate-500 disabled:opacity-50">Undo verify</button>
                ) : (
                  <button type="button" disabled={busy} onClick={() => save({ verified: true })} className="px-3 py-2 rounded-xl bg-green-600 text-white text-[11px] font-black flex items-center gap-1 disabled:opacity-50"><CheckCircle2 size={13} /> Verify</button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AttendanceRegister() {
  const { arenaId } = useArenaPanel();
  const [filters, setFilters] = useState({ batchId: '', from: daysAgo(30), to: ymd(new Date()), status: '' });
  const [data, setData] = useState({ batches: [], sessions: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!arenaId) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const res = await getAttendanceRegister(filters, arenaId);
      setData({ batches: res.batches || [], sessions: res.sessions || [], summary: res.summary || null });
    } catch (e) {
      setError(e.message || 'Could not load the register');
    } finally {
      setLoading(false);
    }
  }, [arenaId, filters]);

  useEffect(() => { void load(); }, [load]);

  const rate = useMemo(() => {
    const s = data.summary;
    return s && s.marks ? Math.round((s.present / s.marks) * 100) : null;
  }, [data.summary]);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const input = 'h-10 px-3 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-[#36454F] outline-none focus:border-[#CE2029]';

  if (!arenaId) return <div className="p-6 text-[12px] text-slate-500">Choose an arena first (Active arena, top right).</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardCheck size={18} className="text-[#CE2029]" />
          <h3 className="text-[14px] font-black text-[#36454F]">Coaching Attendance Register</h3>
          <button type="button" onClick={() => void load()} className="ml-auto p-2 rounded-lg border border-slate-200 text-slate-500" title="Refresh"><RefreshCw size={14} /></button>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">Every session a coach records appears here. Check the marks, correct them if needed, then press <b>Verify</b>.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <select value={filters.batchId} onChange={set('batchId')} className={input} aria-label="Batch">
            <option value="">All batches</option>
            {data.batches.map((b) => <option key={b.id} value={b.id}>{b.title} — {b.coachName}</option>)}
          </select>
          <select value={filters.status} onChange={set('status')} className={input} aria-label="Status">
            <option value="">All sessions</option>
            <option value="unverified">Needs check</option>
            <option value="verified">Verified</option>
          </select>
          <input type="date" value={filters.from} onChange={set('from')} className={input} aria-label="From" />
          <input type="date" value={filters.to} onChange={set('to')} className={input} aria-label="To" />
        </div>
      </div>

      {data.summary && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border border-slate-100 p-3"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sessions</p><p className="text-xl font-black text-[#36454F]">{data.summary.sessions}</p></div>
          <div className="bg-white rounded-2xl border border-amber-200 p-3"><p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Needs check</p><p className="text-xl font-black text-amber-700">{data.summary.unverified}</p></div>
          <div className="bg-white rounded-2xl border border-slate-100 p-3"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Attendance</p><p className="text-xl font-black text-[#36454F]">{rate == null ? '—' : `${rate}%`}</p></div>
        </div>
      )}

      {error && <p className="text-[12px] font-bold text-red-600">{error}</p>}
      {loading ? (
        <p className="text-[12px] text-slate-400 p-4">Loading…</p>
      ) : data.sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-[12px] text-slate-400">
          No coaching sessions recorded for these filters. Sessions appear here once a coach marks attendance.
        </div>
      ) : (
        <div className="space-y-3">
          {data.sessions.map((s) => <SessionCard key={s.id} s={s} arenaId={arenaId} onChanged={load} />)}
        </div>
      )}
    </div>
  );
}
