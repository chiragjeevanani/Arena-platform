import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Search, ShoppingCart, User, Plus, Minus, 
  Trash2, CheckCircle2, Receipt, ChevronRight, 
  Package, Store, Zap, ArrowRight, Tag, ShoppingBag, ArrowUpRight,
  X, RefreshCw, UserPlus, PlusCircle, History, Clock
} from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import {
  listArenaAdminInventoryItems,
  createArenaAdminPosSale,
  listArenaAdminPosSales,
  searchArenaAdminCustomers,
} from '../../../services/arenaAdminApi';
import { listAdminInventoryItems, createAdminPosSale, listAdminPosSales } from '../../../services/adminOpsApi';
import { resolveLiveOpsArenaScope } from '../../../utils/liveOpsScope';
import { mapArenaInventoryItemToPosProduct } from '../../../utils/arenaInventoryAdapter';
import { fetchPublicArenas } from '../../../services/arenasApi';

const STATIC_CATALOG = [
  { id: 1, name: 'Yonex Mavis 350 (Y)', price: 1.200, category: 'Equipment', stock: 42, sku: 'SN-001' },
  { id: 2, name: 'Grip Wrap (Blue)', price: 0.450, category: 'Accessories', stock: 128, sku: 'GR-022' },
  { id: 3, name: 'Gatorade Blue (500ml)', price: 0.600, category: 'Drinks', stock: 24, sku: 'DR-109' },
  { id: 4, name: 'Stringing Service', price: 3.500, category: 'Services', stock: 1, sku: 'SR-005' },
  { id: 5, name: 'RedBull (250ml)', price: 1.250, category: 'Drinks', stock: 18, sku: 'DR-110' },
  { id: 6, name: 'Shuttlecock Box (10x)', price: 11.000, category: 'Equipment', stock: 12, sku: 'SN-112' },
];

const CATEGORIES_FULL = ['All', 'Equipment', 'Drinks', 'Accessories', 'Services'];

const RetailPOS = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const arenaIdFromQuery = searchParams.get('arenaId');

  const [arenas, setArenas] = useState([]);
  const [isLoadingArenas, setIsLoadingArenas] = useState(false);

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN' && isApiConfigured()) {
      setIsLoadingArenas(true);
      fetchPublicArenas()
        .then(res => setArenas(res.arenas || []))
        .catch(err => console.error('Failed to load arenas for POS:', err))
        .finally(() => setIsLoadingArenas(false));
    }
  }, [user]);

  const opsScope = useMemo(
    () =>
      resolveLiveOpsArenaScope(user, {
        apiConfigured: isApiConfigured(),
        hasToken: Boolean(getAuthToken()),
        arenaIdFromQuery,
      }),
    [user, arenaIdFromQuery]
  );

  const [catalogItems, setCatalogItems] = useState(() => STATIC_CATALOG);

  const refetchCatalog = useCallback(async () => {
    if (!opsScope.live) return;
    const data =
      opsScope.channel === 'arena'
        ? await listArenaAdminInventoryItems(opsScope.arenaId)
        : await listAdminInventoryItems({ arenaId: opsScope.arenaId });
    setCatalogItems((data.items || []).map(mapArenaInventoryItemToPosProduct));
  }, [opsScope]);

  useEffect(() => {
    if (!opsScope.live) {
      setCatalogItems(STATIC_CATALOG);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        await refetchCatalog();
      } catch {
        if (!cancelled) setCatalogItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [opsScope, refetchCatalog]);

  const categoryOptions = useMemo(
    () => (opsScope.live ? ['All', 'Equipment'] : CATEGORIES_FULL),
    [opsScope.live]
  );

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (!categoryOptions.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categoryOptions, selectedCategory]);
  const [selectedCustomer, setSelectedCustomer] = useState({ name: 'Walk-in Customer', id: 'GUEST-01', phone: 'N/A' });
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStage, setPaymentStage] = useState('METHOD_SELECT'); // 'METHOD_SELECT', 'CASH_ENTRY', 'PROCESSING', 'UPI_QR'
  const [cashTendered, setCashTendered] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [isAddingWalkin, setIsAddingWalkin] = useState(false);
  const [walkinForm, setWalkinForm] = useState({ name: '', phone: '' });

  const [view, setView] = useState('CATALOG'); // 'CATALOG' or 'HISTORY'
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!opsScope.live || view !== 'HISTORY') return;
    setIsLoadingHistory(true);
    try {
      const data =
        opsScope.channel === 'arena'
          ? await listArenaAdminPosSales(opsScope.arenaId)
          : await listAdminPosSales(opsScope.arenaId);
      setHistory(data.sales || []);
    } catch (e) {
      console.error('Failed to fetch history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [opsScope, view]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Debounced Customer Search
  useEffect(() => {
    if (!showCustomerModal) {
      setCustomerResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCustomers(true);
      try {
        const res = await searchArenaAdminCustomers(customerQuery);
        setCustomerResults(res.customers || []);
      } catch (e) {
        console.error('Customer search failed:', e);
      } finally {
        setIsSearchingCustomers(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [customerQuery, showCustomerModal]);

  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const tax = subtotal * 0.18;
  const currentTotal = subtotal + tax;

  const handleCheckoutInitiate = () => {
    if (cart.length === 0) return;
    setPaymentStage('METHOD_SELECT');
    setShowPaymentModal(true);
  };

  const startPaymentFlow = (method) => {
    setSelectedPaymentMethod(method);
    if (method === 'CASH') setPaymentStage('CASH_ENTRY');
    else if (method === 'UPI') setPaymentStage('UPI_QR');
    else {
      setPaymentStage('PROCESSING');
      setTimeout(() => finalizeTransaction(method), 2500);
    }
  };

  const finalizeTransaction = async (method) => {
    if (opsScope.live) {
      try {
        const lines = cart.map((i) => ({
          inventoryItemId: String(i.id),
          qty: i.qty,
          unitPrice: i.price,
        }));
        const saleBody = { 
          arenaId: opsScope.arenaId, 
          lines,
          customer: {
            id: selectedCustomer.id || selectedCustomer._id,
            name: selectedCustomer.name,
            phone: selectedCustomer.phone
          }
        };
        const { sale } =
          opsScope.channel === 'arena'
            ? await createArenaAdminPosSale(saleBody)
            : await createAdminPosSale(saleBody);
        setLastOrder({
          items: [...cart],
          subtotal,
          tax,
          total: currentTotal,
          orderId: sale?.id ? `POS-${sale.id}` : `AMM-${Date.now()}`,
          date: new Date().toLocaleString(),
          paymentMethod: method,
          customer: selectedCustomer,
          cashReceived: method === 'CASH' ? Number(cashTendered) : currentTotal,
          change: method === 'CASH' ? Number(cashTendered) - currentTotal : 0,
        });
        setCart([]);
        fetchHistory();
        setShowPaymentModal(false);
        setShowReceipt(true);
        setCashTendered('');
        await refetchCatalog();
      } catch (e) {
        alert(e.message || 'Sale could not be recorded');
        setShowPaymentModal(false);
      }
      return;
    }
    setLastOrder({
      items: [...cart],
      subtotal,
      tax,
      total: currentTotal,
      orderId: `AMM-${Date.now()}`,
      date: new Date().toLocaleString(),
      paymentMethod: method,
      customer: selectedCustomer,
      cashReceived: method === 'CASH' ? Number(cashTendered) : currentTotal,
      change: method === 'CASH' ? Number(cashTendered) - currentTotal : 0
    });
    setCart([]);
    fetchHistory();
    setShowPaymentModal(false);
    setShowReceipt(true);
    setCashTendered('');
  };

  const handlePrint = () => {
    window.print();
  };

  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));

  const filteredItems = catalogItems.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      String(item.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="font-sans text-[#36454F] max-w-[1600px] mx-auto border-t border-slate-100">
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-160px)]">
        
        {/* Left: Product Selection (High Density Grid) */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 bg-white">
          
          {/* Header & Categories (Sharp Edges) */}
          <div className="p-4 md:p-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl font-oswald font-black text-[#36454F] uppercase tracking-wide">Terminal POS</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                     <div className="w-2 h-2 rounded-full bg-green-500" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Station #01</p>
                  </div>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-sm ml-4">
                  <button 
                    onClick={() => setView('CATALOG')}
                    className={`px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                      view === 'CATALOG' 
                        ? 'bg-white text-[#CE2029] shadow-sm' 
                        : 'text-slate-400 hover:text-[#36454F]'
                    }`}
                  >
                    <Package size={14} /> Catalog
                  </button>
                  <button 
                    onClick={() => setView('HISTORY')}
                    className={`px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                      view === 'HISTORY' 
                        ? 'bg-white text-[#CE2029] shadow-sm' 
                        : 'text-slate-400 hover:text-[#36454F]'
                    }`}
                  >
                    <History size={14} /> History
                  </button>
                </div>
              </div>
              
              {view === 'CATALOG' && (
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-sm border border-slate-200">
                  {categoryOptions.map((cat) => (
                    <button 
                      key={cat} 
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
                        cat === selectedCategory 
                          ? 'bg-[#36454F] text-white shadow-sm' 
                          : 'text-slate-400 hover:text-[#36454F] hover:bg-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user?.role === 'SUPER_ADMIN' && isApiConfigured() && getAuthToken() && !opsScope.live ? (
              <div className="mb-4 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-950 flex items-center justify-between">
                <span>
                  Live POS catalog: Select an arena to sell from API inventory.
                </span>
                <select 
                  className="ml-4 bg-white border border-amber-300 rounded-sm px-2 py-1 outline-none text-[10px] font-bold"
                  onChange={(e) => {
                    const id = e.target.value;
                    if (id) {
                      setSearchParams({ arenaId: id });
                    }
                  }}
                  value={arenaIdFromQuery || ''}
                >
                  <option value="">Select Arena...</option>
                  {arenas.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            ) : user?.role === 'SUPER_ADMIN' && opsScope.live ? (
              <div className="mb-4 rounded-sm border border-green-200 bg-green-50 px-3 py-2 text-[10px] font-semibold text-green-950 flex items-center justify-between">
                <span>
                  Live POS Mode: Selling for <span className="font-black uppercase">{arenas.find(a => a.id === opsScope.arenaId)?.name || 'Selected Arena'}</span>
                </span>
                <button 
                  onClick={() => setSearchParams({})}
                  className="text-[#CE2029] hover:underline uppercase text-[9px] font-black"
                >
                  Switch Arena
                </button>
              </div>
            ) : null}

            {/* Search Bar / Refresh History (Sharp Edges) */}
            <div className="relative">
              {view === 'CATALOG' ? (
                <>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={14} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search catalog (Name, SKU, Category)..."
                    className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 focus:border-[#36454F] outline-none text-[12px] font-bold text-[#36454F] transition-all placeholder:text-slate-300 rounded-sm"
                  />
                </>
              ) : (
                <div className="flex items-center justify-between h-10 px-3 bg-slate-50 border border-slate-200 rounded-sm">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Showing recent 100 transactions</p>
                   <button 
                    onClick={fetchHistory}
                    className="text-[#CE2029] hover:text-black transition-colors"
                   >
                     <RefreshCw size={14} className={isLoadingHistory ? 'animate-spin' : ''} />
                   </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Grid / History List (Compact High-Density) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 content-start">
            {view === 'CATALOG' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                <AnimatePresence>
                  {filteredItems.map((item, i) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ borderColor: '#CE2029', scale: 0.99 }}
                      onClick={() => addToCart(item)}
                      className={`flex flex-col group bg-white p-3 cursor-pointer border transition-all relative rounded-sm shadow-sm ${
                        cart.find(c => c.id === item.id) 
                          ? 'border-[#CE2029] ring-1 ring-[#CE2029]' 
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black tracking-widest text-[#CE2029] uppercase">
                           {item.category.slice(0, 3)}
                        </span>
                        <span className="text-[9px] font-bold text-slate-300">#{item.sku}</span>
                      </div>

                      <h3 className="text-[13px] font-bold text-[#36454F] leading-snug mb-2 line-clamp-2 min-h-[2.4rem]">
                        {item.name}
                      </h3>

                      <div className="mt-auto flex items-end justify-between pt-2 border-t border-slate-50">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Stock: {item.stock}</p>
                          <p className="text-[15px] font-oswald font-black text-[#36454F]">
                            <span className="text-[10px] mr-1">OMR</span>{item.price.toFixed(3)}
                          </p>
                        </div>
                        <div className="w-6 h-6 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-[#CE2029] group-hover:text-white transition-colors group-hover:rotate-45">
                          <Plus size={12} strokeWidth={3} />
                        </div>
                      </div>
                      
                      {cart.find(c => c.id === item.id) && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#CE2029] text-white flex items-center justify-center text-[9px] font-black shadow-md">
                          {cart.find(c => c.id === item.id).qty}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-3">
                {isLoadingHistory ? (
                  <div className="py-20 text-center">
                     <RefreshCw className="animate-spin text-slate-300 mx-auto mb-4" size={32} />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Vault...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                     <History size={48} className="mx-auto mb-4 text-slate-300" />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No transactions recorded</p>
                  </div>
                ) : (
                  <div className="grid divide-y divide-slate-100 bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                    {history.map((sale) => (
                      <Link 
                        key={sale.id} 
                        to={`/arena/sales/${sale.id}`}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group border-b border-slate-100 last:border-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-sm bg-slate-100 flex items-center justify-center text-[#36454F] group-hover:bg-[#CE2029]/10 group-hover:text-[#CE2029] transition-colors font-black text-[9px]">
                             POS
                           </div>
                           <div>
                             <p className="text-[11px] font-black text-[#36454F] uppercase tracking-tight">#{sale.id.slice(-8)}</p>
                             <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 mt-0.5">
                               <Clock size={10} />
                               {new Date(sale.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                             </div>
                           </div>
                        </div>
                        
                        <div className="flex flex-col">
                           <p className="text-[10px] font-black text-[#36454F] uppercase">{sale.customer?.name || 'Walk-in'}</p>
                           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{sale.customer?.phone || 'No Phone'}</p>
                        </div>

                        <div className="text-right">
                           <p className="text-[14px] font-oswald font-black text-[#CE2029]">OMR {Number(sale.totalAmount).toFixed(3)}</p>
                           <p className="text-[8px] font-black uppercase text-slate-300 tracking-[0.2em] mt-0.5">Settle Success</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Checkout Sidebar (High Contrast Billing) */}
        <div className="w-full lg:w-[380px] shrink-0 bg-[#F8F9FA] flex flex-col">
          
          {/* Billing Info (Sharp) */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#36454F] flex items-center gap-2 mb-3">
              <Receipt size={14} className="text-[#CE2029]" /> Current Billing
            </h3>
            <div 
              onClick={() => setShowCustomerModal(true)}
              className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-sm group cursor-pointer hover:border-[#CE2029]/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-white border border-slate-200 flex items-center justify-center text-[#36454F] group-hover:bg-[#CE2029] group-hover:text-white transition-colors">
                  <User size={16} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-[#36454F] tracking-wide uppercase">{selectedCustomer.name}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                     {selectedCustomer.id} {selectedCustomer.phone && `• ${selectedCustomer.phone}`}
                   </p>
                </div>
              </div>
              <button className="p-1.5 text-slate-300 group-hover:text-[#CE2029] transition-colors"><ArrowUpRight size={14} /></button>
            </div>
          </div>

          {/* Cart Items (Data-Dense List) */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 min-h-[150px]">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-black text-[#36454F] truncate leading-tight uppercase font-oswald">{item.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">OMR {item.price.toFixed(3)} • SKU: {item.sku}</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm bg-white border border-slate-200 shadow-sm transition-all group-hover:border-[#CE2029]/30">
                     <button onClick={() => updateQty(item.id, -1)} className="p-0.5 hover:text-red-500 text-slate-300"><Minus size={11} strokeWidth={4} /></button>
                     <span className="text-[11px] font-black w-4 text-center text-[#36454F]">{item.qty}</span>
                     <button onClick={() => addToCart(item)} className="p-0.5 hover:text-[#CE2029] text-slate-300"><Plus size={11} strokeWidth={4} /></button>
                  </div>
                  
                  <div className="text-right min-w-[65px]">
                    <p className="text-[13px] font-oswald font-black text-[#36454F]">{(item.price * item.qty).toFixed(3)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-all ml-1">
                    <Trash2 size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-10 opacity-30">
                <ShoppingBag size={24} className="text-[#36454F] mb-2" />
                <p className="text-[9px] font-black text-[#36454F] uppercase tracking-widest">No Items Selected</p>
              </div>
            )}
          </div>

          {/* Checkout (Clean Modern POS) */}
          <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div className="space-y-2 mb-6 text-[10px] font-black uppercase tracking-widest">
               <div className="flex justify-between items-center text-slate-400">
                  <span>Gross Total</span>
                  <span className="text-slate-600 font-bold">OMR {subtotal.toFixed(3)}</span>
               </div>
               <div className="flex justify-between items-center text-slate-400">
                  <span>Regional Tax (18%)</span>
                  <span className="text-slate-600 font-bold">OMR {tax.toFixed(3)}</span>
               </div>
               <div className="h-px bg-slate-50 my-2" />
               <div className="flex justify-between items-end pt-1">
                  <div>
                    <span className="text-[#CE2029] text-[12px] block mb-1">Total Receivable</span>
                    <p className="text-[8px] text-slate-300 normal-case tracking-normal font-sans">Inclusive of all local taxes and service fees</p>
                  </div>
                  <p className="text-3xl font-oswald font-black text-[#36454F]">
                    <span className="text-xs mr-1 opacity-40 font-bold uppercase tracking-widest">OMR</span>
                    {currentTotal.toFixed(3)}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button 
                disabled={cart.length === 0}
                onClick={handleCheckoutInitiate}
                className={`w-full py-4 rounded-sm flex items-center justify-center gap-2 transition-all font-black text-[12px] uppercase tracking-[0.2em] relative overflow-hidden ${
                  cart.length > 0 
                    ? 'bg-[#36454F] text-white hover:bg-black shadow-lg shadow-black/10' 
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                }`}
              >
                <CheckCircle2 size={16} /> Finalize Settle <ArrowRight size={14} className="ml-1" />
              </button>
              
              <div className="flex items-center justify-center gap-6 text-[9px] font-black tracking-widest uppercase text-slate-300 opacity-60">
                 <p>Cash</p>
                 <p>Card</p>
                 <p>UPI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      <AnimatePresence>
        {showCustomerModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCustomerModal(false)} className="absolute inset-0 bg-[#36454F]/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-100 bg-[#36454F] text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold uppercase italic tracking-tight">Select Member</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#CE2029]/80 mt-1">Associate checkout with a registered customer</p>
                  </div>
                  <button onClick={() => setShowCustomerModal(false)} className="text-white/40 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search by name, phone or email..."
                    value={customerQuery}
                    onChange={e => setCustomerQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 bg-white/10 border border-white/10 rounded-sm text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:bg-white/20 transition-all"
                  />
                  {isSearchingCustomers && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                       <RefreshCw className="animate-spin text-[#CE2029]" size={14} />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 max-h-[400px] overflow-y-auto space-y-2 bg-slate-50">
                 {isAddingWalkin ? (
                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-lg border-2 border-[#CE2029] shadow-lg space-y-4">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-[#36454F] mb-2 flex items-center gap-2">
                        <UserPlus size={14} className="text-[#CE2029]" /> Customer Details
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Full Name</label>
                          <input 
                            autoFocus
                            type="text" 
                            placeholder="Enter Customer Name"
                            value={walkinForm.name}
                            onChange={e => setWalkinForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold focus:border-[#36454F] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Phone Number</label>
                          <input 
                            type="text" 
                            placeholder="e.g. +91 99999 00000"
                            value={walkinForm.phone}
                            onChange={e => setWalkinForm(p => ({ ...p, phone: e.target.value }))}
                            className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold focus:border-[#36454F] outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => setIsAddingWalkin(false)}
                          className="flex-1 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          disabled={!walkinForm.name}
                          onClick={() => {
                            setSelectedCustomer({ 
                              name: walkinForm.name, 
                              id: 'GUEST-' + Date.now().toString().slice(-4), 
                              phone: walkinForm.phone || 'N/A' 
                            });
                            setShowCustomerModal(false);
                            setIsAddingWalkin(false);
                          }}
                          className={`flex-[2] py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest text-white transition-all ${
                            walkinForm.name ? 'bg-[#36454F] hover:bg-black' : 'bg-slate-200'
                          }`}
                        >
                          Confirm Guest
                        </button>
                      </div>
                   </motion.div>
                 ) : (
                   <button 
                    onClick={() => setIsAddingWalkin(true)}
                    className={`w-full p-4 flex items-center justify-between bg-white border rounded-lg transition-all group hover:border-[#CE2029]/60 hover:shadow-md`}
                   >
                      <div className="flex items-center gap-4 text-left">
                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors bg-slate-100 text-[#36454F] group-hover:bg-[#CE2029] group-hover:text-white`}>
                            <User size={20} />
                         </div>
                         <div>
                            <p className="text-[13px] font-black uppercase text-[#36454F]">Walk-in Customer</p>
                            <p className="text-[9px] font-bold text-slate-400 tracking-widest">Capture details for guest checkout</p>
                         </div>
                      </div>
                      <PlusCircle size={18} className="text-slate-200 group-hover:text-[#CE2029]" />
                   </button>
                 )}

                 <div className="h-px bg-slate-200 my-4 flex items-center justify-center">
                    <span className="bg-slate-50 px-3 text-[8px] font-black text-slate-300 uppercase tracking-widest">Database Results</span>
                 </div>

                 {customerResults.length === 0 && customerQuery.length >= 2 && !isSearchingCustomers && (
                   <div className="py-10 text-center opacity-40">
                      <p className="text-[10px] font-black uppercase tracking-widest">No matching members found</p>
                   </div>
                 )}

                 {customerResults.map(c => (
                   <button key={c.id} onClick={() => { setSelectedCustomer(c); setShowCustomerModal(false); }}
                     className={`w-full p-4 flex items-center justify-between bg-white border rounded-lg transition-all group ${
                       selectedCustomer.id === c.id ? 'border-[#CE2029] shadow-md' : 'border-slate-100 hover:border-[#CE2029]/40'
                     }`}>
                      <div className="flex items-center gap-4 text-left">
                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                           selectedCustomer.id === c.id ? 'bg-[#CE2029] text-white' : 'bg-slate-100 text-[#36454F] group-hover:bg-[#CE2029]/10 group-hover:text-[#CE2029]'
                         }`}>
                            <User size={20} />
                         </div>
                         <div>
                            <p className="text-[13px] font-black uppercase text-[#36454F]">{c.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 tracking-widest">{c.email} • {c.phone || 'NO PHONE'}</p>
                         </div>
                      </div>
                      {selectedCustomer.id === c.id ? <CheckCircle2 size={16} className="text-[#CE2029]" /> : <ChevronRight size={16} className="text-slate-200 group-hover:text-[#CE2029]" />}
                   </button>
                 ))}

                 {customerQuery.length < 2 && (
                   <div className="py-10 text-center opacity-30">
                      <p className="text-[9px] font-black uppercase tracking-widest">Type to search existing members</p>
                   </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Selection Modal (Proper Workflow) */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentModal(false)} className="absolute inset-0 bg-[#36454F]/95 backdrop-blur-md" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl p-8">
              
              {paymentStage === 'METHOD_SELECT' && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#CE2029]/5 flex items-center justify-center text-[#CE2029] mx-auto mb-4 border border-[#CE2029]/10">
                    <CreditCard size={32} />
                  </div>
                  <h3 className="text-2xl font-black uppercase italic font-oswald text-[#36454F]">Select Method</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-8">Payable: <span className="text-[#36454F]">OMR {currentTotal.toFixed(3)}</span></p>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'CASH', label: 'Cash Payment', sub: 'Traditional physical currency' },
                      { id: 'CARD', label: 'Card / Terminal', sub: 'Swipe, Chip or Tap to pay' },
                      { id: 'UPI', label: 'UPI / Digital', sub: 'Instant mobile app transfer' }
                    ].map(m => (
                      <button key={m.id} onClick={() => startPaymentFlow(m.id)}
                        className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-[#36454F] hover:text-white transition-all text-left flex items-center justify-between group">
                          <div>
                            <p className="text-[12px] font-black uppercase tracking-tight">{m.label}</p>
                            <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{m.sub}</p>
                          </div>
                          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentStage === 'CASH_ENTRY' && (
                <div className="text-center">
                   <h3 className="text-2xl font-black uppercase italic font-oswald text-[#36454F] mb-6">Cash Tendering</h3>
                   <div className="space-y-4">
                      <div className="text-left">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Amount Received (OMR)</label>
                        <input 
                          autoFocus
                          type="number" 
                          value={cashTendered}
                          onChange={e => setCashTendered(e.target.value)}
                          placeholder="0.000"
                          className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-2xl font-black text-[#36454F] focus:border-[#CE2029] outline-none transition-all"
                        />
                      </div>

                      {Number(cashTendered) >= currentTotal && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase text-green-600">Balance to Return</span>
                           <span className="text-xl font-black text-green-700">OMR {(Number(cashTendered) - currentTotal).toFixed(3)}</span>
                        </motion.div>
                      )}

                      <button 
                        disabled={Number(cashTendered) < currentTotal}
                        onClick={() => finalizeTransaction('CASH')}
                        className={`w-full py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] transition-all ${
                          Number(cashTendered) >= currentTotal 
                          ? 'bg-[#36454F] text-white hover:bg-black' 
                          : 'bg-slate-100 text-slate-300'
                        }`}
                      >
                        Confirm & Settle
                      </button>
                      <button onClick={() => setPaymentStage('METHOD_SELECT')} className="text-[9px] font-black uppercase tracking-widest text-[#CE2029]">Go Back</button>
                   </div>
                </div>
              )}

              {paymentStage === 'PROCESSING' && (
                <div className="text-center py-10">
                   <div className="relative w-20 h-20 mx-auto mb-8">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute inset-0 border-4 border-[#CE2029]/10 border-t-[#CE2029] rounded-full" />
                      <div className="absolute inset-0 flex items-center justify-center text-[#CE2029]">
                         <CreditCard size={32} />
                      </div>
                   </div>
                   <h3 className="text-xl font-black uppercase italic font-oswald text-[#36454F]">Contacting Terminal...</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Requesting authorization for OMR {currentTotal.toFixed(3)}</p>
                </div>
              )}

              {paymentStage === 'UPI_QR' && (
                <div className="text-center">
                   <h3 className="text-2xl font-black uppercase italic font-oswald text-[#36454F] mb-6">Scan to Pay</h3>
                   <div className="w-48 h-48 bg-white border-2 border-slate-100 p-2 rounded-2xl mx-auto mb-6 relative group">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=arena@upi&pn=ArenaSports&am=${currentTotal}&cu=OMR`} alt="QR" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CE2029] animate-pulse">Waiting for Payment Confirmation</p>
                   <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-2 mb-8">Dynamic QR Generated for Station #01</p>
                   
                   <button onClick={() => finalizeTransaction('UPI')} className="w-full py-4 bg-[#36454F] text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all">
                      I've scanned the payment
                   </button>
                   <button onClick={() => setPaymentStage('METHOD_SELECT')} className="text-[9px] font-black uppercase tracking-widest text-[#CE2029] mt-4">Cancel & Go Back</button>
                </div>
              )}

              {paymentStage === 'METHOD_SELECT' && (
                <button onClick={() => setShowPaymentModal(false)} className="w-full mt-6 text-[10px] font-black uppercase tracking-widest text-[#CE2029] hover:opacity-70">
                  Cancel Checkout
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && lastOrder && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReceipt(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl p-10 text-[#36454F]">
              
              <div className="text-center mb-6">
                 <div className="w-16 h-16 rounded-full bg-green-50 border-4 border-white shadow-xl flex items-center justify-center text-green-500 mx-auto mb-4 scale-110">
                    <CheckCircle2 size={32} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-2xl font-black uppercase tracking-tight italic font-oswald">Order Fulfilled</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Transaction: {lastOrder.orderId} • {lastOrder.paymentMethod}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6 font-mono text-[11px] space-y-4">
                 <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                    <div>
                       <p className="font-bold uppercase mb-1">CUSTOMER</p>
                       <p className="text-slate-500">{lastOrder.customer.name}</p>
                       <p className="text-[9px] opacity-60">ID: {lastOrder.customer.id}</p>
                       <p className="text-[9px] opacity-60">PH: {lastOrder.customer.phone || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold uppercase mb-1">METHOD</p>
                       <span className="px-2 py-0.5 bg-[#36454F] text-white text-[9px] font-bold rounded-sm">{lastOrder.paymentMethod}</span>
                    </div>
                 </div>

                 <div className="space-y-2 py-2">
                    {lastOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                         <span className="flex-1 pr-4">{item.qty}x {item.name}</span>
                         <span className="font-bold">{(item.price * item.qty).toFixed(3)}</span>
                      </div>
                    ))}
                 </div>
                 
                 <div className="h-px bg-slate-200 my-2" />
                 <div className="flex justify-between italic opacity-60">
                    <span>Subtotal</span>
                    <span>{lastOrder.subtotal.toFixed(3)}</span>
                 </div>
                 <div className="flex justify-between italic opacity-60">
                    <span>Tax (18%)</span>
                    <span>{lastOrder.tax.toFixed(3)}</span>
                 </div>
                 
                 {lastOrder.paymentMethod === 'CASH' && (
                    <div className="space-y-1 py-1 border-t border-slate-100">
                       <div className="flex justify-between text-slate-400">
                          <span>Received Cash</span>
                          <span>{lastOrder.cashReceived.toFixed(3)}</span>
                       </div>
                       <div className="flex justify-between text-green-600 font-bold">
                          <span>Change Returned</span>
                          <span>{lastOrder.change.toFixed(3)}</span>
                       </div>
                    </div>
                 )}

                 <div className="flex justify-between text-base font-black border-t-2 border-slate-200 pt-3 text-[#CE2029]">
                    <span>PAID TOTAL</span>
                    <span>{lastOrder.total.toFixed(3)}</span>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <button onClick={handlePrint} className="w-full py-4 bg-[#36454F] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl">
                    <Receipt size={18} /> Print Thermal Receipt
                 </button>
                 <button onClick={() => setShowReceipt(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all font-bold">
                    Start New Transaction
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RetailPOS;
