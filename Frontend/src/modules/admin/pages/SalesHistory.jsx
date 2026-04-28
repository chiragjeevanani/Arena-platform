import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Search, Filter, Calendar, 
  ChevronLeft, ChevronRight, Receipt, User,
  MapPin, Clock, ArrowUpRight, Download,
  RefreshCw, CheckCircle2, MoreVertical
} from 'lucide-react';
import { listAdminArenas, listAdminPosSales } from '../../../services/adminOpsApi';
import { normalizeListArena } from '../../../utils/arenaAdapter';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { useAuth } from '../../user/context/AuthContext';

const SalesHistory = () => {
  const { user } = useAuth();
  const location = useLocation();
  const pathPrefix = location.pathname.startsWith('/admin') ? '/admin' : '/arena';
  const [arenas, setArenas] = useState([]);
  const [selectedArenaId, setSelectedArenaId] = useState('');
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const loadSales = useCallback(async () => {
    if (!selectedArenaId || !isApiConfigured() || !getAuthToken()) return;
    setIsLoading(true);
    try {
      const data = await listAdminPosSales(selectedArenaId);
      setSales(data.sales || []);
    } catch (e) {
      showToast(e.message || 'Failed to load sales', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedArenaId]);

  useEffect(() => {
    if (!isApiConfigured() || !getAuthToken()) return;
    (async () => {
      try {
        if (user?.role === 'ARENA_ADMIN' && user?.assignedArena) {
          setSelectedArenaId(user.assignedArena);
        } else if (user?.role === 'SUPER_ADMIN') {
          const res = await listAdminArenas();
          const list = (res.arenas || []).map(normalizeListArena);
          setArenas(list);
          if (list.length > 0) setSelectedArenaId(list[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredSales = sales.filter(s => 
    s.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer?.phone?.includes(searchTerm)
  );

  return (
    <div className="bg-[#F4F7F6] min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#36454F] font-display tracking-tight flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029]">
                <History size={24} strokeWidth={2.5} />
              </div>
              Sales History
            </h2>
            <p className="text-xs md:text-sm mt-1 font-bold text-slate-500 uppercase tracking-widest opacity-60">
              Audit trail for all retail POS transactions
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {user?.role === 'SUPER_ADMIN' && (
                <select 
                  value={selectedArenaId}
                  onChange={(e) => setSelectedArenaId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-[#36454F] outline-none shadow-sm focus:ring-2 focus:ring-[#CE2029]/20"
                >
                  {arenas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
             )}
             <button 
              onClick={loadSales}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#CE2029] transition-all"
             >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#CE2029] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by receipt ID, customer name or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-[#36454F] outline-none transition-all focus:border-[#CE2029]/40 focus:ring-4 focus:ring-[#CE2029]/5"
            />
          </div>
          <div className="md:col-span-4 flex gap-2">
             <button className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
               <Calendar size={16} /> Date Range
             </button>
             <button className="flex-1 bg-[#36454F] text-white rounded-2xl px-4 py-4 flex items-center justify-center gap-2 text-xs font-bold hover:bg-black transition-all">
               <Download size={16} /> Export CSV
             </button>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
              <thead className="bg-[#36454F] text-white">
                <tr className="text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-5">Receipt Info</th>
                  <th className="px-6 py-5">Customer Details</th>
                  <th className="px-6 py-5">Items Sold</th>
                  <th className="px-6 py-5 text-center">Amount</th>
                  <th className="px-6 py-5 text-right pr-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="animate-spin text-[#CE2029]" size={32} />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing Vault...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                         <Receipt size={48} className="text-slate-300" />
                         <p className="text-xs font-black uppercase tracking-widest text-slate-400">No transactions recorded</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      key={sale.id} 
                      className="group hover:bg-slate-50/80 transition-all cursor-pointer relative"
                    >
                      <td className="px-6 py-5">
                        <Link to={`${pathPrefix}/sales/${sale.id}`} className="absolute inset-0 z-10" />
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#36454F] group-hover:bg-[#CE2029]/10 group-hover:text-[#CE2029] transition-colors font-black text-[10px]">
                            POS
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#36454F] group-hover:text-[#CE2029] transition-colors uppercase tracking-tight">#{sale.id.slice(-8)}</p>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-0.5">
                              <Clock size={10} />
                              {new Date(sale.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[#36454F]">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#36454F]">{sale.customer?.name || 'Walk-in'}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider">{sale.customer?.phone || 'No Phone'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          {sale.lines.slice(0, 2).map((line, lidx) => (
                            <div key={lidx} className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                              <span className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center text-[8px]">{line.qty}x</span>
                              <span className="truncate max-w-[150px]">{line.name}</span>
                            </div>
                          ))}
                          {sale.lines.length > 2 && (
                            <p className="text-[9px] font-black text-[#CE2029] mt-0.5 tracking-widest">+ {sale.lines.length - 2} MORE ITEMS</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <p className="text-sm font-black text-[#CE2029]">OMR {Number(sale.totalAmount).toFixed(2)}</p>
                         <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">Settled</p>
                      </td>
                      <td className="px-6 py-5 text-right pr-10">
                         <div className="flex items-center justify-end gap-2">
                           <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#CE2029] hover:border-[#CE2029]/40 transition-all shadow-sm">
                             <Receipt size={16} />
                           </button>
                           <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#CE2029] hover:border-[#CE2029]/40 transition-all shadow-sm">
                             <MoreVertical size={16} />
                           </button>
                         </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[200] border ${
              toast.type === 'error' ? 'bg-white border-red-100 text-red-600' : 'bg-[#36454F] border-white/10 text-white'
            }`}
          >
            {toast.type === 'error' ? <History size={18} /> : <CheckCircle2 size={18} className="text-[#CE2029]" />}
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SalesHistory;
