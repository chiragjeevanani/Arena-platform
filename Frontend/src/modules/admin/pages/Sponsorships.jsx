import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Plus, Search, Filter, Briefcase, Calendar, 
  TrendingUp, MoreVertical, ExternalLink, X, ArrowRight, Mail, Building,
  Eye, RefreshCw, FileText, Settings, Trash2 
} from 'lucide-react';

const SPONSORS = [
  { id: 1, name: 'Yonex India', category: 'Title Sponsor', contact: 'Rohan Mehta', status: 'Active', contractEnd: '2026-12-30', value: '₹12.5L', logo: 'Y' },
  { id: 2, name: 'RedBull', category: 'Beverage Partner', contact: 'Sarah J.', status: 'Active', contractEnd: '2027-01-15', value: '₹8.0L', logo: 'RB' },
  { id: 3, name: 'Decathlon', category: 'Gear Sponsor', contact: 'Amit K.', status: 'Renewal Pending', contractEnd: '2026-03-30', value: '₹5.5L', logo: 'D' },
];

const Sponsorships = () => {
  const [showNewPartnerModal, setShowNewPartnerModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans text-[#1a2b3c]">
      <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 text-[#1a2b3c]">
              <Briefcase className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" strokeWidth={2.5} /> Partnership Portfolio
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold text-slate-500">Manage high-value sponsorships, brand visibility, and equity hub.</p>
          </div>
          <button
            onClick={() => setShowNewPartnerModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest shadow-sm shadow-[#eb483f]/20"
          >
            <Plus size={16} strokeWidth={3} /> Onboard Partner
          </button>
        </div>

        {/* Stats Board */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-[#eb483f]/40 hover:shadow-md group">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 rounded-xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                  <TrendingUp size={20} strokeWidth={2.5} />
               </div>
               <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Total Asset Value</p>
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight text-[#1a2b3c]">₹26.0L</h3>
              <p className="text-[12px] font-black text-[#eb483f] flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg">
                 +12.4% <ArrowUpRight size={14} />
              </p>
            </div>
          </div>
          <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-[#eb483f]/40 hover:shadow-md group">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 rounded-xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                  <Calendar size={20} strokeWidth={2.5} />
               </div>
               <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Expiring Deals</p>
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight text-[#1a2b3c]">02</h3>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest italic animate-pulse">Critical Renewal</p>
            </div>
          </div>
          <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-[#eb483f]/40 hover:shadow-md group sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 rounded-xl bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f]">
                  <Target size={20} strokeWidth={2.5} />
               </div>
               <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Active Ad Slots</p>
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight text-[#1a2b3c]">15 / 20</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">75% Occupancy</p>
            </div>
          </div>
        </div>

        {/* Partners List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-[#eb483f]/40">
          <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
             <h3 className="font-black font-display uppercase tracking-widest text-xs text-[#1a2b3c]">Partner Directory</h3>
             <div className="relative group w-full md:max-w-xs">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-colors" />
                <input type="text" placeholder="Search brands..." className="w-full py-2.5 pl-11 pr-4 text-[13px] font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#eb483f] transition-all shadow-sm" />
             </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[700px]">
               <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest border-b border-slate-100 text-[#1a2b3c] bg-slate-50/50">
                     <th className="px-6 py-5">Brand Entity</th>
                     <th className="px-6 py-5 text-center">Engagement</th>
                     <th className="px-6 py-5 text-center">Net Worth</th>
                     <th className="px-6 py-5 text-center">Authority Status</th>
                     <th className="px-6 py-5 text-right pr-10">Operations</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {SPONSORS.map((sp, idx) => (
                     <tr key={sp.id} className="group transition-colors hover:bg-slate-50/30">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black font-display text-[#eb483f] text-xl shadow-sm">
                                 {sp.logo}
                              </div>
                              <div>
                                 <p className="font-black text-[15px] tracking-tight text-[#1a2b3c]">{sp.name}</p>
                                 <p className="text-[11px] font-bold text-slate-400 mt-0.5">{sp.contact}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <span className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-[#eb483f]">
                              {sp.category}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <p className="font-display font-black text-sm text-[#1a2b3c]">{sp.value}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             sp.status === 'Active' ? 'bg-[#eb483f]/5 text-[#eb483f] border-[#eb483f]/20' : 'bg-red-50 text-red-500 border-red-100 shadow-sm'
                           }`}>
                              {sp.status}
                           </span>
                        </td>
                         <td className="px-6 py-5 pr-10 text-right">
                            <div className="flex items-center justify-end gap-2 relative">
                              <button className="p-2.5 rounded-xl bg-slate-50 border border-transparent text-slate-400 hover:text-[#eb483f] hover:bg-white hover:border-slate-100 transition-all shadow-sm">
                                 <ExternalLink size={16} strokeWidth={2.5} />
                              </button>
                              <button 
                                onClick={() => setActiveMenu(activeMenu === sp.id ? null : sp.id)}
                                className={`p-2.5 rounded-xl transition-all border shadow-sm ${
                                  activeMenu === sp.id
                                    ? 'bg-[#eb483f] border-[#eb483f] text-white'
                                    : 'bg-white border-slate-100 text-slate-400 hover:text-[#1a2b3c]'
                                }`}
                              >
                                 <MoreVertical size={16} strokeWidth={2.5} />
                              </button>

                              <AnimatePresence>
                                {activeMenu === sp.id && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                      className={`absolute right-0 ${idx >= SPONSORS.length - 1 ? 'bottom-full mb-2' : 'top-full mt-2'} w-48 p-1.5 rounded-2xl border border-slate-200 bg-white shadow-xl z-20 transition-all`}
                                    >
                                      <div className="space-y-1">
                                        {[
                                          { label: 'Intelligence', icon: Eye, color: '#eb483f' },
                                          { label: 'Re-negotiate', icon: RefreshCw, color: '#eb483f' },
                                          { label: 'Documents', icon: FileText, color: '#eb483f' },
                                          { label: 'Campaigns', icon: Settings, color: '#eb483f' },
                                          { label: 'Terminate', icon: Trash2, color: '#ef4444' },
                                        ].map((opt, i) => (
                                          <button
                                            key={i}
                                            onClick={() => setActiveMenu(null)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                          >
                                            <div className="p-1.5 rounded-lg border transition-colors" style={{ backgroundColor: `${opt.color}10`, borderColor: `${opt.color}30`, color: opt.color }}>
                                              <opt.icon size={12} strokeWidth={2.5} />
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
      </div>

      {/* New Partner Modal */}
      <AnimatePresence>
        {showNewPartnerModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewPartnerModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white text-[#1a2b3c] shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <Briefcase className="text-[#eb483f]" size={24} strokeWidth={3} /> Onboarding Protocol
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Initialize new equity partnership</p>
                </div>
                <button onClick={() => setShowNewPartnerModal(false)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-200 text-slate-400 bg-white border border-slate-200 shadow-sm">
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Company / Brand Entity</label>
                    <div className="relative">
                      <Building size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#eb483f] group-focus-within:opacity-100 transition-all" />
                      <input type="text" placeholder="e.g. Li-Ning India" className="w-full py-4 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Classification</label>
                      <select className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]">
                         <option>Title Sponsor</option>
                         <option>Gear Partner</option>
                         <option>Strategic Ally</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Deal Equity (Annual)</label>
                      <input type="text" placeholder="e.g. ₹15.0L" className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]" />
                    </div>
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Point of Contact Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#eb483f] group-focus-within:opacity-100 transition-all" />
                      <input type="email" placeholder="partners@brand.com" className="w-full py-4 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]" />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewPartnerModal(false)}
                  className="w-full py-4 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white text-[13px] font-bold uppercase tracking-widest hover:shadow-[#eb483f]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Finalize Agreement <ArrowRight size={16} strokeWidth={3} />
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
