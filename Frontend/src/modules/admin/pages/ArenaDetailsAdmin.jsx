import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, Phone, Mail, Globe,
  Save, CheckCircle2, ChevronRight, Image as ImageIcon,
  Plus, Minus, Trash2, Edit3, Star, BadgeDollarSign,
  Trophy, Navigation, Upload, Cloud, ArrowLeft,
  Wifi, Coffee, ShowerHead, ParkingCircle, Footprints, UploadCloud, Loader2,
  Clock, Wrench, Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { fetchPublicArenaById } from '../../../services/arenasApi';
import { normalizeDetailArena } from '../../../utils/arenaAdapter';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { 
  createAdminArena, 
  patchAdminArena, 
  getAdminArenaById, 
  deleteAdminCourt, 
  createAdminCourt,
  updateAdminCourt, 
  uploadAdminImage,
  listAdminArenaBlocks
} from '../../../services/adminOpsApi';

const newArenaForm = () => ({
  id: Date.now(),
  name: '',
  location: '',
  distance: '',
  rating: 0,
  reviews: 0,
  pricePerHour: 0,
  courtsCount: 0,
  image: '',
  category: '',
  amenities: [],
  description: '',
});

const ArenaDetailsAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const courtImageInputRef = useRef(null);
  const [isEditingCourts, setIsEditingCourts] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState(() => (id === 'new' ? newArenaForm() : { ...newArenaForm(), id }));
  const [courts, setCourts] = useState([]);
  const [activeTab, setActiveTab] = useState('general'); // general, courts, availability

  useEffect(() => {
    if (id === 'new') {
      setForm(newArenaForm());
      setCourts([]);
      setLoadError('');
      return undefined;
    }
    if (!isApiConfigured()) {
      setLoadError('Set VITE_API_URL to load this arena from the server.');
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getAdminArenaById(id);
        if (cancelled) return;
        const d = data.arena;
        setForm({
          id: d.id,
          name: d.name,
          location: d.location,
          distance: d.distance ?? '',
          rating: d.rating,
          reviews: d.reviewsCount || 0,
          pricePerHour: d.pricePerHour,
          courtsCount: d.courtsCount,
          image: d.imageUrl || '',
          category: d.category,
          amenities: Array.isArray(d.amenities) ? d.amenities : [],
          description: d.description || '',
        });
        
        // Fetch real courts
        if (data.courts) {
            setCourts(data.courts);
        }

        setLoadError('');
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Failed to load arena');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleAmenity = (name) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(name)
        ? prev.amenities.filter(a => a !== name)
        : [...prev.amenities, name]
    }));
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

  const handleSave = async () => {
    if (!form.name || !form.location) {
      showToast('Name and Location are required');
      return;
    }
    if (!isApiConfigured() || !getAuthToken()) {
      showToast('Configure API and sign in as admin');
      return;
    }
    const body = {
      name: form.name.trim(),
      location: form.location.trim(),
      category: form.category || 'Badminton',
      description: form.description || '',
      amenities: Array.isArray(form.amenities) ? form.amenities : [],
      pricePerHour: Number(form.pricePerHour) || 0,
      imageUrl: form.image || '',
      rating: Number(form.rating) || 0,
      reviewsCount: Number(form.reviews) || 0,
      distance: String(form.distance || ''),
      courtsCount: Number(form.courtsCount) || 0,
      isPublished: true,
    };
    try {
      if (id === 'new') {
        const res = await createAdminArena(body);
        showToast('Arena created');
        navigate(`/admin/arena/details/${res.arena.id}`);
      } else {
        await patchAdminArena(String(id), body);
        showToast('Arena updated');
      }
    } catch (e) {
      showToast(e.message || 'Save failed');
    }
  };

  const [courtToDelete, setCourtToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteCourt = async () => {
    if (!courtToDelete?.id) return;
    setDeleting(true);
    try {
      await deleteAdminCourt(courtToDelete.id);
      showToast('Court removed successfully');
      setCourtToDelete(null);
      // Trigger a full data refresh
      const data = await getAdminArenaById(id);
      setCourts(data.courts || []);
      setForm(prev => ({ ...prev, courtsCount: data.arena.courtsCount }));
    } catch (err) {
      showToast(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const [courtToEdit, setCourtToEdit] = useState(null);
  const [updatingCourt, setUpdatingCourt] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpdateCourt = async (e) => {
    e.preventDefault();
    if (!courtToEdit?.id) return;
    setUpdatingCourt(true);
    try {
      await updateAdminCourt(courtToEdit.id, {
        name: courtToEdit.name,
        type: courtToEdit.type,
        status: courtToEdit.status,
        pricePerHour: courtToEdit.pricePerHour,
        imageUrl: courtToEdit.imageUrl
      });
      showToast('Unit updated successfully');
      setCourtToEdit(null);
      // Refresh
      const data = await getAdminArenaById(id);
      setCourts(data.courts || []);
    } catch (err) {
      showToast(err.message || 'Update failed');
    } finally {
      setUpdatingCourt(false);
    }
  };

  const handleAddCourt = async () => {
    if (id === 'new') {
      showToast('Save the arena first before adding units');
      return;
    }
    setUpdatingCourt(true);
    try {
      await createAdminCourt(id, {
        name: `Court ${courts.length + 1}`,
        type: 'Synthetic',
        pricePerHour: form.pricePerHour || 0
      });
      showToast('Unit added successfully');
      // Refresh
      const data = await getAdminArenaById(id);
      setCourts(data.courts || []);
      setForm(prev => ({ ...prev, courtsCount: data.arena.courtsCount }));
    } catch (err) {
      showToast(err.message || 'Failed to add court');
    } finally {
      setUpdatingCourt(false);
    }
  };

  const handleCourtImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    setUploadProgress(10);
    
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
      const res = await uploadAdminImage(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
          setCourtToEdit(prev => ({ ...prev, imageUrl: res.url }));
          setUploadingImage(false);
          setUploadProgress(0);
      }, 300);
      showToast('Image uploaded successfully');
    } catch (err) {
      clearInterval(progressInterval);
      setUploadingImage(false);
      setUploadProgress(0);
      showToast(err.message || 'Upload failed');
    } finally {
      e.target.value = '';
    }
  };

  const amenityList = [
    { name: "Parking", icon: ParkingCircle },
    { name: "Shower", icon: ShowerHead },
    { name: "Locker", icon: CheckCircle2 },
    { name: "Cafe", icon: Coffee },
    { name: "Wifi", icon: Wifi },
    { name: "Water", icon: Coffee },
    { name: "Sports Shop", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto relative px-4 py-4 min-h-screen pb-20">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {courtToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCourtToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-[#CE2029]">
                  <Trash2 size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#36454F] uppercase tracking-tight">Decommission Unit?</h3>
                  <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest line-clamp-1">
                    Destroying "{courtToDelete.name}" registry
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setCourtToDelete(null)} 
                    className="flex-1 py-3 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleDeleteCourt} disabled={deleting}
                    className="flex-1 py-3 rounded-xl bg-[#CE2029] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#CE2029]/20 hover:brightness-110 transition-all disabled:opacity-50">
                    {deleting ? 'Decommissioning...' : 'Confirm Destroy'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Court Modal */}
      <AnimatePresence>
        {courtToEdit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCourtToEdit(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleUpdateCourt} className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <h3 className="text-sm font-black text-[#36454F] uppercase tracking-widest flex items-center gap-2">
                    <Edit3 size={16} className="text-[#CE2029]" /> Edit Unit Details
                  </h3>
                  <button type="button" onClick={() => setCourtToEdit(null)} className="text-slate-400 hover:text-[#36454F]">
                    <Plus size={20} className="rotate-45" />
                  </button>
                </div>

                <div className="space-y-4">
                   {/* Court Image Preview/Upload */}
                   <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit Showcase Image</label>
                     <div className="relative group aspect-video bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-inner">
                        {courtToEdit.imageUrl ? (
                          <img src={courtToEdit.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-1">
                             <ImageIcon size={24} />
                             <span className="text-[7px] font-bold uppercase tracking-widest">No Image Set</span>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/50 to-transparent translate-y-full group-hover:translate-y-0 transition-all flex gap-2 items-center">
                           <input 
                             type="text" value={courtToEdit.imageUrl || ''} 
                             onChange={e => setCourtToEdit({...courtToEdit, imageUrl: e.target.value})}
                             placeholder="Paste URL..."
                             className="flex-1 bg-white/90 backdrop-blur-md border-none rounded-lg py-1.5 px-3 text-[9px] font-bold text-slate-900 outline-none"
                           />
                           <button 
                             type="button" 
                             onClick={() => courtImageInputRef.current?.click()}
                             className="w-8 h-8 rounded-lg bg-[#CE2029] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                           >
                             <UploadCloud size={14} />
                           </button>
                           <input 
                             ref={courtImageInputRef}
                             type="file" accept="image/*" className="hidden"
                             onChange={handleCourtImageUpload}
                           />
                        </div>
                        
                        <AnimatePresence>
                           {uploadingImage && (
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
                                       <span className="text-[8px] font-black uppercase tracking-widest text-[#CE2029]">Analyzing Frame</span>
                                       <span className="text-[10px] font-black text-[#36454F]">{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <Loader2 size={16} className="text-[#CE2029] animate-spin mx-auto mt-2" />
                                 </div>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit Identity</label>
                      <input 
                        required type="text" value={courtToEdit.name} 
                        onChange={e => setCourtToEdit({...courtToEdit, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029] focus:bg-white"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit Surface/Type</label>
                      <select 
                        value={courtToEdit.type} 
                        onChange={e => setCourtToEdit({...courtToEdit, type: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029] focus:bg-white"
                      >
                         <option value="Wooden">Wooden</option>
                         <option value="Synthetic">Synthetic</option>
                         <option value="Turf">Turf</option>
                         <option value="Acrylic">Acrylic</option>
                         <option value="Sand">Sand</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[#CE2029] ml-1">Registry Status</label>
                      <select 
                        value={courtToEdit.status} 
                        onChange={e => setCourtToEdit({...courtToEdit, status: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029] focus:bg-white"
                      >
                         <option value="active">ACTIVE</option>
                         <option value="inactive">INACTIVE</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Base Price / hr (OMR)</label>
                      <input 
                        type="number" step="0.001" value={courtToEdit.pricePerHour ?? ''} 
                        onChange={e => setCourtToEdit({...courtToEdit, pricePerHour: e.target.value})}
                        placeholder="Leave empty for base rate"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029] focus:bg-white"
                      />
                   </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setCourtToEdit(null)} 
                    className="flex-1 py-3 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100">
                    Discard
                  </button>
                  <button type="submit" disabled={updatingCourt}
                    className="flex-1 py-3 rounded-xl bg-[#CE2029] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#CE2029]/20">
                    {updatingCourt ? 'Saving...' : 'Patch Registry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs font-bold px-4 py-3">
          {loadError}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] bg-white border border-[#CE2029]/20 text-[#36454F] px-5 py-2.5 rounded-none shadow-2xl flex items-center gap-2.5 min-w-[280px]"
          >
            <CheckCircle2 size={16} className="text-[#CE2029]" />
            <span className="text-[10px] font-black uppercase tracking-widest">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/arena/details')}
            className="w-10 h-10 rounded-none border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#CE2029] hover:bg-[#CE2029]/5 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
             <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#CE2029] mb-1 font-black">
                <Building2 size={12} /> Facility Registry
             </div>
             <h1 className="text-xl font-bold tracking-tight text-slate-900">
               {id === 'new' ? 'Initialize New Facility' : 'Manage Arena Profile'}
             </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={handleSave} className="flex-1 sm:flex-none bg-[#CE2029] text-white px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2">
             <Save size={14} /> Publish Changes
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-100 mb-6 py-2">
        {[
          { id: 'general', label: 'General Info', icon: Building2 },
          { id: 'courts', label: 'Physical Units', icon: Trophy },
          { id: 'availability', label: 'Availability Pulse', icon: Activity },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] transition-all relative ${
              activeTab === tab.id ? 'text-[#CE2029]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CE2029]" />
            )}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'general' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
             {/* Banner Upload */}
             <div className="bg-white rounded-none border border-slate-100 p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                 <ImageIcon size={16} className="text-[#CE2029]" /> Arena Graphics
               </h3>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="text-[10px] font-black uppercase tracking-widest text-[#CE2029] flex items-center gap-1.5 hover:underline"
               >
                 <Upload size={14} /> Upload from Gallery
               </button>
             </div>
             
             <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
             
             <div className="relative group aspect-[32/9] max-w-2xl mx-auto rounded-none overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
               {form.image ? (
                 <img src={form.image} className="w-full h-full object-cover" />
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3">
                   <Cloud size={40} />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Add Primary Showcase Image</p>
                 </div>
               )}
               <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <input 
                    type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                    placeholder="Enter image URL manually..."
                    className="w-full bg-white/90 backdrop-blur-md border border-white rounded-none py-3 px-4 text-xs font-semibold text-slate-900 outline-none shadow-xl"
                  />
               </div>
             </div>
           </div>

           {/* Core Details Grid */}
           <div className="bg-white rounded-none border border-slate-100 p-8 shadow-sm">
             <h3 className="text-sm font-bold text-slate-900 mb-8 border-b border-slate-50 pb-4">Essential Metadata</h3>
             
             <div className="space-y-6 text-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#CE2029] ml-1">Asset Identity</label>
                    <input 
                      type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="e.g. Phoenix Sports Park"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029] focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Physical Location</label>
                    <div className="relative">
                      <input 
                        type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                        placeholder="Noida, India"
                        className="w-full bg-slate-50 border border-slate-100 rounded-none py-3 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029] focus:bg-white transition-all shadow-inner"
                      />
                      <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Dist. Radius (km)</label>
                    <div className="relative">
                      <input 
                        type="text" value={form.distance} onChange={e => setForm({...form, distance: e.target.value})}
                        placeholder="1.5 km"
                        className="w-full bg-slate-50 border border-slate-100 rounded-none py-3 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029] focus:bg-white transition-all shadow-inner"
                      />
                      <Navigation size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Score Registry</label>
                    <div className="relative">
                      <input 
                        type="number" step="0.1" max="5" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none shadow-inner"
                      />
                      <Star size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 fill-amber-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Engage Count</label>
                    <input 
                      type="number" value={form.reviews} onChange={e => setForm({...form, reviews: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-xs font-bold text-slate-900 outline-none shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#CE2029] ml-1">Base Price (OMR)</label>
                    <div className="relative">
                      <input 
                        type="number" step="0.01" value={form.pricePerHour} onChange={e => setForm({...form, pricePerHour: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-[#CE2029] outline-none shadow-inner"
                      />
                      <BadgeDollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#CE2029]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Total Assets</label>
                    <input 
                      type="number" value={form.courtsCount} onChange={e => setForm({...form, courtsCount: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-xs font-bold text-slate-900 outline-none shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#CE2029] ml-1">Operational Taxonomy (Main Sport)</label>
                  <div className="relative">
                    <select 
                      value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-none py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029] focus:bg-white shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="Badminton">Badminton</option>
                      <option value="Table Tennis">Table Tennis</option>
                    </select>
                    <ChevronRight size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Narrative (Public Profile)</label>
                  <textarea 
                    rows="4" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Tell your professional story..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-none py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#CE2029] focus:bg-white resize-none shadow-inner"
                  />
                </div>
             </div>
           </div>

           <div className="bg-white rounded-none border border-slate-100 p-8 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-6">Amenity Checklist</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {amenityList.map(item => (
                  <button
                    key={item.name}
                    onClick={() => toggleAmenity(item.name)}
                    className={`flex items-center gap-3 p-3.5 rounded-none border transition-all ${
                      form.amenities.includes(item.name)
                        ? 'bg-[#CE2029]/5 border-[#CE2029]/20 text-[#CE2029]'
                        : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <item.icon size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
                  </button>
                ))}
              </div>
           </div>

           <div className="flex justify-end pt-4">
              <button 
                onClick={() => setActiveTab('courts')}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Next Step: Physical Units <ChevronRight size={16} />
              </button>
           </div>
          </motion.div>
        )}

        {activeTab === 'courts' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <div className="bg-[#CE2029]/[0.02] rounded-none p-8 border border-[#CE2029]/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CE2029]/5 rounded-none blur-3xl -translate-y-12 translate-x-12" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  {/* Reuse existing court management UI here */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CE2029] mb-2">Resource Availability</p>
                      <h4 className="text-xl font-black tracking-tight text-slate-900">{form.courtsCount} Courts Available for Play</h4>
                    </div>
                    <button
                      onClick={() => setIsEditingCourts(!isEditingCourts)}
                      className={`p-2 rounded-sm border transition-all ${
                        isEditingCourts
                        ? 'bg-[#CE2029] text-white border-[#CE2029] shadow-lg shadow-[#CE2029]/20'
                        : 'bg-white text-slate-400 border-slate-100 hover:text-[#CE2029] hover:border-[#CE2029]/30'
                      }`}
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                  {/* ... court grid ... */}
                    {/* High-Visibility Interactive Court Grid with Popout Controls */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-6 my-6">
                      {courts.map((court, i) => (
                        <motion.div 
                          key={court.id || i}
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          onClick={() => navigate(`/admin/arena/slots/${id}/${court.id || (i + 1)}`)}
                          className={`aspect-square bg-white border-2 shadow-sm flex flex-col items-center justify-center relative group/unit transition-all cursor-pointer hover:border-[#CE2029] hover:bg-[#CE2029]/[0.02] ${
                            court.status === 'inactive' ? 'border-slate-200 text-slate-300 opacity-60' : 'border-[#CE2029]/10 text-[#CE2029]'
                          }`}
                        >
                          <AnimatePresence>
                            {isEditingCourts && (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCourtToDelete(court);
                                }}
                                className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#CE2029] text-white flex items-center justify-center transition-all shadow-xl z-50 hover:scale-110 border-2 border-white"
                              >
                                <Minus size={14} strokeWidth={4} />
                              </motion.button>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {isEditingCourts && (
                               <motion.button
                                 initial={{ opacity: 0, scale: 0.5 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0.5 }}
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setCourtToEdit(court);
                                 }}
                                 className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center transition-all shadow-xl z-50 hover:scale-110 border-2 border-white"
                               >
                                 <Edit3 size={12} strokeWidth={3} />
                               </motion.button>
                            )}
                          </AnimatePresence>
                          
                          <div className="absolute inset-0 bg-gradient-to-tr from-[#CE2029]/[0.05] to-transparent opacity-0 group-hover/unit:opacity-100 transition-opacity rounded-sm" />
                          <Building2 size={22} className="mb-1.5 transition-transform group-hover/unit:scale-110" />
                          <div className="flex flex-col items-center text-center px-1">
                            <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-slate-900 leading-none mb-1">UNIT</span>
                            <span className="text-[10px] font-black leading-none break-words max-w-full">{court.name || (i + 1)}</span>
                          </div>
                        </motion.div>
                      ))}

                      {/* Add Unit Action Card - Visible only in Edit Mode */}
                      <AnimatePresence>
                        {isEditingCourts && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={handleAddCourt}
                            disabled={updatingCourt}
                            className={`aspect-square border-2 border-dashed border-[#CE2029]/30 rounded-sm flex flex-col items-center justify-center text-[#CE2029] transition-all group/add ${updatingCourt ? 'opacity-50 cursor-wait' : 'hover:bg-[#CE2029]/[0.02]'}`}
                          >
                             {updatingCourt ? (
                               <Loader2 size={24} className="animate-spin text-[#CE2029]" />
                             ) : (
                               <Plus size={24} className="scale-110" />
                             )}
                             <span className="text-[7px] font-black uppercase tracking-widest mt-1">Add Court</span>
                          </motion.button>
                        )}
                      </AnimatePresence>
                      {courts.length === 0 && (
                        <div className="col-span-full py-10 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-2">
                           <Cloud size={24} />
                           <p className="text-[10px] font-black uppercase tracking-widest">No Units Available</p>
                        </div>
                      )}
                    </div>
                  
                  <div className="space-y-4 pt-6 mt-auto">
                    <div className="flex items-center justify-between text-[11px] font-bold border-b border-[#CE2029]/10 pb-2">
                       <span className="text-[#CE2029]/70">Active Booking Units</span>
                       <span className="text-[#CE2029] font-black">{form.courtsCount} Units</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 mt-6 border-t border-[#CE2029]/10">
                    <button 
                      onClick={() => setActiveTab('general')}
                      className="bg-white text-[#CE2029] border border-[#CE2029]/20 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-[#CE2029]/5 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={16} /> Previous: General Info
                    </button>
                    <button 
                      onClick={() => setActiveTab('availability')}
                      className="bg-[#CE2029] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                      Next Step: Availability <ChevronRight size={16} />
                    </button>
                  </div>

                </div>
              </div>
          </motion.div>
        )}

        {activeTab === 'availability' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
             <AdminAvailabilityView arenaId={id} courts={courts} />

             <div className="flex justify-between items-center bg-white p-6 border border-slate-100 shadow-sm mt-2">
                <button 
                  onClick={() => setActiveTab('courts')}
                  className="bg-white text-slate-500 border border-slate-200 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 hover:text-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Previous: Physical Units
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} /> {id === 'new' ? 'Initialize New Facility' : 'Publish Changes'}
                </button>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

/* --- Read-Only Admin Availability View --- */
const AdminAvailabilityView = ({ arenaId, courts }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (arenaId === 'new') {
      setBlocks([]);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const res = await listAdminArenaBlocks(arenaId, format(selectedDate, 'yyyy-MM-dd'));
        setBlocks(res.blocks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [arenaId, selectedDate]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-4 bg-white border border-slate-100 p-6 rounded-none">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#CE2029] mb-4">Select Audit Date</h3>
        <input 
          type="date" 
          value={format(selectedDate, 'yyyy-MM-dd')} 
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-xs font-bold outline-none focus:border-[#CE2029]"
        />
        
        <div className="mt-8 space-y-4">
           <div className="p-4 bg-slate-50 border border-slate-100 border-l-4 border-l-[#CE2029]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Operational Pulse</p>
              <h4 className="text-lg font-black text-[#36454F]">{blocks.length} Active Blocks</h4>
              <p className="text-[9px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Scheduled maintenance and events</p>
           </div>
        </div>
      </div>

      <div className="xl:col-span-8 bg-white border border-slate-100 p-8 rounded-none min-h-[400px] relative">
         {loading && (
           <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
             <Loader2 className="animate-spin text-[#CE2029]" size={24} />
           </div>
         )}
         
         <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Live Block Registry</h3>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#CE2029] px-3 py-1 bg-[#CE2029]/5 rounded-full border border-[#CE2029]/10">Read Only Mode</span>
         </div>

         {blocks.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-slate-300">
             <Activity size={48} strokeWidth={1} />
             <p className="text-[10px] font-black uppercase tracking-widest mt-4">No active blocks for this cycle</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blocks.map(block => {
                const court = courts.find(c => c.id === block.courtId);
                return (
                  <div key={block.id} className="p-5 bg-slate-50 border border-slate-100 rounded-none group hover:border-[#CE2029]/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-10 h-10 bg-white border border-slate-100 flex items-center justify-center text-[#CE2029] shadow-sm">
                         <Wrench size={18} />
                       </div>
                       <div>
                         <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{court?.name || 'Unknown Unit'}</h5>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{block.reason}</span>
                       </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                       <div className="flex items-center gap-2 text-[#CE2029]">
                         <Clock size={12} />
                         <span className="text-[10px] font-black">{block.startTime} — {block.endTime}</span>
                       </div>
                    </div>
                  </div>
                )
              })}
           </div>
         )}
      </div>
    </div>
  );
};

export default ArenaDetailsAdmin;
