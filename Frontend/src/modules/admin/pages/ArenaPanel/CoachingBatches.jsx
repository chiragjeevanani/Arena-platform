import { useCallback, useEffect, useState } from 'react';
import { GraduationCap, UserPlus, ClipboardCheck, KeyRound, Search, X, Check, Copy, ChevronRight } from 'lucide-react';
import { useArenaPanel } from '../../context/ArenaPanelContext';
import {
  listArenaCoachingBatches, listArenaBatchStudents, addArenaBatchStudent, getArenaBatchAttendance,
  saveArenaBatchAttendance, createStudentLogin, searchArenaCustomers, listArenaFees, recordArenaFee,
} from '../../../../services/arenaStaffApi';

const FEE_TONE = {
  overdue: 'bg-red-100 text-red-700',
  due_soon: 'bg-amber-100 text-amber-800',
  not_recorded: 'bg-slate-100 text-slate-600',
  paid: 'bg-green-100 text-green-700',
  covered: 'bg-green-100 text-green-700',
  ended: 'bg-slate-100 text-slate-500',
};
function FeeBadge({ fee }) {
  if (!fee) return null;
  return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${FEE_TONE[fee.state] || 'bg-slate-100 text-slate-600'}`} data-testid="fee-badge">{fee.label}</span>;
}

/** The desk records a monthly fee payment (cash / card / waived); "paid until" moves forward. */
function RecordFeePanel({ student, arenaId, onDone, onClose }) {
  const monthly = Number(student.fee?.monthlyFee || 0);
  const [months, setMonths] = useState(1);
  const [method, setMethod] = useState('cash');
  const [amount, setAmount] = useState(monthly.toFixed(3));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);
  const pickMonths = (m) => { setMonths(m); setAmount((monthly * m).toFixed(3)); };
  const save = async () => {
    setBusy(true); setErr('');
    try {
      const r = await recordArenaFee(student.enrollmentId, { months, method, amount: method === 'waived' ? 0 : Number(amount) }, arenaId);
      setDone(r.paid); await onDone();
    } catch (e) { setErr(e.message || 'Could not record the payment'); } finally { setBusy(false); }
  };
  if (done) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-[12px] text-green-900 flex flex-wrap items-center gap-2" data-testid="fee-recorded">
        <span className="flex-1">Recorded: {student.name} is paid until <b>{fmt(done.to)}</b>{done.amount ? ` (OMR ${Number(done.amount).toFixed(3)}, ${method})` : ' (waived)'}. They got a notification.</span>
        <button type="button" className={ghost} onClick={onClose}>Done</button>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2" data-testid="fee-panel">
      <div className="flex items-center justify-between"><p className="text-[13px] font-black text-[#36454F]">Record fee — {student.name}</p><button type="button" onClick={onClose} className="p-1 text-slate-400"><X size={16} /></button></div>
      <p className="text-[11px] text-slate-500">Monthly fee OMR {monthly.toFixed(3)} (incl. VAT). {student.fee?.paidUntil ? `Paid until ${fmt(student.fee.paidUntil)} — this payment continues from the next day.` : 'No fee recorded yet — this payment starts today (or when the batch starts).'}</p>
      <div className="flex flex-wrap items-end gap-2">
        <div><span className={label}>Months</span><div className="flex gap-1">{[1, 2, 3].map((m) => <button key={m} type="button" onClick={() => pickMonths(m)} className={`w-10 h-10 rounded-xl text-[12px] font-black border ${months === m ? 'bg-[#36454F] text-[#ffffff] border-transparent' : 'bg-white text-slate-500 border-slate-200'}`}>{m}</button>)}</div></div>
        <div><span className={label}>Paid by</span><div className="flex gap-1">{[['cash', 'Cash'], ['card', 'Card'], ['waived', 'Waived']].map(([k, l]) => <button key={k} type="button" onClick={() => setMethod(k)} className={`h-10 px-3 rounded-xl text-[12px] font-black border ${method === k ? 'bg-[#36454F] text-[#ffffff] border-transparent' : 'bg-white text-slate-500 border-slate-200'}`}>{l}</button>)}</div></div>
        {method !== 'waived' && <div className="w-36"><span className={label}>Amount (OMR)</span><input className={input} aria-label="Amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>}
        <button type="button" disabled={busy} onClick={save} className={primary}><Check size={14} /> {busy ? 'Saving…' : 'Record payment'}</button>
      </div>
      {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}
    </div>
  );
}

/** Everyone whose fee is overdue, due soon or not recorded, across the arena's running batches. */
function FeesDue({ arenaId }) {
  const [show, setShow] = useState('due');
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFor, setOpenFor] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await listArenaFees(show, arenaId); setRows(r.students || []); setSummary(r.summary); } finally { setLoading(false); }
  }, [show, arenaId]);
  useEffect(() => { void load(); }, [load]);
  return (
    <div className="space-y-3" data-testid="fees-due">
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          {[['Overdue', summary.overdue, 'text-red-600'], ['Due in 3 days', summary.dueSoon, 'text-amber-700'], ['Fee not recorded', summary.notRecorded, 'text-slate-600']].map(([l, n, c]) => (
            <div key={l} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{l}</p><p className={`text-[22px] font-black ${c}`}>{n}</p></div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        {[['due', 'Needs action'], ['all', 'All students']].map(([k, l]) => <button key={k} type="button" onClick={() => setShow(k)} className={`h-9 px-4 rounded-xl text-[12px] font-black ${show === k ? 'bg-[#36454F] text-[#ffffff]' : 'bg-white border border-slate-200 text-slate-500'}`}>{l}</button>)}
      </div>
      <p className="text-[11px] text-slate-500">Students with the app get reminders automatically (3 days before, then when overdue). Call the ones without the app.</p>
      {loading ? <p className="text-[12px] text-slate-400">Loading…</p> : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center text-[12px] text-slate-400">Nobody owes a fee right now.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
          {rows.map((s) => (
            <div key={s.enrollmentId} className="px-3 py-2.5" data-testid="fee-row">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]"><p className="text-[13px] font-black text-[#36454F]">{s.name}</p><p className="text-[11px] text-slate-400">{s.batchTitle} · {s.phone}{s.hasLogin ? '' : ' · no app'}</p></div>
                <FeeBadge fee={s.fee} />
                <button type="button" onClick={() => setOpenFor(openFor === s.enrollmentId ? null : s.enrollmentId)} className="h-8 px-3 rounded-xl border border-[#0E7490]/30 text-[11px] font-black text-[#0E7490]">Fee paid</button>
              </div>
              {openFor === s.enrollmentId && <div className="mt-2"><RecordFeePanel student={s} arenaId={arenaId} onDone={async () => {}} onClose={() => { setOpenFor(null); void load(); }} /></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const pad = (n) => String(n).padStart(2, '0');
// The arena's date (Oman, UTC+4) — the server checks against it, whatever time zone the device is in.
const today = () => new Date(Date.now() + 4 * 36e5).toISOString().slice(0, 10);
void pad;
const fmt = (ymd) => (ymd ? new Date(`${ymd}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
const input = 'h-11 px-3 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-[#36454F] outline-none focus:border-[#CE2029] w-full';
const label = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1';
const primary = 'h-11 px-5 rounded-xl bg-[#ce2029] text-[#ffffff] text-[12px] font-black flex items-center gap-2 disabled:opacity-40';
const ghost = 'h-10 px-4 rounded-xl border border-slate-200 bg-white text-[12px] font-black text-slate-600 flex items-center gap-2 disabled:opacity-40';
const genPassword = () => {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const r = new Uint32Array(9); window.crypto.getRandomValues(r);
  return `Amm-${Array.from(r, (x) => a[x % a.length]).join('')}`;
};

/** Shown once after a login is created, so the admin can hand it over. */
function LoginCard({ creds, onClose }) {
  const [copied, setCopied] = useState(false);
  const text = `AMM Sports Arena app\nwww.ammarena.com\nEmail: ${creds.email}\nPassword: ${creds.password}`;
  return (
    <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-[12px] text-green-900" data-testid="login-card">
      <p className="font-black mb-1">App login created for {creds.name}. Give these to the student / parent:</p>
      <p>Website: <b>www.ammarena.com</b> → Login</p>
      <p>Email: <b>{creds.email}</b></p>
      <p>Password: <b data-testid="login-password">{creds.password}</b></p>
      <p className="text-[11px] mt-1 text-green-800">This password is shown only now. They can change it later with "Forgot password".</p>
      <div className="flex gap-2 mt-2">
        <button type="button" className={ghost} onClick={() => { navigator.clipboard?.writeText(text).then(() => setCopied(true)).catch(() => {}); }}><Copy size={13} /> {copied ? 'Copied' : 'Copy'}</button>
        <button type="button" className={ghost} onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

function PasswordField({ value, onChange }) {
  return (
    <div className="flex gap-2">
      <input className={input} aria-label="Password" placeholder="At least 8 characters" value={value} onChange={(e) => onChange(e.target.value)} />
      <button type="button" className={ghost} onClick={() => onChange(genPassword())}>Generate</button>
    </div>
  );
}

function AttendancePanel({ batch, students, arenaId, onSaved, onClose }) {
  const [date, setDate] = useState(today());
  const [marks, setMarks] = useState({});
  const [existing, setExisting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    let live = true;
    setErr('');
    getArenaBatchAttendance(batch.id, date, arenaId).then((r) => {
      if (!live) return;
      setExisting(r.session);
      const m = {};
      for (const s of students) m[s.userId] = r.session?.records.find((x) => x.userId === s.userId)?.status || 'present';
      setMarks(m);
    }).catch((e) => live && setErr(e.message || 'Could not load'));
    return () => { live = false; };
  }, [batch.id, date, arenaId, students]);
  const present = Object.values(marks).filter((v) => v === 'present' || v === 'late').length;
  const save = async () => {
    setBusy(true); setErr(''); setMsg('');
    try {
      await saveArenaBatchAttendance(batch.id, { sessionDate: date, records: Object.entries(marks).map(([userId, status]) => ({ userId, status })) }, arenaId);
      setMsg(`Attendance saved for ${fmt(date)}: ${present} present, ${students.length - present} absent.`);
      await onSaved();
    } catch (e) { setErr(e.message || 'Could not save'); } finally { setBusy(false); }
  };
  return (
    <div className="rounded-2xl border border-[#0E7490]/20 bg-[#0E7490]/5 p-4 space-y-3" data-testid="attendance-panel">
      <div className="flex items-center justify-between"><h4 className="text-[14px] font-black text-[#36454F]">Mark attendance · {batch.title}</h4><button type="button" onClick={onClose} className="p-1 text-slate-400"><X size={18} /></button></div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48"><span className={label}>Class date</span><input type="date" aria-label="Class date" className={input} max={today()} value={date} onChange={(e) => { setDate(e.target.value); setMsg(''); }} /></div>
        <button type="button" className={ghost} onClick={() => setMarks(Object.fromEntries(students.map((s) => [s.userId, 'present'])))}><Check size={13} /> All present</button>
        <span className="text-[12px] font-bold text-slate-500">{present} present · {students.length - present} absent</span>
      </div>
      {existing && <p className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Marked{existing.markedBy ? ` by ${existing.markedBy.name}` : ''}{existing.markedAt ? ` at ${new Date(existing.markedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}. Change any mark and save again to update it.</p>}
      <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
        {students.map((s) => (
          <div key={s.userId} className="flex flex-wrap items-center gap-2 px-3 py-2" data-testid="attendance-row">
            <div className="flex-1 min-w-[160px]"><p className="text-[13px] font-black text-[#36454F]">{s.name}</p><p className="text-[11px] text-slate-400">{s.phone}</p></div>
            {[['present', 'Present', 'bg-green-600'], ['late', 'Late', 'bg-amber-500'], ['absent', 'Absent', 'bg-red-600']].map(([k, l, c]) => (
              <button key={k} type="button" onClick={() => setMarks((m) => ({ ...m, [s.userId]: k }))} className={`h-9 px-3 rounded-xl text-[12px] font-black border ${marks[s.userId] === k ? `${c} text-[#ffffff] border-transparent` : 'bg-white text-slate-500 border-slate-200'}`}>{l}</button>
            ))}
          </div>
        ))}
      </div>
      {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}
      {msg && <p className="text-[12px] font-bold text-green-700">{msg}</p>}
      <button type="button" disabled={busy || !students.length} onClick={save} className={primary}><ClipboardCheck size={14} /> {busy ? 'Saving…' : 'Save attendance'}</button>
    </div>
  );
}

function AddStudentPanel({ batch, arenaId, onAdded, onClose }) {
  const [mode, setMode] = useState('new');
  const [q, setQ] = useState('');
  const [found, setFound] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', withLogin: true, password: genPassword() });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [creds, setCreds] = useState(null);
  useEffect(() => {
    if (mode !== 'existing' || q.trim().length < 2) { setFound([]); return undefined; }
    const t = setTimeout(() => { searchArenaCustomers(q, arenaId).then((r) => setFound(r.customers || [])).catch(() => setFound([])); }, 300);
    return () => clearTimeout(t);
  }, [q, mode, arenaId]);
  const add = async (body, loginInfo) => {
    setBusy(true); setErr(''); setMsg(''); setCreds(null);
    try {
      const r = await addArenaBatchStudent(batch.id, body, arenaId);
      setMsg(`${r.student.name} added to ${batch.title}.`);
      if (r.createdLogin && loginInfo) setCreds({ name: r.student.name, ...loginInfo });
      setForm({ name: '', phone: '', email: '', withLogin: true, password: genPassword() }); setQ(''); setFound([]);
      await onAdded();
    } catch (e) { setErr(e.message || 'Could not add'); } finally { setBusy(false); }
  };
  const submitNew = (e) => {
    e.preventDefault();
    const login = form.withLogin && form.email.trim();
    void add({ name: form.name, phone: form.phone, email: form.email, ...(login ? { password: form.password } : {}) }, login ? { email: form.email.trim().toLowerCase(), password: form.password } : null);
  };
  const full = batch.capacity && batch.studentCount >= batch.capacity;
  return (
    <div className="rounded-2xl border border-[#CE2029]/15 bg-[#CE2029]/[0.03] p-4 space-y-3" data-testid="add-student-panel">
      <div className="flex items-center justify-between"><h4 className="text-[14px] font-black text-[#36454F]">Add student · {batch.title}</h4><button type="button" onClick={onClose} className="p-1 text-slate-400"><X size={18} /></button></div>
      {full && <p className="text-[12px] font-bold text-red-600">This batch is full ({batch.capacity} students).</p>}
      <div className="flex gap-2">
        {[['new', 'New student'], ['existing', 'Existing customer']].map(([k, l]) => <button key={k} type="button" onClick={() => { setMode(k); setErr(''); setMsg(''); }} className={`h-9 px-4 rounded-xl text-[12px] font-black ${mode === k ? 'bg-[#36454F] text-[#ffffff]' : 'bg-white border border-slate-200 text-slate-500'}`}>{l}</button>)}
      </div>
      {mode === 'existing' ? (
        <div className="space-y-2">
          <div className="relative"><Search size={14} className="absolute left-3 top-3.5 text-slate-400" /><input className={`${input} pl-9`} placeholder="Search by name, phone or email" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {found.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
              {found.map((c) => (
                <div key={c.id} className="flex items-center gap-2 px-3 py-2">
                  <div className="flex-1"><p className="text-[13px] font-black text-[#36454F]">{c.name}</p><p className="text-[11px] text-slate-400">{[c.phone, /offline\.ammarena\.invalid$/.test(c.email || '') ? '' : c.email].filter(Boolean).join(' · ')}</p></div>
                  <button type="button" disabled={busy || full} onClick={() => add({ userId: c.id })} className={ghost}><UserPlus size={13} /> Add</button>
                </div>
              ))}
            </div>
          )}
          {q.trim().length >= 2 && !found.length && <p className="text-[12px] text-slate-400">No customer found — use "New student".</p>}
        </div>
      ) : (
        <form onSubmit={submitNew} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><span className={label}>Student name *</span><input className={input} required placeholder="e.g. Aarav Kumar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><span className={label}>Parent / student phone *</span><input className={input} required inputMode="tel" placeholder="+968…" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><span className={label}>Email {form.withLogin ? '* (for the app login)' : '(optional)'}</span><input className={input} type="email" required={form.withLogin} placeholder="parent@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <label className="flex items-center gap-2 text-[13px] font-bold text-[#36454F]"><input type="checkbox" checked={form.withLogin} onChange={(e) => setForm({ ...form, withLogin: e.target.checked })} /> Sign them up for the app (create a login)</label>
          {form.withLogin && <div className="max-w-md"><span className={label}>Password</span><PasswordField value={form.password} onChange={(v) => setForm({ ...form, password: v })} /></div>}
          <p className="text-[11px] text-slate-400">If the phone or email already belongs to a customer, that customer is added to the batch. Existing app users keep their own password.</p>
          <button type="submit" disabled={busy || full} className={primary}><UserPlus size={14} /> {busy ? 'Adding…' : 'Add to batch'}</button>
        </form>
      )}
      {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}
      {msg && <p className="text-[12px] font-bold text-green-700">{msg}</p>}
      {creds && <LoginCard creds={creds} onClose={() => setCreds(null)} />}
    </div>
  );
}

function GiveLoginPanel({ student, arenaId, onDone, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(genPassword());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [creds, setCreds] = useState(null);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await createStudentLogin(student.userId, { email, password }, arenaId); setCreds({ name: student.name, email: email.trim().toLowerCase(), password }); await onDone(); } catch (e2) { setErr(e2.message || 'Could not create the login'); } finally { setBusy(false); }
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2" data-testid="give-login-panel">
      {creds ? <LoginCard creds={creds} onClose={onClose} /> : (
        <form onSubmit={submit} className="space-y-2">
          <div className="flex items-center justify-between"><p className="text-[13px] font-black text-[#36454F]">Sign up {student.name} for the app</p><button type="button" onClick={onClose} className="p-1 text-slate-400"><X size={16} /></button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div><span className={label}>Email *</span><input className={input} type="email" required placeholder="parent@email.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><span className={label}>Password</span><PasswordField value={password} onChange={setPassword} /></div>
          </div>
          {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}
          <button type="submit" disabled={busy} className={primary}><KeyRound size={14} /> {busy ? 'Creating…' : 'Create login'}</button>
        </form>
      )}
    </div>
  );
}

/** Coaching batches at this arena: students, attendance taken by the arena, adding students and app logins. */
export default function CoachingBatches() {
  const { arenaId } = useArenaPanel();
  const [tab, setTab] = useState('current');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [students, setStudents] = useState([]);
  const [panel, setPanel] = useState(null); // 'attendance' | 'add'
  const [loginFor, setLoginFor] = useState(null);
  const [feeFor, setFeeFor] = useState(null);
  const [err, setErr] = useState('');

  const loadBatches = useCallback(async () => {
    if (!arenaId) { setLoading(false); return; }
    setLoading(true);
    try { setBatches((await listArenaCoachingBatches(tab, arenaId)).batches || []); } catch (e) { setErr(e.message || 'Could not load'); } finally { setLoading(false); }
  }, [arenaId, tab]);
  useEffect(() => { void loadBatches(); }, [loadBatches]);

  const loadStudents = useCallback(async (b = sel) => {
    if (!b) return;
    try { const r = await listArenaBatchStudents(b.id, arenaId); setStudents(r.students || []); setSel(r.batch); } catch (e) { setErr(e.message || 'Could not load students'); }
  }, [sel, arenaId]);

  const open = async (b) => { setSel(b); setPanel(null); setLoginFor(null); setStudents([]); await loadStudents(b); };
  const refresh = async () => { await loadStudents(); await loadBatches(); };

  if (!arenaId) return <div className="p-6 text-[12px] text-slate-500">Choose an arena first (Active arena, top right).</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <GraduationCap size={20} className="text-[#0E7490]" />
        <div className="flex-1 min-w-[220px]">
          <h3 className="text-[15px] font-black text-[#36454F]">Coaching Batches</h3>
          <p className="text-[11px] text-slate-500">Mark student attendance, add students and sign them up for the app. Coaches see the same students and attendance.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[['current', 'Running & upcoming'], ['ended', 'Ended'], ['all', 'All'], ['fees', 'Fees due']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => { setTab(k); setSel(null); }} className={`h-9 px-4 rounded-xl text-[12px] font-black ${tab === k ? 'bg-[#36454F] text-[#ffffff]' : k === 'fees' ? 'bg-white border border-[#CE2029]/30 text-[#CE2029]' : 'bg-white border border-slate-200 text-slate-500'}`}>{l}</button>
        ))}
      </div>
      {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}

      {tab === 'fees' ? <FeesDue arenaId={arenaId} /> : loading ?<p className="text-[12px] text-slate-400 p-4">Loading…</p> : batches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-[12px] text-slate-400"><GraduationCap size={22} className="mx-auto mb-2 text-slate-300" />No batches here. Super Admin creates batches in Coach Control → Batch Control.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {batches.map((b) => (
            <button key={b.id} type="button" onClick={() => open(b)} data-testid="batch-card" className={`text-left bg-white rounded-2xl border shadow-sm p-4 hover:border-[#0E7490]/50 ${sel?.id === b.id ? 'border-[#0E7490] ring-2 ring-[#0E7490]/15' : 'border-slate-100'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[14px] font-black text-[#36454F]">{b.title}</p>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${b.status === 'running' ? 'bg-green-100 text-green-700' : b.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{b.status === 'running' ? 'Running' : b.status === 'upcoming' ? 'Upcoming' : 'Ended'}</span>
              </div>
              <p className="text-[12px] text-slate-500">Coach {b.coachName} · {b.schedule} {b.scheduleTime}</p>
              <p className="text-[12px] text-slate-500">{fmt(b.startDate)} → {fmt(b.endDate)}</p>
              <p className="text-[12px] font-black text-[#0E7490] mt-1 flex items-center gap-1">{b.studentCount}/{b.capacity} students <ChevronRight size={13} /></p>
            </button>
          ))}
        </div>
      )}

      {sel && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4" data-testid="batch-detail">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
              <h3 className="text-[16px] font-black text-[#36454F]">{sel.title}</h3>
              <p className="text-[12px] text-slate-500">Coach {sel.coachName} · {sel.schedule} {sel.scheduleTime} · {students.length}/{sel.capacity} students</p>
            </div>
            <button type="button" onClick={() => setPanel(panel === 'attendance' ? null : 'attendance')} disabled={!students.length} className={primary}><ClipboardCheck size={14} /> Mark attendance</button>
            <button type="button" onClick={() => setPanel(panel === 'add' ? null : 'add')} className={ghost}><UserPlus size={14} /> Add student</button>
          </div>
          {panel === 'attendance' && <AttendancePanel batch={sel} students={students} arenaId={arenaId} onSaved={refresh} onClose={() => setPanel(null)} />}
          {panel === 'add' && <AddStudentPanel batch={sel} arenaId={arenaId} onAdded={refresh} onClose={() => setPanel(null)} />}

          {students.length === 0 ? <p className="text-[12px] text-slate-400">No students yet — press "Add student".</p> : (
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-100">
              {students.map((s) => (
                <div key={s.userId} className="px-3 py-2.5" data-testid="student-row">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[180px]">
                      <p className="text-[13px] font-black text-[#36454F]">{s.name}</p>
                      <p className="text-[11px] text-slate-400">{s.phone}{s.hasLogin ? ` · ${s.email}` : ''}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${s.enrollmentType === 'offline' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>{s.enrollmentType === 'offline' ? 'Added at desk' : 'Joined in app'}</span>
                    <span className="text-[12px] font-bold text-slate-500 w-28 text-right">{s.attendancePercent === null ? 'No classes yet' : `${s.attendancePercent}% · ${s.sessions} class${s.sessions === 1 ? '' : 'es'}`}</span>
                    <FeeBadge fee={s.fee} />
                    {s.fee && s.fee.state !== 'covered' && s.fee.state !== 'ended' && <button type="button" onClick={() => setFeeFor(feeFor === s.userId ? null : s.userId)} className="h-8 px-3 rounded-xl border border-slate-200 text-[11px] font-black text-slate-600">Fee paid</button>}
                    {s.hasLogin
                      ? <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-green-100 text-green-700">Has app login</span>
                      : <button type="button" onClick={() => setLoginFor(loginFor === s.userId ? null : s.userId)} className="h-8 px-3 rounded-xl border border-[#0E7490]/30 text-[11px] font-black text-[#0E7490] flex items-center gap-1"><KeyRound size={12} /> Give app login</button>}
                  </div>
                  {feeFor === s.userId && <div className="mt-2"><RecordFeePanel student={s} arenaId={arenaId} onDone={async () => {}} onClose={() => { setFeeFor(null); void loadStudents(); }} /></div>}
                  {loginFor === s.userId && <div className="mt-2"><GiveLoginPanel student={s} arenaId={arenaId} onDone={() => loadStudents()} onClose={() => setLoginFor(null)} /></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
