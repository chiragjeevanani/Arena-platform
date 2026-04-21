import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, MapPin, Phone, Clock, Image, Upload, X, Plus, Check,
  Eye, Building2, Wifi, Car, Coffee, Dumbbell, ShowerHead, Wind,
  Loader2
} from 'lucide-react';
import { useArenaPanel } from '../../context/ArenaPanelContext';
import { patchMyArena, uploadArenaImage } from '../../../../services/arenaStaffApi';
import { showToast } from '../../../../utils/toast';

const AMENITY_OPTIONS = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'cafe', label: 'Cafeteria', icon: Coffee },
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'shower', label: 'Shower Rooms', icon: ShowerHead },
  { id: 'ac', label: 'Air Conditioning', icon: Wind },
  { id: 'locker', label: 'Lockers', icon: Building2 },
  { id: 'coaching', label: 'Coaching Area', icon: Home },
];

const ArenaDetails = () => {
  const { arena: contextArena, loading: contextLoading, refetch } = useArenaPanel();
  const [isEditing, setIsEditing] = useState(false);
  const [arena, setArena] = useState(null);
  const [amenityOptions, setAmenityOptions] = useState(AMENITY_OPTIONS);
  const [showAddAmenity, setShowAddAmenity] = useState(false);
  const [newAmenityLabel, setNewAmenityLabel] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const galleryRef = useRef();
  const bannerRef = useRef();

  useEffect(() => {
    if (contextArena) {
      setArena({
        ...contextArena,
        address: contextArena.location?.split(',')[0] || '',
        city: contextArena.location?.split(',')[1]?.trim() || '',
        contact: contextArena.contact || '',
        openTime: contextArena.openTime || '06:00',
        closeTime: contextArena.closeTime || '22:00',
        amenities: contextArena.amenities || [],
        banner: contextArena.imageUrl || null,
        images: contextArena.images || [], // If backend supports secondary images later
      });
    }
  }, [contextArena]);

  const handleAddAmenity = () => {
    if (!newAmenityLabel.trim()) return;
    const newId = newAmenityLabel.toLowerCase().replace(/\s+/g, '-');
    if (amenityOptions.some(a => a.id === newId)) return;
    
    const newOpt = { id: newId, label: newAmenityLabel, icon: Building2 };
    setAmenityOptions([...amenityOptions, newOpt]);
    setNewAmenityLabel('');
    setShowAddAmenity(false);
  };

  const toggleAmenity = (id) => {
    if (!isEditing) return;
    setArena(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id],
    }));
  };

  const handleBannerUpload = async (e) => {
    if (!isEditing) return;
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadArenaImage(file);
      const url = res.imageUrl || res.url;
      setArena(prev => ({ ...prev, banner: url }));
      showToast('Banner uploaded successfully', 'success');
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: arena.name,
        location: `${arena.address}, ${arena.city}`,
        contact: arena.contact,
        openTime: arena.openTime,
        closeTime: arena.closeTime,
        amenities: arena.amenities,
        imageUrl: arena.banner,
        description: arena.description
      };
      
      await patchMyArena(payload);
      await refetch();
      setSaved(true);
      setIsEditing(false);
      showToast('Arena details updated', 'success');
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Save failed:', err);
      showToast(err.message || 'Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (contextLoading && !arena) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 text-[#CE2029] animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Arena Details...</p>
      </div>
    );
  }

  if (!arena) return null;

  const field = (label, icon, children) => (
    <div className="group">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
        {icon} {label}
      </label>
      {children}
    </div>
  );

  const inputCls = (extra = "") => `w-full py-3.5 px-4 rounded-xl border transition-all text-[13px] font-bold outline-none ${
    isEditing 
      ? `bg-slate-50 border-slate-200 text-[#36454F] focus:border-[#CE2029] focus:bg-white ${extra}` 
      : "bg-transparent border-transparent text-slate-400 cursor-default"
  }`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-4 md:p-0">
      {/* Form Column */}
      <div className="md:col-span-3 space-y-5">
        
        {/* Header with Edit Toggle */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isEditing ? 'bg-amber-500' : 'bg-green-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
               {isEditing ? 'Edit Session Active' : 'View Mode'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 rounded-xl bg-white border border-slate-200 text-[#36454F] text-[10px] font-black uppercase tracking-widest hover:border-[#CE2029] hover:text-[#CE2029] transition-all flex items-center gap-2"
              >
                Edit Details
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  disabled={saving}
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={saving}
                  onClick={handleSave}
                  className="px-6 py-2 rounded-xl bg-[#CE2029] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#CE2029]/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Basic Info Card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-[#CE2029]/[0.02] p-6 md:p-8 space-y-6 relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-[#CE2029]/[0.03] rotate-12 transition-transform group-hover:rotate-0 duration-700">
            <Building2 size={80} strokeWidth={1} />
          </div>

          <h3 className="text-sm font-black uppercase tracking-widest text-[#36454F] flex items-center justify-between border-b border-slate-100 pb-4 relative z-10">
            Basic Information
            <Building2 size={18} className="text-[#CE2029]" />
          </h3>

          <div className="space-y-4 relative z-10">
            {field('Arena Name', null,
              <div className="relative">
                <input 
                  type="text" 
                  value={arena.name} 
                  readOnly={!isEditing}
                  onChange={e => setArena(p => ({ ...p, name: e.target.value }))}
                  className={inputCls("pr-11")} 
                  placeholder="e.g. Phoenix Sports Arena" 
                />
                <Home size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-[#CE2029]' : 'text-slate-300'}`} />
              </div>
            )}

            {field('Address', null,
              <div className="relative">
                <input 
                  type="text" 
                  value={arena.address} 
                  readOnly={!isEditing}
                  onChange={e => setArena(p => ({ ...p, address: e.target.value }))}
                  className={inputCls("pr-11")} 
                  placeholder="Street / Area" 
                />
                <MapPin size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-[#CE2029]' : 'text-slate-300'}`} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {field('City', null,
                <input 
                  type="text" 
                  value={arena.city} 
                  readOnly={!isEditing}
                  onChange={e => setArena(p => ({ ...p, city: e.target.value }))}
                  className={inputCls()} 
                  placeholder="City" 
                />
              )}
              {field('Contact Number', null,
                <div className="relative">
                  <input 
                    type="text" 
                    value={arena.contact} 
                    readOnly={!isEditing}
                    onChange={e => setArena(p => ({ ...p, contact: e.target.value }))}
                    className={inputCls("pr-11")} 
                    placeholder="+968 XXXX XXXX" 
                  />
                  <Phone size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-[#CE2029]' : 'text-slate-300'}`} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {field('Opening Time', null,
                <div className="relative">
                  <input 
                    type="time" 
                    value={arena.openTime} 
                    readOnly={!isEditing}
                    onChange={e => setArena(p => ({ ...p, openTime: e.target.value }))}
                    className={inputCls("pr-11")} 
                  />
                  <Clock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              )}
              {field('Closing Time', null,
                <div className="relative">
                  <input 
                    type="time" 
                    value={arena.closeTime} 
                    readOnly={!isEditing}
                    onChange={e => setArena(p => ({ ...p, closeTime: e.target.value }))}
                    className={inputCls("pr-11")} 
                  />
                  <Clock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-[#CE2029]/[0.02] p-6 md:p-8 space-y-6 relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-[#CE2029]/[0.03] rotate-12 transition-transform group-hover:rotate-0 duration-700">
            <Wind size={80} strokeWidth={1} />
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-4 relative z-10">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#36454F] flex items-center justify-between flex-1 pr-4">
              Amenities
              <Wind size={18} className="text-[#CE2029]" />
            </h3>
            {isEditing && (
              <button 
                onClick={() => setShowAddAmenity(true)}
                className="px-3 py-1 rounded-lg bg-[#CE2029]/5 text-[#CE2029] text-[9px] font-black uppercase tracking-widest border border-[#CE2029]/10 hover:bg-[#CE2029] hover:text-white transition-all flex items-center gap-1.5"
              >
                 <Plus size={10} strokeWidth={3} /> Add Custom
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            {amenityOptions.map(({ id, label, icon: Icon }) => {
              const selected = Math.random() > 0 ? arena.amenities.includes(id) : false; // Safe check
              return (
                <motion.button 
                  key={id} 
                  whileTap={isEditing ? { scale: 0.95 } : {}}
                  onClick={() => toggleAmenity(id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                    selected
                      ? 'bg-[#CE2029] border-[#CE2029] text-white shadow-xl shadow-[#CE2029]/20'
                      : isEditing
                        ? 'bg-slate-50 border-slate-200 text-slate-500 hover:border-[#CE2029]/50 hover:text-[#CE2029]'
                        : 'bg-slate-50 border-slate-100 text-slate-300 opacity-60 grayscale cursor-default'
                  }`}>
                  {selected ? <Check size={12} strokeWidth={3} /> : <Icon size={12} />}
                  {label}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {showAddAmenity && isEditing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 overflow-hidden"
              >
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <input 
                    type="text" 
                    value={newAmenityLabel}
                    onChange={e => setNewAmenityLabel(e.target.value)}
                    placeholder="Enter amenity name..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-[#CE2029]"
                  />
                  <button 
                    onClick={handleAddAmenity}
                    className="px-6 py-2 bg-[#CE2029] text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Add
                  </button>
                  <button onClick={() => setShowAddAmenity(false)} className="text-slate-400 hover:text-red-500"><X size={18} /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Gallery Section - Read Only for Banner for now */}
        <div className={`bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-[#CE2029]/[0.02] p-6 md:p-8 space-y-6 overflow-hidden relative group ${!isEditing && 'opacity-60 pointer-events-none'}`}>
          <div className="absolute top-4 right-4 text-[#CE2029]/[0.03] rotate-12 transition-transform group-hover:rotate-0 duration-700">
            <Image size={80} strokeWidth={1} />
          </div>

          <h3 className="text-sm font-black uppercase tracking-widest text-[#36454F] flex items-center justify-between border-b border-slate-100 pb-4 relative z-10">
            Gallery & Branding
            <Image size={18} className="text-[#CE2029]" />
          </h3>

          {/* Banner Upload */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hero Banner</h4>
            <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
            {arena.banner ? (
              <div className="relative rounded-xl overflow-hidden h-40 group border border-slate-100">
                <img src={arena.banner} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                  <button disabled={uploading} onClick={() => bannerRef.current.click()} className="px-4 py-2 rounded-lg bg-white text-[#36454F] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    {uploading ? <Loader2 size={12} className="animate-spin" /> : null}
                    Change
                  </button>
                  <button onClick={() => setArena(p => ({ ...p, banner: null }))} className="px-4 py-2 rounded-lg bg-red-500 text-white text-[10px] font-black uppercase tracking-widest">Remove</button>
                </div>
              </div>
            ) : (
              <button onClick={() => bannerRef.current.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-12 flex flex-col items-center gap-2 text-slate-400 hover:border-[#CE2029] hover:text-[#CE2029] transition-all">
                {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                <span className="text-[10px] font-black uppercase tracking-widest">Upload Banner (16:9)</span>
              </button>
            )}
          </div>
        </div>

        {/* Save Button */}
        <AnimatePresence mode="wait">
          <motion.button key={saved ? 'saved' : 'save'} whileTap={{ scale: 0.98 }}
            disabled={saving || !isEditing}
            onClick={handleSave}
            className={`w-fit mx-auto px-12 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              saved
                ? 'bg-green-500 border-green-500 text-white'
                : !isEditing 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#CE2029] border-[#CE2029] text-white hover:shadow-lg hover:shadow-[#CE2029]/30 hover:-translate-y-0.5'
            }`}>
            {saved ? <><Check size={16} strokeWidth={3} /> Changes Saved</> : (saving ? 'Saving...' : 'Save Arena Details')}
          </motion.button>
        </AnimatePresence>
      </div>

      {/* Live Preview Column */}
      <div className="xl:col-span-2 space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-4">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
            <Eye size={14} className="text-[#CE2029]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Preview</span>
          </div>

          {/* Banner Preview */}
          <div className="h-36 w-full relative bg-gradient-to-br from-[#36454F] to-[#CE2029]/30 overflow-hidden">
            {arena.banner
              ? <img src={arena.banner} alt="Banner" className="w-full h-full object-cover" />
              : <div className="absolute inset-0 flex items-center justify-center"><Building2 className="text-white/20" size={48} /></div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="font-black text-white text-lg truncate">{arena.name || 'Arena Name'}</h3>
              <p className="text-white/70 text-[11px] flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-[#CE2029]" /> {arena.city || 'City'}
              </p>
            </div>
            <span className="absolute top-3 right-3 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
              Active
            </span>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-1">Opens</p>
                <p className="font-black text-[#36454F]">{arena.openTime || '--:--'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-1">Closes</p>
                <p className="font-black text-[#36454F]">{arena.closeTime || '--:--'}</p>
              </div>
            </div>

            <div className="text-[11px] space-y-1.5">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin size={12} className="text-[#CE2029] shrink-0" />
                <span className="font-bold truncate">{arena.address || 'Address not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Phone size={12} className="text-[#CE2029] shrink-0" />
                <span className="font-bold">{arena.contact || 'Contact not set'}</span>
              </div>
            </div>

            {arena.amenities.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {arena.amenities.map(id => {
                    const opt = amenityOptions.find(o => o.id === id);
                    if (!opt) return null;
                    const Icon = opt.icon;
                    return (
                      <span key={id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#CE2029]/10 text-[#CE2029] border border-[#CE2029]/20 text-[9px] font-black uppercase tracking-widest">
                        <Icon size={9} /> {opt.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArenaDetails;
