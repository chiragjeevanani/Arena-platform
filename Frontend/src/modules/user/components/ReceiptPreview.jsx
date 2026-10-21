import Logo from '../../../assets/Logo (3).png';
import { formatOmr } from '../../../utils/bookingReceiptPdf';

/**
 * On-screen version of the booking receipt PDF (utils/bookingReceiptPdf.js).
 * Takes the same normalized receipt object so both always show the same data.
 * Responsive: on phones the line-item table becomes stacked rows so nothing needs
 * zooming; from `sm` up it matches the PDF layout.
 */
const ReceiptPreview = ({ receipt: r, className = '' }) => {
  const cancelled = r.status === 'CANCELLED';
  const summary = [
    ['Booking Reference:', r.bookingRef],
    ['Payment Method:', r.paymentMethod],
    r.totalSlots && ['Total Slots:', r.totalSlots],
    ...(r.extraSummary || []),
  ].filter(Boolean);

  return (
    <div className={`bg-white p-4 sm:p-8 shadow-lg border border-slate-200 w-full max-w-[700px] rounded-lg text-[#334155] font-sans ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-6 pb-4 border-b-[3px] border-[#0F172A]">
        <div>
          <img src={Logo} alt="AMM Sports Arena" className="h-14 sm:h-16 w-auto object-contain -ml-2 -my-2" />
          <p className="text-[11px] text-slate-500 mt-2">Premier Badminton &amp; Racquet Facility</p>
          <p className="text-[11px] text-slate-500">Ghala, Muscat | Contact: 91783155 | www.ammsportsarena.com</p>
        </div>
        <div className="sm:text-right text-[11px] shrink-0">
          <h1 className="text-lg sm:text-xl font-bold text-[#2563EB] mb-1">TAX INVOICE</h1>
          <p><span className="font-bold">Invoice #:</span> <span className="text-slate-500">{r.invoiceNo}</span></p>
          <p><span className="font-bold">Date:</span> <span className="text-slate-500">{r.invoiceDate}</span></p>
          <p className="mt-0.5">
            <span className="font-bold">Status:</span>{' '}
            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${cancelled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{r.status}</span>
          </p>
        </div>
      </div>

      {/* Billed to / summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-5 text-[11px]">
        <div className="bg-slate-50 border border-slate-200 border-l-[3px] border-l-[#2563EB] rounded p-3.5 space-y-0.5 min-w-0">
          <h3 className="font-bold text-[#0F172A] text-xs mb-1">BILLED TO:</h3>
          <p className="font-bold text-[#0F172A]">{r.customer.name}</p>
          {r.customer.phone && <p>Phone: {r.customer.phone}</p>}
          {r.customer.email && <p className="break-all">Email: {r.customer.email}</p>}
        </div>
        <div className="bg-slate-50 border border-slate-200 border-l-[3px] border-l-[#2563EB] rounded p-3.5 space-y-0.5 min-w-0">
          <h3 className="font-bold text-[#0F172A] text-xs mb-1">BOOKING SUMMARY:</h3>
          {summary.map(([label, value]) => (
            <p key={label} className="break-words"><span className="font-bold text-[#0F172A]">{label}</span> {value}</p>
          ))}
        </div>
      </div>

      {/* Line items */}
      <h3 className="font-bold text-[#0F172A] text-[13px] mt-5 sm:mt-6 pb-1 border-b border-slate-300">{r.itemsTitle}</h3>

      {/* Phones: one stacked row per slot */}
      <div className="sm:hidden mt-2 divide-y divide-slate-200 border-b border-slate-200">
        {r.items.map((it, i) => (
          <div key={i} className={`py-2.5 px-1 flex items-start justify-between gap-3 text-[11px] ${i % 2 ? 'bg-slate-50' : ''}`}>
            <div className="min-w-0">
              <p className="font-bold text-[#0F172A]">{it.court}</p>
              <p>{it.date} · {it.slot}</p>
              <p className="text-slate-500">{[it.rateType, it.duration].filter((v) => v && v !== '—').join(' · ')}</p>
            </div>
            <span className="font-bold text-[#0F172A] whitespace-nowrap">{formatOmr(it.amount)}</span>
          </div>
        ))}
      </div>

      {/* Tablet / desktop: same table as the PDF */}
      <table className="hidden sm:table w-full text-left border-collapse text-[11px] mt-2">
        <thead>
          <tr className="bg-[#0F172A] text-white font-bold text-[10px] tracking-wide">
            <th className="py-2 px-2.5">DATE</th>
            <th className="py-2 px-2.5">COURT</th>
            <th className="py-2 px-2.5">TIME SLOT</th>
            <th className="py-2 px-2.5">RATE TYPE</th>
            <th className="py-2 px-2.5">DURATION</th>
            <th className="py-2 px-2.5 text-right">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {r.items.map((it, i) => (
            <tr key={i} className={`border-b border-slate-200 ${i % 2 ? 'bg-slate-50' : ''}`}>
              <td className="py-2.5 px-2.5">{it.date}</td>
              <td className="py-2.5 px-2.5">{it.court}</td>
              <td className="py-2.5 px-2.5">{it.slot}</td>
              <td className="py-2.5 px-2.5">{it.rateType}</td>
              <td className="py-2.5 px-2.5">{it.duration}</td>
              <td className="py-2.5 px-2.5 text-right whitespace-nowrap">{formatOmr(it.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mt-2 text-[12px]">
        <div className="w-full sm:w-60">
          <div className="flex justify-between py-1.5 px-2.5 border-b border-slate-200">
            <span className="text-slate-500">Subtotal</span><span className="font-bold text-[#0F172A]">{formatOmr(r.subtotal)}</span>
          </div>
          {r.discount > 0.0005 && (
            <div className="flex justify-between py-1.5 px-2.5 border-b border-slate-200">
              <span className="text-slate-500">Discount</span><span className="font-bold text-[#0F172A]">- {formatOmr(r.discount)}</span>
            </div>
          )}
          {r.taxAmount > 0.0005 && (
            <div className="flex justify-between py-1.5 px-2.5 border-b border-slate-200">
              <span className="text-slate-500">VAT ({r.taxPercent}%)</span><span className="font-bold text-[#0F172A]">{formatOmr(r.taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 px-2.5 border-t-2 border-[#0F172A] text-[#2563EB] text-sm">
            <span>Grand Total</span><span className="font-bold">{formatOmr(r.total)}</span>
          </div>
        </div>
      </div>

      {/* Reminder */}
      <div className="mt-4 bg-slate-50 border border-slate-200 border-l-[3px] border-l-[#0F172A] rounded p-3.5 text-[11px]">
        <h3 className="font-bold text-[#0F172A] text-xs mb-1">IMPORTANT REMINDER</h3>
        <p>Please present this digital or printed bill upon arrival at the front desk. Ensure all players carry non-marking court shoes. Full terms and conditions are included on page 2 of the downloaded PDF.</p>
      </div>
    </div>
  );
};

export default ReceiptPreview;
