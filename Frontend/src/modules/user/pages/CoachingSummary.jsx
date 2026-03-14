import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock, Star, Users, MapPin, ShieldCheck, GraduationCap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { useTheme } from '../context/ThemeContext';

const CoachingSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const { batch } = state || {};

  if (!batch) return (
    <div className={`p-10 text-center ${isDark ? 'text-white/40' : 'text-[#F3655D]/40'}`}>
      No class details found. Please select a coaching batch first.
    </div>
  );

  const regFee = 500; // Mock Registration Fee
  const monthlyFee = batch.fees;
  const total = monthlyFee + regFee;
  const gst = total * 0.18;
  const finalPayable = total + gst;

  return (
    <div className={`min-h-screen pb-40 relative overflow-hidden ${isDark ? 'bg-[#F3655D]' : 'bg-slate-50'}`}>
      {/* Background Decorative Glows */}
      {!isDark && (
        <>
          <div className="absolute top-24 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#eb483f]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Header - Premium Dark Style consistent with theme */}
      <div className={`px-6 pt-5 pb-3 sticky top-0 z-[60] backdrop-blur-2xl border-b transition-all duration-500 ${
        isDark ? 'bg-[#F3655D]/80 border-white/5' : 'bg-[#0F172A] border-blue-900/10 md:rounded-b-none rounded-b-[24px] shadow-[0_15px_40px_rgba(15,23,42,0.25)]'
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-2xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-lg active:scale-95 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-base md:text-lg font-bold text-white font-display tracking-tight">Academy Enrollment</h1>
              <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/40">Review Your Batch Details</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-5">
             <div className="text-right">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Total Payable</p>
                <p className="text-xl font-black text-[#eb483f] font-display">â‚¹{finalPayable.toFixed(2)}</p>
             </div>
             <ShuttleButton
                variant="primary"
                size="sm"
                className="!rounded-xl px-6 py-2.5 shadow-xl shadow-[#eb483f]/20 text-xs"
                onClick={() => navigate('/payment', { state: { amount: finalPayable, batch } })}
              >
                Enroll Now
              </ShuttleButton>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 md:py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Trainer & Schedule */}
          <div className="md:col-span-7 space-y-6">
            {/* Coach Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-[32px] overflow-hidden border p-6 md:p-8 relative ${
                isDark ? 'glass-card border-white/10 bg-white/5' : 'bg-white border-blue-50 shadow-xl shadow-blue-500/5'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                <div className="relative">
                  <img 
                    src={batch.image} 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-[28px] object-cover ring-6 ring-[#eb483f]/5 shadow-xl" 
                    alt={batch.coachName} 
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#eb483f] text-[#F3655D] w-7 h-7 rounded-xl flex items-center justify-center border-3 border-white shadow-lg">
                    <Star size={14} fill="currentColor" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-1.5 leading-none">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#eb483f]/10 text-[#eb483f] text-[8px] font-black uppercase tracking-[0.15em] border border-[#eb483f]/20">
                      Top Faculty
                    </span>
                  </div>
                  <h3 className={`text-xl md:text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                    {batch.coachName}
                  </h3>
                  <p className={`text-xs font-bold font-display mt-0.5 ${isDark ? 'text-white/40' : 'text-[#0F172A]/40'}`}>
                    Professional Academic Trainer
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                       <p className={`text-[7px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Experience</p>
                       <p className={`text-[11px] font-bold mt-0.5 ${isDark ? 'text-white' : 'text-[#F3655D]'}`}>8+ Years</p>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                       <p className={`text-[7px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Rating</p>
                       <p className={`text-[11px] font-bold mt-0.5 flex items-center gap-1 ${isDark ? 'text-white' : 'text-[#F3655D]'}`}>
                         4.95 <Star size={9} className="text-amber-500" fill="currentColor" />
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Batch Info Grid */}
            <div className="space-y-3">
               <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDark ? 'text-white/30' : 'text-[#F3655D]/40'}`}>Scheduled Training</h4>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-6 rounded-[32px] border border-dashed transition-all hover:border-[#eb483f]/20 group ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-blue-100 shadow-sm shadow-blue-500/5'}`}>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-3 transition-colors ${isDark ? 'text-[#eb483f]/40 group-hover:text-[#eb483f]' : 'text-blue-500/60'}`}>Class Days</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f] transition-transform group-hover:scale-105">
                        <Calendar size={20} />
                      </div>
                      <span className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-[#F3655D]'}`}>{batch.days}</span>
                    </div>
                  </div>
                  <div className={`p-6 rounded-[32px] border border-dashed transition-all hover:border-[#eb483f]/20 group ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-emerald-100 shadow-sm shadow-emerald-500/5'}`}>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-3 transition-colors ${isDark ? 'text-[#eb483f]/40 group-hover:text-[#eb483f]' : 'text-emerald-500/60'}`}>Timing</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f] transition-transform group-hover:scale-105">
                        <Clock size={20} />
                      </div>
                      <span className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-[#F3655D]'}`}>{batch.timing}</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Fees and Summary */}
          <div className="md:col-span-5 space-y-6">
            <div className="space-y-3">
               <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDark ? 'text-white/30' : 'text-[#F3655D]/40'}`}>Subscription Fees</h4>
               
               <div className={`rounded-[36px] border relative overflow-hidden ${
                 isDark ? 'glass-card border-white/10 bg-white/5 shadow-2xl' : 'bg-white border-blue-50 shadow-2xl shadow-blue-500/5'
               }`}>
                  <div className="p-6 md:p-8 space-y-5">
                     <div className="flex justify-between items-center group">
                        <span className={`text-xs font-bold transition-colors ${isDark ? 'text-white/40 group-hover:text-white/60' : 'text-[#F3655D]/50'}`}>Monthly Coaching Fee</span>
                        <span className={`text-sm md:text-base font-black ${isDark ? 'text-white' : 'text-[#F3655D]'}`}>â‚¹{monthlyFee.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center group">
                        <span className={`text-xs font-bold transition-colors ${isDark ? 'text-white/40 group-hover:text-white/60' : 'text-[#F3655D]/50'}`}>One-time Registration</span>
                        <span className={`text-sm md:text-base font-black ${isDark ? 'text-white' : 'text-[#F3655D]'}`}>â‚¹{regFee.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center group">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold transition-colors ${isDark ? 'text-white/40 group-hover:text-white/60' : 'text-[#F3655D]/50'}`}>GST Charges</span>
                          <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-black">18%</span>
                        </div>
                        <span className={`text-sm md:text-base font-black ${isDark ? 'text-white' : 'text-[#F3655D]'}`}>â‚¹{gst.toFixed(2)}</span>
                     </div>

                     {/* Total amount highlight */}
                     <div className={`mt-6 p-6 rounded-[32px] flex justify-between items-center relative overflow-hidden transition-all duration-500 ${
                       isDark ? 'bg-[#eb483f]/10 group' : 'bg-blue-600 shadow-xl shadow-blue-600/20'
                     }`}>
                        <div className="absolute right-0 top-0 opacity-10 -mr-8 -mt-8 transform rotate-12 transition-transform group-hover:scale-110">
                           <GraduationCap size={120} />
                        </div>
                        
                        <div>
                           <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1.5 ${isDark ? 'text-[#eb483f]' : 'text-blue-100'}`}>Final Amount</p>
                           <p className={`text-3xl font-black font-display tracking-tight text-white`}>â‚¹{finalPayable.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-2xl hidden lg:block">
                           <span className={`text-[10px] font-black uppercase text-white whitespace-nowrap`}>Due Every Month</span>
                        </div>
                     </div>
                  </div>

                  {/* Secure Transaction Info */}
                  <div className={`p-4 text-center border-t border-dashed ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-center gap-2.5 opacity-40">
                      <ShieldCheck size={16} className={isDark ? 'text-[#eb483f]' : 'text-blue-500'} />
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-[#F3655D]'}`}>Secured by ArenaPay</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Desktop Exclusive: Trust Factors */}
            <div className={`hidden md:block p-6 rounded-[32px] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-blue-50 shadow-sm'}`}>
               <h5 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDark ? 'text-white/40' : 'text-[#F3655D]/50'}`}>Benefits & Policies</h5>
               <ul className="space-y-3">
                  {[
                    "Flexible training schedules",
                    "Certified elite academic faculty",
                    "Sanitized training environment",
                    "Priority enrollment for events"
                  ].map((text, i) => (
                    <li key={i} className="flex gap-3 items-center">
                       <CheckCircle2 size={14} className="text-[#eb483f] shrink-0" />
                       <span className={`text-[11px] font-bold ${isDark ? 'text-white/40' : 'text-[#F3655D]/60'}`}>{text}</span>
                    </li>
                  ))}
               </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Payment Action - Mobile Only */}
      <div className={`fixed bottom-0 left-0 right-0 p-6 z-[100] md:hidden border-t backdrop-blur-xl transition-all duration-500 ${
        isDark ? 'bg-[#F3655D]/90 border-white/5' : 'bg-white/80 border-blue-50 shadow-[0_-20px_50px_rgba(10,31,68,0.1)]'
      }`}>
        <ShuttleButton
          variant="primary"
          size="md"
          fullWidth
          className="shadow-2xl shadow-[#eb483f]/20 !rounded-[24px] active:scale-95 transition-all py-4"
          icon={<ArrowRight size={18} />}
          onClick={() => navigate('/payment', { state: { amount: finalPayable, batch } })}
        >
          Proceed to Pay â‚¹{finalPayable.toFixed(2)}
        </ShuttleButton>
      </div>
    </div>
  );
};

export default CoachingSummary;

