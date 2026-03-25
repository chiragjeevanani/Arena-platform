import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, Calendar, Filter, Download, CheckCircle2, 
  XCircle, Clock, MoreVertical, Eye, Edit3, AlertTriangle, Bell, Trash2, Search
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const ATTENDANCE_DATA = [
  { id: 1, date: '12 Mar 2026', batch: 'Morning Elite', present: 14, absent: 2, status: 'Logged' },
  { id: 2, date: '11 Mar 2026', batch: 'Morning Elite', present: 15, absent: 1, status: 'Logged' },
  { id: 3, date: '11 Mar 2026', batch: 'Junior Stars', present: 8, absent: 0, status: 'Logged' },
  { id: 4, date: '10 Mar 2026', batch: 'Morning Elite', present: 16, absent: 0, status: 'Logged' },
  { id: 5, date: '09 Mar 2026', batch: 'Pro Analytics', present: 18, absent: 4, status: 'Pending' },
];

const AttendanceRecords = () => {
  const { isDark } = useTheme();
  const [records, setRecords] = useState(ATTENDANCE_DATA);
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (action, logId) => {
    const record = records.find(r => r.id === logId);
    setActiveMenu(null);

    switch(action) {
      case 'Delete Record':
        setRecords(prev => prev.filter(r => r.id !== logId));
        showToast(`Record for ${record.date} deleted`, 'error');
        break;
      case 'View Details':
        setSelectedRecord(record);
        setIsEditMode(false);
        break;
      case 'Edit Log':
        setSelectedRecord(record);
        setIsEditMode(true);
        break;
      case 'Notify Parent':
        showToast(`Notification sent to parents of ${record.batch}`);
        break;
      case 'Report Issue':
        showToast(`Issue reported for ${record.batch} session`, 'warning');
        break;
      default:
        break;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Batch Name', 'Present', 'Absent', 'Total', 'Attendance %', 'Status'];
    const rows = records.map(log => [
      log.date,
      log.batch,
      log.present,
      log.absent,
      log.present + log.absent,
      ((log.present / (log.present + log.absent)) * 100).toFixed(1) + '%',
      log.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_records_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredHistory = records.filter(log => 
    log.batch.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 min-w-[300px] ${
              toast.type === 'error' ? 'bg-red-600 border-red-500 text-white' : 
              toast.type === 'warning' ? 'bg-amber-500 border-amber-400 text-white' :
              'bg-[#1a2b3c] border-slate-700 text-white'
            }`}
          >
            {toast.type === 'error' ? <Trash2 size={18} /> : toast.type === 'warning' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span className="text-xs font-bold uppercase tracking-wider">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail/Edit Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecord(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[70] p-6 rounded-2xl border shadow-2xl ${
                isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5 text-[#eb483f]' : 'bg-[#eb483f]/10 text-[#eb483f]'}`}>
                    {isEditMode ? <Edit3 size={18} /> : <Eye size={18} />}
                  </div>
                  <h3 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>
                    {isEditMode ? 'Edit Attendance' : 'Record Details'}
                  </h3>
                </div>
                <button onClick={() => setSelectedRecord(null)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-white/20' : 'hover:bg-slate-100 text-slate-400'}`}>
                  <XCircle size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-white/[0.02] border-white/20' : 'bg-slate-50 border-slate-300'}`}>
                    <label className="text-[8px] font-black uppercase text-[#eb483f] block mb-1 tracking-widest">Date</label>
                    <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>{selectedRecord.date}</p>
                  </div>
                  <div className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-white/[0.02] border-white/20' : 'bg-slate-50 border-slate-300'}`}>
                    <label className="text-[8px] font-black uppercase text-[#eb483f] block mb-1 tracking-widest">Batch</label>
                    <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>{selectedRecord.batch}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border transition-all ${isDark ? 'bg-white/[0.02] border-white/20' : 'bg-slate-50 border-slate-300'}`}>
                  <label className="text-[8px] font-black uppercase text-[#eb483f] block mb-3 tracking-widest">Attendance Metric</label>
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <p className="text-[8px] font-black text-green-500 uppercase mb-1 tracking-widest">Present</p>
                      {isEditMode ? (
                        <div className="relative">
                           <input 
                            type="number" 
                            defaultValue={selectedRecord.present}
                            className={`w-full py-2 px-3 rounded-lg font-black text-xl outline-none border transition-all ${
                              isDark ? 'bg-black/40 border-white/20 text-white focus:border-[#eb483f]' : 'bg-white border-slate-300 text-[#1a2b3c] focus:border-[#eb483f]'
                            }`}
                          />
                        </div>
                      ) : (
                        <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>{selectedRecord.present}</p>
                      )}
                    </div>
                    <div className={`w-px h-10 ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
                    <div className="flex-1 text-right">
                      <p className="text-[8px] font-black text-red-500 uppercase mb-1 tracking-widest">Absent</p>
                      <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white/20' : 'text-slate-300'}`}>{selectedRecord.absent}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if(isEditMode) showToast('Changes saved successfully');
                    setSelectedRecord(null);
                  }}
                  className={`w-full mt-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] ${
                    isEditMode 
                      ? 'bg-[#eb483f] text-white shadow-[#eb483f]/20 hover:bg-[#1a2b3c]' 
                      : isDark ? 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isEditMode ? 'Update Record' : 'Close Details'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Header Section */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>
            <ClipboardCheck className="text-[#eb483f]" size={22} /> Attendance Records
          </h2>
          <p className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Monitor and verify daily presence logs.
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg border transition-all text-[10px] font-black uppercase tracking-wider ${
            isDark
              ? 'bg-white/5 border-white/10 text-white hover:bg-[#eb483f]'
              : 'bg-white border-slate-200 text-slate-600 hover:border-[#eb483f] hover:text-[#eb483f] shadow-sm'
          }`}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Avg Attendance', value: '94.2%', icon: CheckCircle2, color: '#eb483f' },
          { label: 'Classes Logged', value: '42', icon: Clock, color: '#1a2b3c' },
          { label: 'Absence Rate', value: '5.8%', icon: XCircle, color: '#FF4B4B' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>{stat.label}</p>
                <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>{stat.value}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20`, color: stat.color }}>
                <stat.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar Section */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="w-full sm:flex-1 relative group">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/20 group-focus-within:text-[#eb483f]' : 'text-slate-400 group-focus-within:text-[#eb483f]'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by batch or date..."
            className={`w-full py-1.5 pl-9 pr-4 rounded-lg text-[11px] transition-all shadow-sm outline-none border ${
              isDark 
                ? 'bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-[#eb483f] focus:bg-white/10' 
                : 'bg-white border-slate-200 text-[#1a2b3c] placeholder:text-slate-400 focus:border-[#eb483f]'
            }`}
          />
        </div>
        <button 
          onClick={() => handleAction('Open Filters', 'global')}
          className={`w-full sm:w-auto px-4 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all ${
            isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-[#eb483f] hover:text-[#eb483f]'
          }`}
        >
          <Filter size={14} /> Full Filters
        </button>
      </div>

      {/* Table Section */}
      <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className={`text-[9px] font-bold uppercase tracking-wider border-b ${isDark ? 'text-white/40 border-white/5 bg-white/5' : 'text-slate-500 border-slate-100 bg-slate-50'}`}>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Batch Name</th>
                <th className="px-5 py-3 text-center">Present</th>
                <th className="px-5 py-3 text-center">Absent</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-50'}`}>
              {filteredHistory.map((log, idx) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                       <Calendar size={14} className="text-[#eb483f]" />
                       <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#1a2b3c]'}`}>{log.date}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className={`font-medium text-xs ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{log.batch}</p>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`font-bold text-xs ${isDark ? 'text-white/80' : 'text-[#1a2b3c]'}`}>{log.present}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-[#FF4B4B] font-bold text-xs">{log.absent}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                      log.status === 'Logged' ? 'bg-[#eb483f]/10 text-[#eb483f] border-[#eb483f]/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right pr-8">
                    <div className="flex justify-end relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === log.id ? null : log.id)}
                        className={`p-1.5 rounded-lg transition-all border ${
                          activeMenu === log.id
                            ? 'bg-[#eb483f] border-[#eb483f] text-white'
                            : isDark 
                              ? 'bg-white/5 border-white/5 text-white/40 hover:text-white' 
                              : 'bg-white border-slate-200 text-slate-400 hover:border-[#eb483f] hover:text-[#eb483f]'
                        }`}
                      >
                         <MoreVertical size={16} />
                      </button>

                      <AnimatePresence>
                        {activeMenu === log.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: idx > filteredHistory.length - 3 ? -10 : 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: idx > filteredHistory.length - 3 ? -10 : 10 }}
                              className={`absolute right-0 z-20 w-48 p-1.5 rounded-xl border shadow-2xl ${
                                idx > filteredHistory.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                              } ${
                                isDark ? 'bg-[#1a1d24] border-white/10' : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="space-y-1">
                                {[
                                  { label: 'View Details', icon: Eye },
                                  { label: 'Edit Log', icon: Edit3 },
                                  { label: 'Report Issue', icon: AlertTriangle },
                                  { label: 'Notify Parent', icon: Bell },
                                  { label: 'Delete Record', icon: Trash2, color: '#FF4B4B' },
                                ].map((opt, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleAction(opt.label, log.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                      opt.color === '#FF4B4B' ? 'text-[#FF4B4B] hover:bg-[#FF4B4B]/5' : isDark ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-[#eb483f] hover:bg-slate-50'
                                    }`}
                                  >
                                    <opt.icon size={14} />
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
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
