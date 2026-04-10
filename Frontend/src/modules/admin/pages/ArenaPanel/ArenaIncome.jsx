import { Wallet, TrendingUp, DollarSign, Download, Filter, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const TRANSACTIONS = [
  { id: 'TX-1001', date: 'Mar 24, 2024', type: 'Booking', amount: 4.500, status: 'Paid', method: 'UPI' },
  { id: 'TX-1002', date: 'Mar 24, 2024', type: 'Walk-in', amount: 3.500, status: 'Completed', method: 'Cash' },
  { id: 'TX-1003', date: 'Mar 23, 2024', type: 'Booking', amount: 5.000, status: 'Paid', method: 'Card' },
  { id: 'TX-1004', date: 'Mar 23, 2024', type: 'Coaching', amount: 35.000, status: 'Paid', method: 'UPI' },
  { id: 'TX-1005', date: 'Mar 22, 2024', type: 'Retail', amount: 12.500, status: 'Completed', method: 'Cash' },
];

const ArenaIncome = () => {
  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main Wallet */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#36454F] to-[#0f1115] p-8 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-slate-200">
           <div className="absolute top-0 right-0 p-8 opacity-10 blur-sm pointer-events-none">
              <Wallet size={180} />
           </div>
           
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-2 text-white/50">Monthly Net Income</h3>
                    <p className="text-5xl font-black font-display tracking-tight">OMR 1,294.500</p>
                 </div>
                 <button className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl border border-white/10 backdrop-blur-md transition-all group">
                    <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                 </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Gross Revenue</p>
                    <p className="text-xl font-black">OMR 1,580</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Platform Fee (18%)</p>
                    <p className="text-xl font-black text-[#CE2029]">- OMR 284</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Pending Payout</p>
                    <div className="flex items-center gap-2">
                       <p className="text-xl font-black text-green-400">OMR 450</p>
                       <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 rounded-2xl bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029] mb-4">
              <Activity size={32} />
           </div>
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#36454F] mb-2">Payout Schedule</h3>
           <p className="text-xs font-bold text-slate-400 leading-relaxed px-4">Your next payout is scheduled for <span className="text-[#CE2029]">April 01, 2024</span> directly to your linked bank account.</p>
           <button className="mt-8 w-full py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-[#36454F] transition-all">
              Manage Bank Account
           </button>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#36454F]">Recent Transactions</h3>
           <div className="flex items-center gap-2">
              <button className="p-2 border border-slate-100 rounded-lg text-slate-400 hover:text-[#CE2029] transition-all"><Filter size={16} /></button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Reference</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {TRANSACTIONS.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                     <td className="px-6 py-5">
                        <p className="text-sm font-black text-[#36454F]">{tx.id}</p>
                        <p className="text-[9px] font-bold text-slate-400">{tx.date}</p>
                     </td>
                     <td className="px-6 py-5">
                        <span className="text-[11px] font-black text-[#36454F] uppercase">{tx.type}</span>
                     </td>
                     <td className="px-6 py-5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.method}</span>
                     </td>
                     <td className="px-6 py-5 text-right font-black text-sm text-[#36454F]">
                        OMR {tx.amount.toFixed(3)}
                     </td>
                     <td className="px-6 py-5">
                        <div className="flex justify-center">
                           <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-500 text-[9px] font-black uppercase border border-green-100">
                              {tx.status}
                           </span>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ArenaIncome;
