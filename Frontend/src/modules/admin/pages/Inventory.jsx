import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Plus, Search, Filter, AlertTriangle, ArrowUpDown, 
  MoreHorizontal, History, RefreshCw, X, Tag, Layers, ArrowRight,
  Eye, Settings2, FileText, Printer, Trash2 
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
    const matchesCategory = categoryFilter === 'All'; 
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
      color: '#1a2b3c' 
    },
  ];

  return (
    <div className="bg-[#F4F7F6] min-h-full p-3 md:p-4 lg:p-8 font-sans text-[#1a2b3c]">
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2 md:gap-3 text-[#1a2b3c]">
              <Package className="text-[#eb483f] w-[20px] h-[20px] md:w-[24px] md:h-[24px]" strokeWidth={2.5} /> Inventory Registry
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold text-slate-500">Track equipment, consumables, and facility assets across all regions.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <button 
               onClick={() => setShowHistoryModal(true)}
               className="p-3 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-[#1a2b3c] hover:bg-slate-50 transition-all shadow-sm"
               title="Audit Logs"
             >
                <History size={18} strokeWidth={2.5} />
             </button>
              <button 
                onClick={() => setShowAddItemModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white hover:shadow-md hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest shadow-sm shadow-[#eb483f]/20"
              >
                 <Plus size={16} strokeWidth={3} /> Add SKU
              </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-5 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-[#eb483f]/40 hover:shadow-md group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">{stat.label}</p>
                  <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight text-[#1a2b3c]">
                    {stat.count.toString().padStart(2, '0')}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 bg-slate-50 border-slate-100 group-hover:scale-110" style={{ color: stat.color }}>
                  <stat.icon size={24} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:max-w-md relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#eb483f] transition-colors" />
            <input
              type="text"
              placeholder="Search assets by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3.5 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-[#1a2b3c] focus:outline-none focus:border-[#eb483f] transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilterDrawer(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-[#1a2b3c] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            <Filter size={16} strokeWidth={2.5} className="text-[#eb483f]" /> Detailed Filters
          </button>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-[#eb483f]/40">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left whitespace-nowrap min-w-[900px]">
                <thead>
                   <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-[#1a2b3c]">
                      <th className="px-6 py-5">Asset Intelligence</th>
                      <th className="px-6 py-5 text-center">Classification</th>
                      <th className="px-6 py-5 text-center">Stock Level</th>
                      <th className="px-6 py-5 text-center">Health</th>
                      <th className="px-6 py-5 text-right pr-10">Operations</th>
                   </tr>
                </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredData.map((item, idx) => {
                     const isLow = item.stock > 0 && item.stock <= item.minStock;
                     const isOut = item.stock === 0;
                     const status = isOut ? 'Depleted' : isLow ? 'Critical' : 'Healthy';
                     
                     return (
                       <motion.tr 
                         key={item.id}
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: idx * 0.05 }}
                         className="group hover:bg-slate-50/50 transition-colors"
                       >
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#eb483f]">
                                 <Tag size={18} strokeWidth={2.5} />
                               </div>
                               <div>
                                  <p className="font-black text-[13px] text-[#1a2b3c]">{item.name}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">SKU: {item.id.toUpperCase()}</p>
                               </div>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                             <span className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
                                Equipment
                             </span>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex flex-col items-center gap-1.5">
                                <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                                   <div 
                                     className={`h-full transition-all duration-1000 ${
                                       isOut ? 'bg-red-500' : isLow ? 'bg-[#eb483f]' : 'bg-[#eb483f]'
                                     }`} 
                                     style={{ width: `${Math.min((item.stock / item.minStock) * 50, 100)}%` }} 
                                   />
                                </div>
                                <span className="text-[11px] font-black text-[#1a2b3c]">{item.stock} Units</span>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                               status === 'Healthy' ? 'bg-[#eb483f]/5 text-[#eb483f] border-[#eb483f]/20' : 
                               status === 'Critical' ? 'bg-[#eb483f]/5 text-[#eb483f] border-[#eb483f]/20' : 
                               'bg-red-50 text-red-500 border-red-100'
                             }`}>
                                {status}
                             </span>
                          </td>
                          <td className="px-6 py-5 pr-10 text-right">
                             <div className="flex items-center justify-end gap-2 relative">
                               <button 
                                 onClick={() => { setSelectedItem(item); setShowAdjustmentModal(true); }}
                                 className="p-2.5 rounded-xl transition-all bg-slate-50 text-slate-400 hover:text-[#eb483f] hover:bg-white border border-transparent hover:border-slate-100 shadow-sm"
                                 title="Quick Adjustment"
                               >
                                  <ArrowUpDown size={16} strokeWidth={2.5} />
                               </button>
                               <button 
                                 onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                                 className={`p-2.5 rounded-xl transition-all border shadow-sm ${
                                   activeMenu === item.id
                                     ? 'bg-[#eb483f] border-[#eb483f] text-white'
                                     : 'bg-white border-slate-100 text-slate-400 hover:text-[#1a2b3c] hover:bg-slate-50'
                                 }`}
                               >
                                  <MoreHorizontal size={16} strokeWidth={2.5} />
                               </button>

                              <AnimatePresence>
                                {activeMenu === item.id && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                      className={`absolute right-0 ${idx >= filteredData.length - 2 ? 'bottom-full mb-2' : 'top-full mt-2'} w-56 p-2 rounded-2xl border border-slate-200 bg-white shadow-xl z-20`}
                                    >
                                      <div className="space-y-1">
                                        {[
                                          { label: 'View Analytics', icon: Eye, color: '#eb483f' },
                                          { label: 'Correction', icon: Settings2, color: '#eb483f' },
                                          { label: 'Ledger', icon: FileText, color: '#eb483f' },
                                          { label: 'Print Label', icon: Printer, color: '#eb483f' },
                                          { label: 'Archive SKU', icon: Trash2, color: '#ef4444' },
                                        ].map((opt, i) => (
                                          <button
                                            key={i}
                                            onClick={() => setActiveMenu(null)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                          >
                                            <div className="p-1.5 rounded-lg border" style={{ backgroundColor: `${opt.color}10`, borderColor: `${opt.color}30`, color: opt.color }}>
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
                       </motion.tr>
                     );
                  })}
               </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {/* Add Item Modal */}
        {showAddItemModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddItemModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white text-[#1a2b3c] shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <Plus className="text-[#eb483f]" size={24} strokeWidth={3} /> Catalog Registry
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Initialize new asset record</p>
                </div>
                <button onClick={() => setShowAddItemModal(false)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-200 text-slate-400 bg-white border border-slate-200 shadow-sm"><X size={20} strokeWidth={2.5} /></button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Asset Name & Specifications</label>
                    <div className="relative">
                      <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#eb483f] group-focus-within:opacity-100 transition-all font-black" />
                      <input type="text" placeholder="e.g. Victor Thruster K-Series" className="w-full py-4 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none transition-all focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Category</label>
                      <select className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none appearance-none focus:border-[#eb483f] focus:bg-white text-[#1a2b3c]">
                        <option>Apparel & Gear</option>
                        <option>Training Equipment</option>
                      </select>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Unique Identifier (SKU)</label>
                      <input type="text" placeholder="SKU-XXXX-01" className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#eb483f] focus:bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Initial Stock</label>
                      <input type="number" defaultValue="20" className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#eb483f] focus:bg-white" />
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Critical Threshold</label>
                      <input type="number" defaultValue="5" className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold outline-none focus:border-[#eb483f] focus:bg-white" />
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#eb483f] shadow-sm">
                     <Layers size={18} strokeWidth={2.5} />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Warehouse Sync</p>
                      <p className="text-[11px] font-bold text-slate-500 mt-1 leading-snug">Automatically sync with centralized distribution center.</p>
                   </div>
                   <div className="w-10 h-6 bg-[#eb483f] rounded-full relative shadow-sm">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                   </div>
                </div>

                <button onClick={() => setShowAddItemModal(false)} className="w-full py-4 rounded-xl bg-[#eb483f] border border-[#eb483f] text-white text-[13px] font-bold uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                  Confirm Catalog Entry <ArrowRight size={16} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Audit Log Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistoryModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-[#1a2b3c]">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <History className="text-[#eb483f]" size={24} strokeWidth={3} /> Audit Trail
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verification of stock movements</p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-100 text-slate-400 bg-white border border-slate-200"><X size={20} /></button>
              </div>
              <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="p-4 rounded-2xl flex items-center justify-between border border-slate-100 hover:border-[#eb483f]/20 transition-all hover:bg-slate-50 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#eb483f]/5 flex items-center justify-center text-[#eb483f] border border-[#eb483f]/10 shadow-sm"><RefreshCw size={18} strokeWidth={2.5} /></div>
                      <div>
                        <p className="text-[13px] font-black text-[#1a2b3c]">Stock Replenishment: Shuttlecocks Gold-X</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">24 Mar • 14:12 • Admin Portal Verification</p>
                      </div>
                    </div>
                    <span className="text-[14px] font-black text-[#eb483f]">+20 Sets</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Adjustment Modal */}
        {showAdjustmentModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdjustmentModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-[#1a2b3c]">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black font-display tracking-tight text-[#eb483f]">Stock Level Adjustment</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manual unit correction override</p>
                </div>
                <button onClick={() => setShowAdjustmentModal(false)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-white border border-slate-100"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between p-6 rounded-2xl bg-[#eb483f]/5 border border-[#eb483f]/20 shadow-sm">
                   <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Live Registry Count</p>
                   <p className="text-3xl font-black font-display text-[#eb483f]">{selectedItem?.stock}</p>
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Adjustment Delta (+/- Units)</label>
                  <input type="number" placeholder="Enter correction amount..." className="w-full py-4 px-5 rounded-2xl border border-slate-200 bg-slate-50 text-[14px] font-bold outline-none focus:border-[#eb483f] focus:bg-white transition-all text-[#1a2b3c]" />
                </div>
                <button onClick={() => setShowAdjustmentModal(false)} className="w-full py-4 rounded-xl bg-[#eb483f] text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#eb483f]/30 hover:-translate-y-0.5 transition-all">
                  Commit Correction
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filter Drawer */}
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[120] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilterDrawer(false)} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-sm h-full shadow-2xl bg-white border-l border-slate-200 flex flex-col text-[#1a2b3c]">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xl font-black font-display tracking-tight text-[#eb483f]">Catalog Intelligence</h3>
                <button onClick={() => setShowFilterDrawer(false)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-white border border-slate-100 text-slate-300 hover:text-slate-600 shadow-sm"><X size={20} /></button>
              </div>
              <div className="p-8 flex-1 space-y-10 overflow-y-auto">
                 <section>
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#eb483f] mb-4 block">Stock Status Filter</label>
                    <div className="grid grid-cols-1 gap-2">
                       {['All Listings', 'In Stock Hub', 'Critical Alerts', 'Depleted Stock'].map(stat => (
                         <button key={stat} className={`w-full py-4 px-5 rounded-xl border text-[11px] font-black uppercase text-left transition-all ${stat === 'All Listings' ? 'bg-[#eb483f]/5 border-[#eb483f]/30 text-[#eb483f] shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-[#1a2b3c] hover:bg-slate-100'}`}>
                           {stat}
                         </button>
                       ))}
                    </div>
                 </section>

                 <section>
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#eb483f] mb-4 block">Category Mapping</label>
                    <div className="grid grid-cols-1 gap-2">
                       {['Shuttlecocks', 'Rackets', 'Court Accessories', 'Medical Kits'].map(cat => (
                         <button key={cat} className="w-full py-4 px-5 rounded-xl border border-slate-100 bg-slate-50 text-[11px] font-black uppercase text-left text-slate-400 hover:bg-slate-100 hover:text-[#1a2b3c] transition-all">
                           {cat}
                         </button>
                       ))}
                    </div>
                 </section>
              </div>
              <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                 <button onClick={() => setShowFilterDrawer(false)} className="w-full py-4 rounded-xl bg-[#1a2b3c] text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:-translate-y-0.5 transition-all">
                   Execute Filters
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
