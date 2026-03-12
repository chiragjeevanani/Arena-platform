import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

/**
 * ShuttleButton — Premium action button with racket swing micro-interaction
 */
const ShuttleButton = ({
  children,
  onClick,
  variant = 'primary', // primary | secondary | outline | ghost
  size = 'md', // sm | md | lg
  disabled = false,
  icon = null,
  className = '',
  fullWidth = false,
  ...props
}) => {
  const btnRef = useRef(null);
  const glowRef = useRef(null);

  const variants = {
    primary: 'bg-[#22FF88] text-[#08142B] hover:shadow-[0_0_30px_rgba(34,255,136,0.3)]',
    secondary: 'bg-[#0A1F44] text-[#22FF88] border border-[#22FF88]/20 hover:border-[#22FF88]/40',
    outline: 'bg-transparent text-[#22FF88] border border-[#22FF88]/30 hover:bg-[#22FF88]/5',
    ghost: 'bg-transparent text-[#F8FAFC] hover:bg-white/5',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const handleClick = (e) => {
    if (disabled) return;

    // Racket swing micro-interaction using GSAP
    if (btnRef.current) {
      gsap.timeline()
        .to(btnRef.current, { rotation: -3, duration: 0.08, ease: 'power2.in' })
        .to(btnRef.current, { rotation: 2, duration: 0.06, ease: 'power2.out' })
        .to(btnRef.current, { rotation: 0, duration: 0.15, ease: 'elastic.out(1, 0.5)' });
    }

    onClick?.(e);
  };

  return (
    <motion.button
      ref={btnRef}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-2xl font-bold tracking-tight
        transition-all duration-300 flex items-center justify-center gap-2
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        ${className}
      `}
      {...props}
    >
      {/* Light sweep on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 animate-light-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/3" />
      </div>

      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default ShuttleButton;
