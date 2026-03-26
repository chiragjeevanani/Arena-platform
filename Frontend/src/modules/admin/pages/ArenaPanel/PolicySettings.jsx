import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, DollarSign, ArrowRight, Zap, Target, BookOpen, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';

const PolicySettings = () => {
  const [refundRules, setRefundRules] = useState([
    { hours: 24, percent: 100, active: true },
    { hours: 12, percent: 50, active: true },
    { hours: 4, percent: 0, active: true },
  ]);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls = "w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#eb483f] focus:bg-white transition-all text-[#1a2b3c]";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
      {/* 1. Policy Config */}
      <div className="xl:col-span-3 space-y-6">
        {/* Dynamic Refund Rules */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                 <DollarSign size={24} />
              </div>
              <div>
                 <h3 className="font-black text-[#1a2b3c] text-lg uppercase tracking-widest">Refund Thresholds</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configure percentage refunds based on cancellation time</p>
              </div>
           </div>

           <div className="space-y-4">
              {refundRules.map((rule, idx) => (
                 <div key={idx} className="flex flex-col md:flex-row items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-all">
                    <div className="flex-1 space-y-2 w-full">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cancellation Time</label>
                       <div className="relative">
                          <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="number" value={rule.hours} className={`${inputCls} pl-11`} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400">Hours Before</span>
                       </div>
                    </div>
                    <div className="hidden md:block">
                       <ArrowRight size={20} className="text-slate-300" />
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Refund Percentage</label>
                       <div className="relative">
                          <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#eb483f]" />
                          <input type="number" value={rule.percent} className={`${inputCls} pl-11`} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black uppercase tracking-widest text-slate-400">%</span>
                       </div>
                    </div>
                    <button className="p-3 text-slate-300 hover:text-[#eb483f] transition-all">
                       {rule.active ? <ToggleRight size={32} className="text-[#eb483f]" /> : <ToggleLeft size={32} />}
                    </button>
                 </div>
              ))}
           </div>
        </div>

        {/* Miscellaneous Policies */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1a2b3c] mb-6">General Arena Rules</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border border-slate-100">
                 <div className="flex items-center gap-2 mb-4 text-[#6366f1]">
                    <Zap size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Auto Cancellation</span>
                 </div>
                 <p className="text-[11px] font-bold text-slate-500 leading-relaxed mb-4">Automatically cancel pending bookings if payment is not received within 15 minutes.</p>
                 <button className="flex items-center gap-2 py-2 px-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/20">
                    <ToggleRight size={20} /> ENABLED
                 </button>
              </div>

              <div className="p-5 rounded-2xl border border-slate-100">
                 <div className="flex items-center gap-2 mb-4 text-[#eb483f]">
                    <Target size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">No-Show Penalty</span>
                 </div>
                 <p className="text-[11px] font-bold text-slate-500 leading-relaxed mb-4">Deduct OMR 1.000 from wallet if user doesn't check-in for 2 consecutive bookings.</p>
                 <button className="flex items-center gap-2 py-2 px-3 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <ToggleLeft size={20} /> DISABLED
                 </button>
              </div>
           </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className={`w-full py-5 rounded-3xl text-[12px] font-black uppercase tracking-[0.25em] shadow-lg flex items-center justify-center gap-3 transition-all ${
            saved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-[#1a2b3c] text-white hover:shadow-[#1a2b3c]/30 hover:-translate-y-0.5'
          }`}
        >
          {saved ? (
             <><CheckCircle2 size={18} /> Policies Updated!</>
          ) : (
             <><Shield size={18} /> Update Global Policies</>
          )}
        </motion.button>
      </div>

      {/* 2. Rule Explainer (Help) */}
      <div className="xl:col-span-2">
         <div className="bg-slate-900 p-8 rounded-3xl shadow-xl border border-white/5 sticky top-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#eb483f] mb-8">Rule Documentation</h3>
            
            <div className="space-y-8">
               {[
                 { title: 'The 24h Window', desc: 'Standard platform policy recommends 100% refund if cancelled 24h prior to slot start.', icon: BookOpen },
                 { title: 'Processing Fees', desc: 'A flat fee of OMR 0.100 may be deducted by the platform for each refund.', icon: DollarSign },
                 { title: 'Emergency Lock', desc: 'If arena blocks a court, 100% refund is automatically initiated to all bookings.', icon: Target }
               ].map((doc, i) => (
                 <div key={i} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-[#eb483f] group-hover:border-[#eb483f]/30 transition-all shrink-0">
                       <doc.icon size={18} />
                    </div>
                    <div>
                       <p className="text-sm font-black text-white group-hover:text-[#eb483f] transition-all uppercase tracking-tight mb-1">{doc.title}</p>
                       <p className="text-xs font-bold text-white/40 leading-relaxed">{doc.desc}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-12 p-6 bg-[#eb483f]/10 border border-[#eb483f]/20 rounded-2xl">
               <div className="flex items-center gap-2 mb-2 text-[#eb483f]">
                  <Shield size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Legal Notice</span>
               </div>
               <p className="text-[10px] font-bold text-[#eb483f]/70 leading-relaxed uppercase">Updates to refund policies are sent via email to all active users immediately upon saving.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PolicySettings;
