import { useCallback, useEffect, useState } from 'react';
import { Building2, Plus, X, CalendarX2, AlertTriangle, Phone, Trophy, ArrowRight, Undo2, MoveRight } from 'lucide-react';
import { useArenaPanel } from '../../context/ArenaPanelContext';
import {
  listArenaBookings, previewArenaBooking, createArenaBooking, cancelArenaBooking,
  moveAffectedBooking, refundAffectedBooking, getCourtSlots,
} from '../../../../services/arenaStaffApi';

const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fmt = (ymd) => new Date(`${ymd}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
const HOURS = Array.from({ length: 24 }, (_, h) => `${pad(h)}:00`);
const input = 'h-11 px-3 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-[#36454F] outline-none focus:border-[#CE2029] w-full';
const label = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1';
const ghost = 'h-9 px-3 rounded-xl border border-slate-200 bg-white text-[11px] font-black text-slate-600 flex items-center gap-1.5 disabled:opacity-40';
const EMPTY = { date: '', days: 1, allDay: true, startTime: '16:00', endTime: '22:00', bookedFor: '', teamName: '', phone: '', amount: '', note: '' };
const whenText = (h) => `${h.endDate && h.endDate !== h.date ? `${fmt(h.date)} – ${fmt(h.endDate)}` : fmt(h.date)} · ${h.allDay ? 'all day' : `${h.startTime}–${h.endTime}`}`;
const STATE = {
  pending: ['Needs action', 'bg-amber-100 text-amber-800'],
  moved: ['Moved', 'bg-green-100 text-green-700'],
  refunded: ['Refunded', 'bg-slate-100 text-slate-600'],
  customer_refunded: ['Customer took refund', 'bg-slate-100 text-slate-600'],
  released: ['Stays (released)', 'bg-blue-100 text-blue-700'],
};

/** What the booking would touch: bookings in that time, regular players, clash with another hold. */
function PreviewBox({ preview }) {
  if (!preview) return null;
  const { affected = [], reserved = [], clash } = preview;
  if (clash) return <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-[12px] font-bold text-red-700">Not possible: the courts are already held by {clash.kind === 'event' ? `the event "${clash.bookedFor}"` : `${clash.bookedFor} (whole-arena booking)`} — {clash.when}.</div>;
  if (!affected.length && !reserved.length) return <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-[12px] font-bold text-green-800">All courts are free in that time — no bookings affected.</div>;
  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[12px] text-amber-900 space-y-2" data-testid="arena-plan">
      {affected.length > 0 && (<div>
        <p className="font-black mb-1">{affected.length} customer booking{affected.length > 1 ? 's are' : ' is'} in that time. They stay where they are and are told straight away; afterwards you move each one to another time or refund it (they can also cancel for a full refund themselves):</p>
        <ul className="space-y-0.5">{affected.map((a, i) => <li key={i}><b>{a.customerName}</b> · {a.from.courtName} · {fmt(a.from.date)} {a.from.timeSlot}{a.customerPhone ? ` · ${a.customerPhone}` : ''}</li>)}</ul>
      </div>)}
      {reserved.length > 0 && (<div>
        <p className="font-black mb-1">Regular players with a reserved slot in that time (tell them):</p>
        <ul className="list-disc ml-5">{reserved.map((r, i) => <li key={i}>{r.playerName}{r.teamName ? ` · ${r.teamName}` : ''} · {r.courtName} · {fmt(r.date)} {r.time}{r.phone ? ` · ${r.phone}` : ''}</li>)}</ul>
      </div>)}
    </div>
  );
}

/** Pick a new free slot for an affected booking (any court, any day). */
function MovePanel({ hold, a, arenaId, courts, onDone, onClose }) {
  const [date, setDate] = useState(a.from.date > today() ? a.from.date : today());
  const [courtId, setCourtId] = useState(a.from.courtId);
  const [slots, setSlots] = useState([]);
  const [pick, setPick] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    let live = true; setPick(''); setSlots([]);
    getCourtSlots(courtId, date, arenaId).then((r) => live && setSlots(r.slots || [])).catch(() => live && setSlots([]));
    return () => { live = false; };
  }, [courtId, date, arenaId]);
  const move = async () => {
    setBusy(true); setErr('');
    try { await moveAffectedBooking(hold.id, a.bookingId, { courtId, date, timeSlot: pick }, arenaId); await onDone(); } catch (e) { setErr(e.message || 'Could not move'); } finally { setBusy(false); }
  };
  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2" data-testid="move-panel">
      <div className="flex items-center justify-between"><p className="text-[12px] font-black text-[#36454F]">Move {a.customerName}'s booking ({a.from.courtName} {fmt(a.from.date)} {a.from.timeSlot})</p><button type="button" onClick={onClose} className="p-1 text-slate-400"><X size={15} /></button></div>
      <div className="flex flex-wrap gap-2">
        <div className="w-44"><span className={label}>New date</span><input type="date" aria-label="New date" className={input} min={today()} value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="w-44"><span className={label}>Court</span><select aria-label="New court" className={input} value={courtId} onChange={(e) => setCourtId(e.target.value)}>{courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {slots.length === 0 ? <span className="text-[11px] text-slate-400">No slots on that day.</span> : slots.map((s) => (
          <button key={s.timeSlot} type="button" disabled={!s.available} onClick={() => setPick(s.timeSlot)} className={`h-8 px-2.5 rounded-lg text-[11px] font-black border ${pick === s.timeSlot ? 'bg-[#0e7490] text-[#ffffff] border-transparent' : s.available ? 'bg-white text-[#36454F] border-slate-200' : 'bg-slate-100 text-slate-300 border-slate-100 line-through'}`}>{s.timeSlot}</button>
        ))}
      </div>
      {err && <p className="text-[11px] font-bold text-red-600">{err}</p>}
      <button type="button" disabled={!pick || busy} onClick={move} className="h-9 px-4 rounded-xl bg-[#ce2029] text-[#ffffff] text-[12px] font-black flex items-center gap-1.5 disabled:opacity-40"><MoveRight size={13} /> {busy ? 'Moving…' : pick ? `Move to ${fmt(date)} ${pick}` : 'Pick a free time'}</button>
    </div>
  );
}

function HoldCard({ h, arenaId, courts, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [moveFor, setMoveFor] = useState(null);
  const [open, setOpen] = useState(h.pendingCount > 0);
  const isEvent = h.kind === 'event';
  const cancel = async () => {
    if (!window.confirm(`Cancel the whole-arena booking for ${h.bookedFor} (${whenText(h)})? The courts become bookable again; bookings still waiting stay where they are.`)) return;
    setBusy(true); setErr('');
    try { await cancelArenaBooking(h.id, arenaId); await onChanged(); } catch (e) { setErr(e.message || 'Could not cancel'); } finally { setBusy(false); }
  };
  const refund = async (a) => {
    if (!window.confirm(`Cancel ${a.customerName}'s booking (${a.from.courtName} ${fmt(a.from.date)} ${a.from.timeSlot}) and refund it in full to their wallet?`)) return;
    setBusy(true); setErr('');
    try { await refundAffectedBooking(h.id, a.bookingId, arenaId); await onChanged(); } catch (e) { setErr(e.message || 'Could not refund'); } finally { setBusy(false); }
  };
  const tone = h.status === 'upcoming' ? (h.pendingCount ? 'border-amber-300' : 'border-[#0E7490]/30') : 'border-slate-200 opacity-70';
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 ${tone}`} data-testid="arena-booking-card">
      <div className="flex flex-wrap items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#0E7490]/10 flex items-center justify-center">{isEvent ? <Trophy size={20} className="text-[#0E7490]" /> : <Building2 size={20} className="text-[#0E7490]" />}</div>
        <div className="flex-1 min-w-[220px]">
          <p className="text-[15px] font-black text-[#36454F]">{isEvent && <span className="text-[10px] font-black uppercase tracking-widest text-[#0E7490] mr-1">Event</span>}{h.bookedFor}{h.teamName && <span className="text-slate-400 font-bold"> · {h.teamName}</span>}</p>
          <p className="text-[13px] font-bold text-[#36454F]">{whenText(h)}</p>
          <p className="text-[11px] text-slate-500">{h.courtNames.join(', ')}</p>
          <p className="text-[11px] text-slate-500 flex flex-wrap gap-x-3">
            {h.phone && <span className="flex items-center gap-1"><Phone size={11} /> {h.phone}</span>}
            {h.amount > 0 && <span>Agreed: OMR {Number(h.amount).toFixed(3)} (offline)</span>}
            {h.note && <span>{h.note}</span>}
          </p>
          {h.affected.length > 0 && (
            <button type="button" onClick={() => setOpen(!open)} className="mt-1 text-[11px] font-black text-[#0E7490]">
              {h.affected.length} affected booking{h.affected.length === 1 ? '' : 's'}{h.pendingCount ? ` · ${h.pendingCount} need${h.pendingCount === 1 ? 's' : ''} action` : ''} {open ? '▲' : '▼'}
            </button>
          )}
          {h.moved?.length > 0 && <p className="text-[11px] text-slate-500">{h.moved.length} booking(s) were moved automatically (older booking).</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${h.status === 'upcoming' ? 'bg-[#0E7490]/10 text-[#0E7490]' : 'bg-slate-100 text-slate-500'}`}>{h.status === 'upcoming' ? 'Booked' : h.status === 'cancelled' ? 'Cancelled' : 'Done'}</span>
          {h.status === 'upcoming' && !isEvent && <button type="button" disabled={busy} onClick={cancel} className="h-9 px-3 rounded-xl text-[11px] font-black border border-red-200 text-red-600 flex items-center gap-1.5 disabled:opacity-40"><CalendarX2 size={13} /> Cancel booking</button>}
          {isEvent && <span className="text-[10px] text-slate-400 max-w-[160px] text-right">Change dates / courts in Event Management</span>}
        </div>
      </div>
      {open && h.affected.length > 0 && (
        <div className="mt-3 border border-slate-100 rounded-xl divide-y divide-slate-100" data-testid="affected-list">
          {h.affected.map((a) => (
            <div key={a.bookingId} className="px-3 py-2" data-testid="affected-row">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[220px] text-[12px]">
                  <p className="font-black text-[#36454F]">{a.customerName}{a.customerPhone ? <span className="font-bold text-slate-400"> · {a.customerPhone}</span> : null}</p>
                  <p className="text-slate-500">{a.from.courtName} · {fmt(a.from.date)} {a.from.timeSlot}{a.amount ? ` · OMR ${Number(a.amount).toFixed(3)}` : ''}{a.state === 'moved' && a.to ? <> <ArrowRight size={11} className="inline" /> {a.to.courtName} · {fmt(a.to.date)} {a.to.timeSlot}</> : null}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${STATE[a.state]?.[1] || ''}`}>{STATE[a.state]?.[0] || a.state}</span>
                {a.state === 'pending' && h.status === 'upcoming' && (<>
                  <button type="button" disabled={busy} onClick={() => setMoveFor(moveFor === a.bookingId ? null : a.bookingId)} className={ghost}><MoveRight size={12} /> Move</button>
                  <button type="button" disabled={busy} onClick={() => refund(a)} className={ghost}><Undo2 size={12} /> Refund</button>
                </>)}
              </div>
              {moveFor === a.bookingId && <MovePanel hold={h} a={a} arenaId={arenaId} courts={courts} onDone={async () => { setMoveFor(null); await onChanged(); }} onClose={() => setMoveFor(null)} />}
            </div>
          ))}
        </div>
      )}
      {err && <p className="mt-2 text-[11px] font-bold text-red-600">{err}</p>}
    </div>
  );
}

/** Book every court for one client for one or more days (all day or a few hours); events appear here too. */
export default function WholeArenaBooking() {
  const { arenaId, courts: ctxCourts = [] } = useArenaPanel();
  const courts = ctxCourts.map((c) => ({ id: String(c.id || c._id), name: c.name })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  const [tab, setTab] = useState('upcoming');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [preview, setPreview] = useState(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    if (!arenaId) { setLoading(false); return; }
    setLoading(true);
    try { setList((await listArenaBookings(tab, arenaId)).arenaBookings || []); } catch (e) { setErr(e.message || 'Could not load'); } finally { setLoading(false); }
  }, [arenaId, tab]);
  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!form.date || !arenaId || (!form.allDay && form.endTime !== '00:00' && form.endTime <= form.startTime)) { setPreview(null); return undefined; }
    let live = true;
    setChecking(true); setErr('');
    previewArenaBooking(form, arenaId)
      .then((p) => { if (live) setPreview(p); })
      .catch((e) => { if (live) { setPreview(null); setErr(e.message || 'Could not check'); } })
      .finally(() => { if (live) setChecking(false); });
    return () => { live = false; };
  }, [form.date, form.days, form.allDay, form.startTime, form.endTime, arenaId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const lastDay = form.date ? (() => { const d = new Date(`${form.date}T12:00:00`); d.setDate(d.getDate() + Number(form.days) - 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })() : '';
  const submit = async () => {
    const n = preview?.affected?.length || 0;
    if (n && !window.confirm(`Book the whole arena for ${form.bookedFor}? ${n} customer booking(s) in that time will be told; you then move or refund each one.`)) return;
    setBusy(true); setErr(''); setMsg('');
    try {
      const r = await createArenaBooking({ ...form, days: Number(form.days), amount: form.amount === '' ? 0 : Number(form.amount), confirm: true }, arenaId);
      const h = r.arenaBooking;
      setMsg(`Whole arena booked for ${h.bookedFor}: ${whenText(h)}.${h.pendingCount ? ` ${h.pendingCount} affected booking(s) — move or refund them below.` : ''}`);
      setShowForm(false); setForm(EMPTY); setPreview(null); setTab('upcoming'); await load();
    } catch (e) { setErr(e.message || 'Could not book'); } finally { setBusy(false); }
  };

  if (!arenaId) return <div className="p-6 text-[12px] text-slate-500">Choose an arena first (Active arena, top right).</div>;
  const needAction = list.reduce((n, h) => n + (h.status === 'upcoming' ? h.pendingCount : 0), 0);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <Building2 size={20} className="text-[#0E7490]" />
        <div className="flex-1 min-w-[220px]">
          <h3 className="text-[15px] font-black text-[#36454F]">Whole-Arena Booking</h3>
          <p className="text-[11px] text-slate-500">Book every court for one client for one or more days — all day or a few hours. Payment is agreed offline. Events that use courts are listed here too. Customer bookings already in that time are not moved automatically: you move or refund each one.</p>
        </div>
        {!showForm && <button type="button" onClick={() => { setShowForm(true); setErr(''); setMsg(''); }} className="h-11 px-5 rounded-xl bg-[#ce2029] text-[#ffffff] text-[12px] font-black flex items-center gap-2"><Plus size={15} /> Book entire arena</button>}
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between"><h3 className="text-[14px] font-black text-[#36454F]">Book entire arena</h3><button type="button" onClick={() => { setShowForm(false); setPreview(null); setErr(''); }} className="p-1 text-slate-400"><X size={18} /></button></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><span className={label}>Start date *</span><input type="date" aria-label="Date" className={input} min={today()} required value={form.date} onChange={set('date')} /></div>
            <div><span className={label}>Number of days</span><select aria-label="Days" className={input} value={form.days} onChange={set('days')}>{Array.from({ length: 14 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}</select></div>
            <div className="col-span-2"><span className={label}>Hours</span>
              <div className="flex flex-wrap items-center gap-2">
                {[[true, 'All day'], [false, 'Set hours']].map(([v, l]) => <button key={l} type="button" onClick={() => setForm((f) => ({ ...f, allDay: v }))} className={`h-11 px-4 rounded-xl text-[12px] font-black border ${form.allDay === v ? 'bg-[#36454F] text-[#ffffff] border-transparent' : 'bg-white text-slate-500 border-slate-200'}`}>{l}</button>)}
                {!form.allDay && (<>
                  <select aria-label="From" className={`${input} w-28`} value={form.startTime} onChange={set('startTime')}>{HOURS.map((h) => <option key={h}>{h}</option>)}</select>
                  <span className="text-slate-400">to</span>
                  <select aria-label="To" className={`${input} w-28`} value={form.endTime} onChange={set('endTime')}>{[...HOURS.slice(1), '00:00'].map((h) => <option key={h}>{h}</option>)}</select>
                </>)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><span className={label}>Booked for *</span><input className={input} required placeholder="e.g. Ahmed Al Balushi" value={form.bookedFor} onChange={set('bookedFor')} /></div>
            <div><span className={label}>Company / team (optional)</span><input className={input} placeholder="e.g. Company sports day" value={form.teamName} onChange={set('teamName')} /></div>
            <div><span className={label}>Phone (optional)</span><input className={input} inputMode="tel" placeholder="+968…" value={form.phone} onChange={set('phone')} /></div>
            <div><span className={label}>Agreed amount, OMR (optional)</span><input className={input} inputMode="decimal" placeholder="Paid offline — for your record" value={form.amount} onChange={set('amount')} /></div>
            <div className="md:col-span-2"><span className={label}>Note (optional)</span><input className={input} placeholder="e.g. 50% advance paid in cash" value={form.note} onChange={set('note')} /></div>
          </div>
          {form.date && (
            <div className="rounded-xl bg-[#0E7490]/5 border border-[#0E7490]/15 p-3 text-[13px] text-[#36454F]">
              <b>{form.bookedFor || 'Client'}{form.teamName ? ` · ${form.teamName}` : ''}</b> — all courts, {Number(form.days) > 1 ? <><b>{fmt(form.date)} – {fmt(lastDay)}</b> ({form.days} days)</> : <b>{fmt(form.date)}</b>}, {form.allDay ? 'all day' : <b>{form.startTime}–{form.endTime}</b>}. Customers can't book those courts then; it shows as "Whole arena" at the desk and in reports.
            </div>
          )}
          {checking ? <p className="text-[12px] text-slate-400">Checking bookings in that time…</p> : <PreviewBox preview={preview} />}
          {err && <p className="text-[12px] font-bold text-red-600 flex items-center gap-1"><AlertTriangle size={13} /> {err}</p>}
          <button type="submit" disabled={busy || checking || !form.date || !form.bookedFor.trim() || !preview || !!preview.clash} className="h-11 px-6 rounded-xl bg-[#ce2029] text-[#ffffff] text-[13px] font-black disabled:opacity-40">{busy ? 'Booking…' : 'Book entire arena'}</button>
        </form>
      )}

      {msg && <p className="text-[12px] font-bold text-green-700">{msg}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {[['upcoming', 'Upcoming'], ['past', 'Past & cancelled'], ['all', 'All']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`h-9 px-4 rounded-xl text-[12px] font-black ${tab === k ? 'bg-[#36454F] text-[#ffffff]' : 'bg-white border border-slate-200 text-slate-500'}`}>{l}</button>
        ))}
        {needAction > 0 && tab === 'upcoming' && <span className="ml-auto px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-[11px] font-black flex items-center gap-1"><AlertTriangle size={12} /> {needAction} affected booking{needAction > 1 ? 's' : ''} to move or refund</span>}
      </div>

      {loading ? <p className="text-[12px] text-slate-400 p-4">Loading…</p> : list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-[12px] text-slate-400">
          <Building2 size={22} className="mx-auto mb-2 text-slate-300" />{tab === 'upcoming' ? 'Nothing coming up. Press "Book entire arena" to book every court for a day or a few hours.' : 'Nothing here.'}
        </div>
      ) : (
        <div className="space-y-3">{list.map((h) => <HoldCard key={h.id} h={h} arenaId={arenaId} courts={courts} onChanged={load} />)}</div>
      )}
    </div>
  );
}
