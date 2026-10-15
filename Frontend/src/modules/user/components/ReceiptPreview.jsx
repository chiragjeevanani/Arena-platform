import Logo from '../../../assets/Logo (3).png';
import { formatOmr } from '../../../utils/bookingReceiptPdf';

/**
 * On-screen preview of the booking receipt PDF (utils/bookingReceiptPdf.js).
 * Takes the same normalized receipt object so both always show the same data.
 */
const ReceiptPreview = ({ receipt: r }) => {
  const cancelled = r.status === 'CANCELLED';
  const summary = [
    ['Booking Reference:', r.bookingRef],
    ['Payment Method:', r.paymentMethod],
    r.totalSlots && ['Total Slots:', r.totalSlots],
    ...(r.extraSummary || []),
  ].filter(Boolean);

  return (
    <div className="bg-white p-6 sm:p-8 shadow-lg border border-slate-200 w-[680px] min-w-[680px] md:w-full md:max-w-[700px] md:min-w-0 rounded-lg text-[#334155] font-sans">
      {/* Header */}
      <div className="flex justify-between items-start gap-6 pb-4 border-b-[3px] border-[#0F172A]">
        <div>
          <img src={Logo} alt="AMM Sports Arena" className="h-16 w-auto object-contain -ml-2 -my-2" />
          <p className="text-[11px] text-slate-500 mt-2">Premier Badminton &amp; Racquet Facility</p>
          <p className="text-[11px] text-slate-500">Ghala, Muscat | Contact: 91783155 | www.ammsportsarena.com</p>
        </div>
        <div className="text-right text-[11px] shrink-0">
          <h1 className="text-xl font-bold text-[#2563EB] mb-1">TAX INVOICE</h1>
          <p><span className="font-bold">Invoice #:</span> <span className="text-slate-500">{r.invoiceNo}</span></p>
          <p><span className="font-bold">Date:</span> <span className="text-slate-500">{r.invoiceDate}</span></p>
          <p className="mt-0.5">
            <span className="font-bold">Status:</span>{' '}
            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${cancelled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{r.status}</span>
          </p>
        </div>
      </div>

      {/* Billed to / summary */}
      <div className="grid grid-cols-2 gap-4 mt-5 text-[11px]">
        <div className="bg-slate-50 border border-slate-200 border-l-[3px] border-l-[#2563EB] rounded p-3.5 space-y-0.5">
          <h3 className="font-bold text-[#0F172A] text-xs mb-1">BILLED TO:</h3>
          <p className="font-bold text-[#0F172A]">{r.customer.name}</p>
          {r.customer.phone && <p>Phone: {r.customer.phone}</p>}
          {r.customer.email && <p className="break-all">Email: {r.customer.email}</p>}
        </div>
        <div className="bg-slate-50 border border-slate-200 border-l-[3px] border-l-[#2563EB] rounded p-3.5 space-y-0.5">
          <h3 className="font-bold text-[#0F172A] text-xs mb-1">BOOKING SUMMARY:</h3>
          {summary.map(([label, value]) => (
            <p key={label}><span className="font-bold text-[#0F172A]">{label}</span> {value}</p>
          ))}
        </div>
      </div>

      {/* Line items */}
      <h3 className="font-bold text-[#0F172A] text-[13px] mt-6 pb-1 border-b border-slate-300">{r.itemsTitle}</h3>
      <table className="w-full text-left border-collapse text-[11px] mt-2">
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
        <div className="w-60">
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
