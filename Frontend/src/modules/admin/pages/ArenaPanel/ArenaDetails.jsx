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
  const [arena, setArena] = useState(initialArena);
  const [saved, setSaved] = useState(false);
  const galleryRef = useRef();
  const bannerRef = useRef();

  const toggleAmenity = (id) => {
    setArena(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id],
    }));
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImgs = files.map(f => ({ url: URL.createObjectURL(f), name: f.name }));
    setArena(prev => ({ ...prev, images: [...prev.images, ...newImgs] }));
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) setArena(prev => ({ ...prev, banner: URL.createObjectURL(file) }));
  };

  const removeImage = (idx) => {
    setArena(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = () => {
    setSaved(true);
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

  const inputCls = "w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#eb483f] focus:bg-white transition-all text-[#1a2b3c]";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Form Column */}
      <div className="xl:col-span-3 space-y-5">
        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1a2b3c] flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 size={16} className="text-[#eb483f]" /> Basic Information
          </h3>

          {field('Arena Name', <Home size={12} className="text-[#eb483f]" />,
            <div className="relative">
              <Home size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input type="text" value={arena.name} onChange={e => setArena(p => ({ ...p, name: e.target.value }))}
                className={`${inputCls} pl-11`} placeholder="e.g. Phoenix Sports Arena" />
            </div>
          )}

          {field('Address', <MapPin size={12} className="text-[#eb483f]" />,
            <div className="relative">
              <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input type="text" value={arena.address} onChange={e => setArena(p => ({ ...p, address: e.target.value }))}
                className={`${inputCls} pl-11`} placeholder="Full address" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {field('City', null,
              <input type="text" value={arena.city} onChange={e => setArena(p => ({ ...p, city: e.target.value }))}
                className={inputCls} placeholder="City" />
            )}
            {field('Contact Number', <Phone size={12} className="text-[#eb483f]" />,
              <div className="relative">
                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="text" value={arena.contact} onChange={e => setArena(p => ({ ...p, contact: e.target.value }))}
                    className={`${inputCls} pl-11`} placeholder="+968 XXXX XXXX" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Opening Time', <Clock size={12} className="text-[#eb483f]" />,
              <input type="time" value={arena.openTime} onChange={e => setArena(p => ({ ...p, openTime: e.target.value }))}
                className={inputCls} />
            )}
            {field('Closing Time', <Clock size={12} className="text-[#eb483f]" />,
              <input type="time" value={arena.closeTime} onChange={e => setArena(p => ({ ...p, closeTime: e.target.value }))}
                className={inputCls} />
            )}
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1a2b3c] flex items-center gap-2 border-b border-slate-100 pb-3">
            <Wind size={16} className="text-[#eb483f]" /> Amenities
          </h3>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map(({ id, label, icon: Icon }) => {
              const selected = arena.amenities.includes(id);
              return (
                <motion.button key={id} whileTap={{ scale: 0.95 }}
                  onClick={() => toggleAmenity(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${
                    selected
                      ? 'bg-[#eb483f] border-[#eb483f] text-white shadow-md shadow-[#eb483f]/25'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-[#eb483f]/50 hover:text-[#eb483f]'
                  }`}>
                  {selected ? <Check size={12} strokeWidth={3} /> : <Icon size={12} />}
                  {label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1a2b3c] flex items-center gap-2 border-b border-slate-100 pb-3">
            <Image size={16} className="text-[#eb483f]" /> Gallery Images
          </h3>

          <input ref={galleryRef} type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
          <button onClick={() => galleryRef.current.click()}
            className="w-full border-2 border-dashed border-slate-200 rounded-xl py-8 flex flex-col items-center gap-2 text-slate-400 hover:border-[#eb483f] hover:text-[#eb483f] transition-all group">
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
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-[#eb483f] hover:text-[#eb483f] transition-all gap-1">
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
                  <button onClick={() => bannerRef.current.click()} className="px-4 py-2 rounded-lg bg-white text-[#1a2b3c] text-[10px] font-black uppercase tracking-widest">Change</button>
                  <button onClick={() => setArena(p => ({ ...p, banner: null }))} className="px-4 py-2 rounded-lg bg-red-500 text-white text-[10px] font-black uppercase tracking-widest">Remove</button>
                </div>
              </div>
            ) : (
              <button onClick={() => bannerRef.current.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 flex flex-col items-center gap-2 text-slate-400 hover:border-[#eb483f] hover:text-[#eb483f] transition-all">
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
                : 'bg-[#eb483f] border-[#eb483f] text-white hover:shadow-lg hover:shadow-[#eb483f]/30 hover:-translate-y-0.5'
            }`}>
            {saved ? <><Check size={16} strokeWidth={3} /> Changes Saved</> : 'Save Arena Details'}
          </motion.button>
        </AnimatePresence>
      </div>

      {/* Live Preview Column */}
      <div className="xl:col-span-2 space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-4">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
            <Eye size={14} className="text-[#eb483f]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Preview</span>
          </div>

          {/* Banner Preview */}
          <div className="h-36 w-full relative bg-gradient-to-br from-[#1a2b3c] to-[#eb483f]/30 overflow-hidden">
            {arena.banner
              ? <img src={arena.banner} alt="Banner" className="w-full h-full object-cover" />
              : <div className="absolute inset-0 flex items-center justify-center"><Building2 className="text-white/20" size={48} /></div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="font-black text-white text-lg truncate">{arena.name || 'Arena Name'}</h3>
              <p className="text-white/70 text-[11px] flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-[#eb483f]" /> {arena.city || 'City'}
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
                <p className="font-black text-[#1a2b3c]">{arena.openTime || '--:--'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-1">Closes</p>
                <p className="font-black text-[#1a2b3c]">{arena.closeTime || '--:--'}</p>
              </div>
            </div>

            <div className="text-[11px] space-y-1.5">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin size={12} className="text-[#eb483f] shrink-0" />
                <span className="font-bold truncate">{arena.address || 'Address not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Phone size={12} className="text-[#eb483f] shrink-0" />
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
                      <span key={id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#eb483f]/10 text-[#eb483f] border border-[#eb483f]/20 text-[9px] font-black uppercase tracking-widest">
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
