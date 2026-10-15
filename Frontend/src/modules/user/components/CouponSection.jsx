import { useEffect, useMemo, useState } from 'react';
import { Tag, X, CheckCircle, Loader2 } from 'lucide-react';
import { listPublicCoupons } from '../../../services/couponApi';
import { quoteCheckout } from '../../../services/bookingsApi';

const omr = (n) => `OMR ${(Number(n) || 0).toFixed(3)}`;

function describe(c) {
  if (c.description) return c.description;
  const off = c.discountType === 'PERCENTAGE' ? `${c.discountValue}% off` : `${omr(c.discountValue)} off`;
  return c.minOrderAmount > 0 ? `${off} on orders over ${omr(c.minOrderAmount)}` : off;
}

/**
 * Coupon entry for court checkout (Review Order and Cart).
 * The discount always comes from the server's checkout quote for these exact lines, so what
 * the customer sees is what they'll be charged. Re-validates when the order changes.
 *
 * props:
 *   lines   — [{ arenaId, courtId, date: 'YYYY-MM-DD', timeSlot }]
 *   applied — { code, discount, description } | null
 *   onChange(applied | null)
 */
const CouponSection = ({ lines, applied, onChange, compact = false }) => {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [publicCoupons, setPublicCoupons] = useState([]);

  const linesKey = useMemo(
    () => (lines || []).map((l) => `${l.courtId}|${l.date}|${l.timeSlot}`).sort().join(','),
    [lines],
  );

  useEffect(() => {
    let cancelled = false;
    listPublicCoupons()
      .then((d) => { if (!cancelled) setPublicCoupons(d.coupons || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const apply = async (rawCode) => {
    const c = String(rawCode || code).trim().toUpperCase();
    if (!c || !lines?.length) return;
    setBusy(true);
    setError('');
    try {
      const { quote } = await quoteCheckout({ lines, couponCode: c });
      onChange({ code: quote.couponCode, discount: Number(quote.couponDiscount) || 0, description: quote.couponDescription || '' });
      setCode('');
    } catch (e) {
      setError(e.message || 'This coupon cannot be applied');
    } finally {
      setBusy(false);
    }
  };

  // The order changed (slot added/removed): re-check the applied coupon against the new total.
  useEffect(() => {
    if (!applied?.code || !lines?.length) return undefined;
    let cancelled = false;
    quoteCheckout({ lines, couponCode: applied.code })
      .then(({ quote }) => {
        if (cancelled) return;
        const discount = Number(quote.couponDiscount) || 0;
        if (discount !== applied.discount) onChange({ ...applied, discount });
      })
      .catch((e) => {
        if (cancelled) return;
        onChange(null);
        setError(`${applied.code} was removed: ${e.message || 'no longer valid for this order'}`);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linesKey]);

  const suggestions = publicCoupons.filter((c) => c.code !== applied?.code).slice(0, 4);

  return (
    <div className={`rounded-2xl border border-slate-100 bg-slate-50/50 ${compact ? 'p-3' : 'p-4'} space-y-3`}>
      <div className="flex items-center gap-2">
        <Tag size={14} className="text-[#CE2029]" />
        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800">Coupon</h4>
      </div>

      {applied ? (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-black text-emerald-800 tracking-wider">{applied.code} applied</p>
              <p className="text-[10px] font-bold text-emerald-700 truncate">
                You save {omr(applied.discount)}{applied.description ? ` · ${applied.description}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); setError(''); }}
            aria-label="Remove coupon"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-700 hover:bg-emerald-100 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <form
          className="flex gap-2"
          onSubmit={(e) => { e.preventDefault(); apply(); }}
        >
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            placeholder="Enter coupon code"
            className="flex-1 min-w-0 py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-[12px] font-black tracking-wider uppercase outline-none focus:border-[#CE2029]"
          />
          <button
            type="submit"
            disabled={busy || !code.trim()}
            className="px-4 rounded-xl bg-[#CE2029] text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center gap-1.5"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : null}
            Apply
          </button>
        </form>
      )}

      {error && <p className="text-[10px] font-bold text-[#CE2029]">{error}</p>}

      {!applied && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={busy}
              onClick={() => apply(c.code)}
              title={describe(c)}
              className="text-left px-2.5 py-1.5 rounded-lg border border-dashed border-[#CE2029]/40 bg-white hover:bg-[#CE2029]/5 disabled:opacity-50"
            >
              <span className="block text-[10px] font-black tracking-wider text-[#CE2029]">{c.code}</span>
              <span className="block text-[9px] font-bold text-slate-500">{describe(c)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CouponSection;
