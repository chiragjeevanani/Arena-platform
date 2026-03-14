import { motion } from 'framer-motion';
import { useRef } from 'react';
import gsap from 'gsap';

import { useTheme } from '../context/ThemeContext';

/**
 * CourtSlot â€” Tournament schedule board styled time slot
 */
const CourtSlot = ({ slot, isSelected, onSelect, disabled = false }) => {
  const slotRef = useRef(null);
  const { isDark } = useTheme();

  const statusConfig = {
    Available: {
      bg: 'bg-[#e9fff3]',
      border: 'border-[#eb483f]/40',
      text: 'text-[#069d4b]',
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
    ? `bg-[#eb483f]/15 ${'border-[#eb483f]/60 shadow-[0_0_15px_rgba(235, 72, 63,0.3)]'}`
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
        ${slot.status !== 'Available' ? 'cursor-not-allowed' : 'cursor-pointer hover:border-[#eb483f]/30'}
      `}
    >
      {/* Time */}
      <span className={`text-[13px] font-black block ${isSelected ? 'text-[#eb483f]' : config.text}`}>
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
        <span className={`block text-xs mt-1 font-bold ${isSelected ? 'text-[#eb483f]/70' : `${'text-[#eb483f]/50'}`}`}>
          â‚¹{slot.price}
        </span>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#eb483f]"
        />
      )}
    </motion.button>
  );
};

export default CourtSlot;



