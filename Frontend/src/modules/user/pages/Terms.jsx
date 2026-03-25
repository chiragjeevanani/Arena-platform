import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, ShieldAlert, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Terms = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const sections = [
    {
      icon: BadgeCheck,
      title: '1. Acceptance of Terms',
      content: 'By accessing and using the Arena application, you accept and agree to be bound by the terms and provision of this agreement. Any participation in this service will constitute acceptance of this agreement.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: CheckCircle,
      title: '2. Booking & Cancellation Policy',
      content: 'Bookings must be made in advance. Cancellations are permitted up to 4 hours prior to the booked slot for a full refund. Late cancellations will strictly incur a 100% cancellation fee.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      icon: ShieldAlert,
      title: '3. User Conduct & Liability',
      content: 'Users are expected to maintain sportsmanship and discipline inside the arenas. The management is not liable for any personal injuries sustained during play or loss of personal belongings.',
      color: 'text-[#eb483f]',
      bg: 'bg-[#eb483f]/10'
    }
  ];

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden transition-colors duration-500 ${
      isDark ? 'md:bg-[#020D08]' : 'md:bg-[#F0FFF4]'
    }`}>
      {/* Premium Background Decorative Elements (Desktop) */}
      <div className="hidden md:block fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] transition-all duration-1000 ${
          'bg-[#eb483f]/[0.08]'
        }`} />
        <div className={`absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] rounded-full blur-[180px] transition-all duration-1000 ${
          'bg-blue-50/30'
        }`} />
        <div className="absolute inset-0 opacity-[0.2]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, rgba(15, 23, 42, 0.04) 1px, transparent 0)`, 
            backgroundSize: '40px 40px' 
          }} 
        />
      </div>

      {/* Header */}
      <div className={`px-4 md:px-6 pt-4 pb-4 md:pt-6 md:pb-6 backdrop-blur-2xl border-b border-white/10 bg-[#eb483f] rounded-b-3xl md:rounded-b-[2rem] shadow-[0_10px_30px_rgba(235,72,63,0.15)] relative z-50`}>
        <div className="max-w-4xl mx-auto flex items-center gap-3 md:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-sm active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg md:text-xl font-bold font-display text-white tracking-tight uppercase">Terms & Conditions</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-6 md:mt-10 relative z-10">
        <div className="flex flex-col gap-6 md:gap-8 items-start">
          
          {/* Hero Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full p-6 md:p-10 rounded-3xl md:rounded-[40px] flex flex-col md:flex-row items-center gap-6 border shadow-2xl ${
              isDark ? 'bg-[#151b29] border-white/5' : 'bg-white border-blue-50'
            }`}
          >
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[28px] shrink-0 flex items-center justify-center shadow-lg ${'bg-[#eb483f]/10 text-[#eb483f]'}`}>
              <FileText size={32} className="md:w-10 md:h-10" />
            </div>
            <div>
              <h2 className={`text-xl md:text-2xl font-black font-display uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>User Agreement</h2>
              <p className={`text-xs md:text-sm mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Please read these terms and conditions carefully before using our platform. Your access to and use of the service is conditioned on your acceptance of and compliance with these terms.
              </p>
            </div>
          </motion.div>

          {/* Detailed Clauses */}
          <div className="flex-1 w-full space-y-4 md:space-y-6">
            <h3 className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] px-2 mb-2 md:mb-4 ${isDark ? 'text-[#eb483f]/40' : 'text-slate-400'}`}>
              Legal Policies
            </h3>
            
            <div className="space-y-4">
              {sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-5 md:p-6 rounded-[24px] md:rounded-[32px] border transition-all ${
                    isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-blue-50 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4 md:gap-5">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl shrink-0 flex items-center justify-center shadow-sm ${section.bg} ${section.color}`}>
                      <section.icon size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm md:text-base tracking-tight mb-1 md:mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {section.title}
                      </h3>
                      <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {section.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;
