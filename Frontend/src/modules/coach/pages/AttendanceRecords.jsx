import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Calendar, Filter, Download, ArrowUpRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const ATTENDANCE_HISTORY = [
  { id: 1, date: '12 Mar 2026', batch: 'Morning Elite', present: 14, absent: 2, status: 'Logged' },
  { id: 2, date: '11 Mar 2026', batch: 'Morning Elite', present: 15, absent: 1, status: 'Logged' },
  { id: 3, date: '11 Mar 2026', batch: 'Junior Stars', present: 8, absent: 0, status: 'Logged' },
  { id: 4, date: '10 Mar 2026', batch: 'Morning Elite', present: 16, absent: 0, status: 'Logged' },
  { id: 5, date: '09 Mar 2026', batch: 'Pro Analytics', present: 18, absent: 4, status: 'Pending' },
];

const AttendanceRecords = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-black text-white font-display tracking-wide flex items-center gap-3">
            <ClipboardCheck className="text-[#FFD600]" /> Attendance Records
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium">Verify daily presence and export monthly participation reports.</p>
        </div>
        <button className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-bold ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-black/10 text-black hover:bg-black/5'}`}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Avg Attendance', value: '94.2%', icon: CheckCircle2, color: '#22FF88' },
          { label: 'Classes Logged', value: '42', icon: Clock, color: '#FFD600' },
          { label: 'Students Missing', value: '03', icon: XCircle, color: '#FF4B4B' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-5 rounded-3xl border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
                <h3 className={`text-3xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{stat.value}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors duration-300" style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20`, color: stat.color }}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-[0.2em] border-b ${isDark ? 'text-white/20 border-white/5 bg-white/5' : 'text-[#0A1F44]/20 border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
                <th className="p-6">Date</th>
                <th className="p-6">Batch Name</th>
                <th className="p-6 text-center">Present</th>
                <th className="p-6 text-center">Absent</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-right pr-10">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ATTENDANCE_HISTORY.map((log, idx) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-white/[0.02] cursor-pointer"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                       <Calendar size={16} className="text-[#FFD600]" />
                       <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{log.date}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className={`font-bold text-sm ${isDark ? 'text-white/70' : 'text-[#0A1F44]/70'}`}>{log.batch}</p>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-[#22FF88] font-black">{log.present}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-[#FF4B4B] font-black">{log.absent}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      log.status === 'Logged' ? 'bg-[#22FF88]/10 text-[#22FF88] border-[#22FF88]/20' : 'bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/20 animate-pulse'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-6 text-right pr-10">
                    <button className="p-2 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all text-[#FFD600] hover:bg-[#FFD600] hover:text-[#0A1F44]">
                       <ArrowUpRight size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecords;
