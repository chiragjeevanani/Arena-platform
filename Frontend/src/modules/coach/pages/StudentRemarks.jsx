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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-black text-white font-display tracking-wide flex items-center gap-3">
            <MessageSquare className="text-[#FFD600]" /> Performance Remarks
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium">Log feedback, technical pointers, and behavioral notes for students.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFD600] text-[#0A1F44] hover:bg-white transition-all text-sm font-black shadow-[0_0_20px_rgba(255,214,0,0.2)]">
          <Plus size={16} /> New Remark
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Feed */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-3 mb-6">
             <div className="flex-1 relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#FFD600] transition-colors" />
                <input
                  type="text"
                  placeholder="Filter remarks by student name..."
                  className={`w-full py-3 pl-11 pr-4 rounded-2xl text-sm font-medium transition-all outline-none border ${
                    isDark 
                      ? 'bg-[#0A1F44]/50 border-white/5 focus:border-[#FFD600]/50 text-white' 
                      : 'bg-white border-[#0A1F44]/10 focus:border-[#FFD600] text-[#0A1F44]'
                  }`}
                />
             </div>
             <button className={`p-3 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-black/5 border-black/10 text-black/40'}`}>
                <Filter size={18} />
             </button>
          </div>

          <div className="space-y-4">
            {REMARKS_DATA.map((remark, idx) => (
              <motion.div
                key={remark.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 rounded-3xl border relative group transition-all ${
                  isDark ? 'bg-[#0A1F44]/50 border-white/5 hover:bg-[#0A1F44]' : 'bg-white border-[#0A1F44]/5 hover:border-[#FFD600]'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/10">
                         <Quote size={20} />
                      </div>
                      <div>
                        <h4 className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{remark.student}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[9px] font-black uppercase text-[#FFD600] tracking-widest">{remark.role}</span>
                           <span className="text-white/20 text-[9px]">•</span>
                           <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{remark.date}</span>
                        </div>
                      </div>
                   </div>
                   <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className={s <= remark.rating ? 'text-[#FFD600] fill-[#FFD600]' : 'text-white/10'} />
                      ))}
                   </div>
                </div>

                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-white/60' : 'text-[#0A1F44]/60'}`}>
                  "{remark.text}"
                </p>

                <div className="flex items-center gap-4 border-t border-white/5 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FFD600] hover:underline">
                      <Share2 size={12} /> Share with Parents
                   </button>
                   <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white">
                      Edit Note
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Mini Stats */}
        <div className="space-y-6">
           <div className={`p-6 rounded-3xl border ${isDark ? 'bg-gradient-to-br from-[#FFD600]/10 to-transparent border-[#FFD600]/20 text-white' : 'bg-[#FFD600] text-[#0A1F44]'}`}>
              <h3 className="font-black font-display uppercase tracking-widest text-xs mb-4">Quick Note</h3>
              <textarea 
                placeholder="Type a quick observation..."
                className={`w-full h-32 rounded-2xl p-4 text-xs font-bold outline-none border transition-all ${
                  isDark ? 'bg-black/30 border-white/10 text-white focus:border-[#FFD600]' : 'bg-white/50 border-black/10 text-[#0A1F44] focus:border-white'
                }`}
              />
              <button className={`w-full mt-3 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${
                isDark ? 'bg-[#FFD600] text-[#0A1F44] hover:bg-white' : 'bg-white text-[#0A1F44] hover:bg-[#0A1F44] hover:text-white'
              }`}>
                <Send size={14} /> Post Remark
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRemarks;
