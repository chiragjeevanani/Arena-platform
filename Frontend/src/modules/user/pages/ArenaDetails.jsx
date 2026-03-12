import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Star, Wifi, ParkingCircle, Coffee, ShowerHead, CheckCircle } from 'lucide-react';
import { ARENAS, COURTS } from '../../../data/mockData';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';

const ArenaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const arena = ARENAS.find(a => a.id === parseInt(id));

  if (!arena) return <div className="p-10 text-center text-white/40">Arena not found</div>;

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
    <div className="min-h-screen pb-32">
      {/* Hero */}
      <div className="relative h-[380px] overflow-hidden">
        <img src={arena.image} alt={arena.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08142B] via-[#08142B]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08142B]/50 via-transparent to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-12 left-0 right-0 px-6 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl glass flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <button className="w-11 h-11 rounded-2xl glass flex items-center justify-center active:scale-90 transition-transform">
            <Heart size={18} className="text-white/70" />
          </button>
        </div>

        {/* Bottom Info Card */}
        <div className="absolute bottom-6 left-6 right-6 glass rounded-3xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-white font-display">{arena.name}</h1>
              <div className="flex items-center text-white/40 text-xs mt-1 gap-1">
                <MapPin size={13} />
                {arena.location}
              </div>
            </div>
            <div className="glass-light px-3 py-1.5 rounded-xl flex items-center gap-1">
              <Star size={13} className="text-[#FFD600] fill-[#FFD600]" />
              <span className="text-sm font-bold text-white">{arena.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-7">
        {/* About */}
        <div>
          <h3 className="text-base font-bold text-white/80 mb-3 font-display">About Arena</h3>
          <p className="text-white/30 text-sm leading-relaxed">
            {arena.description} Premium experience with all modern facilities including {arena.amenities.join(', ')}.
          </p>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-base font-bold text-white/80 mb-4 font-display">Amenities</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {arena.amenities.map(amenity => {
              const Icon = amenityIcons[amenity] || CheckCircle;
              return (
                <div key={amenity} className="flex flex-col items-center justify-center min-w-[72px] h-20 glass-light rounded-2xl border border-white/5 group hover:border-[#22FF88]/20 transition-all">
                  <div className="w-8 h-8 rounded-xl glass-light flex items-center justify-center text-white/30 group-hover:text-[#22FF88] transition-colors">
                    <Icon size={16} />
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-white/25 mt-1.5 group-hover:text-[#22FF88]/60">{amenity}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Select Court */}
        <div>
          <h3 className="text-base font-bold text-white/80 mb-4 font-display">Select Court</h3>
          <div className="grid grid-cols-2 gap-3">
            {COURTS.filter(c => c.arenaId === arena.id).map(court => (
              <motion.div
                key={court.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/book/${arena.id}/${court.id}`)}
                className="glass-card p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#22FF88]/20 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl glass-light flex items-center justify-center overflow-hidden border border-white/5">
                  <img
                    src="https://images.unsplash.com/photo-1626224484214-405100cd0e2c?w=100&h=100&fit=crop"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#22FF88] transition-colors">{court.name}</h4>
                  <p className="text-[9px] text-white/25 uppercase font-bold tracking-[0.15em]">{court.type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] md:max-w-[450px] md:mx-auto">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#22FF88]/15 to-transparent" />
        <div className="bg-[#08142B]/95 backdrop-blur-xl p-5 flex items-center justify-between border-t border-white/5">
          <div>
            <p className="text-white/25 text-[9px] font-bold uppercase tracking-[0.15em]">Starting from</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-display">₹{arena.pricePerHour}</span>
              <span className="text-white/25 text-xs">/ hr</span>
            </div>
          </div>
          <ShuttleButton
            variant="primary"
            size="lg"
            onClick={() => navigate(`/book/${arena.id}/1`)}
          >
            Book Now
          </ShuttleButton>
        </div>
      </div>
    </div>
  );
};

export default ArenaDetails;
