import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { COACHING_BATCHES } from '../../../data/mockData';
import CoachCard from '../components/CoachCard';
import DesktopNavbar from '../components/DesktopNavbar';
import { useTheme } from '../context/ThemeContext';

const Coaching = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen pb-28">
      {/* Header â€” Hidden on Desktop */}
      <div className="md:hidden">
        <div className={`px-6 pt-5 pb-5 sticky top-0 z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#F3655D]/80 border-white/5' : 'bg-[#F3655D] border-white/10 rounded-b-[30px] shadow-[0_10px_30px_rgba(10,31,68,0.15)]'}`}>
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border active:scale-95 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white/10 border-white/20 text-white shadow-sm'}`}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold font-display text-white">Coaching Classes</h1>
              <p className="text-[10px] font-medium text-white/40">Learn from professional coaches</p>
            </div>
          </div>
          {/* Desktop Navigation */}
          <DesktopNavbar />
        </div>
      </div>
...

      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {COACHING_BATCHES.map((batch, index) => (
          <CoachCard key={batch.id} batch={batch} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Coaching;

