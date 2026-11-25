import { useCallback, useEffect, useState } from 'react';
import { Building2, Plus, X, ArrowRight, CalendarX2, AlertTriangle, Phone } from 'lucide-react';
import { useArenaPanel } from '../../context/ArenaPanelContext';
import { listArenaBookings, previewArenaBooking, createArenaBooking, cancelArenaBooking } from '../../../../services/arenaStaffApi';

const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fmt = (ymd) => new Date(`${ymd}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
const input = 'h-11 px-3 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-[#36454F] outline-none focus:border-[#CE2029] w-full';
const label = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1';
const EMPTY = { date: '', bookedFor: '', teamName: '', phone: '', amount: '', note: '' };

/** What will happen to the bookings already on that day. */
function PlanBox({ plan }) {
  if (!plan) return null;
  const { moves = [], unmovable = [], reserved = [] } = plan;
  if (!moves.length && !unmovable.length && !reserved.length) {
    return <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-[12px] font-bold text-green-800">The whole day is free — no bookings to move.</div>;
  }
  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[12px] text-amber-900 space-y-2" data-testid="arena-plan">
      {moves.length > 0 && (<div>
        <p className="font-black mb-1">{moves.length} booking{moves.length > 1 ? 's' : ''} will be moved to the next free day at the same time (customers get a notification):</p>
        <ul className="space-y-1">{moves.map((m, i) => (
          <li key={i} className="flex flex-wrap items-center gap-1.5"><b>{m.customerName}</b> · {m.from.courtName} {m.from.timeSlot} <ArrowRight size={12} /> <b>{fmt(m.to.date)}</b> · {m.to.courtName} {m.to.timeSlot}</li>
        ))}</ul>
      </div>)}
      {unmovable.length > 0 && (<div>
        <p className="font-black mb-1 text-red-700">{unmovable.length} booking{unmovable.length > 1 ? 's' : ''} could not be moved (no free slot at that time in the next 30 days) — call these customers:</p>
        <ul className="list-disc ml-5">{unmovable.map((m, i) => <li key={i}>{m.customerName} · {m.from.courtName} {m.from.timeSlot}</li>)}</ul>
      </div>)}
      {reserved.length > 0 && (<div>
        <p className="font-black mb-1">Regular players with a reserved slot that day (tell them the arena is closed):</p>
        <ul className="list-disc ml-5">{reserved.map((r, i) => <li key={i}>{r.playerName}{r.teamName ? ` · ${r.teamName}` : ''} · {r.courtName} {r.time}{r.phone ? ` · ${r.phone}` : ''}</li>)}</ul>
      </div>)}
    </div>
  );
}

function ArenaBookingCard({ ab, arenaId, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(false);
  const cancel = async () => {
    if (!window.confirm(`Cancel the whole-arena booking on ${fmt(ab.date)} for ${ab.bookedFor}? All courts become bookable again. Bookings that were moved stay on their new dates.`)) return;
    setBusy(true); setErr('');
    try { await cancelArenaBooking(ab.id, arenaId); await onChanged(); } catch (e) { setErr(e.message || 'Could not cancel'); } finally { setBusy(false); }
  };
  const tone = ab.status === 'upcoming' ? 'border-[#0E7490]/30' : 'border-slate-200 opacity-70';
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 ${tone}`} data-testid="arena-booking-card">
      <div className="flex flex-wrap items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#0E7490]/10 flex items-center justify-center"><Building2 size={20} className="text-[#0E7490]" /></div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-[15px] font-black text-[#36454F]">{ab.bookedFor}{ab.teamName && <span className="text-slate-400 font-bold"> · {ab.teamName}</span>}</p>
          <p className="text-[13px] font-bold text-[#36454F]">{fmt(ab.date)} · all courts · whole day</p>
          <p className="text-[11px] text-slate-500 flex flex-wrap gap-x-3">
            {ab.phone && <span className="flex items-center gap-1"><Phone size={11} /> {ab.phone}</span>}
            {ab.amount > 0 && <span>Agreed: OMR {Number(ab.amount).toFixed(3)} (offline)</span>}
            {ab.note && <span>{ab.note}</span>}
          </p>
          {(ab.moved.length > 0 || ab.notMoved.length > 0) && (
            <button type="button" onClick={() => setOpen(!open)} className="mt-1 text-[11px] font-black text-[#0E7490]">
              {ab.moved.length} booking{ab.moved.length === 1 ? '' : 's'} moved{ab.notMoved.length ? ` · ${ab.notMoved.length} not moved` : ''} {open ? '▲' : '▼'}
            </button>
          )}
          {open && (
            <ul className="mt-1 text-[11px] text-slate-600 space-y-0.5">
              {ab.moved.map((m, i) => <li key={i}>{m.customerName}: {m.from.courtName} {m.from.timeSlot} → {fmt(m.to.date)} · {m.to.courtName} {m.to.timeSlot}</li>)}
              {ab.notMoved.map((m, i) => <li key={`n${i}`} className="text-red-600">{m.customerName}: {m.from.courtName} {m.from.timeSlot} — not moved, contact them</li>)}
            </ul>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${ab.status === 'upcoming' ? 'bg-[#0E7490]/10 text-[#0E7490]' : 'bg-slate-100 text-slate-500'}`}>{ab.status === 'upcoming' ? 'Booked' : ab.status === 'cancelled' ? 'Cancelled' : 'Done'}</span>
          {ab.status === 'upcoming' && <button type="button" disabled={busy} onClick={cancel} className="h-9 px-3 rounded-xl text-[11px] font-black border border-red-200 text-red-600 flex items-center gap-1.5 disabled:opacity-40"><CalendarX2 size={13} /> Cancel booking</button>}
        </div>
      </div>
      {err && <p className="mt-2 text-[11px] font-bold text-red-600">{err}</p>}
    </div>
  );
}

/** Book every court of the arena for one client for a whole day (price agreed offline). */
export default function WholeArenaBooking() {
  const { arenaId } = useArenaPanel();
  const [tab, setTab] = useState('upcoming');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [plan, setPlan] = useState(null);
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

  // Show what happens to existing bookings as soon as a date is picked.
  useEffect(() => {
    if (!form.date || !arenaId) { setPlan(null); return undefined; }
    let live = true;
    setChecking(true); setErr('');
    previewArenaBooking(form.date, arenaId)
      .then((p) => { if (!live) return; if (p.alreadyBooked) { setPlan(null); setErr(`The whole arena is already booked on ${fmt(form.date)} for ${p.alreadyBooked.bookedFor}.`); } else setPlan(p); })
      .catch((e) => { if (live) { setPlan(null); setErr(e.message || 'Could not check that date'); } })
      .finally(() => { if (live) setChecking(false); });
    return () => { live = false; };
  }, [form.date, arenaId]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    const moving = (plan?.moves?.length || 0) + (plan?.unmovable?.length || 0);
    if (moving && !window.confirm(`Book the whole arena on ${fmt(form.date)} for ${form.bookedFor}? ${plan.moves.length} booking(s) will be moved to their new dates and the customers notified.`)) return;
    setBusy(true); setErr(''); setMsg('');
    try {
      const r = await createArenaBooking({ ...form, amount: form.amount === '' ? 0 : Number(form.amount), confirm: true }, arenaId);
      const ab = r.arenaBooking;
      setMsg(`Whole arena booked on ${fmt(ab.date)} for ${ab.bookedFor}.${ab.moved.length ? ` ${ab.moved.length} booking(s) moved and the customers notified.` : ''}${ab.notMoved.length ? ` ${ab.notMoved.length} could not be moved — contact them.` : ''}`);
      setShowForm(false); setForm(EMPTY); setPlan(null); setTab('upcoming'); await load();
    } catch (e) { setErr(e.message || 'Could not book'); } finally { setBusy(false); }
  };

  if (!arenaId) return <div className="p-6 text-[12px] text-slate-500">Choose an arena first (Active arena, top right).</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <Building2 size={20} className="text-[#0E7490]" />
        <div className="flex-1 min-w-[220px]">
          <h3 className="text-[15px] font-black text-[#36454F]">Whole-Arena Booking</h3>
          <p className="text-[11px] text-slate-500">Book every court for the whole day for one client (event, company day, tournament). Payment is agreed offline. Bookings already on that day move to the next free day at the same time.</p>
        </div>
        {!showForm && <button type="button" onClick={() => { setShowForm(true); setErr(''); setMsg(''); }} className="h-11 px-5 rounded-xl bg-[#ce2029] text-[#ffffff] text-[12px] font-black flex items-center gap-2"><Plus size={15} /> Book entire arena</button>}
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between"><h3 className="text-[14px] font-black text-[#36454F]">Book entire arena</h3><button type="button" onClick={() => { setShowForm(false); setPlan(null); setErr(''); }} className="p-1 text-slate-400"><X size={18} /></button></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><span className={label}>Date *</span><input type="date" aria-label="Date" className={input} min={today()} required value={form.date} onChange={set('date')} /></div>
            <div><span className={label}>Booked for *</span><input className={input} required placeholder="e.g. Ahmed Al Balushi" value={form.bookedFor} onChange={set('bookedFor')} /></div>
            <div><span className={label}>Company / team (optional)</span><input className={input} placeholder="e.g. Company sports day" value={form.teamName} onChange={set('teamName')} /></div>
            <div><span className={label}>Phone (optional)</span><input className={input} inputMode="tel" placeholder="+968…" value={form.phone} onChange={set('phone')} /></div>
            <div><span className={label}>Agreed amount, OMR (optional)</span><input className={input} inputMode="decimal" placeholder="Paid offline — for your record" value={form.amount} onChange={set('amount')} /></div>
            <div><span className={label}>Note (optional)</span><input className={input} placeholder="e.g. 50% advance paid in cash" value={form.note} onChange={set('note')} /></div>
          </div>
          {form.date && (
            <div className="rounded-xl bg-[#0E7490]/5 border border-[#0E7490]/15 p-3 text-[13px] text-[#36454F]">
              <b>{form.bookedFor || 'Client'}{form.teamName ? ` · ${form.teamName}` : ''}</b> — all courts, the whole day on <b>{fmt(form.date)}</b>. Customers can't book that day; it shows as "Whole arena" at the desk and in reports.
            </div>
          )}
          {checking ? <p className="text-[12px] text-slate-400">Checking bookings on that day…</p> : <PlanBox plan={plan} />}
          {err && <p className="text-[12px] font-bold text-red-600 flex items-center gap-1"><AlertTriangle size={13} /> {err}</p>}
          <button type="submit" disabled={busy || checking || !form.date || !form.bookedFor.trim() || !plan} className="h-11 px-6 rounded-xl bg-[#ce2029] text-[#ffffff] text-[13px] font-black disabled:opacity-40">{busy ? 'Booking…' : 'Book entire arena'}</button>
        </form>
      )}

      {msg && <p className="text-[12px] font-bold text-green-700">{msg}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {[['upcoming', 'Upcoming'], ['past', 'Past & cancelled'], ['all', 'All']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`h-9 px-4 rounded-xl text-[12px] font-black ${tab === k ? 'bg-[#36454F] text-[#ffffff]' : 'bg-white border border-slate-200 text-slate-500'}`}>{l}</button>
        ))}
      </div>

      {loading ? <p className="text-[12px] text-slate-400 p-4">Loading…</p> : list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-[12px] text-slate-400">
          <Building2 size={22} className="mx-auto mb-2 text-slate-300" />{tab === 'upcoming' ? 'No whole-arena bookings coming up. Press "Book entire arena" to book every court for a day.' : 'Nothing here.'}
        </div>
      ) : (
        <div className="space-y-3">{list.map((ab) => <ArenaBookingCard key={ab.id} ab={ab} arenaId={arenaId} onChanged={load} />)}</div>
      )}
    </div>
  );
}
