import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, Plus, Search, Filter, MoreVertical, 
  Pencil, Trash2, Eye, EyeOff, CheckCircle2, 
  ChevronRight, ArrowUpRight, Percent, Users,
  Calendar, ShieldCheck, X, Save, Info, Layout,
  CreditCard, CalendarX2, TrendingUp, UserMinus, DollarSign, List
} from 'lucide-react';
import { MEMBERSHIP_PLANS } from '../../../data/mockData';

const MembershipMgmt = () => {
  const [plans, setPlans] = useState(MEMBERSHIP_PLANS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingPlan, setEditingPlan] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || plan.category === filterCategory)
  );

  const toggleStatus = (id) => {
    setPlans(plans.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'draft' : 'active' } : p));
  };

  const deletePlan = (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingPlan.id) {
      setPlans(plans.map(p => p.id === editingPlan.id ? editingPlan : p));
    } else {
      setPlans([{ ...editingPlan, id: Date.now() }, ...plans]);
    }
    setEditingPlan(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] p-4 md:p-6 lg:p-8 font-sans">
      {/* Header Area */}
      <div className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-[2.5px] bg-[#CE2029]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CE2029]">Membership Engine</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#36454F] leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Plan <span className="text-[#CE2029]">Management</span>
          </h1>
          <p className="text-slate-500 font-bold text-[13px] mt-2 opacity-60 flex items-center gap-1.5">
            <Users size={14} /> 1.2k Active Members Across {plans.length} Live Plans
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setEditingPlan({ name: '', price: 0, category: 'non-premium', duration: '12 Months', benefits: [], status: 'draft' })}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#CE2029] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#CE2029]/20 hover:scale-[1.02] transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Create New Plan
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="max-w-[1600px] mx-auto mb-6 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#CE2029]/20 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="h-8 w-[1px] bg-slate-100 hidden sm:block" />
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {['all', 'premium', 'non-premium', 'individual'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterCategory === cat 
                    ? 'bg-[#CE2029] text-white' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#36454F] text-white' : 'text-slate-400 hover:bg-slate-50'}`}
            >
                <Layout size={18} />
            </button>
            <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[#36454F] text-white' : 'text-slate-400 hover:bg-slate-50'}`}
            >
                <List size={18} />
            </button>
        </div>
      </div>

      {/* Analytics Snapshot */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Avg Revenue/User', value: 'OMR 115', delta: '+12%', icon: CustomDollarSign, color: '#10b981' },
          { label: 'Conversion Rate', value: '4.2%', delta: '+0.5%', icon: CustomTrendingUp, color: '#3b82f6' },
          { label: 'Churn Rate', value: '2.1%', delta: '-0.3%', icon: CustomUserMinus, color: '#f43f5e' },
          { label: 'Expiring Soon', value: '45 Users', delta: 'Requires Action', icon: Calendar, color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-slate-50" style={{ color: stat.color }}>
                   <stat.icon size={18} />
                </div>
                <span className="text-[10px] font-black text-emerald-500">{stat.delta}</span>
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
             <h4 className="text-xl font-black text-[#36454F] tracking-tighter">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="max-w-[1600px] mx-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlans.map(plan => (
              <div 
                key={plan.id}
                className="group bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col"
              >
                {/* Status Badge - Modern Hanging Tag */}
                <div className={`absolute top-0 right-6 z-10 px-3 py-1.5 rounded-b-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-md transition-all duration-300 group-hover:shadow-lg ${
                    plan.status === 'active' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                    <div className="flex items-center gap-1">
                      {plan.status === 'active' && <div className="w-1 h-1 bg-white rounded-full animate-pulse" />}
                      {plan.status}
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                             style={{ backgroundColor: `${plan.color}15`, color: plan.color }}>
                            <Crown size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-[#36454F] tracking-tight leading-none mb-1">{plan.name}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{plan.category} · {plan.duration}</p>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-xs font-bold text-slate-400">OMR</span>
                        <span className="text-3xl font-black text-[#36454F] tracking-tighter">{plan.price.toFixed(3)}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">/ {plan.duration}</span>
                    </div>

                    <div className="space-y-2.5 mb-8 flex-1">
                        {plan.benefits.slice(0, 4).map((benefit, i) => (
                            <div key={i} className="flex items-start gap-2 text-[11px] font-bold text-slate-600 leading-tight">
                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                {benefit}
                            </div>
                        ))}
                        {plan.benefits.length > 4 && (
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">+{plan.benefits.length - 4} More Benefits</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                        <button 
                            onClick={() => setEditingPlan(plan)}
                            className="flex-1 py-2.5 bg-slate-50 hover:bg-[#36454F] hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Edit Features
                        </button>
                        <button 
                            onClick={() => toggleStatus(plan.id)}
                            className={`p-2.5 rounded-xl transition-all ${
                                plan.status === 'active' 
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                        >
                            {plan.status === 'active' ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button 
                            onClick={() => deletePlan(plan.id)}
                            className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden whitespace-nowrap overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Plan Name</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Duration</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Price (OMR)</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Discount</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPlans.map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                             style={{ backgroundColor: `${plan.color}15`, color: plan.color }}>
                          <Crown size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#36454F] tracking-tight leading-none mb-0.5">{plan.name}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{plan.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600">{plan.duration}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-[#36454F]">OMR {plan.price.toFixed(3)}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                          <Percent size={12} strokeWidth={3} />
                          <span className="text-xs font-black">{plan.discountPercent}%</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(plan.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                          plan.status === 'active' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {plan.status === 'active' ? <CheckCircle2 size={12} /> : <Info size={12} />}
                        {plan.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button onClick={() => setEditingPlan(plan)} className="p-2 text-slate-400 hover:text-[#CE2029] transition-colors"><Pencil size={18} /></button>
                       <button onClick={() => deletePlan(plan.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Drawer */}
      <AnimatePresence>
        {editingPlan && (
          <>
            {/* Light Glassmorphism Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPlan(null)}
              className="fixed inset-0 bg-white/40 backdrop-blur-md z-[200]" 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-y-0 right-0 w-full md:w-[460px] bg-white/95 backdrop-blur-xl z-[210] shadow-[-20px_0_50px_rgba(0,0,0,0.05)] flex flex-col pointer-events-auto border-l border-white/20"
            >
              {/* STICKY HEADER */}
              <div className="p-6 border-b border-slate-100/50 flex items-center justify-between bg-white/50 sticky top-0 z-30">
                <div>
                  <h2 className="text-xl font-extrabold text-[#36454F] tracking-tight">
                    Edit Membership
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Customization Portal</p>
                </div>
                <button 
                  onClick={() => setEditingPlan(null)} 
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-[#eb483f] transition-all duration-300"
                >
                  <X size={20} />
                </button>
              </div>

              {/* DRAWER CONTENT */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-12 scrollbar-hide">
                
                {/* LIVE PREVIEW SECTION */}
                <div className="px-6 mb-8 mt-2">
                   <div className="p-1 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#eb483f]">Live Preview</span>
                   </div>
                   <motion.div 
                    layout
                    className="relative w-full h-48 rounded-[24px] p-6 text-white overflow-hidden shadow-2xl transition-all duration-500"
                    style={{ backgroundColor: editingPlan.color || '#f59e0b' }}
                   >

                      
                      {editingPlan.bestValue && (
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/30">
                          ★ Best Value
                        </div>
                      )}

                      <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-auto">
                           <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                              <Crown size={24} />
                           </div>
                           <div>
                              <h4 className="font-black text-lg leading-none mb-1">{editingPlan.name || 'Sample Plan'}</h4>
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{editingPlan.category} · {editingPlan.duration}</p>
                           </div>
                        </div>

                        <div className="flex items-end justify-between">
                           <div>
                              <span className="text-[10px] font-bold block opacity-70 mb-1 uppercase tracking-widest">Pricing Model</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xs font-bold opacity-80">OMR</span>
                                <span className="text-3xl font-black tracking-tighter">{(editingPlan.price || 0).toFixed(3)}</span>
                                <span className="text-[10px] font-bold opacity-70">/ {editingPlan.duration}</span>
                              </div>
                           </div>
                           <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30">
                              <span className="text-xs font-black">-{editingPlan.discountPercent}%</span>
                           </div>
                        </div>
                      </div>
                   </motion.div>
                </div>

                <form className="px-6 space-y-10">
                  {/* SECTION: PLAN INFORMATION */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 border-l-4 border-[#eb483f] pl-3">Plan Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Plan Name</label>
                        <input 
                          type="text" 
                          value={editingPlan.name}
                          onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                          className="w-full px-5 py-3.5 bg-[#f9fafb] border-2 border-transparent rounded-[12px] text-sm font-bold text-slate-700 focus:outline-none focus:border-[#eb483f]/30 focus:bg-white focus:ring-4 focus:ring-[#eb483f]/5 transition-all"
                          placeholder="e.g. Premium Annual"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Category</label>
                          <select 
                            value={editingPlan.category}
                            onChange={(e) => setEditingPlan({ ...editingPlan, category: e.target.value })}
                            className="w-full px-5 py-3.5 bg-[#f9fafb] border-2 border-transparent rounded-[12px] text-sm font-bold text-slate-700 focus:outline-none focus:border-[#eb483f]/30 focus:bg-white transition-all appearance-none cursor-pointer"
                          >
                            <option value="premium">Premium</option>
                            <option value="non-premium">Standard</option>
                            <option value="individual">Individual</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Duration</label>
                          <select 
                            value={editingPlan.duration}
                            onChange={(e) => setEditingPlan({ ...editingPlan, duration: e.target.value })}
                            className="w-full px-5 py-3.5 bg-[#f9fafb] border-2 border-transparent rounded-[12px] text-sm font-bold text-slate-700 focus:outline-none focus:border-[#eb483f]/30 focus:bg-white transition-all appearance-none cursor-pointer"
                          >
                            <option value="12 Months">12 Months</option>
                            <option value="6 Months">6 Months</option>
                            <option value="3 Months">3 Months</option>
                            <option value="1 Month">1 Month</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION: PRICING */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 border-l-4 border-[#eb483f] pl-3">Pricing</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Price (OMR)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            step="0.001"
                            value={editingPlan.price}
                            onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-12 pr-5 py-3.5 bg-[#f9fafb] border-2 border-transparent rounded-[12px] text-sm font-black text-slate-700 focus:outline-none focus:border-[#eb483f]/30 focus:bg-white transition-all"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">OMR</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Discount %</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={editingPlan.discountPercent}
                            onChange={(e) => setEditingPlan({ ...editingPlan, discountPercent: parseInt(e.target.value) || 0 })}
                            className="w-full pl-12 pr-5 py-3.5 bg-[#f9fafb] border-2 border-transparent rounded-[12px] text-sm font-black text-slate-700 focus:outline-none focus:border-[#eb483f]/30 focus:bg-white transition-all"
                          />
                           <Percent size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION: APPEARANCE */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 border-l-4 border-[#eb483f] pl-3">Appearance</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Theme Color</label>
                          <div className="flex items-center gap-3 p-2.5 bg-[#f9fafb] rounded-[12px] border-2 border-transparent hover:bg-slate-50 transition-all cursor-pointer">
                             <input 
                               type="color" 
                               value={editingPlan.color || '#f59e0b'}
                               onChange={(e) => setEditingPlan({ ...editingPlan, color: e.target.value })}
                               className="w-8 h-8 rounded-lg border-2 border-white cursor-pointer overflow-hidden p-0 shadow-sm"
                             />
                             <span className="text-xs font-mono font-bold text-slate-500 uppercase">{editingPlan.color || '#f59e0b'}</span>
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Promotion Tag</label>
                          <button 
                             type="button"
                             onClick={() => setEditingPlan({ ...editingPlan, bestValue: !editingPlan.bestValue })}
                             className={`w-full py-3.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                               editingPlan.bestValue 
                                 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
                                 : 'bg-[#f9fafb] text-slate-400 border-transparent'
                             }`}
                          >
                             ★ Best Value
                          </button>
                       </div>
                    </div>
                  </div>

                  {/* SECTION: VISIBILITY */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 border-l-4 border-[#eb483f] pl-3">Visibility</h3>
                    <div className="p-4 bg-[#f9fafb] rounded-[16px] flex items-center justify-between group transition-all hover:bg-slate-50">
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700">Display Status</span>
                          <span className="text-[10px] font-bold text-slate-400">{editingPlan.status === 'active' ? 'Live & Searchable' : 'Draft / Hidden'}</span>
                       </div>
                       <button 
                        type="button"
                        onClick={() => setEditingPlan({ ...editingPlan, status: editingPlan.status === 'active' ? 'draft' : 'active' })}
                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${editingPlan.status === 'active' ? 'bg-[#eb483f] shadow-lg shadow-[#eb483f]/20' : 'bg-slate-300'}`}
                       >
                          <div className={`w-6 h-6 bg-white rounded-full transition-all duration-300 transform ${editingPlan.status === 'active' ? 'translate-x-6' : 'translate-x-0'} shadow-sm flex items-center justify-center`}>
                             {editingPlan.status === 'active' ? <CheckCircle2 size={14} className="text-[#eb483f]" /> : <X size={14} className="text-slate-400" />}
                          </div>
                       </button>
                    </div>
                  </div>

                  {/* SECTION: FEATURES */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 border-l-4 border-[#eb483f] pl-3">Features</h3>
                      <button 
                        type="button"
                        onClick={() => setEditingPlan({ ...editingPlan, benefits: [...(editingPlan.benefits || []), ''] })}
                        className="text-[10px] font-black text-[#eb483f] hover:text-[#d83f36] uppercase tracking-widest transition-colors flex items-center gap-1.5"
                      >
                        <Plus size={14} strokeWidth={3} /> Add Feature
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                       {(editingPlan.benefits || []).map((benefit, i) => (
                         <div key={i} className="flex-1 min-w-full">
                            <div className="relative group/feat">
                               <input 
                                 type="text" 
                                 value={benefit}
                                 onChange={(e) => {
                                     const newBenefits = [...editingPlan.benefits];
                                     newBenefits[i] = e.target.value;
                                     setEditingPlan({ ...editingPlan, benefits: newBenefits });
                                 }}
                                 className="w-full pl-10 pr-12 py-3 bg-[#f9fafb] border-2 border-transparent rounded-[12px] text-xs font-bold text-slate-600 focus:outline-none focus:border-[#eb483f]/20 focus:bg-white transition-all shadow-sm"
                                 placeholder="e.g. 20% off Prime slots"
                               />
                               <CheckCircle2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#eb483f]" />
                               <button 
                                 type="button"
                                 onClick={() => {
                                     const newBenefits = editingPlan.benefits.filter((_, idx) => idx !== i);
                                     setEditingPlan({ ...editingPlan, benefits: newBenefits });
                                 }}
                                 className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                               >
                                 <Trash2 size={14} />
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </form>
              </div>

              {/* STICKY ACTIONS FOOTER */}
              <div className="p-6 border-t border-slate-100/50 bg-white/50 backdrop-blur-md flex flex-col sm:flex-row gap-3 sticky bottom-0 z-30">
                <button 
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-4.5 px-6 rounded-[12px] bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100/80 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] py-4.5 px-6 rounded-[12px] bg-gradient-to-r from-[#eb483f] to-[#ff6b6b] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#eb483f]/25 hover:shadow-[#eb483f]/40 hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Internal Stat Icons
const CustomDollarSign = (props) => <CreditCard {...props} />;
const CustomTrendingUp = (props) => <ArrowUpRight {...props} />;
const CustomUserMinus = (props) => <CalendarX2 {...props} />;

export default MembershipMgmt;
