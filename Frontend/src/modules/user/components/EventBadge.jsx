import { AlertTriangle, Zap } from 'lucide-react';

/**
 * EventBadge — red "Event Conflict" badge or green "Extended" badge
 * @param {'conflict'|'extended'} type
 * @param {string} [className]
 */
const EventBadge = ({ type, className = '' }) => {
  if (type === 'conflict') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
          bg-red-50 border border-red-200 text-red-600 shadow-sm ${className}`}
      >
        <AlertTriangle size={9} strokeWidth={3} />
        Event Conflict
      </span>
    );
  }

  if (type === 'extended') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
          bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm ${className}`}
      >
        <Zap size={9} strokeWidth={3} fill="currentColor" />
        Extended
      </span>
    );
  }

  return null;
};

export default EventBadge;
