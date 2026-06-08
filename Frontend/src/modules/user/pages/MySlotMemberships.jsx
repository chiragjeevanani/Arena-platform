import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Star, ChevronDown, ChevronUp, Clock,
  CheckCircle2, AlertCircle, ArrowLeft, Gift, X, Zap
} from 'lucide-react';
import { getMySlotMemberships, freeMySlot } from '../../../services/slotMembershipApi';

const DAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getUpcomingDates(membership, slot, limit = 8) {
  if (!slot?.courtSlot?.dayOfWeek) return [];
  const targetDay = DAY_MAP[slot.courtSlot.dayOfWeek];
  if (targetDay === undefined) return [];

  const dates = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(membership.expiresAt);

  const cursor = new Date(start);
  while (cursor <= end && dates.length < limit) {
    if (cursor.getDay() === targetDay) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      const d = String(cursor.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function isBeforeDeadline(date, timeSlot, freeWindowHours = 24) {
  // Parse startTime from "06:00 AM - 07:00 AM" format
  const rawStart = timeSlot?.split(' - ')[0] || '';
  const match = rawStart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return true; // allow if can't parse

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const slotDateTime = new Date(`${date}T00:00:00`);
  slotDateTime.setHours(hours, minutes, 0, 0);
  const deadline = new Date(slotDateTime.getTime() - freeWindowHours * 3600 * 1000);
  return new Date() < deadline;
}

function StatusPill({ status }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    expired: 'bg-slate-50 text-slate-500 border border-slate-100',
    cancelled: 'bg-red-50 text-red-600 border border-red-100',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider ${styles[status] || styles.expired}`}>
      {status === 'active' && <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />}
      {status}
    </span>
  );
}

// ─── Free Slot Modal ──────────────────────────────────────────────────────────
function FreeSlotModal({ membership, slot, onClose, onSuccess }) {
  const upcomingDates = getUpcomingDates(membership, slot);
  const timeSlot = slot?.courtSlot?.timeSlot || '';
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const eligibleDates = upcomingDates.filter((d) => isBeforeDeadline(d, timeSlot));
  const targetDate = eligibleDates[0];

  const handleFree = async () => {
    if (!targetDate) return;
    setLoading(true);
    setErr('');
    try {
      const res = await freeMySlot(membership.id, {
        courtSlotId: slot.courtSlotId,
        freedDate: targetDate,
      });
      onSuccess(res);
    } catch (e) {
      setErr(e.message || 'Failed to free slot');
    } finally {
      setLoading(false);
    }
  };

  const d = targetDate ? new Date(targetDate + 'T12:00:00') : null;
  const dateLabel = d ? d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" onClick={onClose} />
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 inset-x-0 z-[210] bg-white rounded-t-3xl shadow-2xl p-6 pb-10 max-w-lg mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[#36454F]">Free Upcoming Slot</h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{timeSlot} · {slot?.courtName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
          <Gift size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] font-semibold text-amber-700 leading-snug">
            Free your next upcoming slot session that you cannot attend. You will earn bonus points, and the arena can resell the slot.
          </p>
        </div>

        {!targetDate ? (
          <div className="text-center py-8 text-slate-400 text-sm font-semibold">
            No upcoming dates eligible to be freed.
          </div>
        ) : (
          <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-slate-100/80 mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Release Date</p>
            <p className="text-base font-black text-[#36454F] mt-1">{dateLabel}</p>
            <p className="text-[10px] text-[#CE2029] font-bold mt-2">Are you sure you want to release this slot day?</p>
          </div>
        )}

        {err && (
          <div className="mb-4 p-3 bg-red-50 rounded-xl flex items-center gap-2">
            <AlertCircle size={14} className="text-red-500" />
            <p className="text-[11px] font-semibold text-[#CE2029]">{err}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={handleFree}
            disabled={!targetDate || loading}
            className="flex-[2] py-3 bg-[#CE2029] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#b01b22] transition-all active:scale-[0.98]"
          >
            <Zap size={14} />
            {loading ? 'Processing...' : 'Yes, Free Slot'}
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Slot Card ─────────────────────────────────────────────────────────────────
function SlotCard({ slot, membership, onFreeSuccess }) {
  const [freeModalOpen, setFreeModalOpen] = useState(false);
  const upcomingDates = getUpcomingDates(membership, slot, 3);
  const nextDate = upcomingDates[0];
  const timeSlot = slot?.courtSlot?.timeSlot || '';
  // Can open the modal if at least one upcoming date can be freed
  const canFree = membership.status === 'active' && upcomingDates.some((d) => isBeforeDeadline(d, timeSlot));

  return (
    <>
      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl group">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#CE2029]/10 flex items-center justify-center shrink-0">
            <CalendarDays size={14} className="text-[#CE2029]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#36454F]">{timeSlot}</p>
            <p className="text-[9.5px] text-slate-500 font-semibold">
              {slot?.courtSlot?.dayOfWeek || '—'}s · {slot?.courtName || 'Court'}
            </p>
            {nextDate && (
              <p className="text-[8.5px] text-slate-400 font-semibold mt-0.5">
                Next: {new Date(nextDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setFreeModalOpen(true)}
          disabled={!canFree}
          className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
            canFree
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 active:scale-95'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {canFree ? 'Free Slot' : 'N/A'}
        </button>
      </div>

      <AnimatePresence>
        {freeModalOpen && (
          <FreeSlotModal
            membership={membership}
            slot={slot}
            onClose={() => setFreeModalOpen(false)}
            onSuccess={(res) => {
              setFreeModalOpen(false);
              onFreeSuccess(res);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Membership Card ──────────────────────────────────────────────────────────
function MembershipCard({ membership, onFreeSuccess }) {
  const [expanded, setExpanded] = useState(false);
  const slots = membership.bookedSlotsDetail || [];
  const daysLeft = Math.max(0, Math.ceil((new Date(membership.expiresAt) - new Date()) / 86400000));

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-3.5 cursor-pointer flex items-center justify-between gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#CE2029] to-[#ff6b6b] flex items-center justify-center shadow-md shadow-[#CE2029]/15 shrink-0">
            <Star size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#36454F] leading-tight">{membership.planName || 'Slot Membership'}</p>
            <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
              {slots.length} slot{slots.length !== 1 ? 's' : ''} booked
            </p>
            <div className="flex items-center gap-2 mt-1">
              <StatusPill status={membership.status} />
              {membership.status === 'active' && (
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
                  {daysLeft}d left
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={10} className="fill-amber-400" />
            <span className="text-[11px] font-bold">{membership.bonusPointsEarned || 0} pts earned</span>
          </div>
          {expanded ? <ChevronUp size={14} className="text-slate-400 mt-0.5" /> : <ChevronDown size={14} className="text-slate-400 mt-0.5" />}
        </div>
      </div>

      {/* Dates row */}
      <div className="px-3.5 pb-2.5 flex items-center gap-1 text-[9px] font-medium text-slate-500">
        <Clock size={10} />
        <span>{new Date(membership.startsAt).toLocaleDateString()} → {new Date(membership.expiresAt).toLocaleDateString()}</span>
      </div>

      {/* Expanded slots */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-1.5 border-t border-slate-50 pt-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">Your Booked Slots</p>
              {slots.map((slot, i) => (
                <SlotCard
                  key={slot.courtSlotId || i}
                  slot={slot}
                  membership={membership}
                  onFreeSuccess={onFreeSuccess}
                />
              ))}
              {slots.length === 0 && (
                <p className="text-xs text-slate-400 font-semibold text-center py-4">No slots found for this membership.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const MySlotMemberships = () => {
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await getMySlotMemberships();
      setMemberships(data.memberships || []);
    } catch (e) {
      setErr(e.message || 'Failed to load memberships');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleFreeSuccess = (res) => {
    setToast(`🎉 +${res.pointsAwarded} bonus points earned! New balance: ${res.newPointsBalance} pts`);
    setTimeout(() => setToast(null), 4000);
    load(); // refresh
  };

  const active = memberships.filter((m) => m.status === 'active');
  const past = memberships.filter((m) => m.status !== 'active');

  return (
    <div className="min-h-screen bg-[#F4F7F6] pb-20 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-black text-[#36454F]">My Slot Memberships</h1>
            <p className="text-[11px] text-slate-500 font-bold">{active.length} active</p>
          </div>
          <button
            onClick={() => navigate('/profile/points-wallet')}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-[11px] font-black border border-amber-100 hover:bg-amber-100 transition-all"
          >
            <Star size={12} className="fill-amber-400" />
            Points
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {err && (
          <div className="p-4 bg-red-50 rounded-2xl flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-sm font-bold text-red-600">{err}</p>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-white rounded-3xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && memberships.length === 0 && (
          <div className="text-center py-16">
            <CalendarDays size={48} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-black text-slate-400">No Slot Memberships Yet</p>
            <p className="text-[11px] text-slate-400 font-bold mt-1">Reserve recurring court slots for weeks or months at once.</p>
            <button
              onClick={() => navigate('/slot-membership-purchase')}
              className="mt-4 px-5 py-3 bg-[#CE2029] text-white rounded-2xl text-xs font-black uppercase tracking-widest"
            >
              Browse Plans
            </button>
          </div>
        )}

        {!loading && active.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active</p>
            {active.map((m) => (
              <MembershipCard key={m.id} membership={m} onFreeSuccess={handleFreeSuccess} />
            ))}
          </div>
        )}

        {!loading && past.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Past</p>
            {past.map((m) => (
              <MembershipCard key={m.id} membership={m} onFreeSuccess={handleFreeSuccess} />
            ))}
          </div>
        )}
        {!loading && memberships.length > 0 && (
          <button
            onClick={() => navigate('/slot-membership-purchase')}
            className="w-full py-3 border-2 border-dashed border-[#CE2029]/30 text-[#CE2029] rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-[#CE2029]/5 transition-all flex items-center justify-center gap-2"
          >
            <CalendarDays size={13} />
            Add Another Slot Membership
          </button>
        )}
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto bg-[#36454F] text-white rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xl z-[300]"
          >
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <p className="text-sm font-bold flex-1">{toast}</p>
            <button onClick={() => setToast(null)} className="text-white/60 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MySlotMemberships;
