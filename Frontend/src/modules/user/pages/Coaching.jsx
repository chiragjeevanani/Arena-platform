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
import { listMyEnrollments } from '../../../services/meApi';
import { mapPublicBatchToCoachCard } from '../../../utils/coachingBatchAdapter';
import { getAuthToken } from '../../../services/apiClient';

const Coaching = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('Your Batches'); // 'Your Batches' or 'Live'
  const [batches, setBatches] = useState([]);
  const [enrolledBatchIds, setEnrolledBatchIds] = useState(new Set());
  const [batchEnrollmentMap, setBatchEnrollmentMap] = useState({}); // batchId -> enrollmentId
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isApiConfigured()) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // 1. Fetch User Enrollments if logged in
        let enrolledIds = new Set();
        if (getAuthToken()) {
          try {
            const { enrollments } = await listMyEnrollments();
            const activeEn = (enrollments || []).filter(e => e.status === 'confirmed' || e.status === 'pending');
            
            enrolledIds = new Set(activeEn.map(e => String(e.batchId)));
            setEnrolledBatchIds(enrolledIds);
            
            const eMap = {};
            activeEn.forEach(e => {
              eMap[String(e.batchId)] = e.id;
            });
            setBatchEnrollmentMap(eMap);
          } catch (e) {
            console.error('Enrollments fetch failed', e);
          }
        }

        // 2. Fetch Public Batches
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
      } finally {
        if (!cancelled) setLoading(false);
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
        
        {/* Tab Switcher */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex p-1 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10 shadow-lg shadow-black/20' : 'bg-white border-slate-100 shadow-sm shadow-slate-200/50'}`}>
            {['Your Batches', 'Live'].map((tab) => {
              const count = tab === 'Live' 
                ? batches.filter(b => !enrolledBatchIds.has(String(b.id))).length
                : batches.filter(b => enrolledBatchIds.has(String(b.id))).length;
                
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    activeTab === tab 
                      ? 'bg-[#CE2029] text-white shadow-md shadow-[#CE2029]/20' 
                      : isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab}
                  <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${
                    activeTab === tab ? 'bg-white/20 text-white' : isDark ? 'bg-white/10 text-white/40' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
             <div className="w-8 h-8 border-4 border-[#CE2029] border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">Loading Classes...</p>
          </div>
        ) : (
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'Live' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'Live' ? 10 : -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {activeTab === 'Your Batches' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                      {batches.filter(b => enrolledBatchIds.has(String(b.id))).length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30 text-center">
                          <p className="text-[11px] font-black uppercase tracking-widest mb-2">No Active Batches</p>
                          <p className="text-[9px] font-medium max-w-[200px]">You haven't joined any coaching programs yet.</p>
                        </div>
                      ) : (
                        batches
                          .filter(b => enrolledBatchIds.has(String(b.id)))
                          .map((batch, index) => (
                            <CoachCard 
                              key={batch.id} 
                              batch={{ 
                                ...batch, 
                                enrolled: true,
                                enrollmentId: batchEnrollmentMap[String(batch.id)]
                              }} 
                              index={index} 
                            />
                          ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                      {batches.filter(b => !enrolledBatchIds.has(String(b.id))).length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30 text-center">
                          <p className="text-[11px] font-black uppercase tracking-widest mb-2">No New Batches</p>
                          <p className="text-[9px] font-medium max-w-[200px]">All available programs have been joined or are currently full.</p>
                        </div>
                      ) : (
                        batches
                          .filter(b => !enrolledBatchIds.has(String(b.id)))
                          .map((batch, index) => (
                            <CoachCard key={batch.id} batch={batch} index={index} />
                          ))
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coaching;
