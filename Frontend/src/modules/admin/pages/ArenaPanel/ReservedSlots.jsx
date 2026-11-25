import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Plus, UserRound, Users, Phone, Bell, CalendarX2, CalendarPlus, Ban, RotateCcw, X } from 'lucide-react';
import { useArenaPanel } from '../../context/ArenaPanelContext';
import {
  listReservedSlots, createReservedSlot, updateReservedSlot, releaseReservedDate, restoreReservedDate, endReservedSlot,
} from '../../../../services/arenaStaffApi';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const addMonths = (ymd, m) => { const d = new Date(`${ymd}T12:00:00`); d.setMonth(d.getMonth() + m); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const fmt = (ymd) => new Date(`${ymd}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const dayName = (ymd) => DAYS[new Date(`${ymd}T12:00:00`).getDay()];
const countSessions = (from, to, days) => { let n = 0; for (let d = new Date(`${from}T12:00:00`); d <= new Date(`${to}T12:00:00`); d.setDate(d.getDate() + 1)) if (days.includes(DAYS[d.getDay()])) n++; return n; };
const nextHour = (t) => (t === '23:00' ? '00:00' : `${String(Number(t.slice(0, 2)) + 1).padStart(2, '0')}:00`);

const input = 'h-11 px-3 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-[#36454F] outline-none focus:border-[#CE2029] w-full';
const label = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1';
const btn = 'h-9 px-3 rounded-xl text-[11px] font-black border flex items-center gap-1.5 disabled:opacity-40';

const EMPTY = (courtId) => ({ playerName: '', teamName: '', phone: '', courtId, startTime: '17:00', endTime: '18:00', daysOfWeek: ['Mon', 'Tue', 'Wed'], startDate: today(), endDate: addMonths(today(), 4), note: '' });

function ReservedCard({ r, arenaId, onChanged }) {
  const [panel, setPanel] = useState(null); // 'free' | 'extend'
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const run = async (fn) => { setBusy(true); setErr(''); try { await fn(); setPanel(null); setDate(''); await onChanged(); } catch (e) { setErr(e.message || 'Could not save'); } finally { setBusy(false); } };
  const tone = r.status === 'ended' || r.status === 'cancelled' ? 'border-slate-200 opacity-70' : r.endingSoon ? 'border-amber-300' : 'border-slate-100';
  const upcomingFreed = r.releasedDates.filter((d) => d >= today());
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 ${tone}`} data-testid="reserved-card">
      <div className="flex flex-wrap items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#0E7490]/10 text-[#0E7490] flex items-center justify-center shrink-0"><UserRound size={20} /></div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-[15px] font-black text-[#36454F]">{r.playerName}{r.teamName ? <span className="text-slate-500 font-bold"> · {r.teamName}</span> : null}</p>
          <p className="text-[12px] font-bold text-[#36454F]">{r.courtName} · {r.startTime}–{r.endTime} · {r.daysOfWeek.join(', ')}</p>
          <p className="text-[11px] text-slate-500">{fmt(r.startDate)} → {fmt(r.endDate)}{r.phone ? <> · <Phone size={10} className="inline" /> {r.phone}</> : null}</p>
          {r.note ? <p className="text-[11px] text-slate-400 mt-0.5">{r.note}</p> : null}
          {upcomingFreed.length > 0 && <p className="text-[11px] text-slate-500 mt-1">Freed (absent): {upcomingFreed.map(fmt).join(', ')}</p>}
        </div>
        <div className="text-right">
          {r.status === 'active' && (r.endingSoon
            ? <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-black flex items-center gap-1"><Bell size={11} /> Ends {r.daysUntilEnd === 0 ? 'today' : `in ${r.daysUntilEnd} day${r.daysUntilEnd === 1 ? '' : 's'}`}</span>
            : <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-[10px] font-black">Active · {r.remainingSessions} sessions left</span>)}
          {r.status === 'upcoming' && <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-black">Starts {fmt(r.startDate)}</span>}
          {r.status === 'ended' && <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black">Ended</span>}
          {r.status === 'cancelled' && <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black">Cancelled</span>}
        </div>
      </div>

      {(r.status === 'active' || r.status === 'upcoming') && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={`${btn} border-slate-200 text-[#36454F]`} onClick={() => { setPanel(panel === 'free' ? null : 'free'); setDate(''); }}><CalendarX2 size={13} /> Free a date (absent)</button>
          <button type="button" className={`${btn} border-slate-200 text-[#36454F]`} onClick={() => { setPanel(panel === 'extend' ? null : 'extend'); setDate(addMonths(r.endDate > today() ? r.endDate : today(), 1)); }}><CalendarPlus size={13} /> Extend / change end</button>
          <button type="button" disabled={busy} className={`${btn} border-red-200 text-red-600`} onClick={() => { if (window.confirm(`Unblock now? ${r.courtName} ${r.startTime}–${r.endTime} becomes free for everyone from today.`)) void run(() => endReservedSlot(r.id, arenaId)); }}><Ban size={13} /> Unblock now</button>
        </div>
      )}
      {panel === 'free' && (
        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-end gap-2">
          <div><span className={label}>Date to free</span><input type="date" className={input} min={r.startDate > today() ? r.startDate : today()} max={r.endDate} value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <button type="button" disabled={busy || !date} className={`${btn} border-transparent bg-[#0e7490] text-[#ffffff] h-11`} onClick={() => run(() => releaseReservedDate(r.id, date, arenaId))}>Free {date ? `${dayName(date)} ${fmt(date)}` : 'date'}</button>
          <p className="w-full text-[11px] text-slate-400">Only that date opens for booking; the reservation continues on all other days. Must be one of: {r.daysOfWeek.join(', ')}.</p>
        </div>
      )}
      {panel === 'extend' && (
        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-end gap-2">
          <div><span className={label}>New end date</span><input type="date" className={input} min={r.startDate} value={date} onChange={(e) => setDate(e.target.value)} /></div>
          {[1, 2, 3, 6].map((m) => <button key={m} type="button" className={`${btn} border-slate-200 text-slate-600 h-11`} onClick={() => setDate(addMonths(r.endDate, m + 0) )}>+{m} mo</button>)}
          <button type="button" disabled={busy || !date} className={`${btn} border-transparent bg-[#0e7490] text-[#ffffff] h-11`} onClick={() => run(() => updateReservedSlot(r.id, { endDate: date }, arenaId))}>Save end date</button>
        </div>
      )}
      {upcomingFreed.length > 0 && (r.status === 'active' || r.status === 'upcoming') && (
        <div className="mt-2 flex flex-wrap gap-1">
          {upcomingFreed.map((d) => (
            <button key={d} type="button" disabled={busy} title="Block this date again" onClick={() => run(() => restoreReservedDate(r.id, d, arenaId))} className="px-2 h-7 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center gap-1"><RotateCcw size={10} /> Re-block {fmt(d)}</button>
          ))}
        </div>
      )}
      {err && <p className="mt-2 text-[11px] font-bold text-red-600">{err}</p>}
    </div>
  );
}

/** Reserve a court time for a player/team on chosen weekdays for a period; unblocks itself after the end date. */
export default function ReservedSlots() {
  const { arenaId, courts = [] } = useArenaPanel();
  const courtList = useMemo(() => courts.map((c) => ({ id: String(c.id || c._id), name: c.name })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })), [courts]);
  const [tab, setTab] = useState('current');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY(''));
  const [conflicts, setConflicts] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    if (!arenaId) { setLoading(false); return; }
    setLoading(true);
    try { setList((await listReservedSlots(tab, arenaId)).reservedSlots || []); } catch (e) { setErr(e.message || 'Could not load'); } finally { setLoading(false); }
  }, [arenaId, tab]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (!form.courtId && courtList[0]) setForm((f) => ({ ...f, courtId: courtList[0].id })); }, [courtList, form.courtId]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleDay = (d) => setForm((f) => ({ ...f, daysOfWeek: f.daysOfWeek.includes(d) ? f.daysOfWeek.filter((x) => x !== d) : [...f.daysOfWeek, d] }));
  const sessions = form.startDate && form.endDate && form.endDate >= form.startDate ? countSessions(form.startDate, form.endDate, form.daysOfWeek) : 0;
  const courtName = courtList.find((c) => c.id === form.courtId)?.name || 'Court';

  const submit = async (confirm = false) => {
    setBusy(true); setErr(''); setMsg('');
    try {
      await createReservedSlot({ ...form, confirm }, arenaId);
      setMsg(`${courtName} ${form.startTime}–${form.endTime} reserved for ${form.playerName}.`);
      setShowForm(false); setConflicts(null); setForm(EMPTY(form.courtId)); setTab('current'); await load();
    } catch (e) {
      if (e.body?.needsConfirm) setConflicts(e.body.conflicts || []);
      setErr(e.message || 'Could not reserve');
    } finally { setBusy(false); }
  };

  if (!arenaId) return <div className="p-6 text-[12px] text-slate-500">Choose an arena first (Active arena, top right).</div>;
  const endingSoon = list.filter((r) => r.endingSoon && r.status === 'active').length;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <CalendarClock size={20} className="text-[#0E7490]" />
        <div className="flex-1 min-w-[220px]">
          <h3 className="text-[15px] font-black text-[#36454F]">Reserved Slots</h3>
          <p className="text-[11px] text-slate-500">Hold a court time for a regular player on chosen days for a period. It unblocks itself after the end date; you get a notification 7 days before.</p>
        </div>
        {!showForm && <button type="button" onClick={() => { setShowForm(true); setErr(''); setMsg(''); setConflicts(null); }} className="h-11 px-5 rounded-xl bg-[#ce2029] text-[#ffffff] text-[12px] font-black flex items-center gap-2"><Plus size={15} /> Reserve a slot</button>}
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); void submit(false); }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between"><h3 className="text-[14px] font-black text-[#36454F]">Reserve a slot</h3><button type="button" onClick={() => setShowForm(false)} className="p-1 text-slate-400"><X size={18} /></button></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><span className={label}>Player name *</span><input className={input} required placeholder="e.g. Vinod" value={form.playerName} onChange={set('playerName')} /></div>
            <div><span className={label}>Team (optional)</span><input className={input} placeholder="e.g. Twins Group" value={form.teamName} onChange={set('teamName')} /></div>
            <div><span className={label}>Phone (optional)</span><input className={input} inputMode="tel" placeholder="+968…" value={form.phone} onChange={set('phone')} /></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2 md:col-span-2"><span className={label}>Court</span>
              <select className={input} value={form.courtId} onChange={set('courtId')} aria-label="Court">{courtList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            </div>
            <div><span className={label}>From</span><select className={input} aria-label="From" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value, endTime: nextHour(e.target.value) }))}>{HOURS.map((h) => <option key={h}>{h}</option>)}</select></div>
            <div><span className={label}>To</span><select className={input} aria-label="To" value={form.endTime} onChange={set('endTime')}>{[...HOURS.slice(1), '00:00'].map((h) => <option key={h}>{h}</option>)}</select></div>
          </div>
          <div>
            <span className={label}>Days of the week</span>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d) => <button key={d} type="button" onClick={() => toggleDay(d)} className={`w-12 h-10 rounded-xl text-[12px] font-black border ${form.daysOfWeek.includes(d) ? 'bg-[#0e7490] text-[#ffffff] border-transparent' : 'bg-white text-slate-500 border-slate-200'}`}>{d}</button>)}
              <button type="button" onClick={() => setForm((f) => ({ ...f, daysOfWeek: [...DAYS] }))} className="px-3 h-10 rounded-xl text-[11px] font-black border border-slate-200 text-slate-500">Every day</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <div><span className={label}>Start date</span><input type="date" className={input} min={today()} value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} /></div>
            <div><span className={label}>End date</span><input type="date" className={input} min={form.startDate} value={form.endDate} onChange={set('endDate')} /></div>
            <div className="col-span-2 flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 6, 12].map((m) => <button key={m} type="button" onClick={() => setForm((f) => ({ ...f, endDate: addMonths(f.startDate, m) }))} className={`px-3 h-10 rounded-xl text-[11px] font-black border ${form.endDate === addMonths(form.startDate, m) ? 'bg-slate-800 text-[#ffffff] border-transparent' : 'border-slate-200 text-slate-500'}`}>{m} month{m > 1 ? 's' : ''}</button>)}
            </div>
          </div>
          <div><span className={label}>Note (optional)</span><input className={input} placeholder="e.g. paid monthly at desk" value={form.note} onChange={set('note')} /></div>

          <div className="rounded-xl bg-[#0E7490]/5 border border-[#0E7490]/15 p-3 text-[13px] text-[#36454F]">
            <b>{form.playerName || 'Player'}{form.teamName ? ` · ${form.teamName}` : ''}</b> — {courtName} {form.startTime}–{form.endTime} every {form.daysOfWeek.length ? DAYS.filter((d) => form.daysOfWeek.includes(d)).join(', ') : '…'} from {fmt(form.startDate)} to {form.endDate ? fmt(form.endDate) : '…'} · <b>{sessions} sessions</b>. Unblocks automatically after {form.endDate ? fmt(form.endDate) : 'the end date'}.
          </div>
          {conflicts && conflicts.length > 0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[12px] text-amber-900">
              <p className="font-black mb-1">{conflicts.length} existing booking{conflicts.length > 1 ? 's' : ''} at these times (they stay booked):</p>
              <ul className="list-disc ml-5">{conflicts.slice(0, 8).map((c) => <li key={`${c.date}${c.timeSlot}`}>{dayName(c.date)} {fmt(c.date)} · {c.timeSlot} · {c.customer}</li>)}</ul>
              {conflicts.length > 8 && <p>…and {conflicts.length - 8} more</p>}
              <button type="button" disabled={busy} onClick={() => submit(true)} className="mt-2 h-10 px-4 rounded-xl bg-[#ce2029] text-[#ffffff] text-[12px] font-black">Reserve the other dates anyway</button>
            </div>
          )}
          {err && !conflicts?.length && <p className="text-[12px] font-bold text-red-600">{err}</p>}
          <button type="submit" disabled={busy || !form.playerName.trim() || !form.daysOfWeek.length || !sessions} className="h-11 px-6 rounded-xl bg-[#ce2029] text-[#ffffff] text-[13px] font-black disabled:opacity-40">{busy ? 'Saving…' : 'Reserve'}</button>
        </form>
      )}

      {msg && <p className="text-[12px] font-bold text-green-700">{msg}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {[['current', 'Current & upcoming'], ['ended', 'Ended'], ['all', 'All']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`h-9 px-4 rounded-xl text-[12px] font-black ${tab === k ? 'bg-[#36454F] text-[#ffffff]' : 'bg-white border border-slate-200 text-slate-500'}`}>{l}</button>
        ))}
        {endingSoon > 0 && tab === 'current' && <span className="ml-auto px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-[11px] font-black flex items-center gap-1"><Bell size={12} /> {endingSoon} ending within 7 days</span>}
      </div>

      {loading ? <p className="text-[12px] text-slate-400 p-4">Loading…</p> : list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-[12px] text-slate-400">
          <Users size={22} className="mx-auto mb-2 text-slate-300" />{tab === 'current' ? 'No reserved slots yet. Press "Reserve a slot" to hold a court time for a regular player.' : 'Nothing here.'}
        </div>
      ) : (
        <div className="space-y-3">{list.map((r) => <ReservedCard key={r.id} r={r} arenaId={arenaId} onChanged={load} />)}</div>
      )}
    </div>
  );
}
