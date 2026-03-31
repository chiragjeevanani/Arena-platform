import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Briefcase, Calendar, 
  TrendingUp, MoreVertical, ExternalLink, X, ArrowRight, Mail, Building,
  Eye, RefreshCw, FileText, Settings, Trash2, CheckCircle2, AlertCircle,
  Link as LinkIcon, BarChart3, PieChart, Users, DollarSign, Clock, Download,
  LayoutGrid, List, ChevronRight, Hash
} from 'lucide-react';

const EVENTS_DATA = [
  { id: 1, title: 'Summer Smash 2026', type: 'Open Tournament' },
  { id: 2, title: 'Junior Championship', type: 'U-17 Boys/Girls' },
  { id: 3, title: 'Corporate League', type: 'Teams of 4' },
];

const INITIAL_SPONSORS = [
  { 
    id: 1, 
    name: 'Yonex Oman', 
    type: 'Title Sponsor', 
    contact: 'salim@yonex.om', 
    phone: '+968 9876 5432',
    status: 'Active', 
    startDate: '2025-01-01',
    contractEnd: '2026-12-30', 
    equity: 12500, 
    logo: 'Y',
    color: '#eb483f'
  },
  { 
    id: 2, 
    name: 'RedBull Oman', 
    type: 'Partner Sponsor', 
    contact: 'sarah@redbull.om', 
    phone: '+968 9123 4567',
    status: 'Active', 
    startDate: '2025-06-01',
    contractEnd: '2027-01-15', 
    equity: 8000, 
    logo: 'RB',
    color: '#1a2b3c'
  },
  { 
    id: 3, 
    name: 'Decathlon Muscat', 
    type: 'Event Sponsor', 
    contact: 'ahmed@decathlon.om', 
    phone: '+968 8888 7777',
    status: 'Expired', 
    startDate: '2024-03-01',
    contractEnd: '2026-03-25', 
    equity: 5500, 
    logo: 'D',
    color: '#0078D4'
  },
  { 
    id: 4, 
    name: 'Monster Energy', 
    type: 'Banner Sponsor', 
    contact: 'jake@monster.com', 
    phone: '+968 7777 6666',
    status: 'Active', 
    startDate: '2025-08-01',
    contractEnd: '2026-05-15', 
    equity: 3500, 
    logo: 'M',
    color: '#6e9e10'
  },
];

const INITIAL_MAPPINGS = [
  { id: 101, eventId: 1, sponsorId: 1, type: 'Official Gear' },
  { id: 102, eventId: 1, sponsorId: 2, type: 'Refreshment' },
  { id: 103, eventId: 3, sponsorId: 3, type: 'Kit Partner' },
];

const Sponsorships = () => {
  const [activeTab, setActiveTab] = useState('directory'); // directory | mapping | reports
  const [sponsors, setSponsors] = useState(INITIAL_SPONSORS);
  const [mappings, setMappings] = useState(INITIAL_MAPPINGS);
  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [toast, setToast] = useState(null);

  // Stats
  const totalEquity = sponsors.reduce((acc, sp) => acc + sp.equity, 0);
  const activeSponsors = sponsors.filter(sp => sp.status === 'Active').length;
  const expiredSponsors = sponsors.filter(sp => sp.status === 'Expired').length;
  const expiringSoon = sponsors.filter(sp => {
    const diff = new Date(sp.contractEnd) - new Date();
    const days = diff / (1000 * 60 * 60 * 24);
    return sp.status === 'Active' && days > 0 && days < 45;
  }).length;

  const filteredSponsors = useMemo(() => {
    return sponsors.filter(sp => {
      const matchesSearch = sp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           sp.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'All' || sp.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [sponsors, searchQuery, filterType]);

  const handleDelete = (id) => {
    if (window.confirm('Terminate this sponsorship agreement?')) {
      setSponsors(prev => prev.filter(sp => sp.id !== id));
      showToast('Sponsorship terminated successfully');
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getDaysLeft = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-['Inter',_sans-serif] text-[#1E293B] relative antialiased selection:bg-[#eb483f]/10">
      {/* Hyper-Compact Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 md:px-6 py-3 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#eb483f] flex items-center justify-center text-white shadow-sm shadow-[#eb483f]/20">
              <Briefcase size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#0F172A]">Sponsorship Portfolio</h1>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none mt-0.5">Asset & Equity Hub</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
              {[
                { id: 'directory', icon: List, label: 'Directory' },
                { id: 'mapping', icon: LinkIcon, label: 'Mapping' },
                { id: 'reports', icon: BarChart3, label: 'Reports' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-[#eb483f] shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <tab.icon size={13} strokeWidth={2.5} />
                  <span className="hidden xs:inline">{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button 
              onClick={() => { setEditingSponsor(null); setShowModal(true); }}
              className="px-4 py-1.5 rounded-lg bg-[#eb483f] text-white text-[11px] font-bold uppercase tracking-wider hover:shadow-md hover:bg-[#d43d35] transition-all flex items-center gap-2"
            >
              <Plus size={14} strokeWidth={3} /> Onboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-5">
        
        {/* Compact Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: 'Valuation', value: `${totalEquity.toLocaleString()} OMR`, icon: TrendingUp, color: '#eb483f', trend: '+12%' },
            { label: 'Partners', value: activeSponsors, icon: Users, color: '#1a2b3c', trend: 'Active' },
            { label: 'Expiring', value: expiringSoon, icon: Clock, color: '#f59e0b', trend: 'Soon' },
            { label: 'Expired', value: expiredSponsors, icon: AlertCircle, color: '#ef4444', trend: 'Audit' }
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-[#eb483f]/30 transition-all group relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br transition-all group-hover:scale-110 opacity-[0.03]`} style={{ background: stat.color }} />
               <div className="flex justify-between items-start mb-2">
                 <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">{stat.label}</p>
                 <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 group-hover:text-[#eb483f] transition-colors" style={{ color: stat.color + 'aa' }}>
                    <stat.icon size={14} strokeWidth={2.5} />
                 </div>
               </div>
               <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-[#0F172A]">{stat.value}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: stat.color }}>{stat.trend}</span>
               </div>
            </div>
          ))}
        </div>

        {activeTab === 'directory' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* High-Density Filtering Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 bg-white border border-slate-200 p-2.5 rounded-xl">
               <div className="relative w-full md:w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search brand entities..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 rounded-lg bg-slate-50 text-[12px] font-medium outline-none focus:bg-white focus:ring-1 focus:ring-[#eb483f]/20 border border-transparent focus:border-[#eb483f]/30 transition-all"
                  />
               </div>
               <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50">
                    <Filter size={12} className="text-slate-400" />
                    <select 
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-transparent text-[11px] font-bold outline-none cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      <option value="Title Sponsor">Title</option>
                      <option value="Event Sponsor">Event</option>
                      <option value="Partner Sponsor">Partner</option>
                    </select>
                  </div>
                  <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">{filteredSponsors.length} Assets Found</p>
               </div>
            </div>

            {/* Compact Data Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden border-b-2 border-b-slate-100">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-200 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                       <tr>
                          <th className="px-5 py-3">Brand Entity</th>
                          <th className="px-5 py-3 text-center">Class</th>
                          <th className="px-5 py-3 text-center">Valuation</th>
                          <th className="px-5 py-3 text-center">Protocol Duration</th>
                          <th className="px-5 py-3 text-right">Operations</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {filteredSponsors.map((sp) => {
                         const daysLeft = getDaysLeft(sp.contractEnd);
                         const isExpired = sp.status === 'Expired' || daysLeft <= 0;
                         const isExpiringSoon = sp.status === 'Active' && daysLeft > 0 && daysLeft <= 45;

                         return (
                           <tr key={sp.id} className="hover:bg-slate-50/50 transition-colors group">
                             <td className="px-5 py-3">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg border border-slate-100 bg-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform" style={{ color: sp.color }}>
                                    {sp.logo}
                                  </div>
                                  <div>
                                    <h4 className="text-[13px] font-bold text-[#0F172A] leading-tight">{sp.name}</h4>
                                    <p className="text-[10px] font-medium text-slate-400 lowercase">{sp.contact}</p>
                                  </div>
                               </div>
                             </td>
                             <td className="px-5 py-3 text-center">
                               <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                                  {sp.type.split(' ')[0]}
                               </span>
                             </td>
                             <td className="px-5 py-3 text-center">
                                <p className="text-[13px] font-bold text-[#0F172A]">{sp.equity.toLocaleString()} OMR</p>
                             </td>
                             <td className="px-5 py-3 text-center">
                               <div className="flex flex-col items-center">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isExpired ? 'bg-red-50 text-red-600' :
                                    isExpiringSoon ? 'bg-amber-50 text-amber-600' :
                                    'bg-emerald-50 text-emerald-600'
                                  }`}>
                                    {isExpired ? 'Expired' : `${daysLeft}d left`}
                                  </span>
                                  <p className="text-[9px] font-medium text-slate-400 mt-0.5">{new Date(sp.contractEnd).toLocaleDateString()}</p>
                               </div>
                             </td>
                             <td className="px-5 py-3 text-right">
                               <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#eb483f] transition-all">
                                    <Settings size={13} />
                                  </button>
                                  <button onClick={() => handleDelete(sp.id)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                                    <Trash2 size={13} />
                                  </button>
                               </div>
                             </td>
                           </tr>
                         );
                        })}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'mapping' && (
          <div className="animate-in fade-in duration-300">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Compact Linking Hub */}
                <div className="lg:col-span-4 space-y-4">
                   <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-5">
                         <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                            <LinkIcon size={16} strokeWidth={2.5} />
                         </div>
                         <h3 className="text-sm font-bold tracking-tight text-[#0F172A]">Connection Hub</h3>
                      </div>

                      <div className="space-y-4">
                         <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Deployment Target</label>
                            <select className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[12px] font-bold outline-none focus:border-[#eb483f]/40 transition-all">
                               <option value="">Select Event...</option>
                               {EVENTS_DATA.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                            </select>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Assigned Asset</label>
                            <select className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[12px] font-bold outline-none focus:border-[#eb483f]/40 transition-all">
                               <option value="">Select Sponsor...</option>
                               {sponsors.filter(s => s.status === 'Active').map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                            </select>
                         </div>
                         <button className="w-full py-2.5 rounded-lg bg-[#0F172A] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-black transition-all mt-2 flex items-center justify-center gap-2">
                            Integrate Asset <CheckCircle2 size={13} />
                         </button>
                      </div>
                   </div>
                   
                   <div className="p-5 rounded-xl bg-slate-900 text-white relative overflow-hidden group border border-slate-800">
                      <div className="relative z-10">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#eb483f] mb-1">Strategic Logic</p>
                        <h4 className="text-sm font-bold mb-1">Asset Propagation</h4>
                        <p className="text-[11px] font-medium text-slate-400 leading-snug">
                          Mapping optimizes regional brand resonance across nodes.
                        </p>
                      </div>
                   </div>
                </div>

                {/* Compact Mapping Table */}
                <div className="lg:col-span-8">
                   <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-full min-h-[400px]">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                         <h3 className="text-sm font-bold tracking-tight text-[#0F172A]">Active Mapping Matrix</h3>
                         <span className="px-2 py-0.5 rounded-md bg-[#eb483f]/10 text-[#eb483f] text-[9px] font-bold uppercase tracking-widest border border-[#eb483f]/20">
                            {mappings.length} Nodes
                         </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-slate-50/30 border-b border-slate-100 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                              <tr>
                                 <th className="px-6 py-3">Node Context</th>
                                 <th className="px-6 py-3 text-center">Entity</th>
                                 <th className="px-6 py-3 text-right">Ops</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {mappings.map(map => {
                                const event = EVENTS_DATA.find(e => e.id === map.eventId);
                                const sponsor = sponsors.find(s => s.id === map.sponsorId);
                                return (
                                  <tr key={map.id} className="hover:bg-slate-50/50 transition-colors">
                                     <td className="px-6 py-3">
                                        <p className="text-[12px] font-bold text-[#0F172A]">{event?.title}</p>
                                        <p className="text-[9px] font-medium text-slate-400">{event?.type}</p>
                                     </td>
                                     <td className="px-6 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                           <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center font-bold text-[10px]" style={{ color: sponsor?.color }}>{sponsor?.logo}</div>
                                           <p className="text-[11px] font-bold text-[#0F172A]">{sponsor?.name}</p>
                                        </div>
                                     </td>
                                     <td className="px-6 py-3 text-right">
                                        <button className="text-slate-300 hover:text-red-400 transition-colors">
                                           <Trash2 size={13} />
                                        </button>
                                     </td>
                                  </tr>
                                );
                              })}
                           </tbody>
                        </table>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="animate-in fade-in duration-300 space-y-5">
             <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-4 bg-[#0F172A] p-6 rounded-2xl text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                   <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-bl-full -mr-12 -mt-12 opacity-20" />
                   <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Portfolio Valuation</p>
                      <h3 className="text-3xl font-bold tracking-tighter">29,500 OMR</h3>
                   </div>
                   <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold bg-emerald-400/5 w-fit px-2 py-1 rounded-md border border-emerald-400/10 uppercase tracking-tighter">
                      <TrendingUp size={12} /> +4,500 OMR GROWTH M/M
                   </div>
                </div>

                <div className="md:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold tracking-tight text-[#0F172A]">Equity Optimization Metrics</h3>
                      <button className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-[#eb483f] transition-all"><Download size={14} /></button>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                      {[
                        { label: 'Infrastructure', value: 45, color: '#eb483f' },
                        { label: 'Strategic Networking', value: 30, color: '#1a2b3c' },
                        { label: 'Event Core', value: 20, color: '#0078D4' },
                        { label: 'Digital Display', value: 5, color: '#6e9e10' }
                      ].map((bar, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-slate-500">
                             <span>{bar.label}</span>
                             <span>{bar.value}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${bar.value}%` }}
                               transition={{ duration: 0.8, ease: "easeOut" }}
                               className="h-full rounded-full"
                               style={{ backgroundColor: bar.color }}
                             />
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                   <h3 className="text-sm font-bold tracking-tight text-[#0F172A]">Distribution Ledger</h3>
                   <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-tight text-slate-600 hover:bg-slate-50 transition-all shadow-xs">
                      <Filter size={12} /> Filter Ledger
                   </button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50/30 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                         <tr>
                            <th className="px-6 py-3">Asset ID</th>
                            <th className="px-6 py-3">Brand Entity</th>
                            <th className="px-6 py-3 text-right">Equity Allocated</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {sponsors.map(sp => (
                           <tr key={sp.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-6 py-3 text-[10px] font-mono font-bold text-slate-300">#SP-{sp.id}</td>
                             <td className="px-6 py-3">
                               <span className="text-[12px] font-bold text-[#0F172A]">{sp.name}</span>
                             </td>
                             <td className="px-6 py-3 text-right">
                                <span className="text-[12px] font-bold text-[#0F172A]">{sp.equity.toLocaleString()} OMR</span>
                             </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Compact Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
             <motion.div
               initial={{ scale: 0.98, opacity: 0, y: 10 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.98, opacity: 0, y: 10 }}
               className="relative w-full max-w-md rounded-2xl bg-white text-[#0F172A] shadow-2xl overflow-hidden border border-slate-200"
             >
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                    <div>
                      <h3 className="text-base font-bold tracking-tight">{editingSponsor ? 'Modify Protocol' : 'Onboard Partner'}</h3>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#eb483f] mt-0.5">Deployment Framework</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-all shadow-sm">
                      <X size={16} strokeWidth={3} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Brand Node Name</label>
                      <input type="text" placeholder="e.g. Under Armour" defaultValue={editingSponsor?.name || ''} className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:ring-1 focus:ring-[#eb483f]/20 focus:border-[#eb483f]/40 transition-all" />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Category</label>
                        <select className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[12px] font-bold outline-none cursor-pointer">
                            <option>Title Sponsor</option>
                            <option>Event Sponsor</option>
                            <option>Partner Sponsor</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Net Valuation</label>
                        <input type="text" placeholder="1,200 OMR" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none" />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Start Protocol</label>
                        <input type="date" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[12px] font-bold outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">End Protocol</label>
                        <input type="date" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[12px] font-bold outline-none" />
                      </div>
                   </div>

                   <div className="pt-4 flex gap-2">
                      <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px] font-bold uppercase hover:bg-slate-50 transition-all font-mono">Abort</button>
                      <button onClick={() => setShowModal(false)} className="flex-[1.5] py-2.5 rounded-lg bg-[#eb483f] text-white text-[11px] font-bold uppercase tracking-widest shadow-md shadow-[#eb483f]/20 hover:bg-[#d43d35] transition-all flex items-center justify-center gap-2">Deploy <CheckCircle2 size={14} /></button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Minimal Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 10, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-[110] px-4 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-bold shadow-xl flex items-center gap-3 border border-slate-700/50"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px]">✓</div>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sponsorships;
