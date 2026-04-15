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
      bg: isPrime ? 'bg-amber-100/80' : 'bg-emerald-100/80',
      border: isPrime ? 'border-amber-300' : 'border-emerald-300',
      text: isPrime ? 'text-amber-900' : 'text-emerald-900',
      label: null,
    },
    Booked: {
      bg: 'bg-slate-200',
      border: 'border-slate-300',
      text: 'text-slate-600',
      label: 'Booked',
    },
    Coaching: {
      bg: 'bg-amber-100/80',
      border: 'border-amber-300',
      text: 'text-amber-900',
      label: 'Coaching',
    },
    Maintenance: {
      bg: 'bg-red-100/80',
      border: 'border-red-300',
      text: 'text-red-900',
      label: 'Maintenance',
    },
    Blocked: {
      bg: 'bg-slate-300/40',
      border: 'border-slate-400/50',
      text: 'text-slate-700',
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
        relative py-1.5 px-1 rounded-sm text-center font-black border
        transition-all duration-300 overflow-hidden min-h-[44px] flex flex-col items-center justify-center
        ${isSelected ? selectedStyles : `${config.bg} ${config.border}`}
        ${slot.status !== 'Available' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:border-[#CE2029]/30'}
      `}
    >
      {/* Time */}
      <span className={`text-[11px] font-black block leading-tight ${isSelected ? 'text-[#CE2029]' : config.text}`}>
        {slot.time.split(' - ')[0]}
      </span>



      {/* Selected indicator dot */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#CE2029]"
        />
      )}
    </motion.button>
  );
};

export default CourtSlot;
