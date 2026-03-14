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
      <div className={`px-6 pt-5 pb-5 sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${'bg-white border-blue-50 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border active:scale-95 transition-all ${'bg-white border-blue-100 text-[#eb483f] shadow-sm'}`}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className={`text-lg font-bold font-display ${'text-[#eb483f]'}`}>My Wallet</h1>
        </div>
      </div>

      <div className="px-6 mt-6 max-w-[400px] md:max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* LEFT COLUMN: Balance Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full md:w-[340px] md:aspect-square relative overflow-hidden p-5 md:p-6 rounded-2xl md:rounded-[32px] shadow-2xl shrink-0 flex flex-col justify-center ${
              isDark 
                ? 'bg-gradient-to-br from-[#eb483f] to-[#eb483f] border border-white/5' 
                : 'bg-gradient-to-br from-[#eb483f] to-[#122b5a] shadow-[0_20px_50px_rgba(10,31,68,0.25)]'
            }`}
          >
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#eb483f]/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full -ml-12 -mb-12 blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white mb-2 md:mb-3 shadow-lg ${
                'bg-white/10 backdrop-blur-md'
              }`}>
                <WalletIcon size={20} className="md:w-6 md:h-6 text-[#eb483f]" />
              </div>
              
              <p className="text-white/30 text-[8px] md:text-[9px] font-black uppercase tracking-[0.25em]">Available Balance</p>
              <h2 className="text-3xl md:text-4xl font-black text-white font-display mt-1 md:mt-2 flex items-baseline gap-1">
                <span className="text-lg md:text-xl opacity-60">â‚¹</span>2,450
              </h2>
              
              <div className="mt-6 md:mt-8 w-full">
                <button className="w-full bg-white hover:bg-slate-50 text-[#eb483f] font-black py-3 md:py-3.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 group">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-[#eb483f] text-white flex items-center justify-center transition-transform group-hover:rotate-90">
                    <Plus size={10} md:size={12} strokeWidth={3} />
                  </div>
                  Add Money
                </button>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Transactions List */}
          <div className="flex-1 w-full space-y-6">
            <div className="flex justify-between items-center px-1">
              <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${'text-[#eb483f]/40'}`}>Recent Transactions</h3>
              <button className="text-[10px] font-black uppercase text-blue-500 tracking-wider hover:underline">See All Activity</button>
            </div>

            <div className={`grid grid-cols-1 ${transactions.length > 2 ? 'lg:grid-cols-2' : ''} gap-3 md:gap-4`}>
              {transactions.map((tx, idx) => (
                <motion.div 
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.1) }}
                  className={`p-4 md:p-5 rounded-2xl md:rounded-[24px] border flex items-center transition-all hover:scale-[1.02] cursor-pointer ${
                    isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-blue-50 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mr-3 md:mr-4 shrink-0 ${
                    tx.type === 'received' 
                      ? ('bg-emerald-50 text-emerald-600') 
                      : ('bg-blue-50 text-blue-600')
                  }`}>
                    {tx.type === 'received' ? <ArrowDownLeft size={18} className="md:w-5 md:h-5" /> : <ArrowUpRight size={18} className="md:w-5 md:h-5" />}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className={`font-bold text-sm md:text-base tracking-tight truncate ${'text-[#eb483f]'}`}>{tx.title}</h4>
                    <p className={`text-[10px] md:text-[11px] font-bold mt-0.5 opacity-50 flex items-center gap-1 ${'text-[#eb483f]'}`}>
                      <Clock size={10} /> {tx.date}
                    </p>
                  </div>
                  <div className="text-right ml-3 md:ml-4">
                    <p className={`font-black text-sm md:text-base tracking-tight ${tx.type === 'received' ? 'text-emerald-500' : ('text-[#eb483f]/70')}`}>
                      {tx.type === 'received' ? '+' : '-'}â‚¹{Math.abs(tx.amount)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;



