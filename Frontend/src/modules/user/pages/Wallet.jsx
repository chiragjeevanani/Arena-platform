import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, Plus, X, CreditCard, Smartphone, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { isApiConfigured, getMockPaymentWebhookSecret } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { getMyWallet, topUpMyWallet } from '../../../services/meApi';
import { completeWalletTopUpViaMockPayment } from '../../../services/mockTopUpFlow';
import { mapWalletTransactionToRow } from '../../../utils/walletTxUi';

const TOP_UP_AMOUNTS = [5, 10, 20, 50, 100];

const DEMO_TX = [
  { id: 'd1', title: 'Court Booking — Court 2', subtitle: 'Demo', date: 'Mar 20, 07:00 PM', amount: -4.5, type: 'spent', ref: '#BK-10293' },
  { id: 'd2', title: 'Wallet Top Up', subtitle: 'Demo', date: 'Mar 15, 09:00 AM', amount: 10, type: 'received', ref: '#TU-1029' },
];

const TopUpModal = ({ onClose, useLiveApi, onSuccess }) => {
  const [selected, setSelected] = useState(10);
  const [custom, setCustom] = useState('');
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const finalAmount = custom ? parseFloat(custom) : selected;
  const amountValid = Number.isFinite(finalAmount) && finalAmount > 0;

  const handleTopUp = async () => {
    if (!amountValid) return;
    setError('');
    setProcessing(true);
    try {
      if (useLiveApi) {
        const mockSecret = getMockPaymentWebhookSecret();
        if (mockSecret) {
          await completeWalletTopUpViaMockPayment(finalAmount, mockSecret);
        } else {
          await topUpMyWallet(finalAmount);
        }
        setDone(true);
        onSuccess?.();
        setTimeout(onClose, 1500);
      } else {
        await new Promise((r) => setTimeout(r, 900));
        setDone(true);
        setTimeout(onClose, 1500);
      }
    } catch (e) {
      setError(e.message || 'Top up failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[28px] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-[#36454F] px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black">Top Up Wallet</h3>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-0.5">Add OMR Balance</p>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-5">
          {error && <p className="text-xs text-red-600 font-semibold text-center">{error}</p>}
          {done ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-500" strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-black text-[#36454F]">Top Up Successful!</h4>
              <p className="text-xs text-slate-500 mt-1">OMR {Number(finalAmount).toFixed(3)} added to your wallet.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Select Amount</label>
                <div className="grid grid-cols-5 gap-2">
                  {TOP_UP_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { setSelected(amt); setCustom(''); }}
                      className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${selected === amt && !custom ? 'bg-[#CE2029] text-white border-[#CE2029] shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#CE2029]/30'}`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Or Enter Custom Amount (OMR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">OMR</span>
                  <input
                    type="number"
                    placeholder="0.000"
                    value={custom}
                    onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
                    className="w-full py-3.5 pl-14 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#36454F] outline-none focus:border-[#CE2029] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'card', label: 'Debit/Credit Card', icon: CreditCard },
                    { id: 'upi', label: 'UPI / Wallet', icon: Smartphone },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`flex items-center gap-2 p-3.5 rounded-2xl border text-left transition-all ${method === m.id ? 'border-[#CE2029] bg-[#CE2029]/5' : 'border-slate-200 bg-slate-50 hover:border-[#CE2029]/30'}`}
                    >
                      <m.icon size={16} className={method === m.id ? 'text-[#CE2029]' : 'text-slate-400'} />
                      <span className={`text-[10px] font-black uppercase tracking-wider ${method === m.id ? 'text-[#CE2029]' : 'text-slate-500'}`}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleTopUp}
                disabled={processing || !amountValid}
                className="w-full py-4 rounded-2xl bg-[#CE2029] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#d43b33] transition-all disabled:opacity-60 active:scale-95"
              >
                {processing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : `Add OMR ${Number(finalAmount || 0).toFixed(3)}`}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Wallet = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [showTopUp, setShowTopUp] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState(DEMO_TX);
  const [loadError, setLoadError] = useState('');
  const live = isApiConfigured() && getAuthToken();

  const refreshWallet = useCallback(async () => {
    if (!live) {
      setTransactions(DEMO_TX);
      setBalance(DEMO_TX.reduce((a, t) => a + t.amount, 0));
      return;
    }
    setLoadError('');
    try {
      const data = await getMyWallet();
      const bal = Number(data.wallet?.balance) || 0;
      setBalance(bal);
      const rows = (data.transactions || []).map(mapWalletTransactionToRow);
      setTransactions(rows.length ? rows : []);
    } catch (e) {
      setLoadError(e.message || 'Could not load wallet');
      setTransactions([]);
      setBalance(0);
    }
  }, [live]);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const spent = Math.abs(transactions.filter((t) => t.type === 'spent').reduce((a, t) => a + t.amount, 0));
  const received = transactions.filter((t) => t.type === 'received').reduce((a, t) => a + t.amount, 0);

  return (
    <div className={`min-h-screen pb-32 ${isDark ? 'bg-[#0f1115]' : 'bg-slate-50/50'}`}>
      <AnimatePresence>
        {showTopUp && (
          <TopUpModal
            useLiveApi={live}
            onClose={() => setShowTopUp(false)}
            onSuccess={refreshWallet}
          />
        )}
      </AnimatePresence>

      <div className="px-4 md:px-6 pt-4 pb-4 md:pt-6 md:pb-6 bg-[#CE2029] rounded-b-3xl md:rounded-b-[2rem] shadow-[0_10px_30px_rgba(206, 32, 41,0.15)]">
        <div className="max-w-4xl mx-auto flex items-center gap-3 md:gap-4">
          <button type="button" onClick={() => navigate(-1)} className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-sm active:scale-95 transition-all">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg md:text-xl font-bold font-display text-white tracking-tight uppercase">My Wallet</h1>
        </div>
      </div>

      <div className="px-4 md:px-6 mt-6 md:mt-8 max-w-[500px] md:max-w-4xl mx-auto space-y-6">
        {loadError && (
          <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-3">{loadError}</p>
        )}
        {!live && (
          <p className="text-xs text-slate-500 bg-white border border-slate-100 rounded-xl px-4 py-3">
            Sign in with the API configured to use your real wallet. Showing sample transactions.
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative overflow-hidden p-5 md:p-7 rounded-[24px] shadow-lg ${isDark ? 'bg-slate-900 border border-white/5' : 'bg-[#151b29]'}`}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[size:18px_18px]" />
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#CE2029]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 text-white/50">
                <WalletIcon size={14} className="text-white/60" />
                <span className="text-[9px] font-black uppercase tracking-[0.15em]">Available Balance</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white font-display flex items-baseline gap-1.5 tracking-tight">
                <span className="text-xl md:text-2xl font-bold opacity-80 text-blue-300">OMR</span>
                {Math.max(balance, 0).toFixed(3)}
              </h2>
              <p className="text-[10px] text-white/40 font-bold mt-2">Synced with your account when signed in</p>
            </div>
            <button
              type="button"
              onClick={() => setShowTopUp(true)}
              disabled={!live}
              title={!live ? 'Sign in to top up' : ''}
              className="flex items-center gap-2 px-5 py-3 bg-[#CE2029] text-white font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-[#d43b33] active:scale-95 transition-all shadow-lg shadow-[#CE2029]/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} strokeWidth={3} /> Top Up
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Spent', value: `OMR ${spent.toFixed(3)}`, color: 'text-red-500', bg: 'bg-red-50', icon: ArrowUpRight },
            { label: 'Total Received', value: `OMR ${received.toFixed(3)}`, color: 'text-emerald-500', bg: 'bg-emerald-50', icon: ArrowDownLeft },
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white border border-slate-100 shadow-sm'}`}>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon size={18} className={stat.color} strokeWidth={2.5} />
              </div>
              <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'} mb-1`}>{stat.label}</p>
              <p className={`text-sm font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-[0.15em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Transaction History</h3>
            <span className="text-[9px] font-black uppercase text-slate-300 tracking-wider">{transactions.length} entries</span>
          </div>

          <div className="space-y-2">
            {transactions.map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + (idx * 0.06) }}
                className={`p-4 md:p-5 rounded-2xl border flex items-center gap-4 transition-all ${
                  isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-[#CE2029]/10'
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${tx.type === 'received' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-500'}`}>
                  {tx.type === 'received' ? <ArrowDownLeft size={18} strokeWidth={2.5} /> : <ArrowUpRight size={18} strokeWidth={2.5} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-black text-sm tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{tx.title}</h4>
                  <p className={`text-[10px] font-bold mt-0.5 flex flex-wrap items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                    <Clock size={10} /> {tx.date}
                    {tx.subtitle ? (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-300">{tx.subtitle}</span>
                      </>
                    ) : null}
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-300">{tx.ref}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-black text-sm ${tx.type === 'received' ? 'text-emerald-500' : (isDark ? 'text-white' : 'text-slate-800')}`}>
                    {tx.type === 'received' ? '+' : '-'}OMR {Math.abs(tx.amount).toFixed(3)}
                  </p>
                  <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${tx.type === 'received' ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {tx.type === 'received' ? 'Credit' : 'Debit'}
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
