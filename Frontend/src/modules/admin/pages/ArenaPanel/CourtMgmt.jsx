import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Plus, Edit2, Trash2, X, CheckCircle2, 
  XCircle, ArrowRight, Layers, Settings, Activity,
  ShieldCheck, Share2, MoreHorizontal, Layout, Grid3X3, Camera, ImagePlus,
  Loader2
} from 'lucide-react';
import CourtImg1 from '../../../../assets/Courts/court1.jpeg';
import CourtImg2 from '../../../../assets/Courts/court2.jpeg';
import CourtImg3 from '../../../../assets/Courts/court3.jpeg';
import { useArenaPanel } from '../../context/ArenaPanelContext';
import { createMyCourt, patchMyCourt, deleteMyCourt, uploadArenaImage } from '../../../../services/arenaStaffApi';
import { showToast } from '../../../../utils/toast';

const COURT_IMAGES = [CourtImg1, CourtImg2, CourtImg3];

const emptyForm = { name: '', type: 'Wooden', status: 'active', image: null };

const CourtMgmt = () => {
  const { courts, loading, refetch } = useArenaPanel();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(10);
    
    // Simulate real progress since fetch doesn't support easy progress events
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
           clearInterval(progressInterval);
           return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const res = await uploadArenaImage(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
         setForm(p => ({ ...p, image: res.imageUrl || res.url }));
         setUploading(false);
         setUploadProgress(0);
      }, 300);
      showToast('Court image uploaded', 'success');
    } catch (err) {
      clearInterval(progressInterval);
      setUploading(false);
      setUploadProgress(0);
      showToast('Image upload failed', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { 
    setEditId(c.id); 
    setForm({ 
      name: c.name, 
      type: c.type || 'Wooden', 
      status: c.status || 'active', 
      image: c.imageUrl || null 
    }); 
    setShowModal(true); 
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        status: form.status,
        imageUrl: form.image
      };

      if (editId) {
        await patchMyCourt(editId, payload);
        showToast('Court updated', 'success');
      } else {
        await createMyCourt(payload);
        showToast('Court registered', 'success');
      }
      await refetch();
      setShowModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save court', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMyCourt(deleteId);
      await refetch();
      showToast('Court removed', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete court', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const activeCourtsCount = courts.filter(c => c.status === 'active').length;

  if (loading && courts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 text-[#CE2029] animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing Nodes...</p>
      </div>
    );
  }

  const { error } = useArenaPanel();
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center p-6">
        <XCircle className="w-12 h-12 text-[#CE2029]" />
        <h3 className="text-lg font-black text-[#36454F] uppercase">Cluster Sync Failed</h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest max-w-sm">{error}</p>
        <button onClick={() => refetch()} className="mt-4 px-6 py-2 bg-[#36454F] text-white text-[10px] font-black uppercase tracking-widest rounded-sm">Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="font-sans text-[#36454F] max-w-[1600px] mx-auto tracking-tight">
      <div className="mx-auto space-y-4 py-4">
        {/* Professional Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pb-3 border-b border-slate-200 bg-white p-3 shadow-md rounded-sm">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-sm bg-[#36454F] flex items-center justify-center text-white shadow-sm">
                 <Target size={20} strokeWidth={2.5} />
              </div>
              <div>
                 <h2 className="text-lg font-black text-[#36454F] uppercase leading-none">Court Management</h2>
                 <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Cluster: {courts.length} Nodes Registered
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="flex bg-slate-50 p-1 border border-slate-200 rounded-sm">
                 {[
                   { label: 'Active', value: activeCourtsCount, color: 'text-green-500' },
                   { label: 'Inactive', value: courts.length - activeCourtsCount, color: 'text-slate-500' }
                 ].map((s, i) => (
                    <div key={i} className="px-3 py-0.5 flex flex-col border-r last:border-0 border-slate-200 min-w-[45px] text-center">
                       <span className="text-[6.5px] font-black uppercase text-slate-500 tracking-widest">{s.label}</span>
                       <span className={`text-[12px] font-bold ${s.color}`}>{s.value.toString().padStart(2, '0')}</span>
                    </div>
                 ))}
              </div>
              <button 
                 onClick={openAdd}
                 className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm bg-[#CE2029] text-white hover:bg-[#d43d35] transition-all text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#CE2029]/20 active:translate-y-0.5"
              >
                 <Plus size={14} strokeWidth={3} /> Register Court
              </button>
           </div>
        </div>

        {/* Compact Grid */}
        {courts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-sm">
            <Target size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Node Cluster Offline</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {courts.map((court, idx) => (
                <motion.div key={court.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="group bg-white rounded-sm border border-slate-200 p-4 transition-all shadow-sm flex flex-col justify-between hover:border-slate-400 hover:shadow-lg relative overflow-hidden">
                  
                  {/* Visual Accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#CE2029]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Top: Metadata & Reference */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                     <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-sm">
                        <span className="text-[7.5px] font-black text-[#36454F] uppercase tracking-[0.2em]">NODE-0{idx + 1}</span>
                     </div>
                     <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border transition-colors ${
                        court.type === 'Wooden' ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-blue-50/50 text-blue-400 border-blue-100'
                     }`}>
                        {court.type || 'Wooden'}
                     </span>
                  </div>

                  {/* Center: Court Image */}
                  <div className="flex flex-col items-center justify-center space-y-3 relative z-10">
                      <div className="w-full h-32 rounded-[4px] overflow-hidden border border-slate-100 shadow-sm relative group">
                         <img 
                           src={court.imageUrl || COURT_IMAGES[idx % COURT_IMAGES.length]} 
                           alt={court.name} 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                         />
                         <div className="absolute inset-0 bg-black/10 transition-opacity" />
                      </div>
                     <div className="w-full">
                        <h3 className="text-[13px] font-bold text-[#36454F] uppercase tracking-wide text-center truncate">{court.name}</h3>
                        <div className="mt-1 flex justify-center">
                           <div className={`flex items-center gap-1 px-2 py-0.5 rounded-sm text-[7.5px] font-bold uppercase tracking-widest ${court.status === 'active' ? 'text-green-500 bg-green-50' : 'text-red-400 bg-red-50'}`}>
                              <div className={`w-1 h-1 rounded-full ${court.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                              {court.status === 'active' ? 'Operational' : 'Standby'}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Bottom: Fast Action Menu */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between relative z-10">
                     <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">REF: {court.id.slice(-6)}</span>
                     <div className="flex gap-1">
                        <button onClick={() => openEdit(court)} className="w-8 h-8 flex items-center justify-center rounded-sm bg-slate-50 text-slate-500 hover:text-[#36454F] hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all">
                           <Edit2 size={12} />
                        </button>
                        <button onClick={() => setDeleteId(court.id)} className="w-8 h-8 flex items-center justify-center rounded-sm bg-slate-50 text-slate-500 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all">
                           <Trash2 size={12} />
                        </button>
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="absolute inset-0 bg-[#36454F]/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-sm rounded-[4px] bg-white border border-white/10 shadow-2xl overflow-hidden font-sans">
              
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white text-[#36454F]">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight">{editId ? 'Modify Resource' : 'Register Resource'}</h3>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600 mt-1">
                    Arena Resource Infrastructure
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-[#36454F] transition-colors"><X size={18} /></button>
              </div>

              <div className="p-6 space-y-5 bg-[#F9FAFB]/30">
                {/* Court Image Upload */}
                <div className="space-y-1.5">
                  <label className="text-[8.5px] font-black uppercase tracking-widest text-[#36454F] block">Resource Icon (Image)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-36 rounded-sm border-2 border-dashed border-slate-200 hover:border-[#CE2029] bg-slate-50 hover:bg-red-50/30 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group"
                  >
                    {form.image ? (
                      <>
                        <img src={form.image} alt="Court preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex items-center gap-2 text-white">
                            <Camera size={16} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Change</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <ImagePlus size={24} className="text-slate-300 mb-2" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Initialize Visual</span>
                      </>
                    )}

                    {/* Progressive Loader Overlay */}
                    <AnimatePresence>
                       {uploading && (
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-20"
                          >
                             <div className="w-full max-w-[200px] space-y-3 text-center">
                                <div className="relative w-full h-1 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                   <motion.div 
                                      className="absolute inset-y-0 left-0 bg-[#CE2029]"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${uploadProgress}%` }}
                                      transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                                   />
                                </div>
                                <div className="flex items-center justify-between">
                                   <span className="text-[8px] font-black uppercase tracking-widest text-[#CE2029]">Uploading Metadata</span>
                                   <span className="text-[10px] font-black text-[#36454F]">{Math.round(uploadProgress)}%</span>
                                </div>
                                <Loader2 size={16} className="text-[#CE2029] animate-spin mx-auto mt-2" />
                             </div>
                          </motion.div>
                       )}
                    </AnimatePresence>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8.5px] font-black uppercase tracking-widest text-[#36454F] block">Designation (Name)</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Court Alpha" className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none focus:border-[#CE2029] uppercase tracking-widest transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[8.5px] font-black uppercase tracking-widest text-[#36454F] block">Material Typology</label>
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full h-10 px-2 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none uppercase cursor-pointer">
                      <option value="Wooden">Wooden</option>
                      <option value="Turf">Turf</option>
                      <option value="Acrylic">Acrylic</option>
                      <option value="Clay">Clay</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8.5px] font-black uppercase tracking-widest text-[#36454F] block">Registry Status</label>
                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full h-10 px-2 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none uppercase cursor-pointer">
                      <option value="active">Active</option>
                      <option value="inactive">Standby</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button onClick={save} disabled={saving || !form.name.trim()}
                    className="w-full h-12 rounded-sm bg-[#36454F] text-white text-[10px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md">
                    {saving && <Loader2 size={12} className="animate-spin" />}
                    {editId ? 'Commit Modifications' : 'Initialize Node'} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)} className="absolute inset-0 bg-[#36454F]/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-sm border border-slate-200 shadow-2xl p-6 lg:p-8 max-w-sm w-full text-center">
              <div className="w-12 h-12 rounded-sm bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-[#36454F] uppercase tracking-tight mb-2">Purge Resource?</h3>
              <p className="text-[10px] font-medium text-slate-700 leading-normal mb-8">Permanently remove this resource from the cluster core. This action is IRREVERSIBLE.</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteId(null)} className="flex-1 h-10 rounded-sm border border-slate-200 text-slate-500 font-bold text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all">Abort</button>
                <button onClick={confirmDelete} className="flex-1 h-10 rounded-sm bg-red-500 text-white font-bold text-[9px] uppercase tracking-widest hover:bg-red-600 transition-all">Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourtMgmt;
