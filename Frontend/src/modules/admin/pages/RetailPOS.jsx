import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Search, ShoppingCart, User, Plus, Minus, 
  Trash2, CheckCircle2, Receipt, ChevronRight, 
  Package, Store, Zap, ArrowRight, Tag, ShoppingBag, ArrowUpRight
} from 'lucide-react';

const ITEMS = [
  { id: 1, name: 'Yonex Mavis 350 (Y)', price: 1.200, category: 'Equipment', stock: 42, sku: 'SN-001' },
  { id: 2, name: 'Grip Wrap (Blue)', price: 0.450, category: 'Accessories', stock: 128, sku: 'GR-022' },
  { id: 3, name: 'Gatorade Blue (500ml)', price: 0.600, category: 'Drinks', stock: 24, sku: 'DR-109' },
  { id: 4, name: 'Stringing Service', price: 3.500, category: 'Services', stock: 1, sku: 'SR-005' },
  { id: 5, name: 'RedBull (250ml)', price: 1.250, category: 'Drinks', stock: 18, sku: 'DR-110' },
  { id: 6, name: 'Shuttlecock Box (10x)', price: 11.000, category: 'Equipment', stock: 12, sku: 'SN-112' },
];

const CATEGORIES = ['All', 'Equipment', 'Drinks', 'Accessories', 'Services'];

const RetailPOS = () => {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));

  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const filteredItems = ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="font-sans text-[#1a2b3c] max-w-[1600px] mx-auto border-t border-slate-100">
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-160px)]">
        
        {/* Left: Product Selection (High Density Grid) */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 bg-white">
          
          {/* Header & Categories (Sharp Edges) */}
          <div className="p-4 md:p-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-oswald font-black text-[#1a2b3c] uppercase tracking-wide">Terminal POS</h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-2 h-2 rounded-full bg-green-500" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Station #01</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-sm border border-slate-200">
                {CATEGORIES.map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
                      cat === selectedCategory 
                        ? 'bg-[#1a2b3c] text-white shadow-sm' 
                        : 'text-slate-400 hover:text-[#1a2b3c] hover:bg-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar (Sharp Edges) */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog (Name, SKU, Category)..."
                className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 focus:border-[#1a2b3c] outline-none text-[12px] font-bold text-[#1a2b3c] transition-all placeholder:text-slate-300 rounded-sm"
              />
            </div>
          </div>

          {/* Product Grid (Compact High-Density) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 content-start">
            <AnimatePresence>
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ borderColor: '#eb483f', scale: 0.99 }}
                  onClick={() => addToCart(item)}
                  className={`flex flex-col group bg-white p-3 cursor-pointer border transition-all relative rounded-sm shadow-sm ${
                    cart.find(c => c.id === item.id) 
                      ? 'border-[#eb483f] ring-1 ring-[#eb483f]' 
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black tracking-widest text-[#eb483f] uppercase">
                       {item.category.slice(0, 3)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-300">#{item.sku}</span>
                  </div>

                  <h3 className="text-[13px] font-bold text-[#1a2b3c] leading-snug mb-2 line-clamp-2 min-h-[2.4rem]">
                    {item.name}
                  </h3>

                  <div className="mt-auto flex items-end justify-between pt-2 border-t border-slate-50">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Stock: {item.stock}</p>
                      <p className="text-[15px] font-oswald font-black text-[#1a2b3c]">
                        <span className="text-[10px] mr-1">OMR</span>{item.price.toFixed(3)}
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-[#eb483f] group-hover:text-white transition-colors group-hover:rotate-45">
                      <Plus size={12} strokeWidth={3} />
                    </div>
                  </div>
                  
                  {cart.find(c => c.id === item.id) && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#eb483f] text-white flex items-center justify-center text-[9px] font-black shadow-md">
                      {cart.find(c => c.id === item.id).qty}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Checkout Sidebar (High Contrast Billing) */}
        <div className="w-full lg:w-[380px] shrink-0 bg-[#F8F9FA] flex flex-col">
          
          {/* Billing Info (Sharp) */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#1a2b3c] flex items-center gap-2 mb-3">
              <Receipt size={14} className="text-[#eb483f]" /> Current Billing
            </h3>
            <div className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-white border border-slate-200 flex items-center justify-center text-[#1a2b3c]">
                  <User size={16} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-[#1a2b3c] tracking-wide uppercase">Walk-in Customer</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">New Session</p>
                </div>
              </div>
              <button className="p-1.5 text-slate-300 hover:text-[#eb483f] transition-colors"><ArrowUpRight size={14} /></button>
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
                    <p className="text-[12px] font-black text-[#1a2b3c] truncate leading-tight uppercase font-oswald">{item.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">OMR {item.price.toFixed(3)} • SKU: {item.sku}</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm bg-white border border-slate-200 shadow-sm transition-all group-hover:border-[#eb483f]/30">
                     <button onClick={() => updateQty(item.id, -1)} className="p-0.5 hover:text-red-500 text-slate-300"><Minus size={11} strokeWidth={4} /></button>
                     <span className="text-[11px] font-black w-4 text-center text-[#1a2b3c]">{item.qty}</span>
                     <button onClick={() => addToCart(item)} className="p-0.5 hover:text-[#eb483f] text-slate-300"><Plus size={11} strokeWidth={4} /></button>
                  </div>
                  
                  <div className="text-right min-w-[65px]">
                    <p className="text-[13px] font-oswald font-black text-[#1a2b3c]">{(item.price * item.qty).toFixed(3)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-all ml-1">
                    <Trash2 size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-10 opacity-30">
                <ShoppingBag size={24} className="text-[#1a2b3c] mb-2" />
                <p className="text-[9px] font-black text-[#1a2b3c] uppercase tracking-widest">No Items Selected</p>
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
                    <span className="text-[#eb483f] text-[12px] block mb-1">Total Receivable</span>
                    <p className="text-[8px] text-slate-300 normal-case tracking-normal font-sans">Inclusive of all local taxes and service fees</p>
                  </div>
                  <p className="text-3xl font-oswald font-black text-[#1a2b3c]">
                    <span className="text-xs mr-1 opacity-40 font-bold uppercase tracking-widest">OMR</span>
                    {total.toFixed(3)}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button 
                disabled={cart.length === 0}
                className={`w-full py-4 rounded-sm flex items-center justify-center gap-2 transition-all font-black text-[12px] uppercase tracking-[0.2em] relative overflow-hidden ${
                  cart.length > 0 
                    ? 'bg-[#1a2b3c] text-white hover:bg-black shadow-lg shadow-black/10' 
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
    </div>
  );
};

export default RetailPOS;
