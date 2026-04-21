import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Shield, Users, Plus, Edit3, Trash2, ToggleLeft, ToggleRight,
  CheckCircle2, X, Save, Clock, Calendar, Zap, Star, ChevronDown
} from 'lucide-react';
import ArenaPanelDemoBanner from './ArenaPanelDemoBanner';
const CATEGORY_META = {
  premium:      { label: 'Premium',     icon: Crown,   color: '#f59e0b', bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-700' },
  'non-premium':{ label: 'Standard',    icon: Shield,  color: '#6366f1', bg: 'bg-indigo-50', border: 'border-indigo-200',text: 'text-indigo-700' },
  individual:   { label: 'Individual',  icon: Users,   color: '#22c55e', bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-700' },
};

const emptyForm = {
  name: '', duration: '', durationMonths: 12, category: 'premium',
  price: '', discountPercent: '', access: 'All Days',
  benefits: '', status: 'active', bestValue: false,
};

const MembershipAdmin = () => {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterCat, setFilterCat] = useState('all');

  const openAdd = () => { setForm(emptyForm); setEditingPlan(null); setShowModal(true); };
  const openEdit = (plan) => {
    setForm({ ...plan, benefits: plan.benefits.join('\n') });
    setEditingPlan(plan.id);
    setShowModal(true);
  };

  const handleSave = () => {
    const planObj = {
      ...form,
      id: editingPlan || `plan-${Date.now()}`,
      price: Number(form.price),
      discountPercent: Number(form.discountPercent),
      durationMonths: Number(form.durationMonths),
      color: CATEGORY_META[form.category]?.color || '#6366f1',
      benefits: form.benefits.split('\n').map(b => b.trim()).filter(Boolean),
    };
    if (editingPlan) {
      setPlans(p => p.map(pl => pl.id === editingPlan ? planObj : pl));
    } else {
      setPlans(p => [...p, planObj]);
    }
    setShowModal(false);
  };

  const toggleStatus = (id) =>
    setPlans(p => p.map(pl => pl.id === id ? { ...pl, status: pl.status === 'active' ? 'disabled' : 'active' } : pl));

  const deletePlan = (id) => setPlans(p => p.filter(pl => pl.id !== id));

  const filtered = filterCat === 'all' ? plans : plans.filter(p => p.category === filterCat);

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm font-medium text-slate-800 outline-none focus:border-[#CE2029] focus:bg-white transition-all";

  return (
    <div className="space-y-5">
      <ArenaPanelDemoBanner>
        Plan edits here are local. Super-admin membership plans are under Admin → Membership management.
      </ArenaPanelDemoBanner>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#36454F] uppercase tracking-widest">Membership Plans</h2>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            {plans.length} total · {plans.filter(p => p.status === 'active').length} active
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#CE2029] text-white text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md hover:bg-[#d83f36] transition-all"
        >
          <Plus size={14} strokeWidth={3} /> Add Plan
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {['all', 'premium', 'non-premium', 'individual'].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
              filterCat === c ? 'bg-[#36454F] text-white border-[#36454F]' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
            }`}>
            {c === 'all' ? 'All' : CATEGORY_META[c]?.label}
          </button>
        ))}
      </div>

      {/* Plans table / cards */}
      <div className="space-y-3">
        {filtered.map(plan => {
          const meta = CATEGORY_META[plan.category];
          const Icon = meta?.icon || Shield;
          return (
            <motion.div key={plan.id} layout
              className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${plan.status === 'disabled' ? 'opacity-50' : 'border-slate-100'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta?.color}15` }}>
                    <Icon size={18} style={{ color: meta?.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-[#36454F]">{plan.name}</h4>
                      {plan.bestValue && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest border border-amber-200 flex items-center gap-1">
                          <Star size={8} fill="currentColor" /> Best Value
                        </span>
                      )}
                      <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                        plan.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>{plan.status}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase">
                        <Clock size={9} /> {plan.duration}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase">
                        <Calendar size={9} /> {plan.access}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase">
                        <Zap size={9} /> {plan.discountPercent}% off
                      </span>
                    </div>
                    <p className="text-xs font-black text-[#36454F] mt-1.5">OMR {Number(plan.price).toFixed(3)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleStatus(plan.id)} title="Toggle active/disabled">
                    {plan.status === 'active'
                      ? <ToggleRight size={22} className="text-[#CE2029]" />
                      : <ToggleLeft size={22} className="text-slate-300" />}
                  </button>
                  <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#CE2029] hover:border-[#CE2029]/30 transition-all">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => deletePlan(plan.id)} className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="h-1 w-full bg-gradient-to-r from-[#CE2029] to-amber-400" />
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-base font-black text-[#36454F] uppercase tracking-widest">
                  {editingPlan ? 'Edit Plan' : 'New Plan'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Plan Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Annual Premium" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Duration Label</label>
                    <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="6 Months" className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                      <option value="premium">Premium</option>
                      <option value="non-premium">Standard</option>
                      <option value="individual">Individual</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Price (OMR)</label>
                    <input type="number" step="0.001" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.000" className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Discount (%)</label>
                    <input type="number" value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))} placeholder="10" className={inputCls} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Access Type</label>
                  <select value={form.access} onChange={e => setForm(f => ({ ...f, access: e.target.value }))} className={inputCls}>
                    <option>All Days</option>
                    <option>Weekends Only</option>
                    <option>Weekdays Only</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Benefits (one per line)</label>
                  <textarea rows={4} value={form.benefits} onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))}
                    placeholder={"20% off Prime slots\nPriority booking\nFree shuttle"} className={`${inputCls} resize-none`} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div>
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Mark as Best Value</p>
                    <p className="text-[8px] font-bold text-amber-500 mt-0.5">Highlights this plan with a banner</p>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, bestValue: !f.bestValue }))}>
                    {form.bestValue
                      ? <ToggleRight size={24} className="text-amber-500" />
                      : <ToggleLeft size={24} className="text-slate-300" />}
                  </button>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 shrink-0">
                <button onClick={handleSave} className="w-full py-3 rounded-xl bg-[#CE2029] text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#d83f36] transition-all shadow-md">
                  <Save size={15} /> {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MembershipAdmin;
