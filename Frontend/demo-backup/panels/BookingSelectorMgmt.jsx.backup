import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Trash2, Edit3, Image as ImageIcon, 
  CheckCircle2, X, Eye, EyeOff, LayoutGrid, Palette
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const INITIAL_CATEGORIES = [
  { 
    id: 1, 
    title: 'BADMINTON ARENA', 
    subtitle: 'CONNECT. CELEBRATE. PLAY', 
    imageUrl: 'https://images.unsplash.com/photo-1626225967045-944062402170?q=80&w=800&auto=format&fit=crop',
    active: true,
    accentColor: '#CE2029'
  },
  { 
    id: 2, 
    title: 'TABLE TENNIS ARENA', 
    subtitle: 'CONNECT. CELEBRATE. PLAY', 
    imageUrl: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=800&auto=format&fit=crop',
    active: true,
    accentColor: '#36454F'
  },
];

const BookingSelectorMgmt = () => {
  const { isDark } = useTheme();
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', imageUrl: '', accentColor: '#CE2029' });
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = (id) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    const cat = categories.find(c => c.id === id);
    showToast(`"${cat.title}" ${cat.active ? 'hidden' : 'visible'} to users`);
  };

  const handleDelete = (id) => {
    const cat = categories.find(c => c.id === id);
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast(`"${cat.title}" category deleted`);
  };

  const openAdd = () => {
    setEditingCategory(null);
    setForm({ title: '', subtitle: 'CONNECT. CELEBRATE. PLAY', imageUrl: '', accentColor: '#CE2029' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingCategory(cat.id);
    setForm({ title: cat.title, subtitle: cat.subtitle, imageUrl: cat.imageUrl, accentColor: cat.accentColor });
    setShowModal(true);
  };

  const saveCategory = () => {
    if (!form.title || !form.imageUrl) return;
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory ? { ...c, ...form } : c));
      showToast('Category updated successfully');
    } else {
      setCategories(prev => [...prev, { id: Date.now(), ...form, active: true }]);
      showToast('New booking category added');
    }
    setShowModal(false);
  };

  const filtered = categories.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#36454F] text-white px-5 py-2.5 rounded-xl shadow-2xl border border-white/10 flex items-center gap-2.5 min-w-[280px]"
          >
            <CheckCircle2 size={16} className="text-[#CE2029]" />
            <span className="text-[11px] font-bold uppercase tracking-widest">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl font-semibold tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
            <LayoutGrid className="text-[#CE2029]" size={22} /> Booking Selection
          </h2>
          <p className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Manage categories on the "What do you want to book?" screen.
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#CE2029] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#CE2029]/20 hover:bg-[#36454F] transition-all">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative group w-full">
          <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/20' : 'text-slate-400'}`} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search categories..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border outline-none transition-all ${
              isDark ? 'bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-[#CE2029]' : 'bg-white border-slate-200 text-[#36454F] focus:border-[#CE2029]'
            }`} 
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((cat) => (
            <motion.div
              layout
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group relative overflow-hidden rounded-[24px] border transition-all ${
                isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              {/* Preview Card (Mirroring User App style) */}
              <div className="p-4">
                <div className="relative aspect-[16/9] rounded-[20px] overflow-hidden shadow-sm">
                  <img src={cat.imageUrl} alt={cat.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/60 to-transparent flex flex-col justify-center px-8">
                    <h3 className="text-white font-black text-2xl tracking-tighter leading-none max-w-[180px] mb-1">{cat.title}</h3>
                    <p className="text-white/80 font-bold text-[10px] tracking-widest uppercase">{cat.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Management Footer */}
              <div className={`px-6 py-4 flex items-center justify-between border-t ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-50 bg-slate-50/50'}`}>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleToggle(cat.id)}
                    className="flex items-center gap-2 transition-opacity"
                  >
                    {cat.active ? (
                      <Eye size={16} className="text-[#CE2029]" />
                    ) : (
                      <EyeOff size={16} className="text-slate-400" />
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${cat.active ? 'text-[#CE2029]' : 'text-slate-400'}`}>
                      {cat.active ? 'Visible' : 'Hidden'}
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: cat.accentColor }} />
                    <span className="text-[10px] font-medium opacity-40 uppercase tracking-widest">Theme</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openEdit(cat)}
                    className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-[#CE2029] hover:text-[#CE2029]'}`}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-red-400/60 hover:text-red-400' : 'bg-white border-slate-200 text-red-400/60 hover:text-red-400'}`}
                  >
                    <Trash2 size={15} />
                  </button>
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[120] rounded-[24px] border shadow-2xl overflow-hidden ${
                isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#CE2029]/10 flex items-center justify-center">
                      <ImageIcon size={20} className="text-[#CE2029]" />
                    </div>
                    <h3 className={`font-bold text-base uppercase tracking-tight ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
                      {editingCategory ? 'Edit Category' : 'New Category'}
                    </h3>
                  </div>
                  <button onClick={() => setShowModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5 text-white/30' : 'hover:bg-slate-100 text-slate-400'}`}>
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#CE2029] block mb-2">Display Title</label>
                    <input 
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. BADMINTON ARENA"
                      className={`w-full px-4 py-3 rounded-2xl text-sm border outline-none transition-all font-bold ${
                        isDark ? 'bg-white/5 border-white/15 text-white focus:border-[#CE2029]' : 'bg-slate-50 border-slate-200 focus:border-[#CE2029]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#CE2029] block mb-2">Subtitle / Slogan</label>
                    <input 
                      value={form.subtitle}
                      onChange={e => setForm({ ...form, subtitle: e.target.value })}
                      className={`w-full px-4 py-3 rounded-2xl text-sm border outline-none transition-all font-bold ${
                        isDark ? 'bg-white/5 border-white/15 text-white focus:border-[#CE2029]' : 'bg-slate-50 border-slate-200 focus:border-[#CE2029]'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#CE2029] block mb-2">Image URL</label>
                      <input 
                        value={form.imageUrl}
                        onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className={`w-full px-4 py-3 rounded-2xl text-sm border outline-none transition-all font-bold ${
                          isDark ? 'bg-white/5 border-white/15 text-white focus:border-[#CE2029]' : 'bg-slate-50 border-slate-200 focus:border-[#CE2029]'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#CE2029] block mb-2 flex items-center gap-2">
                        <Palette size={12} /> Color
                      </label>
                      <input 
                        type="color"
                        value={form.accentColor}
                        onChange={e => setForm({ ...form, accentColor: e.target.value })}
                        className={`w-full h-11 px-1 rounded-2xl border cursor-pointer ${
                          isDark ? 'bg-white/5 border-white/15' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setShowModal(false)} className={`flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all ${isDark ? 'border-white/10 text-white/40 hover:bg-white/5' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>Cancel</button>
                  <button 
                    onClick={saveCategory}
                    disabled={!form.title || !form.imageUrl}
                    className="flex-1 py-3 rounded-2xl bg-[#CE2029] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#36454F] transition-all disabled:opacity-50 shadow-lg shadow-[#CE2029]/20 font-black"
                  >
                    {editingCategory ? 'Update' : 'Create'}
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

export default BookingSelectorMgmt;
