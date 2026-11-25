import { useCallback, useEffect, useState } from 'react';
import { Users, UserPlus, Pencil, Trash2, RotateCcw, Check, X, ShieldCheck } from 'lucide-react';
import { useArenaPanel } from '../../context/ArenaPanelContext';
import { useAuth } from '../../../user/context/AuthContext';
import { getStaffRoster, addRosterStaff, updateRosterStaff, removeRosterStaff } from '../../../../services/arenaStaffApi';

const JOB_TITLES = ['Cleaner', 'Ground Staff', 'Security', 'Maintenance', 'Front Desk', 'Shop Assistant', 'Supervisor'];
const input = 'h-10 px-3 rounded-xl border border-slate-200 bg-white text-[12px] font-semibold text-[#36454F] outline-none focus:border-[#CE2029] w-full';

/** Who works at the arena. Super Admin adds/edits staff; arena admins see the list. */
export default function StaffRoster() {
  const { arenaId, arena } = useArenaPanel();
  const { user } = useAuth();
  const canEdit = user?.role === 'SUPER_ADMIN';
  const [data, setData] = useState({ managers: [], staff: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', jobTitle: '', phone: '' });
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    if (!arenaId) { setLoading(false); return; }
    setLoading(true); setError('');
    try { setData(await getStaffRoster(arenaId)); } catch (e) { setError(e.message || 'Could not load staff'); } finally { setLoading(false); }
  }, [arenaId]);
  useEffect(() => { void load(); }, [load]);

  const run = async (fn, okMsg) => {
    setBusy(true); setError(''); setMsg('');
    try { await fn(); setMsg(okMsg); await load(); } catch (e) { setError(e.message || 'Something went wrong'); } finally { setBusy(false); }
  };
  const add = (e) => {
    e.preventDefault();
    void run(async () => { await addRosterStaff({ ...form, jobTitle: form.jobTitle || 'Staff' }, arenaId); setForm({ name: '', jobTitle: '', phone: '' }); }, `${form.name} added`);
  };

  if (!arenaId) return <div className="p-6 text-[12px] text-slate-500">Choose an arena first (Active arena, top right).</div>;
  const active = data.staff.filter((s) => s.isActive);
  const managerNames = data.managers.map((m) => m.name).join(', ');

  return (
    <div className="space-y-4">
      {/* Who is in charge */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#CE2029]/10 text-[#CE2029] flex items-center justify-center"><ShieldCheck size={20} /></div>
        <div className="flex-1 min-w-[220px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{arena?.name || 'This arena'} · Arena Admin</p>
          <p className="text-[15px] font-black text-[#36454F]">{managerNames || 'No arena admin assigned yet'}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {active.length} staff member{active.length === 1 ? '' : 's'} work{active.length === 1 ? 's' : ''} under {data.managers.length > 1 ? 'them' : managerNames || 'this arena'}.
            {!data.managers.length && canEdit ? ' Assign one in Users → New Assignment (role Admin, this arena).' : ''}
          </p>
        </div>
      </div>

      {/* Add staff — Super Admin only */}
      {canEdit && (
        <form onSubmit={add} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3"><UserPlus size={16} className="text-[#CE2029]" /><h3 className="text-[13px] font-black text-[#36454F]">Add staff member</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input className={input} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
            <input className={input} placeholder="Job title (e.g. Cleaner)" list="job-titles" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
            <input className={input} placeholder="Phone (optional)" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <button type="submit" disabled={busy} className="h-10 rounded-xl bg-[#ce2029] text-[#ffffff] text-[12px] font-black disabled:opacity-50">Add to {arena?.name ? 'arena' : 'staff'}</button>
          </div>
          <datalist id="job-titles">{JOB_TITLES.map((j) => <option key={j} value={j} />)}</datalist>
          <p className="text-[10px] text-slate-400 mt-2">These staff don't sign in — the arena admin marks their attendance. Receptionists and coaches who need to sign in are added in Users → New Assignment.</p>
        </form>
      )}

      {msg && <p className="text-[12px] font-bold text-green-700">{msg}</p>}
      {error && <p className="text-[12px] font-bold text-red-600">{error}</p>}

      {/* The list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 p-4 border-b border-slate-100"><Users size={16} className="text-[#CE2029]" /><h3 className="text-[13px] font-black text-[#36454F]">Staff ({active.length})</h3></div>
        {loading ? <p className="p-4 text-[12px] text-slate-400">Loading…</p> : data.staff.length === 0 ? (
          <p className="p-6 text-center text-[12px] text-slate-400">No staff yet.{canEdit ? ' Add the first one above.' : ' The Super Admin adds staff.'}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.staff.map((s) => (
              <div key={s.id} className={`p-3 md:px-4 flex flex-wrap items-center gap-3 ${s.isActive ? '' : 'opacity-50'}`} data-testid="staff-row">
                {editId === s.id ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input className={input} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
                    <input className={input} list="job-titles" value={edit.jobTitle} onChange={(e) => setEdit({ ...edit, jobTitle: e.target.value })} />
                    <input className={input} value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} />
                  </div>
                ) : (
                  <div className="flex-1 min-w-[180px]">
                    <p className="text-[13px] font-bold text-[#36454F]">{s.name}</p>
                    <p className="text-[11px] text-slate-500">{s.role}{s.phone ? ` · ${s.phone}` : ''}{s.isActive ? '' : ' · removed'}</p>
                  </div>
                )}
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${s.hasLogin ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{s.hasLogin ? 'Has login' : 'No login'}</span>
                {canEdit && s.kind === 'roster' && (
                  editId === s.id ? (
                    <div className="flex gap-1">
                      <button type="button" disabled={busy} title="Save" onClick={() => run(async () => { await updateRosterStaff(s.id, edit, arenaId); setEditId(null); }, 'Saved')} className="p-2 rounded-lg bg-green-600 text-[#ffffff]"><Check size={14} /></button>
                      <button type="button" title="Cancel" onClick={() => setEditId(null)} className="p-2 rounded-lg border border-slate-200 text-slate-500"><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button type="button" title="Edit" onClick={() => { setEditId(s.id); setEdit({ name: s.name, jobTitle: s.jobTitle, phone: s.phone }); }} className="p-2 rounded-lg border border-slate-200 text-slate-500"><Pencil size={14} /></button>
                      {s.isActive ? (
                        <button type="button" title="Remove" disabled={busy} onClick={() => { if (window.confirm(`Remove ${s.name} from the staff list? Their past attendance is kept.`)) void run(() => removeRosterStaff(s.id, arenaId), `${s.name} removed`); }} className="p-2 rounded-lg border border-slate-200 text-red-500"><Trash2 size={14} /></button>
                      ) : (
                        <button type="button" title="Restore" disabled={busy} onClick={() => run(() => updateRosterStaff(s.id, { isActive: true }, arenaId), `${s.name} restored`)} className="p-2 rounded-lg border border-slate-200 text-green-600"><RotateCcw size={14} /></button>
                      )}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
