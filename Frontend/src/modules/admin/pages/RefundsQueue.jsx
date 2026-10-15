import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Wallet, Landmark, X } from 'lucide-react';
import { listManualRefunds, refundAdminBooking } from '../../../services/adminBookingsApi';

const fmt = (n) => Number(n || 0).toFixed(3);

/**
 * Payments Bank Muscat captured whose booking could not be confirmed (another customer
 * paid for the same slot first). Each needs the customer refunded — as Arena Wallet credit,
 * or as a card refund done in the SmartPay merchant portal and recorded here.
 */
function ResolveModal({ item, onClose, onDone }) {
  const [method, setMethod] = useState('wallet');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (method === 'bank' && !reference.trim()) {
      setError('Enter the Bank Muscat refund reference');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await refundAdminBooking(item.bookingId, { method, reference: reference.trim() });
      onDone();
    } catch (e) {
      setError(e.message || 'Refund failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl p-6">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
          <X size={14} />
        </button>
        <h3 className="text-lg font-black text-[#36454F]">Refund {item.customerName}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {item.courtName} · {item.date} · {item.timeSlot} — OMR {fmt(item.amount)}
          {item.walletAmount > 0 && <> (OMR {fmt(item.walletAmount)} wallet part was already returned automatically)</>}
        </p>
        <div className="mt-4 space-y-2">
          <label className="flex items-start gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer">
            <input type="radio" checked={method === 'wallet'} onChange={() => setMethod('wallet')} className="mt-0.5" />
            <span className="text-[11px] text-slate-600"><span className="font-black text-[#36454F]">Arena Wallet credit</span> — OMR {fmt(item.cardAmount)} credited instantly.</span>
          </label>
          <label className="flex items-start gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer">
            <input type="radio" checked={method === 'bank'} onChange={() => setMethod('bank')} className="mt-0.5" />
            <span className="text-[11px] text-slate-600"><span className="font-black text-[#36454F]">Card refund</span> — refund OMR {fmt(item.cardAmount)} in the SmartPay merchant portal (payment ref {item.paymentReference}), then record the bank reference.</span>
          </label>
          {method === 'bank' && (
            <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Bank refund reference" className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#CE2029]" />
          )}
          {error && <p className="text-[11px] font-bold text-red-600">{error}</p>}
        </div>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase">Close</button>
          <button type="button" onClick={submit} disabled={busy} className="flex-1 py-3 rounded-2xl bg-[#CE2029] text-white text-xs font-black uppercase disabled:opacity-60">
            {busy ? 'Refunding…' : 'Mark Refunded'}
          </button>
        </div>
      </div>
    </div>
  );
}

const RefundsQueue = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listManualRefunds();
      setItems(res.refunds || []);
    } catch (e) {
      setError(e.message || 'Could not load refunds');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-[#36454F] uppercase tracking-tight">Pending Refunds</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Customers whose card payment went through but whose slot had already been taken by someone else.
            Refund each one as wallet credit, or refund the card in the Bank Muscat portal and record it here.
          </p>
        </div>
        <button type="button" onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase text-slate-600 hover:bg-slate-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {toast && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <CheckCircle size={14} /> {toast}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center">
          <CheckCircle size={32} className="mx-auto text-emerald-500 mb-3" />
          <p className="text-sm font-black text-[#36454F]">Nothing to refund</p>
          <p className="text-xs text-slate-400 mt-1">Every captured payment has a confirmed booking.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
              <tr>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Booking</th>
                <th className="text-left p-3">Paid</th>
                <th className="text-right p-3">Card part</th>
                <th className="text-right p-3">Wallet part</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.bookingId} className="border-t border-slate-100">
                  <td className="p-3">
                    <p className="font-black text-[#36454F]">{it.customerName}</p>
                    <p className="text-slate-400">{it.customerPhone || it.customerEmail}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-[#36454F]">{it.arenaName} · {it.courtName}</p>
                    <p className="text-slate-400">{it.date} · {it.timeSlot}</p>
                  </td>
                  <td className="p-3 text-slate-500">
                    {it.paidAt ? new Date(it.paidAt).toLocaleString('en-GB') : '—'}
                    <p className="text-[10px] text-slate-400 font-mono">{it.paymentReference}</p>
                  </td>
                  <td className="p-3 text-right font-black text-[#CE2029]">OMR {fmt(it.cardAmount)}</td>
                  <td className="p-3 text-right text-slate-500">
                    {it.walletAmount > 0 ? <span className="inline-flex items-center gap-1"><Wallet size={11} /> {fmt(it.walletAmount)} returned</span> : '—'}
                  </td>
                  <td className="p-3 text-right">
                    <button type="button" onClick={() => setSelected(it)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#CE2029] text-white text-[10px] font-black uppercase">
                      <Landmark size={12} /> Refund
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <ResolveModal
          item={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setToast(`Refund recorded for ${selected.customerName}.`);
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
};

export default RefundsQueue;
