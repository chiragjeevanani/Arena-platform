import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Users, Wallet, Gift, ArrowUpRight, 
  CheckCircle2, AlertCircle, X, Search, Plus, Minus,
  Edit3, RefreshCw, DollarSign, Calendar
} from 'lucide-react';
import { 
  getReferralSettingsRequest, 
  updateReferralSettingsRequest, 
  getReferralsListRequest, 
  getWalletsListRequest, 
  adjustWalletBalanceRequest 
} from '../../../services/referralsApi';

const ReferralManagement = () => {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'ledger' | 'wallets'
  const [settings, setSettings] = useState({
    referralSystemEnabled: true,
    referrerReward: 150,
    newuserReward: 100,
    walletUsageEnabled: true,
    referralExpiryDays: 30
  });
  const [referrals, setReferrals] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  
  // Adjustment Modal State
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [adjustment, setAdjustment] = useState({
    amount: '',
    type: 'credit', // 'credit' | 'debit'
    reason: ''
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSettings = async () => {
    try {
      const data = await getReferralSettingsRequest();
      if (data?.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchReferrals = async () => {
    try {
      const data = await getReferralsListRequest();
      setReferrals(data?.referrals || []);
    } catch (err) {
      console.error('Error fetching referrals:', err);
    }
  };

  const fetchWallets = async () => {
    try {
      const data = await getWalletsListRequest();
      setWallets(data?.wallets || []);
    } catch (err) {
      console.error('Error fetching wallets:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    const loadAll = async () => {
      await Promise.all([
        fetchSettings(),
        fetchReferrals(),
        fetchWallets()
      ]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateReferralSettingsRequest(settings);
      showNotification('Referral settings updated successfully!');
    } catch (err) {
      showNotification(err.message || 'Failed to update settings', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustBalanceSubmit = async (e) => {
    e.preventDefault();
    if (!adjustment.amount || Number(adjustment.amount) <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }
    if (!adjustment.reason.trim()) {
      showNotification('Please provide a reason for the adjustment', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await adjustWalletBalanceRequest({
        userId: selectedWallet.userId,
        amount: Number(adjustment.amount),
        type: adjustment.type,
        reason: adjustment.reason
      });
      showNotification(`Wallet balance successfully ${adjustment.type}ed!`);
      setSelectedWallet(null);
      setAdjustment({ amount: '', type: 'credit', reason: '' });
      await fetchWallets();
    } catch (err) {
      showNotification(err.message || 'Adjustment failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWallets = wallets.filter(w => {
    const name = w.userName?.toLowerCase() || '';
    const email = w.userEmail?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  const filteredReferrals = referrals.filter(r => {
    const referrerName = r.referrer?.name?.toLowerCase() || '';
    const refereeName = r.referredUser?.name?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return referrerName.includes(term) || refereeName.includes(term);
  });

  // Calculate high-level stats
  const totalSignups = referrals.length;
  const completedConversions = referrals.filter(r => r.status === 'completed').length;
  const pendingConversions = referrals.filter(r => r.status === 'pending').length;
  const totalDistributed = referrals
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.rewardAmountReferrer + r.rewardAmountReferred, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[300] px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border ${
              notification.type === 'error' 
                ? 'bg-red-50 text-red-600 border-red-100' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}
          >
            {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span className="text-xs font-black uppercase tracking-wider">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="max-w-[1700px] mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-[2px] bg-[#eb483f]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#eb483f]">Refer & Earn System</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1e293b] leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Referrals & <span className="text-[#eb483f]">Wallets</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs mt-3 opacity-70 flex items-center gap-2 uppercase tracking-widest">
            <Gift size={14} className="text-[#eb483f]" /> 
            Manage system config, reward metrics, conversions, and user credit ledgers
          </p>
        </div>

        <button 
          onClick={async () => {
            setLoading(true);
            await Promise.all([fetchSettings(), fetchReferrals(), fetchWallets()]);
            setLoading(false);
            showNotification('Dashboard data refreshed!');
          }}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-[1700px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Signups', value: totalSignups, icon: Users, color: '#3b82f6' },
          { label: 'Conversions', value: completedConversions, icon: CheckCircle2, color: '#10b981' },
          { label: 'Pending Conversions', value: pendingConversions, icon: AlertCircle, color: '#f59e0b' },
          { label: 'Distributed Rewards', value: `OMR ${totalDistributed.toFixed(3)}`, icon: Wallet, color: '#eb483f' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: `${stat.color}10`, color: stat.color }}>
              <stat.icon size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
              <h3 className="text-xl font-black text-[#1e293b] tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Hub */}
      <div className="max-w-[1700px] mx-auto mb-6 bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm flex flex-wrap gap-2">
        {[
          { id: 'settings', label: 'System Configuration', icon: Settings },
          { id: 'ledger', label: 'Conversions Ledger', icon: Gift },
          { id: 'wallets', label: 'Wallets & Adjustments', icon: Wallet },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchTerm('');
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-[#1e293b] text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="max-w-[1700px] mx-auto">
        {loading ? (
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-20 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#eb483f]/20 border-t-[#eb483f] rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading system metrics...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-8 max-w-4xl"
              >
                <h3 className="text-xl font-black text-[#1e293b] mb-6 flex items-center gap-2">
                  <Settings className="text-[#eb483f]" /> System Controls
                </h3>
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  {/* Referral Enable Switch */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Referral Program Status</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Enable or disable the unique referral link system for all users globally</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.referralSystemEnabled} 
                        onChange={(e) => setSettings({ ...settings, referralSystemEnabled: e.target.checked })} 
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#eb483f]"></div>
                    </label>
                  </div>

                  {/* Wallet Enable Switch */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Wallet Usage During Checkout</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Allow customers to pay partially or fully using their wallet balances</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.walletUsageEnabled} 
                        onChange={(e) => setSettings({ ...settings, walletUsageEnabled: e.target.checked })} 
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#eb483f]"></div>
                    </label>
                  </div>

                  {/* Pricing Setup Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Referrer Reward Amount (OMR)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">OMR</span>
                        <input 
                          type="number"
                          value={settings.referrerReward || ''}
                          onChange={(e) => setSettings({ ...settings, referrerReward: Number(e.target.value) })}
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#eb483f]/5 focus:bg-white focus:border-[#eb483f]/20 transition-all"
                          placeholder="150"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Referee Welcome Reward (OMR)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">OMR</span>
                        <input 
                          type="number"
                          value={settings.newuserReward || ''}
                          onChange={(e) => setSettings({ ...settings, newuserReward: Number(e.target.value) })}
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#eb483f]/5 focus:bg-white focus:border-[#eb483f]/20 transition-all"
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Link Expiry Period (Days)</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="number"
                          value={settings.referralExpiryDays || ''}
                          onChange={(e) => setSettings({ ...settings, referralExpiryDays: Number(e.target.value) })}
                          className="w-full pl-10 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#eb483f]/5 focus:bg-white focus:border-[#eb483f]/20 transition-all"
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-8 py-4 bg-[#1e293b] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Saving changes...' : 'Save Configuration'}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'ledger' && (
              <motion.div
                key="ledger"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search referrer or referee..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-6 py-3 bg-slate-50 border-transparent rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#eb483f]/5 focus:bg-white focus:border-[#eb483f]/20 transition-all"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Showing {filteredReferrals.length} conversions
                  </span>
                </div>

                <div className="overflow-x-auto whitespace-nowrap">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Referrer</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Referee</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">State</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Payouts</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right font-sans">Date Initiated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredReferrals.map((ref) => (
                        <tr key={ref.id || ref._id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-8 py-4.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs">
                                {ref.referrer?.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-800">{ref.referrer?.name || 'N/A'}</h4>
                                <span className="text-[9px] font-bold text-slate-400 block">{ref.referrer?.email || 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs">
                                {ref.referredUser?.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-800">{ref.referredUser?.name || 'N/A'}</h4>
                                <span className="text-[9px] font-bold text-slate-400 block">{ref.referredUser?.email || 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4.5">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              ref.status === 'completed' 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                  : ref.status === 'expired' 
                                  ? 'bg-red-50 text-red-600 border-red-100' 
                                  : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {ref.status}
                            </span>
                          </td>
                          <td className="px-6 py-4.5">
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-black text-slate-800">Referrer: OMR {ref.rewardAmountReferrer.toFixed(3)}</p>
                              <p className="text-[9px] font-bold text-slate-400">Referee: OMR {ref.rewardAmountReferred.toFixed(3)}</p>
                            </div>
                          </td>
                          <td className="px-8 py-4.5 text-right text-xs font-bold text-slate-500">
                            {new Date(ref.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                      {filteredReferrals.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-20 text-center">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">No conversions recorded yet</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'wallets' && (
              <motion.div
                key="wallets"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search user wallets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-6 py-3 bg-slate-50 border-transparent rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#eb483f]/5 focus:bg-white focus:border-[#eb483f]/20 transition-all"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Showing {filteredWallets.length} active wallets
                  </span>
                </div>

                <div className="overflow-x-auto whitespace-nowrap">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User Details</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Wallet Balance</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Transactions</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Credit Adjustments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredWallets.map((wallet) => (
                        <tr key={wallet.id || wallet._id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-8 py-4.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs">
                                {wallet.userName?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-800">{wallet.userName || 'N/A'}</h4>
                                <span className="text-[9px] font-bold text-slate-400 block">{wallet.userEmail || 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4.5">
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-black text-slate-800">OMR {wallet.balance.toFixed(3)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 text-xs font-bold text-slate-500">
                            {wallet.transactionsCount || 0} Records
                          </td>
                          <td className="px-8 py-4.5 text-right">
                            <button
                              onClick={() => setSelectedWallet(wallet)}
                              className="px-4 py-2 bg-slate-50 hover:bg-[#eb483f]/5 text-slate-600 hover:text-[#eb483f] border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ml-auto"
                            >
                              <Plus size={12} /> Adjust Credit
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredWallets.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-20 text-center">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">No wallets found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Adjust Wallet Balance Modal */}
      <AnimatePresence>
        {selectedWallet && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWallet(null)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[200]" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-white z-[210] shadow-2xl rounded-3xl border border-slate-100 flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Adjust Wallet Balance</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">Manual overrides & adjustments for member ledger</p>
                </div>
                <button 
                  onClick={() => setSelectedWallet(null)}
                  className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleAdjustBalanceSubmit} className="p-6 space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-slate-500 text-sm border border-slate-100">
                    {selectedWallet.userName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{selectedWallet.userName || 'N/A'}</h4>
                    <p className="text-[9px] font-bold text-slate-400 block mt-0.5">{selectedWallet.userEmail || 'N/A'}</p>
                    <span className="text-[9px] font-black uppercase text-[#eb483f] tracking-wider block mt-1">Current: OMR {selectedWallet.balance.toFixed(3)}</span>
                  </div>
                </div>

                {/* Adjustment Mode Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustment({ ...adjustment, type: 'credit' })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
                      adjustment.type === 'credit' 
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-600' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-400'
                    }`}
                  >
                    <Plus size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Credit (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustment({ ...adjustment, type: 'debit' })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
                      adjustment.type === 'debit' 
                        ? 'border-red-500 bg-red-50/50 text-red-600' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-400'
                    }`}
                  >
                    <Minus size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Debit (-)</span>
                  </button>
                </div>

                {/* Adjustment Amount Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Adjustment Amount (OMR)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="number"
                      value={adjustment.amount}
                      onChange={(e) => setAdjustment({ ...adjustment, amount: e.target.value })}
                      className="w-full pl-10 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#eb483f]/5 focus:bg-white focus:border-[#eb483f]/20 transition-all"
                      placeholder="0.000"
                    />
                  </div>
                </div>

                {/* Reason Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Adjustment Reason</label>
                  <textarea 
                    value={adjustment.reason}
                    onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#eb483f]/5 focus:bg-white focus:border-[#eb483f]/20 transition-all resize-none h-24"
                    placeholder="Provide a detailed description of why you are manually overriding this member's balance..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setSelectedWallet(null)}
                    className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-[2] py-4 bg-[#1e293b] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {submitting ? 'Applying Adjustment...' : 'Apply Adjustment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReferralManagement;
