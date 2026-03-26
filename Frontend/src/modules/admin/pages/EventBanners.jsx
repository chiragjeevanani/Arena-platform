import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Trash2, Edit3, Image as ImageIcon, 
  ExternalLink, CheckCircle2, X, Eye, EyeOff, LayoutPanelTop,
  Upload, Cloud
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const INITIAL_BANNERS = [
  { id: 1, title: 'Summer Championship 2024', imageUrl: 'https://images.unsplash.com/photo-1626225967045-944062402170?q=80&w=800&auto=format&fit=crop', link: '/events/1', active: true },
  { id: 2, title: 'Elite Coaching Workshop', imageUrl: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=800&auto=format&fit=crop', link: '/coaching', active: true },
  { id: 3, title: 'Table Tennis Open House', imageUrl: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=800&auto=format&fit=crop', link: '/events/3', active: false },
];

const EventBanners = () => {
  const { isDark } = useTheme();
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState({ title: '', imageUrl: '', link: '' });
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
        setForm(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggle = (id) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
    const banner = banners.find(b => b.id === id);
    showToast(`Banner "${banner.title}" ${banner.active ? 'deactivated' : 'activated'}`);
  };

  const handleDelete = (id) => {
    const banner = banners.find(b => b.id === id);
    setBanners(prev => prev.filter(b => b.id !== id));
    showToast(`Banner "${banner.title}" deleted`);
  };

  const openAdd = () => {
    setEditingBanner(null);
    setForm({ title: '', imageUrl: '', link: '' });
    setShowModal(true);
  };

  const openEdit = (banner) => {
    setEditingBanner(banner.id);
    setForm({ title: banner.title, imageUrl: banner.imageUrl, link: banner.link });
    setShowModal(true);
  };

  const saveBanner = () => {
    if (!form.title || !form.imageUrl) return;
    if (editingBanner) {
      setBanners(prev => prev.map(b => b.id === editingBanner ? { ...b, ...form } : b));
      showToast('Banner updated successfully');
    } else {
      setBanners(prev => [{ id: Date.now(), ...form, active: true }, ...prev]);
      showToast('New banner added');
    }
    setShowModal(false);
  };

  const filtered = banners.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto relative px-4 py-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-xl shadow-2xl border flex items-center gap-2.5 min-w-[280px] ${
              isDark ? 'bg-[#1a1d24] border-white/10 text-white' : 'bg-white border-[#eb483f]/20 text-[#1a2b3c]'
            }`}
          >
            <CheckCircle2 size={16} className="text-[#eb483f]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div>
           <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#eb483f] mb-1">
              <LayoutPanelTop size={11} /> Site Manager
           </div>
           <h1 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>Event Banners</h1>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#eb483f] text-white text-[10px] font-semibold uppercase tracking-widest shadow-md shadow-[#eb483f]/10 hover:brightness-110 transition-all">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative group w-full">
          <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/20' : 'text-slate-400'}`} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by title..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border outline-none transition-all ${
              isDark ? 'bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-[#eb483f]' : 'bg-white border-slate-200 text-[#1a2b3c] focus:border-[#eb483f]'
            }`} 
          />
        </div>
        <div className={`px-4 py-2 rounded-xl border text-[10px] font-semibold tracking-wide ${isDark ? 'border-white/5 text-white/40 bg-white/5' : 'border-slate-100 text-slate-400 bg-slate-50'}`}>
          Total: <span className={isDark ? 'text-white' : 'text-[#1a2b3c]'}>{banners.length}</span>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((banner) => (
            <motion.div
              layout
              key={banner.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group overflow-hidden rounded-2xl border transition-all ${
                isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              {/* Image Preview */}
              <div className="aspect-[2/1] relative overflow-hidden bg-slate-100">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title} 
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!banner.active && 'grayscale contrast-75 opacity-60'}`} 
                />
                {!banner.active && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="px-3 py-1 rounded-lg bg-black/60 text-white text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm">Inactive</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEdit(banner)}
                    className="p-1.5 rounded-lg bg-white/90 text-[#1a2b3c] shadow-lg hover:bg-[#eb483f] hover:text-white transition-all transform hover:scale-110"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="p-1.5 rounded-lg bg-white/90 text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className={`text-sm font-semibold tracking-tight leading-tight transition-colors ${!banner.active ? 'text-slate-400' : isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>
                    {banner.title}
                  </h3>
                  <button onClick={() => handleToggle(banner.id)}>
                    {banner.active ? (
                      <Eye size={18} className="text-[#eb483f]" />
                    ) : (
                      <EyeOff size={18} className={isDark ? 'text-white/20' : 'text-slate-300'} />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 opacity-50">
                  <ExternalLink size={10} />
                  <span className="text-[10px] truncate font-medium">{banner.link}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[120] rounded-3xl border shadow-2xl overflow-hidden ${
                isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'
              }`}
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
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#eb483f]/10 flex items-center justify-center">
                      <ImageIcon size={18} className="text-[#eb483f]" />
                    </div>
                    <h3 className={`font-bold text-sm uppercase tracking-tight ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>
                      {editingBanner ? 'Edit Banner Details' : 'Add New Banner'}
                    </h3>
                  </div>
                  <button onClick={() => setShowModal(false)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5 text-white/30' : 'hover:bg-slate-100 text-slate-400'}`}>
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#eb483f] block mb-1.5 ml-1">Banner Title</label>
                    <input 
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Monthly Championship"
                      className={`w-full px-4 py-3 rounded-xl text-xs border outline-none transition-all font-semibold ${
                        isDark ? 'bg-white/5 border-white/15 text-white focus:border-[#eb483f]' : 'bg-slate-50 border-slate-200 focus:border-[#eb483f]'
                      }`}
                    />
                  </div>

                  <div>
                     <div className="flex justify-between items-end mb-1.5 px-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-[#6366f1]">Promotion Artwork</label>
                        <button 
                           onClick={() => fileInputRef.current?.click()}
                           className={`bg-slate-100 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${isDark ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-slate-100 hover:bg-white border border-slate-200 text-slate-700'}`}
                        >
                           <Upload size={10} /> Gallery
                        </button>
                     </div>
                     
                     <div className="relative group">
                        <input 
                           type="text" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})}
                           placeholder="Enter image URL or pick from gallery"
                           className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs border outline-none transition-all font-semibold ${
                             isDark ? 'bg-white/5 border-white/15 text-white focus:border-[#eb483f]' : 'bg-slate-50 border-slate-200 focus:border-[#eb483f]'
                           }`}
                        />
                        <Cloud size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                        
                        {form.imageUrl && (
                           <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-slate-100 overflow-hidden bg-white">
                              <img src={form.imageUrl} className="w-full h-full object-cover" />
                           </div>
                        )}
                     </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Target Link (Path)</label>
                    <input 
                      value={form.link}
                      onChange={e => setForm({ ...form, link: e.target.value })}
                      placeholder="/events/123 or /coaching"
                      className={`w-full px-4 py-3 rounded-xl text-xs border outline-none transition-all font-semibold ${
                        isDark ? 'bg-white/5 border-white/15 text-white focus:border-[#eb483f]' : 'bg-slate-50 border-slate-200 focus:border-[#eb483f]'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setShowModal(false)} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${isDark ? 'border-white/10 text-white/40 hover:bg-white/5' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>Cancel</button>
                  <button 
                    onClick={saveBanner}
                    disabled={!form.title || !form.imageUrl}
                    className="flex-1 py-3 rounded-xl bg-[#eb483f] text-white text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#eb483f]/20"
                  >
                    {editingBanner ? 'Update Banner' : 'Publish Banner'}
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

export default EventBanners;
