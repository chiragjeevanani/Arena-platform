import { motion } from 'framer-motion';
import { useRef } from 'react';
import gsap from 'gsap';

/**
 * CourtSlot — Tournament schedule board styled time slot
 */
const CourtSlot = ({ slot, isSelected, onSelect, disabled = false }) => {
  const slotRef = useRef(null);

  const statusConfig = {
    Available: {
      bg: 'glass-neon',
      border: 'border-[#22FF88]/20',
      text: 'text-[#22FF88]',
      label: null,
    },
    Booked: {
      bg: 'glass-light',
      border: 'border-white/5',
      text: 'text-white/25',
      label: 'Booked',
    },
    Coaching: {
      bg: 'bg-[#FFD600]/5',
      border: 'border-[#FFD600]/15',
      text: 'text-[#FFD600]/60',
      label: 'Coaching',
    },
    Maintenance: {
      bg: 'bg-red-500/5',
      border: 'border-red-500/15',
      text: 'text-red-400/60',
      label: 'Maintenance',
    },
    Blocked: {
      bg: 'glass-light',
      border: 'border-white/5',
      text: 'text-white/20',
      label: 'Blocked',
    },
  };

  const config = statusConfig[slot.status] || statusConfig.Blocked;

  const handleSelect = () => {
    if (disabled || slot.status !== 'Available') return;

    // Shuttle hit sound ripple
    if (slotRef.current) {
      gsap.timeline()
        .to(slotRef.current, { scale: 0.9, duration: 0.06, ease: 'power3.in' })
        .to(slotRef.current, { scale: 1.05, duration: 0.15, ease: 'back.out(3)' })
        .to(slotRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
    }

    onSelect?.(slot.id);
  };

  const selectedStyles = isSelected
    ? 'bg-[#22FF88]/15 border-[#22FF88]/40 neon-glow'
    : '';

  return (
    <motion.button
      ref={slotRef}
      whileTap={slot.status === 'Available' ? { scale: 0.95 } : {}}
      disabled={slot.status !== 'Available'}
      onClick={handleSelect}
      className={`
        relative py-4 px-4 rounded-2xl text-center font-bold border
        transition-all duration-300 overflow-hidden
        ${isSelected ? selectedStyles : `${config.bg} ${config.border}`}
        ${slot.status !== 'Available' ? 'cursor-not-allowed' : 'cursor-pointer hover:border-[#22FF88]/30'}
      `}
    >
      {/* Time */}
      <span className={`text-xs font-bold block ${isSelected ? 'text-[#22FF88]' : config.text}`}>
        {slot.time}
      </span>

      {/* Status Label */}
      {config.label && (
        <span className={`block text-[8px] mt-1 uppercase tracking-wider ${config.text} opacity-70`}>
          {config.label}
        </span>
      )}

      {/* Price */}
      {slot.status === 'Available' && (
        <span className={`block text-[10px] mt-1 ${isSelected ? 'text-[#22FF88]/70' : 'text-white/30'}`}>
          ₹{slot.price}
        </span>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#22FF88]"
        />
      )}
    </motion.button>
  );
};

export default CourtSlot;
