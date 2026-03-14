import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { useRef } from 'react';
import gsap from 'gsap';
import { useTheme } from '../context/ThemeContext';

/**
 * ArenaCard â€” Mini stadium tile with neon glow and availability indicator
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
        <div className="glass-card rounded-[24px] overflow-hidden transition-all duration-500 group-hover:border-[#eb483f]/20 bg-white  border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-[0_0_30px_rgba(235, 72, 63,0.08)]">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={arena.image}
              alt={arena.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#eb483f] via-transparent to-transparent" />

            {/* Rating Badge */}
            <div className="absolute top-2 right-2 glass-light px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Star size={10} className="text-[#FFD600] fill-[#FFD600]" />
              <span className="text-[10px] font-bold text-white">{arena.rating}</span>
            </div>

            {/* Court Availability Indicator */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-[#eb483f]" />
                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-[#eb483f] animate-ping opacity-60" />
              </div>
              <span className="text-[9px] font-bold text-[#eb483f] uppercase tracking-wider">
                {arena.courtsCount} courts available
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-1.5">
            <h4 className={`font-bold text-sm tracking-tight ${'text-[#eb483f]'}`}>{arena.name}</h4>
            <div className={`flex items-center text-[10px] gap-1 ${'text-[#eb483f]/40'}`}>
              <MapPin size={10} />
              <span>{arena.location} â€¢ {arena.distance}</span>
            </div>
            <div className={`flex justify-between items-center pt-1.5 mt-1.5 border-t ${'border-[#eb483f]/5'}`}>
              <div>
                <span className="text-[#eb483f] font-bold text-base font-display">â‚¹{arena.pricePerHour}</span>
                <span className={`text-[9px] ml-1 ${'text-[#eb483f]/30'}`}>/ hour</span>
              </div>
              <div className="bg-[#eb483f]/10 text-[#eb483f] px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-[#eb483f]/20 group-hover:bg-[#eb483f] group-hover:text-[#eb483f] transition-all duration-300">
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



