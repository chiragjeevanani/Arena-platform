import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, MoreHorizontal, MessageSquare, Star, GraduationCap } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const STUDENTS_DATA = [
  { id: 'STU-001', name: 'Arjun Mehta', batch: 'Morning Elite', level: 'Advanced', attendance: '95%', rating: 4.8, status: 'Active' },
  { id: 'STU-002', name: 'Sanya Gupta', batch: 'Morning Elite', level: 'Advanced', attendance: '88%', rating: 4.5, status: 'Active' },
  { id: 'STU-003', name: 'Kabir Singh', batch: 'Junior Stars', level: 'Beginner', attendance: '92%', rating: 4.2, status: 'Active' },
  { id: 'STU-004', name: 'Rohan Verma', batch: 'Junior Stars', level: 'Beginner', attendance: '75%', rating: 3.9, status: 'Medical' },
  { id: 'STU-005', name: 'Ananya Rao', batch: 'Pro Analytics', level: 'Intermediate', attendance: '100%', rating: 4.9, status: 'Active' },
];

const MyStudents = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-black text-white font-display tracking-wide flex items-center gap-3">
            <Users className="text-[#FFD600]" /> My Students
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium">Manage your mentees and track their progress across batches.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[250px] relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#FFD600] transition-colors" />
          <input
            type="text"
            placeholder="Search students by name or ID..."
            className={`w-full py-2.5 pl-11 pr-4 rounded-xl text-sm font-medium transition-all outline-none border ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/5 focus:border-[#FFD600]/50 text-white' 
                : 'bg-white border-[#0A1F44]/10 focus:border-[#FFD600] text-[#0A1F44]'
            }`}
          />
        </div>
        <button className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all ${
          isDark ? 'bg-[#0A1F44]/50 border-white/5 text-white/60 hover:text-white' : 'bg-white border-[#0A1F44]/10 text-[#0A1F44]/60 hover:text-[#0A1F44]'
        }`}>
          <Filter size={18} /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STUDENTS_DATA.map((student, idx) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-6 rounded-[2rem] border group transition-all duration-300 hover:shadow-2xl ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/10 hover:border-[#FFD600]/30 hover:shadow-[#FFD600]/5' 
                : 'bg-white border-[#0A1F44]/5 shadow-lg shadow-blue-500/5 hover:border-[#FFD600]'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFD600]/20 to-[#FF4B4B]/20 border border-[#FFD600]/30 flex items-center justify-center text-[#FFD600] font-black text-lg">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`font-black font-display tracking-tight text-lg ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{student.name}</h3>
                    <p className="text-[10px] font-bold text-[#FFD600] uppercase tracking-widest">{student.id}</p>
                  </div>
               </div>
               <button className="text-white/20 hover:text-white">
                  <MoreHorizontal size={20} />
               </button>
            </div>

            <div className="space-y-3 mb-6">
               <div className="flex justify-between text-xs font-bold">
                  <span className="text-white/30 uppercase tracking-widest">Active Batch</span>
                  <span className={isDark ? 'text-white/70' : 'text-[#0A1F44]/70'}>{student.batch}</span>
               </div>
               <div className="flex justify-between text-xs font-bold">
                  <span className="text-white/30 uppercase tracking-widest">Skill Level</span>
                  <span className="text-[#1EE7FF]">{student.level}</span>
               </div>
               <div className="flex justify-between text-xs font-bold">
                  <span className="text-white/30 uppercase tracking-widest">Attendance</span>
                  <span className="text-[#22FF88]">{student.attendance}</span>
               </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center justify-between mb-4 ${isDark ? 'bg-black/20 border-white/5' : 'bg-[#0A1F44]/5 border-[#0A1F44]/5'}`}>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Current Rating</span>
                  <div className="flex items-center gap-1 mt-1">
                     <Star size={14} className="text-[#FFD600] fill-[#FFD600]" />
                     <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{student.rating}</span>
                  </div>
               </div>
               <div className="text-right">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Status</span>
                  <p className={`text-[10px] font-black uppercase mt-1 ${student.status === 'Active' ? 'text-[#22FF88]' : 'text-[#FF4B4B]'}`}>{student.status}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <button className={`py-2.5 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                 isDark ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white' : 'bg-[#0A1F44]/5 border-[#0A1F44]/10 text-[#0A1F44]/70 hover:bg-[#0A1F44]/10 hover:text-[#0A1F44]'
               }`}>
                  <MessageSquare size={14} /> Remarks
               </button>
               <button className="py-2.5 rounded-xl bg-[#FFD600] text-[#0A1F44] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-[#FFD600]/20">
                  <GraduationCap size={14} /> Profile
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyStudents;
