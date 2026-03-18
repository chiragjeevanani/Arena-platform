import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Search, Filter, Calendar, Target, Medal, X, Zap, ArrowRight, ShieldCheck, Share2 } from 'lucide-react';

const EVENTS = [
  { id: 1, title: 'Summer Smash 2026', type: 'Open Tournament', date: 'March 25-27', venue: 'Olympic Smash Arena', status: 'Registration Open', prize: '₹50,000', participants: 128 },
  { id: 2, title: 'Junior Championship', type: 'U-17 Boys/Girls', date: 'April 05', venue: 'Olympic Smash Arena', status: 'Drafting', prize: 'Trophies & Gears', participants: 0 },
  { id: 3, title: 'Corporate League', type: 'Teams of 4', date: 'Ongoing', venue: 'Badminton Hub Delta', status: 'Live', prize: 'Corporate Trophy', participants: 16 },
];

const EventsAdmin = () => {
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans text-[#1a2b3c]">
      <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 text-[#1a2b3c]">
              <Trophy className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" strokeWidth={2.5} /> Tournament Command
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold text-slate-500">Orchestrate leagues, championships, and high-performance competitive events.</p>
          </div>
          <button 
            onClick={() => setShowNewEventModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest shadow-sm shadow-[#eb483f]/20"
          >
            <Plus size={16} strokeWidth={3} /> Draft Tournament
          </button>
        </div>

        {/* Featured Metric / Spotlight */}
        <div className="p-6 md:p-10 rounded-3xl bg-white border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:border-[#eb483f]/40 hover:shadow-md group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#eb483f]/5 blur-[80px] -z-10 group-hover:bg-[#eb483f]/10 transition-all duration-500" />
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center border-2 border-[#eb483f]/20 bg-red-50 text-[#eb483f] shadow-sm shadow-[#eb483f]/10 transition-transform group-hover:scale-110">
                <Medal size={32} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#eb483f] mb-1">Global Participant Registry</p>
                <h3 className="text-3xl md:text-5xl font-black font-display tracking-tight text-[#1a2b3c]">3,412 <span className="text-sm font-black text-slate-300 uppercase ml-2 tracking-widest">Elite Athletes</span></h3>
              </div>
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
              <div className="flex-1 lg:min-w-[120px] p-4 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-inner group/stat">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover/stat:text-[#eb483f] transition-colors">Waitlist</p>
                 <p className="text-2xl font-black font-display text-[#1a2b3c]">12</p>
              </div>
              <div className="flex-1 lg:min-w-[120px] p-4 rounded-2xl border border-[#eb483f]/10 bg-red-50 shadow-inner group/stat">
                 <p className="text-[9px] font-black text-[#eb483f]/60 uppercase tracking-widest mb-1">Asset Value</p>
                 <p className="text-2xl font-black font-display text-[#eb483f]">12.4L</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-colors" />
            <input
              type="text"
              placeholder="Query live or archived tournaments..."
              className="w-full py-3.5 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-[#1a2b3c] outline-none focus:border-[#eb483f] transition-all shadow-sm"
            />
          </div>
          <button className="p-3.5 rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-[#eb483f] hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 gap-4">
          {EVENTS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all duration-300 relative group hover:border-[#eb483f]/40 hover:shadow-md"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                      item.status === 'Live' ? 'bg-[#eb483f] text-white border-[#eb483f]' :
                      item.status === 'Drafting' ? 'bg-slate-50 text-slate-400 border-slate-100' :
                      'bg-red-50 text-[#eb483f] border-[#eb483f]/20'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">REF-ID: {item.id.toString().padStart(4, '0')}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight text-[#1a2b3c] group-hover:text-[#eb483f] transition-colors">{item.title}</h3>
                  <div className="flex flex-wrap items-center gap-6">
                     <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                       <Calendar size={14} className="text-[#eb483f]" strokeWidth={2.5} /> {item.date}
                     </div>
                     <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                       <Target size={14} className="text-[#eb483f]" strokeWidth={2.5} /> {item.venue}
                     </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-10">
                   <div className="text-left md:text-center">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 leading-none">Registered</p>
                      <p className="text-2xl font-black font-display text-[#1a2b3c]">{item.participants}</p>
                   </div>
                   <div className="flex items-center gap-3 ml-auto">
                      <button className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-[#eb483f] hover:bg-white transition-all shadow-sm">
                         <Share2 size={18} strokeWidth={2.5} />
                      </button>
                      <button className="px-6 py-3 rounded-xl bg-[#1a2b3c] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#eb483f] transition-all shadow-lg hover:shadow-[#eb483f]/20 group/btn">
                         Manage Bracket <ArrowRight size={16} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* New tournament Modal */}
      <AnimatePresence>
        {showNewEventModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewEventModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white text-[#1a2b3c] shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <Trophy className="text-[#eb483f]" size={24} strokeWidth={3} /> Event Framework
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Initialize competitive operation</p>
                </div>
                <button onClick={() => setShowNewEventModal(false)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-200 text-slate-300 bg-white border border-slate-200 shadow-sm"><X size={20} strokeWidth={2.5} /></button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Tournament Designation</label>
                  <input type="text" placeholder="e.g. Master Series Open 2026" className="w-full py-4 px-6 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#eb483f] focus:bg-white transition-all text-[#1a2b3c]" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Prize Allocation</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-[#eb483f] text-xs">₹</span>
                      <input type="text" placeholder="50,000" className="w-full py-4 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Base Venue</label>
                    <select className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]">
                      <option>Olympic Main Arena</option>
                      <option>Smash Delta Hub</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border-2 border-dashed border-red-100 bg-red-50 flex items-center gap-4 group/box">
                   <Zap className="text-[#eb483f] group-hover:scale-120 transition-transform" size={24} strokeWidth={2.5} />
                   <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#eb483f]">Instant Sync</p>
                      <p className="text-[11px] font-bold text-red-900/40 mt-0.5 leading-snug">Tournament will be visible on the public user app instantly after publishing.</p>
                   </div>
                   <div className="w-10 h-6 bg-[#eb483f] rounded-full relative shadow-lg shadow-[#eb483f]/20">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                   </div>
                </div>

                <button 
                  onClick={() => setShowNewEventModal(false)}
                  className="w-full py-4 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white text-[11px] font-black uppercase tracking-widest hover:shadow-[#eb483f]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Deploy Tournament Bracket <ArrowRight size={18} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsAdmin;
