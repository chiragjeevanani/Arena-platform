import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Plus, Search, Filter, AlertTriangle, ArrowUpDown, 
  MoreHorizontal, History, RefreshCw, X, Tag, ArrowRight,
  Eye, Settings2, FileText, Printer, Trash2, Activity, 
  Hash, Clock, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import {
  listArenaAdminInventoryItems,
  createArenaAdminInventoryItem,
  updateArenaAdminInventoryItem,
} from '../../../services/arenaAdminApi';
import {
  listAdminInventoryItems,
  createAdminInventoryItem,
  updateAdminInventoryItem,
} from '../../../services/adminOpsApi';
import { resolveLiveOpsArenaScope } from '../../../utils/liveOpsScope';
import { mapArenaInventoryItemToTableRow } from '../../../utils/arenaInventoryAdapter';

const Inventory = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const arenaIdFromQuery = searchParams.get('arenaId');
  const [inventoryData, setInventoryData] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All Listings');

  // Add Item form state
  const [newItem, setNewItem] = useState({ name: '', category: 'Equipment', sku: '', stock: 20, minStock: 5, price: 0 });

  // Adjustment form state
  const [adjustDelta, setAdjustDelta] = useState('');

  const opsScope = useMemo(
    () =>
      resolveLiveOpsArenaScope(user, {
        apiConfigured: isApiConfigured(),
        hasToken: Boolean(getAuthToken()),
        arenaIdFromQuery,
      }),
    [user, arenaIdFromQuery]
  );

  const refetchLiveInventory = useCallback(async () => {
    if (!opsScope.live) return;
    const data =
      opsScope.channel === 'arena'
        ? await listArenaAdminInventoryItems(opsScope.arenaId)
        : await listAdminInventoryItems({ arenaId: opsScope.arenaId });
    const rows = (data.items || []).map(mapArenaInventoryItemToTableRow);
    setInventoryData(rows);
  }, [opsScope]);

  useEffect(() => {
    if (!opsScope.live) return undefined;
    let cancelled = false;
    (async () => {
      try {
        await refetchLiveInventory();
      } catch {
        if (!cancelled) setInventoryData([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [opsScope, refetchLiveInventory]);

  const filteredData = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(item.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const isLow = item.stock > 0 && item.stock <= item.minStock;
    const isOut = item.stock === 0;
    const matchesStatus =
      statusFilter === 'All Listings' ? true :
      statusFilter === 'In-Stock Range' ? (!isLow && !isOut) :
      statusFilter === 'Critical Thresholds' ? isLow :
      statusFilter === 'Depleted Clusters' ? isOut : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = [
    { 
      label: 'Low Stock Alerts', 
      count: inventoryData.filter(i => i.stock > 0 && i.stock <= i.minStock).length, 
      icon: AlertTriangle, 
      color: '#CE2029' 
    },
    { 
      label: 'Depleted Stock', 
      count: inventoryData.filter(i => i.stock === 0).length, 
      icon: Trash2, 
      color: '#ef4444' 
    },
    { 
      label: 'Healthy Stock', 
      count: inventoryData.filter(i => i.stock > i.minStock).length, 
      icon: ShieldCheck, 
      color: '#16a34a' 
    },
    { 
      label: 'Total Catalog', 
      count: inventoryData.length, 
      icon: Package, 
      color: '#36454F' 
    },
  ];

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;
    if (opsScope.live) {
      try {
        const body = {
          arenaId: opsScope.arenaId,
          name: newItem.name.trim(),
          sku: String(newItem.sku || '').trim(),
          quantity: parseInt(newItem.stock, 10) || 0,
          unitPrice: Number(newItem.price) || 0,
        };
        if (opsScope.channel === 'arena') {
          await createArenaAdminInventoryItem(body);
        } else {
          await createAdminInventoryItem(body);
        }
        await refetchLiveInventory();
        addAuditEntry(newItem.name.trim(), 'New SKU registered via API');
        setNewItem({ name: '', category: 'Equipment', sku: '', stock: 20, minStock: 5, price: 0 });
        setShowAddItemModal(false);
      } catch (e) {
        alert(e.message || 'Failed to add item');
      }
      return;
    }
    const entry = {
      id: `inv-${Date.now()}`,
      name: newItem.name,
      category: newItem.category,
      stock: parseInt(newItem.stock, 10) || 0,
      minStock: parseInt(newItem.minStock, 10) || 5,
      price: parseInt(newItem.price, 10) || 0,
    };
    setInventoryData(prev => [entry, ...prev]);
    addAuditEntry(entry.name, `New SKU registered (+${entry.stock} units)`);
    setNewItem({ name: '', category: 'Equipment', sku: '', stock: 20, minStock: 5, price: 0 });
    setShowAddItemModal(false);
  };

  const handleAdjustStock = async () => {
    const delta = parseInt(adjustDelta, 10);
    if (!selectedItem || Number.isNaN(delta)) return;
    if (opsScope.live && selectedItem.fromApi) {
      try {
        const newStock = Math.max(0, selectedItem.stock + delta);
        if (opsScope.channel === 'arena') {
          await updateArenaAdminInventoryItem(selectedItem.id, { quantity: newStock });
        } else {
          await updateAdminInventoryItem(selectedItem.id, { quantity: newStock });
        }
        await refetchLiveInventory();
        addAuditEntry(
          selectedItem.name,
          `Stock adjusted ${delta > 0 ? '+' : ''}${delta} units → ${newStock} remaining`
        );
        setAdjustDelta('');
        setShowAdjustmentModal(false);
      } catch (e) {
        alert(e.message || 'Adjustment failed');
      }
      return;
    }
    const newStock = Math.max(0, selectedItem.stock + delta);
    setInventoryData(prev =>
      prev.map(i => i.id === selectedItem.id ? { ...i, stock: newStock } : i)
    );
    addAuditEntry(selectedItem.name, `Stock adjusted ${delta > 0 ? '+' : ''}${delta} units → ${newStock} remaining`);
    setAdjustDelta('');
    setShowAdjustmentModal(false);
  };

  const addAuditEntry = (itemName, action) => {
    const entry = {
      id: Date.now(),
      item: itemName,
      action,
      timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    };
    setAuditLog(prev => [entry, ...prev]);
  };

  const CATEGORIES = ['All', 'Equipment', 'Consumables', 'Accessories', 'Medical Kits'];
  const STATUS_FILTERS = ['All Listings', 'In-Stock Range', 'Critical Thresholds', 'Depleted Clusters'];

  return (
    <div className="font-sans text-[#36454F] max-w-[1600px] mx-auto border-t border-slate-100 tracking-tight bg-[#F9FAFB]">
      <div className="mx-auto space-y-4 py-4 px-1 md:px-0">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 pb-3 border-b border-slate-200 bg-white p-4 shadow-sm rounded-sm">
           <div>
              <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.3em] text-[#CE2029] mb-1">
                 <div className="w-3 h-[1.5px] bg-[#CE2029]" />
                 <Activity size={10} /> Central Logistics
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#36454F] tracking-tight leading-none uppercase">Inventory Registry</h2>
              <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                 <span className="w-1 h-1 rounded-full bg-slate-400" /> Tracking facility assets and consumables across all active nodes
              </p>
           </div>
           
           <div className="flex items-center gap-2 w-full md:w-auto">
              <button 
                onClick={() => setShowHistoryModal(true)}
                className="p-3 rounded-sm border border-slate-200 bg-white text-slate-500 hover:text-[#36454F] hover:bg-slate-50 transition-all shadow-sm"
              >
                 <History size={16} strokeWidth={2.5} />
              </button>
              <button 
                 onClick={() => setShowAddItemModal(true)}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-[#36454F] text-white hover:bg-black transition-all text-[9.5px] font-bold uppercase tracking-widest shadow-md active:translate-y-0.5"
              >
                 <Plus size={14} strokeWidth={3} /> Add SKU
              </button>
           </div>
        </div>

        {user?.role === 'SUPER_ADMIN' && isApiConfigured() && getAuthToken() && !opsScope.live ? (
          <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] font-semibold text-amber-950">
            Live inventory (super admin): add{' '}
            <span className="font-mono">?arenaId=&lt;24-char Mongo id&gt;</span> to this page&apos;s URL to load and edit stock via{' '}
            <span className="font-mono">/api/admin/inventory</span>.
          </div>
        ) : null}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-4 rounded-sm flex items-center justify-between transition-all hover:bg-slate-50 shadow-sm group">
               <div>
                  <p className="text-[7.5px] font-bold text-slate-600 uppercase tracking-[0.25em] mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-[#36454F] tracking-tighter uppercase">
                    {stat.count.toString().padStart(2, '0')}
                  </h3>
               </div>
               <div className="w-10 h-10 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center transition-all duration-300 group-hover:bg-white" style={{ color: stat.color }}>
                  <stat.icon size={20} strokeWidth={2.5} />
               </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 border border-slate-200 rounded-sm shadow-sm">
          <div className="w-full sm:max-w-md relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#CE2029] transition-colors" />
            <input
              type="text"
              placeholder="Search assets by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-10 pr-4 rounded-sm border border-slate-100 bg-slate-50/30 text-[11px] font-bold text-[#36454F] focus:outline-none focus:border-[#CE2029] focus:bg-white transition-all uppercase tracking-widest placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex-shrink-0 px-3 h-9 rounded-sm border text-[8px] font-black uppercase tracking-widest transition-all ${
                  categoryFilter === cat
                    ? 'bg-[#36454F] border-[#36454F] text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-[#36454F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowFilterDrawer(true)}
            className="w-full sm:w-auto px-5 h-9 rounded-sm border border-slate-100 bg-white text-slate-600 flex items-center gap-2 text-[8.5px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all ml-auto"
          >
            <Filter size={14} strokeWidth={2.5} className="text-[#CE2029]" /> Status Filter
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left whitespace-nowrap min-w-[900px]">
                <thead>
                   <tr className="bg-slate-50/50 border-b border-slate-200 text-[8.5px] font-black uppercase tracking-[0.2em] text-slate-700">
                      <th className="px-5 py-4">Asset Intelligence</th>
                      <th className="px-5 py-4 text-center">Classification</th>
                      <th className="px-5 py-4 text-center">Unit Price</th>
                      <th className="px-5 py-4 text-center">Stock Level</th>
                      <th className="px-5 py-4 text-center">Stability</th>
                      <th className="px-5 py-4 text-right pr-8">Operations</th>
                   </tr>
                </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        No inventory items match your filters.
                      </td>
                    </tr>
                  ) : filteredData.map((item, idx) => {
                     const isLow = item.stock > 0 && item.stock <= item.minStock;
                     const isOut = item.stock === 0;
                     const status = isOut ? 'Depleted' : isLow ? 'Critical' : 'Stable';
                     const barWidth = item.minStock > 0
                       ? Math.min((item.stock / (item.minStock * 2)) * 100, 100)
                       : 100;
                     
                     return (
                       <motion.tr 
                         key={item.id}
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: idx * 0.03 }}
                         className="group hover:bg-slate-50/40 transition-colors"
                       >
                          <td className="px-5 py-3.5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#36454F] group-hover:text-white transition-all">
                                  <Tag size={14} strokeWidth={2.5} />
                                </div>
                                <div>
                                   <p className="font-bold text-[12px] text-[#36454F] uppercase tracking-wide leading-none">{item.name}</p>
                                   <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                      <Hash size={9} /> {item.id.toUpperCase()}
                                   </p>
                                </div>
                             </div>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                             <span className="px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-200 shadow-sm">
                                {item.category}
                             </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                             <span className="text-[11px] font-bold text-[#36454F]">{item.price} OMR</span>
                          </td>
                          <td className="px-5 py-3.5">
                             <div className="flex flex-col items-center gap-1.5">
                                <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                   <div 
                                     className={`h-full transition-all duration-700 ${
                                       isOut ? 'bg-red-500' : isLow ? 'bg-[#CE2029]' : 'bg-green-500'
                                     }`} 
                                     style={{ width: `${barWidth}%` }} 
                                   />
                                </div>
                                <span className="text-[10px] font-bold text-[#36454F] uppercase tracking-tighter">{item.stock} / {item.minStock} min</span>
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
                                  onClick={() => { setSelectedItem(item); setAdjustDelta(''); setShowAdjustmentModal(true); }}
                                  className="w-8 h-8 flex items-center justify-center rounded-sm bg-slate-50 text-slate-500 hover:text-[#36454F] hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-sm"
                                  title="Adjust Stock"
                                >
                                   <ArrowUpDown size={14} strokeWidth={2.5} />
                                </button>
                                <button 
                                  onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                                  className={`w-8 h-8 flex items-center justify-center rounded-sm transition-all border shadow-sm ${
                                    activeMenu === item.id
                                      ? 'bg-[#36454F] border-[#36454F] text-white'
                                      : 'bg-white border-slate-100 text-slate-500 hover:text-[#36454F] hover:bg-slate-50'
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
                                            { label: 'View Logistics', icon: Eye, color: '#36454F' },
                                            { label: 'Manual Edit', icon: Settings2, color: '#36454F' },
                                            { label: 'Audit Trail', icon: FileText, color: '#36454F', action: () => { setShowHistoryModal(true); } },
                                            { label: 'Print SKU', icon: Printer, color: '#36454F' },
                                            { label: 'Archive SKU', icon: Trash2, color: '#ef4444', action: () => {
                                                if (item.fromApi) {
                                                  alert('Inventory deletion is not available in the arena portal.');
                                                  return;
                                                }
                                                setInventoryData(prev => prev.filter(i => i.id !== item.id));
                                                addAuditEntry(item.name, 'SKU archived and removed from catalog');
                                              }
                                            },
                                          ].map((opt, i) => (
                                            <button
                                              key={i}
                                              onClick={() => { setActiveMenu(null); opt.action?.(); }}
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

      {/* ── MODALS ── */}
      <AnimatePresence>
        {/* Add SKU Modal */}
        {showAddItemModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddItemModal(false)} className="absolute inset-0 bg-[#36454F]/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-sm rounded-sm bg-white border border-white/10 shadow-2xl overflow-hidden font-sans">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white text-[#36454F]">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight italic">Catalog Registry</h3>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mt-1">Initialize new asset node</p>
                </div>
                <button onClick={() => setShowAddItemModal(false)} className="text-slate-300 hover:text-[#36454F] transition-colors"><X size={18} /></button>
              </div>

              <div className="p-6 space-y-4 bg-[#F9FAFB]/30">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#36454F] block">Nomenclature (Name)</label>
                  <input
                    type="text"
                    placeholder="e.g. Victor Thruster K-Series"
                    value={newItem.name}
                    onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                    className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none focus:border-[#CE2029] uppercase transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-[9px] font-bold uppercase tracking-widest text-[#36454F] block">Category</label>
                     <select
                       value={newItem.category}
                       onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}
                       className="w-full h-10 px-2 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none uppercase appearance-none cursor-pointer"
                     >
                       {['Equipment', 'Consumables', 'Accessories', 'Medical Kits'].map(c => <option key={c}>{c}</option>)}
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[9px] font-bold uppercase tracking-widest text-[#36454F] block">Unit Price (OMR)</label>
                     <input
                       type="number"
                       placeholder="0"
                       value={newItem.price}
                       onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                       className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none uppercase"
                     />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-[9px] font-bold uppercase tracking-widest text-[#36454F] block">Initial Stock</label>
                     <input
                       type="number"
                       value={newItem.stock}
                       onChange={e => setNewItem(p => ({ ...p, stock: e.target.value }))}
                       className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none uppercase"
                     />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[9px] font-bold uppercase tracking-widest text-[#36454F] block">Min Stock Threshold</label>
                     <input
                       type="number"
                       value={newItem.minStock}
                       onChange={e => setNewItem(p => ({ ...p, minStock: e.target.value }))}
                       className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white text-[11px] font-bold outline-none uppercase"
                     />
                   </div>
                </div>

                <div className="pt-1">
                   <button
                     onClick={handleAddItem}
                     className="w-full h-12 rounded-sm bg-[#36454F] text-white text-[10px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md disabled:opacity-40"
                     disabled={!newItem.name.trim()}
                   >
                     Confirm Catalog Point <ArrowRight size={14} />
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Audit Log Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistoryModal(false)} className="absolute inset-0 bg-[#36454F]/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-[450px] rounded-sm bg-white border border-white/10 shadow-2xl overflow-hidden font-sans">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white text-[#36454F]">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight italic">Operational Audit</h3>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mt-1">Live log of all inventory mutations</p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="text-slate-300 hover:text-[#36454F] transition-colors"><X size={18} /></button>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto space-y-1 bg-[#F9FAFB]/30">
                {auditLog.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    No activity recorded yet.<br />Adjust stock or add items to start the log.
                  </div>
                ) : auditLog.map(entry => (
                  <div key={entry.id} className="p-3 bg-white border border-slate-100 rounded-sm flex items-center justify-between hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                        <RefreshCw size={14} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#36454F] uppercase leading-none">{entry.item}</p>
                        <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                           <Clock size={9} /> {entry.timestamp}
                        </p>
                        <p className="text-[8px] font-bold text-slate-600 mt-0.5">{entry.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Stock Adjustment Modal */}
        {showAdjustmentModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdjustmentModal(false)} className="absolute inset-0 bg-[#36454F]/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-sm rounded-sm bg-white border border-white/10 shadow-2xl overflow-hidden font-sans">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white text-[#36454F]">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight italic">Stock Adjustment</h3>
                  <p className="text-[8.4px] font-black uppercase text-slate-600 mt-1">Correcting: {selectedItem?.name}</p>
                </div>
                <button onClick={() => setShowAdjustmentModal(false)} className="text-slate-300 hover:text-[#36454F] transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-sm bg-slate-50 border border-slate-200">
                   <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Current Stock</p>
                   <p className="text-2xl font-bold text-[#36454F] uppercase">{selectedItem?.stock} units</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#36454F] block">Correction Delta (+/- Units)</label>
                  <input
                    type="number"
                    placeholder="e.g. +10 or -5"
                    value={adjustDelta}
                    onChange={e => setAdjustDelta(e.target.value)}
                    className="w-full h-12 px-4 rounded-sm border border-slate-200 bg-white text-[14px] font-bold outline-none focus:border-[#CE2029]"
                  />
                  {adjustDelta !== '' && !isNaN(parseInt(adjustDelta)) && (
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      New stock will be: <span className="text-[#36454F]">{Math.max(0, (selectedItem?.stock || 0) + parseInt(adjustDelta))} units</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={handleAdjustStock}
                  disabled={adjustDelta === '' || isNaN(parseInt(adjustDelta))}
                  className="w-full h-12 rounded-sm bg-[#36454F] text-white text-[10px] font-bold uppercase tracking-[0.25em] shadow-md hover:bg-black transition-all disabled:opacity-40"
                >
                  Commit Vector Override
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filter Status Drawer */}
        {showFilterDrawer && (
          <div className="fixed inset-0 z-[120] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilterDrawer(false)} className="absolute inset-0 bg-[#36454F]/50 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-[320px] h-full shadow-2xl bg-white border-l border-slate-200 flex flex-col font-sans">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white text-[#36454F]">
                <h3 className="text-xl font-bold uppercase tracking-tight italic">Filter Framework</h3>
                <button onClick={() => setShowFilterDrawer(false)} className="text-slate-300 hover:text-slate-600 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 flex-1 space-y-8 overflow-y-auto bg-[#F9FAFB]/30">
                 <section>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#36454F] mb-3 block">Operational State</label>
                    <div className="space-y-1.5">
                       {STATUS_FILTERS.map(s => (
                         <button
                           key={s}
                           onClick={() => setStatusFilter(s)}
                           className={`w-full py-2.5 px-4 rounded-sm border text-[9px] font-black uppercase text-left transition-all ${
                             statusFilter === s
                               ? 'bg-[#36454F] border-[#36454F] text-white shadow-md'
                               : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-[#36454F]'
                           }`}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                 </section>
              </div>
              <div className="p-6 border-t border-slate-200">
                 <button onClick={() => setShowFilterDrawer(false)} className="w-full h-12 rounded-sm bg-[#36454F] text-white text-[10px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-black transition-all">
                   Apply Filters <ArrowRight size={14} />
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
