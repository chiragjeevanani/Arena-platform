import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

/**
 * ShuttleButton â€” Premium action button with racket swing micro-interaction
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
    primary: 'bg-[#CE2029] text-white hover:shadow-[0_0_30px_rgba(206, 32, 41,0.3)]',
    secondary: 'bg-[#CE2029]/10 text-[#CE2029] border border-[#CE2029]/20 hover:border-[#CE2029]/40',
    outline: 'bg-transparent text-[#CE2029] border border-[#CE2029]/30 hover:bg-[#CE2029]/5',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-50',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20',
    blue: 'bg-gradient-to-br from-[#CE2029] via-[#D94F47] to-[#CE2029] text-white shadow-xl shadow-[#CE2029]/20 border border-white/20 hover:shadow-[#CE2029]/40 relative overflow-hidden',
    premium: 'bg-gradient-to-br from-[#CE2029] to-[#D94F47] text-white border border-white/10 hover:shadow-[0_0_30px_rgba(206, 32, 41,0.25)]',
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
      {/* Glossy reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Light sweep on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 animate-light-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/3" />
      </div>

      {icon && <span className="flex-shrink-0 relative z-10">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default ShuttleButton;


