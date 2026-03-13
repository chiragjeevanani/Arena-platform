import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock, Star, Users, MapPin, ShieldCheck, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { useTheme } from '../context/ThemeContext';

const CoachingSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const { batch } = state || {};

  if (!batch) return (
    <div className={`p-10 text-center ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>
      No class details found. Please select a coaching batch first.
    </div>
  );

  const regFee = 500; // Mock Registration Fee
  const monthlyFee = batch.fees;
  const total = monthlyFee + regFee;
  const gst = total * 0.18;
  const finalPayable = total + gst;

  return (
    <div className={`min-h-screen pb-40 relative overflow-hidden ${isDark ? 'bg-[#08142B]' : 'bg-slate-50'}`}>
      {/* Background Decorative Glows */}
      {!isDark && (
        <>
          <div className="absolute top-24 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#22FF88]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Header - Premium Dark Style consistent with theme */}
      <div className={`px-6 pt-6 pb-4 sticky top-0 z-[60] backdrop-blur-2xl border-b transition-all duration-500 ${
        isDark ? 'bg-[#08142B]/80 border-white/5' : 'bg-[#0F172A] border-blue-900/10 rounded-b-[24px] shadow-[0_15px_40px_rgba(15,23,42,0.25)]'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-lg active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-bold text-white font-display tracking-tight">Academy Enrollment</h1>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Review Your Batch Details</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-6 relative z-10">
        {/* Coach Profile Card */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className={`rounded-[32px] overflow-hidden border p-5 relative ${
             isDark ? 'glass-card border-white/10 bg-white/5' : 'bg-white border-blue-50 shadow-xl shadow-blue-500/5'
           }`}
        >
          <div className="flex gap-5 items-center">
            <div className="relative">
              <img 
                src={batch.image} 
                className="w-20 h-20 rounded-[28px] object-cover ring-4 ring-[#22FF88]/20" 
                alt={batch.coachName} 
              />
              <div className="absolute -bottom-1 -right-1 bg-[#22FF88] text-[#08142B] w-6 h-6 rounded-lg flex items-center justify-center border-2 border-white">
                <Star size={12} fill="currentColor" />
              </div>
            </div>
            <div>
              <h3 className={`text-xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{batch.coachName}</h3>
              <p className={`text-xs font-bold font-display ${isDark ? 'text-white/40' : 'text-[#0F172A]/40'}`}>Professional Head Coach</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-lg bg-[#22FF88]/10 text-[#22FF88] text-[8px] font-black uppercase tracking-widest border border-[#22FF88]/20">
                  {batch.level} Level
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                   <Star size={10} fill="currentColor" /> 4.9
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Batch Info Grid */}
        <div className="grid grid-cols-1 gap-4">
           {/* Section Title */}
           <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/40'}`}>Scheduled Training</h4>
           
           <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-[24px] border border-dashed ${isDark ? 'bg-white/5 border-white/10' : 'bg-blue-50/50 border-blue-100'}`}>
                <p className={`text-[8px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-[#1EE7FF]/50' : 'text-blue-500'}`}>Class Days</p>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#1EE7FF]" />
                  <span className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{batch.days}</span>
                </div>
              </div>
              <div className={`p-4 rounded-[24px] border border-dashed ${isDark ? 'bg-white/5 border-white/10' : 'bg-emerald-50/50 border-emerald-100'}`}>
                <p className={`text-[8px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-[#22FF88]/50' : 'text-emerald-500'}`}>Timing</p>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#22FF88]" />
                  <span className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{batch.timing}</span>
                </div>
              </div>
           </div>
        </div>

        {/* Payment Structure */}
        <div className="space-y-4">
           <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/40'}`}>Subscription Fees</h4>
           
           <div className={`rounded-[32px] border relative overflow-hidden ${
             isDark ? 'bg-white/5 border-white/10' : 'bg-white border-blue-50 shadow-xl shadow-blue-500/5'
           }`}>
              <div className="p-6 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${isDark ? 'text-white/40' : 'text-[#0A1F44]/50'}`}>Monthly Coaching Fee</span>
                    <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{monthlyFee.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${isDark ? 'text-white/40' : 'text-[#0A1F44]/50'}`}>One-time Registration</span>
                    <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{regFee.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-bold ${isDark ? 'text-white/40' : 'text-[#0A1F44]/50'}`}>GST Charges</span>
                      <span className="text-[9px] bg-slate-100 px-1 rounded text-slate-500 font-bold">18%</span>
                    </div>
                    <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{gst.toFixed(2)}</span>
                 </div>

                 {/* Total amount highlight */}
                 <div className={`mt-6 p-5 rounded-[24px] flex justify-between items-center relative overflow-hidden ${
                   isDark ? 'bg-[#22FF88]/10' : 'bg-blue-600'
                 }`}>
                    {/* Decorative shuttlecock pattern */}
                    <div className="absolute right-0 top-0 opacity-10 -mr-4 -mt-4 transform rotate-12">
                       <GraduationCap size={100} />
                    </div>
                    
                    <div>
                       <p className={`text-[8px] font-black uppercase tracking-[0.3em] mb-1 ${isDark ? 'text-[#22FF88]' : 'text-blue-100'}`}>Total Payable</p>
                       <p className={`text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-white'}`}>₹{finalPayable.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl">
                       <span className={`text-[9px] font-black uppercase text-white`}>Next Due: April 13</span>
                    </div>
                 </div>
              </div>

              {/* Secure Transaction Info */}
              <div className={`p-4 text-center border-t border-dashed ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                <div className="flex items-center justify-center gap-2 opacity-30">
                  <ShieldCheck size={14} className={isDark ? 'text-[#22FF88]' : 'text-blue-500'} />
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Secured by ArenaPay</span>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Footer Payment Action */}
      <div className={`fixed bottom-0 left-0 right-0 p-6 z-[100] md:max-w-[450px] md:mx-auto border-t backdrop-blur-xl transition-all duration-500 ${
        isDark ? 'bg-[#08142B]/90 border-white/5' : 'bg-white/80 border-blue-50 shadow-[0_-20px_50px_rgba(10,31,68,0.1)]'
      }`}>
        <ShuttleButton
          variant="primary"
          size="md"
          fullWidth
          className="shadow-2xl shadow-[#22FF88]/20 !rounded-[24px] active:scale-95 transition-all py-4"
          icon={<ArrowRight size={18} />}
          onClick={() => navigate('/payment', { state: { amount: finalPayable, batch } })}
        >
          Proceed to Pay ₹{finalPayable.toFixed(2)}
        </ShuttleButton>
      </div>
    </div>
  );
};

export default CoachingSummary;
