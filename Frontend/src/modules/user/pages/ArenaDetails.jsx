import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Star, Wifi, ParkingCircle, Coffee, ShowerHead, CheckCircle, ChevronRight } from 'lucide-react';
import { ARENAS, COURTS } from '../../../data/mockData';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import AmmArena1 from '../../../assets/Arenas/AmmArena1.jpeg';

import { useTheme } from '../context/ThemeContext';

const ArenaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const isDark = false;
  const arena = ARENAS.find(a => a.id === parseInt(id));

  if (!arena) return <div className={`p-10 text-center ${'text-[#CE2029]/40'}`}>Arena not found</div>;

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
    <div className={`min-h-screen pb-48 relative overflow-hidden ${'bg-white'}`}>
      {/* Background Decorative Glows */}
      <div className={`absolute top-[400px] -right-24 w-64 h-64 rounded-full blur-[100px] pointer-events-none bg-[#CE2029]/[0.04]`} />
      <div className={`absolute top-[800px] -left-24 w-64 h-64 rounded-full blur-[100px] pointer-events-none bg-[#CE2029]/[0.03]`} />

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
        </div>

        {/* Bottom Info Card */}
        <div className={`absolute bottom-6 left-6 right-6 backdrop-blur-xl rounded-3xl p-5 border shadow-2xl bg-white border-white/20 shadow-[0_15px_35px_rgba(206, 32, 41, 0.15)]`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-xl font-bold font-display text-[#CE2029]`}>{arena.name}</h1>
              <div className={`flex items-center text-xs mt-1 gap-1 text-[#CE2029]/50`}>
                <MapPin size={13} strokeWidth={2.5} />
                {arena.location}
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 bg-[#FFD600]/10 border border-[#FFD600]/20">
              <Star size={13} className="text-[#FFD600] fill-[#FFD600]" />
              <span className="text-sm font-black text-[#CE2029]">{arena.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-7">
        {/* About */}
        <div>
          <h3 className={`text-base font-bold mb-3 font-display ${'text-[#CE2029]'}`}>About Arena</h3>
          <p className={`text-sm leading-relaxed ${'text-slate-700'}`}>
            {arena.description} Premium experience with all modern facilities including {arena.amenities.join(', ')}.
          </p>
        </div>

        {/* Amenities */}
        <div>
          <h3 className={`text-base font-bold mb-4 font-display ${'text-[#CE2029]'}`}>Amenities</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {arena.amenities.map(amenity => {
              const Icon = amenityIcons[amenity] || CheckCircle;
              return (
                <div key={amenity} className={`flex flex-col items-center justify-center min-w-[75px] h-20 rounded-2xl border transition-all bg-[#CE2029]/5 border-[#CE2029]/10 shadow-sm hover:border-[#CE2029]/40 hover:bg-[#CE2029]/10 group`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-white text-[#CE2029] group-hover:scale-110 shadow-sm`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider font-bold mt-2 transition-all text-[#CE2029] group-hover:text-[#CE2029]`}>{amenity}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Select Court */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold font-display ${'text-[#CE2029]'}`}>Select Court</h3>
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
                className={`p-3.5 rounded-[24px] flex items-center gap-4 cursor-pointer transition-all duration-300 border group ${'bg-white border-slate-100 shadow-[0_4px_20px_rgba(206, 32, 41,0.02)] hover:shadow-[0_8px_30px_rgba(206, 32, 41,0.06)] hover:border-[#CE2029]/20'
                  }`}
              >
                {/* Court Thumbnail */}
                <div className={`w-16 h-16 flex-shrink-0 rounded-[20px] overflow-hidden border transition-transform duration-500 group-hover:scale-105 ${'border-slate-100 shadow-inner'}`}>
                    <img
                      src={AmmArena1}
                      alt=""
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500"
                    />
                </div>

                {/* Court Info */}
                <div className="flex-1">
                  <h4 className={`font-bold text-base transition-colors ${'text-[#CE2029] group-hover:text-[#CE2029]'}`}>{court.name}</h4>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider mt-2 transition-colors ${'bg-[#CE2029]/5 text-[#CE2029]/60 border border-[#CE2029]/10 group-hover:bg-[#CE2029]/10 group-hover:text-[#CE2029] group-hover:border-transparent'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${court.type === 'Wooden' ? 'bg-amber-400' : 'bg-[#CE2029]'}`} />
                    {court.type}
                  </div>
                </div>

                {/* Select Indicator */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 bg-[#CE2029]/5 text-[#CE2029]/20 group-hover:bg-[#CE2029] group-hover:text-white group-hover:shadow-[0_0_15px_rgba(206, 32, 41, 0.4)]`}>
                  <ChevronRight size={16} strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Bar */}
      <div className="fixed bottom-[68px] md:bottom-0 left-0 right-0 z-[110] md:max-w-[450px] md:mx-auto">
        <div className={`h-[1px] ${'bg-slate-100'}`} />
        <div className={`backdrop-blur-xl p-4 flex items-center justify-between border-t ${'bg-white/95 border-slate-50 shadow-[0_-10px_30px_rgba(206, 32, 41,0.04)]'}`}>
          <div>
            <p className={`text-[9px] font-bold uppercase tracking-[0.15em] ${'text-[#CE2029]/60'}`}>Starting from</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-display ${'text-[#CE2029]'}`}>OMR {Number(arena.pricePerHour).toFixed(3)}</span>
              <span className={`text-xs ${'text-[#CE2029]/40'}`}>/ hr</span>
            </div>
          </div>
          <ShuttleButton
            variant="primary"
            size="md"
            className="!bg-[#CE2029] !text-white hover:!bg-[#CE2029]/90 hover:shadow-[#CE2029]/20 px-8"
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



