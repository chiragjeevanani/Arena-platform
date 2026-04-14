import { motion } from 'framer-motion';
import { useRef } from 'react';
import gsap from 'gsap';
import { Star, CalendarDays } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * CourtSlot — Shows time slot with Prime / Non-Prime classification badge
 */
const CourtSlot = ({ slot, isSelected, onSelect, disabled = false }) => {
  const slotRef = useRef(null);
  const { isDark } = useTheme();

  const isPrime = slot.type === 'prime';

  const statusConfig = {
    Available: {
      bg: isPrime ? 'bg-amber-50' : 'bg-[#e9fff3]',
      border: isPrime ? 'border-amber-200' : 'border-[#CE2029]/40',
      text: isPrime ? 'text-amber-700' : 'text-[#069d4b]',
      label: null,
    },
    Booked: {
      bg: 'bg-slate-100/50',
      border: 'border-slate-200',
      text: 'text-slate-500',
      label: 'Booked',
    },
    Coaching: {
      bg: 'bg-amber-50',
      border: 'border-amber-200/60',
      text: 'text-amber-700',
      label: 'Coaching',
    },
    Maintenance: {
      bg: 'bg-red-50',
      border: 'border-red-200/50',
      text: 'text-red-700',
      label: 'Maintenance',
    },
    Blocked: {
      bg: 'bg-slate-100/30',
      border: 'border-slate-200/50',
      text: 'text-slate-400',
      label: 'Blocked',
    },
  };

  const config = statusConfig[slot.status] || statusConfig.Blocked;

  const handleSelect = () => {
    if (disabled || slot.status !== 'Available') return;
    if (slotRef.current) {
      gsap.timeline()
        .to(slotRef.current, { scale: 0.9, duration: 0.06, ease: 'power3.in' })
        .to(slotRef.current, { scale: 1.05, duration: 0.15, ease: 'back.out(3)' })
        .to(slotRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
    }
    onSelect?.(slot.id);
  };

  const selectedStyles = isSelected
    ? `bg-[#CE2029]/15 border-[#CE2029]/60 shadow-[0_0_15px_rgba(206, 32, 41,0.3)]`
    : '';

  return (
    <motion.button
      ref={slotRef}
      whileTap={slot.status === 'Available' ? { scale: 0.95 } : {}}
      disabled={slot.status !== 'Available'}
      onClick={handleSelect}
      className={`
        relative py-2.5 px-2 rounded-xl text-center font-bold border
        transition-all duration-300 overflow-hidden
        ${isSelected ? selectedStyles : `${config.bg} ${config.border}`}
        ${slot.status !== 'Available' ? 'cursor-not-allowed' : 'cursor-pointer hover:border-[#CE2029]/30'}
      `}
    >
      {/* Prime / Non-Prime Badge — top left */}
      {slot.status === 'Available' && (
        <div className={`absolute top-1.5 left-1.5 flex items-center gap-0.5 ${isPrime ? 'text-amber-500' : 'text-slate-400'
          }`}>
          {isPrime
            ? <Star size={7} fill="currentColor" />
            : <CalendarDays size={7} />
          }
          <span className={`text-[6px] font-black uppercase tracking-wide leading-none ${isPrime ? 'text-amber-600' : 'text-slate-400'
            }`}>
            {isPrime ? 'Prime' : 'Std'}
          </span>
        </div>
      )}

      {/* Time */}
      <span className={`text-[10px] font-black block mt-2 ${isSelected ? 'text-[#CE2029]' : config.text}`}>
        {slot.time.split(' - ')[0]}
      </span>
      <span className={`text-[7px] font-bold block opacity-60 ${isSelected ? 'text-[#CE2029]' : config.text}`}>
        {slot.time.split(' - ')[1]}
      </span>

      {/* Status Label (for non-available) */}
      {config.label && (
        <span className={`block text-[7px] mt-0.5 uppercase tracking-wider ${config.text} opacity-70`}>
          {config.label}
        </span>
      )}

      {/* Price */}
      {slot.status === 'Available' && (
        <div className="mt-1">
          <span className={`block text-[9px] font-black ${isSelected ? 'text-[#CE2029]' : isPrime ? 'text-amber-600' : 'text-[#CE2029]/60'
            }`}>
            OMR {Number(slot.price).toFixed(3)}
          </span>
          {isPrime && (
            <span className="block text-[6px] font-bold text-amber-500/70 uppercase tracking-widest mt-0.5">
              Prime Rate
            </span>
          )}
        </div>
      )}

      {/* Selected indicator dot */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#CE2029]"
        />
      )}
    </motion.button>
  );
};

export default CourtSlot;
