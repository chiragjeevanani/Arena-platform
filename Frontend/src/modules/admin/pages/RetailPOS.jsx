import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Search, ShoppingCart, User, Plus, Minus, Trash2, CheckCircle2, Ticket, Receipt, ChevronRight } from 'lucide-react';

const ITEMS = [
  { id: 1, name: 'Yonex Mavis 350 (Y)', price: 1.200, category: 'Equipment' },
  { id: 2, name: 'Grip Wrap (Blue)', price: 0.450, category: 'Accessories' },
  { id: 3, name: 'Gatorade Blue (500ml)', price: 0.600, category: 'Drinks' },
  { id: 4, name: 'Stringing Service', price: 3.500, category: 'Services' },
  { id: 5, name: 'RedBull (250ml)', price: 1.250, category: 'Drinks' },
  { id: 6, name: 'Shuttlecock Box (10x)', price: 11.000, category: 'Equipment' },
];

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
    <div className="bg-[#F4F7F6] min-h-full p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto h-auto lg:h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-5 lg:gap-6">
        
        {/* Left: Product Selection */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100 text-[#eb483f]">
                <ShoppingCart size={20} />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-[#1a2b3c] tracking-tight">Point of Sale</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#eb483f] animate-pulse" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Terminal</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide w-full md:w-auto">
              {['All', 'Equipment', 'Drinks', 'Accessories', 'Services'].map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2 rounded-lg text-[13px] font-bold transition-all border ${
                    cat === selectedCategory 
                      ? 'bg-white border-[#eb483f] text-[#eb483f] shadow-[0_4px_10px_rgba(235,72,63,0.15)]' 
                      : 'bg-white border-slate-200 text-[#243B53] hover:border-[#eb483f]/50 hover:text-[#eb483f] shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="w-full py-3.5 pl-11 pr-5 rounded-xl text-sm font-medium transition-all outline-none bg-white border border-slate-200 text-[#1a2b3c] placeholder:text-slate-400 focus:border-[#eb483f] shadow-sm"
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto px-1 pt-1 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6 content-start items-stretch">
            {filteredItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(item)}
                className={`p-3 md:p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between group overflow-hidden ${
                  cart.find(c => c.id === item.id)
                    ? 'bg-white border-2 border-[#eb483f] shadow-md shadow-[#eb483f]/10'
                    : 'bg-white border-2 border-slate-200 hover:border-[#eb483f]/50 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[8px] font-bold uppercase tracking-wider text-slate-500">
                      {item.category.slice(0, 3)}
                    </span>
                    {item.category === 'Equipment' && <div className="w-1.5 h-1.5 rounded-full bg-[#eb483f]" />}
                  </div>
                  <h3 className="font-extrabold text-[#1a2b3c] text-[14px] leading-tight mb-0.5 group-hover:text-[#eb483f] transition-colors">{item.name}</h3>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Price</span>
                     <span className="text-base font-black text-[#1a2b3c] leading-none mt-0.5">OMR {item.price.toFixed(3)}</span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-[#eb483f]/5 border border-[#eb483f]/10 flex items-center justify-center text-[#eb483f] group-hover:bg-[#eb483f] group-hover:text-white group-hover:border-[#eb483f] transition-all shadow-sm hover:scale-105 active:scale-95">
                    <Plus size={14} strokeWidth={3} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Checkout Sidebar */}
        <div className="w-full lg:w-[400px] h-auto lg:h-[calc(100vh-140px)] flex flex-col rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden shrink-0 transition-all hover:border-[#eb483f]/40">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-extrabold text-[#1a2b3c] text-[13px] flex items-center gap-2">
              <ShoppingCart size={14} className="text-[#eb483f]" /> CURRENT BASKET
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-[#eb483f]/10 text-[#eb483f]">
                {cart.reduce((sum, i) => sum + i.qty, 0)} Items
              </span>
              <button 
                onClick={() => setCart([])} 
                className="text-slate-400 hover:text-[#FF4B4B] transition-colors p-1"
                title="Clear Basket"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-3 mx-4 mt-4 rounded-xl border border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1a2b3c] uppercase">Guest Customer</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Walk-in Client</p>
              </div>
            </div>
            <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-[#eb483f] hover:border-slate-300 transition-all shadow-sm">
               <Plus size={14} />
            </button>
          </div>

          {/* Cart List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 mt-1 space-y-1 min-h-0">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100 group"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[13px] font-bold text-[#1a2b3c] truncate leading-tight">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">OMR {item.price.toFixed(3)} / each</p>
                  </div>
                  
                  <div className="flex items-center gap-2 px-1 py-0.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                     {item.qty > 1 ? (
                       <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:text-[#FF4B4B] text-slate-500 transition-colors"><Minus size={10} strokeWidth={3} /></button>
                     ) : (
                       <button onClick={() => removeFromCart(item.id)} className="p-1 hover:text-[#FF4B4B] text-[#eb483f] transition-colors"><Trash2 size={10} strokeWidth={2.5} /></button>
                     )}
                     <span className="text-[11px] font-bold w-4 text-center text-[#1a2b3c]">{item.qty}</span>
                     <button onClick={() => addToCart(item)} className="p-1 hover:text-[#eb483f] text-slate-500 transition-colors"><Plus size={10} strokeWidth={3} /></button>
                  </div>
                  
                  <div className="text-right min-w-[50px] font-black text-[13px] text-[#1a2b3c]">
                    OMR {(item.price * item.qty).toFixed(3)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
                <ShoppingCart size={32} className="text-slate-400 mb-3" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Basket Empty</p>
                <p className="text-[10px] text-slate-400 mt-1">Tap products to add them here</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50 space-y-3">
            <div className="space-y-1.5">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-[#1a2b3c]">OMR {subtotal.toFixed(3)}</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-200">
                  <span>Tax Reconciliation (18%)</span>
                  <span className="text-[#1a2b3c]">OMR {tax.toFixed(3)}</span>
               </div>
               <div className="flex justify-between items-baseline pt-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#eb483f]">Total Due</span>
                  <p className="text-2xl font-black text-[#1a2b3c]">OMR {total.toFixed(3)}</p>
               </div>
            </div>

            <button 
              disabled={cart.length === 0}
              className={`w-full py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all font-bold text-[13px] uppercase tracking-widest shadow-sm ${
                cart.length > 0 
                  ? 'bg-[#eb483f] border border-[#eb483f] text-white shadow-[#eb483f]/20 hover:shadow-[#eb483f]/30 hover:-translate-y-0.5' 
                  : 'bg-white border border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 size={16} /> Settle Payment
            </button>
            
            <div className="flex items-center justify-center gap-6 text-[10px] font-bold tracking-widest uppercase pb-1 text-slate-400">
               <p>UPI</p>
               <p>CARD</p>
               <p>CASH</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailPOS;



