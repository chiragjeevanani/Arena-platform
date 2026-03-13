import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Search, ShoppingCart, User, Plus, Minus, Trash2, CheckCircle2, Ticket, Receipt } from 'lucide-react';
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

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-inherit">
          <div>
            <h2 className={`text-2xl font-black font-display tracking-wide flex items-center gap-3 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
              <CreditCard className="text-[#22FF88]" /> Retail Terminal
            </h2>
            <p className={`text-sm mt-1 font-medium italic ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Process merchandise and service sales.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/30 group-focus-within:text-[#22FF88]' : 'text-[#0A1F44]/30 group-focus-within:text-[#22FF88]'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Scan barcode or type name..."
            className={`w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-black transition-all outline-none border ${
              isDark 
                ? 'bg-[#0A1F44]/50 border-white/5 focus:border-[#22FF88]/50 text-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]' 
                : 'bg-white border-[#0A1F44]/10 focus:border-[#22FF88] text-[#0A1F44] shadow-sm placeholder:text-[#0A1F44]/30'
            }`}
          />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-1 scrollbar-hide">
          {ITEMS.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map((item) => (
            <motion.div
              layout
              key={item.id}
              whileHover={{ y: -4 }}
              onClick={() => addToCart(item)}
              className={`p-6 rounded-[2rem] border cursor-pointer transition-all flex flex-col justify-between group ${
                isDark ? 'bg-[#0A1F44]/50 border-white/5 hover:border-[#22FF88]/30 hover:bg-[#0A1F44]' : 'bg-white border-[#0A1F44]/10 hover:shadow-xl hover:border-[#22FF88]'
              }`}
            >
              <div>
                <span className={`text-[9px] font-black uppercase tracking-widest mb-3 block opacity-30 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.category}</span>
                <h3 className={`font-black text-sm leading-tight transition-colors ${isDark ? 'text-white group-hover:text-[#22FF88]' : 'text-[#0A1F44] group-hover:text-[#059669]'}`}>{item.name}</h3>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className={`text-lg font-black font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{item.price}</span>
                <div className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-[#0A1F44]/5 border-black/5 text-[#0A1F44]'} group-hover:bg-[#22FF88] group-hover:text-[#0A1F44] group-hover:border-transparent`}>
                  <Plus size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Checkout Sidebar */}
      <div className={`w-full lg:w-[400px] flex flex-col rounded-[2.5rem] border overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#0A1F44]/80 border-white/5 shadow-2xl' : 'bg-white border-[#0A1F44]/10 shadow-2xl shadow-blue-900/10'}`}>
        <div className={`p-6 border-b shrink-0 flex items-center justify-between ${isDark ? 'border-white/5' : 'border-[#0A1F44]/5'}`}>
          <h3 className={`font-black font-display uppercase tracking-[0.2em] text-sm ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Order Basket</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-[#1EE7FF]/10 text-[#1EE7FF]">{cart.length} Unit(s)</span>
            <button onClick={() => setCart([])} className={`transition-colors ${isDark ? 'text-white/20 hover:text-[#FF4B4B]' : 'text-[#0A1F44]/20 hover:text-[#FF4B4B]'}`}><Trash2 size={16} /></button>
          </div>
        </div>

        {/* Customer Info */}
        <div className={`p-4 mx-4 mt-4 rounded-2xl border flex items-center gap-3 cursor-pointer group transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-[#0A1F44]/5 border-[#0A1F44]/5 hover:bg-[#0A1F44]/10 shadow-inner'}`}>
          <div className="w-10 h-10 rounded-xl bg-[#22FF88]/10 flex items-center justify-center text-[#22FF88]">
            <User size={18} />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Anonymous Client</p>
            <p className={`text-[10px] font-black uppercase tracking-widest opacity-30 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Select Registered User</p>
          </div>
          <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Cart List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center gap-3 p-4 rounded-2xl border ${isDark ? 'bg-white/2 border-white/5' : 'bg-[#0A1F44]/2 border-black/5 shadow-sm'}`}
              >
                <div className="flex-1">
                  <p className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.name}</p>
                  <p className={`text-[10px] font-bold opacity-30 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{item.price} per unit</p>
                </div>
                <div className={`flex items-center gap-3 rounded-xl p-1.5 transition-colors ${isDark ? 'bg-black/20' : 'bg-[#0A1F44]/5'}`}>
                   <button onClick={() => updateQty(item.id, -1)} className={`p-1 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black opacity-30 hover:opacity-100'}`}><Minus size={12} /></button>
                   <span className={`text-[11px] font-black w-4 text-center ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>{item.qty}</span>
                   <button onClick={() => addToCart(item)} className={`p-1 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black opacity-30 hover:opacity-100'}`}><Plus size={12} /></button>
                </div>
                <div className={`text-right min-w-[60px] font-black font-display text-xs ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                  ₹{item.price * item.qty}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 animate-pulse ${isDark ? 'bg-white/5 text-white/10' : 'bg-[#0A1F44]/5 text-[#0A1F44]/10'}`}>
                <ShoppingCart size={40} />
              </div>
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Checkout queue empty</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className={`p-8 space-y-4 border-t ${isDark ? 'border-white/10 bg-black/30' : 'border-[#0A1F44]/10 bg-[#0A1F44]/2'}`}>
          <div className="flex justify-between items-center text-[10px]">
            <span className={`font-black uppercase tracking-[0.2em] flex items-center gap-2 ${isDark ? 'text-white/30' : 'text-[#0A1F44]/30'}`}><Ticket size={14} className="text-[#FFD600]" /> Coupon applied</span>
            <span className="text-[#FFD600] font-black tracking-widest uppercase cursor-pointer hover:underline">Edit Code</span>
          </div>
          <div className="space-y-2 py-2">
            <div className="flex justify-between items-center text-xs">
              <span className={`font-black uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-[#0A1F44]/30'}`}>Direct Items</span>
              <span className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className={`font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-[#0A1F44]/20'}`}>VAT/GST (18%)</span>
              <span className={`font-black opacity-50 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>₹{tax.toFixed(2)}</span>
            </div>
          </div>
          <div className={`flex justify-between items-center pt-4 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
            <span className={`text-base font-black font-display uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Total Value</span>
            <span className="text-3xl font-black font-display text-[#22FF88] drop-shadow-[0_0_10px_rgba(34,255,136,0.2)]">₹{total.toFixed(2)}</span>
          </div>

          <button 
            disabled={cart.length === 0}
            className={`w-full py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl ${
              cart.length > 0 
                ? 'bg-[#22FF88] text-[#0A1F44] hover:bg-white hover:scale-[1.02] shadow-[#22FF88]/20' 
                : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'
            }`}
          >
            <CheckCircle2 size={18} /> Complete Transaction
          </button>
          
          <div className="flex items-center justify-center gap-6 pt-2">
             <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-all cursor-pointer">
                <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>UPI</p>
                <div className="w-1.5 h-1.5 rounded-full bg-[#1EE7FF]" />
             </div>
             <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-all cursor-pointer">
                <CreditCard size={14} className="text-[#FFD600]" />
                <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Card</p>
             </div>
             <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-all cursor-pointer">
                <Receipt size={14} className="text-[#22FF88]" />
                <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Cash</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default RetailPOS;
