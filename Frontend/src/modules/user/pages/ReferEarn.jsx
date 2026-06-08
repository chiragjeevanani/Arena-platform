import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Copy, Check, Users, Sparkles, AlertCircle, Share2, Calendar, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { getMyReferralsRequest } from '../../../services/referralsApi';
import { useTheme } from '../context/ThemeContext';

const ReferEarn = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await getMyReferralsRequest();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!data?.referralLink) return;
    const text = `Hey! Join me on Arena Management Platform. Book high-quality courts, register for exciting events, and get a welcome wallet credit of ₹100 using my referral code: ${data.referralCode}. Sign up here: ${data.referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-[#CE2029] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className={`p-6 rounded-3xl text-center max-w-[400px] border shadow-lg ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
          <AlertCircle size={48} className="text-[#CE2029] mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-black mb-2">Something went wrong</h2>
          <p className="text-slate-500 font-medium mb-4">{error}</p>
          <button 
            onClick={fetchReferrals} 
            className="px-6 py-2.5 bg-[#CE2029] text-white font-bold rounded-2xl hover:bg-[#CE2029]/90 active:scale-95 transition-all shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, referrals, referralCode, referralLink } = data || {
    stats: { totalReferrals: 0, pendingCount: 0, completedCount: 0, expiredCount: 0, totalEarned: 0 },
    referrals: [],
    referralCode: '',
    referralLink: ''
  };

  return (
    <div className={`min-h-screen pb-32 ${isDark ? 'bg-[#0f1115]' : 'bg-slate-50/50'}`}>
      <div className="px-4 md:px-6 pt-4 pb-4 md:pt-6 md:pb-6 bg-[#CE2029] rounded-b-3xl md:rounded-b-[2rem] shadow-[0_10px_30px_rgba(206, 32, 41,0.15)]">
        <div className="max-w-5xl mx-auto flex items-center gap-3 md:gap-4">
          <button type="button" onClick={() => navigate(-1)} className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-sm active:scale-95 transition-all">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg md:text-xl font-bold font-display text-white tracking-tight uppercase">Refer & Earn</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-6 md:mt-8 space-y-6">
        {/* Hero Banner Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl md:rounded-[24px] p-5 md:p-6 border ${
            isDark 
              ? 'bg-slate-900/60 border-slate-800 shadow-[0_15px_40px_rgba(0,0,0,0.25)]' 
              : 'bg-white border-slate-100 shadow-[0_15px_40px_rgba(206,32,41,0.02)]'
          }`}
        >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-gradient-to-bl from-[#CE2029]/10 to-transparent rounded-full blur-[60px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CE2029]/10 border border-[#CE2029]/20 text-[#CE2029] text-[10px] font-black uppercase tracking-wider">
              <Sparkles size={12} className="animate-spin-slow shrink-0" />
              Refer & Earn Program
            </div>
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Invite Your Friends & <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CE2029] to-[#ff4d55]">
                Earn ₹150 Wallet Credit!
              </span>
            </h1>
            <p className={`text-xs md:text-sm font-semibold max-w-xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Share the love of play. Your friend gets <span className="font-bold text-[#CE2029]">₹100</span> welcome credit on signing up, and you receive <span className="font-bold text-[#CE2029]">₹150</span> credit as soon as they complete their first booking!
            </p>
          </div>

          {/* Referral Code Box */}
          <div className="lg:col-span-5">
            <div className={`p-4 md:p-5 rounded-2xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <div className="text-center space-y-3.5">
                <span className={`text-[10px] font-black uppercase tracking-widest block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Your Unique Referral Code
                </span>
                
                <div className={`py-2.5 px-4 rounded-xl border text-lg md:text-xl font-black tracking-widest uppercase flex items-center justify-between transition-all ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 text-white' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}>
                  <span>{referralCode}</span>
                  <button 
                    onClick={handleCopyLink}
                    className="p-1.5 hover:bg-[#CE2029]/10 rounded-lg transition-all text-[#CE2029] group relative"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                        >
                          <Check size={18} className="text-green-500" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                        >
                          <Copy size={18} className="group-hover:scale-105 transition-transform" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>

                <p className={`text-[10px] font-bold leading-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Copy the link below or send it directly via WhatsApp
                </p>

                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button
                    onClick={handleCopyLink}
                    className={`flex-1 py-2 px-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all truncate min-w-0 ${
                      isDark 
                        ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white' 
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-900 shadow-sm'
                    }`}
                  >
                    <Copy size={13} className="shrink-0" />
                    <span className="truncate">Copy Link</span>
                  </button>
                  
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 py-2 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-[10px] md:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-green-600/20 active:scale-95 truncate min-w-0"
                  >
                    <Share2 size={13} className="shrink-0" />
                    <span className="truncate">Share WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Referrals', value: stats.totalReferrals, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Users },
          { label: 'Rewards Earned', value: `₹${stats.totalEarned}`, color: 'text-green-500', bg: 'bg-green-500/10', icon: Gift },
          { label: 'Pending Bookings', value: stats.pendingCount, color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Calendar },
          { label: 'Expired Links', value: stats.expiredCount, color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-3 md:p-4 rounded-xl md:rounded-2xl border flex items-center gap-2.5 md:gap-3 min-w-0 ${
              isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <div className={`p-2 md:p-2.5 rounded-xl shrink-0 ${item.bg}`}>
              <item.icon className={item.color} size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <span className={`text-[8.5px] md:text-[9.5px] font-black uppercase tracking-wider block truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {item.label}
              </span>
              <h3 className={`text-sm md:text-base font-black mt-0.5 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {item.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Referral History / Ledger */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`rounded-2xl md:rounded-[24px] border overflow-hidden ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}
      >
        <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Your Referrals Ledger
            </h2>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
              Detailed tracking of your invited friends and reward statuses
            </p>
          </div>
        </div>

        {referrals.length === 0 ? (
          <div className="py-12 text-center space-y-2.5">
            <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
              <Users size={24} />
            </div>
            <p className="text-slate-500 font-black text-xs uppercase tracking-wider">No referrals yet</p>
            <p className="text-[10px] text-slate-400 max-w-[260px] mx-auto leading-normal font-semibold">
              Copy your referral link and invite your friends to start earning wallet credits today!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[9px] font-black uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                  <th className="py-3 px-4">Invited Friend</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Reward Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {referrals.map((r) => (
                  <tr key={r.id} className="group hover:bg-[#CE2029]/5 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {r.referredUser.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">{r.referredUser.email}</span>
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {r.referredUser.joinedAt ? new Date(r.referredUser.joinedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td className={`py-3 px-4 text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-black text-[#CE2029]">
                        ₹{r.rewardAmount}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {r.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-wide">
                          <CheckCircle2 size={10} />
                          Completed
                        </span>
                      )}
                      {r.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-wide">
                          <Calendar size={10} />
                          Pending
                        </span>
                      )}
                      {r.status === 'expired' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-wide">
                          <XCircle size={10} />
                          Expired
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      </div>
    </div>
  );
};

export default ReferEarn;
