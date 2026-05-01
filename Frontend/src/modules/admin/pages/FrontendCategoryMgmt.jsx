import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, X, Eye, EyeOff, LayoutPanelTop, 
  Target, PenTool, Edit3, Trash2, Plus, Upload, Cloud, Loader2
} from 'lucide-react';
import { isApiConfigured } from '../../../services/config';
import { 
  listAdminCms, 
  createAdminCms, 
  updateAdminCms, 
  deleteAdminCms,
  uploadAdminImage
} from '../../../services/cmsApi';
import { fetchPublicArenas } from '../../../services/arenasApi';

const isMongoContentId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);

const CATEGORY_OPTIONS = [
  { label: 'All Arenas', value: '/arenas' },
  { label: 'Coaching Classes', value: '/coaching' },
  { label: 'Events & Tournaments', value: '/events' },
  { label: 'Membership Plans', value: '/membership' },
];

const emptyForm = () => ({
  title: '',
  image: '',
  link: '/arenas',
  isPublished: true,
});

const FrontendCategoryMgmt = () => {
  const [categories, setCategories] = useState([]);
  const [arenas, setArenas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [toast, setToast] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    if (!isApiConfigured()) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [cmsRes, arenasRes] = await Promise.all([
        listAdminCms('category'),
        fetchPublicArenas(),
      ]);
      setCategories(cmsRes.contents || []);
      setArenas(arenasRes.arenas || []);
    } catch (e) {
      setLoadError('Failed to load data. Ensure API is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isApiConfigured()) {
      showToast('API URL is not configured');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadAdminImage(file);
      setForm(prev => ({ ...prev, image: result.url }));
      showToast('Image uploaded to Cloudinary');
    } catch (e) {
      showToast(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({
      title: cat.title,
      image: cat.imageUrl || '',
      link: cat.linkUrl || '/arenas',
      isPublished: cat.isPublished !== false,
    });
    setShowModal(true);
  };

  const deleteCat = async (id) => {
    if (!isMongoContentId(id)) return;
    if (!window.confirm('Remove this category from the server?')) return;
    
    setSaving(true);
    try {
      await deleteAdminCms(id);
      showToast('Category removed');
      await loadData();
    } catch (e) {
      showToast(e.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  const saveCat = async () => {
    if (!form.title.trim()) {
      showToast('Title is required');
      return;
    }
    if (!isApiConfigured()) {
      showToast('API URL is not configured');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        kind: 'category',
        title: form.title.trim(),
        imageUrl: form.image,
        linkUrl: form.link,
        isPublished: Boolean(form.isPublished),
        sortOrder: 0,
      };

      if (editingId && isMongoContentId(editingId)) {
        await updateAdminCms(editingId, payload);
        showToast('Category updated');
      } else {
        await createAdminCms(payload);
        showToast('Category created');
      }
      await loadData();
      setShowModal(false);
    } catch (e) {
      showToast(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-4 py-4">
      {!isApiConfigured() && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs font-semibold px-4 py-3">
          Set <code className="rounded bg-white/80 px-1">VITE_API_URL</code> in Frontend <code className="rounded bg-white/80 px-1">.env</code> to enable dynamic categories.
        </div>
      )}

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800">
          {loadError}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] bg-white text-slate-900 px-5 py-2.5 rounded-xl shadow-2xl border border-[#CE2029]/20 flex items-center gap-2"
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
           <p className="text-[10px] text-slate-500 mt-1 font-medium italic">
             Dynamic categories managed on the server. Drafts are hidden from the user home.
           </p>
        </div>
        <button 
          onClick={openAdd} 
          disabled={!isApiConfigured() || loading}
          className="bg-[#CE2029] text-white px-4 py-2 rounded-lg font-semibold text-[10px] uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
        >
           <Plus size={14} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-xs font-bold uppercase tracking-widest">Loading Categories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, index) => (
            <motion.div 
              key={cat.id} 
              layout 
              className="group relative h-[220px] bg-[#0F172A] rounded-2xl overflow-hidden shadow-sm border border-slate-100"
            >
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                    <Cloud size={40} />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                  <div className="relative">
                      {!cat.isPublished && (
                        <span className="text-[7px] font-black uppercase tracking-widest bg-amber-500 text-white px-1.5 py-0.5 rounded mb-1.5 inline-block">Draft</span>
                      )}
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1 block">Category {index + 1}</span>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight leading-none">{cat.title}</h3>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                  <button onClick={() => openEdit(cat)} className="w-8 h-8 bg-white/90 backdrop-blur-md border border-white/20 rounded-lg text-slate-700 flex items-center justify-center hover:bg-[#CE2029] hover:text-white transition-all shadow-sm">
                      <Edit3 size={14} />
                  </button>
                  <button onClick={() => deleteCat(cat.id)} className="w-8 h-8 bg-white/90 backdrop-blur-md border border-white/20 rounded-lg text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                      <Trash2 size={14} />
                  </button>
                </div>
            </motion.div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-slate-100 rounded-3xl py-16 flex flex-col items-center justify-center text-slate-300">
              <Cloud size={48} className="mb-4 opacity-50" />
              <p className="text-xs font-bold uppercase tracking-[0.2em]">No categories found on the server</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
         <h4 className="text-[10px] font-bold text-[#CE2029] mb-2 uppercase tracking-widest">Visual Guidelines</h4>
         <p className="max-w-2xl text-[11px] text-slate-400 font-medium leading-relaxed">Use high-quality imagery with consistent lighting. Landscape or square shots work best. Images are hosted on Cloudinary for maximum performance.</p>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => !saving && setShowModal(false)}
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
                     <button onClick={() => !saving && setShowModal(false)} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all">
                        <X size={18} />
                     </button>
                  </div>

                  <div className="space-y-5">
                     <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={form.isPublished}
                          onChange={e => setForm({...form, isPublished: e.target.checked})}
                          className="rounded border-slate-300 text-[#CE2029] focus:ring-[#CE2029]"
                        />
                        <span className="text-[11px] font-bold text-slate-700">Show on Home Page (Published)</span>
                     </label>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#CE2029] ml-1">Display Title</label>
                           <input 
                              type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                              placeholder="e.g. Volleyball"
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold text-slate-900 outline-none focus:border-[#CE2029] transition-all"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Destination Link</label>
                           <select 
                             value={form.link} 
                             onChange={e => setForm({...form, link: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold text-slate-900 outline-none focus:border-[#CE2029] transition-all appearance-none"
                           >
                             <optgroup label="Global Selection">
                               {CATEGORY_OPTIONS.map(opt => (
                                 <option key={opt.value} value={opt.value}>{opt.label}</option>
                               ))}
                             </optgroup>
                             <optgroup label="Specific Arenas">
                               {arenas.map(arena => (
                                 <option key={arena.id} value={`/arenas/${arena.id}`}>{arena.name}</option>
                               ))}
                             </optgroup>
                           </select>
                        </div>
                     </div>
                     
                     <div className="space-y-1.5">
                        <div className="flex justify-between items-end mb-1 px-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-[#6366f1]">Category Cover Image</label>
                          <button 
                            disabled={uploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-slate-100 hover:bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {uploading ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                            {uploading ? 'Uploading...' : 'Upload Image'}
                          </button>
                        </div>
                        
                        <div className="relative group">
                          <input 
                            type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                            placeholder="Image URL from Cloudinary..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-10 text-xs font-semibold text-slate-900 outline-none focus:border-[#CE2029] transition-all"
                          />
                          <Cloud size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                          
                          {form.image && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-slate-100 overflow-hidden bg-white">
                              <img src={form.image} className="w-full h-full object-cover" alt="" />
                            </div>
                          )}
                        </div>
                     </div>
                  </div>

                  <div className="mt-10">
                     <button 
                       onClick={saveCat} 
                       disabled={saving || uploading}
                       className="w-full py-4 bg-[#CE2029] text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-[#CE2029]/10 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        {saving ? 'Syncing with Server...' : 'Update Category View'}
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
