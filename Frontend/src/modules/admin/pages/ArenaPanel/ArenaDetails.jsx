import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, MapPin, Phone, Clock, Image, Upload, X, Plus, Check,
  Eye, Building2, Wifi, Car, Coffee, Dumbbell, ShowerHead, Wind
} from 'lucide-react';

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

const initialArena = {
  id: 'arena-1',
  name: 'AMM Sports Arena',
  address: 'Sultan Qaboos St, Al Khuwair',
  city: 'Muscat',
  contact: '+968 9876 5432',
  openTime: '06:00',
  closeTime: '22:00',
  amenities: ['wifi', 'parking', 'cafe'],
  images: [],
  banner: null,
  status: 'active',
};

const ArenaDetails = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [arena, setArena] = useState(initialArena);
  const [amenityOptions, setAmenityOptions] = useState(AMENITY_OPTIONS);
  const [showAddAmenity, setShowAddAmenity] = useState(false);
  const [newAmenityLabel, setNewAmenityLabel] = useState('');
  const [saved, setSaved] = useState(false);
  const galleryRef = useRef();
  const bannerRef = useRef();

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

  const handleGalleryUpload = (e) => {
    if (!isEditing) return;
    const files = Array.from(e.target.files);
    const newImgs = files.map(f => ({ url: URL.createObjectURL(f), name: f.name }));
    setArena(prev => ({ ...prev, images: [...prev.images, ...newImgs] }));
  };

  const handleBannerUpload = (e) => {
    if (!isEditing) return;
    const file = e.target.files[0];
    if (file) setArena(prev => ({ ...prev, banner: URL.createObjectURL(file) }));
  };

  const removeImage = (idx) => {
    if (!isEditing) return;
    setArena(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = () => {
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

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
                  onClick={() => { setIsEditing(false); setArena(initialArena); }}
                  className="px-4 py-2 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 rounded-xl bg-[#CE2029] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#CE2029]/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  Save Changes
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
                  placeholder="Full address" 
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
              const selected = arena.amenities.includes(id);
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

        {/* Gallery Section */}
        <div className={`bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-[#CE2029]/[0.02] p-6 md:p-8 space-y-6 overflow-hidden relative group ${!isEditing && 'opacity-60 pointer-events-none'}`}>
          <div className="absolute top-4 right-4 text-[#CE2029]/[0.03] rotate-12 transition-transform group-hover:rotate-0 duration-700">
            <Image size={80} strokeWidth={1} />
          </div>

          <h3 className="text-sm font-black uppercase tracking-widest text-[#36454F] flex items-center justify-between border-b border-slate-100 pb-4 relative z-10">
            Gallery & Branding
            <Image size={18} className="text-[#CE2029]" />
          </h3>

          <input ref={galleryRef} type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
          <button onClick={() => galleryRef.current.click()}
            className="w-full border-2 border-dashed border-slate-200 rounded-xl py-8 flex flex-col items-center gap-2 text-slate-400 hover:border-[#CE2029] hover:text-[#CE2029] transition-all group">
            <Upload size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-widest">Click to upload images</span>
            <span className="text-[10px] text-slate-300">PNG, JPG up to 10MB each</span>
          </button>

          {arena.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <AnimatePresence>
                {arena.images.map((img, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group rounded-xl overflow-hidden aspect-square">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <button onClick={() => removeImage(idx)}
                        className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg">
                        <X size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => galleryRef.current.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-[#CE2029] hover:text-[#CE2029] transition-all gap-1">
                  <Plus size={20} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Add</span>
                </motion.button>
              </AnimatePresence>
            </div>
          )}

          {/* Banner Upload */}
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Banner Image</h4>
            <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
            {arena.banner ? (
              <div className="relative rounded-xl overflow-hidden h-32 group">
                <img src={arena.banner} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                  <button onClick={() => bannerRef.current.click()} className="px-4 py-2 rounded-lg bg-white text-[#36454F] text-[10px] font-black uppercase tracking-widest">Change</button>
                  <button onClick={() => setArena(p => ({ ...p, banner: null }))} className="px-4 py-2 rounded-lg bg-red-500 text-white text-[10px] font-black uppercase tracking-widest">Remove</button>
                </div>
              </div>
            ) : (
              <button onClick={() => bannerRef.current.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 flex flex-col items-center gap-2 text-slate-400 hover:border-[#CE2029] hover:text-[#CE2029] transition-all">
                <Image size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Upload Banner (16:9)</span>
              </button>
            )}
          </div>
        </div>

        {/* Save Button */}
        <AnimatePresence mode="wait">
          <motion.button key={saved ? 'saved' : 'save'} whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className={`w-fit mx-auto px-12 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              saved
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-[#CE2029] border-[#CE2029] text-white hover:shadow-lg hover:shadow-[#CE2029]/30 hover:-translate-y-0.5'
            }`}>
            {saved ? <><Check size={16} strokeWidth={3} /> Changes Saved</> : 'Save Arena Details'}
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
              {arena.status}
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
                    const opt = AMENITY_OPTIONS.find(o => o.id === id);
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

            {arena.images.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Gallery ({arena.images.length})</p>
                <div className="grid grid-cols-4 gap-1">
                  {arena.images.slice(0, 4).map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-100 relative">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      {i === 3 && arena.images.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-black">
                          +{arena.images.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
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
