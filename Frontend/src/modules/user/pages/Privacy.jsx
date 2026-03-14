import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText, Bell, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Privacy = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const sections = [
    {
      icon: Lock,
      title: 'Data Security',
      content: 'We use industry-standard encryption to protect your personal data and payment information. Your data is stored securely on our encrypted servers.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Eye,
      title: 'Privacy Policy',
      content: 'We do not sell your personal information to third parties. We only share data necessary for processing your bookings and improving our services.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      icon: Bell,
      title: 'Marketing Preferences',
      content: 'You can choose to opt-out of marketing emails and notifications at any time through your profile settings.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ];

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden transition-colors duration-500 ${
      isDark ? 'md:bg-[#020D08]' : 'md:bg-[#F0FFF4]'
    }`}>
      {/* Premium Background Decorative Elements (Desktop) */}
      <div className="hidden md:block fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] transition-all duration-1000 ${
          isDark ? 'bg-[#22FF88]/[0.03]' : 'bg-[#22FF88]/[0.08]'
        }`} />
        <div className={`absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] rounded-full blur-[180px] transition-all duration-1000 ${
          isDark ? 'bg-[#1EE7FF]/[0.02]' : 'bg-blue-50/30'
        }`} />
        <div className="absolute inset-0 opacity-[0.2]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, ${isDark ? 'rgba(34, 255, 136, 0.08)' : 'rgba(15, 23, 42, 0.04)'} 1px, transparent 0)`, 
            backgroundSize: '40px 40px' 
          }} 
        />
      </div>

      {/* Header */}
      <div className={`px-6 pt-5 pb-5 sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${isDark ? 'bg-[#08142B]/80 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}>
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border active:scale-95 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white border-blue-100 text-[#0A1F44] shadow-sm'}`}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className={`text-lg font-bold font-display uppercase tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Privacy & Security</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-4 md:mt-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          
          {/* LEFT COLUMN: Hero Card & Quick Links */}
          <div className="w-full md:w-[380px] space-y-4 md:space-y-6 shrink-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-5 md:p-8 rounded-2xl md:rounded-[40px] flex flex-col items-center text-center border shadow-2xl ${
                isDark ? 'bg-[#0A1F44] border-white/10' : 'bg-[#0A1F44] text-white'
              }`}
            >
              <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[28px] flex items-center justify-center mb-4 md:mb-6 ${isDark ? 'bg-white/5 text-[#22FF88]' : 'bg-white/10 text-white shadow-inner'}`}>
                <Shield size={28} className="md:w-10 md:h-10 drop-shadow-[0_0_15px_rgba(34,255,136,0.3)]" />
              </div>
              <h2 className="text-xl md:text-2xl font-black font-display uppercase tracking-tight">Your data is safe</h2>
              <p className={`text-xs md:text-sm mt-3 md:mt-4 leading-relaxed opacity-60 ${isDark ? 'text-white' : 'text-white/80'}`}>
                We prioritize your privacy and use advanced security measures to keep your account secure.
              </p>
            </motion.div>

            {/* Quick Action Item Links */}
            <div className="space-y-2 md:space-y-3">
              {[
                { icon: FileText, title: 'Terms of Service', color: 'text-blue-500' },
                { icon: Smartphone, title: 'App Permissions', color: 'text-emerald-500' }
              ].map((item, i) => (
                <button 
                  key={i}
                  className={`w-full p-4 md:p-5 rounded-2xl md:rounded-3xl flex items-center justify-between border transition-all hover:scale-[1.02] ${
                    isDark ? 'bg-white/5 border-white/5 hover:bg-white/10 shadow-lg' : 'bg-white border-blue-50 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <item.icon size={18} className={`md:w-5 md:h-5 ${item.color}`} />
                    <span className={`font-bold text-xs md:text-sm ${isDark ? 'text-white/70' : 'text-[#0A1F44]/70'}`}>{item.title}</span>
                  </div>
                  <ArrowLeft size={16} className="rotate-180 opacity-20 md:w-[18px] md:h-[18px]" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Detailed Privacy Sections */}
          <div className="flex-1 w-full space-y-4 md:space-y-6">
            <h3 className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] px-2 mb-2 md:mb-4 ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>
              Detailed Policies & Security
            </h3>
            
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-5 md:p-6 rounded-[24px] md:rounded-[32px] border transition-all hover:translate-x-1 ${
                    isDark ? 'bg-[#0A1F44]/40 border-white/5 backdrop-blur-md' : 'bg-white border-blue-50 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4 md:gap-5">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl shrink-0 flex items-center justify-center shadow-lg ${section.bg} ${section.color}`}>
                      <section.icon size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h3 className={`font-black text-base md:text-lg tracking-tight mb-1 md:mb-2 ${isDark ? 'text-white/90' : 'text-[#0A1F44]'}`}>
                        {section.title}
                      </h3>
                      <p className={`text-xs md:text-sm leading-relaxed opacity-60 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
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

export default Privacy;
