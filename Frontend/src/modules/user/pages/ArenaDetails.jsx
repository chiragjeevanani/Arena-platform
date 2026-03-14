import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Star, Wifi, ParkingCircle, Coffee, ShowerHead, CheckCircle, ChevronRight } from 'lucide-react';
import { ARENAS, COURTS } from '../../../data/mockData';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import courtThumbnail from '../../../assets/Arenas/court_thumbnail.png';

import { useTheme } from '../context/ThemeContext';

const ArenaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const isDark = false;
  const arena = ARENAS.find(a => a.id === parseInt(id));

  if (!arena) return <div className={`p-10 text-center ${'text-[#eb483f]/40'}`}>Arena not found</div>;

  const amenityIcons = {
    "Parking": ParkingCircle,
    "Shower": ShowerHead,
    "Locker": CheckCircle,
    "Cafe": Coffee,
    "Wifi": Wifi,
    "Water": Coffee,
    "Sports Shop": CheckCircle,
  };

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden ${'bg-white'}`}>
      {/* Background Decorative Glows */}
      <div className={`absolute top-[400px] -right-24 w-64 h-64 rounded-full blur-[100px] pointer-events-none bg-[#eb483f]/[0.04]`} />
      <div className={`absolute top-[800px] -left-24 w-64 h-64 rounded-full blur-[100px] pointer-events-none bg-[#eb483f]/[0.03]`} />

      <div className="relative h-[380px] overflow-hidden">
        <img src={arena.image} alt={arena.name} className="w-full h-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-t ${'from-black/60 via-transparent'} to-transparent`} />
        <div className={`absolute inset-0 bg-gradient-to-b ${'from-black/40'} via-transparent to-transparent`} />

        <div className="absolute top-8 left-0 right-0 px-6 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center active:scale-95 transition-all shadow-lg"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <button className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center active:scale-95 transition-all shadow-lg">
            <Heart size={18} className="text-white" />
          </button>
        </div>

        {/* Bottom Info Card */}
        <div className={`absolute bottom-6 left-6 right-6 backdrop-blur-xl rounded-3xl p-5 border shadow-2xl bg-white border-white/20 shadow-[0_15px_35px_rgba(235, 72, 63, 0.15)]`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-xl font-bold font-display text-[#eb483f]`}>{arena.name}</h1>
              <div className={`flex items-center text-xs mt-1 gap-1 text-[#eb483f]/50`}>
                <MapPin size={13} strokeWidth={2.5} />
                {arena.location}
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 bg-[#FFD600]/10 border border-[#FFD600]/20">
              <Star size={13} className="text-[#FFD600] fill-[#FFD600]" />
              <span className="text-sm font-black text-[#eb483f]">{arena.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-7">
        {/* About */}
        <div>
          <h3 className={`text-base font-bold mb-3 font-display ${'text-[#eb483f]'}`}>About Arena</h3>
          <p className={`text-sm leading-relaxed ${'text-slate-700'}`}>
            {arena.description} Premium experience with all modern facilities including {arena.amenities.join(', ')}.
          </p>
        </div>

        {/* Amenities */}
        <div>
          <h3 className={`text-base font-bold mb-4 font-display ${'text-[#eb483f]'}`}>Amenities</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {arena.amenities.map(amenity => {
              const Icon = amenityIcons[amenity] || CheckCircle;
              return (
                <div key={amenity} className={`flex flex-col items-center justify-center min-w-[75px] h-20 rounded-2xl border transition-all bg-[#eb483f]/5 border-[#eb483f]/10 shadow-sm hover:border-[#eb483f]/40 hover:bg-[#eb483f]/10 group`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-white text-[#eb483f] group-hover:scale-110 shadow-sm`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider font-bold mt-2 transition-all text-[#eb483f] group-hover:text-[#eb483f]`}>{amenity}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Select Court */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold font-display ${'text-[#eb483f]'}`}>Select Court</h3>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${'text-slate-400'}`}>{arena.courtsCount} Available</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {COURTS.filter(c => c.arenaId === arena.id).map((court, idx) => (
              <div
                key={court.id}
                onClick={() => {
                  localStorage.setItem("selectedArena", JSON.stringify({
                    ...arena,
                    selectedCourt: court
                  }));
                  navigate(`/book/${arena.id}/${court.id}`);
                }}
                className={`p-3.5 rounded-[24px] flex items-center gap-4 cursor-pointer transition-all duration-300 border group ${isDark
                    ? 'bg-white/[0.03] border-white/5 hover:border-blue-500/30 hover:bg-blue-500/[0.05]'
                    : 'bg-white border-blue-50/50 shadow-[0_4px_20px_rgba(10,31,68,0.02)] hover:shadow-[0_8px_30px_rgba(10,31,68,0.06)] hover:border-blue-200'
                  }`}
              >
                {/* Court Thumbnail */}
                <div className={`w-16 h-16 flex-shrink-0 rounded-[20px] overflow-hidden border transition-transform duration-500 group-hover:scale-105 ${'border-blue-100/50 shadow-inner'}`}>
                  <img
                    src={courtThumbnail}
                    alt=""
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500"
                  />
                </div>

                {/* Court Info */}
                <div className="flex-1">
                  <h4 className={`font-bold text-base transition-colors ${isDark ? 'text-white group-hover:text-blue-400' : 'text-[#eb483f] group-hover:text-blue-600'}`}>{court.name}</h4>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider mt-2 transition-colors ${isDark ? 'bg-white/5 text-white/40 group-hover:bg-blue-500/10 group-hover:text-blue-400' : 'bg-blue-50 text-blue-400 border border-blue-100/50 group-hover:bg-blue-100/50 group-hover:text-blue-600 group-hover:border-transparent'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${court.type === 'Wooden' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                    {court.type}
                  </div>
                </div>

                {/* Select Indicator */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 bg-[#eb483f]/5 text-[#eb483f]/20 group-hover:bg-[#eb483f] group-hover:text-white group-hover:shadow-[0_0_15px_rgba(235, 72, 63, 0.4)]`}>
                  <ChevronRight size={16} strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] md:max-w-[450px] md:mx-auto">
        <div className={`h-[1px] ${'bg-slate-100'}`} />
        <div className={`backdrop-blur-xl p-5 flex items-center justify-between border-t ${'bg-white/95 border-blue-50 shadow-[0_-10px_30px_rgba(10,31,68,0.04)]'}`}>
          <div>
            <p className={`text-[9px] font-bold uppercase tracking-[0.15em] ${'text-blue-600'}`}>Starting from</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-display ${'text-[#eb483f]'}`}>â‚¹{arena.pricePerHour}</span>
              <span className={`text-xs ${'text-blue-300'}`}>/ hr</span>
            </div>
          </div>
          <ShuttleButton
            variant="primary"
            size="lg"
            className="!bg-[#eb483f] !text-white hover:!bg-[#eb483f]/90 hover:shadow-[#eb483f]/20"
            onClick={() => {
              localStorage.setItem("selectedArena", JSON.stringify({
                ...arena,
                selectedCourt: COURTS.find(c => c.arenaId === arena.id) // Default to first court
              }));
              navigate(`/book/${arena.id}/1`);
            }}
          >
            Book Now
          </ShuttleButton>
        </div>
      </div>
    </div>
  );
};

export default ArenaDetails;



