import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowLeft, ArrowUpRight, ArrowDownLeft, Gift, ChevronRight } from 'lucide-react';
import { getMyPointsWallet, getMyPointsTransactions } from '../../../services/slotMembershipApi';

const REASON_LABELS = {
  slot_freed: 'Slot Freed',
  membership_discount_applied: 'Discount Applied',
  admin_adjustment: 'Admin Adjustment',
};

function TransactionRow({ tx }) {
  const isCredit = tx.type === 'credit';
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-50' : 'bg-red-50'}`}>
        {isCredit
          ? <ArrowUpRight size={16} className="text-emerald-600" />
          : <ArrowDownLeft size={16} className="text-red-500" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-[#36454F] leading-tight truncate">
          {REASON_LABELS[tx.reason] || tx.reason}
        </p>
        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
          {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-black ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
          {isCredit ? '+' : '-'}{tx.points} pts
        </p>
        <p className="text-[9px] text-slate-400 font-bold">{tx.balanceAfter} bal</p>
      </div>
    </div>
  );
}

const PointsWalletPage = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [discountConfig, setDiscountConfig] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txTotal, setTxTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const loadWallet = useCallback(async () => {
    try {
      const data = await getMyPointsWallet();
      setWallet(data.wallet);
      setDiscountConfig(data.discountConfig);
    } catch {}
  }, []);

  const loadTransactions = useCallback(async (p = 1) => {
    try {
      const data = await getMyPointsTransactions({ page: p, limit: LIMIT });
      if (p === 1) {
        setTransactions(data.transactions || []);
      } else {
        setTransactions((prev) => [...prev, ...(data.transactions || [])]);
      }
      setTxTotal(data.total || 0);
      setPage(p);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadWallet(), loadTransactions(1)]).finally(() => setLoading(false));
  }, [loadWallet, loadTransactions]);

  const currentPoints = wallet?.points ?? 0;
  const tiers = discountConfig?.tiers || [];
  const maxDiscount = discountConfig?.maxDiscountPercent ?? 20;

  // Find the best applicable discount
  const applicableTier = [...tiers].sort((a, b) => b.pointsRequired - a.pointsRequired)
    .find((t) => currentPoints >= t.pointsRequired);
  const nextTier = [...tiers].sort((a, b) => a.pointsRequired - b.pointsRequired)
    .find((t) => t.pointsRequired > currentPoints);

  return (
    <div className="min-h-screen bg-[#F4F7F6] pb-20 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-black text-[#36454F]">Bonus Points Wallet</h1>
            <p className="text-[11px] text-slate-500 font-bold">Earn by freeing slots · Redeem on memberships</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-[#36454F] to-[#243B53] rounded-3xl p-6 text-white overflow-hidden shadow-xl shadow-[#36454F]/20"
        >
          {/* decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center">
                <Star size={16} className="text-white fill-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Bonus Points Balance</span>
            </div>

            {loading ? (
              <div className="h-12 w-32 bg-white/10 rounded-xl animate-pulse mb-2" />
            ) : (
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-black tracking-tighter">{currentPoints.toLocaleString()}</span>
                <span className="text-sm font-bold text-white/60">pts</span>
              </div>
            )}

            {applicableTier && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 rounded-xl border border-emerald-400/20">
                <Gift size={12} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-300">
                  {applicableTier.discountPercent}% discount available on your next slot membership!
                </span>
              </div>
            )}

            {!applicableTier && nextTier && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl">
                <span className="text-[10px] font-bold text-white/60">
                  Earn {nextTier.pointsRequired - currentPoints} more pts for {nextTier.discountPercent}% discount
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* How to Earn */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">How to Earn Points</p>
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
            <Star size={16} className="text-amber-500 shrink-0 mt-0.5 fill-amber-400" />
            <div>
              <p className="text-xs font-black text-[#36454F]">Free a slot you can't attend</p>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                When you can't come to court, free your slot before the admin's deadline and earn bonus points automatically.
              </p>
            </div>
          </div>


        </div>

        {/* Discount Tiers */}
        {tiers.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Discount Tiers</p>
            <div className="space-y-2">
              {[...tiers].sort((a, b) => a.pointsRequired - b.pointsRequired).map((tier, i) => {
                const isActive = currentPoints >= tier.pointsRequired;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isActive ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isActive
                        ? <Gift size={14} className="text-emerald-600" />
                        : <Star size={14} className="text-slate-300" />
                      }
                      <span className={`text-xs font-black ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {tier.pointsRequired} pts
                      </span>
                    </div>
                    <span className={`text-sm font-black ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {tier.discountPercent}% off
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-2 text-center">
              Max discount capped at {maxDiscount}%
            </p>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
            Transaction History ({txTotal})
          </p>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!loading && transactions.length === 0 && (
            <p className="text-center text-sm font-bold text-slate-400 py-6">No transactions yet</p>
          )}

          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}

          {transactions.length < txTotal && (
            <button
              onClick={() => loadTransactions(page + 1)}
              className="mt-3 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
            >
              Load More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointsWalletPage;
