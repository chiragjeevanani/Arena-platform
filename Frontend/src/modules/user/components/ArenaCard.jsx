import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { useRef } from 'react';
import gsap from 'gsap';
import { useTheme } from '../context/ThemeContext';

/**
 * ArenaCard — Mini stadium tile with neon glow and availability indicator
 */
const ArenaCard = ({ arena, index = 0 }) => {
  const cardRef = useRef(null);
  const { isDark } = useTheme();

  const handleTap = () => {
    if (cardRef.current) {
      // Smash impact ripple
      gsap.timeline()
        .to(cardRef.current, { scale: 0.96, duration: 0.08, ease: 'power3.in' })
        .to(cardRef.current, { scale: 1.02, duration: 0.12, ease: 'power2.out' })
        .to(cardRef.current, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.6)' });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      onClick={handleTap}
      className="min-w-[280px] cursor-pointer group"
    >
      <Link to={`/arenas/${arena.id}`} className="block">
        <div className="glass-card rounded-3xl overflow-hidden transition-all duration-500 group-hover:border-[#22FF88]/20 hover:shadow-[0_0_30px_rgba(34,255,136,0.08)]">
          {/* Image */}
          <div className="relative h-40 overflow-hidden">
            <img
              src={arena.image}
              alt={arena.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08142B] via-transparent to-transparent" />

            {/* Rating Badge */}
            <div className="absolute top-3 right-3 glass-light px-2.5 py-1 rounded-xl flex items-center gap-1">
              <Star size={12} className="text-[#FFD600] fill-[#FFD600]" />
              <span className="text-xs font-bold text-white">{arena.rating}</span>
            </div>

            {/* Court Availability Indicator */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-[#22FF88]" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#22FF88] animate-ping opacity-60" />
              </div>
              <span className="text-[10px] font-bold text-[#22FF88] uppercase tracking-wider">
                {arena.courtsCount} courts available
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            <h4 className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{arena.name}</h4>
            <div className={`flex items-center text-xs gap-1 ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>
              <MapPin size={12} />
              <span>{arena.location} • {arena.distance}</span>
            </div>
            <div className={`flex justify-between items-center pt-2 mt-2 border-t ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
              <div>
                <span className="text-[#22FF88] font-bold text-lg font-display">₹{arena.pricePerHour}</span>
                <span className={`text-xs ml-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/30'}`}>/ hour</span>
              </div>
              <div className="bg-[#22FF88]/10 text-[#22FF88] px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-[#22FF88]/20 group-hover:bg-[#22FF88] group-hover:text-[#08142B] transition-all duration-300">
                Book
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ArenaCard;
