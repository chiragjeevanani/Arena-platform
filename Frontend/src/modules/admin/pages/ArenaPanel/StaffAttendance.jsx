import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserCheck, CalendarDays, User, Download, LogOut } from 'lucide-react';
import { useArenaPanel } from '../../context/ArenaPanelContext';
import { useAuth } from '../../../user/context/AuthContext';
import { getStaffRoster, getStaffAttendance, markStaffAttendanceApi } from '../../../../services/arenaStaffApi';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const monthStart = () => `${today().slice(0, 8)}01`;
const nowHHmm = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
const fmtDay = (s) => new Date(`${s}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
const STATUS = {
  present: { label: 'Present', cls: 'bg-green-100 text-green-700' },
  late: { label: 'Late', cls: 'bg-amber-100 text-amber-800' },
  half_day: { label: 'Half day', cls: 'bg-amber-100 text-amber-800' },
  absent: { label: 'Absent', cls: 'bg-red-100 text-red-700' },
  none: { label: 'Not marked', cls: 'bg-slate-100 text-slate-500' },
};
const Badge = ({ s }) => <span className={`px-2 py-1 rounded-lg text-[10px] font-black whitespace-nowrap ${(STATUS[s] || STATUS.none).cls}`}>{(STATUS[s] || STATUS.none).label}</span>;
const sid = (a) => String(a.staffId?._id || a.staffId);
const markerName = (a) => a.markedBy?.name || `${a.markedBy?.firstName || ''} ${a.markedBy?.lastName || ''}`.trim() || '';

function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([String.fromCharCode(0xfeff) + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const inputCls = 'h-10 px-3 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-[#36454F] outline-none focus:border-[#CE2029]';
const Tab = ({ active, onClick, icon: Icon, children }) => (
  <button type="button" onClick={onClick} className={`flex items-center gap-1.5 px-4 h-10 rounded-xl text-[12px] font-black transition-all ${active ? 'bg-[#ce2029] text-[#ffffff] shadow' : 'bg-white text-slate-500 border border-slate-200'}`}>
    <Icon size={14} /> {children}
  </button>
);

/** Staff attendance: mark today's attendance, daily report and per-person history (with export). */
export default function StaffAttendance() {
  const { arenaId, arena, allArenas = [], setSelectedArenaId } = useArenaPanel();
  const { user } = useAuth();
  const isSuper = user?.role === 'SUPER_ADMIN';
  const [tab, setTab] = useState(isSuper ? 'daily' : 'mark');
  const [roster, setRoster] = useState({ managers: [], staff: [] });
  const [date, setDate] = useState(today());
  const [dayRows, setDayRows] = useState([]);
  const [person, setPerson] = useState('');
  const [range, setRange] = useState({ from: monthStart(), to: today() });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Everyone whose attendance is taken: the arena admins and all staff under them.
  const people = useMemo(() => [
    ...roster.managers.map((m) => ({ id: m.id, name: m.name, role: 'Arena Admin', isActive: true })),
    ...roster.staff,
  ].filter((p) => p.isActive), [roster]);

  const loadDay = useCallback(async () => {
    if (!arenaId) return;
    const res = await getStaffAttendance({ date }, arenaId);
    setDayRows(res.attendance || []);
  }, [arenaId, date]);

  useEffect(() => {
    if (!arenaId) { setLoading(false); return undefined; }
    let off = false;
    (async () => {
      setLoading(true); setError('');
      try {
        const [r] = await Promise.all([getStaffRoster(arenaId), loadDay()]);
        if (!off) setRoster(r);
      } catch (e) { if (!off) setError(e.message || 'Could not load staff'); } finally { if (!off) setLoading(false); }
    })();
    return () => { off = true; };
  }, [arenaId, loadDay]);

  useEffect(() => {
    if (tab !== 'person' || !person || !arenaId) return undefined;
    let off = false;
    getStaffAttendance({ staffId: person, startDate: range.from, endDate: range.to }, arenaId)
      .then((r) => { if (!off) setHistory(r.attendance || []); })
      .catch((e) => { if (!off) setError(e.message || 'Could not load history'); });
    return () => { off = true; };
  }, [tab, person, range, arenaId]);

  const byStaff = useMemo(() => new Map(dayRows.map((a) => [sid(a), a])), [dayRows]);
  const counts = useMemo(() => {
    const c = { present: 0, late: 0, absent: 0, none: 0 };
    for (const p of people) { const s = byStaff.get(p.id)?.status; c[s === 'half_day' ? 'late' : s || 'none'] = (c[s === 'half_day' ? 'late' : s || 'none'] || 0) + 1; }
    return c;
  }, [people, byStaff]);

  const mark = async (p, body) => {
    setError('');
    try {
      await markStaffAttendanceApi({ staffId: p.id, date, ...body }, arenaId);
      await loadDay();
      setToast(body.checkOut ? `${p.name} checked out at ${body.checkOut}` : `${p.name}: ${STATUS[body.status]?.label || body.status}`);
      setTimeout(() => setToast(''), 2500);
    } catch (e) { setError(e.message || 'Could not save'); }
  };

  const exportDay = () => downloadCsv(`staff-attendance-${date}.csv`, [
    ['Date', 'Name', 'Role', 'Status', 'Check-in', 'Check-out', 'Marked by'],
    ...people.map((p) => { const a = byStaff.get(p.id); return [date, p.name, p.role, (STATUS[a?.status] || STATUS.none).label, a?.checkIn || '', a?.checkOut || '', a ? markerName(a) : '']; }),
  ]);
  const personInfo = people.find((p) => p.id === person) || roster.staff.find((p) => p.id === person);
  const hist = useMemo(() => {
    const present = history.filter((h) => h.status === 'present').length;
    const late = history.filter((h) => h.status === 'late' || h.status === 'half_day').length;
    const absent = history.filter((h) => h.status === 'absent').length;
    const total = present + late + absent;
    return { present, late, absent, total, pct: total ? Math.round(((present + late) / total) * 100) : null };
  }, [history]);
  const exportPerson = () => downloadCsv(`attendance-${(personInfo?.name || 'staff').replace(/\s+/g, '-')}-${range.from}-to-${range.to}.csv`, [
    ['Name', personInfo?.name || ''], ['Role', personInfo?.role || ''], ['From', range.from], ['To', range.to],
    ['Present', hist.present], ['Late', hist.late], ['Absent', hist.absent], ['Attendance %', hist.pct == null ? '' : `${hist.pct}%`], [],
    ['Date', 'Status', 'Check-in', 'Check-out', 'Marked by'],
    ...history.map((h) => [h.date, (STATUS[h.status] || STATUS.none).label, h.checkIn || '', h.checkOut || '', markerName(h)]),
  ]);

  if (!arenaId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 text-[12px] text-slate-500">
        {isSuper && allArenas.length ? (
          <select className={inputCls} value="" onChange={(e) => setSelectedArenaId?.(e.target.value)}>
            <option value="">Choose an arena…</option>
            {allArenas.map((a) => <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>)}
          </select>
        ) : 'Choose an arena first.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px]">
            <h3 className="text-[15px] font-black text-[#36454F]">Staff Attendance · {arena?.name || 'Arena'}</h3>
            <p className="text-[11px] text-slate-500">Arena Admin: {roster.managers.map((m) => m.name).join(', ') || '—'} · {roster.staff.filter((s) => s.isActive).length} staff under them</p>
          </div>
          {isSuper && allArenas.length > 1 && (
            <select className={inputCls} value={arenaId} onChange={(e) => setSelectedArenaId?.(e.target.value)} aria-label="Arena">
              {allArenas.map((a) => <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>)}
            </select>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Tab active={tab === 'mark'} onClick={() => setTab('mark')} icon={UserCheck}>Mark attendance</Tab>
          <Tab active={tab === 'daily'} onClick={() => setTab('daily')} icon={CalendarDays}>Daily report</Tab>
          <Tab active={tab === 'person'} onClick={() => setTab('person')} icon={User}>By staff member</Tab>
        </div>
      </div>

      {error && <p className="text-[12px] font-bold text-red-600">{error}</p>}
      {loading ? <p className="text-[12px] text-slate-400 p-4">Loading…</p> : null}

      {!loading && (tab === 'mark' || tab === 'daily') && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} className={inputCls} aria-label="Date" />
            <span className="text-[12px] font-bold text-slate-500">{fmtDay(date)}</span>
            <div className="flex gap-1.5 ml-auto text-[11px] font-black">
              <span className="px-2 py-1 rounded-lg bg-green-50 text-green-700">{counts.present} present</span>
              <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700">{counts.late} late</span>
              <span className="px-2 py-1 rounded-lg bg-red-50 text-red-700">{counts.absent} absent</span>
              <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500">{counts.none} not marked</span>
            </div>
            {tab === 'daily' && (
              <button type="button" onClick={exportDay} className="h-10 px-4 rounded-xl bg-[#36454F] text-[#ffffff] text-[12px] font-black flex items-center gap-1.5"><Download size={14} /> Export</button>
            )}
          </div>

          {people.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-[12px] text-slate-400">No staff yet. The Super Admin adds staff under Arena Control → Staff.</div>
          ) : tab === 'mark' ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
              {people.map((p) => {
                const a = byStaff.get(p.id);
                return (
                  <div key={p.id} className="p-3 md:px-4 flex flex-wrap items-center gap-2" data-testid="mark-row">
                    <div className="flex-1 min-w-[160px]">
                      <p className="text-[13px] font-bold text-[#36454F]">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.role}{a?.checkIn ? ` · in ${a.checkIn}` : ''}{a?.checkOut ? ` · out ${a.checkOut}` : ''}</p>
                    </div>
                    {['present', 'late', 'absent'].map((st) => (
                      <button key={st} type="button" onClick={() => mark(p, { status: st, ...(st !== 'absent' && !a?.checkIn ? { checkIn: nowHHmm() } : {}) })}
                        className={`h-9 px-3 rounded-xl text-[11px] font-black border ${a?.status === st ? `${STATUS[st].cls} border-transparent` : 'bg-white text-slate-500 border-slate-200'}`}>
                        {STATUS[st].label}
                      </button>
                    ))}
                    {a && a.status !== 'absent' && (
                      <button type="button" disabled={!!a.checkOut} onClick={() => mark(p, { checkOut: nowHHmm() })} title="Check out"
                        className="h-9 px-3 rounded-xl text-[11px] font-black border border-slate-200 text-slate-500 flex items-center gap-1 disabled:opacity-40">
                        <LogOut size={13} /> {a.checkOut ? 'Out' : 'Check out'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full text-[12px] min-w-[560px]">
                <thead><tr className="bg-slate-50 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">In</th><th className="p-3">Out</th><th className="p-3">Marked by</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {people.map((p) => {
                    const a = byStaff.get(p.id);
                    return (
                      <tr key={p.id} data-testid="daily-row">
                        <td className="p-3 font-bold text-[#36454F]"><button type="button" className="hover:underline text-left" onClick={() => { setPerson(p.id); setTab('person'); }}>{p.name}</button></td>
                        <td className="p-3 text-slate-500">{p.role}</td>
                        <td className="p-3"><Badge s={a?.status} /></td>
                        <td className="p-3">{a?.checkIn || '—'}</td>
                        <td className="p-3">{a?.checkOut || '—'}</td>
                        <td className="p-3 text-slate-500">{a ? markerName(a) || '—' : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!loading && tab === 'person' && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <select className={inputCls} value={person} onChange={(e) => setPerson(e.target.value)} aria-label="Staff member">
              <option value="">Choose a staff member…</option>
              {people.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
            </select>
            <input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} className={inputCls} aria-label="From" />
            <input type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} className={inputCls} aria-label="To" />
            {person && <button type="button" onClick={exportPerson} className="h-10 px-4 rounded-xl bg-[#36454F] text-[#ffffff] text-[12px] font-black flex items-center gap-1.5 ml-auto"><Download size={14} /> Export</button>}
          </div>
          {!person ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-[12px] text-slate-400">Choose a staff member to see their attendance.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-white rounded-2xl border border-slate-100 p-3"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Attendance</p><p className="text-xl font-black text-[#36454F]">{hist.pct == null ? '—' : `${hist.pct}%`}</p></div>
                <div className="bg-white rounded-2xl border border-slate-100 p-3"><p className="text-[9px] font-black uppercase tracking-widest text-green-600">Present</p><p className="text-xl font-black text-green-700">{hist.present}</p></div>
                <div className="bg-white rounded-2xl border border-slate-100 p-3"><p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Late</p><p className="text-xl font-black text-amber-700">{hist.late}</p></div>
                <div className="bg-white rounded-2xl border border-slate-100 p-3"><p className="text-[9px] font-black uppercase tracking-widest text-red-600">Absent</p><p className="text-xl font-black text-red-700">{hist.absent}</p></div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
                <table className="w-full text-[12px] min-w-[480px]">
                  <thead><tr className="bg-slate-50 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">In</th><th className="p-3">Out</th><th className="p-3">Marked by</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-slate-400">No attendance recorded in this period.</td></tr> : history.map((h) => (
                      <tr key={h._id || h.date} data-testid="person-row">
                        <td className="p-3 font-bold text-[#36454F]">{fmtDay(h.date)}</td>
                        <td className="p-3"><Badge s={h.status} /></td>
                        <td className="p-3">{h.checkIn || '—'}</td>
                        <td className="p-3">{h.checkOut || '—'}</td>
                        <td className="p-3 text-slate-500">{markerName(h) || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl bg-[#1e293b] text-[#ffffff] text-[13px] font-bold shadow-2xl">{toast}</div>}
    </div>
  );
}
