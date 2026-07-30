import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * Shared public legal/policy page shell for Bank Muscat go-live checklist URLs.
 */
const LegalDocument = ({ title, subtitle, Icon = FileText, sections = [], relatedLinks = [] }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-[#0f1115]' : 'bg-slate-50'
    }`}>
      <div className={`px-4 md:px-6 pt-4 pb-4 md:pt-6 md:pb-6 backdrop-blur-2xl border-b border-white/10 bg-[#CE2029] rounded-b-3xl md:rounded-b-[2rem] shadow-[0_10px_30px_rgba(206,32,41,0.15)] relative z-50`}>
        <div className="max-w-4xl mx-auto flex items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-sm active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg md:text-xl font-bold font-display text-white tracking-tight uppercase">{title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-6 md:mt-10 relative z-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full p-6 md:p-10 rounded-3xl md:rounded-[40px] flex flex-col md:flex-row items-center gap-6 border shadow-2xl ${
            isDark ? 'bg-[#151b29] border-white/5' : 'bg-white border-slate-100'
          }`}
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[28px] shrink-0 flex items-center justify-center shadow-lg bg-[#CE2029]/10 text-[#CE2029]">
            <Icon size={32} />
          </div>
          <div>
            <h2 className={`text-xl md:text-2xl font-black font-display uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              AMM Sports Arena
            </h2>
            <p className={`text-xs md:text-sm mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {subtitle}
            </p>
            <p className={`text-[10px] mt-3 font-bold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
              Last updated: 30 Jul 2026 · https://www.ammarena.com
            </p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`p-5 md:p-6 rounded-[24px] md:rounded-[32px] border ${
                isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <h3 className={`font-bold text-sm md:text-base tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {section.title}
              </h3>
              {Array.isArray(section.content) ? (
                <ul className={`space-y-2 text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {section.content.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="text-[#CE2029] font-black">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-xs md:text-sm leading-relaxed whitespace-pre-line ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {section.content}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {relatedLinks.length > 0 && (
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              Related policies
            </p>
            <div className="flex flex-wrap gap-2">
              {relatedLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#CE2029]/10 text-[#CE2029] hover:bg-[#CE2029] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalDocument;
