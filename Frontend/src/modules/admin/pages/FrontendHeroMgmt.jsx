import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Trash2, Edit3, Image as ImageIcon,
  CheckCircle2, X, LayoutPanelTop,
  Upload, Cloud, Loader2,
} from 'lucide-react';
import { isApiConfigured } from '../../../services/config';
import {
  listAdminCms,
  createAdminCms,
  updateAdminCms,
  deleteAdminCms,
} from '../../../services/cmsApi';

const isMongoContentId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);

function mapRowToBanner(c) {
  return {
    id: c.id,
    title: c.title || '',
    subtitle: c.subtitle || '',
    buttonText: (c.body || '').trim() || 'Explore',
    image: c.imageUrl || '',
    link: c.linkUrl || '',
    isPublished: Boolean(c.isPublished),
    sortOrder: c.sortOrder ?? 0,
  };
}

const emptyForm = () => ({
  title: '',
  subtitle: '',
  buttonText: '',
  image: '',
  link: '',
  isPublished: true,
});

const FrontendHeroMgmt = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadBanners = useCallback(async () => {
    if (!isApiConfigured()) {
      setBanners([]);
      setLoadError(null);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listAdminCms('hero');
      setBanners((data.contents || []).map(mapRowToBanner));
    } catch {
      setBanners([]);
      setLoadError('Could not load hero banners. Check that the API is running, VITE_API_URL is set, and you are signed in as super admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      buttonText: banner.buttonText || '',
      image: banner.image || '',
      link: banner.link || '',
      isPublished: banner.isPublished !== false,
    });
    setShowModal(true);
  };

  const deleteBanner = async (id) => {
    if (!isApiConfigured()) {
      showToast('API URL is not configured');
      return;
    }
    if (!isMongoContentId(id)) return;
    if (!window.confirm('Remove this slide from the server?')) return;
    setSaving(true);
    try {
      await deleteAdminCms(id);
      showToast('Banner removed');
      await loadBanners();
    } catch (e) {
      showToast(e.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  const saveBanner = async () => {
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
        kind: 'hero',
        title: form.title.trim(),
        subtitle: form.subtitle || '',
        body: form.buttonText || '',
        imageUrl: form.image || '',
        linkUrl: form.link || '',
        isPublished: Boolean(form.isPublished),
        sortOrder: 0,
      };
      if (editingId && isMongoContentId(editingId)) {
        await updateAdminCms(editingId, payload);
        showToast('Banner updated');
      } else {
        await createAdminCms(payload);
        showToast(form.isPublished ? 'Banner saved — it will show on the user home' : 'Saved as draft (not on home until published)');
      }
      await loadBanners();
      setShowModal(false);
    } catch (e) {
      showToast(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-4 py-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-white text-[#36454F] px-5 py-2.5 rounded-xl shadow-2xl border border-[#CE2029]/20 flex items-center gap-2.5 max-w-md"
          >
            <CheckCircle2 size={16} className="text-[#CE2029] shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isApiConfigured() && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
          Set <code className="rounded bg-white/80 px-1">VITE_API_URL</code> in Frontend <code className="rounded bg-white/80 px-1">.env</code> and restart the dev server. Hero slides are stored on the API; the user home reads published items from{' '}
          <code className="rounded bg-white/80 px-1">/api/public/cms?kind=hero</code>.
        </div>
      )}

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800">
          {loadError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#CE2029] mb-1">
            <LayoutPanelTop size={10} /> Site Manager
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#36454F]">Hero Banners</h1>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Slides sync to the API. Only items marked <span className="font-bold">published</span> appear on the user home.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          disabled={!isApiConfigured() || saving}
          className="bg-[#CE2029] text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-md shadow-[#CE2029]/10 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Plus size={14} /> Add Slide
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500 text-sm font-semibold">
          <Loader2 className="animate-spin" size={20} />
          Loading banners…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              layout
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-50">
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={40} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                {!banner.isPublished && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 text-[8px] font-black uppercase tracking-widest text-amber-200">
                    Draft
                  </span>
                )}

                <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    type="button"
                    onClick={() => openEdit(banner)}
                    disabled={saving}
                    className="p-1.5 bg-white/90 backdrop-blur-md rounded-lg text-slate-800 hover:bg-[#CE2029] hover:text-white transition-all shadow-sm"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBanner(banner.id)}
                    disabled={saving}
                    className="p-1.5 bg-white/90 backdrop-blur-md rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
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
                <span className="flex items-center gap-1 py-1 px-3 rounded-full bg-[#CE2029] text-white text-[8px] font-bold uppercase tracking-widest">
                  {banner.buttonText}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && isApiConfigured() && banners.length === 0 && (
        <p className="text-center text-sm text-slate-500 py-8 font-medium">
          No hero slides yet. Add one and keep <span className="font-bold text-[#36454F]">Show on home</span> checked so it appears for customers.
        </p>
      )}

      <div className="mt-8 p-6 bg-[#CE2029]/5 border border-[#CE2029]/10 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#CE2029] mb-2">Recommended Size</h4>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              16:9 images, min ~1200px wide. Prefer a hosted image URL; very large uploads as base64 may fail.
            </p>
          </div>
          <div>
            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#CE2029] mb-2">Content Strategy</h4>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">Keep titles short. High-contrast photos read best on mobile.</p>
          </div>
          <div>
            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#CE2029] mb-2">Action Links</h4>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">Use in-app paths like /events, /arenas, or /membership.</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[120] overflow-hidden max-h-[90vh] overflow-y-auto"
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
                  <button
                    type="button"
                    onClick={() => !saving && setShowModal(false)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <label className="flex items-center gap-2 mb-6 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="rounded border-slate-300 text-[#CE2029] focus:ring-[#CE2029]"
                  />
                  <span className="text-[11px] font-bold text-slate-700">Show on home (published)</span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#CE2029] ml-1">Main Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold text-[#36454F] outline-none focus:border-[#CE2029] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Sub-headline</label>
                    <input
                      type="text"
                      value={form.subtitle}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold text-[#36454F] outline-none focus:border-[#CE2029] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={form.buttonText}
                      onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold text-[#36454F] outline-none focus:border-[#CE2029] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#CE2029] ml-1">Destination URL</label>
                    <input
                      type="text"
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-semibold text-[#36454F] outline-none focus:border-[#CE2029] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <div className="flex justify-between items-end mb-1 px-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6366f1]">Background Image</label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-100 hover:bg-white hover:shadow-sm border border-slate-200 text-[#36454F] px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
                      >
                        <Upload size={10} /> Gallery
                      </button>
                    </div>

                    <div className="group relative">
                      <input
                        type="text"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        placeholder="Enter image URL or pick from gallery"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-10 text-xs font-semibold text-[#36454F] outline-none focus:border-[#CE2029] transition-colors"
                      />
                      <Cloud size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />

                      {form.image && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md border border-slate-100 overflow-hidden bg-white">
                          <img src={form.image} className="w-full h-full object-cover" alt="" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={saveBanner}
                    disabled={saving}
                    className="w-full py-4 bg-[#CE2029] text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-[#CE2029]/10 hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : null}
                    {saving ? 'Saving…' : 'Save to API'}
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
