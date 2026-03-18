import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import GroupIcon from '@mui/icons-material/Group';
import VerifiedIcon from '@mui/icons-material/Verified';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const CoachingSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const { batch } = state || {};

  if (!batch) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[#F8FAFC]">
      <div className="w-16 h-16 bg-[#eb483f]/10 rounded-2xl flex items-center justify-center mb-4">
        <SchoolIcon style={{ fontSize: 32 }} className="text-[#eb483f]" />
      </div>
      <h2 className="text-lg font-black text-[#0F172A] mb-1 uppercase tracking-tight">No Details Found</h2>
      <p className="text-xs font-bold text-slate-400 mb-6">Please select a coaching batch first to view the enrollment summary.</p>
      <button
        onClick={() => navigate('/coaching')}
        className="bg-[#eb483f] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#eb483f]/20 active:scale-95 transition-all"
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
    <div className="min-h-screen pb-24 relative overflow-hidden bg-[#F8FAFC]">
      {/* Background Decorative Glows */}
      <div className="absolute top-24 -right-24 w-80 h-80 bg-[#eb483f]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[600px] -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="bg-[#eb483f] px-4 py-4 shadow-md border-b border-white/10 sticky top-0 z-[60]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-md active:scale-95 transition-all"
            >
              <ArrowBackIcon style={{ fontSize: 18 }} />
            </button>
            <div>
              <h1 className="text-lg font-black text-white font-display tracking-tight uppercase leading-none">Enrollment Summary</h1>
              <p className="text-[9px] font-bold text-white/60 tracking-widest uppercase mt-1">Review Your Academy Details</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-[8px] font-black text-white/60 uppercase tracking-widest">Total Payable</p>
              <p className="text-xl font-black text-white font-display">₹{Math.round(finalPayable)}</p>
            </div>
            <button
              className="bg-white text-[#eb483f] px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95 transition-all"
              onClick={() => navigate('/payment', { state: { amount: finalPayable, batch } })}
            >
              Enroll Now
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Trainer & Schedule */}
          <div className="lg:col-span-7 space-y-6">
            {/* Coach Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[24px] p-5 md:p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 transform translate-x-6 -translate-y-6 opacity-10 group-hover:opacity-20 transition-all duration-700">
                <SchoolIcon style={{ fontSize: 140 }} className="text-[#eb483f]" />
              </div>

              <div className="relative flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-[20px] overflow-hidden shadow-lg ring-2 ring-[#eb483f]/5 group-hover:ring-[#eb483f]/10 transition-all">
                    <img
                      src={batch.image}
                      className="w-full h-full object-cover transform scale-110 group-hover:scale-125 transition-transform duration-1000"
                      alt={batch.coachName}
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#eb483f] to-[#ff6b6b] text-white w-8 h-8 rounded-xl flex items-center justify-center border-[3px] border-white shadow-md">
                    <StarRoundedIcon style={{ fontSize: 16 }} />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#eb483f]/10 text-[#eb483f] text-[8px] font-black uppercase tracking-[0.2em] border border-[#eb483f]/20">
                      Elite Academic Trainer
                    </span>
                  </div>
                  <h3 className="text-2xl font-black font-display tracking-tight text-[#0F172A] mb-1">
                    {batch.coachName}
                  </h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      <StarRoundedIcon style={{ fontSize: 14 }} className="text-amber-400" />
                      4.95 Rating
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      <GroupIcon style={{ fontSize: 14 }} className="text-blue-500" />
                      500+ Students
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-[#eb483f]/20 transition-colors">
                      <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Professional EXP</p>
                      <p className="text-xs font-black text-[#0F172A]">8+ Years</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-[#eb483f]/20 transition-colors">
                      <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Training Level</p>
                      <p className="text-xs font-black text-[#eb483f] uppercase">{batch.level}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Batch Info Grid */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-slate-400">Scheduled Training Sessions</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-white rounded-[24px] border border-slate-100 shadow-lg shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CalendarMonthIcon style={{ fontSize: 75 }} className="text-[#eb483f]" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 text-slate-400">Class Schedule</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                        <CalendarMonthIcon style={{ fontSize: 20 }} />
                      </div>
                      <span className="text-lg font-black tracking-tight text-[#0F172A]">{batch.days}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-[24px] border border-slate-100 shadow-lg shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AccessTimeIcon style={{ fontSize: 75 }} className="text-blue-500" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 text-slate-400">Batch Timing</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <AccessTimeIcon style={{ fontSize: 20 }} />
                      </div>
                      <span className="text-lg font-black tracking-tight text-[#0F172A]">{batch.timing}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Factors - Horizontal on summary */}
            <div className="p-5 md:p-6 bg-white rounded-[24px] border border-slate-100 shadow-lg shadow-slate-200/40">
              <div className="flex items-center gap-2 mb-4">
                <VerifiedIcon style={{ fontSize: 18 }} className="text-[#eb483f]" />
                <h5 className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Academy Enrollment Benefits</h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                {[
                  "Assessment report",
                  "Certified Elite Coach",
                  "Sanitised Arena",
                  "Tournament priority"
                ].map((text, i) => (
                  <div key={i} className="flex gap-2.5 items-center group cursor-default">
                    <div className="w-5 h-5 rounded-md bg-[#eb483f]/10 flex items-center justify-center group-hover:bg-[#eb483f] transition-colors shrink-0">
                      <CheckCircleIcon style={{ fontSize: 12 }} className="text-[#eb483f] group-hover:text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 group-hover:text-[#0F172A] transition-colors line-clamp-1">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Fees and Summary */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-slate-400">Subscription Fees Review</h4>

              <div className="bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-5 md:p-6 space-y-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center group">
                      <span className="text-[11px] font-bold text-slate-500 group-hover:text-[#0F172A] transition-colors">Monthly Coaching Fee</span>
                      <span className="text-sm font-black text-[#0F172A]">₹{monthlyFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-[11px] font-bold text-slate-500 group-hover:text-[#0F172A] transition-colors">Registration (One-time)</span>
                      <span className="text-sm font-black text-[#0F172A]">₹{regFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-500">GST (Taxes)</span>
                        <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-400 font-black">18%</span>
                      </div>
                      <span className="text-sm font-black text-[#0F172A]">₹{gst.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="h-px bg-dashed bg-slate-100" />

                  {/* Total amount highlight */}
                  <div className="p-5 md:p-6 bg-[#0F172A] rounded-[20px] relative overflow-hidden group shadow-xl shadow-black/20">
                    <div className="absolute bottom-0 right-0 p-3 opacity-10 transition-opacity">
                      <SchoolIcon style={{ fontSize: 100 }} className="text-white" />
                    </div>

                    <div className="relative z-10">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-1 text-white/40">Total Amount</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black font-display tracking-tight text-white">₹{Math.round(finalPayable)}</span>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Included Taxes</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#eb483f] animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/60">Subscription Due Monthly</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                  <div className="flex items-center justify-center gap-2">
                    <VerifiedIcon style={{ fontSize: 16 }} className="text-[#eb483f]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">100% Secure Transaction</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block pt-2">
              <button
                className="w-full bg-[#eb483f] text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#eb483f]/30 hover:shadow-[#eb483f]/40 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                onClick={() => navigate('/payment', { state: { amount: finalPayable, batch } })}
              >
                Enroll Now
                <ArrowForwardIcon style={{ fontSize: 18 }} className="group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Payment Action - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-[100] lg:hidden">
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-2xl p-1.5 rounded-[24px] border border-slate-100 shadow-xl shadow-black/10">
          <button
            className="w-full bg-[#eb483f] text-white py-3.5 rounded-[20px] font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-[#eb483f]/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            onClick={() => navigate('/payment', { state: { amount: finalPayable, batch } })}
          >
            Pay ₹{Math.round(finalPayable)} Now
            <ArrowForwardIcon style={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachingSummary;
