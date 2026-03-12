import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Star, ArrowLeft, Search } from 'lucide-react';
import { ARENAS } from '../../../data/mockData';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { useTheme } from '../context/ThemeContext';

const ArenaListing = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { isDark } = useTheme();

  const filteredArenas = ARENAS.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className={`px-6 pt-14 pb-6 sticky top-0 z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#08142B]/80 border-white/5' : 'bg-[#F0F4F8]/80 border-[#0A1F44]/5'}`}>
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-2xl glass-light flex items-center justify-center border active:scale-90 transition-transform ${isDark ? 'border-white/10' : 'border-[#0A1F44]/10'}`}
          >
            <ArrowLeft size={18} className={isDark ? 'text-white/60' : 'text-[#0A1F44]/60'} />
          </button>
          <h1 className={`text-lg font-bold font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Choose an Arena</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            placeholder="Search arenas nearby..."
            className={`w-full glass-light border rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-white/20 focus:outline-none focus:border-[#22FF88]/30 transition-colors ${isDark ? 'border-white/10 text-white/80' : 'border-[#0A1F44]/10 text-[#0A1F44]/80 placeholder:text-[#0A1F44]/20'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Arena List */}
      <div className="px-6 mt-6 space-y-5">
        {filteredArenas.map((arena, index) => (
          <motion.div
            key={arena.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            className="glass-card rounded-3xl overflow-hidden group cursor-pointer hover:border-[#22FF88]/15 transition-all duration-500"
            onClick={() => navigate(`/arenas/${arena.id}`)}
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={arena.image}
                alt={arena.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08142B] via-transparent to-transparent" />

              <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-xl flex items-center gap-1">
                <Star size={13} className="text-[#FFD600] fill-[#FFD600]" />
                <span className="text-xs font-bold text-white">{arena.rating}</span>
              </div>

              {/* Amenity badges */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {arena.amenities.slice(0, 2).map(amenity => (
                  <span key={amenity} className="px-2.5 py-1 glass text-white text-[9px] uppercase tracking-wider font-bold rounded-lg">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex justify-between items-start">
                <h3 className={`text-lg font-bold font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{arena.name}</h3>
                <div className="text-right">
                  <p className="text-[#22FF88] font-bold text-lg font-display">₹{arena.pricePerHour}</p>
                  <p className="text-white/20 text-[9px] font-bold uppercase tracking-[0.15em]">per hour</p>
                </div>
              </div>

              <div className={`flex items-center text-xs mt-2 gap-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/30'}`}>
                <MapPin size={13} />
                <span>{arena.location} • {arena.distance}</span>
              </div>

              {/* Stats + CTA */}
              <div className="mt-5 flex justify-between items-center glass-light p-4 rounded-2xl border border-white/5">
                <div className="text-center flex-1 border-r border-white/5">
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{arena.courtsCount}</p>
                  <p className="text-[9px] text-white/25 uppercase font-bold tracking-wider">Courts</p>
                </div>
                <div className="text-center flex-1 border-r border-white/5">
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{arena.reviews}</p>
                  <p className="text-[9px] text-white/25 uppercase font-bold tracking-wider">Reviews</p>
                </div>
                <div className="flex-1 ml-3">
                  <ShuttleButton
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={(e) => { e.stopPropagation(); navigate(`/arenas/${arena.id}`); }}
                  >
                    Book Now
                  </ShuttleButton>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ArenaListing;
