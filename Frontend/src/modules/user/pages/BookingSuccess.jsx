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
    className={`absolute top-1/2 left-1/2 ${isDark ? 'text-[#CE2029]/30' : 'text-[#CE2029]/20'}`}
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
      if (state.type === 'membership') {
        // Membership activation
        newBooking = {
          id: `MEM-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          arenaName: "Arena Membership",
          arenaImage: null,
          location: "Global Access",
          courtName: state.plan?.name,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          slot: state.plan?.duration,
          status: 'Active',
          type: 'Membership',
          price: state.amount
        };
        
        // Save membership status
        const membershipData = {
          status: 'active',
          planId: state.plan?.id,
          planName: state.plan?.name,
          category: state.plan?.category,
          discountPercent: state.plan?.discountPercent,
          startDate: new Date().toISOString().split('T')[0],
          expiryDate: '2027-04-02', // 1 year approx for demo
          benefits: state.plan?.benefits
        };
        localStorage.setItem('userMembership', JSON.stringify(membershipData));
      } else if (state.batch) {
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
          <div className="absolute top-24 -right-24 w-80 h-80 bg-[#CE2029]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#CE2029]/10 rounded-full blur-[100px] pointer-events-none" />
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

      <div className="max-w-3xl mx-auto w-full px-6 space-y-6 md:space-y-8 relative z-10 pb-28 lg:pb-16">
        {/* Success Icon Section */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] mx-auto flex items-center justify-center relative z-10 ${isDark ? 'bg-[#CE2029]/10 border-2 border-[#CE2029] shadow-lg shadow-[#CE2029]/20' : 'bg-white border-4 border-[#CE2029]/10 shadow-xl shadow-[#CE2029]/20'}`}
            >
              <Check size={28} strokeWidth={3} className={'text-[#CE2029]'} />
            </motion.div>

            {/* Pulsing ring */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 rounded-[24px] md:rounded-[28px] -m-1.5 md:-m-2.5 border-2 ${isDark ? 'border-[#CE2029]/30' : 'border-[#CE2029]/20'}`}
            />
          </div>

          <div className="max-w-md mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl md:text-3xl font-black tracking-tight font-display mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {state?.type === 'membership' ? 'Welcome to the Club!' : state?.batch ? 'Ready for Training!' : 'Slot Secured!'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-400'}`}
            >
              {state?.type === 'membership' ? 'Your membership is now active' : state?.batch ? 'Your academic journey begins here' : 'Prepare for your match at the arena'}
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start max-w-3xl mx-auto">
          {/* Success Ticket Card - Left/Center */}
          <motion.div
            id="print-area"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            className={`lg:col-span-8 rounded-[32px] p-5 md:p-6 border shadow-2xl relative overflow-hidden transition-all group ${isDark ? 'bg-[#1a1d24] border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]' : 'bg-white border-[#CE2029]/10 shadow-[0_20px_60px_rgba(206, 32, 41,0.08)]'}`}
          >
            {/* Subtle court lines */}
            <div className={`absolute inset-0 court-lines ${isDark ? 'opacity-[0.03]' : 'opacity-5'} transition-opacity group-hover:opacity-10`} />
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${isDark ? 'bg-gradient-to-r from-[#CE2029] to-[#d43b33]' : 'bg-gradient-to-r from-[#CE2029] to-[#d43b33]'}`} />

            <div className="space-y-5 md:space-y-6 relative z-10 pt-2">
              {/* Ticket Header */}
              <div className={`flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                <div className="flex items-center gap-2">
                  <Receipt size={14} className={isDark ? 'text-[#CE2029]/80' : 'text-[#CE2029]'} />
                  <span>Verified E-Ticket</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#CE2029] animate-pulse" />
                  <span className="font-mono">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
              </div>

              {/* Arena Info */}
              <div className="space-y-1">
                <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                  {state?.type === 'membership' ? 'Membership Active' : state?.batch ? 'Academic Program' : state?.type === 'event' ? 'Official Enrollment' : 'Arena Details'}
                </p>
                <h3 className={`text-xl md:text-2xl font-black font-display leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {state?.type === 'membership' ? state.plan?.name : state?.batch ? state.batch.coachName : state?.type === 'event' ? state.eventTitle : state?.arena?.name}
                  <span className={`block text-lg md:text-xl mt-0.5 ${isDark ? 'text-[#CE2029]/80' : 'text-[#CE2029]'}`}>
                    {state?.type === 'membership' ? 'Tier ' + state.plan?.category : state?.batch ? state.batch.level + ' Batch' : state?.type === 'event' ? state.eventCategory : state?.court?.name}
                  </span>
                </h3>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-4 md:gap-6 bg-slate-50/50 dark:bg-white/5 p-4 rounded-[20px] border dark:border-white/5 border-slate-100">
                <div className="space-y-1">
                  <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{state?.type === 'membership' ? 'Activation Date' : 'Date'}</p>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className={isDark ? 'text-white/50' : 'text-slate-400'} />
                    <p className={`text-xs md:text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{state?.type === 'membership' ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : state?.date}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{state?.type === 'membership' ? 'Validity Period' : 'Timing'}</p>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className={isDark ? 'text-white/50' : 'text-slate-400'} />
                    <p className={`text-xs md:text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{state?.type === 'membership' ? state.plan?.duration : state?.batch ? state.batch.timing : state?.slot?.time}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Notch Separator */}
              <div className="relative h-px flex items-center pt-2">
                <div className={`absolute left-0 -translate-x-9 md:-translate-x-10 w-6 h-6 rounded-full border ${isDark ? 'bg-[#0f1115] border-white/5' : 'bg-slate-50 border-[#CE2029]/10 shadow-inner'}`} />
                <div className={`w-full border-t-[2px] border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
                <div className={`absolute right-0 translate-x-9 md:translate-x-10 w-6 h-6 rounded-full border ${isDark ? 'bg-[#0f1115] border-white/5' : 'bg-slate-50 border-[#CE2029]/10 shadow-inner'}`} />
              </div>

              {/* Total Paid Section */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mb-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Grand Total Paid</p>
                  <p className={`text-2xl md:text-3xl font-black font-display leading-none ${isDark ? 'text-[#CE2029]' : 'text-[#CE2029]'}`}>OMR {amount.toFixed(3)}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-[12px] font-black text-[8px] md:text-[9px] uppercase tracking-widest border transition-all ${isDark
                    ? 'bg-[#CE2029]/10 border-[#CE2029]/20 text-[#CE2029]'
                    : 'bg-[#CE2029] text-white border-[#CE2029] shadow-lg shadow-[#CE2029]/20'
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
                <button 
                  onClick={() => {
                    const shareData = {
                      title: 'Arena Booking Confirmation',
                      text: `I just booked ${state?.court?.name || 'a session'} at ${state?.arena?.name || 'the arena'} for ${state?.date} at ${state?.slot?.time || 'requested slot'}. Join me!`,
                      url: window.location.href,
                    };
                    if (navigator.share) {
                      navigator.share(shareData).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(shareData.text).then(() => {
                        alert('Booking details copied to clipboard!');
                      });
                    }
                  }}
                  className={`h-12 rounded-[20px] font-black text-[10px] border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-[#CE2029]/10 shadow-lg shadow-[#CE2029]/5 text-[#CE2029] hover:border-[#CE2029]/30'
                  }`}>
                  <Share2 size={16} className={isDark ? 'text-[#CE2029]' : 'text-[#CE2029]'} />
                  <span className="uppercase tracking-widest mt-0.5">Share</span>
                </button>
                <button 
                  onClick={() => window.print()}
                  className={`h-12 rounded-[20px] font-black text-[10px] border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-[#CE2029]/10 shadow-lg shadow-[#CE2029]/5 text-[#CE2029] hover:border-[#CE2029]/30'
                  }`}>
                  <Download size={16} className={isDark ? 'text-[#CE2029]' : 'text-[#CE2029]'} />
                  <span className="uppercase tracking-widest mt-0.5">Download</span>
                </button>
              </div>
            </div>
            
            {/* Simple Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                @page { margin: 0; size: auto; }
                body { background: white !important; margin: 0 !important; padding: 0 !important; }
                
                /* Hide clutter */
                nav, footer, .lg\\:hidden, .lg\\:col-span-4, 
                .text-center.space-y-3, button, 
                .relative.h-14, .fixed.bottom-0 { 
                  display: none !important; 
                }
                
                /* Reset containers to avoid layout shifts in print */
                .min-h-screen, .max-w-3xl, .grid, .lg\\:grid-cols-12 {
                   display: block !important;
                   position: static !important;
                   margin: 0 !important;
                   padding: 0 !important;
                   max-width: none !important;
                   border: none !important;
                   box-shadow: none !important;
                }

                #print-area {
                  display: block !important;
                  position: absolute !important;
                  top: 50% !important;
                  left: 50% !important;
                  transform: translate(-50%, -50%) scale(1.1) !important;
                  width: 500px !important;
                  margin: 0 !important;
                  border: 1px solid #f1f5f9 !important;
                  background: white !important;
                  box-shadow: none !important;
                  visibility: visible !important;
                  z-index: 9999 !important;
                }

                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              }
            `}} />

            <div className={`p-5 rounded-[24px] border hidden lg:block ${isDark ? 'bg-gradient-to-br from-[#CE2029]/20 to-[#d43b33]/10 border-[#CE2029]/20' : 'bg-gradient-to-br from-[#CE2029] to-[#d43b33] shadow-xl shadow-[#CE2029]/30 text-white border-[#CE2029]'}`}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border ${isDark ? 'bg-[#CE2029]/10 border-[#CE2029]/20' : 'bg-white/10 border-white/20'}`}>
                  <Home size={20} className={isDark ? 'text-[#CE2029]' : 'text-white'} />
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
                  className={`!rounded-[16px] py-3 transition-all shadow-lg text-[11px] ${isDark ? '!bg-[#CE2029] !text-white' : '!bg-white !text-[#CE2029] hover:scale-105'}`}
                >
                  Dashboard
                </ShuttleButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Sticky Footer - Mobile/Tablet Only */}
      <div className={`fixed bottom-0 left-0 right-0 p-3 z-[60] lg:hidden border-t backdrop-blur-xl transition-all rounded-t-3xl ${isDark ? 'bg-[#0f1115]/90 border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]' : 'bg-white/95 border-[#CE2029]/10 shadow-[0_-5px_30px_rgba(206, 32, 41,0.05)]'
        }`}>
        <ShuttleButton
          variant="primary"
          size="md"
          fullWidth
          icon={<Home size={16} />}
          onClick={() => navigate('/home')}
          className="shadow-md shadow-[#CE2029]/20 !rounded-2xl active:scale-95 transition-all py-3 text-xs"
        >
          Back to Dashboard
        </ShuttleButton>
      </div>
    </div>
  );
};

export default BookingSuccess;
