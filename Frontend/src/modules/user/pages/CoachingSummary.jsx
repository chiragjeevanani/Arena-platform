import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Clock, Star, Users, ShieldCheck, GraduationCap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const CoachingSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const { batch } = state || {};

  if (!batch) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center bg-[#F8FAFC]">
      <div className="w-20 h-20 bg-[#eb483f]/10 rounded-3xl flex items-center justify-center mb-6">
        <GraduationCap size={40} className="text-[#eb483f]" />
      </div>
      <h2 className="text-xl font-black text-[#0F172A] mb-2 uppercase tracking-tight">No Details Found</h2>
      <p className="text-sm font-bold text-slate-400 mb-8">Please select a coaching batch first to view the enrollment summary.</p>
      <button
        onClick={() => navigate('/coaching')}
        className="bg-[#eb483f] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#eb483f]/20 active:scale-95 transition-all"
      >
        Go Back to Coaching
      </button>
    </div>
  );

  const regFee = 500;
  const monthlyFee = batch.fees;
  const total = monthlyFee + regFee;
  const gst = total * 0.18;
  const finalPayable = total + gst;

  return (
    <div className="min-h-screen pb-40 relative overflow-hidden bg-[#F8FAFC]">
      {/* Background Decorative Glows */}
      <div className="absolute top-24 -right-24 w-96 h-96 bg-[#eb483f]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[600px] -left-24 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="bg-[#eb483f] px-6 py-5 shadow-lg border-b border-white/10 sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-xl active:scale-95 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black text-white font-display tracking-tight uppercase leading-none">Enrollment Summary</h1>
              <p className="text-[10px] font-bold text-white/60 tracking-widest uppercase mt-1">Review Your Academy Details</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Total Payable</p>
              <p className="text-2xl font-black text-white font-display">₹{Math.round(finalPayable)}</p>
            </div>
            <button
              className="bg-white text-[#eb483f] px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all"
              onClick={() => navigate('/payment', { state: { amount: finalPayable, batch } })}
            >
              Enroll Now
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Trainer & Schedule */}
          <div className="lg:col-span-7 space-y-8">
            {/* Coach Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 transform translate-x-8 -translate-y-8 opacity-5 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-700">
                <GraduationCap size={160} className="text-[#eb483f]" />
              </div>

              <div className="relative flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left">
                <div className="relative shrink-0">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-[36px] overflow-hidden shadow-2xl ring-4 ring-[#eb483f]/5 group-hover:ring-[#eb483f]/10 transition-all">
                    <img
                      src={batch.image}
                      className="w-full h-full object-cover transform scale-110 group-hover:scale-125 transition-transform duration-1000"
                      alt={batch.coachName}
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#eb483f] to-[#ff6b6b] text-white w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
                    <Star size={18} fill="currentColor" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-3">
                    <span className="px-3 py-1 rounded-xl bg-[#eb483f]/10 text-[#eb483f] text-[9px] font-black uppercase tracking-[0.2em] border border-[#eb483f]/20">
                      Elite Academic Trainer
                    </span>
                  </div>
                  <h3 className="text-3xl font-black font-display tracking-tight text-[#0F172A] mb-1">
                    {batch.coachName}
                  </h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-wider">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      4.95 Rating
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-wider">
                      <Users size={12} className="text-blue-500" />
                      500+ Students
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-[#eb483f]/20 transition-colors">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Professional EXP</p>
                      <p className="text-sm font-black text-[#0F172A]">8+ Years Coaching</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-[#eb483f]/20 transition-colors">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Training Level</p>
                      <p className="text-sm font-black text-[#eb483f] uppercase">{batch.level}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Batch Info Grid */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] ml-4 text-slate-400">Scheduled Training Sessions</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Calendar size={80} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Class Schedule</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                      <Calendar size={24} />
                    </div>
                    <span className="text-xl font-black tracking-tight text-[#0F172A]">{batch.days}</span>
                  </div>
                </div>

                <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Clock size={80} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Batch Timing</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Clock size={24} />
                    </div>
                    <span className="text-xl font-black tracking-tight text-[#0F172A]">{batch.timing}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Factors - Horizontal on summary */}
            <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck size={20} className="text-[#eb483f]" />
                <h5 className="text-[11px] font-black uppercase tracking-widest text-[#0F172A]">Academy Enrollment Benefits</h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {[
                  "Professional assessment report",
                  "Certified Elite Academic Coach",
                  "Safe & sanitised Arena environment",
                  "Exclusive tournament priority"
                ].map((text, i) => (
                  <div key={i} className="flex gap-3 items-center group cursor-default">
                    <div className="w-6 h-6 rounded-lg bg-[#eb483f]/10 flex items-center justify-center group-hover:bg-[#eb483f] transition-colors">
                      <CheckCircle2 size={12} className="text-[#eb483f] group-hover:text-white" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 group-hover:text-[#0F172A] transition-colors">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Fees and Summary */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="space-y-4">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] ml-4 text-slate-400">Subscription Fees Review</h4>

              <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                      <span className="text-xs font-bold text-slate-500 group-hover:text-[#0F172A] transition-colors">Monthly Coaching Fee</span>
                      <span className="text-base font-black text-[#0F172A]">₹{monthlyFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-xs font-bold text-slate-500 group-hover:text-[#0F172A] transition-colors">Elite Registration (One-time)</span>
                      <span className="text-base font-black text-[#0F172A]">₹{regFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">GST (Taxes)</span>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg text-slate-400 font-black">18%</span>
                      </div>
                      <span className="text-base font-black text-[#0F172A]">₹{gst.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="h-px bg-dashed bg-slate-100" />

                  {/* Total amount highlight */}
                  <div className="p-8 bg-[#0F172A] rounded-[32px] relative overflow-hidden group shadow-2xl shadow-black/20">
                    <div className="absolute bottom-0 right-0 p-4 opacity-10 transition-opacity">
                      <GraduationCap size={140} className="text-white" />
                    </div>

                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-white/40">Total Amount</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black font-display tracking-tight text-white">₹{Math.round(finalPayable)}</span>
                        <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Included Taxes</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#eb483f] animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Subscription Due Monthly</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 text-center border-t border-slate-100">
                  <div className="flex items-center justify-center gap-3">
                    <ShieldCheck size={16} className="text-[#eb483f]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">100% Secure Transaction</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block pt-4">
              <button
                className="w-full bg-[#eb483f] text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-[#eb483f]/30 hover:shadow-[#eb483f]/40 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                onClick={() => navigate('/payment', { state: { amount: finalPayable, batch } })}
              >
                Enroll Now
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Payment Action - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-[100] lg:hidden">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-2xl p-2 rounded-[32px] border border-white shadow-2xl shadow-black/20">
          <button
            className="w-full bg-[#eb483f] text-white py-5 rounded-[28px] font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-[#eb483f]/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
            onClick={() => navigate('/payment', { state: { amount: finalPayable, batch } })}
          >
            Pay ₹{Math.round(finalPayable)} Now
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachingSummary;
