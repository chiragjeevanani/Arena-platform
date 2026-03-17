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
    <div className="min-h-screen pb-32 relative overflow-hidden bg-[#F8FAFC]">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#eb483f]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Mobile-Only Red Header */}
      <div className="md:hidden">
        <div className={`px-6 pt-6 pb-8 backdrop-blur-2xl border-b border-white/10 bg-[#eb483f] rounded-b-[40px] shadow-[0_15px_40px_rgba(235, 72, 63, 0.25)]`}>
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-lg active:scale-95 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-bold font-display text-white tracking-tight uppercase">Coaching Classes</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-10 md:pt-16 pb-20 relative z-10">
        {/* Page Header Area - Shown only on Desktop */}
        <div className="hidden md:flex items-center gap-4 mb-10 md:mb-16">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 text-[#eb483f] shadow-[0_4px_20px_rgba(0,0,0,0.03)] active:scale-95 transition-all hover:shadow-md"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#eb483f] tracking-tight uppercase">COACHING CLASSES</h1>
            <p className="text-[10px] md:text-[11px] text-[#eb483f]/60 font-black tracking-[0.3em] uppercase mt-1">Learn from Top Professionals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10">
          {COACHING_BATCHES.map((batch, index) => (
            <CoachCard key={batch.id} batch={batch} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Coaching;
