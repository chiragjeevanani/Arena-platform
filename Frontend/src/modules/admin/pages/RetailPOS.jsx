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
    <div className="h-auto lg:h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4 md:gap-6">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className={`w-7 h-7 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg transition-colors ${isDark ? 'bg-[#0A1F44] border border-white/5 text-[#22FF88]' : 'bg-white border border-black/5 text-[#22FF88]'}`}>
              <ShoppingCart size={14} className="md:w-[24px] md:h-[24px]" />
            </div>
            <div>
              <h2 className={`text-sm md:text-xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Marketplace</h2>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#22FF88] animate-pulse" />
                <p className={`text-[7px] md:text-[10px] font-bold uppercase tracking-widest opacity-30 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Live</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide max-w-[150px] md:max-w-none">
            {['All', 'Gear', 'Drinks'].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat === 'Gear' ? 'Equipment' : cat)}
                className={`whitespace-nowrap px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[7px] md:text-[10px] font-black uppercase tracking-widest transition-all border ${
                  (cat === 'Gear' ? 'Equipment' : cat) === selectedCategory 
                    ? 'bg-[#22FF88] border-[#22FF88] text-[#0A1F44]' 
                    : isDark ? 'border-white/5 bg-white/5 text-white/30 hover:text-white' : 'border-black/5 bg-black/5 text-black/30 hover:text-black shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Professional Search */}
        <div className="relative mb-3 md:mb-4">
          <Search size={12} className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/20' : 'text-black/20'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className={`w-full py-2 md:py-4 pl-9 md:pl-14 pr-4 md:pr-6 rounded-lg md:rounded-2xl text-[10px] md:text-[13px] font-medium transition-all outline-none border ${
              isDark 
                ? 'bg-[#0A1F44]/40 border-white/5 focus:border-[#22FF88]/40 text-white placeholder:text-white/20' 
                : 'bg-white border-black/5 focus:border-[#22FF88] text-[#0A1F44] shadow-sm'
            }`}
          />
        </div>

        {/* Professional Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 md:gap-4 pb-4 scrollbar-hide min-h-0">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(item)}
              className={`p-2.5 md:p-5 rounded-lg md:rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden ${
                isDark 
                  ? 'bg-[#0A1F44]/40 border-white/5 hover:border-[#22FF88]/40' 
                  : 'bg-white border-black/5 hover:border-[#22FF88] shadow-sm'
              }`}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2 md:mb-4">
                  <span className={`px-1.5 md:px-2 py-0.5 rounded-md md:rounded-lg text-[6px] md:text-[8px] font-black uppercase tracking-widest ${
                    isDark ? 'bg-white/5 text-white/30' : 'bg-black/5 text-black/30'
                  }`}>
                    {item.category.slice(0, 3)}
                  </span>
                  {item.category === 'Equipment' && <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#FFD600]" />}
                </div>
                <h3 className={`font-bold text-[10px] md:text-[13px] leading-tight mb-1 group-hover:text-[#22FF88] transition-colors ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.name}</h3>
              </div>

              <div className="mt-2 md:mt-4 flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                   <span className={`text-[6px] md:text-[10px] font-medium opacity-30 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>MRP</span>
                   <span className={`text-[10px] md:text-lg font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{item.price}</span>
                </div>
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-[#0A1F44] shadow-sm'
                } group-hover:bg-[#22FF88] group-hover:text-[#0A1F44] group-hover:border-transparent`}>
                  <Plus size={10} className="md:w-[14px] md:h-[14px]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Checkout Sidebar */}
      <div className={`w-full lg:w-[400px] h-auto lg:h-full flex flex-col rounded-2xl md:rounded-[2.5rem] border overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#0A1F44]/80 border-white/5 shadow-2xl' : 'bg-white border-[#0A1F44]/10 shadow-2xl shadow-blue-900/10'}`}>
        <div className={`p-3 md:p-6 border-b shrink-0 flex items-center justify-between ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
          <h3 className={`font-black font-display uppercase tracking-[0.2em] text-[10px] md:text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Basket</h3>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-[7px] md:text-[10px] font-black uppercase px-2 py-0.5 md:py-1 rounded bg-[#1EE7FF]/10 text-[#1EE7FF]">
              {cart.reduce((sum, i) => sum + i.qty, 0)} Units
            </span>
            <button onClick={() => setCart([])} className={`transition-colors ${isDark ? 'text-white/20 hover:text-[#FF4B4B]' : 'text-[#0A1F44]/20 hover:text-[#FF4B4B]'}`}><Trash2 size={12} className="md:w-[16px] md:h-[16px]" /></button>
          </div>
        </div>

        {/* Customer Info */}
        <div className={`p-2 mx-4 mt-3 md:mt-6 rounded-lg md:rounded-xl border shrink-0 flex items-center justify-between transition-all ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-[#0A1F44]/[0.02] border-[#0A1F44]/5 shadow-sm'}`}>
          <div className="flex items-center gap-2 md:gap-3">
            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-[#0A1F44]/5'}`}>
              <User size={10} className={isDark ? 'text-white' : 'text-[#0A1F44]'} />
            </div>
            <div>
              <p className={`text-[9px] md:text-[11px] font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Guest Client</p>
              <p className={`text-[6px] md:text-[8px] font-bold opacity-30 uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>#C-9901</p>
            </div>
          </div>
          <button className={`p-1 rounded-md md:rounded-lg border transition-all ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-[#0A1F44]/10 hover:bg-black/5'}`}>
             <Plus size={8} className="opacity-40" />
          </button>
        </div>

        {/* Cart List */}
        <div className="flex-1 overflow-y-auto px-4 py-1 mt-3 space-y-0.5 custom-scrollbar min-h-0">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`flex items-center gap-3 py-1.5 px-2 rounded-lg transition-all group ${
                  isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-[#0A1F44]/[0.02]'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className={`text-[10px] font-black truncate leading-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.name}</p>
                  <p className={`text-[8px] font-bold opacity-30 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{item.price.toFixed(0)}</p>
                </div>
                
                <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md ${isDark ? 'bg-black/40' : 'bg-slate-100 shadow-inner'}`}>
                   <button onClick={() => updateQty(item.id, -1)} className="hover:text-[#FF4B4B] transition-colors"><Minus size={8} /></button>
                   <span className={`text-[9px] font-black w-3 text-center ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.qty}</span>
                   <button onClick={() => addToCart(item)} className="hover:text-[#22FF88] transition-colors"><Plus size={8} /></button>
                </div>
                
                <div className={`text-right min-w-[45px] font-black text-[10px] ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                  ₹{(item.price * item.qty).toFixed(0)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-5 py-8">
              <ShoppingCart size={20} />
              <p className="text-[7px] font-black uppercase tracking-widest mt-1">Basket Empty</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className={`p-4 md:p-6 mt-auto border-t space-y-3 md:space-y-4 ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-[#0A1F44]/5 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]'}`}>
          <div className="space-y-1.5 md:space-y-2">
             <div className="flex justify-between items-center text-[8px] md:text-[10px] font-medium uppercase tracking-[0.1em] opacity-30">
                <span className={isDark ? 'text-white' : 'text-[#0A1F44]'}>Subtotal</span>
                <span className={isDark ? 'text-white' : 'text-[#0A1F44]'}>₹{subtotal.toFixed(0)}</span>
             </div>
             <div className="flex justify-between items-center text-[8px] md:text-[10px] font-medium uppercase tracking-[0.1em] opacity-30 pb-1.5 border-b border-white/5">
                <span className={isDark ? 'text-white' : 'text-[#0A1F44]'}>Tax (18%)</span>
                <span className={isDark ? 'text-white' : 'text-[#0A1F44]'}>₹{tax.toFixed(0)}</span>
             </div>
             <div className="flex justify-between items-baseline pt-1">
                <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] ${isDark ? 'text-[#1EE7FF]' : 'text-blue-600'}`}>Total</span>
                <p className={`text-xl md:text-2xl font-black font-display leading-none ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{total.toLocaleString()}</p>
             </div>
          </div>

          <button 
            disabled={cart.length === 0}
            className={`w-full py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all font-black text-[9px] md:text-[11px] uppercase tracking-[0.1em] md:tracking-[0.15em] border ${
              cart.length > 0 
                ? 'bg-[#22FF88] border-[#22FF88] text-[#0A1F44] hover:shadow-[0_10px_30px_rgba(34,255,136,0.3)]' 
                : 'bg-transparent border-white/5 text-white/5 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 size={12} className="md:w-[16px] md:h-[16px]" /> Settlement
          </button>
          
          <div className="flex items-center justify-around opacity-20 text-[6px] md:text-[8px] font-black tracking-widest uppercase">
             {['UPI', 'CARD', 'CASH'].map(method => (
               <p key={method} className={isDark ? 'text-white' : 'text-[#0A1F44]'}>{method}</p>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default RetailPOS;
