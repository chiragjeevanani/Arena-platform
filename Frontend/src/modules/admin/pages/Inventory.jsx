import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Plus, Search, Filter, AlertTriangle, ArrowUpDown, 
  MoreHorizontal, History, RefreshCw, X, Tag, Layers, Database, ArrowRight,
  Eye, Settings2, FileText, Printer, Trash2
} from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { MOCK_DB } from '../../../data/mockDatabase';

const Inventory = () => {
  const { isDark } = useTheme();
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
    // In MOCK_DB categories aren't explicit, but we'll use a placeholder logic
    const matchesCategory = categoryFilter === 'All'; 
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { 
      label: 'Low Stock Items', 
      count: inventoryData.filter(i => i.stock > 0 && i.stock <= i.minStock).length, 
      icon: AlertTriangle, 
      color: '#FFD600' 
    },
    { 
      label: 'Out of Stock', 
      count: inventoryData.filter(i => i.stock === 0).length, 
      icon: AlertTriangle, 
      color: '#FF4B4B' 
    },
    { 
      label: 'Active SKUs', 
      count: inventoryData.length, 
      icon: Package, 
      color: '#22FF88' 
    },
  ];

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Package className="text-[#22FF88]" /> Inventory Hub
          </h2>
          <p className={`text-sm mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Track sports equipment and supplies across units.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setShowHistoryModal(true)}
             className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-white' : 'bg-white border-black/10 text-black/40 hover:text-black'}`}
           >
              <History size={18} />
           </button>
           <button 
             onClick={() => setShowAddItemModal(true)}
             className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-105 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#22FF88]/20"
           >
              <Plus size={16} /> Add Item
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-3xl border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
                <h3 className={`text-4xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                  {stat.count.toString().padStart(2, '0')}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors duration-300" style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[250px] relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#22FF88] transition-colors" />
          <input
            type="text"
            placeholder="Search items, SKU or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-3 pl-11 pr-4 rounded-xl text-sm font-medium transition-all outline-none border ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/5 focus:border-[#22FF88]/50 text-white' 
                : 'bg-white border-[#0A1F44]/10 focus:border-[#22FF88] text-[#0A1F44]'
            }`}
          />
        </div>
        <button 
          onClick={() => setShowFilterDrawer(true)}
          className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
          isDark ? 'bg-[#0A1F44]/50 border-white/5 text-white/60 hover:text-white' : 'bg-white border-[#0A1F44]/10 text-[#0A1F44]/60 hover:text-[#0A1F44]'
        }`}>
          <Filter size={16} /> Filters
        </button>
      </div>

      <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10 shadow-lg'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
                <tr className={`text-[10px] font-black uppercase tracking-[0.2em] border-b ${isDark ? 'text-white/20 border-white/5 bg-white/5' : 'text-[#0A1F44]/20 border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
                   <th className="p-6">Item & SKU</th>
                   <th className="p-6 text-center">Category</th>
                   <th className="p-6 text-center">Stock Level</th>
                   <th className="p-6 text-center">Unit</th>
                   <th className="p-6 text-center">Status</th>
                   <th className="p-6 text-right pr-10">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {filteredData.map((item, idx) => {
                   const status = item.stock === 0 ? 'Out of Stock' : 
                                item.stock <= item.minStock ? 'Low Stock' : 'In Stock';
                   return (
                     <motion.tr 
                       key={item.id}
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       transition={{ delay: idx * 0.05 }}
                       className={`group hover:bg-white/[0.02] ${!isDark && 'hover:bg-black/[0.02]'}`}
                     >
                        <td className="p-6">
                           <div>
                              <p className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.name}</p>
                              <p className="text-[10px] font-bold text-[#1EE7FF] uppercase tracking-widest mt-0.5">SKU-{item.id.slice(-4)}</p>
                           </div>
                        </td>
                        <td className="p-6 text-center">
                           <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-black/5 border-black/10 text-[#0A1F44]/60'}`}>
                              Tools
                           </span>
                        </td>
                        <td className="p-6 text-center">
                           <div className="flex flex-col items-center gap-2">
                              <div className={`w-full max-w-[100px] h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                                 <div 
                                   className={`h-full transition-all duration-1000 ${
                                     item.stock === 0 ? 'bg-[#FF4B4B]' : 
                                     item.stock <= item.minStock ? 'bg-[#FFD600]' : 'bg-[#22FF88]'
                                   }`} 
                                   style={{ width: `${Math.min((item.stock / item.minStock) * 50, 100)}%` }} 
                                 />
                              </div>
                              <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.stock}</span>
                           </div>
                        </td>
                        <td className="p-6 text-center font-bold text-xs opacity-40 uppercase tracking-widest">Unit</td>
                        <td className="p-6 text-center">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${
                             status === 'In Stock' ? 'bg-[#22FF88]/10 text-[#22FF88] border-[#22FF88]/20' : 
                             status === 'Low Stock' ? 'bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/20' : 
                             'bg-[#FF4B4B]/10 text-[#FF4B4B] border-[#FF4B4B]/20'
                           }`}>
                              {status}
                           </span>
                        </td>
                         <td className="p-6 pr-10 text-right">
                            <div className="flex items-center justify-end gap-2 relative">
                              <button 
                                onClick={() => { setSelectedItem(item); setShowAdjustmentModal(true); }}
                                className={`p-2 rounded-xl transition-all ${isDark ? 'bg-white/5 text-white/40 hover:text-[#22FF88]' : 'bg-black/5 text-[#0A1F44]/40 hover:text-[#059669]'}`}
                              >
                                 <ArrowUpDown size={16} />
                              </button>
                              <button 
                                onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                                className={`p-2 rounded-xl transition-all border ${
                                  activeMenu === item.id
                                    ? 'bg-[#22FF88] border-[#22FF88] text-[#0A1F44]'
                                    : isDark 
                                      ? 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/10' 
                                      : 'bg-black/5 border-black/10 text-[#0A1F44]/40 hover:text-black hover:border-black/20'
                                }`}
                              >
                                 <MoreHorizontal size={16} />
                              </button>

                              <AnimatePresence>
                                {activeMenu === item.id && (
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
                                          { label: 'View Details', icon: Eye, color: '#1EE7FF' },
                                          { label: 'Stock Adjustment', icon: Settings2, color: '#22FF88' },
                                          { label: 'Purchase History', icon: FileText, color: '#FFD600' },
                                          { label: 'Print Labels', icon: Printer, color: '#A855F7' },
                                          { label: 'Archive Item', icon: Trash2, color: '#FF4B4B' },
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
                     </motion.tr>
                   );
                })}
             </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddItemModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-lg rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10 text-white' : 'bg-white border-black/10 text-[#0A1F44]'} shadow-2xl shadow-black/50`}
            >
              <div className="p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-3">
                    <Package className="text-[#22FF88]" /> Add to Catalog
                  </h3>
                  <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Register new asset or supply unit</p>
                </div>
                <button 
                  onClick={() => setShowAddItemModal(false)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Item Name & Brand</label>
                    <div className="relative">
                      <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-[#22FF88] group-focus-within:opacity-100 transition-all font-black text-[13px]" />
                      <input 
                        type="text" 
                        placeholder="e.g. Yonex Astrox 88D Pro"
                        className={`w-full py-4 pl-12 pr-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Category</label>
                      <select className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}>
                        <option>Equipment</option>
                        <option>Consumables</option>
                        <option>Apparel</option>
                        <option>Accessories</option>
                      </select>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Base SKU</label>
                      <input 
                        type="text" 
                        placeholder="YON-88D-PRO"
                        className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Initial Qty</label>
                      <input 
                        type="number" 
                        defaultValue="0"
                        className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#22FF88]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#22FF88] text-[#0A1F44]'}`}
                      />
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Min Stock Alert</label>
                      <input 
                        type="number" 
                        defaultValue="5"
                        className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border border-dashed flex items-center gap-4 ${isDark ? 'bg-[#22FF88]/5 border-[#22FF88]/20' : 'bg-[#22FF88]/5 border-[#22FF88]/30'}`}>
                   <Layers className="text-[#22FF88]" size={20} />
                   <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#22FF88]">Auto-Catalog</p>
                      <p className="text-xs font-bold mt-1 opacity-40">Sync with global supplier database</p>
                   </div>
                   <div className="w-10 h-6 bg-[#22FF88] rounded-full relative shadow-lg shadow-[#22FF88]/20">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-[#0A1F44] rounded-full" />
                   </div>
                </div>

                <button 
                  onClick={() => setShowAddItemModal(false)}
                  className="w-full py-5 rounded-[1.5rem] bg-[#22FF88] text-[#0A1F44] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:scale-[1.02] transition-all shadow-2xl shadow-[#22FF88]/20 flex items-center justify-center gap-2"
                >
                  Commit to Inventory <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Log Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistoryModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative w-full max-w-2xl rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10' : 'bg-white border-black/10'}`}>
              <div className="p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black font-display tracking-tight text-[#22FF88]">Audit Log</h3>
                  <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-1">Recent inventory movements & changes</p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40' : 'hover:bg-black/5 text-black/40'}`}>
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 max-h-[400px] overflow-y-auto space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`p-4 rounded-2xl flex items-center justify-between ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#22FF88]/10 flex items-center justify-center text-[#22FF88]"><RefreshCw size={14} /></div>
                      <div>
                        <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Stock Restored: Shuttlecocks (Gold)</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Today at 10:45 AM • Admin John</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#22FF88]">+24 Units</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {showAdjustmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdjustmentModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className={`relative w-full max-w-md rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0A1F44] border-white/10 text-white' : 'bg-white border-black/10 text-[#0A1F44]'}`}>
              <div className="p-8 border-b border-inherit flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black font-display tracking-tight text-[#FFD600]">Stock Adjustment</h3>
                  <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-1">Manual unit correction for {selectedItem?.name}</p>
                </div>
                <button onClick={() => setShowAdjustmentModal(false)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40' : 'hover:bg-black/5 text-black/40'}`}>
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFD600]/10 border border-[#FFD600]/20">
                   <p className="text-[10px] font-black uppercase text-[#FFD600] tracking-widest">Current Stock</p>
                   <p className="text-2xl font-black font-display text-[#FFD600]">{selectedItem?.stock}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Adjustment Value (+/-)</label>
                  <input type="number" placeholder="Enter quantity..." className={`w-full py-4 px-4 rounded-2xl border text-xs font-bold outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:border-[#FFD600]/50 text-white' : 'bg-black/5 border-black/5 focus:border-[#FFD600] text-[#0A1F44]'}`} />
                </div>
                <button onClick={() => setShowAdjustmentModal(false)} className="w-full py-4 rounded-2xl bg-[#FFD600] text-[#0A1F44] text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#FFD600]/20">
                  Update Units
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inventory Filter Drawer */}
      <AnimatePresence>
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilterDrawer(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className={`relative w-full max-w-sm h-full shadow-2xl overflow-hidden flex flex-col ${isDark ? 'bg-[#0A1F44] border-l border-white/10' : 'bg-white border-l border-black/10'}`}>
              <div className="p-8 border-b border-inherit flex items-center justify-between">
                <div><h3 className="text-xl font-black font-display tracking-tight text-[#22FF88]">Catalog Filters</h3></div>
                <button onClick={() => setShowFilterDrawer(false)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/5 text-white/40' : 'hover:bg-black/5 text-black/40'}`}><X size={20} /></button>
              </div>
              <div className="p-8 flex-1 space-y-8">
                 <section>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-4 block">Stock Status</label>
                    <div className="space-y-2">
                       {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(stat => (
                         <button key={stat} className={`w-full py-4 px-4 rounded-2xl border text-[10px] font-black uppercase text-left transition-all ${stat === 'All' ? 'bg-[#22FF88]/10 border-[#22FF88] text-[#22FF88]' : 'bg-white/2 border-white/5 text-white/20'}`}>
                           {stat}
                         </button>
                       ))}
                    </div>
                 </section>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
