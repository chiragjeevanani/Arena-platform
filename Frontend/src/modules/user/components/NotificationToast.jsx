import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';

/**
 * NotificationToast
 * Props:
 *   toasts: [{ id, message }]
 *   onDismiss(id): void
 *
 * Auto-dismisses after 5 s.
 */
const NotificationToast = ({ toasts = [], onDismiss }) => {
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[300] flex flex-col items-center gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="w-full pointer-events-auto"
          >
            <div className="flex items-start gap-3 bg-[#36454F] text-white rounded-2xl px-4 py-3.5 shadow-2xl shadow-[#36454F]/30 border border-white/10">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-orange-400/20 flex items-center justify-center mt-0.5">
                <Bell size={14} className="text-orange-300" />
              </div>
              <p className="text-[11px] font-bold leading-relaxed flex-1 text-white/90">
                {toast.message}
              </p>
              <button
                onClick={() => onDismiss(toast.id)}
                className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <X size={10} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * useConflictToasts — hook that auto-generates toasts & auto-dismisses them
 * Usage:
 *   const { toasts, dismiss } = useConflictToasts(resolvedBookings);
 */
export const useConflictToasts = (bookings = []) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!bookings.length) return;
    const initial = bookings.map((b, i) => ({
      id: `toast-${b.id}`,
      message: `Your booking on ${b.courtName} has been extended by ${b.overlappingDays} day${b.overlappingDays !== 1 ? 's' : ''} due to "${b.event.name}". New end date: ${b.fmtFinalEnd}.`,
    }));
    setToasts(initial);

    const timers = initial.map((t, i) =>
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 6000 + i * 1500)
    );
    return () => timers.forEach(clearTimeout);
  }, [bookings]);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, dismiss };
};

export default NotificationToast;
