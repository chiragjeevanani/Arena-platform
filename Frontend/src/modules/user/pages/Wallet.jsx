import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { useTheme } from '../context/ThemeContext';

const Wallet = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const transactions = [
    { id: 1, title: 'Arena Booking', date: 'Mar 12, 10:30 AM', amount: -450, type: 'spent' },
    { id: 2, title: 'Cashback Added', date: 'Mar 10, 04:15 PM', amount: 50, type: 'received' },
    { id: 3, title: 'Wallet Topup', date: 'Mar 08, 09:00 AM', amount: 1000, type: 'received' },
    { id: 4, title: 'Coach Booking', date: 'Mar 05, 02:00 PM', amount: -600, type: 'spent' },
  ];

  return (
    <div className={`min-h-screen pb-32 ${'bg-slate-50/50'}`}>
      {/* Header */}
      <div className={`px-4 md:px-6 pt-4 pb-4 md:pt-6 md:pb-6 backdrop-blur-2xl border-b border-white/10 bg-[#eb483f] rounded-b-3xl md:rounded-b-[2rem] shadow-[0_10px_30px_rgba(235,72,63,0.15)]`}>
        <div className="max-w-4xl mx-auto flex items-center gap-3 md:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-sm active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg md:text-xl font-bold font-display text-white tracking-tight uppercase">My Wallet</h1>
        </div>
      </div>

      <div className="px-4 md:px-6 mt-6 md:mt-8 max-w-[500px] md:max-w-4xl mx-auto">
        <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>My Wallet</h3>
        
        {/* Horizontal Balance Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative overflow-hidden p-5 md:p-6 rounded-[24px] shadow-lg flex items-center justify-between ${
            isDark ? 'bg-slate-900 border border-white/5' : 'bg-[#151b29]'
          }`}
        >
          {/* Decorative Pattern Background for the card */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[size:18px_18px]" />
          
          {/* Left Side: Balance info */}
          <div className="relative z-10 pl-1">
            <div className="flex items-center gap-2 mb-2 text-white/50">
              <WalletIcon size={14} className="md:w-4 md:h-4 text-white/60" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em]">Balance</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white font-display flex items-baseline gap-1.5 tracking-tight">
              <span className="text-xl md:text-2xl font-bold opacity-80 text-blue-300">₹</span>1,450
            </h2>
          </div>

          {/* Right Side: Action Buttons Component */}
          <div className="relative z-10 flex flex-col gap-2 w-[90px] md:w-[110px]">
             <button className="w-full bg-[#eb483f] text-white font-bold py-2.5 rounded-xl text-[11px] hover:bg-[#d83f36] active:scale-95 transition-all">
                Top Up
             </button>
             <button className="w-full bg-slate-700 text-white font-bold py-2.5 rounded-xl text-[11px] hover:bg-slate-600 active:scale-95 transition-all">
                History
             </button>
          </div>
        </motion.div>

        {/* Transactions Info Context */}
        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-[0.15em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Recent Transactions</h3>
            <button className="text-[9px] md:text-[10px] font-black uppercase text-blue-500 tracking-wider hover:underline">See All</button>
          </div>

          <div className={`grid grid-cols-1 ${transactions.length > 2 ? 'lg:grid-cols-2' : ''} gap-3 md:gap-4`}>
            {transactions.map((tx, idx) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
                className={`p-4 md:p-5 rounded-2xl md:rounded-[20px] border flex items-center transition-all cursor-pointer ${
                  isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mr-3 md:mr-4 shrink-0 ${
                  tx.type === 'received' 
                    ? ('bg-emerald-50 text-emerald-600') 
                    : ('bg-blue-50/50 text-blue-600')
                }`}>
                  {tx.type === 'received' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h4 className={`font-bold text-sm md:text-base tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{tx.title}</h4>
                  <p className={`text-[10px] font-bold mt-1.5 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Clock size={10} /> {tx.date}
                  </p>
                </div>
                <div className="text-right ml-3 md:ml-4">
                  <p className={`font-black text-sm tracking-tight ${tx.type === 'received' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                    {tx.type === 'received' ? '+' : '-'}₹{Math.abs(tx.amount)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;



