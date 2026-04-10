import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Mail, Phone, ExternalLink, HelpCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Help = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const faqs = [
    { q: 'How do I book a court?', a: 'Go to the home page, select an arena, choose your court and time slot, and proceed to payment.' },
    { q: 'Can I cancel my booking?', a: 'Yes, bookings can be cancelled up to 4 hours before the slot time. Refunds are credited to your wallet.' },
    { q: 'What is a Premium Member?', a: 'Premium members get exclusive discounts, early access to bookings, and zero convenience fees.' },
  ];

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden ${'bg-[#F8FAFC]'}`}>
      {/* Background Decorative Element */}
      {!isDark && (
        <div className="absolute top-40 -right-24 w-80 h-80 bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />
      )}

      {/* Main Container for Compact Desktop View */}
      <div className="max-w-2xl mx-auto md:pt-12 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full overflow-hidden md:rounded-3xl rounded-none md:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.1)] md:border transition-all duration-500 ${
            isDark ? 'md:bg-[#CE2029] md:border-white/10' : 'md:bg-white md:border-slate-100'
          }`}
        >
          {/* Header - Always Project Theme */}
          <div className={`px-6 pt-4 pb-4 md:pt-6 md:pb-6 backdrop-blur-2xl border-b border-white/10 transition-all duration-500 bg-[#CE2029] shadow-[0_15px_40px_rgba(206, 32, 41,0.25)]`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-none flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-lg active:scale-95 transition-all"
              >
                <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
              <h1 className="text-lg md:text-xl font-bold font-display text-white tracking-tight uppercase">Help & Support</h1>
            </div>
          </div>

          <div className="px-5 md:px-10 py-6 md:py-8 space-y-5 md:space-y-8 relative z-10">


            {/* Contact Info */}
            <div className={`p-6 md:p-8 rounded-3xl md:rounded-2xl border-[2.5px] transition-all duration-300 ${
              isDark ? 'bg-white/5 border-white/10 hover:border-[#CE2029]/40' : 'bg-white border-[#CE2029]/20 shadow-[0_15px_40px_-10px_rgba(206, 32, 41,0.15)] hover:border-[#CE2029]'
            }`}>
              <h3 className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] mb-4 md:mb-6 ${'text-slate-400'}`}>Direct Contact</h3>
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-4 md:gap-5 group cursor-pointer">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                    'bg-amber-50 text-amber-600'
                  }`}>
                    <Phone size={18} className="md:w-[22px] md:h-[22px]" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-wider mb-0.5 ${'text-slate-400'}`}>Call Center</p>
                    <p className={`font-black text-sm md:text-base ${'text-[#0F172A]'}`}>+91 1800-ARENA-99</p>
                  </div>
                  <ChevronRight size={16} className="opacity-20 group-hover:opacity-100 transition-opacity md:w-[18px] md:h-[18px]" />
                </div>
                <div className="flex items-center gap-4 md:gap-5 group cursor-pointer">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                    'bg-purple-50 text-purple-600'
                  }`}>
                    <ExternalLink size={18} className="md:w-[22px] md:h-[22px]" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-wider mb-0.5 ${'text-slate-400'}`}>Help Center</p>
                    <p className={`font-black text-sm md:text-base ${'text-[#0F172A]'}`}>support.arenahub.com</p>
                  </div>
                  <ChevronRight size={16} className="opacity-20 group-hover:opacity-100 transition-opacity md:w-[18px] md:h-[18px]" />
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="space-y-4 md:space-y-5 px-1 pb-4 md:pb-8">
              <h3 className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] ${'text-slate-400'}`}>Popular Questions</h3>
              {faqs.map((faq, idx) => (
                <div key={idx} className={`p-5 md:p-6 rounded-[24px] md:rounded-2xl border-[2.5px] transition-all duration-300 group ${
                  isDark ? 'bg-white/5 border-white/10 hover:border-[#CE2029]/40' : 'bg-white border-[#CE2029]/20 shadow-lg hover:border-[#CE2029] hover:scale-[1.02]'
                }`}>
                  <h4 className={`font-black text-sm md:text-[15px] tracking-tight ${'text-[#0F172A]'}`}>{faq.q}</h4>
                  <p className={`text-[11px] md:text-xs mt-2 md:mt-3 leading-relaxed font-medium ${'text-slate-500'}`}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Help;



