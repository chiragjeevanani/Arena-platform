import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle, MapPin } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { createMyBooking } from '../../../services/bookingsApi';
import { toYMDFromDateString } from '../../../utils/bookingDates';

function readStoredArenaSafe() {
  try {
    const raw = localStorage.getItem('selectedArena');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const BookingSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [bookingError, setBookingError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const storedArena = readStoredArenaSafe();
  const { arena: stateArena, court: stateCourt, date, slot, useApiCheckout, dateYmd } = state || {};

  const arena = stateArena || storedArena;
  const court = stateCourt || storedArena?.selectedCourt;

  if (!arena) {
    return (
      <div className={`p-10 text-center ${'text-[#CE2029]/40'}`}>
        No booking details found. Please select an arena first.
      </div>
    );
  }

  const useLiveCheckout = Boolean(useApiCheckout && isApiConfigured());
  const subtotal = Number(slot?.price) || 0;
  const tax = useLiveCheckout ? 0 : subtotal * 0.18;
  const canApiBook = useLiveCheckout && user?.role === 'CUSTOMER';

  const handlePayOrBook = async () => {
    if (canApiBook) {
      setBookingError('');
      setSubmitting(true);
      try {
        const ymd = dateYmd || toYMDFromDateString(date);
        const timeSlot = slot?.timeSlot || slot?.time;
        if (!ymd || !timeSlot || !court?.id) {
          throw new Error('Missing date, slot, or court');
        }
        const res = await createMyBooking({
          arenaId: String(arena.id),
          courtId: String(court.id),
          date: ymd,
          timeSlot,
          paymentMethod: 'online',
        });
        navigate('/booking-success', {
          replace: true,
          state: {
            arena,
            court,
            date,
            slot,
            amount: res.booking.amount,
            booking: res.booking,
            pricing: res.pricing,
          },
        });
      } catch (e) {
        setBookingError(e.message || 'Booking failed');
      } finally {
        setSubmitting(false);
      }
    } else {
      navigate('/payment', { state: { amount: subtotal + tax, arena, court, date, slot } });
    }
  };

  return (
    <div className={`min-h-screen relative overflow-y-auto ${'bg-[#FDFDFD]'}`}>
      {/* Dynamic Background Elements */}
      {!isDark && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#CE2029]/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[100px]" />
          <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-amber-500/[0.02] rounded-full blur-[80px]" />
        </div>
      )}

      {/* Modern Compact Header (Desktop) */}
      <div className={`hidden lg:block sticky top-0 z-[100] backdrop-blur-2xl border-b transition-all duration-500 bg-[#CE2029] border-white/10 shadow-[0_4px_25px_rgba(206, 32, 41,0.15)]`}>
        <div className="max-w-7xl mx-auto px-10 py-5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-white/70 hover:text-white transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/20 bg-white/10 shadow-sm group-hover:bg-white/20 group-hover:translate-x-[-2px] transition-all">
              <ArrowLeft size={18} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Go Back</span>
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-black text-white uppercase tracking-[0.4em] font-display">Review Order</h1>
          </div>

          <div className="w-24" /> {/* Spacer for symmetry */}
        </div>
      </div>

      {/* Mobile Header (Stays original as requested) */}
      <div className={`lg:hidden px-6 pt-6 pb-4 sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${'bg-[#CE2029] border-blue-900/10 rounded-b-[24px] shadow-[0_8px_25px_rgba(10,31,68,0.12)]'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-bold text-white font-display text-center flex-1 pr-10">Review Booking</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Venue Showcase */}
          <div className="lg:col-span-7 space-y-8 lg:space-y-10">
            <Motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Premium Hero Image */}
              <div className="hidden lg:block relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#CE2029]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl -z-10 lg:rounded-none" />
                <div className="relative lg:rounded-none overflow-hidden aspect-[21/9] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border-[10px] border-white ring-1 ring-black/5">
                  <img src={arena.image} alt={arena.name} className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                     <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CE2029] text-white text-[9px] font-black uppercase tracking-widest shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                          <CheckCircle size={10} /> Featured Arena
                        </div>
                        <h2 className="text-4xl xl:text-5xl font-black text-white font-display leading-[1.1] tracking-tighter">{arena.name}</h2>
                     </div>
                  </div>
                </div>
              </div>

              {/* Sophisticated Arena Details */}
              <div className="space-y-4 lg:space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[#CE2029] text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em]">
                        <MapPin size={14} strokeWidth={3} />
                        Location
                      </div>
                      <h3 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">
                        {arena.name.includes("Amm") ? "AMM sports arena muscat , oman" : arena.location}
                      </h3>
                   </div>
                   
                   <div className="hidden lg:flex gap-2.5">
                      {['Wifi', 'Parking', 'Cafe', 'AC'].map((amenity, i) => (
                        <div key={i} className="px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {amenity}
                        </div>
                      ))}
                   </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-slate-100 via-slate-100 to-transparent hidden lg:block" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-white/40 backdrop-blur-md p-6 lg:rounded-none border border-slate-100/50 shadow-sm hover:shadow-md transition-all duration-500 group">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CE2029]/60 mb-4 group-hover:text-[#CE2029] transition-colors">Safety Protocols</h4>
                      <ul className="space-y-2.5">
                         {['Sanitized Equipment', 'Temperature Checks', 'Mask Mandatory', 'Safe Spacing'].map((text, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-[11px] font-bold text-slate-600">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#CE2029]/30" />
                               {text}
                            </li>
                         ))}
                      </ul>
                   </div>
                   <div className="bg-[#CE2029]/[0.02] p-6 lg:rounded-none border border-[#CE2029]/5 shadow-sm hover:shadow-md transition-all duration-500 flex flex-col justify-center">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CE2029]/60 mb-2">Need Assistance?</h4>
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed mb-4">Dedicated concierge ready to help with your experience.</p>
                      <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#CE2029] group">
                         Start Live Chat
                         <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                   </div>
                </div>
              </div>
            </Motion.div>
          </div>

          {/* RIGHT COLUMN: Smart Digital Receipt */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-28">
              <Motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Premium Receipt Card */}
                <div className="lg:rounded-none overflow-hidden bg-white border border-slate-100 shadow-[0_30px_80px_rgba(0,0,0,0.06)] relative z-10 transition-all">
                  {/* Digital Header */}
                  <div className="bg-slate-950 p-6 text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#CE2029]/20 rounded-full blur-3xl -mr-16 -mt-16" />
                     <div className="relative z-10 space-y-1">
                        <div className="flex items-center gap-2 text-[9px] font-black text-[#CE2029] uppercase tracking-widest">
                           <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                           Order Summary
                        </div>
                        <h4 className="text-xl font-black font-display tracking-tight text-white/90">Confirmation Receipt</h4>
                     </div>
                  </div>

                  <div className="p-6 space-y-6">
                     {/* Split Grid for Details */}
                     <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div className="space-y-1">
                           <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Date</p>
                           <div className="flex items-center gap-2">
                              <Calendar size={12} className="text-[#CE2029]" />
                              <span className="text-[13px] font-black text-slate-900">{date}</span>
                           </div>
                        </div>
                        <div className="space-y-1 text-right">
                           <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Section</p>
                           <div className="flex items-center gap-2 justify-end">
                              <span className="text-[13px] font-black text-slate-900">{court?.name}</span>
                              <CheckCircle size={12} className="text-emerald-500" />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Access Time</p>
                           <div className="flex items-center gap-2">
                              <Clock size={12} className="text-blue-500" />
                              <span className="text-[13px] font-black text-slate-900">{slot?.time?.split(' - ')[0]}</span>
                           </div>
                        </div>
                        <div className="space-y-1 text-right">
                           <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Surface Type</p>
                           <div className="flex items-center gap-2 justify-end">
                              <span className="text-[13px] font-black text-slate-900">{court?.type}</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                           </div>
                        </div>
                     </div>

                     {/* Ticket Perforation */}
                     <div className="relative h-px flex items-center">
                        <div className="absolute left-0 -translate-x-10 w-6 h-6 rounded-full bg-slate-50 border border-slate-100 shadow-inner" />
                        <div className="w-full border-t border-dashed border-slate-100" />
                        <div className="absolute right-0 translate-x-10 w-6 h-6 rounded-full bg-slate-50 border border-slate-100 shadow-inner" />
                     </div>

                     {/* Financial Breakdown */}
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                           <span>Base Reservation</span>
                           <span className="text-slate-900 font-black">OMR {subtotal.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                           <span>{useLiveCheckout ? 'Tax' : 'Tax Reconciliation'}</span>
                           <span className="text-slate-900 font-black">OMR {tax.toFixed(3)}</span>
                        </div>

                        {bookingError && (
                          <p className="text-[10px] font-bold text-[#CE2029]">{bookingError}</p>
                        )}
                        {useLiveCheckout && !canApiBook && (
                          <p className="text-[10px] font-bold text-amber-700">
                            Sign in as a customer to confirm this booking with the server.
                          </p>
                        )}

                        <div className="pt-4 border-t border-slate-50 mt-4">
                           <div className="flex items-center justify-between gap-4">
                              <div className="space-y-0.5 shrink-0">
                                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#CE2029]">Total Amount</p>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black font-display text-slate-950 tracking-tighter">OMR {(subtotal + tax).toFixed(3)}</span>
                                 </div>
                              </div>

                              <div className="hidden lg:block flex-1 max-w-[180px]">
                                 <ShuttleButton
                                    variant="primary"
                                    size="md"
                                    fullWidth
                                    className="!rounded-none !py-3 shadow-xl hover:-translate-y-1 transition-all font-black uppercase tracking-widest text-[10px]"
                                    icon={<ArrowRight size={14} />}
                                    disabled={submitting}
                                    onClick={handlePayOrBook}
                                 >
                                    {canApiBook ? (submitting ? 'Booking…' : 'Confirm booking') : 'Pay Now'}
                                 </ShuttleButton>
                              </div>
                           </div>

                           <div className="lg:hidden pt-4">
                              <ShuttleButton
                                 variant="primary"
                                 size="lg"
                                 fullWidth
                                 className="!rounded-2xl py-4 shadow-xl active:scale-95 font-black uppercase tracking-widest text-[12px]"
                                 icon={<ArrowRight size={18} />}
                                 disabled={submitting}
                                 onClick={handlePayOrBook}
                              >
                                 {canApiBook ? (submitting ? 'Booking…' : 'Confirm booking') : 'Confirm Booking'}
                              </ShuttleButton>
                           </div>

                           <p className="text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-6 flex items-center justify-center gap-1.5">
                              <CheckCircle size={10} className="text-emerald-500" />
                              Secure Transaction
                           </p>
                        </div>
                     </div>
                  </div>
                </div>
              </Motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Content Section */}
      <div className="lg:hidden px-6 pt-8 pb-40 space-y-6">
        <div className="rounded-[32px] overflow-hidden border bg-white border-slate-100 shadow-sm">
           <div className="aspect-[21/9] relative">
              <img src={arena.image} alt={arena.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                 <h3 className="text-lg font-black text-white font-display leading-tight">{arena.name}</h3>
                 <div className="flex items-center text-[9px] font-bold text-white/80 uppercase tracking-widest gap-1 mt-1">
                    <MapPin size={9} strokeWidth={3} /> 
                    {arena.name.includes("Amm") ? "AMM sports arena muscat , oman" : arena.location}
                 </div>
              </div>
           </div>
           <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-slate-50 p-3 rounded-xl space-y-0.5 text-center">
                    <p className="text-[7.5px] font-black uppercase tracking-widest text-slate-400">Date</p>
                    <span className="text-[11px] font-bold text-slate-900">{date}</span>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-xl space-y-0.5 text-center">
                    <p className="text-[7.5px] font-black uppercase tracking-widest text-slate-400">Time</p>
                    <span className="text-[11px] font-bold text-slate-900">{slot?.time?.split(' - ')[0]}</span>
                 </div>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Subtotal</span><span>OMR {subtotal.toFixed(3)}</span>
                 </div>
                 <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Tax</span><span>OMR {tax.toFixed(3)}</span>
                 </div>
              </div>
              <div className="bg-[#CE2029]/5 p-4 rounded-[20px] border border-[#CE2029]/10 flex justify-between items-end">
                 <div className="space-y-0.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#CE2029]">Price</p>
                    <span className="text-2xl font-black font-display text-[#CE2029]">OMR {(subtotal + tax).toFixed(3)}</span>
                 </div>
                 <div className="px-2.5 py-1 rounded-full bg-white border border-[#CE2029]/10 text-[8px] font-black uppercase tracking-widest text-[#CE2029] flex items-center gap-1 shadow-sm">
                    <div className="w-1 h-1 rounded-full bg-current animate-pulse" /> Final Price
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Mobile Footer Sticky */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-[100] border-t backdrop-blur-xl lg:hidden bg-white/80 border-blue-50 shadow-[0_-12px_40px_rgba(10,31,68,0.06)]">
        <ShuttleButton
          variant="primary"
          size="md"
          fullWidth
          className="shadow-2xl shadow-[#CE2029]/20 !rounded-2xl active:scale-95 transition-all py-4"
          icon={<ArrowRight size={18} />}
          disabled={submitting}
          onClick={handlePayOrBook}
        >
          {canApiBook ? (submitting ? 'Booking…' : 'Confirm booking') : 'Confirm & Pay'}
        </ShuttleButton>
      </div>
    </div>
  );
};

export default BookingSummary;
