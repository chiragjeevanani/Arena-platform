import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Plus, Search, Trash2, Edit3, 
  CheckCircle2, X, Activity, Layers, ChevronRight,
  Maximize2, Save, MoreVertical, Globe, Settings2, ShieldCheck, User
} from 'lucide-react';
import { MOCK_DB } from '../../../data/mockDatabase';

const CourtMgmtAdmin = () => {
  const [courts, setCourts] = useState(MOCK_DB.courts);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', type: '', status: '', baseRate: '' });
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const openEdit = (court) => {
    setEditingId(court.id);
    setForm({ name: court.name, type: court.type, status: court.status, baseRate: court.baseRate });
  };

  const saveCourt = () => {
    setCourts(prev => prev.map(c => c.id === editingId ? { ...c, ...form } : c));
    setEditingId(null);
    showToast(`Court "${form.name}" updated successfully`);
  };

  const filtered = courts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto relative px-4 py-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-white border border-[#eb483f]/20 text-[#1a2b3c] px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 min-w-[280px]"
          >
            <CheckCircle2 size={16} className="text-[#eb483f]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
           <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#eb483f] mb-1">
              <Target size={12} /> Arena Management
           </div>
           <h1 className="text-xl font-semibold tracking-tight text-slate-900">Manage Courts</h1>
        </div>
        <button className="bg-[#eb483f] text-white px-5 py-2 rounded-lg font-semibold text-[11px] uppercase tracking-widest shadow-lg hover:brightness-110 transition-all flex items-center gap-2">
           <Plus size={14} /> Add New Court
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative group w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by court name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-100 bg-white outline-none focus:border-[#eb483f] transition-all font-semibold" 
          />
        </div>
        <div className="px-4 py-2.5 rounded-xl border border-slate-100 text-[10px] font-semibold tracking-wide text-slate-400 bg-white">
          Total Operational Units: <span className="text-slate-900 font-bold">{courts.length}</span>
        </div>
      </div>

      {/* Courts List/Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((court) => (
          <motion.div
            layout
            key={court.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`group bg-white rounded-3xl border ${editingId === court.id ? 'border-[#eb483f]' : 'border-slate-100'} p-5 shadow-sm transition-all relative overflow-hidden flex flex-col`}
          >
            {editingId === court.id ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#eb483f]">Court Name</label>
                  <input 
                    type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Surface Type</label>
                    <input 
                      type="text" value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Rate (OMR/hr)</label>
                    <input 
                      type="text" value={form.baseRate} onChange={e => setForm({...form, baseRate: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={saveCourt} className="flex-1 py-2 bg-[#eb483f] text-white rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-sm">
                    Save Changes
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#eb483f] group-hover:bg-[#eb483f]/10 transition-all">
                    <Layers size={18} />
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => openEdit(court)}
                      className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-[#eb483f] hover:bg-white border border-transparent hover:border-slate-100 transition-all"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-tight group-hover:text-[#eb483f] transition-all whitespace-nowrap overflow-hidden text-ellipsis">
                    {court.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{court.type}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className={`text-[9px] font-black uppercase tracking-wider ${court.status === 'Active' ? 'text-green-500' : 'text-slate-300'}`}>
                      {court.status === 'Active' ? 'Operational' : 'Halted'}
                    </span>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Base Rate</span>
                    <span className="text-[13px] font-bold text-slate-900">{court.pricePerHour} OMR<span className="text-[9px] font-normal text-slate-400">/hr</span></span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Capacity</span>
                    <span className="text-[13px] font-bold text-slate-900">4 <span className="text-[9px] font-normal text-slate-400">Pax</span></span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ))}
        
        {/* Dash Card */}
        <div className="aspect-square rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-[#eb483f]/20 hover:text-[#eb483f]/50 hover:bg-[#eb483f]/5 group transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-all">
            <Plus size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">New Unit Portfolio</span>
        </div>
      </div>
    </div>
  );
};

export default CourtMgmtAdmin;
