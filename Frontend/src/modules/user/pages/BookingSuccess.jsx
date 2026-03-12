import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Share2, Download, Receipt } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ShuttleButton from '../components/ShuttleButton';
import { ShuttlecockIcon } from '../components/BadmintonIcons';

// Shuttlecock particle for confetti
const ShuttleParticle = ({ delay, x, y }) => (
  <motion.div
    initial={{ opacity: 0, y: 0, x: 0, scale: 0, rotate: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: [0, y],
      x: [0, x],
      scale: [0, 1, 0.5],
      rotate: [0, 360],
    }}
    transition={{ duration: 2, delay, ease: 'easeOut' }}
    className="absolute top-1/2 left-1/2 text-[#22FF88]/30"
  >
    <ShuttlecockIcon size={16} />
  </motion.div>
);

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const courtRef = useRef(null);
  const [showConfetti, setShowConfetti] = useState(true);

  // Generate shuttle particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 0.1,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 400,
  }));

  useEffect(() => {
    // Animated shuttle landing on court
    if (courtRef.current) {
      gsap.fromTo(courtRef.current,
        { y: -100, opacity: 0, scale: 1.5, rotation: -45 },
        { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 1, delay: 0.5, ease: 'bounce.out' }
      );
    }

    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#08142B] via-[#0A1F44] to-[#08142B] flex flex-col pt-16 relative overflow-hidden">
      {/* Shuttlecock confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {particles.map(p => (
            <ShuttleParticle key={p.id} delay={p.delay} x={p.x} y={p.y} />
          ))}
        </div>
      )}

      <div className="flex-1 px-6 space-y-8 relative z-10">
        {/* Success Icon */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="w-20 h-20 glass-neon neon-glow-strong rounded-3xl mx-auto flex items-center justify-center"
          >
            <Check size={40} className="text-[#22FF88]" />
          </motion.div>

          {/* Landing shuttle on court */}
          <div className="relative flex justify-center">
            <div ref={courtRef} className="text-[#22FF88]/50">
              <ShuttlecockIcon size={32} />
            </div>
          </div>

          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black text-white tracking-tight font-display"
            >
              Booking Done!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/30 text-sm mt-1"
            >
              Your court is reserved
            </motion.p>
          </div>
        </div>

        {/* Success Card — Ticket Style */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          className="glass-card rounded-3xl p-6 relative overflow-hidden"
        >
          {/* Court line pattern in background */}
          <div className="absolute inset-0 court-lines opacity-10" />

          <div className="space-y-6 relative z-10">
            {/* Transaction ID */}
            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
              <span>Transaction Success</span>
              <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>

            {/* Arena & Court */}
            <div className="space-y-1">
              <p className="text-white/25 text-[9px] font-bold uppercase tracking-[0.15em]">Arena & Court</p>
              <h3 className="text-lg font-bold text-white font-display leading-tight">
                {state?.arena?.name}
                <br />
                <span className="text-[#22FF88]">{state?.court?.name}</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-white/25 text-[9px] font-bold uppercase tracking-[0.15em]">Date</p>
                <p className="text-sm font-bold text-white mt-0.5">{state?.date}</p>
              </div>
              <div>
                <p className="text-white/25 text-[9px] font-bold uppercase tracking-[0.15em]">Time Slot</p>
                <p className="text-sm font-bold text-white mt-0.5">{state?.slot?.time}</p>
              </div>
            </div>

            {/* Dashed divider — Ticket tear */}
            <div className="border-t-2 border-dashed border-white/10 pt-5 flex items-center justify-between">
              <div>
                <p className="text-white/25 text-[9px] font-bold uppercase tracking-[0.15em]">Payment</p>
                <p className="text-lg font-black text-white font-display">₹{state?.amount?.toFixed(2)}</p>
              </div>
              <div className="glass-neon p-3 rounded-2xl">
                <Receipt size={20} className="text-[#22FF88]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 glass-light border border-white/10 py-4 rounded-2xl font-bold text-sm text-white/50 flex items-center justify-center gap-2 active:scale-95 transition-all hover:border-white/20">
            <Share2 size={16} />
            <span>Share</span>
          </button>
          <button className="flex-1 glass-light border border-white/10 py-4 rounded-2xl font-bold text-sm text-white/50 flex items-center justify-center gap-2 active:scale-95 transition-all hover:border-white/20">
            <Download size={16} />
            <span>Ticket</span>
          </button>
        </div>
      </div>

      {/* Dashboard Button */}
      <div className="p-6 mt-8 mb-4">
        <ShuttleButton
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => navigate('/')}
        >
          Go to Dashboard
        </ShuttleButton>
      </div>
    </div>
  );
};

export default BookingSuccess;
