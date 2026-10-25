import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock, ShoppingCart, Trash2, Wallet, Zap, AlertTriangle, Plus, CheckCircle } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { isApiConfigured } from '../../../services/config';
import { fetchCourtAvailability, fetchBookingPricing } from '../../../services/bookingsApi';
import { getMyWallet } from '../../../services/meApi';
import { checkoutCourtLines } from '../../../utils/courtCheckout';
import CouponSection from '../components/CouponSection';
import { isSlotTimePassed } from '../../../utils/slotTime';

const omr = (n) => `OMR ${(Number(n) || 0).toFixed(3)}`;

function formatDay(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

const Cart = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const cart = useCart();
  const { items } = cart;

  // key → reason string for slots that can no longer be booked
  const [unavailable, setUnavailable] = useState({});
  const [checking, setChecking] = useState(false);
  const [discountByArena, setDiscountByArena] = useState({});
  const [walletBalance, setWalletBalance] = useState(null);
  const [useWallet, setUseWallet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coupon, setCoupon] = useState(null); // { code, discount, description }
  const [error, setError] = useState('');

  const isCustomer = user?.role === 'CUSTOMER';
  const canCheckout = isApiConfigured() && isLoggedIn && isCustomer;

  // Re-check every court/date in the cart against live availability + current prices.
  const groupsKey = useMemo(
    () => [...new Set(items.map((i) => `${i.courtId}|${i.dateYmd}`))].sort().join(','),
    [items],
  );
  useEffect(() => {
    if (!isApiConfigured() || !groupsKey) return undefined;
    let cancelled = false;
    const groups = groupsKey.split(',').map((g) => g.split('|'));
     
    setChecking(true);
    Promise.all(
      groups.map(([courtId, ymd]) =>
        fetchCourtAvailability(courtId, ymd)
          .then((data) => ({ courtId, ymd, slots: data.slots || [] }))
          .catch(() => ({ courtId, ymd, slots: null })),
      ),
    ).then((results) => {
      if (cancelled) return;
      const nextUnavailable = {};
      const priceUpdates = {};
      const now = new Date();
      for (const item of cart.items) {
        const res = results.find((r) => r.courtId === String(item.courtId) && r.ymd === item.dateYmd);
        if (!res || res.slots === null) continue; // couldn't check — let the server decide at checkout
        const live = res.slots.find((s) => s.timeSlot === item.timeSlot);
        if (!live) nextUnavailable[item.key] = 'Slot no longer offered';
        else if (!live.available) nextUnavailable[item.key] = 'Just booked by someone else';
        else if (isSlotTimePassed(item.date, item.timeSlot, now)) nextUnavailable[item.key] = 'Slot time has passed';
        else if (Number(live.price) && Math.abs(Number(live.price) - Number(item.price)) > 0.0005) {
          priceUpdates[item.key] = { price: Number(live.price), pricing: live.pricing || item.pricing };
        }
      }
      setUnavailable(nextUnavailable);
      if (Object.keys(priceUpdates).length) cart.updateItems(priceUpdates);
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
    // cart.items intentionally read fresh inside; re-run only when the set of court/dates changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupsKey]);

  // Member discount % per arena (the server applies it per booking at checkout).
  const arenaIdsKey = useMemo(() => [...new Set(items.map((i) => i.arenaId))].sort().join(','), [items]);
  useEffect(() => {
    if (!canCheckout || !arenaIdsKey) return;
    arenaIdsKey.split(',').forEach((arenaId) => {
      fetchBookingPricing(arenaId)
        .then((res) => setDiscountByArena((prev) => ({ ...prev, [arenaId]: Number(res.pricing?.discountPercent) || 0 })))
        .catch(() => {});
    });
  }, [canCheckout, arenaIdsKey]);

  useEffect(() => {
    if (!canCheckout) return;
    getMyWallet()
      .then((data) => setWalletBalance(Number(data.wallet?.balance) || 0))
      .catch(() => setWalletBalance(0));
  }, [canCheckout]);

  const bookable = items.filter((i) => !unavailable[i.key]);
  const unavailableCount = items.length - bookable.length;
  const subtotal = bookable.reduce((s, i) => s + (Number(i.price) || 0), 0);
  const memberDiscount = bookable.reduce(
    (s, i) => s + Math.round((Number(i.price) || 0) * (discountByArena[i.arenaId] || 0)) / 100,
    0,
  );
  const couponDiscount = coupon ? Number(coupon.discount) || 0 : 0;
  const total = Math.max(0, subtotal - memberDiscount - couponDiscount);
  // Coupon quotes are priced by the server for exactly these slots.
  const couponLines = useMemo(
    () => bookable.map((i) => ({ arenaId: String(i.arenaId), courtId: String(i.courtId), date: i.dateYmd, timeSlot: i.timeSlot })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookable.map((i) => i.key).join(',')],
  );
  const walletDeduction = useWallet ? Math.min(walletBalance || 0, total) : 0;
  const payable = total - walletDeduction;
  const multipleArenas = new Set(items.map((i) => i.arenaId)).size > 1;

  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (!map.has(item.dateYmd)) map.set(item.dateYmd, []);
      map.get(item.dateYmd).push(item);
    }
    return [...map.entries()];
  }, [items]);

  const lastItem = items[items.length - 1];
  const addMore = () => {
    if (lastItem) navigate(`/book/${lastItem.arenaId}/${lastItem.courtId}`);
    else navigate('/arenas');
  };

  const handleCheckout = async () => {
    setError('');
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    if (!canCheckout) {
      setError('Sign in with a customer account to book.');
      return;
    }
    if (!bookable.length) return;
    setSubmitting(true);
    try {
      const result = await checkoutCourtLines({ lines: bookable, useWallet, couponCode: coupon?.code });
      if (result.redirected) return;
      navigate('/booking-success', { replace: true, state: result.successState });
    } catch (e) {
      if (e.failedLine && (e.status === 409 || e.status === 400)) {
        setUnavailable((prev) => ({ ...prev, [e.failedLine.key]: 'Just booked by someone else' }));
      }
      if (e.couponError) setCoupon(null);
      setError(e.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const checkoutLabel = !isLoggedIn
    ? 'Sign in to Checkout'
    : submitting
      ? 'Booking…'
      : `Checkout ${bookable.length} Slot${bookable.length === 1 ? '' : 's'}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-44 lg:pb-16">
      {/* Header */}
      <div className="px-6 pt-3 md:pt-4 pb-3 md:pb-4 sticky top-0 z-50 backdrop-blur-xl border-b bg-[#CE2029] border-white/10 rounded-b-[20px] md:rounded-none shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center border active:scale-95 transition-all bg-white/10 border-white/20 text-white shadow-sm hover:bg-white/20"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-sm md:text-base font-black text-white uppercase tracking-wider font-display">
            Review & Book{items.length ? ` (${items.length})` : ''}
          </h1>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Remove all slots from your cart?')) cart.clearCart();
              }}
              className="ml-auto text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="max-w-md mx-auto px-6 pt-20 text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#CE2029]/30 mb-6">
            <ShoppingCart size={36} />
          </div>
          <h2 className="text-xl font-black text-slate-900 font-display">No slots selected</h2>
          <p className="text-[12px] font-bold text-slate-500 mt-2 leading-relaxed">
            Tap slots on any court and any date — switch court to add more — and book them all in one payment.
          </p>
          <ShuttleButton variant="primary" className="mt-8 mx-auto" onClick={() => navigate('/arenas')}>
            Browse Courts
          </ShuttleButton>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 md:px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Items */}
          <div className="lg:col-span-7 space-y-5">
            {unavailableCount > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-amber-900">
                    {unavailableCount} slot{unavailableCount === 1 ? ' is' : 's are'} no longer available and won't be booked.
                  </p>
                  <button
                    type="button"
                    onClick={() => cart.removeItems(Object.keys(unavailable))}
                    className="mt-1 text-[10px] font-black uppercase tracking-widest text-amber-700 underline"
                  >
                    Remove unavailable
                  </button>
                </div>
              </div>
            )}

            {grouped.map(([ymd, dayItems]) => (
              <div key={ymd} className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-50 bg-slate-50/60">
                  <Calendar size={13} className="text-[#CE2029]" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">
                    {formatDay(dayItems[0].date)}
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {dayItems.map((item) => {
                    const reason = unavailable[item.key];
                    const isPeak = item.pricing?.type === 'peak';
                    return (
                      <Motion.div
                        key={item.key}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`flex items-center gap-4 px-5 py-4 border-b border-slate-50 last:border-0 ${reason ? 'bg-red-50/40' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${reason ? 'bg-red-100 text-red-500' : 'bg-[#CE2029]/5 text-[#CE2029]'}`}>
                          <Clock size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[13px] font-black ${reason ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                              {item.timeSlot}
                            </span>
                            {isPeak && !reason && (
                              <span className="flex items-center gap-0.5 text-[8px] font-black uppercase text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                                <Zap size={8} fill="currentColor" /> Peak
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 truncate">
                            {item.courtName}
                            {multipleArenas ? ` · ${item.arenaName}` : ''}
                          </p>
                          {reason && <p className="text-[10px] font-black text-red-600 mt-0.5">{reason}</p>}
                        </div>
                        <span className={`text-[13px] font-black shrink-0 ${reason ? 'text-slate-300' : 'text-slate-900'}`}>
                          {omr(item.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => cart.removeItem(item.key)}
                          aria-label={`Remove ${item.courtName} ${item.timeSlot}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                        >
                          <Trash2 size={15} />
                        </button>
                      </Motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ))}

            <button
              type="button"
              onClick={addMore}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-[20px] border-2 border-dashed border-slate-200 text-slate-500 hover:border-[#CE2029]/40 hover:text-[#CE2029] text-[11px] font-black uppercase tracking-widest transition-all"
            >
              <Plus size={14} /> Add More Slots
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="bg-slate-950 px-6 py-5 text-white">
                <p className="text-[9px] font-black text-[#CE2029] uppercase tracking-widest">Order Summary</p>
                <h3 className="text-lg font-black font-display mt-0.5">
                  {bookable.length} Slot{bookable.length === 1 ? '' : 's'}
                  {checking && <span className="text-[10px] font-bold text-white/50 ml-2 normal-case">checking availability…</span>}
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-black">{omr(subtotal)}</span>
                </div>
                {memberDiscount > 0 && (
                  <div className="flex justify-between text-[10px] font-bold text-green-600 uppercase tracking-widest">
                    <span>Member Discount</span>
                    <span className="font-black">-{omr(memberDiscount)}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[10px] font-bold text-green-600 uppercase tracking-widest">
                    <span>Coupon ({coupon.code})</span>
                    <span className="font-black">-{omr(couponDiscount)}</span>
                  </div>
                )}

                {canCheckout && couponLines.length > 0 && (
                  <CouponSection lines={couponLines} applied={coupon} onChange={setCoupon} />
                )}

                {canCheckout && walletBalance > 0 && (
                  <div className={`p-4 rounded-2xl border transition-all ${useWallet ? 'border-[#CE2029] bg-[#CE2029]/5' : 'border-slate-100 bg-slate-50/50'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${useWallet ? 'bg-[#CE2029]/10 text-[#CE2029]' : 'bg-slate-100 text-slate-400'}`}>
                          <Wallet size={18} />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800">Use Wallet Credit</h4>
                          <p className="text-[9px] font-bold text-slate-400 mt-0.5">Available: {omr(walletBalance)}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#CE2029]"></div>
                      </label>
                    </div>
                  </div>
                )}
                {walletDeduction > 0 && (
                  <div className="flex justify-between text-[10px] font-bold text-[#CE2029] uppercase tracking-widest">
                    <span>Wallet Applied</span>
                    <span className="font-black">-{omr(walletDeduction)}</span>
                  </div>
                )}

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-end justify-between">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#CE2029]">Total Payable</p>
                  <span className="text-2xl font-black font-display text-slate-950 tracking-tighter">{omr(payable)}</span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 leading-relaxed">
                  Slots aren't reserved until payment completes. Final prices are confirmed by the server at checkout.
                </p>

                {error && <p className="text-[11px] font-bold text-[#CE2029]">{error}</p>}

                <div className="hidden lg:block pt-2">
                  <ShuttleButton
                    variant="primary"
                    fullWidth
                    disabled={submitting || (isLoggedIn && !bookable.length)}
                    onClick={handleCheckout}
                    icon={<ArrowRight size={14} />}
                    className="py-3.5 font-black uppercase tracking-widest text-[11px]"
                  >
                    {checkoutLabel}
                  </ShuttleButton>
                </div>
                <p className="text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest pt-2 flex items-center justify-center gap-1.5">
                  <CheckCircle size={10} className="text-emerald-500" /> One secure payment for all slots
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sticky checkout */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden p-4 pb-[calc(1rem+var(--safe-bottom))] bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Total</p>
              <p className="text-lg font-black text-slate-950 leading-tight">{omr(payable)}</p>
            </div>
            <ShuttleButton
              variant="primary"
              fullWidth
              disabled={submitting || (isLoggedIn && !bookable.length)}
              onClick={handleCheckout}
              icon={<ArrowRight size={16} />}
              className="!rounded-2xl py-3.5 text-[11px] font-black uppercase tracking-widest"
            >
              {checkoutLabel}
            </ShuttleButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
