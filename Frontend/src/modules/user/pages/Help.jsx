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
    <div className={`min-h-screen pb-32 ${isDark ? '' : 'bg-slate-50/50'}`}>
      {/* Header */}
      <div className={`px-6 pt-5 pb-5 sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${isDark ? 'bg-[#08142B]/80 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border active:scale-95 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white border-blue-100 text-[#0A1F44] shadow-sm'}`}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className={`text-lg font-bold font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Help & Support</h1>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-8">
        {/* Support Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-6 rounded-[32px] border flex flex-col items-center text-center transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
              <MessageCircle size={24} />
            </div>
            <h3 className={`font-black text-xs uppercase tracking-wider ${isDark ? 'text-white/80' : 'text-[#0A1F44]'}`}>Live Chat</h3>
            <p className="text-[10px] opacity-40 mt-1">Available 24/7</p>
          </div>
          <div className={`p-6 rounded-[32px] border flex flex-col items-center text-center transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
              <Mail size={24} />
            </div>
            <h3 className={`font-black text-xs uppercase tracking-wider ${isDark ? 'text-white/80' : 'text-[#0A1F44]'}`}>Email Us</h3>
            <p className="text-[10px] opacity-40 mt-1">Response in 2h</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className={`p-6 rounded-[32px] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}>
          <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-4 ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Direct Contact</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Phone size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-[10px] font-black uppercase opacity-30 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Call Center</p>
                <p className={`font-black text-sm ${isDark ? 'text-white/80' : 'text-[#0A1F44]'}`}>+91 1800-ARENA-99</p>
              </div>
              <ChevronRight size={16} className="opacity-20" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <ExternalLink size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-[10px] font-black uppercase opacity-30 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Help Center</p>
                <p className={`font-black text-sm ${isDark ? 'text-white/80' : 'text-[#0A1F44]'}`}>support.arenahub.com</p>
              </div>
              <ChevronRight size={16} className="opacity-20" />
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] px-1 ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Popular Questions</h3>
          {faqs.map((faq, idx) => (
            <div key={idx} className={`p-5 rounded-[24px] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-blue-100 shadow-sm'}`}>
              <h4 className={`font-black text-sm tracking-tight ${isDark ? 'text-white/90' : 'text-[#0A1F44]'}`}>{faq.q}</h4>
              <p className={`text-xs mt-2 leading-relaxed opacity-50 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;
