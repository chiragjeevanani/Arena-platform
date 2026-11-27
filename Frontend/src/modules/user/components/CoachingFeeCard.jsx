import { useState } from 'react';
import { Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import { payMyCoachingMonth } from '../../../services/meApi';

const fmt = (ymd) => (ymd ? new Date(`${ymd}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

/** Monthly coaching fee: paid-until date, due / overdue warning and "Pay next month" from the wallet. */
export default function CoachingFeeCard({ enrollmentId, fee, onPaid }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  if (!fee) return null;
  const monthly = Number(fee.monthlyFee || 0);
  const warn = fee.state === 'overdue' || fee.state === 'due_soon';
  const canPay = ['overdue', 'due_soon', 'paid'].includes(fee.state);
  const pay = async () => {
    if (!window.confirm(`Pay the next month (OMR ${monthly.toFixed(3)}) from your Arena Wallet?`)) return;
    setBusy(true); setErr(''); setMsg('');
    try {
      const r = await payMyCoachingMonth(enrollmentId, 1);
      setMsg(`Paid — your fee is now paid until ${fmt(r.paidUntil)}.`);
      onPaid?.(r.fee);
    } catch (e) { setErr(e.message || 'Payment failed'); } finally { setBusy(false); }
  };
  const tone = fee.state === 'overdue' ? 'border-red-200 bg-red-50' : fee.state === 'due_soon' ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-white';
  return (
    <div className={`rounded-[24px] border shadow-sm p-5 space-y-3 ${tone}`} data-testid="coaching-fee-card">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${warn ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
          {warn ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Monthly fee</h3>
          <p className="text-[13px] font-bold text-slate-700" data-testid="fee-label">
            {fee.state === 'not_recorded' ? 'Pay at the arena desk — they will record it here.' : fee.label}
            {fee.paidUntil && !['paid', 'covered', 'ended'].includes(fee.state) ? ` (paid until ${fmt(fee.paidUntil)})` : ''}
          </p>
        </div>
        <span className="text-[12px] font-black text-slate-500">OMR {monthly.toFixed(3)}/month</span>
      </div>
      {fee.state === 'overdue' && <p className="text-[12px] font-bold text-red-700">Please pay the next month to keep your place in the batch.</p>}
      {canPay && (
        <button type="button" disabled={busy} onClick={pay} className="w-full h-11 rounded-xl bg-[#CE2029] text-white text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
          <Wallet size={15} /> {busy ? 'Paying…' : 'Pay next month from wallet'}
        </button>
      )}
      {canPay && <p className="text-[10px] text-slate-400 text-center">Or pay by cash / card at the arena desk.</p>}
      {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}
      {msg && <p className="text-[12px] font-bold text-emerald-700">{msg}</p>}
    </div>
  );
}
