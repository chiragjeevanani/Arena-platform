import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Plus, Search, Filter, AlertTriangle, ArrowUpDown, 
  MoreHorizontal, History, RefreshCw, X, Tag, Layers, ArrowRight,
  Eye, Settings2, FileText, Printer, Trash2, Activity, ShieldCheck, 
  Target, BarChart3, Hash
} from 'lucide-react';
import { MOCK_DB } from '../../../data/mockDatabase';

const Inventory = () => {
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const inventoryData = MOCK_DB.inventory;

  const filteredData = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || (item.category && item.category.toLowerCase() === categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { 
      label: 'Low Stock Alerts', 
      count: inventoryData.filter(i => i.stock > 0 && i.stock <= i.minStock).length, 
      icon: AlertTriangle, 
      color: '#eb483f' 
    },
    { 
      label: 'Depleted Stock', 
      count: inventoryData.filter(i => i.stock === 0).length, 
      icon: Trash2, 
      color: '#ef4444' 
    },
    { 
      label: 'Total Catalog', 
      count: inventoryData.length, 
      icon: Package, 
      color: '#0A1121' 
    },
  ];

  return (
    <div className="font-sans text-[#1a2b3c] max-w-[1600px] mx-auto border-t border-slate-100 tracking-tight bg-[#F9FAFB]">
      <div className="mx-auto space-y-4 py-4 px-1 md:px-0">
        
        {/* Professional Header (Classy & Compact) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 pb-3 border-b border-slate-200 bg-white p-4 shadow-sm rounded-sm">
           <div>
              <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.3em] text-[#eb483f] mb-1">
                 <div className="w-3 h-[1.5px] bg-[#eb483f]" />
                 <Activity size={10} /> Central Logistics
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#0A1121] tracking-tight leading-none uppercase">Inventory Registry</h2>
              <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                 <span className="w-1 h-1 rounded-full bg-slate-400" /> Tracking facility assets and consumables across all active nodes
              </p>
           </div>
           
           <div className="flex items-center gap-2 w-full md:w-auto">
              <button 
                onClick={() => setShowHistoryModal(true)}
                className="p-3 rounded-sm border border-slate-200 bg-white text-slate-500 hover:text-[#0A1121] hover:bg-slate-50 transition-all shadow-sm"
              >
                 <History size={16} strokeWidth={2.5} />
              </button>
              <button 
                 onClick={() => setShowAddItemModal(true)}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-[#0A1121] text-white hover:bg-black transition-all text-[9.5px] font-bold uppercase tracking-widest shadow-md active:translate-y-0.5"
              >
                 <Plus size={14} strokeWidth={3} /> Add SKU
              </button>
           </div>
        </div>

        {/* Global Key Metrics (Classy Miniature Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-4 rounded-sm flex items-center justify-between transition-all hover:bg-slate-50 shadow-sm group">
               <div>
                  <p className="text-[7.5px] font-bold text-slate-600 uppercase tracking-[0.25em] mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-[#0A1121] tracking-tighter uppercase">
                    {stat.count.toString().padStart(2, '0')}
                  </h3>
               </div>
               <div className="w-10 h-10 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center transition-all duration-300 group-hover:bg-white" style={{ color: stat.color }}>
                  <stat.icon size={20} strokeWidth={2.5} />
               </div>
            </div>
          ))}
        </div>

        {/* Search & Intelligence Controls (Compact) */}
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 border border-slate-200 rounded-sm shadow-sm">
          <div className="w-full sm:max-w-md relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#eb483f] transition-colors" />
            <input
              type="text"
              placeholder="Search assets by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-10 pr-4 rounded-sm border border-slate-100 bg-slate-50/30 text-[11px] font-bold text-[#0A1121] focus:outline-none focus:border-[#eb483f] focus:bg-white transition-all uppercase tracking-widest placeholder:text-slate-400"
            />
          </div>
          <button 
            onClick={() => setShowFilterDrawer(true)}
            className="w-full sm:w-auto px-5 h-9 rounded-sm border border-slate-100 bg-white text-slate-600 flex items-center gap-2 text-[8.5px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <Filter size={14} strokeWidth={2.5} className="text-[#eb483f]" /> Detailed Filters
          </button>
        </div>

        {/* High-Precision Inventory Cluster (Hyper-Compact Card items) */}
        <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left whitespace-nowrap min-w-[900px]">
                <thead>
                   <tr className="bg-slate-50/50 border-b border-slate-200 text-[8.5px] font-black uppercase tracking-[0.2em] text-slate-700">
                      <th className="px-5 py-4">Asset Intelligence</th>
                      <th className="px-5 py-4 text-center">Classification</th>
                      <th className="px-5 py-4 text-center">Stock Level</th>
                      <th className="px-5 py-4 text-center">Stability</th>
                      <th className="px-5 py-4 text-right pr-8">Operations</th>
                   </tr>
                </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item, idx) => {
                     const isLow = item.stock > 0 && item.stock <= item.minStock;
                     const isOut = item.stock === 0;
                     const status = isOut ? 'Depleted' : isLow ? 'Critical' : 'Stable';
                     
                     return (
                       <motion.tr 
                         key={item.id}
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: idx * 0.02 }}
                         className="group hover:bg-slate-50/40 transition-colors"
                       >
                          <td className="px-5 py-3.5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#0A1121] group-hover:text-white transition-all">
                                  <Tag size={14} strokeWidth={2.5} />
                                </div>
                                <div>
                                   <p className="font-bold text-[12px] text-[#0A1121] uppercase tracking-wide leading-none">{item.name}</p>
                                   <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                      <Hash size={9} /> {item.id.toUpperCase()}
                                   </p>
                                </div>
                             </div>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                             <span className="px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-200 shadow-sm">
                                Equipment
                             </span>
                          </td>
                          <td className="px-5 py-3.5">
                             <div className="flex flex-col items-center gap-1.5">
                                <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                   <div 
                                     className={`h-full transition-all duration-700 ${
                                       isOut ? 'bg-red-500' : isLow ? 'bg-[#eb483f]' : 'bg-[#0A1121]'
                                     }`} 
                                     style={{ width: `${Math.min((item.stock / (item.minStock || 1)) * 50, 100)}%` }} 
                                   />
                                </div>
                                <span className="text-[10px] font-bold text-[#0A1121] uppercase tracking-tighter">{item.stock} Units</span>
                             </div>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                             <span className={`px-2.5 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest border transition-colors ${
                               status === 'Stable' ? 'bg-green-50 text-green-600 border-green-100' : 
                               status === 'Critical' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                               'bg-red-50 text-red-500 border-red-100'
                             }`}>
                                {status}
                             </span>
                          </td>
                          <td className="px-5 py-3.5 pr-8 text-right">
                             <div className="flex items-center justify-end gap-1.5 relative">
                                <button 
                                  onClick={() => { setSelectedItem(item); setShowAdjustmentModal(true); }}
                                  className="w-8 h-8 flex items-center justify-center rounded-sm bg-slate-50 text-slate-500 hover:text-[#0A1121] hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-sm"
                                >
                                   <ArrowUpDown size={14} strokeWidth={2.5} />
                                </button>
                                <button 
                                  onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                                  className={`w-8 h-8 flex items-center justify-center rounded-sm transition-all border shadow-sm ${
                                    activeMenu === item.id
                                      ? 'bg-[#0A1121] border-[#0A1121] text-white'
                                      : 'bg-white border-slate-100 text-slate-500 hover:text-[#0A1121] hover:bg-slate-50'
                                  }`}
                                >
                                   <MoreHorizontal size={14} strokeWidth={2.5} />
                                </button>

                                <AnimatePresence>
                                  {activeMenu === item.id && (
                                    <>
                                      <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.98, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, y: 5 }}
                                        className={`absolute right-0 ${idx >= filteredData.length - 2 ? 'bottom-full mb-2' : 'top-full mt-2'} w-48 p-1.5 rounded-sm border border-slate-200 bg-white shadow-xl z-20`}
                                      >
                                        <div className="space-y-0.5">
                                          {[
                                            { label: 'View Logistics', icon: Eye, color: '#0A1121' },
                                            { label: 'Manual Edit', icon: Settings2, color: '#0A1121' },
                                            { label: 'Audit Trail', icon: FileText, color: '#0A1121' },
                                            { label: 'Print SKU', icon: Printer, color: '#0A1121' },
                                            { label: 'Archive SKU', icon: Trash2, color: '#ef4444' },
                                          ].map((opt, i) => (
                                            <button
                                              key={i}
                                              onClick={() => setActiveMenu(null)}
                                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-[9.5px] font-bold text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
                                            >
                                              <opt.icon size={11} strokeWidth={2.5} style={{ color: opt.color }} />
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
                     );
                  })}
               </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Advanced Orchestration Modals (Restored & Refined) */}
      <AnimatePresence>
        {showAddItemModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddItemModal(false)} className="absolute inset-0 bg-[#0A1121]/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} 
              className="relative w-full max-w-sm rounded-sm bg-white border border-white/10 shadow-2xl overflow-hidden font-sans">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white text-[#0A1121]">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight italic">Catalog Registry</h3>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mt-1">Initialize new asset node</p>
                </div>
                <button onClick={() => setShowAddItemModal(false)} className="text-slate-300 hover:text-[#0A1121] transition-colors"><X size={18} /></button>
              </div>

              <div className="p-6 space-y-5 bg-[#F9FAFB]/30">
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#0A1121] block">Nomenclature (Name)</label>
                  <input type="text" placeholder="e.g. Victor Thruster K-Series" className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none focus:border-[#eb483f] uppercase transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5 text-left">
                     <label className="text-[9px] font-bold uppercase tracking-widest text-[#0A1121] block">Category</label>
                     <select className="w-full h-10 px-2 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none uppercase appearance-none cursor-pointer">
                       <option>Apparel & Gear</option>
                       <option>Training Equipment</option>
                     </select>
                   </div>
                   <div className="space-y-1.5 text-left">
                     <label className="text-[9px] font-bold uppercase tracking-widest text-[#0A1121] block">Locus Identifier</label>
                     <input type="text" placeholder="SKU-001" className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none uppercase" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5 text-left">
                     <label className="text-[9px] font-bold uppercase tracking-widest text-[#0A1121] block">Initial Magnitude</label>
                     <input type="number" defaultValue="20" className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none uppercase" />
                   </div>
                   <div className="space-y-1.5 text-left">
                     <label className="text-[9px] font-bold uppercase tracking-widest text-[#0A1121] block">Critical Bias</label>
                     <input type="number" defaultValue="5" className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none uppercase" />
                   </div>
                </div>

                <div className="pt-2">
                   <button onClick={() => setShowAddItemModal(false)} 
                     className="w-full h-12 rounded-sm bg-[#0A1121] text-white text-[10px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md">
                     Confirm Catalog Point <ArrowRight size={14} />
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Audit Log (Restored & Refined) */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistoryModal(false)} className="absolute inset-0 bg-[#0A1121]/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} 
              className="relative w-full max-w-[450px] rounded-sm bg-white border border-white/10 shadow-2xl overflow-hidden font-sans">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white text-[#0A1121]">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight italic">Operational Audit</h3>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mt-1">Verification of logistics cluster states</p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="text-slate-300 hover:text-[#0A1121] transition-colors"><X size={18} /></button>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto space-y-1 bg-[#F9FAFB]/30">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="p-3 bg-white border border-slate-100 rounded-sm flex items-center justify-between hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#0A1121]">
                        <RefreshCw size={14} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#0A1121] uppercase leading-none">Stock Reconciliation: S-00{i}</p>
                        <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                           <Clock size={10} /> 24 Mar · 14:12 · Operational Hub Alpha
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-green-500 tracking-tighter">+20U</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Quick Correction (Restored & Refined) */}
        {showAdjustmentModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdjustmentModal(false)} className="absolute inset-0 bg-[#0A1121]/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} 
              className="relative w-full max-w-sm rounded-sm bg-white border border-white/10 shadow-2xl overflow-hidden font-sans">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white text-[#0A1121]">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight italic">Manual Vector Adjust</h3>
                  <p className="text-[8.4px] font-black uppercase text-slate-600 mt-1">Direct state correction for {selectedItem?.name}</p>
                </div>
                <button onClick={() => setShowAdjustmentModal(false)} className="text-slate-300 hover:text-[#0A1121] transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-sm bg-slate-50 border border-slate-200">
                   <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Active Magnitude</p>
                   <p className="text-2xl font-bold text-[#0A1121] uppercase">{selectedItem?.stock}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#0A1121] block">Correction Delta (+/- Units)</label>
                  <input type="number" placeholder="Enter displacement mag..." className="w-full h-12 px-4 rounded-sm border border-slate-200 bg-white text-[14px] font-bold outline-none focus:border-[#eb483f]" />
                </div>
                <button onClick={() => setShowAdjustmentModal(false)} className="w-full h-12 rounded-sm bg-[#0A1121] text-white text-[10px] font-bold uppercase tracking-[0.25em] shadow-md hover:bg-black transition-all">
                  Commit Vector Override
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Dynamic Filter Sidepanel (Restored & Refined) */}
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[120] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilterDrawer(false)} className="absolute inset-0 bg-[#0A1121]/50 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-[320px] h-full shadow-2xl bg-white border-l border-slate-200 flex flex-col font-sans">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white text-[#0A1121]">
                <h3 className="text-xl font-bold uppercase tracking-tight italic">Filter Framework</h3>
                <button onClick={() => setShowFilterDrawer(false)} className="text-slate-300 hover:text-slate-600 transition-colors transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 flex-1 space-y-8 overflow-y-auto bg-[#F9FAFB]/30">
                 <section>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A1121] mb-3 block">Operational State</label>
                    <div className="space-y-1.5">
                       {['All Listings', 'In-Stock Range', 'Critical Thresholds', 'Depleted Clusters'].map(stat => (
                         <button key={stat} className={`w-full py-2.5 px-4 rounded-sm border text-[9px] font-black uppercase text-left transition-all ${stat === 'All Listings' ? 'bg-[#0A1121] border-[#0A1121] text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-[#0A1121]'}`}>
                           {stat}
                         </button>
                       ))}
                    </div>
                 </section>

                 <section>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A1121] mb-3 block">Category Mapping</label>
                    <div className="space-y-1.5">
                       {['Shuttlecocks', 'Rackets', 'Court Accessories', 'Medical Kits'].map(cat => (
                         <button key={cat} className="w-full py-2.5 px-4 rounded-sm border border-slate-200 bg-white text-[9px] font-black uppercase text-left text-slate-500 hover:bg-slate-50 hover:text-[#0A1121] transition-all">
                           {cat}
                         </button>
                       ))}
                    </div>
                 </section>
              </div>
              <div className="p-6 border-t border-slate-200">
                 <button onClick={() => setShowFilterDrawer(false)} className="w-full h-12 rounded-sm bg-[#0A1121] text-white text-[10px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-black transition-all">
                   Execute Parameters <ArrowRight size={14} />
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
