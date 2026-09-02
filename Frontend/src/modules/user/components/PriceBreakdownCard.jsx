import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Star, CalendarDays, Users, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

/**
 * PRICING CONFIG — used only in demo/mock mode (no live API).
 * Mirrors admin PricingRules.jsx config
 */
const PRICING_CONFIG = {
  primeRate: 5.000,
  nonPrimeRate: 3.000,
  memberDiscountEnabled: true,
  memberDiscountType: 'percentage',   // 'percentage' | 'flat'
  memberDiscountPrime: 10,            // 10% or OMR 0.500 flat
  memberDiscountNonPrime: 15,         // 15% or OMR 0.450 flat
};

// Visual + label config per slot category, keyed by the server's `pricing.type`
const SLOT_CATEGORY = {
  peak: { label: 'Peak Slot', headerBg: 'linear-gradient(135deg,#fef2f2,#fee2e2)', textColor: 'text-red-700', dotColor: 'bg-red-500' },
  prime: { label: 'Prime Slot', headerBg: 'linear-gradient(135deg,#fffbeb,#fef3c7)', textColor: 'text-amber-700', dotColor: 'bg-amber-400' },
  service: { label: 'Service Slot', headerBg: 'linear-gradient(135deg,#fdf2f8,#fce7f3)', textColor: 'text-pink-600', dotColor: 'bg-pink-400' },
  standard: { label: 'Standard Slot', headerBg: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', textColor: 'text-slate-500', dotColor: 'bg-slate-400' },
};
const getSlotCategory = (type) => SLOT_CATEGORY[type] || SLOT_CATEGORY.standard;

/**
 * PriceBreakdownCard
 *
 * Props:
 *   slot         — single slot object OR null (legacy compat)
 *   slots        — array of slot objects (multi-select mode)
 *   isMember     — boolean, toggles member discount
 *   useServerPrice — when true, prices each slot from its own `price`/`pricing.basePrice`
 *                    (the availability API already accounts for peak/weekend surcharges).
 *                    When false, falls back to the local demo PRICING_CONFIG by slot type.
 *   memberDiscountPercent — server-provided member discount %, applied when useServerPrice is true
 *   compact      — boolean, shows compact version for mobile footer
 */
const PriceBreakdownCard = ({
  slot,
  slots,        // NEW — preferred for multi-select
  isMember = false,
  useServerPrice = false,
  memberDiscountPercent = null,
  compact = false,
}) => {
  // Normalise: prefer `slots` array, fall back to single `slot` wrapped in array
  const slotList = slots && slots.length > 0 ? slots : (slot ? [slot] : []);
  if (slotList.length === 0) return null;

  const slotCount = slotList.length;
  // Use first slot's type for header styling; mixed selections show a generic "N Slots" header instead
  const primarySlot = slotList[0];
  const isPrime = primarySlot.type === 'prime';
  const category = getSlotCategory(primarySlot.type);

  // Per-slot base price — each slot is priced independently, never borrowed from another slot
  const getSlotBase = (s) => {
    if (useServerPrice) return Number(s.price) || Number(s.pricing?.basePrice) || 0;
    return s.type === 'prime' ? PRICING_CONFIG.primeRate : PRICING_CONFIG.nonPrimeRate;
  };

  // Total base across all slots
  const totalBase = slotList.reduce((acc, s) => acc + getSlotBase(s), 0);

  // Member discount
  let discountAmount = 0;
  let discountLabel = '';

  if (useServerPrice) {
    if (isMember && memberDiscountPercent > 0) {
      discountAmount = totalBase * (memberDiscountPercent / 100);
      discountLabel = `${memberDiscountPercent}% Member Discount`;
    }
  } else if (isMember && PRICING_CONFIG.memberDiscountEnabled) {
    if (PRICING_CONFIG.memberDiscountType === 'percentage') {
      const pct = isPrime ? PRICING_CONFIG.memberDiscountPrime : PRICING_CONFIG.memberDiscountNonPrime;
      discountAmount = totalBase * (pct / 100);
      discountLabel = `${pct}% Member Discount`;
    } else {
      const perSlot = isPrime ? PRICING_CONFIG.memberDiscountPrime : PRICING_CONFIG.memberDiscountNonPrime;
      discountAmount = perSlot * slotCount;
      discountLabel = `OMR ${(discountAmount).toFixed(3)} Member Discount`;
    }
  }

  const finalPrice = totalBase - discountAmount;

  // ── COMPACT (mobile bottom bar) ──
  if (compact) {
    return (
      <Motion.div
        key={`compact-${slotList.map(s => s.id).join('-')}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col"
      >
        <p className="text-[7px] font-black uppercase tracking-[0.2em] mb-0 text-[#CE2029]/40 leading-none">
          {slotCount > 1 ? `${slotCount} Slots` : (isMember ? 'Member Price' : 'Total Amount')}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xl font-black font-display tracking-tight text-[#CE2029] leading-none">
            OMR {finalPrice.toFixed(3)}
          </span>
          {isMember && discountAmount > 0 && (
            <div className="flex flex-col">
               <span className="text-[6px] font-black text-green-500/50 uppercase leading-none">saved</span>
               <span className="text-[8px] font-bold text-green-600 leading-none tracking-tight">{discountAmount.toFixed(3)}</span>
            </div>
          )}
        </div>
      </Motion.div>
    );
  }

  // ── FULL BREAKDOWN CARD ──
  return (
    <Motion.div
      key={slotList.map(s => s.id).join('-')}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-[24px] overflow-hidden bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
    >
      {/* Header stripe */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: slotCount > 1 ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : category.headerBg }}
      >
        <div className="flex items-center gap-2">
          {slotCount > 1
            ? <Star size={13} fill="#f59e0b" className="text-amber-500" />
            : primarySlot.type === 'peak'
              ? <Zap size={13} fill="#dc2626" className="text-red-600" />
              : primarySlot.type === 'prime'
                ? <Star size={13} fill="#f59e0b" className="text-amber-500" />
                : <CalendarDays size={13} className="text-slate-400" />}
          <span className={`text-[9px] font-black uppercase tracking-widest ${slotCount > 1 ? 'text-amber-700' : category.textColor}`}>
            {slotCount > 1 ? `${slotCount} Slots Selected` : category.label}
          </span>
        </div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {slotCount > 1
            ? slotList.map(s => s.time.split(' - ')[0]).join(', ')
            : primarySlot.time}
        </span>
      </div>

      <div className="p-5 space-y-3">
        {/* Row — Base Price (show per-slot breakdown when multiple) */}
        {slotCount > 1 ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Per Slot × {slotCount}
              </span>
              <span className="text-sm font-black text-slate-700">OMR {totalBase.toFixed(3)}</span>
            </div>
            {slotList.map(s => (
              <div key={s.id} className="flex items-center justify-between px-2 py-1 bg-slate-50 rounded-lg">
                <span className="text-[9px] font-bold text-slate-400">{s.time.split(' - ')[0]}</span>
                <span className="text-[10px] font-black text-slate-600">OMR {getSlotBase(s).toFixed(3)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${category.dotColor}`} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Price</span>
            </div>
            <span className="text-sm font-black text-slate-700">OMR {totalBase.toFixed(3)}</span>
          </div>
        )}

        {/* Row — Member Discount */}
        <AnimatePresence>
          {isMember && PRICING_CONFIG.memberDiscountEnabled && discountAmount > 0 && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-2">
                  <Users size={11} className="text-green-600" />
                  <div>
                    <p className="text-[9px] font-black text-green-700 uppercase tracking-widest leading-none">{discountLabel}</p>
                    <p className="text-[7.5px] font-bold text-green-500 mt-0.5 leading-none">Member benefit applied</p>
                  </div>
                </div>
                <span className="text-sm font-black text-green-600">-OMR {discountAmount.toFixed(3)}</span>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Final Price Row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#CE2029] mb-1">
              {slotCount > 1 ? `Total (${slotCount} slots)` : 'Final Price'}
            </p>
            {isMember && discountAmount > 0 && (
              <p className="text-xs font-bold text-slate-300 line-through leading-none">OMR {totalBase.toFixed(3)}</p>
            )}
          </div>
          <Motion.p
            key={finalPrice}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-3xl font-black font-display tracking-tighter ${
              isMember && discountAmount > 0 ? 'text-green-600' : 'text-[#CE2029]'
            }`}
          >
            OMR {finalPrice.toFixed(3)}
          </Motion.p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {isMember && PRICING_CONFIG.memberDiscountEnabled && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 border border-green-100">
              <Users size={9} className="text-green-600" />
              <span className="text-[8px] font-black uppercase tracking-widest text-green-700">Member Discount Applied</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
            <ShieldCheck size={9} className="text-blue-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-600">Secure Checkout</span>
          </div>
        </div>
      </div>
    </Motion.div>
  );
};

export default PriceBreakdownCard;
