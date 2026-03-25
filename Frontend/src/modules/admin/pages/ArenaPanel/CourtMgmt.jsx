import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Edit2, Trash2, X, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Layers } from 'lucide-react';


const INITIAL_COURTS = [
  { id: 'c1', arenaId: 'arena-1', name: 'Court A', type: 'Indoor', status: 'Active' },
  { id: 'c2', arenaId: 'arena-1', name: 'Court B', type: 'Indoor', status: 'Active' },
  { id: 'c3', arenaId: 'arena-1', name: 'Court C', type: 'Outdoor', status: 'Inactive' },
  { id: 'c4', arenaId: 'arena-1', name: 'Court D', type: 'Indoor', status: 'Active' },
];

const emptyForm = { name: '', type: 'Indoor', status: 'Active' };

const CourtMgmt = () => {
  const [courts, setCourts] = useState(INITIAL_COURTS);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { setEditId(c.id); setForm({ name: c.name, type: c.type, status: c.status }); setShowModal(true); };

  const save = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setCourts(p => p.map(c => c.id === editId ? { ...c, ...form } : c));
    } else {
      setCourts(p => [...p, { id: `c${Date.now()}`, arenaId: 'arena-1', ...form }]);
    }
    setShowModal(false);
  };

  const confirmDelete = () => {
    setCourts(p => p.filter(c => c.id !== deleteId));
    setDeleteId(null);
  };

  const inputCls = "w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#eb483f] focus:bg-white transition-all text-[#1a2b3c]";

  const activeCourts = courts.filter(c => c.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Courts', value: courts.length, color: '#1a2b3c' },
          { label: 'Active', value: activeCourts, color: '#22c55e' },
          { label: 'Inactive', value: courts.length - activeCourts, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Courts Grid */}
      {courts.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Target size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-black uppercase tracking-widest">No courts yet</p>
          <p className="text-xs mt-1">Click "+ Add Court" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {courts.map((court, idx) => (
              <motion.div key={court.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col hover:border-[#eb483f]/30 hover:shadow-md transition-all">
                
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    court.status === 'Active'
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-red-50 text-red-500 border-red-100'
                  }`}>
                    {court.status === 'Active' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                    {court.status}
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    court.type === 'Indoor'
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-orange-50 text-orange-600 border-orange-100'
                  }`}>
                    {court.type}
                  </span>
                </div>

                {/* Court Name */}
                <div className="mb-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#eb483f]/10 flex items-center justify-center mb-3">
                    <Target size={18} className="text-[#eb483f]" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-black text-[#1a2b3c]">{court.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{court.type} Badminton Court</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button onClick={() => openEdit(court)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-[#eb483f] hover:text-[#eb483f] transition-all">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => setDeleteId(court.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-red-400 hover:text-red-500 transition-all">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Floating Add Button */}
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={openAdd}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#eb483f] text-white text-[12px] font-black uppercase tracking-widest shadow-xl shadow-[#eb483f]/40 hover:shadow-2xl hover:shadow-[#eb483f]/50 transition-all">
        <Plus size={18} strokeWidth={3} /> Add Court
      </motion.button>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
              
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <Target className="text-[#eb483f]" size={22} strokeWidth={3} />
                    {editId ? 'Edit Court' : 'Add New Court'}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                    {editId ? 'Update court details' : 'Register a new badminton court'}
                  </p>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-100 transition-all">
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Court Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Court A" className={inputCls} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Court Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className={inputCls}>
                      <option>Indoor</option>
                      <option>Outdoor</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Status</label>
                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <button onClick={save} disabled={!form.name.trim()}
                  className="w-full py-4 rounded-xl bg-[#eb483f] text-white text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#eb483f]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                  {editId ? 'Update Court' : 'Add Court'} <ArrowRight size={16} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="font-black text-[#1a2b3c] mb-2">Delete Court?</h3>
              <p className="text-sm text-slate-500 mb-6">This action cannot be undone. All associated slots will also be removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all">
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourtMgmt;
