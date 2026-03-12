import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';

const BookingSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { arena, court, date, slot } = state || {};

  if (!arena) return <div className="p-10 text-center text-white/40">No booking details found</div>;

  const total = slot?.price || 0;
  const tax = total * 0.18;

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 sticky top-0 z-50 bg-[#08142B]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl glass-light flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
          >
            <ArrowLeft size={18} className="text-white/60" />
          </button>
          <h1 className="text-lg font-bold text-white font-display text-center flex-1 pr-10">Review Booking</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* Arena Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-5"
        >
          <div className="flex gap-4">
            <div className="w-18 h-18 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
              <img src={arena.image} alt={arena.name} className="w-full h-full object-cover" style={{ width: 72, height: 72 }} />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-bold text-white text-base font-display leading-tight">{arena.name}</h3>
              <div className="flex items-center text-white/30 text-[10px] font-bold uppercase tracking-[0.15em] gap-1">
                <MapPin size={11} className="text-[#22FF88]/50" />
                {arena.location}
              </div>
              <p className="text-[10px] text-white/20 line-clamp-1">{arena.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Booking Details */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-5 divide-y divide-white/5"
        >
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1EE7FF]/10 flex items-center justify-center text-[#1EE7FF]">
                <Calendar size={16} />
              </div>
              <span className="text-xs font-bold text-white/30 uppercase tracking-[0.15em]">Date</span>
            </div>
            <span className="text-sm font-bold text-white">{date}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFD600]/10 flex items-center justify-center text-[#FFD600]">
                <Clock size={16} />
              </div>
              <span className="text-xs font-bold text-white/30 uppercase tracking-[0.15em]">Slot</span>
            </div>
            <span className="text-sm font-bold text-white">{slot?.time}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22FF88]/10 flex items-center justify-center text-[#22FF88]">
                <CheckCircle size={16} />
              </div>
              <span className="text-xs font-bold text-white/30 uppercase tracking-[0.15em]">Court</span>
            </div>
            <span className="text-sm font-bold text-white">{court?.name} ({court?.type})</span>
          </div>
        </motion.div>

        {/* Price Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-6 space-y-5"
        >
          <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] text-center">Payment Info</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/30">Subtotal</span>
              <span className="font-bold text-white">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/30">GST (18%)</span>
              <span className="font-bold text-white">₹{tax.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-base font-bold text-white">Total Amount</span>
              <span className="text-2xl font-black text-[#22FF88] font-display">₹{(total + tax).toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-5 z-[60] md:max-w-[450px] md:mx-auto">
        <ShuttleButton
          variant="primary"
          size="lg"
          fullWidth
          icon={<ArrowRight size={18} />}
          onClick={() => navigate('/payment', { state: { amount: total + tax, arena, court, date, slot } })}
        >
          Confirm Booking
        </ShuttleButton>
      </div>
    </div>
  );
};

export default BookingSummary;
