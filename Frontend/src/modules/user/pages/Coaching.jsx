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

      {/* Header */}
      <div className="bg-[#eb483f] px-6 py-5 shadow-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-xl active:scale-95 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black text-white font-display tracking-tight uppercase">Coaching Classes</h1>
              <p className="text-[10px] font-bold text-white/60 tracking-widest uppercase mt-0.5">Learn from Top Professionals</p>
            </div>
          </div>
          
          <div className="hidden md:block">
            <DesktopNavbar />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
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
