import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Clock, ChevronDown, ChevronUp,
  AlertTriangle, CalendarDays, TrendingUp,
} from 'lucide-react';
import EventBadge from './EventBadge';
import BookingCalendar from './BookingCalendar';
import ExtensionTimeline from './ExtensionTimeline';

/**
 * BookingCard — Full conflict-aware booking card
 * Accepts a *resolved* conflict booking (from resolveConflict()).
 */
const BookingCard = ({ booking, index = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const hasConflict = !!booking.event;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      className="w-full"
    >
      {/* ── Card shell ─────────────────────────────────────────────────── */}
      <div className={`rounded-2xl overflow-hidden border shadow-[0_8px_32px_-8px_rgba(54,69,79,0.18)]
        hover:shadow-[0_16px_40px_-8px_rgba(54,69,79,0.24)] transition-all duration-300
        ${hasConflict ? 'border-orange-200' : 'border-slate-100'} bg-white`}
      >
        {/* Glossy highlight strip */}
        <div className={`h-1 w-full ${hasConflict
          ? 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400'
          : 'bg-gradient-to-r from-emerald-400 to-teal-500'
        }`} />

        {/* ── Header row ───────────────────────────────────────────────── */}
        <div className="p-4 pb-3">
          {/* Arena image + name */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
              <img
                src={booking.arenaImage}
                alt={booking.arenaName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <h3 className="text-[17px] font-black text-[#36454F] leading-tight truncate">
                  {booking.arenaName}
                </h3>
                <div className="flex gap-1.5 flex-wrap">
                  {hasConflict && <EventBadge type="conflict" />}
                  {hasConflict && booking.overlappingDays > 0 && (
                    <EventBadge type="extended" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1 opacity-60">
                <MapPin size={10} className="text-[#36454F]" strokeWidth={2.5} />
                <span className="text-[9px] font-bold text-[#36454F] truncate">
                  {booking.location}
                </span>
              </div>
            </div>
          </div>

          {/* Booking meta grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { icon: MapPin, label: 'Court', value: booking.courtName, color: 'text-[#CE2029]' },
              { icon: Calendar, label: 'Start', value: booking.fmtStart, color: 'text-emerald-600' },
              { icon: Clock, label: 'Slot', value: booking.slot?.replace('–', '–'), color: 'text-blue-600' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                  {label}
                </p>
                <div className="flex items-center gap-1.5">
                  <Icon size={11} className={color} strokeWidth={2.5} />
                  <span className={`text-[12px] font-black ${color} truncate`}>{value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Date row (start → original end → final end) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-bold text-slate-500">{booking.fmtStart}</span>
            </div>
            <span className="text-slate-300 text-[11px]">→</span>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-[11px] font-bold text-slate-400 line-through">{booking.fmtOrigEnd}</span>
            </div>
            {hasConflict && booking.overlappingDays > 0 && (
              <>
                <span className="text-slate-300 text-[11px]">→</span>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[11px] font-black text-blue-700">{booking.fmtFinalEnd}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Conflict Alert banner ─────────────────────────────────────── */}
        {hasConflict && (
          <div className="mx-4 mb-2 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-3 flex items-start gap-2.5">
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center mt-0.5">
              <AlertTriangle size={13} className="text-orange-500" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-black text-orange-700 mb-1">Booking Affected by Event</p>
              <p className="text-[10.5px] font-bold text-orange-600 leading-relaxed">
                ⚠️ Your plan has been extended by{' '}
                <span className="text-blue-700 font-extrabold">{booking.overlappingDays} days</span>{' '}
                due to <span className="font-extrabold">"{booking.event.name}"</span>.
              </p>
            </div>
          </div>
        )}

        {/* ── Event conflict detail strip ───────────────────────────────── */}
        {hasConflict && (
          <div className="mx-4 mb-2 rounded-xl border border-red-100 bg-red-50/60 p-3">
            <div className="flex items-start gap-2">
              <CalendarDays size={13} className="text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <div className="flex-1">
                <p className="text-[11px] font-black text-red-700 mb-0.5">
                  {booking.event.name}
                </p>
                <p className="text-[10px] font-bold text-red-500">
                  {booking.fmtEventStart} → {booking.fmtEventEnd}
                </p>
              </div>
              <div className="flex-shrink-0 px-2.5 py-1.5 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-[11px] font-black text-red-600 text-center leading-tight">
                  {booking.overlappingDays}
                </p>
                <p className="text-[7px] font-black text-red-400 uppercase tracking-wide text-center">days</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Expand / Collapse button ──────────────────────────────────── */}
        {hasConflict && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400
              hover:text-[#CE2029] hover:bg-slate-50 border-t border-slate-100 transition-all"
          >
            {expanded ? (
              <>
                <ChevronUp size={12} strokeWidth={3} /> Hide Details
              </>
            ) : (
              <>
                <ChevronDown size={12} strokeWidth={3} /> View Calendar & Timeline
              </>
            )}
          </button>
        )}

        {/* ── Expanded panel ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-1 space-y-3">
                {/* Calendar */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-lg bg-[#CE2029]/10 flex items-center justify-center">
                      <Calendar size={10} className="text-[#CE2029]" strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#36454F]">
                      Calendar View
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <BookingCalendar
                      classifyDate={booking.classifyDate}
                      startDate={booking.startDate}
                      finalEndDate={booking.finalEndDate}
                    />
                  </div>
                </div>

                {/* Extension Timeline */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center">
                      <TrendingUp size={10} className="text-blue-600" strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#36454F]">
                      Booking Extension Timeline
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <ExtensionTimeline
                      fmtStart={booking.fmtStart}
                      fmtOrigEnd={booking.fmtOrigEnd}
                      fmtFinalEnd={booking.fmtFinalEnd}
                      fmtEventStart={booking.fmtEventStart}
                      fmtEventEnd={booking.fmtEventEnd}
                      overlappingDays={booking.overlappingDays}
                    />
                  </div>
                </div>

                {/* Extended Days summary */}
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-base font-black text-blue-700 leading-none">
                      +{booking.overlappingDays}
                    </span>
                    <span className="text-[7px] font-black text-blue-400 uppercase tracking-wide">days</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-700">
                      Plan Extended for Free
                    </p>
                    <p className="text-[9px] font-bold text-blue-500 mt-0.5 leading-relaxed">
                      Final end date changed from{' '}
                      <span className="line-through text-slate-400">{booking.fmtOrigEnd}</span> to{' '}
                      <span className="text-blue-700 font-black">{booking.fmtFinalEnd}</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BookingCard;
