import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Search,
  TrendingUp,
  AlertCircle,
  Clock,
  Users,
  ToggleLeft,
  ToggleRight,
  Percent,
  DollarSign,
} from 'lucide-react';
import {
  createAdminCoupon,
  listAdminCoupons,
  updateAdminCoupon,
  deleteAdminCoupon,
} from '../../../services/couponApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => (typeof n === 'number' ? n.toFixed(3) : '—');
const isExpired = (expiresAt) => expiresAt && new Date() > new Date(expiresAt);

function StatusBadge({ coupon }) {
  if (!coupon.isActive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
        <XCircle size={9} /> Inactive
      </span>
    );
  }
  if (isExpired(coupon.expiresAt)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-600">
        <Clock size={9} /> Expired
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-600">
      <CheckCircle size={9} /> Active
    </span>
  );
}

function VisibilityBadge({ isPublic }) {
  return isPublic ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-600">
      <Eye size={9} /> Public
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
      <EyeOff size={9} /> Private
    </span>
  );
}

const EMPTY_FORM = {
  code: '',
  description: '',
  discountType: 'FLAT',
  discountValue: '',
  maxDiscountCap: '',
  minOrderAmount: '',
  maxUses: '',
  maxUsesPerUser: '1',
  isPublic: false,
  isActive: true,
  expiresAt: '',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | inactive | expired | public | private
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);

  // ─── Data ─────────────────────────────────────────────────────────────────

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listAdminCoupons();
      setCoupons(data.coupons || []);
    } catch {
      showToast('Failed to load coupons.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // ─── Toast ────────────────────────────────────────────────────────────────

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ─── Modal helpers ────────────────────────────────────────────────────────

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  }

  function openEdit(coupon) {
    setEditTarget(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue?.toString() || '',
      maxDiscountCap: coupon.maxDiscountCap?.toString() || '',
      minOrderAmount: coupon.minOrderAmount?.toString() || '',
      maxUses: coupon.maxUses?.toString() || '',
      maxUsesPerUser: coupon.maxUsesPerUser?.toString() || '1',
      isPublic: coupon.isPublic,
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split('T')[0]
        : '',
    });
    setFormError('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setFormError('');
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!form.code.trim()) return setFormError('Coupon code is required.');
    if (!form.discountValue || isNaN(Number(form.discountValue)))
      return setFormError('Discount value must be a valid number.');

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscountCap: form.maxDiscountCap ? Number(form.maxDiscountCap) : null,
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      maxUsesPerUser: form.maxUsesPerUser ? Number(form.maxUsesPerUser) : 1,
      isPublic: form.isPublic,
      isActive: form.isActive,
      expiresAt: form.expiresAt || null,
    };

    try {
      setSaving(true);
      if (editTarget) {
        await updateAdminCoupon(editTarget.id, payload);
        showToast('Coupon updated successfully!');
      } else {
        await createAdminCoupon(payload);
        showToast('Coupon created successfully!');
      }
      closeModal();
      fetchCoupons();
    } catch (err) {
      setFormError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  // ─── Quick toggle ─────────────────────────────────────────────────────────

  async function toggleActive(coupon) {
    try {
      await updateAdminCoupon(coupon.id, { isActive: !coupon.isActive });
      showToast(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}.`);
      fetchCoupons();
    } catch {
      showToast('Failed to update coupon.', 'error');
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteAdminCoupon(deleteTarget.id);
      showToast('Coupon deleted.');
      setDeleteTarget(null);
      fetchCoupons();
    } catch {
      showToast('Failed to delete coupon.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  // ─── Copy code ────────────────────────────────────────────────────────────

  function copyCode(id, code) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  const totalActive = coupons.filter((c) => c.isActive && !isExpired(c.expiresAt)).length;
  const totalExpired = coupons.filter((c) => isExpired(c.expiresAt)).length;
  const totalRedemptions = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);

  // ─── Filtered list ────────────────────────────────────────────────────────

  const filtered = coupons.filter((c) => {
    const matchSearch =
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());

    let matchFilter = true;
    if (filter === 'active') matchFilter = c.isActive && !isExpired(c.expiresAt);
    else if (filter === 'inactive') matchFilter = !c.isActive;
    else if (filter === 'expired') matchFilter = isExpired(c.expiresAt);
    else if (filter === 'public') matchFilter = c.isPublic;
    else if (filter === 'private') matchFilter = !c.isPublic;

    return matchSearch && matchFilter;
  });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#E8EDF2] p-6 lg:p-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[500] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-bold ${
              toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#CE2029]/10 flex items-center justify-center">
              <Tag size={18} className="text-[#CE2029]" />
            </div>
            <h1 className="text-2xl font-black text-[#243B53] tracking-tight">
              Coupon Management
            </h1>
          </div>
          <p className="text-[12px] font-semibold text-[#627D98] ml-10">
            Create and manage discount codes for your customers
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#CE2029] text-white text-[12px] font-black uppercase tracking-widest hover:bg-[#a91820] transition-all shadow-lg shadow-[#CE2029]/20 hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus size={16} strokeWidth={3} /> Create Coupon
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Coupons',
            value: coupons.length,
            icon: Tag,
            color: 'text-[#243B53]',
            bg: 'bg-white',
          },
          {
            label: 'Active',
            value: totalActive,
            icon: CheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Expired',
            value: totalExpired,
            icon: Clock,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
          {
            label: 'Total Redemptions',
            value: totalRedemptions,
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-2xl p-5 border border-white/80 shadow-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#627D98]">
                {stat.label}
              </p>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-white/80 shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627D98]"
          />
          <input
            type="text"
            placeholder="Search by code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[12px] font-semibold rounded-xl bg-[#E8EDF2] border-none outline-none text-[#243B53] placeholder:text-[#627D98]/60"
          />
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {['all', 'active', 'inactive', 'expired', 'public', 'private'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                filter === f
                  ? 'bg-[#CE2029] text-white shadow-md'
                  : 'bg-[#E8EDF2] text-[#627D98] hover:bg-[#D9E2EC]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-white/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-[#627D98] font-semibold text-sm">
            Loading coupons…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Tag size={40} className="text-[#D9E2EC] mx-auto mb-3" />
            <p className="text-[#627D98] font-bold text-sm">No coupons found</p>
            <p className="text-[#627D98]/60 font-semibold text-[11px] mt-1">
              {search || filter !== 'all' ? 'Try adjusting your filters' : 'Create your first coupon to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E8EDF2]">
                  {['Code', 'Discount', 'Visibility', 'Usage', 'Expiry', 'Status', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-[#627D98]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((coupon, idx) => (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="border-b border-[#E8EDF2] last:border-0 hover:bg-[#F7F9FB] transition-colors group"
                  >
                    {/* Code */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-[13px] text-[#243B53] font-mono tracking-wider bg-[#E8EDF2] px-2.5 py-1 rounded-lg">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyCode(coupon.id, coupon.code)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#627D98] hover:text-[#CE2029]"
                          title="Copy code"
                        >
                          {copiedId === coupon.id ? (
                            <CheckCircle size={14} className="text-emerald-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                      {coupon.description && (
                        <p className="text-[10px] font-semibold text-[#627D98] mt-1 max-w-[180px] truncate">
                          {coupon.description}
                        </p>
                      )}
                    </td>

                    {/* Discount */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {coupon.discountType === 'PERCENTAGE' ? (
                          <Percent size={13} className="text-[#CE2029]" />
                        ) : (
                          <DollarSign size={13} className="text-[#CE2029]" />
                        )}
                        <span className="font-black text-[13px] text-[#243B53]">
                          {coupon.discountType === 'FLAT'
                            ? `OMR ${fmt(coupon.discountValue)} off`
                            : `${coupon.discountValue}% off`}
                        </span>
                      </div>
                      {coupon.discountType === 'PERCENTAGE' && coupon.maxDiscountCap && (
                        <p className="text-[9px] font-bold text-[#627D98] mt-0.5">
                          Max cap: OMR {fmt(coupon.maxDiscountCap)}
                        </p>
                      )}
                      {coupon.minOrderAmount > 0 && (
                        <p className="text-[9px] font-bold text-[#627D98] mt-0.5">
                          Min: OMR {fmt(coupon.minOrderAmount)}
                        </p>
                      )}
                    </td>

                    {/* Visibility */}
                    <td className="px-5 py-4">
                      <VisibilityBadge isPublic={coupon.isPublic} />
                    </td>

                    {/* Usage */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-[#627D98]" />
                        <span className="text-[12px] font-black text-[#243B53]">
                          {coupon.usedCount}
                          {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ' / ∞'}
                        </span>
                      </div>
                      {coupon.maxUses !== null && (
                        <div className="mt-1.5 h-1 w-20 bg-[#E8EDF2] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#CE2029] rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                (coupon.usedCount / coupon.maxUses) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </td>

                    {/* Expiry */}
                    <td className="px-5 py-4">
                      {coupon.expiresAt ? (
                        <span
                          className={`text-[11px] font-bold ${
                            isExpired(coupon.expiresAt) ? 'text-orange-500' : 'text-[#627D98]'
                          }`}
                        >
                          {new Date(coupon.expiresAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-[#627D98]">No expiry</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge coupon={coupon} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Toggle active */}
                        <button
                          onClick={() => toggleActive(coupon)}
                          className="text-[#627D98] hover:text-[#CE2029] transition-colors"
                          title={coupon.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {coupon.isActive ? (
                            <ToggleRight size={20} className="text-emerald-500" />
                          ) : (
                            <ToggleLeft size={20} />
                          )}
                        </button>

                        <button
                          onClick={() => openEdit(coupon)}
                          className="w-8 h-8 rounded-lg bg-[#E8EDF2] flex items-center justify-center text-[#627D98] hover:bg-[#CE2029]/10 hover:text-[#CE2029] transition-all"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(coupon)}
                          className="w-8 h-8 rounded-lg bg-[#E8EDF2] flex items-center justify-center text-[#627D98] hover:bg-red-50 hover:text-red-500 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-950 to-[#1a0a0b] p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Tag size={18} className="text-[#CE2029]" />
                    <h2 className="text-lg font-black text-white">
                      {editTarget ? 'Edit Coupon' : 'Create New Coupon'}
                    </h2>
                  </div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                    {editTarget ? `Editing: ${editTarget.code}` : 'Define the coupon parameters'}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Code + Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#627D98] mb-1.5">
                      Coupon Code <span className="text-[#CE2029]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.code}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                      }
                      placeholder="e.g. SUMMER25"
                      disabled={!!editTarget && editTarget.usedCount > 0}
                      className="w-full px-4 py-2.5 text-[13px] font-bold rounded-xl bg-[#E8EDF2] border border-transparent focus:border-[#CE2029] focus:outline-none text-[#243B53] placeholder:text-[#627D98]/50 font-mono tracking-wider uppercase transition-colors disabled:opacity-60"
                    />
                    {editTarget && editTarget.usedCount > 0 && (
                      <p className="text-[9px] font-bold text-amber-600 mt-1">
                        Code cannot be changed after redemptions.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#627D98] mb-1.5">
                      Description
                    </label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="e.g. Summer sale discount"
                      className="w-full px-4 py-2.5 text-[13px] font-semibold rounded-xl bg-[#E8EDF2] border border-transparent focus:border-[#CE2029] focus:outline-none text-[#243B53] placeholder:text-[#627D98]/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#627D98] mb-2">
                    Discount Type <span className="text-[#CE2029]">*</span>
                  </label>
                  <div className="flex gap-3">
                    {['FLAT', 'PERCENTAGE'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, discountType: type }))}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider border-2 transition-all ${
                          form.discountType === type
                            ? 'border-[#CE2029] bg-[#CE2029]/5 text-[#CE2029]'
                            : 'border-[#E8EDF2] bg-[#E8EDF2] text-[#627D98] hover:border-[#D9E2EC]'
                        }`}
                      >
                        {type === 'FLAT' ? <DollarSign size={14} /> : <Percent size={14} />}
                        {type === 'FLAT' ? 'Fixed Amount' : 'Percentage'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discount Value + Cap */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#627D98] mb-1.5">
                      {form.discountType === 'FLAT' ? 'Discount Amount (OMR)' : 'Discount %'}{' '}
                      <span className="text-[#CE2029]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max={form.discountType === 'PERCENTAGE' ? 100 : undefined}
                      step="any"
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, discountValue: e.target.value }))
                      }
                      placeholder={form.discountType === 'FLAT' ? '5.000' : '10'}
                      className="w-full px-4 py-2.5 text-[13px] font-bold rounded-xl bg-[#E8EDF2] border border-transparent focus:border-[#CE2029] focus:outline-none text-[#243B53] placeholder:text-[#627D98]/50 transition-colors"
                    />
                  </div>

                  {form.discountType === 'PERCENTAGE' && (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#627D98] mb-1.5">
                        Max Discount Cap (OMR)
                        <span className="font-normal normal-case tracking-normal text-[#627D98]/60 ml-1">
                          optional
                        </span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={form.maxDiscountCap}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, maxDiscountCap: e.target.value }))
                        }
                        placeholder="e.g. 20.000"
                        className="w-full px-4 py-2.5 text-[13px] font-bold rounded-xl bg-[#E8EDF2] border border-transparent focus:border-[#CE2029] focus:outline-none text-[#243B53] placeholder:text-[#627D98]/50 transition-colors"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#627D98] mb-1.5">
                      Min Order Amount (OMR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.minOrderAmount}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, minOrderAmount: e.target.value }))
                      }
                      placeholder="0.000 (no minimum)"
                      className="w-full px-4 py-2.5 text-[13px] font-bold rounded-xl bg-[#E8EDF2] border border-transparent focus:border-[#CE2029] focus:outline-none text-[#243B53] placeholder:text-[#627D98]/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#627D98] mb-1.5">
                      Total Max Uses
                      <span className="font-normal normal-case tracking-normal text-[#627D98]/60 ml-1">
                        blank = unlimited
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.maxUses}
                      onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                      placeholder="∞ unlimited"
                      className="w-full px-4 py-2.5 text-[13px] font-bold rounded-xl bg-[#E8EDF2] border border-transparent focus:border-[#CE2029] focus:outline-none text-[#243B53] placeholder:text-[#627D98]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#627D98] mb-1.5">
                      Max Uses Per User
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.maxUsesPerUser}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, maxUsesPerUser: e.target.value }))
                      }
                      placeholder="1"
                      className="w-full px-4 py-2.5 text-[13px] font-bold rounded-xl bg-[#E8EDF2] border border-transparent focus:border-[#CE2029] focus:outline-none text-[#243B53] placeholder:text-[#627D98]/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#627D98] mb-1.5">
                    Expiry Date
                    <span className="font-normal normal-case tracking-normal text-[#627D98]/60 ml-1">
                      optional
                    </span>
                  </label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full px-4 py-2.5 text-[13px] font-bold rounded-xl bg-[#E8EDF2] border border-transparent focus:border-[#CE2029] focus:outline-none text-[#243B53] transition-colors"
                  />
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Visibility */}
                  <div
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.isPublic
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-[#E8EDF2] bg-[#E8EDF2]'
                    }`}
                    onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {form.isPublic ? (
                          <Eye size={15} className="text-blue-500" />
                        ) : (
                          <EyeOff size={15} className="text-[#627D98]" />
                        )}
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#243B53]">
                          {form.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <div
                        className={`w-10 h-5 rounded-full relative transition-colors ${
                          form.isPublic ? 'bg-blue-500' : 'bg-[#D9E2EC]'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                            form.isPublic ? 'left-5' : 'left-0.5'
                          }`}
                        />
                      </div>
                    </div>
                    <p className="text-[9px] font-semibold text-[#627D98]">
                      {form.isPublic
                        ? 'Visible to all users in the checkout coupon list.'
                        : 'Hidden from users. Share the code manually with specific customers.'}
                    </p>
                  </div>

                  {/* Active */}
                  <div
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.isActive
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-[#E8EDF2] bg-[#E8EDF2]'
                    }`}
                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {form.isActive ? (
                          <CheckCircle size={15} className="text-emerald-500" />
                        ) : (
                          <XCircle size={15} className="text-[#627D98]" />
                        )}
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#243B53]">
                          {form.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div
                        className={`w-10 h-5 rounded-full relative transition-colors ${
                          form.isActive ? 'bg-emerald-500' : 'bg-[#D9E2EC]'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                            form.isActive ? 'left-5' : 'left-0.5'
                          }`}
                        />
                      </div>
                    </div>
                    <p className="text-[9px] font-semibold text-[#627D98]">
                      {form.isActive
                        ? 'Coupon is live and can be applied by users.'
                        : 'Coupon is disabled and cannot be redeemed.'}
                    </p>
                  </div>
                </div>

                {/* Error */}
                {formError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle size={14} className="text-red-500 shrink-0" />
                    <p className="text-[11px] font-bold text-red-600">{formError}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-[#627D98] bg-[#E8EDF2] hover:bg-[#D9E2EC] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-[#CE2029] text-white hover:bg-[#a91820] transition-all shadow-lg shadow-[#CE2029]/20 disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-black text-[#243B53] mb-2">Delete Coupon?</h3>
              <p className="text-[12px] font-semibold text-[#627D98] mb-1">
                Are you sure you want to delete{' '}
                <span className="font-black text-[#243B53] font-mono">{deleteTarget.code}</span>?
              </p>
              <p className="text-[10px] font-semibold text-[#627D98]/70 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-[#627D98] bg-[#E8EDF2] hover:bg-[#D9E2EC] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
