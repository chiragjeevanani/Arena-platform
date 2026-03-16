import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { useTheme } from '../context/ThemeContext';

const BookingSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const storedArena = JSON.parse(localStorage.getItem("selectedArena"));
  const { arena: stateArena, court: stateCourt, date, slot } = state || {};

  const arena = stateArena || storedArena;
  const court = stateCourt || storedArena?.selectedCourt;

  if (!arena) return (
    <div className={`p-10 text-center ${'text-[#eb483f]/40'}`}>
      No booking details found. Please select an arena first.
    </div>
  );

  const total = slot?.price || 0;
  const tax = total * 0.18;

  return (
    <div className={`min-h-screen pb-40 relative overflow-hidden ${'bg-slate-50'}`}>
      {/* Background Decorative Glows */}
      {!isDark && (
        <>
          <div className="absolute top-24 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#eb483f]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Header */}
      <div className={`px-6 pt-6 pb-4 sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${'bg-[#eb483f] border-blue-900/10 rounded-b-[24px] shadow-[0_8px_25px_rgba(10,31,68,0.12)]'
        }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border active:scale-95 transition-all ${'bg-white/10 border-white/20 text-white shadow-sm'
              }`}
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-bold text-white font-display text-center flex-1 pr-10">Review Booking</h1>
        </div>
      </div>

      <div className="px-6 py-6 border-t-0">
        {/* Unified Premium Ticket Card */}
        <div
          className={`rounded-[32px] overflow-hidden border shadow-2xl relative ${'bg-white border-blue-100/50 shadow-[0_15px_45px_rgba(10,31,68,0.06)]'
            }`}
        >
          {/* Top Section: Venue Header */}
          <div className={`p-5 flex gap-4 items-center ${'bg-slate-50/50'}`}>
            <div className={`w-16 h-16 rounded-[20px] overflow-hidden border p-1 shrink-0 ${'border-blue-100 bg-white shadow-md'
              }`}>
              <img src={arena.image} alt={arena.name} className="w-full h-full object-cover rounded-[14px]" />
            </div>
            <div className="space-y-0.5">
              <h3 className={`font-black text-lg font-display leading-tight tracking-tight ${'text-[#eb483f]'}`}>{arena.name}</h3>
              <div className={`flex items-center text-[10px] font-black uppercase tracking-[0.1em] gap-1 ${'text-blue-500'}`}>
                <MapPin size={10} strokeWidth={2.5} />
                {arena.location}
              </div>
            </div>
          </div>

          {/* Elegant Ticket Separator */}
          <div className="relative h-px flex items-center px-4">
            <div className={`absolute left-0 -translate-x-1/2 w-7 h-7 rounded-full z-10 ${'bg-slate-50 border border-blue-50'}`} />
            <div className={`w-full border-t-2 border-dashed ${'border-slate-200'}`} />
            <div className={`absolute right-0 translate-x-1/2 w-7 h-7 rounded-full z-10 ${'bg-slate-50 border border-blue-50'}`} />
          </div>

          {/* Middle Section: Square Box Info Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {/* Date Box */}
              <div className={`p-3.5 rounded-2xl border transition-all ${'bg-blue-50 border-blue-100/50'
                }`}>
                <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 ${'text-blue-500/60'}`}>Reservation Date</p>
                <div className="flex items-center gap-2">
                  <Calendar size={12} className={'text-blue-600'} />
                  <span className={`font-bold text-[11px] ${'text-[#eb483f]'}`}>{date}</span>
                </div>
              </div>

              {/* Slot Box */}
              <div className={`p-3.5 rounded-2xl border transition-all ${'bg-amber-50/50 border-amber-100/60'
                }`}>
                <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 ${'text-amber-500/60'}`}>Selection Slot</p>
                <div className="flex items-center gap-2">
                  <Clock size={12} className={'text-amber-600'} />
                  <span className={`font-bold text-[11px] ${'text-[#eb483f]'}`}>{slot?.time?.split(' - ')[0]}</span>
                </div>
              </div>

              {/* Court Box */}
              <div className={`p-3.5 rounded-2xl border transition-all ${'bg-emerald-50/50 border-emerald-100/60'
                }`}>
                <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 ${'text-emerald-500/60'}`}>Court Detail</p>
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className={'text-emerald-600'} />
                  <span className={`font-bold text-[11px] ${'text-[#eb483f]'}`}>{court?.name}</span>
                </div>
              </div>

              {/* Surface Box */}
              <div className={`p-3.5 rounded-2xl border transition-all ${'bg-slate-100/50 border-slate-200/60'
                }`}>
                <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 ${'text-slate-500/60'}`}>Court Surface</p>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${'bg-blue-500'}`} />
                  <span className={`font-bold text-[11px] ${'text-[#eb483f]'}`}>{court?.type}</span>
                </div>
              </div>
            </div>

            {/* Bottom Section: Payment Summary */}
            <div className={`mt-8 pt-6 border-t ${'border-slate-100'}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${'text-slate-400'}`}>Base Rate Fee</span>
                  <span className={`font-bold text-sm tracking-tight ${'text-[#eb483f]'}`}>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${'text-slate-400'}`}>GST Charges (18%)</span>
                  <span className={`font-bold text-sm tracking-tight ${'text-[#eb483f]'}`}>₹{tax.toFixed(2)}</span>
                </div>

                {/* Fixed Total Amount Box */}
                <div className={`mt-6 p-5 rounded-[28px] flex justify-between items-center relative overflow-hidden ${'bg-[#eb483f]/5 border border-[#eb483f]/10 shadow-sm'
                  }`}>
                  <div className="z-10 flex-2">
                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] block mb-1 ${'text-[#eb483f]/60'}`}>Total Payable Amount</span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-black font-display leading-tight tracking-tight ${'text-[#eb483f]'}`}>₹{(total + tax).toFixed(2)}</span>
                      <span className={`text-[10px] font-bold ${'text-[#eb483f]/30'}`}>INR</span>
                    </div>
                  </div>

                  <div className={`shrink-0 px-4 py-2 rounded-2xl border font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 z-10 ${'bg-white border-[#eb483f]/10 text-[#eb483f] shadow-[0_4px_15px_rgba(235,72,63,0.1)]'
                    }`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-[0_0_5px_currentColor]" />
                    Unpaid
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className={`fixed bottom-0 left-0 right-0 p-6 z-[100] md:max-w-[450px] md:mx-auto border-t backdrop-blur-xl ${'bg-white/80 border-blue-50 shadow-[0_-12px_40px_rgba(10,31,68,0.06)]'
        }`}>
        <ShuttleButton
          variant="primary"
          size="md"
          fullWidth
          className="shadow-2xl shadow-[#eb483f]/20 !rounded-2xl active:scale-95 transition-all py-4"
          icon={<ArrowRight size={18} />}
          onClick={() => navigate('/payment', { state: { amount: total + tax, arena, court, date, slot } })}
        >
          Confirm & Pay
        </ShuttleButton>
      </div>
    </div>
  );
};

export default BookingSummary;



