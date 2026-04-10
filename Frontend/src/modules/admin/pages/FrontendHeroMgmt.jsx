import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Trash2, Edit3, Image as ImageIcon, 
  ExternalLink, CheckCircle2, X, Eye, EyeOff, LayoutPanelTop,
  ArrowRight, Upload, Cloud
} from 'lucide-react';
import { HOME_CONFIG } from '../../../data/frontendConfig';

const FrontendHeroMgmt = () => {
  const [banners, setBanners] = useState(HOME_CONFIG.heroBanners);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', buttonText: '', image: '', link: '' });
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
    setForm({ title: '', subtitle: '', buttonText: '', image: '', link: '' });
    setShowModal(true);
  };

  const openEdit = (banner) => {
    setEditingId(banner.id);
    setForm({ ...banner });
    setShowModal(true);
  };

  const deleteBanner = (id) => {
    setBanners(prev => prev.filter(b => b.id !== id));
    showToast('Banner removed from slider');
  };

  const saveBanner = () => {
    if (editingId) {
      setBanners(prev => prev.map(b => b.id === editingId ? { ...form, id: editingId } : b));
      showToast('Banner updated');
    } else {
      setBanners(prev => [...prev, { ...form, id: Date.now() }]);
      showToast('New banner added to slider');
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-4 py-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-white text-[#36454F] px-5 py-2.5 rounded-xl shadow-2xl border border-[#CE2029]/20 flex items-center gap-2.5"
          >
            <CheckCircle2 size={16} className="text-[#CE2029]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
           <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#CE2029] mb-1">
              <LayoutPanelTop size={10} /> Site Manager
           </div>
           <h1 className="text-xl font-bold tracking-tight text-[#36454F]">Hero Banners</h1>
        </div>
        <button onClick={openAdd} className="bg-[#CE2029] text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-md shadow-[#CE2029]/10 hover:-translate-y-0.5 transition-all flex items-center gap-2">
           <Plus size={14} /> Add Slide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {banners.map((banner, index) => (
           <motion.div 
            key={banner.id} 
            layout 
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all"
           >
              <div className="aspect-video relative overflow-hidden bg-slate-50">
                 {banner.image ? (
                   <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-300">
                     <ImageIcon size={40} strokeWidth={1} />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                 
                 <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => openEdit(banner)} className="p-1.5 bg-white/90 backdrop-blur-md rounded-lg text-slate-800 hover:bg-[#CE2029] hover:text-white transition-all shadow-sm">
                       <Edit3 size={12} />
                    </button>
                    <button onClick={() => deleteBanner(banner.id)} className="p-1.5 bg-white/90 backdrop-blur-md rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                       <Trash2 size={12} />
                    </button>
                 </div>

                 <div className="absolute bottom-2.5 left-3.5 right-3.5">
                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/80 mb-0.5">{banner.subtitle}</p>
                    <h3 className="text-sm font-bold text-white leading-tight">{banner.title}</h3>
                 </div>
              </div>

              <div className="p-3 flex justify-between items-center bg-slate-50/30">
                 <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-[#CE2029] text-[9px] font-bold">
                       {index + 1}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Pos</span>
                 </div>
                 <button className="flex items-center gap-1 py-1 px-3 rounded-full bg-[#CE2029] text-white text-[8px] font-bold uppercase tracking-widest">
                    {banner.buttonText}
                 </button>
              </div>
           </motion.div>
         ))}
      </div>

      {/* Manual Explainer */}
      <div className="mt-8 p-6 bg-[#CE2029]/5 border border-[#CE2029]/10 rounded-2xl relative overflow-hidden">
         <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
               <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#CE2029] mb-2">Recommended Size</h4>
               <p className="text-[11px] text-slate-600 font-medium leading-relaxed">Images in 16:9 aspect ratio work best. Minimum width 1200px.</p>
            </div>
            <div>
               <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#CE2029] mb-2">Content Strategy</h4>
               <p className="text-[11px] text-slate-600 font-medium leading-relaxed">Keep titles short (max 30 chars). Use high-contrast images.</p>
            </div>
            <div>
               <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#CE2029] mb-2">Action Links</h4>
               <p className="text-[11px] text-slate-600 font-medium leading-relaxed">Use valid app paths like /events, /arenas/1, or /coaching.</p>
            </div>
         </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowModal(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
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
                     <h3 className="text-lg font-bold uppercase tracking-tight text-[#36454F]">
                        {editingId ? 'Edit Slide Details' : 'Design New Slide'}
                     </h3>
                     <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all">
                        <X size={18} />
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#CE2029] ml-1">Main Title</label>
                        <input 
                           type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold text-[#36454F] outline-none focus:border-[#CE2029] transition-colors"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Sub-headline</label>
                        <input 
                           type="text" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold text-[#36454F] outline-none focus:border-[#CE2029] transition-colors"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">CTA Button Text</label>
                        <input 
                           type="text" value={form.buttonText} onChange={e => setForm({...form, buttonText: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold text-[#36454F] outline-none focus:border-[#CE2029] transition-colors"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#CE2029] ml-1">Destination URL</label>
                        <input 
                           type="text" value={form.link} onChange={e => setForm({...form, link: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold text-[#36454F] outline-none focus:border-[#CE2029] transition-colors"
                        />
                     </div>
                     
                     {/* Image Field with Upload */}
                     <div className="space-y-1.5 md:col-span-2">
                        <div className="flex justify-between items-end mb-1 px-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-[#6366f1]">Background Image</label>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-slate-100 hover:bg-white hover:shadow-sm border border-slate-200 text-[#36454F] px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
                          >
                            <Upload size={10} /> Gallery
                          </button>
                        </div>
                        
                        <div className="group relative">
                          <input 
                            type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                            placeholder="Enter image URL or pick from gallery"
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-10 text-xs font-semibold text-[#36454F] outline-none focus:border-[#CE2029] transition-colors"
                          />
                          <Cloud size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                          
                          {form.image && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md border border-slate-100 overflow-hidden bg-white">
                              <img src={form.image} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                     </div>
                  </div>

                  <div className="mt-8">
                     <button onClick={saveBanner} className="w-full py-4 bg-[#CE2029] text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-[#CE2029]/10 hover:-translate-y-0.5 transition-all">
                        Apply Changes to Live Slider
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

export default FrontendHeroMgmt;
