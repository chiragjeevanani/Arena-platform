import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, X, Eye, EyeOff, LayoutPanelTop, 
  Target, PenTool, Edit3, Trash2, Plus, Upload, Cloud
} from 'lucide-react';
import { HOME_CONFIG } from '../../../data/frontendConfig';

const FrontendCategoryMgmt = () => {
  const [categories, setCategories] = useState(HOME_CONFIG.categories);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', image: '', link: '' });
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ title: '', image: '', link: '' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ ...cat });
    setShowModal(true);
  };

  const deleteCat = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('Category card removed');
  };

  const saveCat = () => {
    if (editingId) {
      setCategories(prev => prev.map(c => c.id === editingId ? { ...form, id: editingId } : c));
      showToast('Category updated');
    } else {
      setCategories(prev => [...prev, { ...form, id: Date.now() }]);
      showToast('New sport category added');
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-4 py-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-white text-slate-900 px-5 py-2.5 rounded-xl shadow-2xl border border-[#CE2029]/20 flex items-center gap-2"
          >
            <CheckCircle2 size={16} className="text-[#CE2029]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
           <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#CE2029] mb-1">
              <Target size={12} /> Site Manager
           </div>
           <h1 className="text-xl font-semibold tracking-tight text-slate-900">Service Categories</h1>
        </div>
        <button onClick={openAdd} className="bg-[#CE2029] text-white px-4 py-2 rounded-lg font-semibold text-[10px] uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
           <Plus size={14} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {categories.map((cat, index) => (
           <motion.div 
            key={cat.id} 
            layout 
            className="group relative h-[220px] bg-[#CE2029] rounded-2xl overflow-hidden shadow-sm"
           >
              <img src={cat.image} alt={cat.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5">
                 <div className="relative">
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1 block">Category {index + 1}</span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">{cat.title}</h3>
                 </div>
              </div>

              {/* Action Toolbar */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                 <button onClick={() => openEdit(cat)} className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white flex items-center justify-center hover:bg-[#CE2029] transition-all">
                    <Edit3 size={14} />
                 </button>
                 <button onClick={() => deleteCat(cat.id)} className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-red-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={14} />
                 </button>
              </div>
           </motion.div>
         ))}
      </div>

      <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
         <h4 className="text-[10px] font-bold text-[#CE2029] mb-2 uppercase tracking-widest">Visual Guidelines</h4>
         <p className="max-w-2xl text-[11px] text-slate-400 font-medium leading-relaxed">Use high-quality imagery with consistent lighting. Landscape or square shots work best.</p>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowModal(false)}
               className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[120] overflow-hidden"
            >
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleImageUpload} 
                 accept="image/*" 
                 className="hidden" 
               />

               <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {editingId ? 'Edit Category' : 'New Category'}
                     </h3>
                     <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all">
                        <X size={18} />
                     </button>
                  </div>

                  <div className="space-y-5">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#CE2029] ml-1">Display Title</label>
                           <input 
                              type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                              placeholder="e.g. Volleyball"
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold text-slate-900 outline-none focus:border-[#CE2029] transition-all"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Path</label>
                           <input 
                              type="text" value={form.link} onChange={e => setForm({...form, link: e.target.value})}
                              placeholder="/book/1/1"
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold text-slate-900 outline-none focus:border-[#CE2029] transition-all"
                           />
                        </div>
                     </div>
                     
                     <div className="space-y-1.5">
                        <div className="flex justify-between items-end mb-1 px-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-[#6366f1]">Category Cover Image</label>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-slate-100 hover:bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
                          >
                            <Upload size={10} /> Gallery
                          </button>
                        </div>
                        
                        <div className="relative group">
                          <input 
                            type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                            placeholder="Paste image URL here..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-10 text-xs font-semibold text-slate-900 outline-none focus:border-[#CE2029] transition-all"
                          />
                          <Cloud size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                          
                          {form.image && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-slate-100 overflow-hidden bg-white">
                              <img src={form.image} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                     </div>
                  </div>

                  <div className="mt-10">
                     <button onClick={saveCat} className="w-full py-4 bg-[#CE2029] text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-[#CE2029]/10 hover:-translate-y-0.5 transition-all">
                        Update Category View
                     </button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FrontendCategoryMgmt;
