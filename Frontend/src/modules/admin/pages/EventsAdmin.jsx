import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Plus, Search, Filter, Calendar, Target, Medal, X, 
  Zap, ArrowRight, ShieldCheck, Share2, Users, Activity,
  Settings2, BarChart3, ChevronRight, Hash, Eye, Edit3, MoreHorizontal
} from 'lucide-react';

const EVENTS = [
  { id: 1, title: 'Summer Smash 2026', type: 'Open Tournament', date: 'Mar 25-27', venue: 'Olympic Arena', status: 'Registration', prize: '₹50,000', participants: 128 },
  { id: 2, title: 'Junior Championship', type: 'U-17 Boys/Girls', date: 'Apr 05', venue: 'Olympic Arena', status: 'Drafting', prize: 'Trophies', participants: 0 },
  { id: 3, title: 'Corporate League', type: 'Teams of 4', date: 'Ongoing', venue: 'Delta Hub', status: 'Live', prize: 'Shield', participants: 16 },
  { id: 4, title: 'Weekend Blitz', type: 'Solo Knockout', date: 'Apr 12', venue: 'Olympic Arena', status: 'Upcoming', prize: '₹12,000', participants: 64 },
];

const EventsAdmin = () => {
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  return (
    <div className="font-sans text-[#1a2b3c] max-w-[1600px] mx-auto border-t border-slate-100 tracking-tight bg-[#F9FAFB]">
      <div className="mx-auto space-y-3 py-3 px-1 md:px-0">
        
        {/* Header (Hyper-Compact & Classy) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 pb-3 border-b border-slate-200/60 bg-white p-4 shadow-sm rounded-sm">
          <div>
            <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.3em] text-[#eb483f] mb-1">
               <div className="w-3 h-[1.5px] bg-[#eb483f]" />
               <Activity size={10} /> Tournament Ops
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-[#0A1121] tracking-tight leading-none bg-gradient-to-r from-[#0A1121] to-[#243B53] bg-clip-text">Event Management</h2>
            <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-400" /> Administrative overview for leagues and championships
            </p>
          </div>
          <button 
            onClick={() => setShowNewEventModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm bg-[#0A1121] text-white hover:bg-black transition-all text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-black/5 active:translate-y-0.5"
          >
            <Plus size={12} strokeWidth={3} /> Draft New Event
          </button>
        </div>

        {/* Key Metrics (Classy Miniature Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
           {[
             { label: 'Live Events', value: '03', icon: Trophy },
             { label: 'Athletes', value: '3.4K+', icon: Users },
             { label: 'Approvals', value: '12', icon: ShieldCheck },
             { label: 'Revenue', value: '1.2L', icon: BarChart3 }
           ].map((stat, i) => (
             <div key={i} className="bg-white border border-slate-200 p-2.5 rounded-sm flex items-center justify-between transition-all hover:bg-slate-50">
                <div>
                   <p className="text-[7.5px] font-bold text-slate-600 uppercase tracking-[0.25em] mb-0.5">{stat.label}</p>
                   <p className="text-lg font-bold text-[#0A1121]">{stat.value}</p>
                </div>
                <div className="w-7 h-7 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                   <stat.icon size={12} strokeWidth={2.5} />
                </div>
             </div>
           ))}
        </div>

        {/* Toolbar (Sharp Compact) */}
        <div className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-sm">
          <div className="flex-1 relative group">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-[#eb483f]" />
            <input
              type="text"
              placeholder="Search across framework..."
              className="w-full h-8 pl-9 pr-3 bg-transparent outline-none text-[10px] font-semibold text-[#0A1121] placeholder:text-slate-500 uppercase tracking-[0.1em]"
            />
          </div>
          <div className="h-5 w-px bg-slate-100" />
          <button className="flex items-center gap-1.5 px-3 py-1 text-[8.5px] font-bold uppercase tracking-widest text-slate-600 hover:text-[#0A1121] transition-colors">
            <Filter size={11} /> Filter
          </button>
        </div>

        {/* Events Data List (Classy High-Density Grid) */}
        <div className="space-y-1.5 pb-8">
          {EVENTS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.02 }}
              className="bg-white border border-slate-200 p-2.5 rounded-sm transition-all group flex flex-col md:flex-row items-start md:items-center gap-4 hover:border-slate-400 hover:shadow-sm"
            >
              {/* Reference ID */}
              <div className="md:w-24 shrink-0">
                 <div className="flex items-center gap-1 text-[7.5px] font-bold text-[#eb483f] uppercase tracking-widest mb-0.5">
                    <Hash size={10} strokeWidth={3} /> {item.id.toString().padStart(4, '0')}
                 </div>
                 <span className="text-[8.5px] font-bold text-slate-600 uppercase tracking-widest line-clamp-1">{item.type}</span>
              </div>

              {/* Tournament Title */}
              <div className="flex-1 min-w-0 pr-4 border-r border-slate-100">
                <h3 className="text-[12px] font-bold text-[#0A1121] uppercase tracking-wide truncate group-hover:text-[#eb483f] transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                   <div className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-widest text-slate-600">
                     <Calendar size={10} className="text-slate-500" /> {item.date}
                   </div>
                   <div className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-widest text-slate-600">
                     <Target size={10} className="text-slate-500" /> {item.venue}
                   </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="flex items-center gap-8 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                 <div className="hidden xl:block min-w-[70px]">
                    <p className="text-[7.5px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Athletes</p>
                    <p className="text-[13px] font-bold text-[#0A1121]">{item.participants} <span className="text-[8px] font-black text-slate-400">/ 256</span></p>
                 </div>

                 <div className="min-w-[70px]">
                    <p className="text-[7.5px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Status</p>
                    <span className={`px-2 py-0.5 rounded-sm text-[7.5px] font-bold uppercase tracking-widest border ${
                      item.status === 'Live' ? 'bg-[#eb483f]/5 text-[#eb483f] border-[#eb483f]/20' :
                      item.status === 'Drafting' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                      'bg-slate-900 text-white border-slate-900'
                    }`}>
                      {item.status}
                    </span>
                 </div>

                 {/* Actions */}
                 <div className="flex items-center gap-2 ml-auto">
                    <button className="w-8 h-8 flex items-center justify-center rounded-sm border border-slate-100 text-slate-500 hover:text-[#0A1121] hover:bg-slate-50 transition-all">
                       <Eye size={12} />
                    </button>
                    <button className="px-5 py-2 rounded-sm bg-[#F5F7FA] border border-slate-200 text-[#0A1121] text-[8.5px] font-bold uppercase tracking-widest hover:bg-[#0A1121] hover:text-white transition-all shadow-sm">
                       Configure
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-sm text-slate-500 hover:text-[#0A1121] transition-colors px-1">
                       <MoreHorizontal size={14} />
                    </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* New Event Modal (Sharp & Classy) */}
      <AnimatePresence>
        {showNewEventModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewEventModal(false)} className="absolute inset-0 bg-[#0A1121]/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-sm rounded-sm border border-white/5 bg-white text-[#1a2b3c] shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white text-[#0A1121]">
                <div>
                  <h3 className="text-lg font-bold tracking-tight uppercase leading-none">Draft Framework</h3>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mt-2">Internal Operation Descriptor</p>
                </div>
                <button onClick={() => setShowNewEventModal(false)} className="bg-slate-50 p-2 rounded-sm text-slate-500 hover:text-[#0A1121] transition-colors border border-slate-200"><X size={14} /></button>
              </div>

              <div className="p-6 space-y-5 bg-[#F9FAFB]/30">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 block ml-0.5">Title Descriptor</label>
                  <input type="text" placeholder="Designate nomenclature..." className="w-full h-8 px-3 rounded-sm border border-slate-200 bg-white text-[10px] font-bold outline-none focus:border-slate-500 uppercase tracking-widest" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 block ml-0.5">Allocation (₹)</label>
                    <input type="text" placeholder="50,000" className="w-full h-8 px-3 rounded-sm border border-slate-200 bg-white text-[10px] font-bold outline-none focus:border-slate-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 block ml-0.5">Locus Node</label>
                    <select className="w-full h-8 px-2 rounded-sm border border-slate-200 bg-white text-[10px] font-bold outline-none appearance-none cursor-pointer uppercase tracking-widest pr-4">
                      <option>Olympic Arena</option>
                      <option>Delta Hub</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 border border-slate-200 bg-white flex items-center gap-3 rounded-sm shadow-sm group">
                   <div className="w-7 h-7 rounded-sm bg-[#eb483f]/5 flex items-center justify-center text-[#eb483f]">
                      <Zap size={14} fill="currentColor" />
                   </div>
                   <p className="text-[8.5px] font-bold text-slate-600 leading-snug">
                     <span className="text-[#0A1121] font-black block mb-0.5 uppercase tracking-widest">Public Deployment</span>
                     Instantly propagate framework to client applications.
                   </p>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setShowNewEventModal(false)}
                    className="w-full h-10 rounded-sm bg-[#0A1121] text-white text-[9px] font-bold uppercase tracking-[0.25em] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    Deploy Operation <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsAdmin;
