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
    <div className="min-h-screen pb-20 relative overflow-hidden bg-[#F8FAFC]">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#eb483f]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Mobile-Only Red Header */}
      <div className="md:hidden">
        <div className={`px-4 pt-4 pb-4 backdrop-blur-2xl border-b border-white/10 bg-[#eb483f] rounded-b-[24px] shadow-[0_10px_20px_rgba(235, 72, 63, 0.2)]`}>
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
        {/* Page Header Area - Shown only on Desktop */}
        <div className="hidden md:flex items-center gap-4 mb-6 md:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 text-[#eb483f] shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-95 transition-all hover:shadow-md"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#eb483f] tracking-tight uppercase">COACHING CLASSES</h1>
            <p className="text-[9px] md:text-[10px] text-[#eb483f]/60 font-black tracking-[0.2em] uppercase mt-0.5">Learn from Top Professionals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 lg:gap-6">
          {COACHING_BATCHES.map((batch, index) => (
            <CoachCard key={batch.id} batch={batch} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Coaching;
