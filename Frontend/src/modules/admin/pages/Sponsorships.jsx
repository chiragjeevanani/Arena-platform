import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Search, Filter, Briefcase, Calendar, DollarSign, TrendingUp, MoreVertical, ExternalLink } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const SPONSORS = [
  { id: 1, name: 'Yonex India', category: 'Title Sponsor', contact: 'Rohan Mehta', status: 'Active', contractEnd: '2026-12-30', value: '₹12.5L', logo: 'Y' },
  { id: 2, name: 'RedBull', category: 'Beverage Partner', contact: 'Sarah J.', status: 'Active', contractEnd: '2027-01-15', value: '₹8.0L', logo: 'RB' },
  { id: 3, name: 'Decathlon', category: 'Gear Sponsor', contact: 'Amit K.', status: 'Renewal Pending', contractEnd: '2026-03-30', value: '₹5.5L', logo: 'D' },
];

const Sponsorships = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-black text-white font-display tracking-wide flex items-center gap-3">
            <Briefcase className="text-[#1EE7FF]" /> Sponsorship & Partners
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium">Manage brand partnerships, advertising slots, and recurring contracts.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-[#1EE7FF] transition-all text-sm font-bold shadow-[0_0_15px_rgba(34,255,136,0.3)]">
          <Plus size={16} /> New Partner
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-[#22FF88]/10 flex items-center justify-center text-[#22FF88]">
                <TrendingUp size={20} />
             </div>
             <p className="text-xs font-black uppercase tracking-widest text-white/30">Total Partner Value</p>
          </div>
          <h3 className={`text-3xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹26.0 Lakh</h3>
          <p className="text-[10px] font-bold text-[#22FF88] mt-2 flex items-center gap-1">
             +12% vs last year <ArrowUpRight size={10} />
          </p>
        </div>
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-[#1EE7FF]/10 flex items-center justify-center text-[#1EE7FF]">
                <Calendar size={20} />
             </div>
             <p className="text-xs font-black uppercase tracking-widest text-white/30">Expiring Soon</p>
          </div>
          <h3 className={`text-3xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>02 <span className="text-base font-bold opacity-30">Contracts</span></h3>
          <p className="text-[10px] font-bold text-[#FF4B4B] mt-2">Requires immediate attention</p>
        </div>
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-[#FFD600]/10 flex items-center justify-center text-[#FFD600]">
                <Target size={20} />
             </div>
             <p className="text-xs font-black uppercase tracking-widest text-white/30">Active Ads</p>
          </div>
          <h3 className={`text-3xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>15 <span className="text-base font-bold opacity-30">Placements</span></h3>
          <p className="text-[10px] font-bold text-white/20 mt-2 uppercase tracking-widest">Across 2 Arenas</p>
        </div>
      </div>

      {/* Partners List */}
      <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <h3 className={`font-black font-display uppercase tracking-widest text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Partners Directory</h3>
           <div className="relative group min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#1EE7FF]" />
              <input type="text" placeholder="Search..." className={`w-full py-1.5 pl-9 pr-4 text-xs rounded-lg border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`} />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
                <tr className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/20' : 'text-[#0A1F44]/20'}`}>
                   <th className="p-6">Partner</th>
                   <th className="p-6 text-center">Category</th>
                   <th className="p-6 text-center">Annual Value</th>
                   <th className="p-6 text-center">Contract End</th>
                   <th className="p-6 text-center">Status</th>
                   <th className="p-6 text-right pr-10">Manage</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {SPONSORS.map(sp => (
                   <tr key={sp.id} className="group transition-colors hover:bg-white/[0.02]">
                      <td className="p-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1EE7FF]/20 to-[#22FF88]/20 border border-white/10 flex items-center justify-center font-black font-display text-[#1EE7FF] text-xl">
                               {sp.logo}
                            </div>
                            <div>
                               <p className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{sp.name}</p>
                               <p className="text-[10px] font-bold text-white/30 truncate">{sp.contact}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-6 text-center">
                         <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-black/5 border-black/10 text-[#0A1F44]/60'}`}>
                            {sp.category}
                         </span>
                      </td>
                      <td className="p-6 text-center">
                         <p className={`font-display font-black text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{sp.value}</p>
                      </td>
                      <td className="p-6 text-center">
                         <div className="inline-flex flex-col items-center">
                           <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{sp.contractEnd}</p>
                           <p className="text-[9px] font-bold text-[#FF4B4B] uppercase mt-1 tracking-widest">
                              {sp.status === 'Active' ? 'In Season' : 'Expiring'}
                           </p>
                         </div>
                      </td>
                      <td className="p-6 text-center">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${
                           sp.status === 'Active' ? 'bg-[#22FF88]/10 text-[#22FF88] border-[#22FF88]/20' : 'bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/20'
                         }`}>
                            {sp.status}
                         </span>
                      </td>
                      <td className="p-6 pr-10 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <button className="p-2 rounded-xl text-white/20 hover:text-[#1EE7FF] hover:bg-[#1EE7FF]/10 transition-all">
                              <ExternalLink size={18} />
                           </button>
                           <button className={`p-2 rounded-xl text-white/20 hover:text-white transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                              <MoreVertical size={18} />
                           </button>
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>
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
