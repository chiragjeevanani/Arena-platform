import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Plus, Search, Filter, Briefcase, Calendar, DollarSign, 
  TrendingUp, MoreVertical, ExternalLink, X, ArrowRight, Mail, Building,
  Eye, RefreshCw, FileText, Settings, Trash2
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const SPONSORS = [
  { id: 1, name: 'Yonex India', category: 'Title Sponsor', contact: 'Rohan Mehta', status: 'Active', contractEnd: '2026-12-30', value: '₹12.5L', logo: 'Y' },
  { id: 2, name: 'RedBull', category: 'Beverage Partner', contact: 'Sarah J.', status: 'Active', contractEnd: '2027-01-15', value: '₹8.0L', logo: 'RB' },
  { id: 3, name: 'Decathlon', category: 'Gear Sponsor', contact: 'Amit K.', status: 'Renewal Pending', contractEnd: '2026-03-30', value: '₹5.5L', logo: 'D' },
];

const Sponsorships = () => {
  const { isDark } = useTheme();
  const [showNewPartnerModal, setShowNewPartnerModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className={`text-xl md:text-2xl font-black font-display tracking-wide flex items-center gap-2 md:gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Briefcase className="text-[#1EE7FF] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Portfolio
          </h2>
          <p className={`text-[11px] md:text-sm mt-0.5 md:mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Brand equity.</p>
        </div>
        <button
          onClick={() => setShowNewPartnerModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg md:shadow-xl shadow-[#22FF88]/20"
        >
          <Plus size={14} /> Sponsor
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
        <div className={`p-3 md:p-6 rounded-xl md:rounded-3xl border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
             <div className="w-5 h-5 md:w-10 md:h-10 rounded-md md:rounded-xl bg-[#22FF88]/10 flex items-center justify-center text-[#22FF88]">
                <TrendingUp size={12} className="md:w-[20px] md:h-[20px]" />
             </div>
             <p className={`text-[6px] md:text-xs font-black uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-[#0A1F44]/40'}`}>Equity</p>
          </div>
          <h3 className={`text-sm md:text-3xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹26.0L</h3>
          <p className="text-[6px] md:text-[10px] font-bold text-[#22FF88] mt-1 md:mt-2 flex items-center gap-1">
             +12% <ArrowUpRight size={6} className="md:w-[10px] md:h-[10px]" />
          </p>
        </div>
        <div className={`p-3 md:p-6 rounded-xl md:rounded-3xl border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
             <div className="w-5 h-5 md:w-10 md:h-10 rounded-md md:rounded-xl bg-[#1EE7FF]/10 flex items-center justify-center text-[#1EE7FF]">
                <Calendar size={12} className="md:w-[20px] md:h-[20px]" />
             </div>
             <p className={`text-[6px] md:text-xs font-black uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-[#0A1F44]/40'}`}>Due</p>
          </div>
          <h3 className={`text-sm md:text-3xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>02</h3>
          <p className="text-[6px] md:text-[10px] font-bold text-[#FF4B4B] mt-1 md:mt-2 uppercase tracking-widest">Renewal</p>
        </div>
        <div className={`p-3 md:p-6 rounded-xl md:rounded-3xl border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm col-span-2 lg:col-span-1'}`}>
          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-4">
             <div className="w-5 h-5 md:w-10 md:h-10 rounded-md md:rounded-xl bg-[#FFD600]/10 flex items-center justify-center text-[#FFD600]">
                <Target size={12} className="md:w-[20px] md:h-[20px]" />
             </div>
             <p className={`text-[6px] md:text-xs font-black uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-[#0A1F44]/40'}`}>Ads</p>
          </div>
          <h3 className={`text-sm md:text-3xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>15</h3>
          <p className="text-[6px] md:text-[10px] font-bold text-white/20 mt-1 md:mt-2 uppercase tracking-widest">Sponsorships</p>
        </div>
      </div>

      {/* Partners List */}
      <div className={`rounded-2xl md:rounded-3xl border overflow-hidden ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg'}`}>
        <div className="p-3 md:p-6 border-b border-white/5 flex items-center justify-between gap-2 md:gap-4">
           <h3 className={`font-black font-display uppercase tracking-widest text-[10px] md:text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Directory</h3>
           <div className="relative group flex-1 md:min-w-[200px]">
              <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#1EE7FF]" />
              <input type="text" placeholder="Search..." className={`w-full py-1.5 md:py-2 pl-8 md:pl-9 pr-4 text-[9px] md:text-[11px] rounded-lg border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`} />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
             <thead>
                <tr className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] border-b ${isDark ? 'text-white/20 border-white/5 bg-white/5' : 'text-[#0A1F44]/20 border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
                   <th className="p-3 md:p-6">Partner</th>
                   <th className="p-3 md:p-6 text-center">Cat</th>
                   <th className="p-3 md:p-6 text-center">Valuation</th>
                   <th className="p-3 md:p-6 text-center">Status</th>
                   <th className="p-3 md:p-6 text-right pr-6 md:pr-10">Admin</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {SPONSORS.map(sp => (
                   <tr key={sp.id} className="group transition-colors hover:bg-white/[0.02]">
                      <td className="p-3 md:p-6">
                         <div className="flex items-center gap-2 md:gap-4">
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-gradient-to-br from-[#1EE7FF]/20 to-[#22FF88]/20 border border-white/10 flex items-center justify-center font-black font-display text-[#1EE7FF] text-xs md:text-xl">
                               {sp.logo}
                            </div>
                            <div>
                               <p className={`font-black tracking-tight text-[10px] md:text-base ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{sp.name}</p>
                               <p className="text-[7px] md:text-[10px] font-bold text-white/20 truncate">{sp.contact.split(' ')[0]}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-3 md:p-6 text-center">
                         <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[7px] md:text-[9px] font-black uppercase tracking-widest border ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-black/5 border-black/10 text-[#0A1F44]/40 shadow-sm'}`}>
                            {sp.category.split(' ')[0]}
                         </span>
                      </td>
                      <td className="p-3 md:p-6 text-center">
                         <p className={`font-display font-black text-[10px] md:text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{sp.value}</p>
                         <p className="text-[7px] font-bold text-[#FF4B4B] uppercase mt-0.5 tracking-tight md:hidden">
                            {sp.status === 'Active' ? 'Live' : 'Due'}
                         </p>
                      </td>
                      <td className="p-3 md:p-6 text-center">
                         <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-[0.1em] border ${
                           sp.status === 'Active' ? 'bg-[#22FF88]/10 text-[#22FF88] border-[#22FF88]/20' : 'bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/20'
                         }`}>
                            {sp.status.split(' ')[0]}
                         </span>
                      </td>
                       <td className="p-3 md:p-6 pr-6 md:pr-10 text-right">
                          <div className="flex items-center justify-end gap-1 md:gap-2 relative">
                            <button className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all ${isDark ? 'bg-white/5 text-white/40 hover:text-[#1EE7FF]' : 'bg-black/5 text-[#0A1F44]/40 hover:text-[#0ea5e9] shadow-sm'}`}>
                               <ExternalLink size={12} className="md:w-[18px] md:h-[18px]" />
                            </button>
                            <button 
                              onClick={() => setActiveMenu(activeMenu === sp.id ? null : sp.id)}
                              className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all border ${
                                activeMenu === sp.id
                                  ? 'bg-[#1EE7FF] border-[#1EE7FF] text-[#0A1F44]'
                                  : isDark 
                                    ? 'bg-white/5 border-white/5 text-white/20 hover:text-white' 
                                    : 'bg-black/5 border-black/10 text-black/20 hover:text-black shadow-sm'
                              }`}
                            >
                               <MoreVertical size={12} className="md:w-[18px] md:h-[18px]" />
                            </button>

                            <AnimatePresence>
                              {activeMenu === sp.id && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setActiveMenu(null)} 
                                  />
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className={`absolute right-0 top-full mt-2 w-56 p-2 rounded-2xl border z-20 shadow-2xl backdrop-blur-xl ${
                                      isDark ? 'bg-[#0A1F44]/90 border-white/10 shadow-black' : 'bg-white/90 border-[#0A1F44]/10 shadow-blue-900/10'
                                    }`}
                                  >
                                    <div className="space-y-1 text-left">
                                      {[
                                        { label: 'View Contract', icon: Eye, color: '#1EE7FF' },
                                        { label: 'Renew Partnership', icon: RefreshCw, color: '#22FF88' },
                                        { label: 'Lead History', icon: FileText, color: '#FFD600' },
                                        { label: 'Edit Valuation', icon: Settings, color: '#A855F7' },
                                        { label: 'Terminate Agreement', icon: Trash2, color: '#FF4B4B' },
                                      ].map((opt, i) => (
                                        <button
                                          key={i}
                                          onClick={() => setActiveMenu(null)}
                                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            isDark ? 'hover:bg-white/5 text-white/60 hover:text-white' : 'hover:bg-[#0A1F44]/5 text-[#0A1F44]/60 hover:text-[#0A1F44]'
                                          }`}
                                        >
                                          <div className={`p-1.5 rounded-lg border transition-colors`} style={{ backgroundColor: `${opt.color}10`, borderColor: `${opt.color}20`, color: opt.color }}>
                                            <opt.icon size={12} />
                                          </div>
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
                   </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>

      {/* New Partner Modal */}
      <AnimatePresence>
        {showNewPartnerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewPartnerModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-lg rounded-3xl md:rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10 text-white' : 'bg-white border-black/10 text-[#0A1F44]'} shadow-2xl shadow-black/50`}
            >
              <div className="p-6 md:p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3">
                    <Briefcase className="text-[#1EE7FF] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> Onboard
                  </h3>
                  <p className="text-[10px] md:text-xs font-bold opacity-30 uppercase tracking-widest mt-0.5 md:mt-1">New partnership deal</p>
                </div>
                <button onClick={() => setShowNewPartnerModal(false)} className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}>
                  <X size={18} className="md:w-[20px] md:h-[20px]" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-4 md:space-y-5">
                <div className="group">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Brand Name</label>
                  <div className="relative">
                    <Building size={12} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-[#1EE7FF] group-focus-within:opacity-100 transition-all md:w-[14px] md:h-[14px]" />
                    <input type="text" placeholder="e.g. Li-Ning" className={`w-full py-3 md:py-4 pl-10 md:pl-12 pr-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#1EE7FF]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#1EE7FF] text-[#0A1F44]'}`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Type</label>
                    <select className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#1EE7FF]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#1EE7FF] text-[#0A1F44]'}`}>
                      <option>Title</option>
                      <option>Gear</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Value (₹)</label>
                    <input type="text" placeholder="5L" className={`w-full py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#1EE7FF]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#1EE7FF] text-[#0A1F44]'}`} />
                  </div>
                </div>
                <div className="group">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5 md:mb-2 block">Contact Email</label>
                  <div className="relative">
                    <Mail size={12} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-[#1EE7FF] group-focus-within:opacity-100 transition-all md:w-[14px] md:h-[14px]" />
                    <input type="email" placeholder="partner@brand.com" className={`w-full py-3 md:py-4 pl-10 md:pl-12 pr-4 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#1EE7FF]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#1EE7FF] text-[#0A1F44]'}`} />
                  </div>
                </div>
                <button
                  onClick={() => setShowNewPartnerModal(false)}
                  className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-[#1EE7FF] text-[#0A1F44] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white hover:scale-[1.01] transition-all shadow-xl md:shadow-2xl shadow-[#1EE7FF]/20 flex items-center justify-center gap-2"
                >
                  Confirm <ArrowRight size={14} className="md:w-[16px] md:h-[16px]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ArrowUpRight = ({ size, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

export default Sponsorships;
