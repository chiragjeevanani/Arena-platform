import { useState } from 'react';
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

// ── Compact Plan Card ────────────────────────────────────────────────────────
const PlanCard = ({ plan, isCurrent, onBuy }) => {
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
          <span className="flex items-center gap-1 bg-[#eb483f] text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
            <CheckCircle2 size={8} /> Active
          </span>
        </div>
      )}

      {/* Header */}
      <div className={`px-4 pt-${plan.bestValue ? 6 : 3} pb-3 border-b border-slate-50`}>
        {/* Category + meta row */}
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${meta.pill}`}>
            <Icon size={9} /> {meta.label}
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
        <div className={`space-y-1.5 overflow-hidden transition-all ${!open ? 'max-h-[54px]' : ''}`}>
          {plan.benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="shrink-0 mt-0.5" style={{ color: meta.color }} />
              <span className="text-[10px] font-medium text-slate-600 leading-tight">{b}</span>
            </div>
          ))}
        </div>
        {plan.benefits.length > 2 && (
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-0.5 mt-1.5 text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider"
          >
            {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {open ? 'Less' : `+${plan.benefits.length - 2} more`}
          </button>
        )}
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
                : 'bg-[#eb483f] text-white hover:bg-[#d83f36] shadow-sm'
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
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, #eb483f, ${meta.color})` }} />
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
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-[#eb483f] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-[#d83f36]">
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
      <div className="bg-[#eb483f] px-4 pt-5 pb-8 relative overflow-hidden">
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

      <div className="max-w-5xl mx-auto px-4 -mt-4 relative z-10 space-y-4">

        {/* Filter tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 inline-flex gap-1 overflow-x-auto max-w-full no-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                filter === f.id
                  ? 'bg-[#eb483f] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Plan stats summary row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Plans Available', value: MEMBERSHIP_PLANS.length },
            { label: 'Max Discount', value: `${Math.max(...MEMBERSHIP_PLANS.map(p => p.discountPercent))}%` },
            { label: 'From', value: `OMR ${Math.min(...MEMBERSHIP_PLANS.map(p => p.price)).toFixed(3)}` },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-2.5 text-center">
              <p className="text-base font-black text-[#eb483f]">{s.value}</p>
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
