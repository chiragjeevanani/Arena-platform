import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Plus, Star, Filter, Share2, Send, Quote } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const REMARKS_DATA = [
  { id: 1, student: 'Ananya Rao', role: 'Intermediate', text: 'Exceptional footwork during smash drills today. Needs to work on backhand clearing depth.', date: 'Just now', rating: 5 },
  { id: 2, student: 'Arjun Mehta', role: 'Advanced', text: 'Consistent performance. Great leadership in team matches.', date: '2 hours ago', rating: 4 },
  { id: 3, student: 'Sanya Gupta', role: 'Advanced', text: 'Slightly distracted during warmups. Regained focus during agility tests.', date: 'Yesterday', rating: 3 },
  { id: 4, student: 'Kabir Singh', role: 'Beginner', text: 'Completed first week of basics. Excellent grip adjustment progress.', date: '2 days ago', rating: 4 },
];

const StudentRemarks = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className={`text-xl md:text-2xl font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'} font-display tracking-wide flex items-center gap-2 md:gap-3`}>
            <MessageSquare className="text-[#FFD600]" size={20} /> Remarks
          </h2>
          <p className="text-[11px] md:text-sm text-white/40 mt-0.5 md:mt-1 font-medium italic">Log progress notes.</p>
        </div>
        <button className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-[#FFD600] text-[#0A1F44] hover:bg-white transition-all text-[11px] md:text-sm font-black shadow-[0_0_20px_rgba(255,214,0,0.2)]">
          <Plus size={14} className="md:w-[16px] md:h-[16px]" /> New
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Feed */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
             <div className="flex-1 relative group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#FFD600] transition-colors" />
                <input
                  type="text"
                  placeholder="Filter mentee..."
                  className={`w-full py-2.5 pl-10 md:pl-11 pr-4 rounded-xl md:rounded-2xl text-[11px] md:text-sm font-medium transition-all outline-none border ${
                    isDark 
                      ? 'bg-[#0A1F44]/50 border-white/5 focus:border-[#FFD600]/50 text-white' 
                      : 'bg-white border-[#0A1F44]/10 focus:border-[#FFD600] text-[#0A1F44]'
                  }`}
                />
             </div>
             <button className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl border ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-black/5 border-black/10 text-black/40'}`}>
                <Filter size={16} className="md:w-[18px] md:h-[18px]" />
             </button>
          </div>

          <div className="space-y-4">
            {REMARKS_DATA.map((remark, idx) => (
              <motion.div
                key={remark.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border relative group transition-all ${
                  isDark ? 'bg-[#0A1F44]/50 border-white/5 hover:bg-[#0A1F44]' : 'bg-white border-[#0A1F44]/5 hover:border-[#FFD600]'
                }`}
              >
                <div className="flex justify-between items-start mb-3 md:mb-4">
                   <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center text-white/10">
                         <Quote size={16} className="md:w-[20px] md:h-[20px]" />
                      </div>
                      <div>
                        <h4 className={`font-black tracking-tight text-sm md:text-base ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{remark.student}</h4>
                        <div className="flex items-center gap-1.5 md:gap-2 mt-0.5">
                           <span className="text-[8px] md:text-[9px] font-black uppercase text-[#FFD600] tracking-widest">{remark.role}</span>
                           <span className="text-white/20 text-[8px]">•</span>
                           <span className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase tracking-widest">{remark.date}</span>
                        </div>
                      </div>
                   </div>
                   <div className="flex gap-0.5 md:gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} className={`md:w-[12px] md:h-[12px] ${s <= remark.rating ? 'text-[#FFD600] fill-[#FFD600]' : 'text-white/10'}`} />
                      ))}
                   </div>
                </div>

                <p className={`text-[13px] md:text-sm leading-relaxed mb-4 md:mb-6 ${isDark ? 'text-white/60' : 'text-[#0A1F44]/60'}`}>
                  "{remark.text}"
                </p>

                <div className="flex items-center gap-4 border-t border-white/5 pt-3 md:pt-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#FFD600] hover:underline">
                      <Share2 size={10} className="md:w-[12px] md:h-[12px]" /> Share
                   </button>
                   <button className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white">
                      Edit
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Mini Stats */}
        <div className="space-y-6">
           <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border ${isDark ? 'bg-gradient-to-br from-[#FFD600]/10 to-transparent border-[#FFD600]/20 text-white' : 'bg-[#FFD600] text-[#0A1F44]'}`}>
              <h3 className="font-black font-display uppercase tracking-widest text-[10px] md:text-xs mb-3 md:mb-4">Quick Note</h3>
              <textarea 
                placeholder="Type observation..."
                className={`w-full h-24 md:h-32 rounded-xl md:rounded-2xl p-3 md:p-4 text-[11px] md:text-xs font-bold outline-none border transition-all ${
                  isDark ? 'bg-black/30 border-white/10 text-white focus:border-[#FFD600]' : 'bg-white/50 border-black/10 text-[#0A1F44] focus:border-white'
                }`}
              />
              <button className={`w-full mt-2.5 md:mt-3 py-2.5 md:py-3 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 md:gap-2 transition-all ${
                isDark ? 'bg-[#FFD600] text-[#0A1F44] hover:bg-white' : 'bg-white text-[#0A1F44] hover:bg-[#0A1F44] hover:text-white'
              }`}>
                <Send size={12} className="md:w-[14px] md:h-[14px]" /> Post
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRemarks;
