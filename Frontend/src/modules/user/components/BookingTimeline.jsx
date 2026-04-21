import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronRight, X, AlertTriangle, RefreshCw, CheckCircle, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { shouldCancelBookingViaApi, shouldCancelEnrollmentViaApi } from '../../../utils/bookingCancelPolicy';
import ArenaProfile from '../../../assets/ArenaProfile.jpeg';

/**
 * BookingTimeline — Timeline-style booking card with cancel & reschedule
 */
const BookingTimelineCard = ({
  booking: initialBooking,
  index = 0,
  onCancel,
  onServerCancelBooking,
  onServerCancelEnrollment,
}) => {
  const [booking, setBooking] = useState(initialBooking);
  const [countdown, setCountdown] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(initialBooking.date || '');
  const [rescheduledDone, setRescheduledDone] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Real-time countdown based on booking date/time
  useEffect(() => {
    const updateCountdown = () => {
      if (!booking.date || !booking.slot) return;
      
      try {
        // Robust parsing for slot formats like "06:00 PM", "15:00 - 16:00", or "15:00-16:00"
        const fullSlot = booking.slot.trim();
        // Extract the start time part (everything before the first dash or space-dash)
        const startTimeStr = fullSlot.split(/[–-]/)[0].trim(); 
        
        const ampmMatch = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        const militaryMatch = startTimeStr.match(/(\d+):(\d+)/);

        let hours = 0;
        let mins = 0;

        if (ampmMatch) {
          hours = parseInt(ampmMatch[1], 10);
          mins = parseInt(ampmMatch[2], 10);
          const period = ampmMatch[3].toUpperCase();
          if (period === 'PM' && hours < 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
        } else if (militaryMatch) {
          hours = parseInt(militaryMatch[1], 10);
          mins = parseInt(militaryMatch[2], 10);
        } else {
          setCountdown('--');
          return;
        }
        
        // Use individual year, month, day to avoid TZ issues
        const [y, m, d] = booking.date.split('-').map(Number);
        const bookingDate = new Date(y, m - 1, d, hours, mins, 0);
        const now = new Date();
        const diff = bookingDate - now;
        
        if (diff <= 0) {
          // If the booking is more than 1 hour old, hide countdown
          if (Math.abs(diff) > 3600000) {
             setCountdown('Ongoing/Started');
          } else {
             setCountdown('Started');
          }
          return;
        }
        
        const h = Math.floor(diff / (1000 * 60 * 60));
        const minPart = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (h > 0) {
          setCountdown(`${h}h ${minPart}m`);
        } else {
          setCountdown(`${minPart}m`);
        }
      } catch (e) {
        console.error('Countdown Error:', e);
        setCountdown('--');
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [booking.date, booking.slot]);

  const handleCancel = () => {
    const run = async () => {
      if (
        onServerCancelEnrollment &&
        shouldCancelEnrollmentViaApi(booking, isApiConfigured(), Boolean(getAuthToken()))
      ) {
        try {
          await onServerCancelEnrollment(booking.id);
        } catch (e) {
          alert(e.message || 'Could not cancel enrollment');
          setShowCancelModal(false);
          return;
        }
      } else if (
        onServerCancelBooking &&
        shouldCancelBookingViaApi(booking, isApiConfigured(), Boolean(getAuthToken()))
      ) {
        try {
          await onServerCancelBooking(booking.id);
        } catch (e) {
          alert(e.message || 'Could not cancel booking');
          setShowCancelModal(false);
          return;
        }
      }
      setCancelDone(true);
      setTimeout(() => {
        setShowCancelModal(false);
        setBooking((prev) => ({ ...prev, status: 'Cancelled' }));
        setCancelDone(false);
        if (onCancel) onCancel(booking.id);
      }, 1200);
    };
    void run();
  };

  const handleReschedule = () => {
    setRescheduledDone(true);
    setTimeout(() => {
      setShowRescheduleModal(false);
      setBooking(prev => ({ ...prev, date: rescheduleDate }));
      setRescheduledDone(false);
    }, 1200);
  };

  const isCancelled = booking.status === 'Cancelled';

  // Detect if this booking's slot is a Prime slot (5 PM onwards)
  const isPrimeSlot = (() => {
    if (!booking.slot) return false;
    const timeStr = booking.slot.split(' - ')[0]; // e.g. "07:00 PM"
    const [time, period] = timeStr.trim().split(' ');
    if (period === 'PM') {
      const hour = parseInt(time.split(':')[0]);
      return hour >= 5; // 5 PM and later = Prime
    }
    return false;
  })();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative"
      >
        {index > 0 && (
          <div className="absolute -top-6 left-6 w-[2px] h-6 bg-gradient-to-b from-transparent to-[#CE2029]/20" />
        )}

        <div className={`rounded-xl transition-all duration-500 group border relative flex flex-col ${
          isCancelled ? 'opacity-50 grayscale' :
          isDark
            ? 'glass-card border-white/5 bg-white/5 hover:border-[#CE2029]/20 shadow-2xl shadow-black/40'
            : 'bg-white border-blue-50 shadow-[0_15px_35px_-12px_rgba(10,31,68,0.12)] hover:shadow-[0_25px_50px_-15px_rgba(10,31,68,0.2)] hover:border-blue-200'
        }`}>
          <div className="flex items-stretch h-[170px]">
            {/* Arena Image */}
            <div className="w-[125px] relative overflow-hidden flex-shrink-0">
              <img
                src={booking.arenaImage || ArenaProfile}
                alt={booking.arenaName}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => { e.target.src = ArenaProfile; }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-transparent" />
              {/* Prime badge on image corner */}
              {isPrimeSlot && !isCancelled && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-amber-500/90 backdrop-blur-sm z-10">
                  <Star size={8} fill="white" className="text-white" />
                  <span className="text-[7px] font-black uppercase tracking-widest text-white">Prime</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
              <div className="space-y-1.5">
                <div className="flex justify-between items-start gap-1">
                  <div className="flex flex-col gap-0.5 max-w-[70%]">
                    <h4 className="font-black text-[15px] leading-tight tracking-tight line-clamp-2 text-[#36454F]">{booking.arenaName}</h4>
                    {/* Prime slot highlight */}
                    {isPrimeSlot && !isCancelled && (
                      <div className="flex items-center gap-1">
                        <Star size={9} fill="#f59e0b" className="text-amber-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-amber-600">Prime Slot</span>
                      </div>
                    )}
                  </div>
                  <div className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border shrink-0 mt-0.5 ${
                    isCancelled ? 'bg-red-50 border-red-100 text-red-500' :
                    booking.status === 'Upcoming' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}>{booking.status}</div>
                </div>
                <div className="flex items-center gap-1.5 opacity-60">
                  <MapPin size={10} className="text-slate-400" strokeWidth={3} />
                  <span className="text-[9px] font-bold truncate text-slate-500">{booking.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 py-3 border-t border-dashed border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] opacity-40 text-[#CE2029]">Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-[#CE2029]" strokeWidth={2.5} />
                    <span className="text-[12px] font-black tracking-tight text-[#CE2029]">{booking.date}</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] opacity-40 text-[#CE2029]">Court</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#CE2029]" />
                    <span className="text-[12px] font-black text-[#CE2029]">{booking.courtName}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black uppercase tracking-[0.15em] opacity-40 text-[#CE2029]">Time Slot</p>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-blue-500" strokeWidth={2.5} />
                    <span className="text-[12px] font-black tracking-tight text-[#CE2029]">{booking.slot}</span>
                  </div>
                </div>
                {booking.status === 'Completed' && (
                  <span className="text-[12px] font-black text-[#CE2029]/50">OMR {Number(booking.price).toFixed(3)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 pb-3 pt-0 bg-slate-50/30 rounded-b-xl">
            {/* Countdown row */}
            {booking.status === 'Upcoming' && !isCancelled && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm mb-3 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFD600] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-amber-500">Starts in {countdown}</span>
              </div>
            )}
            {/* Buttons row — always full width */}
            <div className="flex items-center gap-2 w-full">
              {booking.status === 'Upcoming' && !isCancelled && (
                <>
                  <button
                    onClick={() => setShowRescheduleModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-wider border border-slate-200 bg-white text-slate-500 hover:border-[#CE2029]/30 hover:text-[#CE2029] transition-all active:scale-95"
                  >
                    <RefreshCw size={10} strokeWidth={3} /> Reschedule
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-wider border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-all active:scale-95"
                  >
                    <X size={10} strokeWidth={3} /> Cancel
                  </button>
                </>
              )}
              <button
                onClick={() => navigate(`/bookings/${booking.id || new Date().getTime()}`, { state: { booking } })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-wider bg-[#0F172A] text-white transition-all active:scale-95 hover:bg-[#CE2029] ${
                  booking.status === 'Upcoming' && !isCancelled ? 'px-4' : 'flex-1 px-4'
                }`}
              >
                Details <ChevronRight size={11} strokeWidth={4} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !cancelDone && setShowCancelModal(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[28px] shadow-2xl overflow-hidden border border-slate-100">
              <div className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={28} className="text-red-500" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-black text-[#36454F] text-center">Cancel Booking?</h3>
                <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
                  Are you sure you want to cancel your booking at <span className="font-bold text-[#36454F]">{booking.arenaName}</span>? A refund of <span className="font-bold text-[#CE2029]">OMR {Number(booking.price).toFixed(3)}</span> will be processed within 5–7 business days.
                </p>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all">Keep It</button>
                  <button onClick={handleCancel} disabled={cancelDone} className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                    {cancelDone ? <><CheckCircle size={14} /> Done</> : 'Yes, Cancel'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !rescheduledDone && setShowRescheduleModal(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[28px] shadow-2xl overflow-hidden border border-slate-100">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-[#CE2029]/10 flex items-center justify-center">
                    <RefreshCw size={20} className="text-[#CE2029]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#36454F]">Reschedule Booking</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{booking.arenaName}</p>
                  </div>
                  <button onClick={() => setShowRescheduleModal(false)} className="ml-auto w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">New Date</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full py-3 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#36454F] outline-none focus:border-[#CE2029] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Current Time Slot</label>
                    <div className="py-3 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-400 flex items-center gap-2">
                      <Clock size={14} className="text-[#CE2029]" />{booking.slot}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-700">⚡ Same time slot will be requested on the new date. Subject to availability.</p>
                  </div>
                </div>

                <button onClick={handleReschedule} disabled={rescheduledDone || !rescheduleDate} className="w-full mt-5 py-3.5 rounded-2xl bg-[#CE2029] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#d43b33] transition-all disabled:opacity-60">
                  {rescheduledDone ? <><CheckCircle size={16} /> Rescheduled!</> : <><RefreshCw size={14} /> Confirm Reschedule</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BookingTimelineCard;
