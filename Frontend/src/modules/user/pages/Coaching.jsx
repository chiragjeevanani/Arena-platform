import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CoachCard from '../components/CoachCard';
import DesktopNavbar from '../components/DesktopNavbar';
import { useTheme } from '../context/ThemeContext';
import { isApiConfigured } from '../../../services/config';
import { fetchPublicArenas } from '../../../services/arenasApi';
import { fetchPublicCoachingBatches } from '../../../services/coachingPublicApi';
import { mapPublicBatchToCoachCard } from '../../../utils/coachingBatchAdapter';

const Coaching = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('Weekdays');
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    if (!isApiConfigured()) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { arenas } = await fetchPublicArenas();
        const out = [];
        for (const a of arenas || []) {
          try {
            const data = await fetchPublicCoachingBatches(a.id);
            const name = a.name || '';
            for (const b of data.batches || []) {
              out.push(mapPublicBatchToCoachCard(b, name));
            }
          } catch {
            /* skip */
          }
        }
        if (!cancelled) setBatches(out);
      } catch {
        if (!cancelled) setBatches([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">
            Published coaching batches from your arenas appear below. Program matrices here are removed in favor of live API data.
          </p>
        </div>

        {/* BATCH SECTION */}
        <div className="flex items-center gap-3 mb-5">
            <h3 className="text-xs font-black text-[#1e293b] tracking-widest uppercase italic">Active Batches</h3>
            <div className="flex-1 h-[1px] bg-slate-100 opacity-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {batches.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-500 py-12">
              No published coaching batches yet. Publish batches in the admin and set <span className="font-mono">VITE_API_URL</span>.
            </p>
          )}
          {batches.map((batch, index) => (
            <CoachCard key={batch.id} batch={batch} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Coaching;
