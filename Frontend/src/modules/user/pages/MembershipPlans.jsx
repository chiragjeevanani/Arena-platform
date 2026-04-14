import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Star, CheckCircle2, Zap, Crown, Shield,
  Users, ArrowRight, Clock, Calendar, ChevronDown, ChevronUp, Gift, ArrowLeft
} from 'lucide-react';
import { MEMBERSHIP_PLANS, USER_MEMBERSHIP } from '../../../data/mockData';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'premium', label: 'Premium' },
  { id: 'non-premium', label: 'Standard' },
  { id: 'individual', label: 'Individual' },
];

const CAT = {
  premium:      { label: 'Premium',    icon: Crown,   color: '#f59e0b', pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  'non-premium':{ label: 'Standard',   icon: Shield,  color: '#6366f1', pill: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  individual:   { label: 'Individual', icon: Users,   color: '#22c55e', pill: 'bg-green-50 text-green-700 border-green-200' },
};

// ── Plan Details Modal ───────────────────────────────────────────────────────
const PlanDetailsModal = ({ plan, isCurrent, onClose, onBuy }) => {
  const meta = CAT[plan.category] || CAT['non-premium'];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl"
      >
        <div className="absolute top-5 right-5 z-10">
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <ChevronDown size={14} />
          </button>
        </div>

        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-3.5 mb-5 mt-1">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md border border-white" style={{ backgroundColor: `${meta.color}15` }}>
              <Icon size={24} style={{ color: meta.color }} />
            </div>
            <div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border mb-1 ${meta.pill}`}>
                {meta.label} Plan
              </span>
              <h3 className="text-xl font-black text-slate-900 leading-tight">{plan.name}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 px-4 rounded-2xl bg-slate-50 border border-slate-100/50">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.15em] mb-1">Duration</p>
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <Clock size={14} className="text-[#CE2029]" /> {plan.duration}
              </div>
            </div>
            <div className="p-3 px-4 rounded-2xl bg-slate-50 border border-slate-100/50">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.15em] mb-1">Access</p>
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <Calendar size={14} className="text-[#CE2029]" /> {plan.access}
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#CE2029]">Included Benefits</h4>
            <div className="space-y-2">
              {plan.benefits.map((b, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  key={i} className="flex items-start gap-2.5"
                >
                  <div className="mt-1 w-3.5 h-3.5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={10} className="text-emerald-500" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 leading-tight">{b}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 flex items-center justify-between gap-4 shadow-xl shadow-slate-900/20">
            <div className="shrink-0">
              <p className="text-[7px] font-black uppercase text-white/30 tracking-[0.2em] mb-0.5">Investment</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-bold text-white/50">OMR</span>
                <span className="text-2xl font-black text-white tracking-tighter">{plan.price.toFixed(3)}</span>
              </div>
            </div>
            <button
              disabled={isCurrent}
              onClick={() => {
                onClose();
                onBuy(plan);
              }}
              className={`flex-1 min-w-[140px] py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isCurrent 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
                  : 'bg-[#CE2029] text-white hover:bg-[#d83f36] shadow-lg shadow-[#CE2029]/30 active:scale-[0.98]'
              }`}
            >
              {isCurrent ? 'Current Plan' : 'Buy Membership'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Compact Plan Card ────────────────────────────────────────────────────────
const PlanCard = ({ plan, isCurrent, onBuy, onViewDetails }) => {
  const [open, setOpen] = useState(false);
  const meta = CAT[plan.category] || CAT['non-premium'];
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -2 }}
      className={`relative flex flex-col rounded-2xl border-2 overflow-hidden bg-white shadow-sm transition-all ${
        plan.bestValue ? 'border-amber-300 shadow-amber-100' : 'border-slate-100'
      }`}
    >
      {/* Best Value ribbon */}
      {plan.bestValue && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 z-10">
          <span className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-b-lg shadow">
            <Star size={8} fill="white" /> Best Value
          </span>
        </div>
      )}

      {/* Current badge */}
      {isCurrent && (
        <div className="absolute top-2 right-2 z-10">
          <span className="flex items-center gap-1 bg-[#CE2029] text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
            <CheckCircle2 size={8} /> Active
          </span>
        </div>
      )}

      {/* Header */}
      <div className={`px-4 pt-${plan.bestValue ? 6 : 3} pb-3 border-b border-slate-50 cursor-pointer`} onClick={() => onViewDetails(plan)}>
        {/* Category + meta row */}
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${meta.pill}`}>
            <Icon size={9} strokeWidth={3} /> {meta.label}
          </span>
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
            <Clock size={9} /> {plan.duration}
          </div>
        </div>

        <h3 className="text-sm font-black text-slate-900 leading-tight">{plan.name}</h3>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 flex items-center gap-1">
          <Calendar size={9} /> {plan.access}
        </p>

        {/* Price row */}
        <div className="flex items-end justify-between mt-2.5">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] font-bold text-slate-400">OMR</span>
            <span className="text-2xl font-black tracking-tight" style={{ color: meta.color }}>
              {plan.price.toFixed(3)}
            </span>
          </div>
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-green-50 border border-green-100 text-[8px] font-black text-green-600 uppercase">
            <Zap size={8} /> {plan.discountPercent}% off
          </span>
        </div>
      </div>

      {/* Benefits */}
      <div className="px-4 py-2.5 flex-1">
        <div className={`space-y-1.5 overflow-hidden transition-all duration-300 ${!open ? 'max-h-[50px]' : 'max-h-[400px]'}`}>
          {plan.benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="shrink-0 mt-0.5" style={{ color: meta.color }} />
              <span className="text-[10px] font-medium text-slate-600 leading-tight">{b}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-2">
          {plan.benefits.length > 2 && (
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-0.5 text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider shadow-none bg-transparent"
            >
              {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {open ? 'Less' : `+${plan.benefits.length - 2} more`}
            </button>
          )}
          <button 
            onClick={() => onViewDetails(plan)}
            className="text-[9px] font-black text-[#CE2029] uppercase tracking-widest hover:underline bg-transparent"
          >
            Full Details
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={isCurrent}
          onClick={() => onBuy(plan)}
          className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
            isCurrent
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : plan.bestValue
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md shadow-amber-100 hover:brightness-105'
                : 'bg-[#CE2029] text-white hover:bg-[#d83f36] shadow-sm'
          }`}
        >
          {isCurrent ? 'Current Plan' : 'Buy Now'}
          {!isCurrent && <ArrowRight size={11} strokeWidth={3} />}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ plan, onClose, onConfirm }) => {
  const meta = CAT[plan.category] || CAT['non-premium'];
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, #CE2029, ${meta.color})` }} />
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${meta.color}15` }}>
              <Gift size={18} style={{ color: meta.color }} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{plan.name}</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{plan.duration} · {plan.access}</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500">Subscription Fee</span>
              <span className="text-sm font-black text-slate-900">OMR {plan.price.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500">Slot Discount</span>
              <span className="text-sm font-black text-green-600">-{plan.discountPercent}% per booking</span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-[#CE2029] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-[#d83f36]">
              Confirm <ArrowRight size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Cancel Modal ─────────────────────────────────────────────────────────────
const CancelModal = ({ plan, onClose, onConfirm }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <Shield size={24} className="text-red-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">Cancel Membership?</h3>
            <p className="text-xs font-medium text-slate-500 leading-relaxed px-4">
              By cancelling, you'll lose your <span className="font-bold text-red-500">{plan.discountPercent}% discount</span> on all future bookings after this period ends.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 pt-2">
            <button
              onClick={onConfirm}
              className="w-full py-3 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
            >
              Yes, Cancel Membership
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
            >
              No, Keep My Benefits
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
const MembershipPlans = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [buying, setBuying] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [viewingPlan, setViewingPlan] = useState(null);
  const tabsRef = useRef(null);

  useEffect(() => {
    const activeBtn = tabsRef.current?.querySelector('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [filter]);
  const [userMembership, setUserMembership] = useState(() => {
    const saved = localStorage.getItem('userMembership');
    return saved ? JSON.parse(saved) : USER_MEMBERSHIP;
  });

  const plans = filter === 'all'
    ? MEMBERSHIP_PLANS
    : MEMBERSHIP_PLANS.filter(p => p.category === filter);

  const isActive = userMembership.status === 'active';

  const handleConfirm = () => {
    if (!buying) return;
    
    // Navigate to payment page with plan details
    navigate('/payment', {
      state: {
        amount: buying.price,
        plan: buying,
        type: 'membership'
      }
    });
    setBuying(null);
  };

  const handleCancel = () => {
    const inactiveMembership = { ...userMembership, status: 'none', planId: null };
    localStorage.setItem('userMembership', JSON.stringify(inactiveMembership));
    setUserMembership(inactiveMembership);
    setCancelling(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">

      {/* Compact Hero */}
      <div className="bg-[#CE2029] px-4 pt-5 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[size:18px_18px]" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <ArrowLeft size={15} />
            </button>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none">Membership Plans</h1>
              <p className="text-white/60 text-[10px] font-bold mt-0.5">Save on every booking</p>
            </div>
          </div>

          {/* Active plan pill */}
          {isActive && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Crown size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white uppercase tracking-widest leading-none">
                      {userMembership.planName}
                    </span>
                    <div className="px-1.5 py-0.5 rounded-md bg-green-400 text-[7px] font-black text-white uppercase tracking-widest animate-pulse">
                      Active
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-1">
                    Valid until {userMembership.expiryDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCancelling(userMembership)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest transition-all"
              >
                Cancel Plan
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-7 relative z-10 space-y-4">

        {/* Modern Segmented Control Filter - More Compact & Auto-scroll */}
        <div 
          className="py-2 overflow-x-auto no-scrollbar flex justify-start sm:justify-start px-12"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <div 
            ref={tabsRef}
            className="bg-slate-100 p-0.5 rounded-xl flex gap-0.5 w-fit"
          >
            {FILTERS.map(f => (
              <button
                key={f.id}
                data-active={filter === f.id}
                onClick={() => setFilter(f.id)}
                className="relative px-3.5 py-1.5 transition-all outline-none scroll-mx-10"
                style={{ scrollSnapAlign: 'center' }}
              >
                {filter === f.id && (
                  <motion.div
                    layoutId="activeFilterPill"
                    className="absolute inset-x-0 inset-y-0 bg-white rounded-lg shadow-sm border border-white/50"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className={`relative z-10 text-[9px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition-colors duration-300 ${
                  filter === f.id ? 'text-[#CE2029]' : 'text-[#36454F]'
                }`}>
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Plan stats summary row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Plans Available', value: MEMBERSHIP_PLANS.length },
            { label: 'Max Discount', value: `${Math.max(...MEMBERSHIP_PLANS.map(p => p.discountPercent))}%` },
            { label: 'From', value: `OMR ${Math.min(...MEMBERSHIP_PLANS.map(p => p.price)).toFixed(3)}` },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-2.5 text-center">
              <p className="text-base font-black text-[#CE2029]">{s.value}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Plans Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={isActive && userMembership.planId === plan.id}
                onBuy={setBuying}
                onViewDetails={setViewingPlan}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-[9px] text-slate-400 font-medium pb-4">
          All prices in OMR · No hidden charges · Cancel anytime
        </p>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {viewingPlan && (
          <PlanDetailsModal 
            plan={viewingPlan} 
            isCurrent={isActive && userMembership.planId === viewingPlan.id}
            onClose={() => setViewingPlan(null)} 
            onBuy={setBuying} 
          />
        )}
        {buying && (
          <ConfirmModal plan={buying} onClose={() => setBuying(null)} onConfirm={handleConfirm} />
        )}
        {cancelling && (
          <CancelModal plan={cancelling} onClose={() => setCancelling(null)} onConfirm={handleCancel} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MembershipPlans;
