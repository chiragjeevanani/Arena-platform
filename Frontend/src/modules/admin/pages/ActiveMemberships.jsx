import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, MoreVertical, 
  Calendar, CreditCard, User, Phone, 
  Mail, MapPin, Clock, ArrowUpRight,
  ChevronDown, CheckCircle2, AlertCircle,
  XCircle, UserPlus, FileText, X, Trash2, ShieldCheck
} from 'lucide-react';

const ActiveMemberships = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); // Track which member's meatball menu is open
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewType, setViewType] = useState('TABLE'); // TABLE or LIST
  const navigate = useNavigate();

  const handleExportExcel = () => {
    const headers = ['ID', 'Name', 'Type', 'Price', 'Slot', 'Court', 'Email', 'Phone', 'Start Date', 'End Date', 'Status'];
    const rows = filteredMembers.map(m => [
      m.id, `${m.firstName} ${m.surname}`.trim(), m.type, m.price, m.slot, m.courtNo, m.email, m.phone, m.startDate, m.endDate, m.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "active_members_audit.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = 
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [members, searchTerm, statusFilter]);

  const toggleMemberStatus = (id) => {
    setMembers(prev => prev.map(m => 
      m.id === id ? { ...m, status: m.status === 'ACTIVE' ? 'LAPSED' : 'ACTIVE', action: m.status === 'ACTIVE' ? 'NEARING EXPIRY' : 'NO ACTION' } : m
    ));
    setActiveMenu(null);
  };

  const deleteMember = (id) => {
    if (window.confirm('Archive this member? They will be removed from the active audit list.')) {
        setMembers(prev => prev.filter(m => m.id !== id));
        setSelectedMember(null);
        setActiveMenu(null);
    }
  };

  const stats = [
    { label: 'Total Members', value: members.length, icon: UserPlus, color: '#3b82f6' },
    { label: 'Active Plans', value: members.filter(m => m.status === 'ACTIVE').length, icon: CheckCircle2, color: '#10b981' },
    { label: 'Lapsed/Expiring', value: members.filter(m => m.status === 'LAPSED').length, icon: AlertCircle, color: '#f43f5e' },
    { label: 'Monthly Revenue', value: `OMR ${members.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()}`, icon: CreditCard, color: '#eb483f' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans" onClick={() => setActiveMenu(null)}>
      {/* Header */}
      <div className="max-w-[1700px] mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-[2px] bg-[#eb483f]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#eb483f]">Member Auditing</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1e293b] leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Active <span className="text-[#eb483f]">Memberships</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs mt-3 opacity-70 flex items-center gap-2 uppercase tracking-widest">
            <Calendar size={14} className="text-[#eb483f]" /> 
            Live tracking of subscription lifecycles & renewal status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
            <Download size={16} /> Export Excel
          </button>
          <button onClick={() => navigate('/admin/reports')} className="flex items-center gap-2 px-6 py-3 bg-[#1e293b] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] transition-all active:scale-95">
             Analytics Report
          </button>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="max-w-[1700px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: `${stat.color}10`, color: stat.color }}>
              <stat.icon size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
              <h3 className="text-xl font-black text-[#1e293b] tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Hub */}
      <div className="max-w-[1700px] mx-auto mb-6 bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-50 border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#eb483f]/5 focus:bg-white focus:border-[#eb483f]/20 transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-50 rounded-2xl">
            {['ALL', 'ACTIVE', 'LAPSED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === st 
                    ? 'bg-white text-[#eb483f] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden lg:block" />
           <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-2">Showing {filteredMembers.length} Results</p>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="max-w-[1700px] mx-auto bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Member Info</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Membership</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Slot / Court</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Validity Period</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 whitespace-nowrap">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-500 uppercase">
                        {member.firstName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#1e293b] leading-none mb-1.5 flex items-center gap-2">
                          {member.firstName} {member.surname}
                          {member.type === 'GAP' && <ArrowUpRight size={12} className="text-[#eb483f]" />}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                           <span className="flex items-center gap-1"><Mail size={10} /> {member.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-[#1e293b]">{member.type === 'GAP' ? 'Gold Annual Premium' : 'General Annual'}</p>
                      <p className="text-[10px] font-extrabold uppercase text-[#eb483f] tracking-tighter">OMR {member.price.toFixed(3)} Paid</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">{member.slot}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">Court #{member.courtNo}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Ends On</p>
                        <p className="text-xs font-bold text-slate-700">{member.endDate}</p>
                      </div>
                      {/* Simple progress bar mock */}
                      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} 
                          style={{ width: member.status === 'ACTIVE' ? '65%' : '100%' }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center gap-1.5">
                      <button 
                        onClick={() => toggleMemberStatus(member.id)}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                        member.status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {member.status}
                      </button>
                      {member.action !== 'NO ACTION' && (
                        <span className="text-[8px] font-black text-amber-500 uppercase animate-pulse">
                          {member.action}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedMember(member); }}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-[#eb483f] hover:bg-[#eb483f]/5 rounded-xl transition-all"
                        title="View Audit Detail"
                      >
                        <FileText size={18} />
                      </button>
                      
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === member.id ? null : member.id); }}
                          className={`p-2.5 rounded-xl transition-all ${activeMenu === member.id ? 'bg-[#1e293b] text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-[#eb483f] hover:bg-[#eb483f]/5'}`}
                          title="Quick Actions"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        <AnimatePresence>
                          {activeMenu === member.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 10 }}
                              className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[150] overflow-hidden"
                            >
                               <button 
                                onClick={() => toggleMemberStatus(member.id)}
                                className="w-full px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                               >
                                  <Clock size={14} className="text-[#eb483f]" /> Toggle Status
                               </button>
                               <button className="w-full px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                                  <Phone size={14} className="text-blue-500" /> Contact Member
                               </button>
                               <button className="w-full px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors border-t border-slate-50">
                                  <Download size={14} className="text-emerald-500" /> Invoicing
                               </button>
                               <button 
                                onClick={() => deleteMember(member.id)}
                                className="w-full px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-slate-50"
                               >
                                  <Trash2 size={14} /> Archive Member
                               </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMembers.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-700">No members found</h3>
              <p className="text-slate-400 font-medium text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
        
        {/* Pagination Footer */}
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 1 of 1</p>
          <div className="flex gap-2">
            <button disabled className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-300 cursor-not-allowed">Prev</button>
            <button disabled className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-300 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      {/* Member Detail Drawer */}
      <AnimatePresence>
        {selectedMember && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[200]" 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white z-[210] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#1e293b] tracking-tight">Member Audit</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">ID: #{selectedMember.id}002934</p>
                </div>
                <button onClick={() => setSelectedMember(null)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                
                {/* Profile Snapshot */}
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400">
                      {selectedMember.firstName.charAt(0)}
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-[#1e293b] mb-1">{selectedMember.firstName} {selectedMember.surname}</h3>
                      <p className="text-sm font-bold text-[#eb483f]">{selectedMember.type === 'GAP' ? 'Gold Annual Premium' : 'General Annual Member'}</p>
                      <div className="flex items-center gap-4 mt-2">
                         <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Phone size={12} /> {selectedMember.phone}
                         </div>
                         <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Mail size={12} /> {selectedMember.email}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Membership Pulse */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                   <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subscription Lifecycle</span>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        selectedMember.status === 'ACTIVE' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-red-500 text-white shadow-lg shadow-red-200'
                      }`}>
                         {selectedMember.status}
                      </span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-8">
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Join Date</p>
                         <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="text-sm font-black text-slate-700">{selectedMember.startDate}</span>
                         </div>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Expiry Date</p>
                         <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="text-sm font-black text-slate-700">{selectedMember.endDate}</span>
                         </div>
                      </div>
                   </div>

                   <div className="mt-8 pt-6 border-t border-slate-200/50">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-black text-slate-600">Verification Progress</span>
                         <span className="text-xs font-black text-[#eb483f]">65%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                         <div className="h-full bg-[#eb483f] rounded-full w-[65%]" />
                      </div>
                   </div>
                </div>

                {/* Utility Allocation */}
                <div className="space-y-4">
                   <h4 className="text-xs font-black uppercase tracking-widest text-[#1e293b] border-l-4 border-[#eb483f] pl-3">Space Allocation</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                         <MapPin size={16} className="text-slate-400 mb-2" />
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reserved Court</p>
                         <p className="text-md font-black text-slate-700">Arena Gate #{selectedMember.courtNo}</p>
                      </div>
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                         <Clock size={16} className="text-slate-400 mb-2" />
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Authorized Slot</p>
                         <p className="text-md font-black text-slate-700">{selectedMember.slot}</p>
                      </div>
                   </div>
                </div>

                {/* Audit Logs */}
                <div className="space-y-4">
                   <h4 className="text-xs font-black uppercase tracking-widest text-[#1e293b] border-l-4 border-[#eb483f] pl-3">Audit Trails</h4>
                   <div className="space-y-3">
                      {[
                        { event: 'Membership Renewed', time: '12-Mar-2026', icon: ShieldCheck, color: '#10b981' },
                        { event: 'Payment Success', time: '11-Mar-2026', icon: CreditCard, color: '#3b82f6' },
                        { event: 'Member Registered', time: '01-Jan-2025', icon: UserPlus, color: '#6366f1' },
                      ].map((log, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                           <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${log.color}15`, color: log.color }}>
                              <log.icon size={14} />
                           </div>
                           <div className="flex-1">
                              <p className="text-[11px] font-black text-slate-700">{log.event}</p>
                              <p className="text-[9px] font-bold text-slate-400">{log.time}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
                 <button 
                  onClick={() => deleteMember(selectedMember.id)}
                  className="flex-1 py-4 bg-white border border-red-100 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                 >
                    <Trash2 size={14} /> Archive Member
                 </button>
                 <button className="flex-[2] py-4 bg-[#1e293b] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                    <Download size={14} /> Download Dossier
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActiveMemberships;
