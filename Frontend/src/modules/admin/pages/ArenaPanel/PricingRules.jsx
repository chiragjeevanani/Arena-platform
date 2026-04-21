import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Zap, Calendar, Clock, ToggleLeft, ToggleRight, 
  ArrowRight, TrendingUp, Tag, Activity, Star, Users, 
  CalendarDays, Plus, X, Trash2, ShieldCheck, Loader2
} from 'lucide-react';
import { useArenaPanel } from '../../context/ArenaPanelContext';
import { patchMyArena } from '../../../../services/arenaStaffApi';
import { showToast } from '../../../../utils/toast';

const PricingRules = () => {
  const { arena, loading, refetch } = useArenaPanel();
  const [pricing, setPricing] = useState(null);
  const [overrides, setOverrides] = useState([]);
  const [saving, setSaving] = useState(false);
  const [previewSlot, setPreviewSlot] = useState({ time: '18:00', day: 'weekday', slotType: 'prime', isMember: false });
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideForm, setOverrideForm] = useState({ id: '', name: '', startDate: '', endDate: '', primeRate: '', nonPrimeRate: '' });
  const [activeSection, setActiveSection] = useState('slotTypes');

  useEffect(() => {
    if (arena?.priceConfig) {
      setPricing({
        basePrice: arena.pricePerHour || 0,
        ...arena.priceConfig
      });
      setOverrides(arena.priceConfig.holidayOverrides || []);
    } else if (arena) {
      setPricing({
        basePrice: arena.pricePerHour || 0,
        primeRate: 0,
        nonPrimeRate: 0,
        peakEnabled: false,
        peakStart: '17:00',
        peakEnd: '20:00',
        peakPrice: 0,
        weekendEnabled: false,
        weekendPrice: 0,
        memberDiscountEnabled: false,
        memberDiscountType: 'percentage',
        memberDiscountPrime: 0,
        memberDiscountNonPrime: 0,
      });
    }
  }, [arena]);

  const getPreviewPrice = () => {
    if (!pricing) return { price: 0, originalPrice: 0, label: 'Loading...', color: '#ccc' };

    const hour = parseInt(previewSlot.time.split(':')[0]);
    const isWeekend = previewSlot.day === 'weekend';
    const isPeak = pricing.peakEnabled && hour >= parseInt(pricing.peakStart) && hour < parseInt(pricing.peakEnd);
    const isPrime = previewSlot.slotType === 'prime';

    let baseRate = (isPrime ? pricing.primeRate : pricing.nonPrimeRate) || 0;
    let label = isPrime ? 'Prime Slot Rate' : 'Non-Prime Slot Rate';
    let color = isPrime ? '#f59e0b' : '#6366f1';

    if (isWeekend && pricing.weekendEnabled) {
      baseRate = pricing.weekendPrice || 0;
      label += ' + Weekend Surcharge';
    }
    
    if (isPeak) {
      baseRate += ((pricing.peakPrice || 0) - (pricing.basePrice || 0));
      label += ' + Peak Surcharge';
      color = '#CE2029';
    }

    let finalRate = baseRate;
    if (previewSlot.isMember && pricing.memberDiscountEnabled) {
      const discountVal = (isPrime ? pricing.memberDiscountPrime : pricing.memberDiscountNonPrime) || 0;
      if (pricing.memberDiscountType === 'percentage') {
        finalRate = baseRate * (1 - discountVal / 100);
        label += ` (${discountVal}% Member Disc.)`;
      } else {
        finalRate = Math.max(0, baseRate - discountVal);
        label += ` (OMR ${discountVal} Member Disc.)`;
      }
    }

    return { price: finalRate || 0, originalPrice: baseRate || 0, label, color };
  };

  const preview = getPreviewPrice();

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        pricePerHour: pricing.basePrice,
        priceConfig: {
          ...pricing,
          holidayOverrides: overrides
        }
      };
      
      await patchMyArena(payload);
      await refetch();
      showToast('Pricing configurations saved', 'success');
    } catch (err) {
      showToast('Failed to save pricing', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key) => setPricing(p => ({ ...p, [key]: !p[key] }));

  const addOverride = () => {
    if (!overrideForm.name || !overrideForm.startDate) return;
    const newOv = { 
      ...overrideForm, 
      id: `o${Date.now()}`,
      primeRate: Number(overrideForm.primeRate), 
      nonPrimeRate: Number(overrideForm.nonPrimeRate) 
    };
    setOverrides(prev => [...prev, newOv]);
    setOverrideForm({ id: '', name: '', startDate: '', endDate: '', primeRate: '', nonPrimeRate: '' });
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

  if (loading && !pricing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 text-[#CE2029] animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Pricing Grid...</p>
      </div>
    );
  }

  if (!pricing) return null;

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 md:gap-5">
        <div className="xl:col-span-3 space-y-4">
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
              {activeSection === 'slotTypes' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className="text-amber-500" fill="#f59e0b" />
                    <h3 className="font-bold text-sm text-[#36454F] uppercase tracking-widest">Slot Type Base Rates</h3>
                  </div>
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider -mt-2 mb-4">
                    Baseline rates applied based on slot classification (Prime / Non-Prime).
                  </p>

                  <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                        <Star size={15} className="text-amber-600" fill="#d97706" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#36454F] text-xs uppercase tracking-widest leading-none">Prime Slot Rate</h4>
                        <p className="text-[9px] text-slate-600 font-bold mt-1 leading-none">High-demand segments</p>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs uppercase">OMR</span>
                      <input type="number" step="0.001" value={pricing.primeRate}
                        onChange={e => setPricing(p => ({ ...p, primeRate: Number(e.target.value) }))}
                        className={`${inputCls} pl-12 text-lg font-black`} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <CalendarDays size={15} className="text-slate-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#36454F] text-xs uppercase tracking-widest leading-none">Non-Prime Slot Rate</h4>
                        <p className="text-[9px] text-slate-600 font-bold mt-1 leading-none">Off-peak segments</p>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs uppercase">OMR</span>
                      <input type="number" step="0.001" value={pricing.nonPrimeRate}
                        onChange={e => setPricing(p => ({ ...p, nonPrimeRate: Number(e.target.value) }))}
                        className={`${inputCls} pl-12 text-lg font-black`} />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'peak' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-[#CE2029]" />
                    <h3 className="font-bold text-sm text-[#36454F] uppercase tracking-widest">Dynamic Surcharge</h3>
                  </div>
                  
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 space-y-3">
                    <h4 className="font-bold text-[#36454F] text-[10px] uppercase tracking-widest">Baseline Price (OMR)</h4>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs uppercase">OMR</span>
                        <input type="number" step="0.001" value={pricing.basePrice}
                          onChange={e => setPricing(p => ({ ...p, basePrice: Number(e.target.value) }))}
                          className={`${inputCls} pl-12 text-sm font-black`} />
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border transition-all ${pricing.peakEnabled ? 'border-red-100 bg-red-50/20' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-[#36454F] text-xs uppercase tracking-widest">Peak Surcharge</h4>
                        <p className="text-[9px] text-slate-600 mt-1">Apply higher rates at specific times</p>
                      </div>
                      <ToggleSwitch checked={pricing.peakEnabled} onToggle={() => toggle('peakEnabled')} />
                    </div>
                    {pricing.peakEnabled && (
                      <div className="space-y-3">
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
                              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-[12px] font-bold outline-none" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-600">Peak End</label>
                            <input type="time" value={pricing.peakEnd}
                              onChange={e => setPricing(p => ({ ...p, peakEnd: e.target.value }))}
                              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-[12px] font-bold outline-none" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`p-4 rounded-xl border transition-all ${pricing.weekendEnabled ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[#36454F] text-xs uppercase tracking-widest">Weekend Price</h4>
                        <p className="text-[9px] text-slate-600 mt-1">Surcharge for Sat & Sun</p>
                      </div>
                      <ToggleSwitch checked={pricing.weekendEnabled} onToggle={() => toggle('weekendEnabled')} />
                    </div>
                    {pricing.weekendEnabled && (
                      <div className="relative mt-3">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">OMR</span>
                        <input type="number" step="0.001" value={pricing.weekendPrice}
                          onChange={e => setPricing(p => ({ ...p, weekendPrice: Number(e.target.value) }))}
                          className={`${inputCls} pl-12 text-lg font-black`} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === 'members' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-indigo-500" />
                      <h3 className="font-bold text-sm text-[#36454F] uppercase tracking-widest">Member Incentive</h3>
                    </div>
                    <ToggleSwitch checked={pricing.memberDiscountEnabled} onToggle={() => toggle('memberDiscountEnabled')} />
                  </div>

                  {pricing.memberDiscountEnabled && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {['percentage', 'flat'].map(t => (
                          <button key={t}
                            onClick={() => setPricing(p => ({ ...p, memberDiscountType: t }))}
                            className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                              pricing.memberDiscountType === t
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                : 'bg-white border-slate-200 text-slate-500'
                            }`}>
                            {t === 'percentage' ? 'Percentage (%)' : 'Flat (OMR)'}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30">
                          <h4 className="text-[9px] font-black uppercase text-amber-600 mb-2">Prime Discount</h4>
                          <input type="number" value={pricing.memberDiscountPrime}
                            onChange={e => setPricing(p => ({ ...p, memberDiscountPrime: Number(e.target.value) }))}
                            className={`${inputCls} text-center text-xl font-black`} />
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30">
                          <h4 className="text-[9px] font-black uppercase text-slate-500 mb-2">Non-Prime Discount</h4>
                          <input type="number" value={pricing.memberDiscountNonPrime}
                            onChange={e => setPricing(p => ({ ...p, memberDiscountNonPrime: Number(e.target.value) }))}
                            className={`${inputCls} text-center text-xl font-black`} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'holidays' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-purple-500" />
                      <h3 className="font-bold text-sm text-[#36454F] uppercase tracking-widest">Holidays</h3>
                    </div>
                    <button onClick={() => setShowOverrideModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#36454F] text-white text-[9px] font-black uppercase tracking-widest">
                      <Plus size={12} /> New Override
                    </button>
                  </div>

                  <div className="space-y-2">
                    {overrides.length === 0 ? (
                      <p className="text-[10px] text-slate-400 text-center py-10">No overrides scheduled</p>
                    ) : (
                      overrides.map(ov => (
                        <div key={ov.id} className="flex border border-purple-100 bg-purple-50/30 p-3 rounded-xl justify-between items-center transition-all hover:bg-purple-50">
                          <div>
                            <p className="text-[10px] font-black uppercase text-[#36454F]">{ov.name}</p>
                            <p className="text-[8px] text-slate-500 font-bold uppercase">{ov.startDate} → {ov.endDate}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[9px] font-black text-amber-600">★ {ov.primeRate} OMR</p>
                              <p className="text-[9px] font-black text-slate-500">◆ {ov.nonPrimeRate} OMR</p>
                            </div>
                            <button onClick={() => removeOverride(ov.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }} 
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-md ${
              saving ? 'bg-slate-400 text-white' : 'bg-[#36454F] text-white hover:bg-black'
            }`}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : <TrendingUp size={14} />}
            {saving ? 'Syncing Pricing Rules...' : 'Synchronize Pricing Lattice'}
          </motion.button>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 sticky top-4 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#36454F] flex items-center gap-2 leading-none">
                  <Activity size={14} className="text-[#CE2029]" /> Simulation Core
                </h3>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/20">
              <div>
                <p className="text-[10px] font-black text-[#36454F] uppercase tracking-widest leading-none">Member Booking</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1 leading-none">Apply member discount</p>
              </div>
              <button onClick={() => setPreviewSlot(p => ({ ...p, isMember: !p.isMember }))}>
                {previewSlot.isMember 
                  ? <ToggleRight size={26} className="text-indigo-600" />
                  : <ToggleLeft size={26} className="text-slate-300" />}
              </button>
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
                { label: '★ Prime Rate', value: pricing.primeRate || 0, color: '#f59e0b' },
                { label: '◆ Non-Prime Rate', value: pricing.nonPrimeRate || 0, color: '#6366f1' },
                { label: '⚡ Peak Surcharge', value: pricing.peakPrice || 0, color: '#CE2029', active: pricing.peakEnabled },
                { label: '👥 Member Disc. (Prime)', value: `-${pricing.memberDiscountPrime || 0}%`, color: '#22c55e', isText: true, active: pricing.memberDiscountEnabled },
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
    </>
  );
};

export default PricingRules;
