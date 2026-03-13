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
    <div className={`min-h-screen pb-32 relative overflow-hidden ${isDark ? '' : 'bg-slate-50/50'}`}>
      {/* Premium Background Decorative Elements */}
      {!isDark && (
        <>
          <div className="absolute top-40 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#22FF88]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Main Container for Compact Desktop View */}
      <div className="max-w-2xl mx-auto md:pt-12 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full overflow-hidden md:rounded-none rounded-none md:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.1)] md:border transition-all duration-500 ${
            isDark ? 'md:bg-[#08142B] md:border-white/10' : 'md:bg-white md:border-slate-100'
          }`}
        >
          {/* Header */}
          <div className={`px-6 pt-5 pb-5 backdrop-blur-xl border-b transition-all ${isDark ? 'bg-[#08142B]/80 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className={`w-10 h-10 md:rounded-none rounded-2xl flex items-center justify-center border active:scale-95 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white border-blue-100 text-[#0A1F44] shadow-sm'}`}
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className={`text-lg font-bold font-display uppercase tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Privacy & Security</h1>
            </div>
          </div>

          <div className="px-6 md:px-10 py-8 space-y-8">
            <div className={`p-8 md:rounded-none rounded-[40px] flex flex-col items-center text-center border ${isDark ? 'bg-white/5 border-white/5' : 'bg-[#0A1F44] text-white'}`}>
              <div className={`w-16 h-16 md:rounded-none rounded-[22px] flex items-center justify-center mb-4 ${isDark ? 'bg-white/5 text-blue-400' : 'bg-white/10 text-white'}`}>
                <Shield size={32} />
              </div>
              <h2 className="text-xl font-black font-display uppercase tracking-tight">Your data is safe</h2>
              <p className={`text-sm mt-3 leading-relaxed opacity-60 ${isDark ? 'text-white' : 'text-white/80'}`}>We prioritize your privacy and use advanced security measures to keep your account secure.</p>
            </div>

            <div className="space-y-4">
              {sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-5 md:rounded-none rounded-[28px] border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-10 h-10 md:rounded-none rounded-xl flex items-center justify-center ${section.bg} ${section.color}`}>
                      <section.icon size={20} />
                    </div>
                    <h3 className={`font-black text-base tracking-tight ${isDark ? 'text-white/90' : 'text-[#0A1F44]'}`}>{section.title}</h3>
                  </div>
                  <p className={`text-sm leading-relaxed opacity-50 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{section.content}</p>
                </motion.div>
              ))}
            </div>

            {/* Action Items */}
            <div className="space-y-3 pt-4">
              <button className={`w-full p-4 md:rounded-none rounded-2xl flex items-center justify-between border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-blue-50 shadow-sm hover:shadow-md'}`}>
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-blue-500" />
                  <span className={`font-bold text-sm ${isDark ? 'text-white/70' : 'text-[#0A1F44]/70'}`}>Terms of Service</span>
                </div>
                <ArrowLeft className="rotate-180 opacity-20" size={16} />
              </button>
              <button className={`w-full p-4 md:rounded-none rounded-2xl flex items-center justify-between border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-blue-50 shadow-sm hover:shadow-md'}`}>
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-emerald-500" />
                  <span className={`font-bold text-sm ${isDark ? 'text-white/70' : 'text-[#0A1F44]/70'}`}>App Permissions</span>
                </div>
                <ArrowLeft className="rotate-180 opacity-20" size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
