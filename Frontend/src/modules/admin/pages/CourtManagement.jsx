import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Plus, Search, Filter, Settings2, Trash2, Edit2, CheckCircle2, 
  XCircle, X, ArrowRight, MoreVertical, Eye, FileText, Activity
} from 'lucide-react';
import { MOCK_DB } from '../../../data/mockDatabase';

const CourtManagement = () => {
  const [selectedArenaId, setSelectedArenaId] = useState(MOCK_DB.arenas[0].id);
  const [showAddCourtModal, setShowAddCourtModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Use MOCK_DB instead of mockData
  const filteredCourts = MOCK_DB.courts.filter(court => {
    const matchesArena = court.arenaId === selectedArenaId;
    const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesArena && matchesSearch;
  });

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans text-[#36454F]">
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 text-[#36454F]">
              <Target className="text-[#CE2029] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" strokeWidth={2.5} /> Unit Portfolio
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold text-slate-500">Manage individual courts, surfaces, and unit-level operational status.</p>
          </div>
          <button
            onClick={() => setShowAddCourtModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#CE2029] border border-[#CE2029] text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest shadow-sm shadow-[#CE2029]/20"
          >
            <Plus size={16} strokeWidth={3} /> Commission Unit
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#CE2029] transition-colors" />
            <input
              type="text"
              placeholder="Search units by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3.5 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-[#36454F] focus:outline-none focus:border-[#CE2029] transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <select
                value={selectedArenaId}
                onChange={(e) => setSelectedArenaId(e.target.value)}
                className="w-full py-3.5 px-4 pr-10 rounded-xl border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-[#36454F] appearance-none outline-none focus:border-[#CE2029] transition-all shadow-sm"
              >
                {MOCK_DB.arenas.map(arena => (
                  <option key={arena.id} value={arena.id}>{arena.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                <Target size={14} strokeWidth={2.5} />
              </div>
            </div>

            <button className="p-3.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-[#CE2029] hover:bg-slate-50 transition-all shadow-sm">
              <Filter size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredCourts.map((court, idx) => (
            <motion.div
              key={court.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group rounded-2xl bg-white p-5 border border-slate-100 shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col hover:border-[#CE2029]/40 hover:shadow-md"
            >
              {/* Status Header */}
              <div className="flex justify-between items-start mb-5">
                <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${
                  court.status === 'Active' 
                    ? 'bg-[#CE2029]/5 text-[#CE2029] border-[#CE2029]/20' 
                    : 'bg-red-50 text-red-500 border-red-100'
                }`}>
                  {court.status === 'Active' ? <CheckCircle2 size={12} strokeWidth={2.5} /> : <XCircle size={12} strokeWidth={2.5} />}
                  {court.status === 'Active' ? 'Operational' : 'Halted'}
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === court.id ? null : court.id)}
                    className={`p-2 rounded-xl transition-all border shadow-sm ${
                      activeMenu === court.id
                        ? 'bg-[#CE2029] border-[#CE2029] text-white'
                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-[#36454F] hover:bg-white'
                    }`}
                  >
                    <MoreVertical size={16} strokeWidth={2.5} />
                  </button>

                  <AnimatePresence>
                    {activeMenu === court.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className={`absolute right-0 top-full mt-2 w-48 p-2 rounded-2xl border border-slate-200 bg-white z-20 shadow-xl`}
                        >
                           <div className="space-y-1">
                            {[
                              { label: 'Edit Metrics', icon: Edit2, color: '#CE2029' },
                              { label: 'Sync Calendar', icon: Settings2, color: '#CE2029' },
                              { label: 'Access Logs', icon: FileText, color: '#CE2029' },
                              { label: 'Performance', icon: Activity, color: '#CE2029' },
                              { label: 'Decommission', icon: Trash2, color: '#ef4444' },
                            ].map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => setActiveMenu(null)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all font-sans"
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
              </div>

              {/* Title Area */}
              <div className="mb-6">
                <h3 className="text-xl font-black font-display tracking-tight text-[#36454F]">
                  {court.name}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#CE2029] mt-1 italic">
                  Premium {court.type} Surface
                </p>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Base Rate</p>
                  <p className="text-[13px] font-display font-black text-[#36454F]">{court.pricePerHour} <span className="text-[9px] font-bold text-slate-400">OMR/hr</span></p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Occupancy</p>
                  <p className="text-[13px] font-display font-black text-[#36454F]">4 <span className="text-[9px] font-bold text-slate-400">pax</span></p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {['AC Facility', 'LED Panels', 'Pro Mat'].map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white border border-slate-100 text-slate-400 group-hover:text-[#CE2029] group-hover:border-[#CE2029]/20 transition-all">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto">
                <button className="w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 bg-white text-[#36454F] hover:bg-[#36454F] hover:text-white hover:border-[#36454F] flex items-center justify-center gap-2 shadow-sm">
                  <Activity size={14} strokeWidth={2.5} /> Manage Queue
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Court Modal */}
      <AnimatePresence>
        {showAddCourtModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddCourtModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white text-[#36454F] shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <Target className="text-[#CE2029]" size={24} strokeWidth={3} /> Commissioning Hub
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Register new operational unit</p>
                </div>
                <button
                  onClick={() => setShowAddCourtModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-200 text-slate-300 bg-white border border-slate-200 shadow-sm shadow-slate-100"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Asset Identity</label>
                  <input type="text" placeholder="e.g. Center Court - 01" className="w-full py-4 px-6 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#CE2029] focus:bg-white transition-all text-[#36454F] shadow-inner" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Surface Architecture</label>
                    <select className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none focus:border-[#CE2029] focus:bg-white text-[#36454F] shadow-inner">
                      <option>Synthetic Pro</option>
                      <option>Premium Wooden</option>
                      <option>Hybrid Mat</option>
                      <option>Hard Court</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Pax Threshold</label>
                    <input type="number" defaultValue="4" className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#CE2029] focus:bg-white text-[#36454F] shadow-inner" />
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Standard Hourly Rate (OMR)</label>
                  <div className="relative">
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">OMR</span>
                    <input type="number" defaultValue="8.0" className="w-full py-4 pl-6 pr-16 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#CE2029] focus:bg-white text-[#36454F] shadow-inner" />
                  </div>
                </div>

                <button
                  onClick={() => setShowAddCourtModal(false)}
                  className="w-full py-4 rounded-xl bg-[#CE2029] border border-[#CE2029] text-white text-[11px] font-black uppercase tracking-widest hover:shadow-[#CE2029]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Confirm Deployment <ArrowRight size={18} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourtManagement;
