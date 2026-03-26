import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, Phone, Mail, Globe,
  Save, CheckCircle2, ChevronRight, Image as ImageIcon,
  Plus, Minus, Trash2, Edit3, Star, BadgeDollarSign,
  Trophy, Navigation, Upload, Cloud, ArrowLeft,
  Wifi, Coffee, ShowerHead, ParkingCircle, Footprints
} from 'lucide-react';
import { ARENAS } from '../../../data/mockData';

const ArenaDetailsAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [isEditingCourts, setIsEditingCourts] = useState(false);

  // Initializing based on URL param
  const [form, setForm] = useState(() => {
    if (id === 'new') {
      return {
        id: Date.now(),
        name: '', location: '', distance: '', rating: 0,
        reviews: 0, pricePerHour: 0, courtsCount: 0, image: '',
        category: '', amenities: [], description: ''
      };
    }
    return ARENAS.find(a => a.id === parseInt(id)) || ARENAS[0];
  });

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

  const handleSave = () => {
    if (!form.name || !form.location) {
      showToast('Name and Location are required');
      return;
    }
    showToast('Arena details saved to registry');
    setTimeout(() => navigate('/admin/arena/details'), 1500);
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
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] bg-white border border-[#eb483f]/20 text-[#1a2b3c] px-5 py-2.5 rounded-none shadow-2xl flex items-center gap-2.5 min-w-[280px]"
          >
            <CheckCircle2 size={16} className="text-[#eb483f]" />
            <span className="text-[10px] font-black uppercase tracking-widest">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/arena/details')}
            className="w-10 h-10 rounded-none border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#eb483f] hover:bg-[#eb483f]/5 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
             <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#eb483f] mb-1 font-black">
                <Building2 size={12} /> Facility Registry
             </div>
             <h1 className="text-xl font-bold tracking-tight text-slate-900">
               {id === 'new' ? 'Initialize New Facility' : 'Manage Arena Profile'}
             </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={handleSave} className="flex-1 sm:flex-none bg-[#eb483f] text-white px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2">
             <Save size={14} /> Publish Changes
          </button>
        </div>
      </div>

      <div className="space-y-6">
           {/* Banner Upload */}
           <div className="bg-white rounded-none border border-slate-100 p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                 <ImageIcon size={16} className="text-[#eb483f]" /> Arena Graphics
               </h3>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="text-[10px] font-black uppercase tracking-widest text-[#eb483f] flex items-center gap-1.5 hover:underline"
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#eb483f] ml-1">Asset Identity</label>
                    <input 
                      type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="e.g. Phoenix Sports Park"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Physical Location</label>
                    <div className="relative">
                      <input 
                        type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                        placeholder="Noida, India"
                        className="w-full bg-slate-50 border border-slate-100 rounded-none py-3 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-inner"
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
                        className="w-full bg-slate-50 border border-slate-100 rounded-none py-3 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none focus:border-[#eb483f] focus:bg-white transition-all shadow-inner"
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#eb483f] ml-1">Base Price (OMR)</label>
                    <div className="relative">
                      <input 
                        type="number" step="0.01" value={form.pricePerHour} onChange={e => setForm({...form, pricePerHour: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-[#eb483f] outline-none shadow-inner"
                      />
                      <BadgeDollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#eb483f]" />
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#eb483f] ml-1">Operational Taxonomy (Main Sport)</label>
                  <input 
                    type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    placeholder="Badminton, Cricket, Football..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-none py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#eb483f] focus:bg-white shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Narrative (Public Profile)</label>
                  <textarea 
                    rows="4" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Tell your professional story..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-none py-3 px-4 text-xs font-bold text-slate-900 outline-none focus:border-[#eb483f] focus:bg-white resize-none shadow-inner"
                  />
                </div>
             </div>
           </div>

           {/* Amenities & Operational Summary */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              <div className="bg-white rounded-none border border-slate-100 p-8 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-6">Amenity Checklist</h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenityList.map(item => (
                    <button
                      key={item.name}
                      onClick={() => toggleAmenity(item.name)}
                      className={`flex items-center gap-3 p-3.5 rounded-none border transition-all ${
                        form.amenities.includes(item.name)
                          ? 'bg-[#eb483f]/5 border-[#eb483f]/20 text-[#eb483f]'
                          : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      <item.icon size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#eb483f]/[0.02] rounded-none p-8 border border-[#eb483f]/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#eb483f]/5 rounded-none blur-3xl -translate-y-12 translate-x-12" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#eb483f] mb-2">Resource Availability</p>
                      <h4 className="text-xl font-black tracking-tight text-slate-900">{form.courtsCount} Courts Available for Play</h4>
                    </div>
                    <button
                      onClick={() => setIsEditingCourts(!isEditingCourts)}
                      className={`p-2 rounded-sm border transition-all ${
                        isEditingCourts
                        ? 'bg-[#eb483f] text-white border-[#eb483f] shadow-lg shadow-[#eb483f]/20'
                        : 'bg-white text-slate-400 border-slate-100 hover:text-[#eb483f] hover:border-[#eb483f]/30'
                      }`}
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                    {/* High-Visibility Interactive Court Grid with Popout Controls */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-6 my-6">
                      {Array.from({ length: Number(form.courtsCount) || 0 }).map((_, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          onClick={() => navigate(`/admin/arena/slots/${id}/${i + 1}`)}
                          className="aspect-square bg-white border-2 border-[#eb483f]/10 shadow-sm flex flex-col items-center justify-center text-[#eb483f] relative group/unit transition-all cursor-pointer hover:border-[#eb483f] hover:bg-[#eb483f]/[0.02]"
                        >
                          {/* Popout Remove Unit Action - Floating on Border - Visible only in Edit Mode */}
                          <AnimatePresence>
                            {isEditingCourts && (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForm(prev => ({ ...prev, courtsCount: Math.max(0, Number(prev.courtsCount) - 1) }));
                                }}
                                className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#eb483f] text-white flex items-center justify-center transition-all shadow-xl z-50 hover:scale-110 active:scale-90 border-2 border-white"
                              >
                                <Minus size={14} strokeWidth={4} />
                              </motion.button>
                            )}
                          </AnimatePresence>

                          <div className="absolute inset-0 bg-gradient-to-tr from-[#eb483f]/[0.05] to-transparent opacity-0 group-hover/unit:opacity-100 transition-opacity rounded-sm" />
                          <Building2 size={22} className="mb-1.5 transition-transform group-hover/unit:scale-110" />
                          <div className="flex flex-col items-center">
                            <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-slate-900 leading-none mb-1">COURT</span>
                            <span className="text-xl font-black leading-none">{i + 1}</span>
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
                            onClick={() => setForm(prev => ({ ...prev, courtsCount: Number(prev.courtsCount) + 1 }))}
                            className="aspect-square border-2 border-dashed border-[#eb483f]/30 rounded-sm flex flex-col items-center justify-center text-[#eb483f] hover:bg-[#eb483f]/[0.02] transition-all group/add"
                          >
                             <Plus size={24} className="scale-110" />
                             <span className="text-[7px] font-black uppercase tracking-widest mt-1">Add Court</span>
                          </motion.button>
                        )}
                      </AnimatePresence>
                      {(!form.courtsCount || form.courtsCount === 0) && (
                        <div className="col-span-full py-10 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-2">
                           <Cloud size={24} />
                           <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Registry Sync...</p>
                        </div>
                      )}
                    </div>
                  
                  <div className="space-y-4 pt-6 mt-auto">
                    <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-100 pb-2">
                       <span className="text-slate-500">Active Booking Units</span>
                       <span className="text-[#eb483f] font-black">{form.courtsCount} Units</span>
                    </div>
                  </div>
                </div>
              </div>
           </div>
      </div>
    </div>
  );
};

export default ArenaDetailsAdmin;
