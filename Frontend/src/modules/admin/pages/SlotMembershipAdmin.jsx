import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, CheckCircle2, Star, Settings, Users, RefreshCw,
  Clock, ChevronDown, ChevronUp, Plus, Trash2, Save, X, AlertCircle,
  ArrowUpRight, Gift, Tag, Zap, Filter
} from 'lucide-react';
import {
  listAdminFreedSlots, markFreedSlotResold,
  getPointsDiscountConfig, updatePointsDiscountConfig,
  listAdminPointsWallets, adjustAdminPointsBalance,
  getSlotFreeConfig, updateSlotFreeConfig,
} from '../../../services/slotMembershipApi';
import { listAdminArenas } from '../../../services/adminOpsApi';
import { normalizeListArena } from '../../../utils/arenaAdapter';

const TABS = [
  { id: 'freed', label: 'Freed Slots', icon: CalendarDays },
  { id: 'config', label: 'Slot Config', icon: Settings },
  { id: 'points', label: 'Points Config', icon: Star },
  { id: 'wallets', label: 'Points Wallets', icon: Users },
];

function StatusBadge({ status }) {
  const map = {
    freed: 'bg-amber-100 text-amber-700',
    resold: 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {status === 'freed' ? <Clock size={10} /> : <CheckCircle2 size={10} />}
      {status}
    </span>
  );
}

// ─── Tab: Freed Slots ─────────────────────────────────────────────────────────
function FreedSlotsTab() {
  const [slots, setSlots] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState({ status: '', startDate: '', endDate: '' });
  const [resoldingId, setResoldingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await listAdminFreedSlots({ ...filter, limit: 100 });
      setSlots(data.freedSlots || []);
      setTotal(data.total || 0);
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleResold = async (id) => {
    if (!window.confirm('Mark this slot as resold?')) return;
    setResoldingId(id);
    try {
      await markFreedSlotResold(id);
      await load();
    } catch (e) {
      setErr(e.message || 'Failed to mark resold');
    } finally {
      setResoldingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Status</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 focus:outline-none focus:border-[#CE2029]"
          >
            <option value="">All</option>
            <option value="freed">Freed</option>
            <option value="resold">Resold</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">From</label>
          <input type="date" value={filter.startDate} onChange={(e) => setFilter((f) => ({ ...f, startDate: e.target.value }))}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 focus:outline-none focus:border-[#CE2029]" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">To</label>
          <input type="date" value={filter.endDate} onChange={(e) => setFilter((f) => ({ ...f, endDate: e.target.value }))}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 focus:outline-none focus:border-[#CE2029]" />
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-[#CE2029] text-white rounded-xl text-xs font-black uppercase tracking-widest">
          <Filter size={14} /> Filter
        </button>
        <span className="text-xs font-bold text-slate-400 ml-auto">{total} total records</span>
      </div>

      {err && <p className="text-xs text-red-600 font-bold">{err}</p>}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                {['Date', 'User', 'Arena', 'Court', 'Time Slot', 'Day', 'Freed At', 'Points', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-sm font-bold text-slate-400">Loading...</td></tr>
              )}
              {!loading && slots.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-sm font-bold text-slate-400">No freed slots found</td></tr>
              )}
              {slots.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-black text-[#36454F]">{s.freedDate}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-black text-[#36454F]">{s.user?.name || s.user?.firstName || '—'}</p>
                    <p className="text-[10px] text-slate-400">{s.user?.email || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-600">{s.arenaName || '—'}</td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-600">{s.courtName || '—'}</td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-600 whitespace-nowrap">{s.courtSlot?.timeSlot || '—'}</td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-600">{s.courtSlot?.dayOfWeek || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{s.freedAt ? new Date(s.freedAt).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-black">
                      <Star size={10} /> {s.bonusPointsAwarded}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3">
                    {s.status === 'freed' && (
                      <button
                        onClick={() => handleResold(s.id)}
                        disabled={resoldingId === s.id}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        Mark Resold
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Slot Config (per arena) ─────────────────────────────────────────────
function SlotConfigTab() {
  const [arenas, setArenas] = useState([]);
  const [selectedArenaId, setSelectedArenaId] = useState('');
  const [config, setConfig] = useState({ freeWindowHours: 24, pointsPerFreeSlot: 10 });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    listAdminArenas().then((d) => {
      const list = (d.arenas || []).map(normalizeListArena);
      setArenas(list);
      if (list.length) setSelectedArenaId(String(list[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selectedArenaId) return;
    getSlotFreeConfig(selectedArenaId)
      .then((d) => setConfig({ freeWindowHours: d.freeWindowHours, pointsPerFreeSlot: d.pointsPerFreeSlot }))
      .catch(() => {});
  }, [selectedArenaId]);

  const save = async () => {
    if (!selectedArenaId) return;
    setSaving(true);
    setMsg('');
    setErr('');
    try {
      await updateSlotFreeConfig(selectedArenaId, config);
      setMsg('Configuration saved!');
    } catch (e) {
      setErr(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Arena</label>
          <select
            value={selectedArenaId}
            onChange={(e) => setSelectedArenaId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold border border-slate-200 focus:outline-none focus:border-[#CE2029]"
          >
            {arenas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">
            Free Window (hours before slot time)
          </label>
          <div className="relative">
            <input
              type="number" min={1}
              value={config.freeWindowHours}
              onChange={(e) => setConfig((c) => ({ ...c, freeWindowHours: Number(e.target.value) || 1 }))}
              className="w-full pl-4 pr-16 py-3 bg-slate-50 rounded-xl text-sm font-black border border-slate-200 focus:outline-none focus:border-[#CE2029]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">hrs</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-1">
            Members must free the slot at least {config.freeWindowHours}h before it starts.
          </p>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">
            Bonus Points per Freed Slot
          </label>
          <div className="relative">
            <input
              type="number" min={0}
              value={config.pointsPerFreeSlot}
              onChange={(e) => setConfig((c) => ({ ...c, pointsPerFreeSlot: Number(e.target.value) || 0 }))}
              className="w-full pl-4 pr-20 py-3 bg-slate-50 rounded-xl text-sm font-black border border-slate-200 focus:outline-none focus:border-[#CE2029]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-500 uppercase flex items-center gap-1">
              <Star size={10} /> pts
            </span>
          </div>
        </div>

        {msg && <p className="text-xs text-emerald-600 font-bold">{msg}</p>}
        {err && <p className="text-xs text-red-600 font-bold">{err}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3 bg-[#CE2029] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#b01b22] transition-colors disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Points Discount Config ──────────────────────────────────────────────
function PointsConfigTab() {
  const [tiers, setTiers] = useState([]);
  const [maxDiscount, setMaxDiscount] = useState(20);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    getPointsDiscountConfig()
      .then((d) => {
        setTiers(d.tiers || []);
        setMaxDiscount(d.maxDiscountPercent ?? 20);
      })
      .catch(() => {});
  }, []);

  const addTier = () => setTiers((t) => [...t, { pointsRequired: 50, discountPercent: 5 }]);
  const removeTier = (i) => setTiers((t) => t.filter((_, idx) => idx !== i));
  const updateTier = (i, field, val) => setTiers((t) => t.map((tier, idx) => idx === i ? { ...tier, [field]: Number(val) } : tier));

  const save = async () => {
    setSaving(true);
    setMsg('');
    setErr('');
    try {
      await updatePointsDiscountConfig({ tiers, maxDiscountPercent: maxDiscount });
      setMsg('Saved successfully!');
    } catch (e) {
      setErr(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#36454F]">Discount Tiers</h3>
            <p className="text-[10px] text-slate-400 font-bold">Points required → discount % on slot memberships</p>
          </div>
          <button
            onClick={addTier}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-[#CE2029] hover:text-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Plus size={12} /> Add Tier
          </button>
        </div>

        {tiers.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-xs font-bold">No tiers configured yet. Add one above.</div>
        )}

        <div className="space-y-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
            >
              <div className="flex-1">
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Points Required</label>
                <div className="relative">
                  <input
                    type="number" min={1}
                    value={tier.pointsRequired}
                    onChange={(e) => updateTier(i, 'pointsRequired', e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-white rounded-lg text-xs font-black border border-slate-200 focus:outline-none focus:border-[#CE2029]"
                  />
                  <Star size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400" />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Discount %</label>
                <div className="relative">
                  <input
                    type="number" min={0} max={100}
                    value={tier.discountPercent}
                    onChange={(e) => updateTier(i, 'discountPercent', e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-white rounded-lg text-xs font-black border border-slate-200 focus:outline-none focus:border-[#CE2029]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-500">%</span>
                </div>
              </div>
              <button onClick={() => removeTier(i)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all mt-4">
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Maximum Discount Cap (%)</label>
          <div className="relative">
            <input
              type="number" min={0} max={100}
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(Number(e.target.value))}
              className="w-full pl-4 pr-10 py-3 bg-slate-50 rounded-xl text-sm font-black border border-slate-200 focus:outline-none focus:border-[#CE2029]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-500">%</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Discount will never exceed this value regardless of tier.</p>
        </div>

        {msg && <p className="text-xs text-emerald-600 font-bold">{msg}</p>}
        {err && <p className="text-xs text-red-600 font-bold">{err}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3 bg-[#CE2029] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#b01b22] transition-colors disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save Tiers'}
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Points Wallets ──────────────────────────────────────────────────────
function PointsWalletsTab() {
  const [wallets, setWallets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [adjusting, setAdjusting] = useState(null); // { userId, name }
  const [adjustForm, setAdjustForm] = useState({ points: '', type: 'credit', note: '' });
  const [adjustErr, setAdjustErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdminPointsWallets({ limit: 100 });
      setWallets(data.wallets || []);
      setTotal(data.total || 0);
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submitAdjust = async () => {
    if (!adjusting) return;
    setAdjustErr('');
    try {
      await adjustAdminPointsBalance({
        userId: adjusting.userId,
        points: Number(adjustForm.points),
        type: adjustForm.type,
        note: adjustForm.note,
      });
      setAdjusting(null);
      await load();
    } catch (e) {
      setAdjustErr(e.message || 'Adjustment failed');
    }
  };

  return (
    <div className="space-y-4">
      {err && <p className="text-xs text-red-600 font-bold">{err}</p>}
      <div className="text-xs text-slate-400 font-bold">{total} users with points wallets</div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                {['User', 'Email', 'Points Balance', 'Last Updated', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm font-bold text-slate-400">Loading...</td></tr>}
              {!loading && wallets.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm font-bold text-slate-400">No points wallets yet</td></tr>}
              {wallets.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-black text-[#36454F]">
                    {w.user?.name || w.user?.firstName || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{w.user?.email || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-black">
                      <Star size={12} /> {w.points}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {w.updatedAt ? new Date(w.updatedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setAdjusting({ userId: w.userId, name: w.user?.name || w.user?.firstName || 'User' }); setAdjustForm({ points: '', type: 'credit', note: '' }); setAdjustErr(''); }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-[#CE2029] hover:text-white text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      <AnimatePresence>
        {adjusting && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200]" onClick={() => setAdjusting(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-[210] p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#36454F]">Adjust Points — {adjusting.name}</h3>
                  <button onClick={() => setAdjusting(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all"><X size={16} /></button>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Type</label>
                  <div className="flex gap-2">
                    {['credit', 'debit'].map((t) => (
                      <button key={t} type="button" onClick={() => setAdjustForm((f) => ({ ...f, type: t }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adjustForm.type === t ? 'bg-[#CE2029] text-white' : 'bg-slate-50 text-slate-500'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Points</label>
                  <input type="number" min={1} value={adjustForm.points}
                    onChange={(e) => setAdjustForm((f) => ({ ...f, points: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-black border border-slate-200 focus:outline-none focus:border-[#CE2029]"
                    placeholder="Enter points" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Note</label>
                  <input type="text" value={adjustForm.note}
                    onChange={(e) => setAdjustForm((f) => ({ ...f, note: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold border border-slate-200 focus:outline-none focus:border-[#CE2029]"
                    placeholder="Reason for adjustment" />
                </div>
                {adjustErr && <p className="text-xs text-red-600 font-bold">{adjustErr}</p>}
                <button onClick={submitAdjust}
                  className="w-full py-3 bg-[#CE2029] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#b01b22] transition-colors">
                  Confirm Adjustment
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const SlotMembershipAdmin = () => {
  const [activeTab, setActiveTab] = useState('freed');

  return (
    <div className="min-h-screen bg-[#F4F7F6] p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-[2.5px] bg-[#CE2029]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CE2029]">Slot Memberships</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#36454F] leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Slot Booking <span className="text-[#CE2029]">Management</span>
          </h1>
          <p className="text-slate-500 font-bold text-[13px] mt-2 opacity-60">
            Configure slot-free rules, bonus points tiers, and manage freed slots.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm mb-6 w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#CE2029] text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'freed' && <FreedSlotsTab />}
            {activeTab === 'config' && <SlotConfigTab />}
            {activeTab === 'points' && <PointsConfigTab />}
            {activeTab === 'wallets' && <PointsWalletsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SlotMembershipAdmin;
