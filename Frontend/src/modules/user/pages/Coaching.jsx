import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COACHING_BATCHES } from '../../../data/mockData';
import CoachCard from '../components/CoachCard';
import DesktopNavbar from '../components/DesktopNavbar';
import { useTheme } from '../context/ThemeContext';

const Coaching = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('Weekdays');

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden bg-[#F8FAFC]">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#CE2029]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Mobile-Only Red Header */}
      <div className="md:hidden">
        <div className={`px-4 pt-4 pb-4 backdrop-blur-2xl border-b border-white/10 bg-[#CE2029] rounded-b-[24px] shadow-[0_10px_20px_rgba(206, 32, 41, 0.2)]`}>
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-sm active:scale-95 transition-all"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-lg font-bold font-display text-white tracking-tight uppercase">Coaching Classes</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-6 md:pt-10 pb-16 relative z-10">
        {/* Page Header Area - COMPACT */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-slate-100 text-[#CE2029] shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-black text-[#1e293b] tracking-tighter uppercase italic leading-none">
                Coaching <span className="text-[#CE2029] not-italic">Matrix</span>
              </h1>
              <p className="text-[8px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">Official Training Programs</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
              ))}
            </div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">+120 Students Joined</p>
          </div>
        </div>

        {/* NEW: Program & Pricing Section - THE COMPACT MATRIX */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-3">
            <h2 className="text-xs font-black text-[#1e293b] tracking-widest uppercase">Select Frequency</h2>
            
            <div className="flex items-center gap-6">
              {['Weekdays', 'Weekends', 'Special'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-1 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                    activeTab === tab 
                      ? 'text-[#CE2029]' 
                      : 'text-[#36454F] hover:text-[#36454F]/80'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#CE2029] rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2">
            <AnimatePresence mode="wait">
              {PROGRAMS[activeTab].map((prog, i) => (
                <motion.div 
                  key={`${activeTab}-${prog.id}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.01 }}
                  className="group bg-white rounded-[14px] p-2.5 border border-slate-100 hover:border-[#CE2029] hover:shadow-sm transition-all duration-300 relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-5 h-5 rounded-md bg-slate-50 flex items-center justify-center text-[7px] font-black text-slate-300 group-hover:bg-[#CE2029]/10 group-hover:text-[#CE2029] transition-colors">
                      {prog.id}
                    </span>
                    <span className="text-[5px] font-black text-slate-300 uppercase tracking-[0.2em]">{prog.type}</span>
                  </div>

                  <h4 className="text-[9px] font-black text-[#1e293b] leading-tight mb-3 tracking-tight group-hover:text-[#CE2029] transition-colors uppercase">
                    {prog.title}
                  </h4>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[6px] font-black text-[#CE2029]">OMR</span>
                      <span className="text-sm font-black text-[#1e293b] tracking-tighter">{prog.fee.toFixed(2)}</span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-[#CE2029] group-hover:text-white transition-all">
                       <ArrowLeft size={8} className="rotate-180" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="mt-5 p-3 bg-slate-50 rounded-[14px] border border-slate-100 flex items-center justify-center">
            <button 
              onClick={() => {
                window.location.href = 'tel:+96812345678';
              }}
              className="px-8 py-2.5 bg-[#1e293b] text-white rounded-lg font-black text-[8px] uppercase tracking-widest hover:bg-[#CE2029] transition-all shadow-md text-center"
            >
              Enquire Via Contact
            </button>
          </div>
        </div>

        {/* BATCH SECTION */}
        <div className="flex items-center gap-3 mb-5">
            <h3 className="text-xs font-black text-[#1e293b] tracking-widest uppercase italic">Active Batches</h3>
            <div className="flex-1 h-[1px] bg-slate-100 opacity-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {COACHING_BATCHES.map((batch, index) => (
            <CoachCard key={batch.id} batch={batch} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

const PROGRAMS = {
  Weekdays: [
    { id: 1, type: 'CORE', title: 'WEEKDAYS 4DW / WEEK', fee: 30.00 },
    { id: 2, type: 'SIBLING', title: 'WEEKDAYS 4DW / WEEK SIB', fee: 25.00 },
    { id: 3, type: 'CORE', title: 'WEEKDAYS 3DW / WEEK', fee: 20.00 },
    { id: 4, type: 'FLEX', title: 'WEEKDAYS 15 DAYS / MONTH', fee: 15.00 },
  ],
  Weekends: [
    { id: 5, type: 'CORE', title: 'WEEKEND SESSIONS', fee: 30.00 },
    { id: 6, type: 'SIBLING', title: 'WEEKEND SIBLING', fee: 25.00 },
  ],
  Special: [
    { id: 7, type: 'ADULT', title: 'ADULT TRAINING', fee: 30.00 },
    { id: 8, type: 'PRO', title: 'SPECIAL SINGLE', fee: 7.00 },
    { id: 9, type: 'PRO', title: 'SPECIAL DOUBLE', fee: 5.00 },
    { id: 10, type: 'FAMILY', title: 'SPECIAL SIBLING', fee: 3.00 },
    { id: 11, type: 'ELITE', title: 'SPECIAL MONTHLY', fee: 80.00 },
  ]
};

export default Coaching;
