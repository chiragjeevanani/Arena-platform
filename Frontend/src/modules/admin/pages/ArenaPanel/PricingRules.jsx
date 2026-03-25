import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Zap, Calendar, Clock, ToggleLeft, ToggleRight, ArrowRight, TrendingUp, Tag } from 'lucide-react';

const initialPricing = {
  basePrice: 400,
  weekendEnabled: true,
  weekendPrice: 550,
  peakEnabled: true,
  peakPrice: 650,
  peakStart: '17:00',
  peakEnd: '20:00',
  customOverride: false,
  customPrice: 300,
};

const PricingRules = () => {
  const [pricing, setPricing] = useState(initialPricing);
  const [saved, setSaved] = useState(false);
  const [previewSlot, setPreviewSlot] = useState({ time: '18:00', day: 'weekday' });

  const getPreviewPrice = () => {
    const hour = parseInt(previewSlot.time.split(':')[0]);
    const isWeekend = previewSlot.day === 'weekend';
    const isPeak = pricing.peakEnabled &&
      hour >= parseInt(pricing.peakStart) &&
      hour < parseInt(pricing.peakEnd);

    if (isWeekend && pricing.weekendEnabled) return { price: pricing.weekendPrice, label: 'Weekend Rate', color: '#6366f1' };
    if (isPeak) return { price: pricing.peakPrice, label: 'Peak Hour Rate', color: '#eb483f' };
    return { price: pricing.basePrice, label: 'Base Rate', color: '#1a2b3c' };
  };

  const preview = getPreviewPrice();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggle = (key) => setPricing(p => ({ ...p, [key]: !p[key] }));

  const inputCls = "w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#eb483f] focus:bg-white transition-all text-[#1a2b3c]";

  const ToggleSwitch = ({ checked, onToggle }) => (
    <button onClick={onToggle} className="transition-all">
      {checked
        ? <ToggleRight size={30} className="text-[#eb483f]" />
        : <ToggleLeft size={30} className="text-slate-300" />
      }
    </button>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Pricing Config */}
      <div className="xl:col-span-3 space-y-5">

        {/* Base Price */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#1a2b3c]/10 flex items-center justify-center">
              <Tag size={18} className="text-[#1a2b3c]" />
            </div>
            <div>
              <h3 className="font-black text-[#1a2b3c] text-sm uppercase tracking-widest">Base Price</h3>
              <p className="text-[10px] text-slate-400 font-bold">Standard hourly rate for all weekdays</p>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">₹</span>
            <input type="number" value={pricing.basePrice}
              onChange={e => setPricing(p => ({ ...p, basePrice: Number(e.target.value) }))}
              className={`${inputCls} pl-10 text-xl font-black`} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-2">Per hour · Applies to all courts</p>
        </div>

        {/* Weekend Pricing */}
        <div className={`bg-white rounded-2xl border shadow-sm p-5 md:p-6 transition-all ${pricing.weekendEnabled ? 'border-purple-200' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pricing.weekendEnabled ? 'bg-purple-100' : 'bg-slate-100'}`}>
                <Calendar size={18} className={pricing.weekendEnabled ? 'text-purple-600' : 'text-slate-400'} />
              </div>
              <div>
                <h3 className="font-black text-[#1a2b3c] text-sm uppercase tracking-widest">Weekend Pricing</h3>
                <p className="text-[10px] text-slate-400 font-bold">Saturday & Sunday special rate</p>
              </div>
            </div>
            <ToggleSwitch checked={pricing.weekendEnabled} onToggle={() => toggle('weekendEnabled')} />
          </div>

          <AnimatePresence>
            {pricing.weekendEnabled && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">₹</span>
                  <input type="number" value={pricing.weekendPrice}
                    onChange={e => setPricing(p => ({ ...p, weekendPrice: Number(e.target.value) }))}
                    className={`${inputCls} pl-10 text-xl font-black`} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-purple-600">
                  <TrendingUp size={12} />
                  <span className="text-[10px] font-black">
                    +{Math.round(((pricing.weekendPrice - pricing.basePrice) / pricing.basePrice) * 100)}% vs base price
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Peak Hour Pricing */}
        <div className={`bg-white rounded-2xl border shadow-sm p-5 md:p-6 transition-all ${pricing.peakEnabled ? 'border-[#eb483f]/30' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pricing.peakEnabled ? 'bg-[#eb483f]/10' : 'bg-slate-100'}`}>
                <Zap size={18} className={pricing.peakEnabled ? 'text-[#eb483f]' : 'text-slate-400'} />
              </div>
              <div>
                <h3 className="font-black text-[#1a2b3c] text-sm uppercase tracking-widest">Peak Hour Pricing</h3>
                <p className="text-[10px] text-slate-400 font-bold">Higher rate during busy hours</p>
              </div>
            </div>
            <ToggleSwitch checked={pricing.peakEnabled} onToggle={() => toggle('peakEnabled')} />
          </div>

          <AnimatePresence>
            {pricing.peakEnabled && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">₹</span>
                  <input type="number" value={pricing.peakPrice}
                    onChange={e => setPricing(p => ({ ...p, peakPrice: Number(e.target.value) }))}
                    className={`${inputCls} pl-10 text-xl font-black`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Peak Start</label>
                    <input type="time" value={pricing.peakStart}
                      onChange={e => setPricing(p => ({ ...p, peakStart: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Peak End</label>
                    <input type="time" value={pricing.peakEnd}
                      onChange={e => setPricing(p => ({ ...p, peakEnd: e.target.value }))} className={inputCls} />
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#eb483f]/5 border border-[#eb483f]/20 rounded-xl p-3">
                  <Clock size={14} className="text-[#eb483f]" />
                  <span className="text-[11px] font-black text-[#eb483f]">
                    Peak hours: {pricing.peakStart} – {pricing.peakEnd} (weekdays only)
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave}
          className={`w-full py-4 rounded-xl text-[13px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-[#eb483f] text-white hover:shadow-lg hover:shadow-[#eb483f]/30 hover:-translate-y-0.5'
          }`}>
          {saved ? '✓ Pricing Saved!' : <>Save Pricing Rules <ArrowRight size={16} strokeWidth={3} /></>}
        </motion.button>
      </div>

      {/* Price Preview Panel */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-4 space-y-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1a2b3c] pb-3 border-b border-slate-100 flex items-center gap-2">
            <DollarSign size={16} className="text-[#eb483f]" /> Price Preview
          </h3>

          {/* Simulate Slot */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Select Time</label>
              <input type="time" value={previewSlot.time}
                onChange={e => setPreviewSlot(p => ({ ...p, time: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Day Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['weekday', 'weekend'].map(d => (
                  <button key={d} onClick={() => setPreviewSlot(p => ({ ...p, day: d }))}
                    className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                      previewSlot.day === d
                        ? 'bg-[#eb483f] border-[#eb483f] text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-[#eb483f]'
                    }`}>{d}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Price Result */}
          <motion.div key={`${previewSlot.time}-${previewSlot.day}`}
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl p-5 text-center border"
            style={{ backgroundColor: `${preview.color}10`, borderColor: `${preview.color}30` }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: preview.color }}>{preview.label}</p>
            <p className="text-5xl font-black" style={{ color: preview.color }}>₹{preview.price}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-2">per hour</p>
          </motion.div>

          {/* Rate Summary */}
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">All Rates</p>
            {[
              { label: 'Base Rate', value: pricing.basePrice, color: '#1a2b3c', active: true },
              { label: 'Weekend Rate', value: pricing.weekendPrice, color: '#6366f1', active: pricing.weekendEnabled },
              { label: 'Peak Rate', value: pricing.peakPrice, color: '#eb483f', active: pricing.peakEnabled },
            ].map((r, i) => (
              <div key={i} className={`flex items-center justify-between py-2.5 px-3 rounded-xl border text-[12px] font-bold transition-all ${
                r.active ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-100 opacity-40'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-slate-600">{r.label}</span>
                  {!r.active && <span className="text-[8px] bg-slate-200 text-slate-400 px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest">OFF</span>}
                </div>
                <span className="font-black" style={{ color: r.color }}>₹{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingRules;
