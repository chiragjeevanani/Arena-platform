import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Search, ShoppingCart, User, Plus, Minus, Trash2, CheckCircle2, Ticket, Receipt, ChevronRight } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

const ITEMS = [
  { id: 1, name: 'Yonex Mavis 350 (Y)', price: 120, category: 'Equipment' },
  { id: 2, name: 'Grip Wrap (Blue)', price: 45, category: 'Accessories' },
  { id: 3, name: 'Gatorade Blue (500ml)', price: 60, category: 'Drinks' },
  { id: 4, name: 'Stringing Service', price: 350, category: 'Services' },
  { id: 5, name: 'RedBull (250ml)', price: 125, category: 'Drinks' },
  { id: 6, name: 'Shuttlecock Box (10x)', price: 1100, category: 'Equipment' },
];

const RetailPOS = () => {
  const { isDark } = useTheme();
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
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${isDark ? 'bg-[#0A1F44] border border-white/5 text-[#22FF88]' : 'bg-white border border-black/5 text-[#22FF88]'}`}>
              <ShoppingCart size={24} />
            </div>
            <div>
              <h2 className={`text-xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Marketplace Terminal</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22FF88] animate-pulse" />
                <p className={`text-[10px] font-bold uppercase tracking-widest opacity-40 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Active Inventory Synced</p>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            {['All', 'Equipment', 'Drinks', 'Services'].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  selectedCategory === cat 
                    ? 'bg-[#22FF88] border-[#22FF88] text-[#0A1F44]' 
                    : isDark ? 'border-white/5 bg-white/5 text-white/40 hover:text-white hover:bg-white/10' : 'border-black/5 bg-black/5 text-black/40 hover:text-black hover:bg-black/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Professional Search */}
        <div className="relative mb-6">
          <Search size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, services, or scan barcode..."
            className={`w-full py-4 pl-14 pr-6 rounded-2xl text-[13px] font-medium transition-all outline-none border ${
              isDark 
                ? 'bg-[#0A1F44]/40 border-white/5 focus:border-[#22FF88]/40 text-white placeholder:text-white/20 shadow-inner' 
                : 'bg-white border-black/5 focus:border-[#22FF88] text-[#0A1F44] shadow-sm'
            }`}
          />
        </div>

        {/* Professional Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-6 scrollbar-hide min-h-0">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(item)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden ${
                isDark 
                  ? 'bg-[#0A1F44]/40 border-white/5 hover:border-[#22FF88]/40 hover:bg-[#0A1F44]/60' 
                  : 'bg-white border-black/5 hover:border-[#22FF88] hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] shadow-sm'
              }`}
            >
              {/* Subtle background glow on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#22FF88]/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                    isDark ? 'bg-white/5 text-white/40' : 'bg-black/5 text-black/40'
                  }`}>
                    {item.category}
                  </span>
                  {item.category === 'Equipment' && <div className="w-1.5 h-1.5 rounded-full bg-[#FFD600]" />}
                </div>
                <h3 className={`font-bold text-[13px] leading-tight mb-2 group-hover:text-[#22FF88] transition-colors ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.name}</h3>
              </div>

              <div className="mt-4 flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                  <span className={`text-[10px] font-medium opacity-40 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Unit Price</span>
                  <span className={`text-lg font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{item.price}</span>
                </div>
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-[#0A1F44]'
                } group-hover:bg-[#22FF88] group-hover:text-[#0A1F44] group-hover:border-transparent group-hover:shadow-[0_0_15px_rgba(34,255,136,0.3)]`}>
                  <Plus size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Checkout Sidebar */}
      <div className={`w-full lg:w-[400px] h-full flex flex-col rounded-[2.5rem] border overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#0A1F44]/80 border-white/5 shadow-2xl' : 'bg-white border-[#0A1F44]/10 shadow-2xl shadow-blue-900/10'}`}>
        <div className={`p-6 border-b shrink-0 flex items-center justify-between ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
          <h3 className={`font-black font-display uppercase tracking-[0.2em] text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Order Basket</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-[#1EE7FF]/10 text-[#1EE7FF]">
              {cart.reduce((sum, i) => sum + i.qty, 0)} Unit(s)
            </span>
            <button onClick={() => setCart([])} className={`transition-colors ${isDark ? 'text-white/20 hover:text-[#FF4B4B]' : 'text-[#0A1F44]/20 hover:text-[#FF4B4B]'}`}><Trash2 size={16} /></button>
          </div>
        </div>

        {/* Customer Info */}
        <div className={`p-3 mx-4 mt-6 rounded-xl border shrink-0 flex items-center justify-between transition-all ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-[#0A1F44]/[0.02] border-[#0A1F44]/5'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-[#0A1F44]/5'}`}>
              <User size={14} className={isDark ? 'text-white' : 'text-[#0A1F44]'} />
            </div>
            <div>
              <p className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Guest Client</p>
              <p className={`text-[8px] font-medium opacity-40 uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>#CUST-9901</p>
            </div>
          </div>
          <button className={`p-1.5 rounded-lg border transition-all ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-[#0A1F44]/10 hover:bg-black/5'}`}>
            <Plus size={12} className="opacity-40" />
          </button>
        </div>

        {/* Cart List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 mt-4 space-y-1 custom-scrollbar min-h-0">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-all group ${
                  isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-[#0A1F44]/[0.02]'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className={`text-[11px] font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.name}</p>
                  <p className={`text-[9px] font-medium opacity-40 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{item.price.toFixed(2)}</p>
                </div>
                
                <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${isDark ? 'bg-black/40' : 'bg-slate-100'}`}>
                   <button onClick={() => updateQty(item.id, -1)} className="hover:text-[#FF4B4B] transition-colors"><Minus size={10} /></button>
                   <span className={`text-[10px] font-bold w-4 text-center ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.qty}</span>
                   <button onClick={() => addToCart(item)} className="hover:text-[#22FF88] transition-colors"><Plus size={10} /></button>
                </div>
                
                <div className={`text-right min-w-[55px] font-bold text-[11px] ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                  ₹{(item.price * item.qty).toFixed(0)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-10 py-12">
              <ShoppingCart size={24} />
              <p className="text-[9px] font-black uppercase tracking-widest mt-2">Basket Empty</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className={`p-6 mt-auto border-t space-y-4 ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-[#0A1F44]/5 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]'}`}>
          <div className="space-y-2">
             <div className="flex justify-between items-center">
                <span className={`text-[10px] font-medium uppercase tracking-[0.1em] opacity-40 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Order Subtotal</span>
                <span className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{subtotal.toFixed(0)}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className={`text-[10px] font-medium uppercase tracking-[0.1em] opacity-40 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Tax Component (18%)</span>
                <span className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{tax.toFixed(0)}</span>
             </div>
             <div className="flex justify-between items-center pt-1 border-t border-dashed border-inherit">
                <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${isDark ? 'text-[#1EE7FF]' : 'text-blue-600'}`}>Amount Payable</span>
                <div className="text-right">
                  <p className={`text-2xl font-black font-display leading-none ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{total.toLocaleString()}</p>
                </div>
             </div>
          </div>

          <button 
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all font-black text-[11px] uppercase tracking-[0.15em] border ${
              cart.length > 0 
                ? 'bg-[#22FF88] border-[#22FF88] text-[#0A1F44] hover:shadow-[0_10px_30px_rgba(34,255,136,0.3)] hover:scale-[1.01]' 
                : 'bg-transparent border-white/5 text-white/10 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 size={16} /> Finalize Transaction
          </button>
          
          <div className="flex items-center justify-around opacity-40 grayscale group-hover:grayscale-0 transition-all">
             {['UPI', 'CARD', 'CASH'].map(method => (
               <p key={method} className={`text-[8px] font-black tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{method}</p>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default RetailPOS;
