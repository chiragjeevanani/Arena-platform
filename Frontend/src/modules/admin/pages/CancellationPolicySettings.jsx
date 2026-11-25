import { useEffect, useState } from 'react';
import { CalendarX2, Save, CheckCircle2, Info } from 'lucide-react';
import { apiJson } from '../../../services/apiClient';
import { hoursText, minutesText, loadCancellationPolicy } from '../../../utils/cancellationPolicy';

const PRESETS = [0, 2, 6, 12, 24, 48];

/** Super Admin: platform-wide cancellation & refund rules. */
export default function CancellationPolicySettings() {
  const [form, setForm] = useState({ refundHours: 24, graceMinutes: 10 });
  const [saved, setSaved] = useState(null);
  const [limits, setLimits] = useState({ refundHours: [0, 168], graceMinutes: [0, 120] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    apiJson('/api/admin/settings/cancellation-policy', { method: 'GET' })
      .then((r) => { setSaved(r.policy); setForm({ refundHours: r.policy.refundHours, graceMinutes: r.policy.graceMinutes }); if (r.limits) setLimits(r.limits); })
      .catch((e) => setErr(e.message || 'Could not load the policy'))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(''); setMsg('');
    try {
      const r = await apiJson('/api/admin/settings/cancellation-policy', { method: 'PUT', body: { refundHours: Number(form.refundHours), graceMinutes: Number(form.graceMinutes) } });
      setSaved(r.policy);
      await loadCancellationPolicy({ force: true });
      setMsg('Saved. The new rule applies to every cancellation from now on.');
    } catch (e2) {
      setErr(e2.message || 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  const h = Number(form.refundHours) || 0;
  const g = Number(form.graceMinutes) || 0;
  const changed = saved && (h !== saved.refundHours || g !== saved.graceMinutes);
  const field = 'h-12 w-28 px-3 rounded-xl border border-slate-200 bg-white text-[18px] font-black text-[#36454F] text-center outline-none focus:border-[#CE2029]';

  if (loading) return <p className="p-6 text-[12px] text-slate-400">Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-4 p-1">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#CE2029]/10 text-[#CE2029] flex items-center justify-center"><CalendarX2 size={20} /></div>
        <div>
          <h1 className="text-[18px] font-black text-[#36454F]">Cancellation &amp; Refund</h1>
          <p className="text-[11px] text-slate-500">Applies to all arenas. Refunds go to the customer's Arena Wallet.</p>
        </div>
      </div>

      <form onSubmit={save} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-6">
        <div>
          <label htmlFor="refund-hours" className="block text-[13px] font-black text-[#36454F]">Full refund if cancelled at least</label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input id="refund-hours" type="number" min={limits.refundHours[0]} max={limits.refundHours[1]} step={1} required className={field}
              value={form.refundHours} onChange={(e) => setForm({ ...form, refundHours: e.target.value })} />
            <span className="text-[13px] font-bold text-slate-500">hours before the booked slot</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button key={p} type="button" onClick={() => setForm({ ...form, refundHours: p })}
                className={`px-3 h-8 rounded-lg text-[11px] font-black border ${h === p ? 'bg-[#ce2029] text-[#ffffff] border-transparent' : 'bg-white text-slate-500 border-slate-200'}`}>
                {p === 0 ? 'Any time' : hoursText(p)}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">0 = refund whenever they cancel before the slot starts. Maximum {limits.refundHours[1]} hours (7 days).</p>
        </div>

        <div>
          <label htmlFor="grace-minutes" className="block text-[13px] font-black text-[#36454F]">Always refund if cancelled within</label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input id="grace-minutes" type="number" min={limits.graceMinutes[0]} max={limits.graceMinutes[1]} step={1} required className={field}
              value={form.graceMinutes} onChange={(e) => setForm({ ...form, graceMinutes: e.target.value })} />
            <span className="text-[13px] font-bold text-slate-500">minutes of making the booking</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Covers mistakes right after booking. 0 = no grace period.</p>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2"><Info size={12} /> What customers will see</p>
          <p className="text-[13px] text-[#36454F]">
            {h === 0
              ? 'Cancel any time before the slot starts for a full refund to your Arena Wallet.'
              : `Cancel at least ${hoursText(h)} before the slot for a full refund to your Arena Wallet. Cancellations within ${hoursText(h)} forfeit the booking fee.`}
            {g > 0 ? ` A booking cancelled within ${minutesText(g)} of being made is always refunded.` : ''}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">Shown in Help, Refund Policy, Terms, the cancel message and on every receipt.</p>
        </div>

        {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}
        {msg && <p className="text-[12px] font-bold text-green-700 flex items-center gap-1"><CheckCircle2 size={14} /> {msg}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy || !changed} className="h-11 px-6 rounded-xl bg-[#ce2029] text-[#ffffff] text-[13px] font-black flex items-center gap-2 disabled:opacity-40">
            <Save size={15} /> {busy ? 'Saving…' : 'Save'}
          </button>
          <p className="text-[11px] text-slate-400">
            {saved?.updatedAt ? `Last changed ${new Date(saved.updatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}${saved.updatedBy?.name ? ` by ${saved.updatedBy.name}` : ''}` : 'Using the default (24 hours, 10 minutes).'}
          </p>
        </div>
      </form>
    </div>
  );
}
