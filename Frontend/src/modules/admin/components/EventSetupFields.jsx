import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { apiJson } from '../../../services/apiClient';

const pad = (n) => String(n).padStart(2, '0');
const HOURS = Array.from({ length: 24 }, (_, h) => `${pad(h)}:00`);
const input = 'h-10 px-3 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-[#36454F] outline-none focus:border-[#CE2029] w-full';
const label = 'block text-[10px] font-black uppercase tracking-widest text-[#CE2029] mb-1';
const pill = (on) => `h-10 px-4 rounded-xl text-[12px] font-black border ${on ? 'bg-[#36454F] text-[#ffffff] border-transparent' : 'bg-white text-slate-500 border-slate-200'}`;

import { TYPE_LABEL } from '../../../utils/eventSetup';

/** Start date, number of days, all day / hours, and the courts the event blocks. */
export function EventScheduleFields({ value: s, onChange }) {
  const [arenas, setArenas] = useState([]);
  const [courts, setCourts] = useState([]);
  const set = (patch) => onChange({ ...s, ...patch });
  useEffect(() => { apiJson('/api/public/arenas', { method: 'GET', skipAuth: true }).then((r) => setArenas(r.arenas || [])).catch(() => setArenas([])); }, []);
  useEffect(() => { if (!s.holdArenaId && arenas[0]) onChange({ ...s, holdArenaId: String(arenas[0].id) }); }, [arenas]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!s.holdArenaId) { setCourts([]); return; }
    apiJson(`/api/public/arenas/${encodeURIComponent(s.holdArenaId)}`, { method: 'GET', skipAuth: true })
      .then((r) => {
        const list = (r.arena?.courts || []).map((c) => ({ id: String(c.id || c._id), name: c.name })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        setCourts(list);
        if (!s.courtIds.length && s.blockCourts) onChange({ ...s, courtIds: list.map((c) => c.id) });
      })
      .catch(() => setCourts([]));
  }, [s.holdArenaId]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (id) => set({ courtIds: s.courtIds.includes(id) ? s.courtIds.filter((x) => x !== id) : [...s.courtIds, id] });
  const lastDay = s.startDate ? (() => { const d = new Date(`${s.startDate}T12:00:00`); d.setDate(d.getDate() + Number(s.days) - 1); return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }); })() : '';
  return (
    <div className="space-y-4" data-testid="event-schedule">
      <div className="grid grid-cols-2 gap-3">
        <div><span className={label}>Start date</span><input type="date" aria-label="Event start date" className={input} value={s.startDate} onChange={(e) => set({ startDate: e.target.value })} /></div>
        <div><span className={label}>Number of days</span><select aria-label="Event days" className={input} value={s.days} onChange={(e) => set({ days: Number(e.target.value) })}>{Array.from({ length: 14 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}</select></div>
      </div>
      <div><span className={label}>Hours</span>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={pill(s.allDay)} onClick={() => set({ allDay: true })}>All day</button>
          <button type="button" className={pill(!s.allDay)} onClick={() => set({ allDay: false })}>Set hours</button>
          {!s.allDay && (<>
            <select aria-label="Event from" className={`${input} w-28`} value={s.startTime} onChange={(e) => set({ startTime: e.target.value })}>{HOURS.map((h) => <option key={h}>{h}</option>)}</select>
            <span className="text-slate-400">to</span>
            <select aria-label="Event to" className={`${input} w-28`} value={s.endTime} onChange={(e) => set({ endTime: e.target.value })}>{[...HOURS.slice(1), '00:00'].map((h) => <option key={h}>{h}</option>)}</select>
          </>)}
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 p-3 space-y-3">
        <label className="flex items-center gap-2 text-[13px] font-black text-[#36454F]"><input type="checkbox" checked={s.blockCourts} onChange={(e) => set({ blockCourts: e.target.checked, courtIds: e.target.checked ? courts.map((c) => c.id) : [] })} /> Block courts for this event (customers can't book them then)</label>
        {s.blockCourts && (<>
          {arenas.length > 1 && <div className="max-w-xs"><span className={label}>Arena</span><select aria-label="Event arena" className={input} value={s.holdArenaId} onChange={(e) => set({ holdArenaId: e.target.value, courtIds: [] })}>{arenas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>}
          <div className="flex flex-wrap gap-2">
            {courts.map((c) => <button key={c.id} type="button" onClick={() => toggle(c.id)} className={pill(s.courtIds.includes(c.id))}>{c.name}</button>)}
            {courts.length > 0 && <button type="button" onClick={() => set({ courtIds: s.courtIds.length === courts.length ? [] : courts.map((c) => c.id) })} className="h-10 px-3 rounded-xl text-[11px] font-black text-[#0E7490]">{s.courtIds.length === courts.length ? 'Clear' : 'All courts'}</button>}
          </div>
          <p className="text-[11px] text-slate-500">Customer bookings already on these courts at that time are not moved automatically — they are listed in Arena Control → Whole-Arena Booking, where you move or refund each one (customers are told and can cancel for a full refund).</p>
        </>)}
      </div>
      {s.startDate && <p className="text-[12px] text-[#36454F] bg-slate-50 rounded-xl p-2.5"><b>{Number(s.days) > 1 ? `${new Date(`${s.startDate}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })} – ${lastDay}` : lastDay}</b> · {s.allDay ? 'all day' : `${s.startTime}–${s.endTime}`} · {s.blockCourts ? `${s.courtIds.length} court${s.courtIds.length === 1 ? '' : 's'} blocked` : 'no courts blocked'}</p>}
    </div>
  );
}

/** Entry categories, each with its own fee (paid once per entry) and player rules. */
export function EventCategoriesEditor({ value: s, onChange }) {
  const setCat = (i, patch) => onChange({ ...s, categories: s.categories.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const add = (preset) => onChange({ ...s, categories: [...s.categories, preset] });
  return (
    <div className="space-y-3" data-testid="event-categories">
      <p className="text-[12px] text-slate-500">Players choose a category when they register and pay its fee once per entry (a pair or team pays once). Pairs enter their partner; teams enter every team-mate (arena ID optional).</p>
      {s.categories.map((c, i) => (
        <div key={i} className="rounded-xl border border-slate-200 p-3 grid grid-cols-2 md:grid-cols-12 gap-2 items-end" data-testid="category-row">
          <div className="col-span-2 md:col-span-3"><span className={label}>Category</span><input aria-label="Category name" className={input} placeholder="e.g. Men's Doubles" value={c.name} onChange={(e) => setCat(i, { name: e.target.value })} /></div>
          <div className="md:col-span-3"><span className={label}>Players</span><select aria-label="Category type" className={input} value={c.type} onChange={(e) => setCat(i, { type: e.target.value, ...(e.target.value === 'team' ? { minPlayers: c.minPlayers > 2 ? c.minPlayers : 4, maxPlayers: c.maxPlayers > 2 ? c.maxPlayers : 6 } : {}) })}>{Object.entries(TYPE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          {c.type === 'team' ? (
            <div className="md:col-span-2 flex gap-1"><div><span className={label}>Min</span><input aria-label="Team min" className={input} inputMode="numeric" value={c.minPlayers} onChange={(e) => setCat(i, { minPlayers: e.target.value })} /></div><div><span className={label}>Max</span><input aria-label="Team max" className={input} inputMode="numeric" value={c.maxPlayers} onChange={(e) => setCat(i, { maxPlayers: e.target.value })} /></div></div>
          ) : <div className="hidden md:block md:col-span-2" />}
          <div className="md:col-span-2"><span className={label}>Fee (OMR)</span><input aria-label="Category fee" className={input} inputMode="decimal" placeholder="0 = free" value={c.fee} onChange={(e) => setCat(i, { fee: e.target.value })} /></div>
          <div className="md:col-span-1"><span className={label}>Max</span><input aria-label="Max entries" className={input} inputMode="numeric" placeholder="∞" title="Maximum entries (blank = no limit)" value={c.maxEntries} onChange={(e) => setCat(i, { maxEntries: e.target.value })} /></div>
          <div className="md:col-span-1 flex justify-end"><button type="button" disabled={s.categories.length === 1} onClick={() => onChange({ ...s, categories: s.categories.filter((_, j) => j !== i) })} className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 disabled:opacity-30" title="Remove"><Trash2 size={15} /></button></div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => add({ name: 'Singles', type: 'single', minPlayers: 1, maxPlayers: 1, fee: '', maxEntries: '' })} className="h-9 px-3 rounded-xl border border-slate-200 text-[11px] font-black text-slate-600 flex items-center gap-1"><Plus size={13} /> Singles</button>
        <button type="button" onClick={() => add({ name: 'Doubles', type: 'pair', minPlayers: 2, maxPlayers: 2, fee: '', maxEntries: '' })} className="h-9 px-3 rounded-xl border border-slate-200 text-[11px] font-black text-slate-600 flex items-center gap-1"><Plus size={13} /> Doubles</button>
        <button type="button" onClick={() => add({ name: 'Team', type: 'team', minPlayers: 4, maxPlayers: 6, fee: '', maxEntries: '' })} className="h-9 px-3 rounded-xl border border-slate-200 text-[11px] font-black text-slate-600 flex items-center gap-1"><Plus size={13} /> Team</button>
      </div>
    </div>
  );
}
