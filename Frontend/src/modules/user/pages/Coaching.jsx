import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { COACHING_BATCHES } from '../../../data/mockData';
import CoachCard from '../components/CoachCard';
import { useTheme } from '../context/ThemeContext';

const Coaching = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className={`px-6 pt-14 pb-4 sticky top-0 z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#08142B]/80 border-white/5' : 'bg-[#F0F4F8]/80 border-[#0A1F44]/5'}`}>
        <div className="flex items-center gap-4 mb-1">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-2xl glass-light flex items-center justify-center border active:scale-90 transition-transform ${isDark ? 'border-white/10' : 'border-[#0A1F44]/10'}`}
          >
            <ArrowLeft size={18} className={isDark ? 'text-white/60' : 'text-[#0A1F44]/60'} />
          </button>
          <div>
            <h1 className={`text-lg font-bold font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Coaching Classes</h1>
            <p className={`text-[10px] font-medium ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>Learn from professional coaches</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {COACHING_BATCHES.map((batch, index) => (
          <CoachCard key={batch.id} batch={batch} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Coaching;
