import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Search, Filter, AlertTriangle, ArrowUpDown, MoreHorizontal, History } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const INVENTORY = [
  { id: 'INV-001', name: 'Yonex Mavis 350 (Yellow)', category: 'Shuttlecocks', sku: 'SH-M350-Y', stock: 124, unit: 'Tube', minStock: 50, status: 'In Stock' },
  { id: 'INV-002', name: 'Grip Wrap (Super Grap)', category: 'Accessories', sku: 'AC-GRIP-01', stock: 12, unit: 'Roll', minStock: 20, status: 'Low Stock' },
  { id: 'INV-003', name: 'Energy Drink (500ml)', category: 'Refreshments', sku: 'RF-ED-01', stock: 85, unit: 'Bottle', minStock: 40, status: 'In Stock' },
  { id: 'INV-004', name: 'Wristband (Cotton)', category: 'Accessories', sku: 'AC-WB-01', stock: 0, unit: 'Pair', minStock: 10, status: 'Out of Stock' },
];

const Inventory = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-[#0A1F44]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
            <Package className="text-[#22FF88]" /> Inventory Hub
          </h2>
          <p className="text-sm text-white/40 mt-1 font-medium italic">Track sports equipment and supplies across units.</p>
        </div>
        <div className="flex gap-2">
           <button className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-white border-black/10 text-black/40'}`}>
              <History size={18} />
           </button>
           <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22FF88] text-[#0A1F44] hover:bg-[#1EE7FF] transition-all text-sm font-bold shadow-[0_0_15px_rgba(34,255,136,0.3)]">
              <Plus size={16} /> Add Item
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Low Stock Items', count: '04', icon: AlertTriangle, color: '#FFD600' },
          { label: 'Out of Stock', count: '01', icon: AlertTriangle, color: '#FF4B4B' },
          { label: 'Active SKUs', count: '142', icon: Package, color: '#22FF88' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-3xl border ${isDark ? 'bg-[#0A1F44]/50 border-white/5' : 'bg-white border-[#0A1F44]/10'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
                <h3 className={`text-4xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{stat.count}</h3>
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
            className={`w-full py-2.5 pl-11 pr-4 rounded-xl text-sm font-medium transition-all outline-none border ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/5 focus:border-[#22FF88]/50 text-white' 
                : 'bg-white border-[#0A1F44]/10 focus:border-[#22FF88] text-[#0A1F44]'
            }`}
          />
        </div>
        <button className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all ${
          isDark ? 'bg-[#0A1F44]/50 border-white/5 text-white/60 hover:text-white' : 'bg-white border-[#0A1F44]/10 text-[#0A1F44]/60 hover:text-[#0A1F44]'
        }`}>
          <Filter size={18} /> Filters
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
                {INVENTORY.map((item, idx) => (
                   <motion.tr 
                     key={item.id}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: idx * 0.05 }}
                     className="group hover:bg-white/[0.02]"
                   >
                      <td className="p-6">
                         <div>
                            <p className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.name}</p>
                            <p className="text-[10px] font-bold text-[#1EE7FF] uppercase tracking-widest mt-0.5">{item.sku}</p>
                         </div>
                      </td>
                      <td className="p-6 text-center">
                         <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-black/5 border-black/10 text-[#0A1F44]/60'}`}>
                            {item.category}
                         </span>
                      </td>
                      <td className="p-6 text-center">
                         <div className="flex flex-col items-center gap-2">
                            <div className="w-full max-w-[100px] h-1.5 rounded-full bg-white/5 overflow-hidden">
                               <div 
                                 className={`h-full transition-all duration-1000 ${
                                   item.stock === 0 ? 'bg-[#FF4B4B]' : 
                                   item.stock < item.minStock ? 'bg-[#FFD600]' : 'bg-[#22FF88]'
                                 }`} 
                                 style={{ width: `${Math.min((item.stock/item.minStock) * 50, 100)}%` }} 
                               />
                            </div>
                            <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.stock}</span>
                         </div>
                      </td>
                      <td className="p-6 text-center font-bold text-xs opacity-40 uppercase tracking-widest">{item.unit}</td>
                      <td className="p-6 text-center">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${
                           item.status === 'In Stock' ? 'bg-[#22FF88]/10 text-[#22FF88] border-[#22FF88]/20' : 
                           item.status === 'Low Stock' ? 'bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/20' : 
                           'bg-[#FF4B4B]/10 text-[#FF4B4B] border-[#FF4B4B]/20'
                         }`}>
                            {item.status}
                         </span>
                      </td>
                      <td className="p-6 pr-10 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <button className={`p-2 rounded-xl transition-all ${isDark ? 'bg-white/5 text-white/40 hover:text-[#22FF88]' : 'bg-black/5 text-[#0A1F44]/40 hover:text-[#059669]'}`}>
                              <ArrowUpDown size={16} />
                           </button>
                           <button className={`p-2 rounded-xl transition-all ${isDark ? 'bg-white/5 text-white/40 hover:text-white' : 'bg-black/5 text-[#0A1F44]/40 hover:text-black'}`}>
                              <MoreHorizontal size={16} />
                           </button>
                         </div>
                      </td>
                   </motion.tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
