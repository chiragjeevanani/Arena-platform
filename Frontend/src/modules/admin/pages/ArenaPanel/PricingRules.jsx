import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Zap, Calendar, Clock, ToggleLeft, ToggleRight, 
  ArrowRight, TrendingUp, Tag, Activity, Star, Users, 
  CalendarDays, Plus, X, Trash2, ShieldCheck
} from 'lucide-react';

const initialPricing = {
  // Existing - Peak Hour (time-based, keep separate)
  basePrice: 4.000,
  weekendEnabled: true,
  weekendPrice: 5.500,
  peakEnabled: true,
  peakPrice: 6.500,
  peakStart: '17:00',
  peakEnd: '20:00',

  // NEW - Slot Type Base Rates
  primeRate: 5.000,
  nonPrimeRate: 3.000,

  // NEW - Member Discounts
  memberDiscountEnabled: true,
  memberDiscountType: 'percentage',  // 'percentage' | 'flat'
  memberDiscountPrime: 10,           // % or OMR flat for Prime
  memberDiscountNonPrime: 15,        // % or OMR flat for Non-Prime
};

const initialOverrides = [
  { id: 'o1', name: 'Eid Holiday', startDate: '2025-04-05', endDate: '2025-04-07', primeRate: 7.500, nonPrimeRate: 5.000 },
];

const PricingRules = () => {
  const [pricing, setPricing] = useState(initialPricing);
  const [overrides, setOverrides] = useState(initialOverrides);
  const [saved, setSaved] = useState(false);
  const [previewSlot, setPreviewSlot] = useState({ time: '18:00', day: 'weekday', slotType: 'prime', isMember: false });
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideForm, setOverrideForm] = useState({ name: '', startDate: '', endDate: '', primeRate: '', nonPrimeRate: '' });
  const [activeSection, setActiveSection] = useState('slotTypes');

  const getPreviewPrice = () => {
    const hour = parseInt(previewSlot.time.split(':')[0]);
    const isWeekend = previewSlot.day === 'weekend';
    const isPeak = pricing.peakEnabled && hour >= parseInt(pricing.peakStart) && hour < parseInt(pricing.peakEnd);
    const isPrime = previewSlot.slotType === 'prime';

    let baseRate = isPrime ? pricing.primeRate : pricing.nonPrimeRate;
    let label = isPrime ? 'Prime Slot Rate' : 'Non-Prime Slot Rate';
    let color = isPrime ? '#f59e0b' : '#6366f1';

    if (isWeekend && pricing.weekendEnabled) {
      baseRate += (pricing.weekendPrice - pricing.basePrice);
      label += ' + Weekend';
    }
    if (isPeak) {
      baseRate += (pricing.peakPrice - pricing.basePrice);
      label += ' + Peak';
      color = '#CE2029';
    }

    let finalRate = baseRate;
    if (previewSlot.isMember && pricing.memberDiscountEnabled) {
      const discountPct = isPrime ? pricing.memberDiscountPrime : pricing.memberDiscountNonPrime;
      finalRate = baseRate * (1 - discountPct / 100);
      label += ` (${discountPct}% Member Disc.)`;
    }

    return { price: finalRate, originalPrice: baseRate, label, color };
  };

  const preview = getPreviewPrice();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggle = (key) => setPricing(p => ({ ...p, [key]: !p[key] }));

  const addOverride = () => {
    if (!overrideForm.name || !overrideForm.startDate) return;
    setOverrides(prev => [...prev, { id: `o${Date.now()}`, ...overrideForm, primeRate: Number(overrideForm.primeRate), nonPrimeRate: Number(overrideForm.nonPrimeRate) }]);
    setOverrideForm({ name: '', startDate: '', endDate: '', primeRate: '', nonPrimeRate: '' });
    setShowOverrideModal(false);
  };

  const removeOverride = (id) => setOverrides(prev => prev.filter(o => o.id !== id));

  const inputCls = "w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[12px] font-bold outline-none focus:border-[#CE2029] focus:bg-white transition-all text-[#36454F]";

  const ToggleSwitch = ({ checked, onToggle }) => (
    <button onClick={onToggle} className="transition-all shrink-0">
      {checked ? <ToggleRight size={26} className="text-[#CE2029]" /> : <ToggleLeft size={26} className="text-slate-300" />}
    </button>
  );

  const SECTIONS = [
    { id: 'slotTypes', label: 'Slot Type Rates', icon: Star },
    { id: 'peak', label: 'Peak Hour', icon: Zap },
    { id: 'members', label: 'Member Discounts', icon: Users },
    { id: 'holidays', label: 'Holiday Overrides', icon: CalendarDays },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 md:gap-5">
      {/* Left Config Panel */}
      <div className="xl:col-span-3 space-y-4">

        {/* Section Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                  activeSection === s.id 
                    ? 'border-[#CE2029] text-[#CE2029] bg-red-50/30' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}>
                <s.icon size={12} />
                {s.label}
              </button>
            ))}
          </div>

          <div className="p-4 md:p-5">

            {/* ── SECTION: Slot Type Base Rates ── */}
            {activeSection === 'slotTypes' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="text-amber-500" fill="#f59e0b" />
                  <h3 className="font-bold text-sm text-[#36454F] uppercase tracking-widest">Slot Type Base Rates</h3>
                </div>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider -mt-2 mb-4">
                  These are the base rates per slot category. Applied to all slots based on their Prime / Non-Prime classification.
                </p>

                {/* Prime Rate */}
                <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                      <Star size={15} className="text-amber-600" fill="#d97706" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#36454F] text-xs uppercase tracking-widest leading-none">Prime Slot Rate</h4>
                      <p className="text-[9px] text-slate-600 font-bold mt-1 leading-none">High-demand hours (e.g., evenings)</p>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs uppercase">OMR</span>
                    <input type="number" step="0.001" value={pricing.primeRate}
                      onChange={e => setPricing(p => ({ ...p, primeRate: Number(e.target.value) }))}
                      className={`${inputCls} pl-12 text-lg font-black`} />
                  </div>
                </div>

                {/* Non-Prime Rate */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <CalendarDays size={15} className="text-slate-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#36454F] text-xs uppercase tracking-widest leading-none">Non-Prime Slot Rate</h4>
                      <p className="text-[9px] text-slate-600 font-bold mt-1 leading-none">Standard hours (e.g., early morning)</p>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs uppercase">OMR</span>
                    <input type="number" step="0.001" value={pricing.nonPrimeRate}
                      onChange={e => setPricing(p => ({ ...p, nonPrimeRate: Number(e.target.value) }))}
                      className={`${inputCls} pl-12 text-lg font-black`} />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <ShieldCheck size={12} className="text-blue-500 shrink-0" />
                  <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">
                    These rates apply independently. Peak Hour surcharge (if enabled) stacks on top.
                  </p>
                </div>
              </div>
            )}

            {/* ── SECTION: Peak Hour (existing, kept separate) ── */}
            {activeSection === 'peak' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-[#CE2029]" />
                  <h3 className="font-bold text-sm text-[#36454F] uppercase tracking-widest">Peak Hour Surcharge</h3>
                </div>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider -mt-2 mb-4">
                  An additional time-based surcharge added on top of the Slot Type rate during busy hours.
                </p>

                {/* Base fallback rate */}
                <div className="space-y-2">
                  <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-600">Off-Peak Baseline</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">OMR</span>
                    <input type="number" step="0.001" value={pricing.basePrice}
                      onChange={e => setPricing(p => ({ ...p, basePrice: Number(e.target.value) }))}
                      className={`${inputCls} pl-12 text-lg font-black`} />
                  </div>
                </div>

                {/* Peak toggle */}
                <div className={`p-4 rounded-xl border transition-all ${pricing.peakEnabled ? 'border-red-100 bg-red-50/20' : 'border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-[#36454F] text-xs uppercase tracking-widest">Peak Hour Enabled</h4>
                      <p className="text-[9px] text-slate-600 mt-1">Apply surcharge between set hours</p>
                    </div>
                    <ToggleSwitch checked={pricing.peakEnabled} onToggle={() => toggle('peakEnabled')} />
                  </div>
                  <AnimatePresence>
                    {pricing.peakEnabled && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-3">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">OMR</span>
                          <input type="number" step="0.001" value={pricing.peakPrice}
                            onChange={e => setPricing(p => ({ ...p, peakPrice: Number(e.target.value) }))}
                            className={`${inputCls} pl-12 text-lg font-black`} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-600">Peak Start</label>
                            <input type="time" value={pricing.peakStart}
                              onChange={e => setPricing(p => ({ ...p, peakStart: e.target.value }))}
                              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[12px] font-bold outline-none focus:bg-white uppercase" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-600">Peak End</label>
                            <input type="time" value={pricing.peakEnd}
                              onChange={e => setPricing(p => ({ ...p, peakEnd: e.target.value }))}
                              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[12px] font-bold outline-none focus:bg-white uppercase" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                          <Clock size={12} className="text-[#CE2029]" />
                          <span className="text-[9px] font-black text-[#CE2029] uppercase tracking-widest">
                            Surcharge active: {pricing.peakStart} — {pricing.peakEnd}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Weekend toggle */}
                <div className={`p-4 rounded-xl border transition-all ${pricing.weekendEnabled ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#36454F] text-xs uppercase tracking-widest">Weekend Rate</h4>
                      <p className="text-[9px] text-slate-600 mt-1">Sat & Sun surcharge</p>
                    </div>
                    <ToggleSwitch checked={pricing.weekendEnabled} onToggle={() => toggle('weekendEnabled')} />
                  </div>
                  <AnimatePresence>
                    {pricing.weekendEnabled && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-3">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">OMR</span>
                          <input type="number" step="0.001" value={pricing.weekendPrice}
                            onChange={e => setPricing(p => ({ ...p, weekendPrice: Number(e.target.value) }))}
                            className={`${inputCls} pl-12 text-lg font-black`} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ── SECTION: Member Discounts ── */}
            {activeSection === 'members' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-indigo-500" />
                    <h3 className="font-bold text-sm text-[#36454F] uppercase tracking-widest">Member Discounts</h3>
                  </div>
                  <ToggleSwitch checked={pricing.memberDiscountEnabled} onToggle={() => toggle('memberDiscountEnabled')} />
                </div>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-4">
                  Members with an active subscription get a % discount on bookings. Configurable per slot type.
                </p>

                <AnimatePresence>
                  {pricing.memberDiscountEnabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                      {/* Discount Type Toggle */}
                      <div className="space-y-2">
                        <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-600">Discount Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { v: 'percentage', l: 'Percentage (%)', icon: '%' },
                            { v: 'flat', l: 'Flat Amount (OMR)', icon: '₋' },
                          ].map(t => (
                            <button key={t.v}
                              onClick={() => setPricing(p => ({ ...p, memberDiscountType: t.v }))}
                              className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-1.5 ${
                                pricing.memberDiscountType === t.v
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                              }`}>
                              <span className="font-black text-sm leading-none">{t.icon}</span>
                              {t.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Prime Discount */}
                      <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 space-y-3">
                        <div className="flex items-center gap-2">
                          <Star size={12} className="text-amber-500" fill="#f59e0b" />
                          <h4 className="font-bold text-xs text-[#36454F] uppercase tracking-widest">Prime Slot Discount</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <input type="number" min={0} max={pricing.memberDiscountType === 'percentage' ? 100 : 99} step={pricing.memberDiscountType === 'percentage' ? 1 : 0.001} value={pricing.memberDiscountPrime}
                            onChange={e => setPricing(p => ({ ...p, memberDiscountPrime: Number(e.target.value) }))}
                            className="w-24 h-12 text-center text-2xl font-black rounded-xl border border-amber-200 bg-white outline-none focus:border-amber-400" />
                          <div>
                            <p className="text-2xl font-black text-amber-500">{pricing.memberDiscountType === 'percentage' ? '%' : 'OMR'}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Discount for members</p>
                          </div>
                          <div className="ml-auto p-3 bg-white rounded-xl border border-amber-100 text-right">
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Member pays</p>
                            <p className="text-lg font-black text-amber-600">
                              OMR {
                                pricing.memberDiscountType === 'percentage'
                                  ? (pricing.primeRate * (1 - pricing.memberDiscountPrime / 100)).toFixed(3)
                                  : Math.max(0, pricing.primeRate - pricing.memberDiscountPrime).toFixed(3)
                              }
                            </p>
                          </div>
                        </div>
                        {/* Helper preview text */}
                        <div className="flex items-center gap-2 p-2.5 bg-amber-100/60 border border-amber-200/60 rounded-xl">
                          <Tag size={10} className="text-amber-600 shrink-0" />
                          <p className="text-[8.5px] font-bold text-amber-700">
                            Members will get{' '}
                            <span className="font-black">
                              {pricing.memberDiscountType === 'percentage'
                                ? `${pricing.memberDiscountPrime}% off`
                                : `OMR ${Number(pricing.memberDiscountPrime).toFixed(3)} off`
                              }
                            </span>
                            {' '}during Prime Time
                          </p>
                        </div>
                      </div>

                      {/* Non-Prime Discount */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={12} className="text-slate-500" />
                          <h4 className="font-bold text-xs text-[#36454F] uppercase tracking-widest">Non-Prime Slot Discount</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <input type="number" min={0} max={pricing.memberDiscountType === 'percentage' ? 100 : 99} step={pricing.memberDiscountType === 'percentage' ? 1 : 0.001} value={pricing.memberDiscountNonPrime}
                            onChange={e => setPricing(p => ({ ...p, memberDiscountNonPrime: Number(e.target.value) }))}
                            className="w-24 h-12 text-center text-2xl font-black rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-400" />
                          <div>
                            <p className="text-2xl font-black text-slate-500">{pricing.memberDiscountType === 'percentage' ? '%' : 'OMR'}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Discount for members</p>
                          </div>
                          <div className="ml-auto p-3 bg-white rounded-xl border border-slate-100 text-right">
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Member pays</p>
                            <p className="text-lg font-black text-slate-700">
                              OMR {
                                pricing.memberDiscountType === 'percentage'
                                  ? (pricing.nonPrimeRate * (1 - pricing.memberDiscountNonPrime / 100)).toFixed(3)
                                  : Math.max(0, pricing.nonPrimeRate - pricing.memberDiscountNonPrime).toFixed(3)
                              }
                            </p>
                          </div>
                        </div>
                        {/* Helper preview text */}
                        <div className="flex items-center gap-2 p-2.5 bg-slate-100/80 border border-slate-200/80 rounded-xl">
                          <Tag size={10} className="text-slate-500 shrink-0" />
                          <p className="text-[8.5px] font-bold text-slate-600">
                            Members will get{' '}
                            <span className="font-black">
                              {pricing.memberDiscountType === 'percentage'
                                ? `${pricing.memberDiscountNonPrime}% off`
                                : `OMR ${Number(pricing.memberDiscountNonPrime).toFixed(3)} off`
                              }
                            </span>
                            {' '}during Standard Time
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!pricing.memberDiscountEnabled && (
                  <div className="text-center py-8 text-slate-400">
                    <Users size={24} className="mx-auto mb-2 opacity-40" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Member discounts are currently disabled</p>
                  </div>
                )}
              </div>
            )}

            {/* ── SECTION: Holiday/Event Rate Overrides ── */}
            {activeSection === 'holidays' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-purple-500" />
                    <h3 className="font-bold text-sm text-[#36454F] uppercase tracking-widest">Holiday Rate Overrides</h3>
                  </div>
                  <button onClick={() => setShowOverrideModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#36454F] text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                    <Plus size={12} strokeWidth={3} /> New Override
                  </button>
                </div>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-4">
                  Schedule custom Prime/Non-Prime rates for specific dates (Eid, National Day, etc.). These override all standard rates for those dates.
                </p>

                {overrides.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                    <CalendarDays size={24} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">No overrides scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {overrides.map(ov => (
                      <div key={ov.id} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-100 rounded-xl">
                        <div>
                          <div className="flex items-center gap-2">
                            <CalendarDays size={11} className="text-purple-500" />
                            <p className="text-[10px] font-black text-[#36454F] uppercase tracking-wider">{ov.name}</p>
                          </div>
                          <p className="text-[8.5px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                            {ov.startDate} → {ov.endDate || ov.startDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-[8px] text-amber-600 font-black uppercase">Prime: OMR {Number(ov.primeRate).toFixed(3)}</p>
                            <p className="text-[8px] text-slate-500 font-black uppercase">Non-Prime: OMR {Number(ov.nonPrimeRate).toFixed(3)}</p>
                          </div>
                          <button onClick={() => removeOverride(ov.id)} className="w-6 h-6 rounded-lg bg-white border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave}
           className={`w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-sm ${
            saved ? 'bg-green-500 text-white' : 'bg-[#36454F] text-white hover:shadow-lg active:translate-y-0.5'
          }`}>
          {saved ? '✓ Pricing Rules Saved' : <>Save All Pricing Rules <ArrowRight size={14} strokeWidth={3} /></>}
        </motion.button>
      </div>

      {/* Right: Live Preview Panel */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 sticky top-4 space-y-5">
           <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#36454F] flex items-center gap-2 leading-none">
                <Activity size={14} className="text-[#CE2029]" /> Live Rate Preview
              </h3>
           </div>

          <div className="space-y-3">
            {/* Slot Type */}
            <div className="space-y-1.5">
              <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-600">Slot Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[{v:'prime',l:'Prime'},{v:'nonPrime',l:'Non-Prime'}].map(t => (
                  <button key={t.v} onClick={() => setPreviewSlot(p => ({ ...p, slotType: t.v }))}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      previewSlot.slotType === t.v ? 'bg-[#36454F] border-[#36454F] text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-400'
                    }`}>{t.l}</button>
                ))}
              </div>
            </div>

            {/* Day */}
            <div className="space-y-1.5">
              <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-600">Day Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['weekday','weekend'].map(d => (
                  <button key={d} onClick={() => setPreviewSlot(p => ({ ...p, day: d }))}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      previewSlot.day === d ? 'bg-[#CE2029] border-[#CE2029] text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-400'
                    }`}>{d}</button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div className="space-y-1.5">
              <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-600">Time of Booking</label>
              <input type="time" value={previewSlot.time}
                onChange={e => setPreviewSlot(p => ({ ...p, time: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[12px] font-bold outline-none focus:bg-white uppercase" />
            </div>

            {/* Member Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-100 bg-indigo-50/40">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-indigo-600" />
                <div>
                  <p className="text-[10px] font-black text-[#36454F] uppercase tracking-widest leading-none">Member Booking</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1 leading-none">Apply member discount</p>
                </div>
              </div>
              <button onClick={() => setPreviewSlot(p => ({ ...p, isMember: !p.isMember }))}>
                {previewSlot.isMember 
                  ? <ToggleRight size={26} className="text-indigo-600" />
                  : <ToggleLeft size={26} className="text-slate-300" />}
              </button>
            </div>
          </div>

          {/* Result */}
          <motion.div key={`${previewSlot.time}-${previewSlot.day}-${previewSlot.slotType}-${previewSlot.isMember}`}
            initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl p-5 text-center border"
            style={{ backgroundColor: `${preview.color}08`, borderColor: `${preview.color}25` }}>
            <p className="text-[8.5px] font-black uppercase tracking-widest mb-2 opacity-70" style={{ color: preview.color }}>{preview.label}</p>
            {previewSlot.isMember && preview.originalPrice !== preview.price && (
              <p className="text-sm font-bold text-slate-400 line-through mb-1">OMR {preview.originalPrice.toFixed(3)}</p>
            )}
            <p className="text-4xl font-black tracking-tighter" style={{ color: preview.color }}>
              {preview.price.toFixed(3)}
            </p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-2">OMR per hour</p>
          </motion.div>

          {/* Rate Summary Table */}
          <div className="space-y-2">
            <p className="text-[8.5px] font-black uppercase tracking-widest text-slate-600">Rate Index</p>
            {[
              { label: '★ Prime Rate', value: pricing.primeRate, color: '#f59e0b' },
              { label: '◆ Non-Prime Rate', value: pricing.nonPrimeRate, color: '#6366f1' },
              { label: '⚡ Peak Surcharge', value: pricing.peakPrice, color: '#CE2029', active: pricing.peakEnabled },
              { label: '👥 Member Disc. (Prime)', value: `-${pricing.memberDiscountPrime}%`, color: '#22c55e', isText: true, active: pricing.memberDiscountEnabled },
            ].map((r, i) => (
              <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-xl border text-[11px] font-bold transition-all ${
                r.active === false ? 'opacity-40 bg-slate-50 border-slate-100' : 'bg-white border-slate-100 shadow-sm'
              }`}>
                <span className="text-slate-600">{r.label}</span>
                <span className="font-black" style={{ color: r.color }}>
                  {r.isText ? r.value : `OMR ${Number(r.value).toFixed(3)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holiday Override Modal */}
      <AnimatePresence>
        {showOverrideModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowOverrideModal(false)} className="absolute inset-0 bg-[#36454F]/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#36454F] uppercase tracking-widest">New Date Override</h3>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Schedule special rates for a date range</p>
                </div>
                <button onClick={() => setShowOverrideModal(false)}><X size={18} className="text-slate-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-600">Event / Holiday Name</label>
                  <input type="text" placeholder="e.g. Eid Al Adha 2025" value={overrideForm.name}
                    onChange={e => setOverrideForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[12px] font-bold outline-none focus:bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-600">Start Date</label>
                    <input type="date" value={overrideForm.startDate}
                      onChange={e => setOverrideForm(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold outline-none focus:bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-600">End Date</label>
                    <input type="date" value={overrideForm.endDate}
                      onChange={e => setOverrideForm(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold outline-none focus:bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[8.5px] font-black uppercase tracking-widest text-amber-600">★ Prime Rate (OMR)</label>
                    <input type="number" step="0.001" placeholder="7.500" value={overrideForm.primeRate}
                      onChange={e => setOverrideForm(p => ({ ...p, primeRate: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border border-amber-200 bg-amber-50/30 text-[13px] font-black outline-none focus:bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-500">◆ Non-Prime (OMR)</label>
                    <input type="number" step="0.001" placeholder="5.000" value={overrideForm.nonPrimeRate}
                      onChange={e => setOverrideForm(p => ({ ...p, nonPrimeRate: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-black outline-none focus:bg-white" />
                  </div>
                </div>
                <button onClick={addOverride}
                  className="w-full h-12 rounded-xl bg-[#36454F] text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md">
                  Schedule Override <Plus size={14} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PricingRules;
