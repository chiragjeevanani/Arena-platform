import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Share2, Download, Receipt, Home, PartyPopper, CalendarDays, MapPin, Clock } from 'lucide-react';
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
    <div className={`min-h-screen flex flex-col pt-12 md:pt-16 relative overflow-hidden transition-colors duration-500 ${
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

      <div className="max-w-4xl mx-auto w-full px-6 space-y-6 md:space-y-8 relative z-10 pb-12">
        {/* Success Icon Section */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-[24px] md:rounded-[28px] mx-auto flex items-center justify-center relative z-10 ${
                isDark ? 'glass-neon neon-glow-strong' : 'bg-white border-4 border-emerald-50 shadow-xl shadow-emerald-500/20'
              }`}
            >
              <Check size={32} strokeWidth={3} className={isDark ? 'text-[#22FF88]' : 'text-emerald-500'} />
            </motion.div>
            
            {/* Pulsing ring */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 rounded-[24px] md:rounded-[28px] -m-1.5 md:-m-2.5 border-2 ${isDark ? 'border-[#22FF88]/20' : 'border-emerald-500/20'}`}
            />
          </div>

          <div className="max-w-md mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl md:text-3xl font-black tracking-tight font-display mb-1.5 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}
            >
              {state?.batch ? 'All Set for Training!' : 'Slot Secured!'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-[9px] md:text-xs font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] ${isDark ? 'text-[#22FF88]/60' : 'text-blue-600/60'}`}
            >
              {state?.batch ? 'Your academic journey begins here' : 'Prepare for your match at the arena'}
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-4xl mx-auto">
           {/* Success Ticket Card - Left/Center */}
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            className={`lg:col-span-7 rounded-[36px] p-6 md:p-8 border shadow-2xl relative overflow-hidden transition-all group ${
              isDark ? 'glass-card border-white/5 bg-white/5' : 'bg-white border-blue-50 shadow-[0_20px_60px_rgba(10,31,68,0.08)]'
            }`}
          >
            {/* Subtle court lines */}
            <div className={`absolute inset-0 court-lines ${isDark ? 'opacity-10' : 'opacity-5'} transition-opacity group-hover:opacity-10`} />

            <div className="space-y-6 md:space-y-8 relative z-10">
              {/* Ticket Header */}
              <div className={`flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? 'text-white/20' : 'text-blue-500/40'}`}>
                <div className="flex items-center gap-2">
                  <Receipt size={14} className={isDark ? 'text-[#22FF88]/40' : 'text-blue-500/40'} />
                  <span>Verified E-Ticket</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="font-mono">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
              </div>

              {/* Arena Info */}
              <div className="space-y-2">
                <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/10' : 'text-slate-300'}`}>
                  {state?.batch ? 'Academic Program' : 'Arena Details'}
                </p>
                <h3 className={`text-xl md:text-2xl font-black font-display leading-tight tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                  {state?.batch ? state.batch.coachName : state?.arena?.name}
                  <span className={`block text-lg md:text-xl mt-1 ${isDark ? 'text-[#22FF88]' : 'text-blue-600'}`}>
                    {state?.batch ? state.batch.level + ' Batch' : state?.court?.name}
                  </span>
                </h3>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-1.5">
                  <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/10' : 'text-slate-300'}`}>Date</p>
                  <div className="flex items-center gap-2.5">
                     <CalendarDays size={16} className={isDark ? 'text-white/20' : 'text-slate-400'} />
                     <p className={`text-sm md:text-base font-black ${isDark ? 'text-white/80' : 'text-[#0A1F44]'}`}>{state?.date}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/10' : 'text-slate-300'}`}>Timing</p>
                  <div className="flex items-center gap-2.5">
                     <Clock size={16} className={isDark ? 'text-white/20' : 'text-slate-400'} />
                     <p className={`text-sm md:text-base font-black ${isDark ? 'text-white/80' : 'text-[#0A1F44]'}`}>{state?.batch ? state.batch.timing : state?.slot?.time}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Notch Separator */}
              <div className="relative h-px flex items-center">
                <div className={`absolute left-0 -translate-x-10 md:-translate-x-12 w-8 h-8 rounded-full border ${isDark ? 'bg-[#08142B] border-white/5 shadow-inner' : 'bg-slate-50 border-blue-50 shadow-inner'}`} />
                <div className={`w-full border-t-[2px] border-dashed ${isDark ? 'border-white/5' : 'border-slate-100'}`} />
                <div className={`absolute right-0 translate-x-10 md:translate-x-12 w-8 h-8 rounded-full border ${isDark ? 'bg-[#08142B] border-white/5 shadow-inner' : 'bg-slate-50 border-blue-50 shadow-inner'}`} />
              </div>

              {/* Total Paid Section */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mb-1 ${isDark ? 'text-white/10' : 'text-emerald-500/40'}`}>Grand Total Paid</p>
                  <p className={`text-2xl md:text-3xl font-black font-display leading-none ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{state?.amount?.toFixed(2)}</p>
                </div>
                <div className={`px-4 py-2 rounded-[16px] font-black text-[9px] md:text-[10px] uppercase tracking-widest border transition-all ${
                  isDark 
                    ? 'bg-[#22FF88]/10 border-[#22FF88]/20 text-[#22FF88]' 
                    : 'bg-emerald-500 text-white border-emerald-600 shadow-xl shadow-emerald-500/20'
                }`}>
                  Securely Paid
                </div>
              </div>
            </div>
          </motion.div>

          {/* Desktop Right Column: Quick Actions & Dashboard Navigation */}
          <div className="lg:col-span-5 space-y-6">
             <div className="space-y-3">
                <h4 className={`text-[10px] font-black uppercase tracking-[0.25em] ml-2 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Action Center</h4>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  <button className={`h-16 rounded-[24px] font-black text-xs border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                    isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-100 shadow-xl shadow-blue-900/5 text-[#0A1F44] hover:border-blue-200'
                  }`}>
                    <Share2 size={18} className="text-[#22FF88]" />
                    <span className="text-[9px] uppercase tracking-widest">Share Ticket</span>
                  </button>
                  <button className={`h-16 rounded-[24px] font-black text-xs border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                    isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-100 shadow-xl shadow-blue-900/5 text-[#0A1F44] hover:border-blue-200'
                  }`}>
                    <Download size={18} className="text-[#22FF88]" />
                    <span className="text-[9px] uppercase tracking-widest">Download PDF</span>
                  </button>
                </div>
             </div>

             <div className={`p-6 rounded-[32px] border hidden lg:block ${isDark ? 'bg-white/5 border-white/5 shadow-2xl' : 'bg-blue-600 shadow-2xl shadow-blue-600/30 text-white border-blue-500'}`}>
                <div className="flex flex-col items-center text-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                      <Home size={24} className="text-white" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-lg font-black font-display tracking-tight">Ready for more?</h4>
                      <p className="text-[9px] font-bold opacity-70 leading-relaxed uppercase tracking-widest">Your dashboard has been updated.</p>
                   </div>
                   <ShuttleButton
                     variant="secondary"
                     size="sm"
                     fullWidth
                     onClick={() => navigate('/home')}
                     className="!rounded-xl py-4 !bg-white !text-blue-600 hover:scale-105 transition-all shadow-xl"
                   >
                     Go to Dashboard
                   </ShuttleButton>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Dashboard Sticky Footer - Mobile/Tablet Only */}
      <div className={`fixed bottom-0 left-0 right-0 p-5 z-[60] lg:hidden border-t backdrop-blur-xl transition-all ${
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
