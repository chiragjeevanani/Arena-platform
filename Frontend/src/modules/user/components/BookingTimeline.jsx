import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronRight, X, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * BookingTimeline — Timeline-style booking card with cancel & reschedule
 */
const BookingTimelineCard = ({ booking: initialBooking, index = 0, onCancel }) => {
  const [booking, setBooking] = useState(initialBooking);
  const [countdown, setCountdown] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(initialBooking.date || '');
  const [rescheduledDone, setRescheduledDone] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Deterministic countdown based on index
  useEffect(() => {
    const baseHours = ((index + 1) * 3) % 24 || 1;
    const baseMins = ((index * 7) + 15) % 60;
    setCountdown(`${baseHours}h ${baseMins}m`);
  }, [index]);

  const handleCancel = () => {
    setCancelDone(true);
    setTimeout(() => {
      setShowCancelModal(false);
      setBooking(prev => ({ ...prev, status: 'Cancelled' }));
      setCancelDone(false);
      if (onCancel) onCancel(booking.id);
    }, 1200);
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative"
      >
        {index > 0 && (
          <div className="absolute -top-6 left-6 w-[2px] h-6 bg-gradient-to-b from-transparent to-[#eb483f]/20" />
        )}

        <div className={`rounded-xl transition-all duration-500 group border relative flex flex-col ${
          isCancelled ? 'opacity-50 grayscale' :
          isDark
            ? 'glass-card border-white/5 bg-white/5 hover:border-[#eb483f]/20 shadow-2xl shadow-black/40'
            : 'bg-white border-blue-50 shadow-[0_15px_35px_-12px_rgba(10,31,68,0.12)] hover:shadow-[0_25px_50px_-15px_rgba(10,31,68,0.2)] hover:border-blue-200'
        }`}>
          <div className="flex items-stretch h-[160px]">
            {/* Arena Image */}
            <div className="w-[110px] relative overflow-hidden flex-shrink-0">
              <img
                src={booking.arenaImage}
                alt={booking.arenaName}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-transparent" />
              {isCancelled ? (
                <div className="absolute top-3 left-0 bg-red-500/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded-r-lg z-10">Cancelled</div>
              ) : booking.status === 'Completed' ? (
                <div className="absolute top-3 left-0 bg-slate-500/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded-r-lg z-10">Past</div>
              ) : (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#eb483f] text-[#eb483f] text-[8px] font-black uppercase tracking-widest shadow-lg z-10">
                  <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                  Live
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-black text-[14px] leading-tight tracking-tight line-clamp-2 text-[#0F172A]">{booking.arenaName}</h4>
                  <div className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border shrink-0 ${
                    isCancelled ? 'bg-red-50 border-red-100 text-red-500' :
                    booking.status === 'Upcoming' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}>{booking.status}</div>
                </div>
                <div className="flex items-center gap-1 opacity-50">
                  <MapPin size={10} className="text-[#0F172A]" strokeWidth={3} />
                  <span className="text-[9px] font-bold truncate max-w-[100px] text-[#0F172A]">{booking.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 py-2.5 border-t border-dashed border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black uppercase tracking-[0.15em] opacity-40 text-[#eb483f]">Date</p>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} className="text-[#eb483f]" strokeWidth={2.5} />
                    <span className="text-[10px] font-black tracking-tight text-[#eb483f]">{booking.date}</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black uppercase tracking-[0.15em] opacity-40 text-[#eb483f]">Court</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-[#eb483f]" />
                    <span className="text-[10px] font-black text-[#eb483f]">{booking.courtName}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black uppercase tracking-[0.15em] opacity-40 text-[#eb483f]">Time Slot</p>
                  <div className="flex items-center gap-1">
                    <Clock size={11} className="text-blue-500" strokeWidth={2.5} />
                    <span className="text-[10px] font-black tracking-tight text-[#eb483f]">{booking.slot}</span>
                  </div>
                </div>
                {booking.status === 'Completed' && (
                  <span className="text-[10px] font-black text-[#eb483f]/50">OMR {Number(booking.price).toFixed(3)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 pb-3 pt-0 bg-slate-50/30 rounded-b-xl">
            {/* Countdown row */}
            {booking.status === 'Upcoming' && !isCancelled && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-100 shadow-sm mb-2 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFD600] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Starts in {countdown}</span>
              </div>
            )}
            {/* Buttons row — always full width */}
            <div className="flex items-center gap-2 w-full">
              {booking.status === 'Upcoming' && !isCancelled && (
                <>
                  <button
                    onClick={() => setShowRescheduleModal(true)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl font-black text-[9px] uppercase tracking-wider border border-slate-200 bg-white text-slate-500 hover:border-[#eb483f]/30 hover:text-[#eb483f] transition-all active:scale-95"
                  >
                    <RefreshCw size={10} strokeWidth={3} /> Reschedule
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl font-black text-[9px] uppercase tracking-wider border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-all active:scale-95"
                  >
                    <X size={10} strokeWidth={3} /> Cancel
                  </button>
                </>
              )}
              <button
                onClick={() => navigate(`/bookings/${booking.id || new Date().getTime()}`, { state: { booking } })}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-black text-[9px] uppercase tracking-wider bg-[#0F172A] text-white transition-all active:scale-95 hover:bg-[#eb483f] ${
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
                <h3 className="text-lg font-black text-[#1a2b3c] text-center">Cancel Booking?</h3>
                <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
                  Are you sure you want to cancel your booking at <span className="font-bold text-[#1a2b3c]">{booking.arenaName}</span>? A refund of <span className="font-bold text-[#eb483f]">OMR {Number(booking.price).toFixed(3)}</span> will be processed within 5–7 business days.
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
                  <div className="w-11 h-11 rounded-2xl bg-[#eb483f]/10 flex items-center justify-center">
                    <RefreshCw size={20} className="text-[#eb483f]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1a2b3c]">Reschedule Booking</h3>
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
                      className="w-full py-3 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#1a2b3c] outline-none focus:border-[#eb483f] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Current Time Slot</label>
                    <div className="py-3 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-400 flex items-center gap-2">
                      <Clock size={14} className="text-[#eb483f]" />{booking.slot}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-700">⚡ Same time slot will be requested on the new date. Subject to availability.</p>
                  </div>
                </div>

                <button onClick={handleReschedule} disabled={rescheduledDone || !rescheduleDate} className="w-full mt-5 py-3.5 rounded-2xl bg-[#eb483f] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#d43b33] transition-all disabled:opacity-60">
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
