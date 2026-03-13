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
      <div className={`px-6 pt-5 pb-5 sticky top-0 z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#08142B]/80 border-white/5' : 'bg-[#0A1F44] border-white/10 rounded-b-[30px] shadow-[0_10px_30px_rgba(10,31,68,0.15)]'}`}>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border active:scale-95 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white/10 border-white/20 text-white shadow-sm'}`}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className={`text-lg font-bold font-display ${isDark ? 'text-white' : 'text-white'}`}>Choose an Arena</h1>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/25 group-focus-within:text-[#22FF88]' : 'text-white/40 group-focus-within:text-[#22FF88]'}`} />
          <input
            type="text"
            placeholder="Search arenas nearby..."
            className={`w-full border rounded-2xl py-3 pl-11 pr-4 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#22FF88]/20 ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white/90 placeholder:text-white/20 focus:border-[#22FF88]' 
                : 'bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#22FF88] backdrop-blur-md'
            }`}
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
            className={`rounded-3xl overflow-hidden group cursor-pointer transition-all duration-500 border ${
              isDark 
                ? 'glass-card border-white/5 hover:border-[#22FF88]/20' 
                : 'bg-white border-slate-200 hover:border-[#22FF88]/30 shadow-sm hover:shadow-md'
            }`}
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
                  <p className={`text-[9px] font-bold uppercase tracking-[0.15em] ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>per hour</p>
                </div>
              </div>

              <div className={`flex items-center text-xs mt-2 gap-1 ${isDark ? 'text-white/50' : 'text-[#0A1F44]/50'}`}>
                <MapPin size={13} />
                <span>{arena.location} • {arena.distance}</span>
              </div>

              {/* Stats + CTA */}
              <div className={`mt-5 flex justify-between items-center p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`text-center flex-1 border-r ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{arena.courtsCount}</p>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${isDark ? 'text-white/40' : 'text-[#0A1F44]/50'}`}>Courts</p>
                </div>
                <div className={`text-center flex-1 border-r ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{arena.reviews}</p>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${isDark ? 'text-white/40' : 'text-[#0A1F44]/50'}`}>Reviews</p>
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
