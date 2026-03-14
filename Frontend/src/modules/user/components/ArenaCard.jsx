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
    <div
      ref={cardRef}
      onClick={handleTap}
      className="w-full cursor-pointer group"
    >
      <Link to={`/arenas/${arena.id}`} className="block">
        <div className="glass-card rounded-[24px] overflow-hidden transition-all duration-500 group-hover:border-[#22FF88]/20 bg-white dark:bg-[#0A1F44] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-[0_0_30px_rgba(34,255,136,0.08)]">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={arena.image}
              alt={arena.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08142B] via-transparent to-transparent" />

            {/* Rating Badge */}
            <div className="absolute top-2 right-2 glass-light px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Star size={10} className="text-[#FFD600] fill-[#FFD600]" />
              <span className="text-[10px] font-bold text-white">{arena.rating}</span>
            </div>

            {/* Court Availability Indicator */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22FF88]" />
                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-[#22FF88] animate-ping opacity-60" />
              </div>
              <span className="text-[9px] font-bold text-[#22FF88] uppercase tracking-wider">
                {arena.courtsCount} courts available
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-1.5">
            <h4 className={`font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{arena.name}</h4>
            <div className={`flex items-center text-[10px] gap-1 ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>
              <MapPin size={10} />
              <span>{arena.location} • {arena.distance}</span>
            </div>
            <div className={`flex justify-between items-center pt-1.5 mt-1.5 border-t ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
              <div>
                <span className="text-[#22FF88] font-bold text-base font-display">₹{arena.pricePerHour}</span>
                <span className={`text-[9px] ml-1 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/30'}`}>/ hour</span>
              </div>
              <div className="bg-[#22FF88]/10 text-[#22FF88] px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-[#22FF88]/20 group-hover:bg-[#22FF88] group-hover:text-[#08142B] transition-all duration-300">
                Book
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ArenaCard;
