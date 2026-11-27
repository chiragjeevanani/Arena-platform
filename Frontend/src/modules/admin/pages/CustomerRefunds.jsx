import { useCallback, useEffect, useState } from 'react';
import { Search, Undo2, Wallet, X, Check, History } from 'lucide-react';
import { listAdminUsers, getCustomerRefundables, refundCustomer, listRecentCustomerRefunds } from '../../../services/adminOpsApi';

const omr = (n) => `OMR ${Number(n || 0).toFixed(3)}`;
const fmtDate = (d) => (d ? new Date(String(d).length === 10 ? `${d}T12:00:00` : d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
const fmtTime = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');
const input = 'h-11 px-3 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-[#36454F] outline-none focus:border-[#CE2029] w-full';
const label = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1';
const primary = 'h-11 px-5 rounded-xl bg-[#ce2029] text-[#ffffff] text-[12px] font-black flex items-center gap-2 disabled:opacity-40';
const ghost = 'h-10 px-4 rounded-xl border border-slate-200 bg-[#ffffff] text-[12px] font-black text-slate-600 flex items-center gap-2 disabled:opacity-40';

/** Full / partial refund of one purchase (or a general refund), credited to the wallet. */
function RefundPanel({ customer, item, onDone, onClose }) {
  const general = !item;
  const [mode, setMode] = useState(general ? 'partial' : 'full');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [cancelBooking, setCancelBooking] = useState(item?.type === 'booking' && !['cancelled'].includes(item?.status));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const isBooking = item?.type === 'booking' && item?.status !== 'cancelled';
  const pick = (m) => { setMode(m); if (isBooking) setCancelBooking(m === 'full'); };
  const value = mode === 'full' && !general ? item.refundable : Number(amount);
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!(value > 0)) { setErr('Enter the amount to refund'); return; }
    if (!general && value > item.refundable + 0.0005) { setErr(`At most ${omr(item.refundable)} can be refunded for this`); return; }
    if (!window.confirm(`Refund ${omr(value)} to ${customer.name}'s Arena Wallet?${cancelBooking && isBooking ? ' The booking will also be cancelled.' : ''}`)) return;
    setBusy(true);
    try {
      const r = await refundCustomer(customer.id, general
        ? { sourceType: 'general', amount: value, reason }
        : { sourceType: item.type, sourceId: item.id, mode, amount: mode === 'partial' ? value : undefined, reason, cancelBooking: isBooking && cancelBooking });
      await onDone(`${omr(r.refund.amount)} refunded to ${customer.name}'s wallet${r.refund.cancelledBooking ? ' and the booking was cancelled' : ''}. They got a notification.`);
    } catch (e2) { setErr(e2.message || 'Refund failed'); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="rounded-xl border border-[#CE2029]/20 bg-[#CE2029]/[0.03] p-3 space-y-3" data-testid="refund-panel">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-black text-[#36454F]">{general ? 'General refund (not linked to a purchase)' : `Refund — ${item.title}`}</p>
        <button type="button" onClick={onClose} className="p-1 text-slate-400"><X size={16} /></button>
      </div>
      {!general && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => pick('full')} className={`h-10 px-4 rounded-xl text-[12px] font-black border ${mode === 'full' ? 'bg-[#36454F] text-[#ffffff] border-transparent' : 'bg-[#ffffff] text-slate-500 border-slate-200'}`}>Full refund · {omr(item.refundable)}</button>
          <button type="button" onClick={() => pick('partial')} className={`h-10 px-4 rounded-xl text-[12px] font-black border ${mode === 'partial' ? 'bg-[#36454F] text-[#ffffff] border-transparent' : 'bg-[#ffffff] text-slate-500 border-slate-200'}`}>Partial refund</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(mode === 'partial' || general) && (
          <div><span className={label}>Amount (OMR){!general ? ` · max ${Number(item.refundable).toFixed(3)}` : ''}</span><input className={input} aria-label="Refund amount" inputMode="decimal" required placeholder="e.g. 3.500" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        )}
        <div className={mode === 'partial' || general ? 'md:col-span-2' : 'md:col-span-3'}><span className={label}>Reason *</span><input className={input} aria-label="Refund reason" required placeholder="e.g. Court light failure — half the session lost" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      </div>
      {isBooking && (
        <label className="flex items-center gap-2 text-[13px] font-bold text-[#36454F]"><input type="checkbox" checked={cancelBooking} onChange={(e) => setCancelBooking(e.target.checked)} /> Also cancel this booking and free the court</label>
      )}
      <p className="text-[11px] text-slate-500">The money goes to the customer's Arena Wallet straight away and they get a notification.</p>
      {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}
      <button type="submit" disabled={busy || !reason.trim()} className={primary}><Undo2 size={14} /> {busy ? 'Refunding…' : `Refund ${value > 0 ? omr(value) : ''}`}</button>
    </form>
  );
}

export default function CustomerRefunds() {
  const [q, setQ] = useState('');
  const [found, setFound] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null); // item key | 'general'
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (q.trim().length < 2) { setFound([]); return undefined; }
    const t = setTimeout(() => { listAdminUsers({ q: q.trim() }).then((r) => setFound((r.users || []).slice(0, 10))).catch(() => setFound([])); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const loadRecent = useCallback(() => listRecentCustomerRefunds().then((r) => setRecent(r.refunds || [])).catch(() => {}), []);
  useEffect(() => { void loadRecent(); }, [loadRecent]);

  const load = useCallback(async (id) => {
    setErr('');
    try { setData(await getCustomerRefundables(id)); } catch (e) { setErr(e.message || 'Could not load the customer'); }
  }, []);
  const choose = (u) => { const id = u.id || u._id; setCustomerId(id); setFound([]); setQ(''); setOpen(null); setMsg(''); setData(null); void load(id); };
  const done = async (text) => { setOpen(null); setMsg(text); await load(customerId); await loadRecent(); };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl">
      <div className="bg-[#ffffff] rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3"><Undo2 size={20} className="text-[#CE2029]" />
          <div><h1 className="text-[18px] font-black text-[#36454F]">Refund a Customer</h1><p className="text-[12px] text-slate-500">Refund any purchase — in full or part — at any time. The money goes to the customer's Arena Wallet.</p></div>
        </div>
        <div className="relative max-w-xl"><Search size={15} className="absolute left-3 top-3.5 text-slate-400" />
          <input className={`${input} pl-9`} aria-label="Search customer" placeholder="Search customer by name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {found.length > 0 && (
          <div className="mt-2 max-w-xl bg-[#ffffff] rounded-xl border border-slate-100 divide-y divide-slate-100 shadow-sm" data-testid="customer-results">
            {found.map((u) => (
              <button key={u.id || u._id} type="button" onClick={() => choose(u)} className="w-full text-left px-3 py-2 hover:bg-slate-50">
                <p className="text-[13px] font-black text-[#36454F]">{u.name} {u.role !== 'CUSTOMER' && <span className="text-[10px] font-black text-slate-400">· {u.role}</span>}</p>
                <p className="text-[11px] text-slate-400">{[u.email, u.phone].filter(Boolean).join(' · ')}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {err && <p className="text-[12px] font-bold text-red-600">{err}</p>}
      {msg && <p className="text-[13px] font-bold text-green-700 flex items-center gap-1" data-testid="refund-success"><Check size={15} /> {msg}</p>}

      {data && (
        <div className="bg-[#ffffff] rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4" data-testid="customer-refunds">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]"><p className="text-[16px] font-black text-[#36454F]">{data.customer.name}</p><p className="text-[12px] text-slate-500">{[data.customer.email, data.customer.phone].filter(Boolean).join(' · ')}</p></div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2"><Wallet size={15} className="text-[#0E7490]" /><span className="text-[12px] font-black text-[#36454F]" data-testid="wallet-balance">Wallet {omr(data.walletBalance)}</span></div>
            <button type="button" onClick={() => setOpen(open === 'general' ? null : 'general')} className={ghost}><Undo2 size={13} /> General refund</button>
          </div>
          {open === 'general' && <RefundPanel customer={data.customer} item={null} onDone={done} onClose={() => setOpen(null)} />}

          <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-400">Purchases</h3>
          {data.items.length === 0 ? <p className="text-[12px] text-slate-400">No paid purchases found. Use "General refund" to credit the wallet anyway.</p> : (
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-100">
              {data.items.map((it) => {
                const key = `${it.type}:${it.id}`;
                return (
                  <div key={key} className="px-3 py-2.5" data-testid="purchase-row">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex-1 min-w-[240px]"><p className="text-[13px] font-black text-[#36454F]">{it.title}</p><p className="text-[11px] text-slate-400">{fmtDate(it.date)} · {it.detail}</p></div>
                      <div className="text-right text-[12px] w-28"><p className="text-slate-400 text-[10px] font-black uppercase">Paid</p><p className="font-black text-[#36454F]">{omr(it.paid)}</p></div>
                      <div className="text-right text-[12px] w-28"><p className="text-slate-400 text-[10px] font-black uppercase">Refunded</p><p className={`font-black ${it.refunded > 0 ? 'text-amber-700' : 'text-slate-400'}`}>{omr(it.refunded)}</p></div>
                      <button type="button" disabled={it.refundable <= 0} onClick={() => setOpen(open === key ? null : key)} className="h-9 px-4 rounded-xl bg-[#ce2029] text-[#ffffff] text-[12px] font-black disabled:opacity-30">{it.refundable <= 0 ? 'Fully refunded' : 'Refund'}</button>
                    </div>
                    {open === key && <div className="mt-2"><RefundPanel customer={data.customer} item={it} onDone={done} onClose={() => setOpen(null)} /></div>}
                  </div>
                );
              })}
            </div>
          )}

          {data.history.length > 0 && (
            <>
              <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><History size={13} /> Refunds given to {data.customer.name}</h3>
              <div className="border border-slate-100 rounded-xl divide-y divide-slate-100">
                {data.history.map((h) => (
                  <div key={h.id} className="px-3 py-2 flex flex-wrap items-center gap-3 text-[12px]">
                    <span className="font-black text-green-700 w-28">{omr(h.amount)}</span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-100 text-slate-600">{h.kind === 'full' ? 'Full' : h.kind === 'partial' ? 'Partial' : 'General'}</span>
                    <span className="flex-1 min-w-[200px] text-[#36454F]">{h.what}{h.cancelledBooking ? ' · booking cancelled' : ''} — <i className="text-slate-500">{h.reason}</i></span>
                    <span className="text-slate-400">{fmtTime(h.at)}{h.by ? ` · ${h.by}` : ''}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="bg-[#ffffff] rounded-2xl border border-slate-100 shadow-sm p-4">
        <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><History size={13} /> Recent refunds (all customers)</h3>
        {recent.length === 0 ? <p className="text-[12px] text-slate-400">No refunds given yet.</p> : (
          <div className="divide-y divide-slate-100">
            {recent.slice(0, 20).map((h) => (
              <button key={h.id} type="button" onClick={() => choose({ id: h.customer.id })} className="w-full text-left px-1 py-2 flex flex-wrap items-center gap-3 text-[12px] hover:bg-slate-50">
                <span className="font-black text-green-700 w-28">{omr(h.amount)}</span>
                <span className="font-black text-[#36454F] w-44 truncate">{h.customer.name || h.customer.email}</span>
                <span className="flex-1 min-w-[200px] text-slate-500 truncate">{h.what} — {h.reason}</span>
                <span className="text-slate-400">{fmtTime(h.at)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
