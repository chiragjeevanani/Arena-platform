import { motion, AnimatePresence } from 'framer-motion';
import { Star, CalendarDays, Users, ShieldCheck, Tag, ArrowRight, Zap } from 'lucide-react';

/**
 * PRICING CONFIG — in production, pull from API / context
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

/**
 * PriceBreakdownCard
 *
 * Props:
 *   slot         — slot object from SLOTS array (with .type, .price)
 *   isMember     — boolean, toggles member discount
 *   adminOverride — number | null, if set uses this as final price
 *   compact      — boolean, shows compact version for mobile footer
 */
const PriceBreakdownCard = ({ slot, isMember = false, adminOverride = null, compact = false }) => {
  if (!slot) return null;

  const isPrime = slot.type === 'prime';
  const baseRate = isPrime ? PRICING_CONFIG.primeRate : PRICING_CONFIG.nonPrimeRate;

  // Calculate member discount
  let discountAmount = 0;
  let discountLabel = '';
  if (isMember && PRICING_CONFIG.memberDiscountEnabled) {
    if (PRICING_CONFIG.memberDiscountType === 'percentage') {
      const pct = isPrime ? PRICING_CONFIG.memberDiscountPrime : PRICING_CONFIG.memberDiscountNonPrime;
      discountAmount = baseRate * (pct / 100);
      discountLabel = `${pct}% Member Discount`;
    } else {
      discountAmount = isPrime ? PRICING_CONFIG.memberDiscountPrime : PRICING_CONFIG.memberDiscountNonPrime;
      discountLabel = `OMR ${discountAmount.toFixed(3)} Member Discount`;
    }
  }

  const afterDiscount = baseRate - discountAmount;
  const finalPrice = adminOverride !== null ? adminOverride : afterDiscount;
  const isOverridden = adminOverride !== null;

  // ── COMPACT (mobile bottom bar) ──
  if (compact) {
    return (
      <motion.div
        key={`${slot?.id}-${isMember}-${adminOverride}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col"
      >
        <p className="text-[7px] font-black uppercase tracking-[0.2em] mb-0 text-[#CE2029]/40 leading-none">
          {isOverridden ? 'Override Price' : isMember ? 'Member Price' : 'Total Amount'}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xl font-black font-display tracking-tight text-[#CE2029] leading-none">
            OMR {finalPrice.toFixed(3)}
          </span>
          {isMember && !isOverridden && discountAmount > 0 && (
            <div className="flex flex-col">
               <span className="text-[6px] font-black text-green-500/50 uppercase leading-none">saved</span>
               <span className="text-[8px] font-bold text-green-600 leading-none tracking-tight">{discountAmount.toFixed(3)}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // ── FULL BREAKDOWN CARD ──
  return (
    <motion.div
      key={`${slot?.id}-${isMember}-${adminOverride}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-[24px] overflow-hidden bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
    >
      {/* Header stripe */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: isPrime ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : 'linear-gradient(135deg,#f8fafc,#f1f5f9)' }}
      >
        <div className="flex items-center gap-2">
          {isPrime
            ? <Star size={13} fill="#f59e0b" className="text-amber-500" />
            : <CalendarDays size={13} className="text-slate-400" />}
          <span className={`text-[9px] font-black uppercase tracking-widest ${isPrime ? 'text-amber-700' : 'text-slate-500'}`}>
            {isPrime ? 'Prime Slot' : 'Standard Slot'}
          </span>
        </div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {slot.time}
        </span>
      </div>

      <div className="p-5 space-y-3">
        {/* Row — Base Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isPrime ? 'bg-amber-400' : 'bg-slate-400'}`} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Price</span>
          </div>
          <span className="text-sm font-black text-slate-700">OMR {baseRate.toFixed(3)}</span>
        </div>

        {/* Row — Member Discount */}
        <AnimatePresence>
          {isMember && PRICING_CONFIG.memberDiscountEnabled && discountAmount > 0 && (
            <motion.div
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row — Admin Override */}
        <AnimatePresence>
          {isOverridden && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-2">
                  <Tag size={11} className="text-orange-500" />
                  <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Custom Price Set</p>
                </div>
                <span className="text-[9px] font-black text-orange-500">Admin Override</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Final Price Row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#CE2029] mb-1">Final Price</p>
            {isMember && !isOverridden && discountAmount > 0 && (
              <p className="text-xs font-bold text-slate-300 line-through leading-none">OMR {baseRate.toFixed(3)}</p>
            )}
          </div>
          <motion.p
            key={finalPrice}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-3xl font-black font-display tracking-tighter ${
              isOverridden ? 'text-orange-500' : isMember && discountAmount > 0 ? 'text-green-600' : 'text-[#CE2029]'
            }`}
          >
            OMR {finalPrice.toFixed(3)}
          </motion.p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {isMember && PRICING_CONFIG.memberDiscountEnabled && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 border border-green-100">
              <Users size={9} className="text-green-600" />
              <span className="text-[8px] font-black uppercase tracking-widest text-green-700">Member Discount Applied</span>
            </div>
          )}
          {isOverridden && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100">
              <Zap size={9} className="text-orange-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-orange-600">Admin Override Active</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
            <ShieldCheck size={9} className="text-blue-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-600">Secure Checkout</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PriceBreakdownCard;
