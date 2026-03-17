import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Share2, Download, Receipt, Home, CalendarDays, Clock } from 'lucide-react';
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
    className={`absolute top-1/2 left-1/2 ${isDark ? 'text-[#eb483f]/30' : 'text-[#eb483f]/20'}`}
  >
    <ShuttlecockIcon size={16} />
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

  const amount = state?.amount || 0;

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
    <div className={`min-h-screen flex flex-col pt-8 md:pt-12 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0f1115]' : 'bg-slate-50'}`}>
      {/* Background Decorative Glows */}
      {!isDark && (
        <>
          <div className="absolute top-24 -right-24 w-80 h-80 bg-[#eb483f]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#eb483f]/10 rounded-full blur-[100px] pointer-events-none" />
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

      <div className="max-w-3xl mx-auto w-full px-6 space-y-6 md:space-y-8 relative z-10 pb-16">
        {/* Success Icon Section */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] mx-auto flex items-center justify-center relative z-10 ${isDark ? 'bg-[#eb483f]/10 border-2 border-[#eb483f] shadow-lg shadow-[#eb483f]/20' : 'bg-white border-4 border-[#eb483f]/10 shadow-xl shadow-[#eb483f]/20'}`}
            >
              <Check size={28} strokeWidth={3} className={'text-[#eb483f]'} />
            </motion.div>

            {/* Pulsing ring */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 rounded-[24px] md:rounded-[28px] -m-1.5 md:-m-2.5 border-2 ${isDark ? 'border-[#eb483f]/30' : 'border-[#eb483f]/20'}`}
            />
          </div>

          <div className="max-w-md mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl md:text-3xl font-black tracking-tight font-display mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {state?.batch ? 'Ready for Training!' : 'Slot Secured!'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-400'}`}
            >
              {state?.batch ? 'Your academic journey begins here' : 'Prepare for your match at the arena'}
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start max-w-3xl mx-auto">
          {/* Success Ticket Card - Left/Center */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            className={`lg:col-span-8 rounded-[32px] p-5 md:p-6 border shadow-2xl relative overflow-hidden transition-all group ${isDark ? 'bg-[#1a1d24] border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]' : 'bg-white border-[#eb483f]/10 shadow-[0_20px_60px_rgba(235,72,63,0.08)]'}`}
          >
            {/* Subtle court lines */}
            <div className={`absolute inset-0 court-lines ${isDark ? 'opacity-[0.03]' : 'opacity-5'} transition-opacity group-hover:opacity-10`} />

            {/* Accent Banner */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${isDark ? 'bg-gradient-to-r from-[#eb483f] to-[#d43b33]' : 'bg-gradient-to-r from-[#eb483f] to-[#d43b33]'}`} />

            <div className="space-y-5 md:space-y-6 relative z-10 pt-2">
              {/* Ticket Header */}
              <div className={`flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                <div className="flex items-center gap-2">
                  <Receipt size={14} className={isDark ? 'text-[#eb483f]/80' : 'text-[#eb483f]'} />
                  <span>Verified E-Ticket</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#eb483f] animate-pulse" />
                  <span className="font-mono">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
              </div>

              {/* Arena Info */}
              <div className="space-y-1">
                <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                  {state?.batch ? 'Academic Program' : 'Arena Details'}
                </p>
                <h3 className={`text-xl md:text-2xl font-black font-display leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {state?.batch ? state.batch.coachName : state?.arena?.name}
                  <span className={`block text-lg md:text-xl mt-0.5 ${isDark ? 'text-[#eb483f]/80' : 'text-[#eb483f]'}`}>
                    {state?.batch ? state.batch.level + ' Batch' : state?.court?.name}
                  </span>
                </h3>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-4 md:gap-6 bg-slate-50/50 dark:bg-white/5 p-4 rounded-[20px] border dark:border-white/5 border-slate-100">
                <div className="space-y-1">
                  <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Date</p>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className={isDark ? 'text-white/50' : 'text-slate-400'} />
                    <p className={`text-xs md:text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{state?.date}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Timing</p>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className={isDark ? 'text-white/50' : 'text-slate-400'} />
                    <p className={`text-xs md:text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{state?.batch ? state.batch.timing : state?.slot?.time}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Notch Separator */}
              <div className="relative h-px flex items-center pt-2">
                <div className={`absolute left-0 -translate-x-9 md:-translate-x-10 w-6 h-6 rounded-full border ${isDark ? 'bg-[#0f1115] border-white/5' : 'bg-slate-50 border-[#eb483f]/10 shadow-inner'}`} />
                <div className={`w-full border-t-[2px] border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
                <div className={`absolute right-0 translate-x-9 md:translate-x-10 w-6 h-6 rounded-full border ${isDark ? 'bg-[#0f1115] border-white/5' : 'bg-slate-50 border-[#eb483f]/10 shadow-inner'}`} />
              </div>

              {/* Total Paid Section */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mb-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Grand Total Paid</p>
                  <p className={`text-2xl md:text-3xl font-black font-display leading-none ${isDark ? 'text-[#eb483f]' : 'text-[#eb483f]'}`}>₹{amount.toFixed(2)}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-[12px] font-black text-[8px] md:text-[9px] uppercase tracking-widest border transition-all ${isDark
                    ? 'bg-[#eb483f]/10 border-[#eb483f]/20 text-[#eb483f]'
                    : 'bg-[#eb483f] text-white border-[#eb483f] shadow-lg shadow-[#eb483f]/20'
                  }`}>
                  Securely Paid
                </div>
              </div>
            </div>
          </motion.div>

          {/* Desktop Right Column: Quick Actions & Dashboard Navigation */}
          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-2">
              <h4 className={`text-[9px] font-black uppercase tracking-[0.25em] ml-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Actions</h4>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
                <button className={`h-12 rounded-[20px] font-black text-[10px] border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-[#eb483f]/10 shadow-lg shadow-[#eb483f]/5 text-[#eb483f] hover:border-[#eb483f]/30'
                  }`}>
                  <Share2 size={16} className={isDark ? 'text-[#eb483f]' : 'text-[#eb483f]'} />
                  <span className="uppercase tracking-widest mt-0.5">Share</span>
                </button>
                <button className={`h-12 rounded-[20px] font-black text-[10px] border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-[#eb483f]/10 shadow-lg shadow-[#eb483f]/5 text-[#eb483f] hover:border-[#eb483f]/30'
                  }`}>
                  <Download size={16} className={isDark ? 'text-[#eb483f]' : 'text-[#eb483f]'} />
                  <span className="uppercase tracking-widest mt-0.5">Download</span>
                </button>
              </div>
            </div>

            <div className={`p-5 rounded-[24px] border hidden lg:block ${isDark ? 'bg-gradient-to-br from-[#eb483f]/20 to-[#d43b33]/10 border-[#eb483f]/20' : 'bg-gradient-to-br from-[#eb483f] to-[#d43b33] shadow-xl shadow-[#eb483f]/30 text-white border-[#eb483f]'}`}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border ${isDark ? 'bg-[#eb483f]/10 border-[#eb483f]/20' : 'bg-white/10 border-white/20'}`}>
                  <Home size={20} className={isDark ? 'text-[#eb483f]' : 'text-white'} />
                </div>
                <div className="space-y-0.5">
                  <h4 className={`text-base font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-white'}`}>Ready for more?</h4>
                  <p className={`text-[8px] font-bold opacity-70 leading-relaxed uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-white/80'}`}>Dashboard updated.</p>
                </div>
                <ShuttleButton
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/home')}
                  className={`!rounded-[16px] py-3 transition-all shadow-lg text-[11px] ${isDark ? '!bg-[#eb483f] !text-white' : '!bg-white !text-[#eb483f] hover:scale-105'}`}
                >
                  Dashboard
                </ShuttleButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Sticky Footer - Mobile/Tablet Only */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 z-[60] lg:hidden border-t backdrop-blur-xl transition-all rounded-t-[28px] ${isDark ? 'bg-[#0f1115]/90 border-white/10 shadow-[0_-15px_50px_rgba(0,0,0,0.5)]' : 'bg-white/90 border-[#eb483f]/10 shadow-[0_-15px_50px_rgba(235,72,63,0.08)]'
        }`}>
        <ShuttleButton
          variant="primary"
          size="md"
          fullWidth
          icon={<Home size={18} />}
          onClick={() => navigate('/home')}
          className="shadow-2xl shadow-[#eb483f]/30 !rounded-[20px] active:scale-95 transition-all py-3.5 text-sm"
        >
          Back to Dashboard
        </ShuttleButton>
      </div>
    </div>
  );
};

export default BookingSuccess;
