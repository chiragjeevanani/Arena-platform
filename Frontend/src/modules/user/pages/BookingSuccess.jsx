import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Share2, Download, Receipt, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ShuttleButton from '../components/ShuttleButton';
import { ShuttlecockIcon } from '../components/BadmintonIcons';
import { useTheme } from '../context/ThemeContext';

// Shuttlecock particle for confetti
const ShuttleParticle = ({ delay, x, y, isDark }) => (
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
    className={`absolute top-1/2 left-1/2 ${isDark ? 'text-[#22FF88]/30' : 'text-blue-500/20'}`}
  >
    < ShuttlecockIcon size={16} />
  </motion.div>
);

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
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
    // Save booking/enrollment to localStorage for persistence in Dashboard
    if (state) {
      const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      
      let newBooking;
      if (state.batch) {
        // Coaching enrollment
        newBooking = {
          id: `AC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          arenaName: "Academy Hub",
          arenaImage: state.batch.image,
          location: "Premium Class",
          coachName: state.batch.coachName,
          courtName: state.batch.level,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          slot: state.batch.timing,
          status: 'Upcoming',
          type: 'Coaching',
          price: state.amount
        };
      } else {
        // Arena booking
        newBooking = {
          id: `BK-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          arenaName: state.arena?.name,
          arenaImage: state.arena?.image,
          location: state.arena?.location,
          courtName: state.court?.name,
          date: state.date,
          slot: state.slot?.time,
          status: 'Upcoming',
          type: 'Booking',
          price: state.amount
        };
      }
      
      // Prevent duplicate saving on re-renders
      if (!existingBookings.find(b => b.id === newBooking.id)) {
        localStorage.setItem('userBookings', JSON.stringify([newBooking, ...existingBookings]));
      }
    }

    // Animated shuttle landing on court
    if (courtRef.current) {
      gsap.fromTo(courtRef.current,
        { y: -100, opacity: 0, scale: 1.5, rotation: -45 },
        { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 1, delay: 0.5, ease: 'bounce.out' }
      );
    }

    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <div className={`min-h-screen flex flex-col pt-16 relative overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-[#08142B]' : 'bg-slate-50'
    }`}>
      {/* Background Decorative Glows */}
      {!isDark && (
        <>
          <div className="absolute top-24 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#22FF88]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Shuttlecock confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {particles.map(p => (
            <ShuttleParticle key={p.id} delay={p.delay} x={p.x} y={p.y} isDark={isDark} />
          ))}
        </div>
      )}

      <div className="flex-1 px-6 space-y-8 relative z-10">
        {/* Success Icon Section */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className={`w-20 h-20 rounded-[28px] mx-auto flex items-center justify-center relative z-10 ${
                isDark ? 'glass-neon neon-glow-strong' : 'bg-white border-4 border-emerald-50 shadow-xl shadow-emerald-500/10'
              }`}
            >
              <Check size={40} strokeWidth={3} className={isDark ? 'text-[#22FF88]' : 'text-emerald-500'} />
            </motion.div>
            
            {/* Pulsing ring */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 rounded-[28px] -m-1.5 border-2 ${isDark ? 'border-[#22FF88]/20' : 'border-emerald-500/20'}`}
            />
          </div>

          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl font-black tracking-tight font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}
            >
              {state?.batch ? 'Enrolled Successfully!' : 'Booking Success!'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-[10px] mt-1 font-bold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-slate-400'}`}
            >
              {state?.batch ? 'Your class subscription is active' : 'Your court is now reserved'}
            </motion.p>
          </div>
        </div>

        {/* Success Ticket Card */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          className={`rounded-[32px] p-6 border shadow-2xl relative overflow-hidden transition-all ${
            isDark ? 'glass-card border-white/5 bg-white/5' : 'bg-white border-blue-50 shadow-[0_20px_60px_rgba(10,31,68,0.06)]'
          }`}
        >
          {/* Subtle court lines */}
          <div className={`absolute inset-0 court-lines ${isDark ? 'opacity-10' : 'opacity-5'}`} />

          <div className="space-y-6 relative z-10">
            {/* Ticket Header */}
            <div className={`flex justify-between items-center text-[9px] font-black uppercase tracking-[0.25em] ${isDark ? 'text-white/20' : 'text-blue-500/40'}`}>
              <div className="flex items-center gap-2">
                <Receipt size={12} className={isDark ? 'text-[#22FF88]/40' : 'text-blue-500/40'} />
                <span>E-Ticket</span>
              </div>
              <span className="font-mono">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>

            {/* Arena Info */}
            <div className="space-y-1.5">
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/10' : 'text-slate-300'}`}>
                {state?.batch ? 'Academy Program' : 'Booking Venue'}
              </p>
              <h3 className={`text-xl font-black font-display leading-tight tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                {state?.batch ? state.batch.coachName : state?.arena?.name}
                <span className={`block text-lg mt-0.5 ${isDark ? 'text-[#22FF88]' : 'text-blue-600'}`}>
                  {state?.batch ? state.batch.level + ' Batch' : state?.court?.name}
                </span>
              </h3>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/10' : 'text-slate-300'}`}>Date</p>
                <p className={`text-sm font-black ${isDark ? 'text-white/80' : 'text-[#0A1F44]'}`}>{state?.date}</p>
              </div>
              <div className="space-y-1">
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/10' : 'text-slate-300'}`}>Time Slot</p>
                <p className={`text-sm font-black ${isDark ? 'text-white/80' : 'text-[#0A1F44]'}`}>{state?.batch ? state.batch.timing : state?.slot?.time}</p>
              </div>
            </div>

            {/* Bottom Notch Separator */}
            <div className="relative h-px flex items-center">
              <div className={`absolute left-0 -translate-x-10 w-7 h-7 rounded-full border ${isDark ? 'bg-[#08142B] border-white/5 shadow-inner' : 'bg-slate-50 border-blue-50 shadow-inner'}`} />
              <div className={`w-full border-t-2 border-dashed ${isDark ? 'border-white/5' : 'border-slate-100'}`} />
              <div className={`absolute right-0 translate-x-10 w-7 h-7 rounded-full border ${isDark ? 'bg-[#08142B] border-white/5 shadow-inner' : 'bg-slate-50 border-blue-50 shadow-inner'}`} />
            </div>

            {/* Total Paid */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${isDark ? 'text-white/10' : 'text-emerald-500/40'}`}>Paid Amount</p>
                <p className={`text-2xl font-black font-display leading-none ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{state?.amount?.toFixed(2)}</p>
              </div>
              <div className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest border ${
                isDark ? 'bg-[#22FF88]/10 border-[#22FF88]/20 text-[#22FF88]' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}>
                Confirmed
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button className={`flex-1 group h-14 rounded-[20px] font-black text-xs border flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-100 shadow-sm text-[#0A1F44] hover:border-slate-300'
          }`}>
            <Share2 size={16} className="transition-transform group-hover:rotate-12" />
            <span>Forward</span>
          </button>
          <button className={`flex-1 group h-14 rounded-[20px] font-black text-xs border flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-100 shadow-sm text-[#0A1F44] hover:border-slate-300'
          }`}>
            <Download size={16} className="transition-transform group-hover:translate-y-0.5" />
            <span>Save Ticket</span>
          </button>
        </div>
      </div>

      {/* Dashboard Sticky Footer */}
      <div className={`fixed bottom-0 left-0 right-0 p-5 z-[60] md:max-w-[450px] md:mx-auto border-t backdrop-blur-xl transition-all ${
        isDark ? 'bg-[#08142B]/90 border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]' : 'bg-white/80 border-blue-50 shadow-[0_-15px_50px_rgba(10,31,68,0.08)]'
      }`}>
        <ShuttleButton
          variant="primary"
          size="md"
          fullWidth
          icon={<Home size={18} />}
          onClick={() => navigate('/home')}
          className="shadow-2xl shadow-blue-500/20 !rounded-2xl active:scale-95 transition-all py-4"
        >
          Back to Dashboard
        </ShuttleButton>
      </div>
    </div>
  );
};

export default BookingSuccess;
