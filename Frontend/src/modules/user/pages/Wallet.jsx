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
    <div className={`min-h-screen pb-32 ${isDark ? '' : 'bg-slate-50/50'}`}>
      {/* Header */}
      <div className={`px-6 pt-5 pb-5 sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${isDark ? 'bg-[#08142B]/80 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border active:scale-95 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white border-blue-100 text-[#0A1F44] shadow-sm'}`}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className={`text-lg font-bold font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>My Wallet</h1>
        </div>
      </div>

      <div className="px-6 mt-6 max-w-[400px] mx-auto">
        {/* Compact & Premium Wallet Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative overflow-hidden p-6 rounded-[32px] shadow-2xl ${
            isDark 
              ? 'bg-gradient-to-br from-[#0A1F44] to-[#08142B] border border-white/5' 
              : 'bg-gradient-to-br from-[#0A1F44] to-[#122b5a] shadow-[0_20px_50px_rgba(10,31,68,0.25)]'
          }`}
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#22FF88]/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full -ml-12 -mb-12 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg ${
              isDark ? 'bg-white/5 border border-white/10' : 'bg-white/10 backdrop-blur-md'
            }`}>
              <WalletIcon size={22} className="text-[#22FF88]" />
            </div>
            
            <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.25em]">Available Balance</p>
            <h2 className="text-3xl font-black text-white font-display mt-1.5 flex items-baseline gap-1">
              <span className="text-xl opacity-60">₹</span>2,450
            </h2>
            
            <div className="mt-7 w-full">
              <button className="w-full bg-white hover:bg-slate-50 text-[#0A1F44] font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 group">
                <div className="w-6 h-6 rounded-lg bg-[#0A1F44] text-white flex items-center justify-center transition-transform group-hover:rotate-90">
                  <Plus size={14} strokeWidth={3} />
                </div>
                Add Money
              </button>
            </div>
          </div>
        </motion.div>

        {/* Transactions List */}
        <div className="mt-10 space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Recent Transactions</h3>
            <button className="text-[10px] font-black uppercase text-blue-500 tracking-wider">See All</button>
          </div>

          <div className="space-y-4">
            {transactions.map((tx, idx) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
                className={`p-4 rounded-[24px] border flex items-center transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mr-4 ${
                  tx.type === 'received' 
                    ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') 
                    : (isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600')
                }`}>
                  {tx.type === 'received' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-bold text-sm tracking-tight ${isDark ? 'text-white/80' : 'text-[#0A1F44]'}`}>{tx.title}</h4>
                  <p className={`text-[10px] font-bold mt-0.5 opacity-50 flex items-center gap-1 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>
                    <Clock size={10} /> {tx.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-black tracking-tight ${tx.type === 'received' ? 'text-emerald-500' : (isDark ? 'text-white/70' : 'text-[#0A1F44]/70')}`}>
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
