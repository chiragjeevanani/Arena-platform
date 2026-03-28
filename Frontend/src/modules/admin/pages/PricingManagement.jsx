import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Plus, Search, Filter, Trash2, Edit3,
  Clock, Calendar, SunMedium, Moon, Zap, Tag, CheckCircle2,
  AlertTriangle, ToggleLeft, ToggleRight, X
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const INITIAL_RULES = [
  { id: 1, name: 'Base Price – Weekdays', type: 'base', applies: 'All Courts', time: 'Mon–Fri, 06:00–22:00', price: 4.00, active: true },
  { id: 2, name: 'Weekend Surge', type: 'weekend', applies: 'All Courts', time: 'Sat–Sun, All Day', price: 5.50, active: true },
  { id: 3, name: 'Peak Hour – Evening', type: 'peak', applies: 'All Courts', time: 'Mon–Fri, 17:00–20:00', price: 6.50, active: true },
  { id: 4, name: 'Off-Peak Morning', type: 'offpeak', applies: 'All Courts', time: 'Mon–Fri, 06:00–09:00', price: 3.00, active: false },
];

const TYPE_META = {
  base: { label: 'Base', color: '#1a2b3c', icon: Tag },
  weekend: { label: 'Weekend', color: '#6366f1', icon: Calendar },
  peak: { label: 'Peak Hour', color: '#eb483f', icon: Zap },
  offpeak: { label: 'Off-Peak', color: '#22c55e', icon: Moon },
};

const COURTS = ['All Courts'];

const emptyRule = { name: '', type: 'base', applies: 'All Courts', time: '', price: '' };

const PricingManagement = () => {
  const { isDark } = useTheme();
  const [rules, setRules] = useState(INITIAL_RULES);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form, setForm] = useState(emptyRule);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    const rule = rules.find(r => r.id === id);
    showToast(`"${rule.name}" ${rule.active ? 'disabled' : 'enabled'}`);
  };

  const deleteRule = (id) => {
    const rule = rules.find(r => r.id === id);
    setRules(prev => prev.filter(r => r.id !== id));
    showToast(`"${rule.name}" deleted`, 'error');
  };

  const openAdd = () => {
    setEditingRule(null);
    setForm(emptyRule);
    setShowModal(true);
  };

  const openEdit = (rule) => {
    setEditingRule(rule.id);
    setForm({ name: rule.name, type: rule.type, applies: rule.applies, time: rule.time, price: rule.price });
    setShowModal(true);
  };

  const saveRule = () => {
    if (!form.name || !form.price) return;
    if (editingRule) {
      setRules(prev => prev.map(r => r.id === editingRule ? { ...r, ...form, price: Number(form.price) } : r));
      showToast('Rule updated successfully');
    } else {
      setRules(prev => [...prev, { id: Date.now(), ...form, price: Number(form.price), active: true }]);
      showToast('New pricing rule added');
    }
    setShowModal(false);
  };

  const filtered = rules.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.applies.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.type === filter || (filter === 'active' && r.active) || (filter === 'inactive' && !r.active);
    return matchSearch && matchFilter;
  });

  const activePriceAvg = rules.filter(r => r.active).length > 0
    ? Math.round(rules.filter(r => r.active).reduce((a, r) => a + r.price, 0) / rules.filter(r => r.active).length)
    : 0;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto relative">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl shadow-2xl border flex items-center gap-2.5 min-w-[260px] ${
              toast.type === 'error' ? 'bg-red-600 border-red-500 text-white' : 'bg-[#1a2b3c] border-slate-700 text-white'
            }`}
          >
            {toast.type === 'error' ? <Trash2 size={15} /> : <CheckCircle2 size={15} className="text-[#eb483f]" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[70] rounded-2xl border shadow-2xl p-5 ${
                isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#eb483f]/10 flex items-center justify-center">
                    <DollarSign size={16} className="text-[#eb483f]" />
                  </div>
                  <h3 className={`font-bold text-sm uppercase tracking-tight ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>
                    {editingRule ? 'Edit Rule' : 'New Pricing Rule'}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5 text-white/30' : 'hover:bg-slate-100 text-slate-400'}`}>
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Name */}
                <div>
                  <label className="text-[8px] font-semibold uppercase tracking-widest text-[#eb483f] block mb-1">Rule Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Weekend Surge"
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all font-semibold ${
                      isDark ? 'bg-white/5 border-white/20 text-white placeholder:text-white/20 focus:border-[#eb483f]' : 'bg-slate-50 border-slate-300 text-[#1a2b3c] focus:border-[#eb483f]'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Type */}
                  <div>
                    <label className="text-[8px] font-semibold uppercase tracking-widest text-[#eb483f] block mb-1">Type</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all font-semibold ${
                        isDark ? 'bg-white/5 border-white/20 text-white focus:border-[#eb483f]' : 'bg-slate-50 border-slate-300 text-[#1a2b3c] focus:border-[#eb483f]'
                      }`}
                    >
                      {Object.entries(TYPE_META).map(([val, { label }]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-[8px] font-semibold uppercase tracking-widest text-[#eb483f] block mb-1">Price (OMR/hr)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      placeholder="5.000"
                      className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all font-semibold ${
                        isDark ? 'bg-white/5 border-white/20 text-white placeholder:text-white/20 focus:border-[#eb483f]' : 'bg-slate-50 border-slate-300 text-[#1a2b3c] focus:border-[#eb483f]'
                      }`}
                    />
                  </div>
                </div>


                {/* Time Range */}
                <div>
                  <label className="text-[8px] font-semibold uppercase tracking-widest text-[#eb483f] block mb-1">Time Range / Description</label>
                  <input
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    placeholder="e.g. Mon–Fri, 17:00–20:00"
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all font-semibold ${
                      isDark ? 'bg-white/5 border-white/20 text-white placeholder:text-white/20 focus:border-[#eb483f]' : 'bg-slate-50 border-slate-300 text-[#1a2b3c] focus:border-[#eb483f]'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowModal(false)} className={`flex-1 py-2 rounded-xl text-[9px] font-semibold uppercase tracking-widest border transition-all ${isDark ? 'border-white/10 text-white/40 hover:bg-white/5' : 'border-slate-200 text-slate-400'}`}>Cancel</button>
                <button
                  onClick={saveRule}
                  disabled={!form.name || !form.price}
                  className="flex-1 py-2 rounded-xl bg-[#eb483f] text-white text-[9px] font-semibold uppercase tracking-widest hover:bg-[#1a2b3c] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingRule ? 'Update Rule' : 'Add Rule'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl font-semibold tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>
            <DollarSign className="text-[#eb483f]" size={22} /> Pricing Management
          </h2>
          <p className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Configure dynamic pricing rules for base, peak, weekend, and holiday schedules. These rules apply to all courts.
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#eb483f] text-white text-[10px] font-bold uppercase tracking-widest shadow-md hover:bg-[#1a2b3c] transition-all">
          <Plus size={16} /> New Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Rules', value: rules.length, color: '#1a2b3c' },
          { label: 'Active Rules', value: rules.filter(r => r.active).length, color: '#22c55e' },
          { label: 'Avg Active Price', value: `OMR ${activePriceAvg}`, color: '#eb483f' },
          { label: 'Inactive Rules', value: rules.filter(r => !r.active).length, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className={`p-3.5 rounded-xl border shadow-sm ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
            <p className={`text-[8px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{s.label}</p>
            <p className="text-2xl font-bold tracking-tight" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="flex-1 relative group w-full">
          <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/20' : 'text-slate-400'}`} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules..."
            className={`w-full pl-9 pr-4 py-1.5 rounded-lg text-[11px] border outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-[#eb483f]' : 'bg-white border-slate-200 text-[#1a2b3c] focus:border-[#eb483f]'}`} />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'active', 'inactive', 'peak', 'weekend', 'base'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${
                filter === f ? 'bg-[#eb483f] text-white border-[#eb483f]' : isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-white border-slate-200 text-slate-500 hover:border-[#eb483f]'
              }`}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Rules Table */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className={`text-[8px] font-semibold uppercase tracking-widest border-b ${isDark ? 'text-white/30 border-white/5 bg-white/5' : 'text-slate-400 border-slate-100 bg-slate-50'}`}>
                <th className="px-5 py-3">Rule Name</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Time / Window</th>
                <th className="px-5 py-3 text-center">Price / Hr</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-slate-50'}`}>
              {filtered.map((rule, idx) => {
                const meta = TYPE_META[rule.type] || TYPE_META.base;
                return (
                  <motion.tr
                    key={rule.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`group transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/80'} ${!rule.active ? 'opacity-50' : ''}`}
                  >
                    <td className="px-5 py-3 whitespace-nowrap">
                      <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>{rule.name}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-widest border"
                        style={{ color: meta.color, backgroundColor: `${meta.color}12`, borderColor: `${meta.color}30` }}>
                        <meta.icon size={10} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                        <Clock size={10} className="text-[#eb483f]" /> {rule.time || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-bold" style={{ color: meta.color }}>OMR {rule.price.toFixed(3)}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => toggleRule(rule.id)} className="transition-transform hover:scale-105">
                        {rule.active
                          ? <ToggleRight size={26} className="text-[#eb483f]" />
                          : <ToggleLeft size={26} className={isDark ? 'text-white/20' : 'text-slate-300'} />
                        }
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(rule)} className={`p-1.5 rounded-lg border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-[#eb483f] hover:text-[#eb483f]'}`}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => deleteRule(rule.id)} className={`p-1.5 rounded-lg border transition-all opacity-0 group-hover:opacity-100 ${isDark ? 'bg-white/5 border-white/10 text-red-400 hover:bg-red-500/10' : 'bg-white border-slate-200 text-red-400 hover:border-red-400'}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className={`text-center py-12 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>
              <DollarSign size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold">No pricing rules found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingManagement;
