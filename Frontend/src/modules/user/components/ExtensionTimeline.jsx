/**
 * ExtensionTimeline — Visual horizontal timeline showing:
 *   Booking Start → Event Blocked → Extended Days → Final End
 *
 * Props:
 *   fmtStart, fmtOrigEnd, fmtFinalEnd, fmtEventStart, fmtEventEnd
 *   overlappingDays (number)
 */
const ExtensionTimeline = ({
  fmtStart,
  fmtOrigEnd,
  fmtFinalEnd,
  fmtEventStart,
  fmtEventEnd,
  overlappingDays,
}) => {
  const segments = [
    {
      label: 'Active Booking',
      sublabel: `${fmtStart} → ${fmtEventStart}`,
      color: 'bg-emerald-400',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      dotColor: 'bg-emerald-500',
      flex: 3,
    },
    {
      label: 'Event Blocked',
      sublabel: `${fmtEventStart} → ${fmtEventEnd}`,
      color: 'bg-gradient-to-r from-red-400 to-orange-400',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      dotColor: 'bg-red-500',
      flex: overlappingDays,
    },
    {
      label: 'Extended',
      sublabel: `${fmtOrigEnd} → ${fmtFinalEnd}`,
      color: 'bg-gradient-to-r from-blue-400 to-indigo-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      dotColor: 'bg-blue-500',
      flex: overlappingDays,
    },
  ];

  return (
    <div className="w-full">
      {/* Bar */}
      <div className="flex rounded-xl overflow-hidden h-3 mb-3">
        {segments.map((s, i) => (
          <div
            key={i}
            className={`${s.color} transition-all`}
            style={{ flex: s.flex }}
          />
        ))}
      </div>

      {/* Segment labels */}
      <div className="flex gap-2">
        {segments.map((s, i) => (
          <div
            key={i}
            className={`flex-1 p-2 rounded-xl border ${s.bgColor} ${s.borderColor}`}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${s.dotColor} flex-shrink-0`} />
              <p className={`text-[8px] font-black uppercase tracking-widest ${s.textColor}`}>
                {s.label}
              </p>
            </div>
            <p className="text-[7px] font-bold text-slate-400 leading-tight">{s.sublabel}</p>
          </div>
        ))}
      </div>

      {/* Milestone labels */}
      <div className="flex justify-between mt-2 px-0.5">
        {[
          { label: 'Start', value: fmtStart },
          { label: 'Orig. End', value: fmtOrigEnd },
          { label: 'Final End', value: fmtFinalEnd, highlight: true },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="text-center">
            <p className={`text-[7px] font-black uppercase tracking-widest ${highlight ? 'text-blue-600' : 'text-slate-400'}`}>
              {label}
            </p>
            <p className={`text-[8px] font-black mt-0.5 ${highlight ? 'text-blue-700' : 'text-slate-500'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtensionTimeline;
