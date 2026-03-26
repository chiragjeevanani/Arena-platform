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
    <div className={`min-h-screen relative overflow-hidden ${'bg-[#FDFDFD]'}`}>
      {/* Dynamic Background Elements */}
      {!isDark && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#eb483f]/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[100px]" />
          <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-amber-500/[0.02] rounded-full blur-[80px]" />
        </div>
      )}

      {/* Modern Compact Header (Desktop) */}
      <div className={`hidden lg:block sticky top-0 z-[100] backdrop-blur-2xl border-b transition-all duration-500 ${'bg-white/80 border-slate-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.02)]'}`}>
        <div className="max-w-7xl mx-auto px-10 py-5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-slate-400 hover:text-[#eb483f] transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 bg-white shadow-sm group-hover:shadow-md group-hover:border-[#eb483f]/20 group-hover:translate-x-[-2px] transition-all">
              <ArrowLeft size={18} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Go Back</span>
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em] font-display">Review Order</h1>
            <div className="h-1 w-8 bg-[#eb483f] rounded-full mt-1" />
          </div>

          <div className="w-24" /> {/* Spacer for symmetry */}
        </div>
      </div>

      {/* Mobile Header (Stays original as requested) */}
      <div className={`lg:hidden px-6 pt-6 pb-4 sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${'bg-[#eb483f] border-blue-900/10 rounded-b-[24px] shadow-[0_8px_25px_rgba(10,31,68,0.12)]'}`}>
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

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* LEFT COLUMN: Venue Showcase */}
          <div className="lg:col-span-7 space-y-12 lg:space-y-16">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Premium Hero Image */}
              <div className="hidden lg:block relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#eb483f]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl -z-10 rounded-[60px]" />
                <div className="relative rounded-[56px] overflow-hidden aspect-[16/10] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border-[16px] border-white ring-1 ring-black/5">
                  <img src={arena.image} alt={arena.name} className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-12">
                     <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#eb483f] text-white text-[10px] font-black uppercase tracking-widest shadow-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                          <CheckCircle size={12} /> Featured Arena
                        </div>
                        <h2 className="text-5xl xl:text-6xl font-black text-white font-display leading-[1.1] tracking-tighter">{arena.name}</h2>
                     </div>
                  </div>
                </div>
              </div>

              {/* Sophisticated Arena Details */}
              <div className="space-y-6 lg:space-y-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                   <div className="space-y-1.5 lg:space-y-3">
                      <div className="flex items-center gap-2 text-[#eb483f] text-[10px] lg:text-xs font-black uppercase tracking-[0.3em]">
                        <MapPin size={16} strokeWidth={3} />
                        Location
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{arena.location}</h3>
                   </div>
                   
                   <div className="hidden lg:flex gap-4">
                      {['Wifi', 'Parking', 'Cafe', 'AC'].map((amenity, i) => (
                        <div key={i} className="px-5 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {amenity}
                        </div>
                      ))}
                   </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-slate-100 via-slate-100 to-transparent hidden lg:block" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white/40 backdrop-blur-md p-8 lg:p-10 rounded-[40px] border border-slate-100/50 shadow-sm hover:shadow-md transition-all duration-500 group">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#eb483f]/60 mb-6 group-hover:text-[#eb483f] transition-colors">Safety Protocols</h4>
                      <ul className="space-y-4">
                         {['Sanitized Equipment', 'Temperature Checks', 'Mask Mandatory', 'Safe Spacing'].map((text, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#eb483f]/30" />
                               {text}
                            </li>
                         ))}
                      </ul>
                   </div>
                   <div className="bg-[#eb483f]/[0.02] p-8 lg:p-10 rounded-[40px] border border-[#eb483f]/5 shadow-sm hover:shadow-md transition-all duration-500">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#eb483f]/60 mb-6">Need Assistance?</h4>
                      <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">Our dedicated concierge is ready to help you with your booking experience.</p>
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#eb483f] group">
                         Start Live Chat
                         <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Mobile View Placeholder for original ticket code to keep layout consistent */}
            <div className="lg:hidden">
               {/* Original Mobile Ticket Card Code would go here if not rendered in Right Column */}
               {/* Note: I'm keeping the original mobile ticket design in the right column but hidden on desktop */}
            </div>
          </div>

          {/* RIGHT COLUMN: Smart Digital Receipt */}
          <div className="lg:col-span-5 relative mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-32">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                {/* Decorative Elements for Desktop Receipt */}
                <div className="hidden lg:block absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Premium Receipt Card */}
                <div className={`rounded-[48px] overflow-hidden bg-white border border-slate-100 shadow-[0_50px_120px_rgba(0,0,0,0.08)] relative z-10`}>
                  {/* Digital Header */}
                  <div className="bg-slate-950 p-10 text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#eb483f]/20 rounded-full blur-3xl -mr-16 -mt-16" />
                     <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#eb483f] uppercase tracking-widest">
                           <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                           Booking Order Summary
                        </div>
                        <h4 className="text-2xl font-black font-display tracking-tight text-white/90">Confirmation Receipt</h4>
                     </div>
                  </div>

                  <div className="p-10 space-y-10">
                     {/* Split Grid for Details */}
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1.5">
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Date</p>
                           <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-[#eb483f]" />
                              <span className="text-sm font-black text-slate-900">{date}</span>
                           </div>
                        </div>
                        <div className="space-y-1.5 text-right">
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Section</p>
                           <div className="flex items-center gap-2 justify-end">
                              <span className="text-sm font-black text-slate-900">{court?.name}</span>
                              <CheckCircle size={14} className="text-emerald-500" />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Access Time</p>
                           <div className="flex items-center gap-2">
                              <Clock size={14} className="text-blue-500" />
                              <span className="text-sm font-black text-slate-900">{slot?.time?.split(' - ')[0]}</span>
                           </div>
                        </div>
                        <div className="space-y-1.5 text-right">
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Surface Type</p>
                           <div className="flex items-center gap-2 justify-end">
                              <span className="text-sm font-black text-slate-900">{court?.type}</span>
                              <div className="w-2 h-2 rounded-full bg-amber-400" />
                           </div>
                        </div>
                     </div>

                     {/* Premium Ticket Perforation */}
                     <div className="relative h-px flex items-center">
                        <div className="absolute left-0 -translate-x-14 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 shadow-inner" />
                        <div className="w-full border-t-2 border-dashed border-slate-100" />
                        <div className="absolute right-0 translate-x-14 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 shadow-inner" />
                     </div>

                     {/* Financial Breakdown */}
                     <div className="space-y-5">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                           <span>Base Reservation</span>
                           <span className="text-slate-900 font-black">OMR {total.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                           <span>Tax Reconciliation</span>
                           <span className="text-slate-900 font-black">OMR {tax.toFixed(3)}</span>
                        </div>
                        
                        {/* Total Amount Focus */}
                        <div className="pt-8 space-y-4">
                           <div className="flex justify-between items-end">
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#eb483f]">Total Payable Amount</p>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black font-display text-slate-950 tracking-tighter">OMR {(total+tax).toFixed(3)}</span>
                                 </div>
                              </div>
                              <div className="hidden xl:block bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-2 border border-emerald-100 shadow-sm">
                                 Verified
                              </div>
                           </div>

                           <div className="pt-6">
                              <div className="hidden lg:block">
                                 <ShuttleButton
                                    variant="primary"
                                    size="xl"
                                    fullWidth
                                    className="!rounded-3xl py-7 shadow-[0_25px_50px_rgba(235,72,63,0.3)] hover:shadow-[0_35px_70px_rgba(235,72,63,0.4)] hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-500 font-black uppercase tracking-[0.2em] text-[13px]"
                                    icon={<ArrowRight size={20} />}
                                    onClick={() => navigate('/payment', { state: { amount: total + tax, arena, court, date, slot } })}
                                 >
                                    Proceed to Payment
                                 </ShuttleButton>
                              </div>
                              <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-6 lg:mt-8 flex items-center justify-center gap-2">
                                 <CheckCircle size={12} className="text-emerald-500" />
                                 100% Secure & Encrypted Transaction
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Content Section */}
      <div className="lg:hidden px-6 py-8 space-y-8">
        {/* Mobile Venue Header Card */}
        <div className="rounded-[32px] overflow-hidden border bg-white border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
           <div className="aspect-[16/9] relative">
              <img src={arena.image} alt={arena.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                 <h3 className="text-xl font-black text-white font-display leading-tight">{arena.name}</h3>
                 <div className="flex items-center text-[10px] font-bold text-white/80 uppercase tracking-widest gap-1.5 mt-1">
                    <MapPin size={10} strokeWidth={3} />
                    {arena.location}
                 </div>
              </div>
           </div>
           
           <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Date</p>
                    <div className="flex items-center gap-2">
                       <Calendar size={12} className="text-[#eb483f]" />
                       <span className="text-xs font-bold text-slate-900">{date}</span>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Time</p>
                    <div className="flex items-center gap-2">
                       <Clock size={12} className="text-blue-500" />
                       <span className="text-xs font-bold text-slate-900">{slot?.time?.split(' - ')[0]}</span>
                    </div>
                 </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Base Rate</span>
                    <span className="text-slate-900">OMR {total.toFixed(3)}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Tax Reconciliation</span>
                    <span className="text-slate-900">OMR {tax.toFixed(3)}</span>
                 </div>
              </div>

                  <div className="bg-[#eb483f]/5 p-5 rounded-[24px] border border-[#eb483f]/10 flex justify-between items-end">
                 <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#eb483f]">Total Amount</p>
                    <span className="text-3xl font-black font-display text-[#eb483f]">OMR {(total+tax).toFixed(3)}</span>
                 </div>
                 <div className="px-3 py-1.5 rounded-full bg-white border border-[#eb483f]/10 text-[9px] font-black uppercase tracking-widest text-[#eb483f] flex items-center gap-1.5 shadow-sm">
                    <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                    Unpaid
                 </div>
              </div>
           </div>
        </div>

        {/* Bonus Mobile Info */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" />
              Booking Benefits
           </h4>
           <div className="grid grid-cols-2 gap-3">
              {['Instant Access', 'Sanitized', 'Best Price', 'Help 24/7'].map((t, i) => (
                 <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 bg-slate-50 py-2.5 px-3 rounded-xl">
                    <div className="w-1 h-1 rounded-full bg-emerald-400" />
                    {t}
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Mobile Footer Button (Hidden on Desktop) */}
      <div className={`fixed bottom-0 left-0 right-0 p-6 z-[100] border-t backdrop-blur-xl lg:hidden ${'bg-white/80 border-blue-50 shadow-[0_-12px_40px_rgba(10,31,68,0.06)]'}`}>
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



