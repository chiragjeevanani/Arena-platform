import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, ChevronDown, ChevronUp, Download, Printer, Search,
  Filter, RefreshCw, X, Building2, BarChart3, DollarSign,
  Clock, CheckCircle2, XCircle, AlertCircle, Users, TrendingUp,
  FileText, Table2, FileSpreadsheet, Target, Zap, Activity,
  ArrowUpRight, Receipt, CreditCard, Wallet, Banknote, AlertTriangle,
  ChevronRight, Eye, EyeOff, ShieldCheck, UserCheck, Layers, LayoutGrid,
  Award, Phone, MapPin, Hash, Check
} from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import { useArenaPanel } from '../context/ArenaPanelContext';
import { getDailyCourtReport } from '../../../services/dailyReportApi';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';

// ── Formatting Helpers ────────────────────────────────────────────────────────

const fmtOMR = (val) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(val || 0);

const fmtDate = (str) => {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtTime = (isoStr) => {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

const STATUS_COLORS = {
  confirmed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  cancelled: 'bg-red-100 text-red-700 border border-red-200',
  completed: 'bg-blue-100 text-blue-700 border border-blue-200',
  rescheduled: 'bg-purple-100 text-purple-700 border border-purple-200',
};

const PRICING_COLORS = {
  peak: 'bg-orange-100 text-orange-700 border border-orange-200',
  normal: 'bg-slate-100 text-slate-600 border border-slate-200',
  weekend: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  holiday: 'bg-pink-100 text-pink-700 border border-pink-200',
};

const PAYMENT_COLORS = {
  online: 'text-blue-600',
  cash: 'text-emerald-600',
  wallet: 'text-purple-600',
  coupon: 'text-amber-600',
};

// ── Sub-components ───────────────────────────────────────────────────────────

const SummaryCard = ({ icon: Icon, label, value, sub, color = '#CE2029', accent = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-2xl p-5 border shadow-sm relative overflow-hidden group ${accent ? 'border-[#CE2029]/30 bg-gradient-to-br from-[#CE2029]/5 to-white' : 'border-slate-200'}`}
  >
    <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={38} style={{ color }} />
    </div>
    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1">{label}</p>
    <p className="text-xl md:text-2xl font-black" style={{ color: accent ? color : '#1e293b' }}>{value}</p>
    {sub && <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">{sub}</p>}
  </motion.div>
);

const UtilizationBar = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
        <span className="text-[11px] font-black text-[#36454F]">{value} <span className="text-slate-400 font-medium">/ {max}</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// Receipt Modal Component
const ReceiptModal = ({ booking, arena, onClose }) => {
  if (!booking) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Receipt className="text-[#CE2029]" size={20} />
            <h3 className="font-black text-sm uppercase tracking-wider text-[#36454F]">Official Booking Receipt</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <div id="printable-receipt" className="py-6 space-y-4 text-xs font-sans">
          <div className="text-center space-y-1 pb-4 border-b border-slate-100">
            <h4 className="text-base font-black text-[#CE2029] uppercase">{arena?.name || 'AMM SPORTS ARENA'}</h4>
            <p className="text-[10px] text-slate-400 font-semibold">{arena?.address || 'Muscat, Oman'}</p>
            <p className="text-[10px] text-slate-400 font-semibold">GST / Tax ID: {arena?.gstNumber || 'OM-TAX-982410'} | Tel: {arena?.phone || '+968 9000 0000'}</p>
            <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-full font-mono text-[10px] font-bold text-slate-600">
              Receipt #: {booking.receiptNumber}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl">
            <div>
              <span className="text-slate-400 text-[9px] uppercase font-bold block">Customer</span>
              <span className="font-bold text-slate-800">{booking.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase font-bold block">Phone</span>
              <span className="font-bold text-slate-800">{booking.customerPhone}</span>
            </div>
            <div className="mt-2">
              <span className="text-slate-400 text-[9px] uppercase font-bold block">Court</span>
              <span className="font-bold text-[#CE2029]">{booking.courtName}</span>
            </div>
            <div className="mt-2">
              <span className="text-slate-400 text-[9px] uppercase font-bold block">Time Slot</span>
              <span className="font-bold text-slate-800">{booking.timeSlot}</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-b border-slate-100 py-3">
            <div className="flex justify-between text-slate-600">
              <span>Base Slot Charge</span>
              <span className="font-mono">OMR {fmtOMR(booking.basePrice)}</span>
            </div>
            {booking.peakSurcharge > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Peak Hour Surcharge</span>
                <span className="font-mono">+OMR {fmtOMR(booking.peakSurcharge)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm text-[#36454F] pt-2 border-t border-slate-100">
              <span>Total Amount Paid</span>
              <span className="text-[#CE2029] font-mono">OMR {fmtOMR(booking.finalAmount)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>Payment: <strong className="text-slate-700 uppercase">{booking.paymentMethod}</strong></span>
            <span>Status: <strong className="text-emerald-600 uppercase">{booking.status}</strong></span>
            <span>Booked By: <strong className="text-slate-700">{booking.bookedBy}</strong></span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={() => window.print()} className="flex-1 py-2.5 bg-[#36454F] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
            <Printer size={14} /> Print Receipt
          </button>
          <button onClick={onClose} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const BookingRow = ({ booking, index, onReceiptClick }) => (
  <tr className={`text-[11px] transition-colors hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
    <td className="px-3 py-2.5 font-mono text-slate-400 text-[9px]">#{booking.bookingId}</td>
    <td className="px-3 py-2.5 font-mono text-[10px] font-bold text-slate-600">{booking.receiptNumber}</td>
    <td className="px-3 py-2.5 font-semibold text-[#36454F]">{booking.customerName}</td>
    <td className="px-3 py-2.5 text-slate-500">{booking.customerPhone}</td>
    <td className="px-3 py-2.5 text-slate-600 font-bold">{booking.courtName}</td>
    <td className="px-3 py-2.5 text-slate-500 font-medium">{booking.timeSlot}</td>
    <td className="px-3 py-2.5">
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${PRICING_COLORS[booking.pricingType] || 'bg-slate-100 text-slate-500'}`}>
        {booking.pricingType}
      </span>
    </td>
    <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">{fmtOMR(booking.basePrice)}</td>
    <td className="px-3 py-2.5 text-right tabular-nums text-orange-600">{booking.peakSurcharge > 0 ? `+${fmtOMR(booking.peakSurcharge)}` : '—'}</td>
    <td className="px-3 py-2.5 text-right tabular-nums font-black text-[#36454F]">{fmtOMR(booking.finalAmount)}</td>
    <td className="px-3 py-2.5">
      <span className={`font-bold ${PAYMENT_COLORS[booking.paymentMethod] || 'text-slate-500'}`}>
        {booking.paymentMethod?.toUpperCase() || '—'}
      </span>
    </td>
    <td className="px-3 py-2.5">
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${STATUS_COLORS[booking.status] || 'bg-slate-100 text-slate-500'}`}>
        {booking.status}
      </span>
    </td>
    <td className="px-3 py-2.5 text-slate-400">{booking.bookedBy}</td>
    <td className="px-3 py-2.5 text-center">
      <button onClick={() => onReceiptClick(booking)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#CE2029] text-slate-500 hover:text-white transition-colors">
        <Receipt size={13} />
      </button>
    </td>
  </tr>
);

const CourtSection = ({ court, expanded, onToggle, onReceiptClick }) => {
  const u = court.utilization;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Court Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#CE2029]/10 flex items-center justify-center">
            <Target size={18} className="text-[#CE2029]" />
          </div>
          <div className="text-left">
            <h3 className="text-[15px] font-black text-[#36454F] uppercase tracking-tight">{court.courtName}</h3>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{court.courtType}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Revenue</p>
            <p className="text-[16px] font-black text-[#CE2029]">OMR {fmtOMR(court.revenue.net)}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Utilization</p>
            <p className="text-[16px] font-black text-[#36454F]">{u.utilizationPct}%</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Bookings</p>
            <p className="text-[16px] font-black text-[#36454F]">{court.bookings.length}</p>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${expanded ? 'bg-[#CE2029] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 p-5 space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Utilization Breakdown */}
                <div className="col-span-2 bg-slate-50 rounded-xl p-4 space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#36454F] mb-3 flex items-center gap-2">
                    <Activity size={12} className="text-[#CE2029]" /> Slot Utilization
                  </h4>
                  <UtilizationBar label="Booked" value={u.booked} max={u.totalSlots} color="#CE2029" />
                  <UtilizationBar label="Blocked" value={u.blocked} max={u.totalSlots} color="#f59e0b" />
                  <UtilizationBar label="Available" value={u.available} max={u.totalSlots} color="#22c55e" />
                  {u.academy > 0 && <UtilizationBar label="Academy" value={u.academy} max={u.totalSlots + u.academy} color="#6366f1" />}
                  {u.maintenance > 0 && <UtilizationBar label="Maintenance" value={u.maintenance} max={u.totalSlots + u.maintenance} color="#94a3b8" />}
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Utilization Rate</span>
                      <span className="text-[13px] font-black text-[#CE2029]">{u.utilizationPct}%</span>
                    </div>
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="col-span-2 bg-slate-50 rounded-xl p-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#36454F] mb-3 flex items-center gap-2">
                    <DollarSign size={12} className="text-[#CE2029]" /> Revenue Breakdown
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Online', value: court.revenue.online, color: PAYMENT_COLORS.online, icon: CreditCard },
                      { label: 'Cash', value: court.revenue.cash, color: PAYMENT_COLORS.cash, icon: Banknote },
                      { label: 'Wallet', value: court.revenue.wallet, color: PAYMENT_COLORS.wallet, icon: Wallet },
                      { label: 'Coupon', value: court.revenue.coupon, color: PAYMENT_COLORS.coupon, icon: Receipt },
                    ].filter(r => r.value > 0).map(({ label, value, color, icon: I }) => (
                      <div key={label} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <I size={12} className={color} />
                          <span className="text-[10px] font-semibold text-slate-500 uppercase">{label}</span>
                        </div>
                        <span className={`text-[11px] font-black ${color}`}>OMR {fmtOMR(value)}</span>
                      </div>
                    ))}
                    {court.revenue.refunds > 0 && (
                      <div className="flex justify-between items-center text-red-500">
                        <span className="text-[10px] font-semibold uppercase flex items-center gap-1"><AlertTriangle size={11} /> Refunds</span>
                        <span className="text-[11px] font-black">-OMR {fmtOMR(court.revenue.refunds)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-black uppercase text-[#36454F]">Net Revenue</span>
                      <span className="text-[13px] font-black text-[#CE2029]">OMR {fmtOMR(court.revenue.net)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bookings Table */}
              {court.bookings.length > 0 ? (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#36454F] mb-3 flex items-center gap-2">
                    <Table2 size={12} className="text-[#CE2029]" /> Court Bookings ({court.bookings.length})
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left min-w-[1100px]">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <th className="px-3 py-3">ID</th>
                          <th className="px-3 py-3">Receipt #</th>
                          <th className="px-3 py-3">Customer</th>
                          <th className="px-3 py-3">Phone</th>
                          <th className="px-3 py-3">Court</th>
                          <th className="px-3 py-3">Time Slot</th>
                          <th className="px-3 py-3">Pricing</th>
                          <th className="px-3 py-3 text-right">Base</th>
                          <th className="px-3 py-3 text-right">Surcharge</th>
                          <th className="px-3 py-3 text-right">Final</th>
                          <th className="px-3 py-3">Payment</th>
                          <th className="px-3 py-3">Status</th>
                          <th className="px-3 py-3">Booked By</th>
                          <th className="px-3 py-3 text-center">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {court.bookings.map((b, i) => (
                          <BookingRow key={b.id} booking={b} index={i} onReceiptClick={onReceiptClick} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Target size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-[11px] font-bold uppercase tracking-widest">No bookings for this court on selected date</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Export Helpers ───────────────────────────────────────────────────────────

async function exportPDF(reportData, arenaName, selectedDate, generatedBy) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  const arenaInfo = reportData.arena || {};
  const arenaAddress = arenaInfo.address || 'Muscat, Oman';
  const arenaPhone = arenaInfo.phone || '+968 9000 0000';
  const arenaGst = arenaInfo.gstNumber || 'OM-TAX-982410';

  // 1. Enterprise Top Header
  doc.setFillColor(206, 32, 41);
  doc.rect(0, 0, W, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY COURT OPERATIONS & BOOKING REPORT', 14, 11);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${arenaName}  |  Address: ${arenaAddress}  |  Tel: ${arenaPhone}  |  GST/Tax: ${arenaGst}`, 14, 19);
  doc.text(`Report #: ${reportData.reportNumber || 'DCR-001'}  |  Date: ${selectedDate}  |  Generated by: ${generatedBy}  |  Time: ${new Date().toLocaleString('en-GB')}`, 14, 26);

  let y = 38;

  // 2. Operational & Revenue Summary Table
  const s = reportData.summary;
  doc.setTextColor(54, 69, 79);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('OPERATIONAL & REVENUE SUMMARY', 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value', 'Metric', 'Value']],
    body: [
      ['Total Bookings', String(s.total), 'Total Revenue', `OMR ${fmtOMR(s.totalRevenue)}`],
      ['Confirmed Bookings', String(s.confirmed), 'Online Payments', `OMR ${fmtOMR(s.onlineRevenue)}`],
      ['Pending Bookings', String(s.pending), 'Cash Collection', `OMR ${fmtOMR(s.cashRevenue)}`],
      ['Cancelled Bookings', String(s.cancelled), 'Wallet Payments', `OMR ${fmtOMR(s.walletRevenue)}`],
      ['Completed Bookings', String(s.completed), 'Refunds Issued', `OMR ${fmtOMR(s.refundAmount)}`],
      ['Peak Hour Bookings', String(s.peakBookings), 'Net Total Revenue', `OMR ${fmtOMR(s.netRevenue)}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [206, 32, 41], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14 },
    tableWidth: 268,
  });

  y = doc.lastAutoTable.finalY + 10;

  // 3. COURT BOOKING MATRIX / SLOT TIMELINE TABLE (HIGH PRIORITY)
  const matrixData = reportData.matrix;
  if (matrixData && matrixData.rows && matrixData.rows.length > 0) {
    if (y > 140) {
      doc.addPage();
      y = 14;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(206, 32, 41);
    doc.text('COURT BOOKING MATRIX / SLOT TIMELINE GRID', 14, y);
    y += 5;

    const matrixHead = ['Time Slot', ...matrixData.rows.map((r) => `${r.courtName}`)];
    const matrixBody = matrixData.timeSlots.map((slotTime) => {
      const rowCells = [slotTime];
      matrixData.rows.forEach((r) => {
        const slot = r.slots[slotTime];
        if (!slot) {
          rowCells.push('Available');
        } else if (slot.status === 'BOOKED') {
          rowCells.push(`BOOKED: ${slot.customerName}\n(${slot.receiptNumber})`);
        } else {
          rowCells.push(slot.status);
        }
      });
      return rowCells;
    });

    autoTable(doc, {
      startY: y,
      head: [matrixHead],
      body: matrixBody,
      theme: 'grid',
      headStyles: { fillColor: [54, 69, 79], fontSize: 7, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 6.5, halign: 'center' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold', width: 35 } },
      margin: { left: 14 },
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // 4. Court-wise Detailed Booking Tables
  for (const court of reportData.courts) {
    if (court.bookings.length === 0) continue;

    if (y > 150) {
      doc.addPage();
      y = 14;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(206, 32, 41);
    doc.text(`COURT: ${court.courtName.toUpperCase()} (${court.courtType})`, 14, y);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(
      `Revenue: OMR ${fmtOMR(court.revenue.net)}  |  Utilization: ${court.utilization.utilizationPct}%  |  Bookings: ${court.bookings.length}`,
      14,
      y + 5
    );
    y += 9;

    autoTable(doc, {
      startY: y,
      head: [['Receipt #', 'Customer', 'Phone', 'Time Slot', 'Pricing', 'Base (OMR)', 'Final (OMR)', 'Payment', 'Status']],
      body: court.bookings.map((b) => [
        b.receiptNumber,
        b.customerName,
        b.customerPhone,
        b.timeSlot,
        b.pricingType.toUpperCase(),
        fmtOMR(b.basePrice),
        fmtOMR(b.finalAmount),
        b.paymentMethod.toUpperCase(),
        b.status.toUpperCase(),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [54, 69, 79], fontSize: 7, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7 },
      margin: { left: 14 },
    });

    y = doc.lastAutoTable.finalY + 8;
  }

  // 5. Page Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}  |  ${arenaName} Operations Report  |  Generated by Arena Platform  |  CONFIDENTIAL`,
      14,
      doc.internal.pageSize.getHeight() - 8
    );
  }

  doc.save(`${reportData.reportNumber || 'Daily-Court-Report'}.pdf`);
}

async function exportExcel(reportData, selectedDate) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  const arenaInfo = reportData.arena || {};
  const s = reportData.summary;

  // 1. Report Summary Sheet
  const summaryData = [
    ['DAILY COURT OPERATIONS & BOOKING REPORT'],
    ['Report Number', reportData.reportNumber],
    ['Arena Name', arenaInfo.name || 'Arena'],
    ['Address', arenaInfo.address || 'Muscat, Oman'],
    ['Phone', arenaInfo.phone || '+968 9000 0000'],
    ['GST / Tax ID', arenaInfo.gstNumber || 'OM-TAX-982410'],
    ['Date Range', selectedDate],
    ['Generated At', new Date().toLocaleString()],
    [''],
    ['OPERATIONAL & REVENUE SUMMARY'],
    ['Total Bookings', s.total],
    ['Confirmed Bookings', s.confirmed],
    ['Pending Bookings', s.pending],
    ['Cancelled Bookings', s.cancelled],
    ['Completed Bookings', s.completed],
    ['Total Revenue (OMR)', s.totalRevenue],
    ['Online Revenue (OMR)', s.onlineRevenue],
    ['Cash Collection (OMR)', s.cashRevenue],
    ['Wallet Revenue (OMR)', s.walletRevenue],
    ['Coupons / Discounts (OMR)', s.couponRevenue],
    ['Refund Amount (OMR)', s.refundAmount],
    ['Net Total Revenue (OMR)', s.netRevenue],
    ['Peak Hour Bookings', s.peakBookings],
    ['Normal Hour Bookings', s.normalBookings],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // 2. Court Booking Matrix Sheet (HIGH PRIORITY)
  const matrixData = reportData.matrix;
  if (matrixData && matrixData.rows && matrixData.rows.length > 0) {
    const matrixHeaders = ['Time Slot', ...matrixData.rows.map((r) => `${r.courtName} (${r.courtType})`) ];
    const matrixRows = matrixData.timeSlots.map((slotTime) => {
      const rowData = [slotTime];
      matrixData.rows.forEach((r) => {
        const slot = r.slots[slotTime];
        if (!slot) {
          rowData.push('AVAILABLE');
        } else if (slot.status === 'BOOKED') {
          rowData.push(`BOOKED: ${slot.customerName} (${slot.receiptNumber}) - OMR ${slot.price}`);
        } else {
          rowData.push(slot.status);
        }
      });
      return rowData;
    });

    const matrixSheetData = [
      [`${arenaInfo.name || 'Arena'} — COURT BOOKING MATRIX / SLOT TIMELINE`],
      [`Report #: ${reportData.reportNumber} | Date: ${selectedDate}`],
      [],
      matrixHeaders,
      ...matrixRows,
    ];
    const matrixWs = XLSX.utils.aoa_to_sheet(matrixSheetData);
    XLSX.utils.book_append_sheet(wb, matrixWs, 'Court Matrix');
  }

  // 3. All Bookings Sheet
  const headers = [
    'Receipt #', 'Booking ID', 'Customer Name', 'Phone', 'Court',
    'Time Slot', 'Pricing Type', 'Base Price (OMR)', 'Peak Surcharge (OMR)',
    'Final Amount (OMR)', 'Payment Method', 'Payment Status', 'Booking Status',
    'Booked By', 'Created At'
  ];
  const rows = reportData.bookings.map((b) => [
    b.receiptNumber, b.bookingId, b.customerName, b.customerPhone, b.courtName,
    b.timeSlot, b.pricingType, b.basePrice, b.peakSurcharge, b.finalAmount,
    b.paymentMethod, b.paymentStatus, b.status, b.bookedBy,
    b.createdAt ? new Date(b.createdAt).toLocaleString('en-GB') : ''
  ]);
  const bookingsWs = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, bookingsWs, 'All Bookings');

  XLSX.writeFile(wb, `${reportData.reportNumber || 'Daily-Court-Report'}.xlsx`);
}

function exportCSV(reportData, selectedDate) {
  const arenaInfo = reportData.arena || {};
  const s = reportData.summary;
  const matrixData = reportData.matrix;

  let csvContent = `DAILY COURT OPERATIONS & BOOKING REPORT\n`;
  csvContent += `Report Number,${reportData.reportNumber}\n`;
  csvContent += `Arena Name,${arenaInfo.name || 'Arena'}\n`;
  csvContent += `Address,${arenaInfo.address || 'Muscat, Oman'}\n`;
  csvContent += `Phone,${arenaInfo.phone || '+968 9000 0000'}\n`;
  csvContent += `GST / Tax ID,${arenaInfo.gstNumber || 'OM-TAX-982410'}\n`;
  csvContent += `Date Range,${selectedDate}\n`;
  csvContent += `Generated At,${new Date().toLocaleString()}\n\n`;

  csvContent += `OPERATIONAL & REVENUE SUMMARY\n`;
  csvContent += `Total Bookings,${s.total}\n`;
  csvContent += `Confirmed,${s.confirmed}\n`;
  csvContent += `Pending,${s.pending}\n`;
  csvContent += `Cancelled,${s.cancelled}\n`;
  csvContent += `Completed,${s.completed}\n`;
  csvContent += `Total Revenue (OMR),${s.totalRevenue}\n`;
  csvContent += `Online Revenue (OMR),${s.onlineRevenue}\n`;
  csvContent += `Cash Collection (OMR),${s.cashRevenue}\n`;
  csvContent += `Wallet Revenue (OMR),${s.walletRevenue}\n`;
  csvContent += `Net Revenue (OMR),${s.netRevenue}\n\n`;

  if (matrixData && matrixData.rows && matrixData.rows.length > 0) {
    csvContent += `COURT BOOKING MATRIX / SLOT TIMELINE\n`;
    const matrixHeaders = ['Time Slot', ...matrixData.rows.map((r) => r.courtName)];
    csvContent += matrixHeaders.map((v) => `"${v}"`).join(',') + '\n';

    matrixData.timeSlots.forEach((slotTime) => {
      const rowCells = [slotTime];
      matrixData.rows.forEach((r) => {
        const slot = r.slots[slotTime];
        if (!slot) {
          rowCells.push('AVAILABLE');
        } else if (slot.status === 'BOOKED') {
          rowCells.push(`BOOKED: ${slot.customerName} (${slot.receiptNumber})`);
        } else {
          rowCells.push(slot.status);
        }
      });
      csvContent += rowCells.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\n';
    });
    csvContent += '\n';
  }

  csvContent += `DETAILED BOOKINGS LIST\n`;
  const headers = [
    'Receipt #', 'Booking ID', 'Customer Name', 'Phone', 'Court',
    'Time Slot', 'Pricing Type', 'Base Price', 'Peak Surcharge',
    'Final Amount', 'Payment Method', 'Payment Status', 'Booking Status',
    'Booked By', 'Created At'
  ];
  csvContent += headers.map((v) => `"${v}"`).join(',') + '\n';

  reportData.bookings.forEach((b) => {
    const row = [
      b.receiptNumber, b.bookingId, b.customerName, b.customerPhone, b.courtName,
      b.timeSlot, b.pricingType, b.basePrice, b.peakSurcharge, b.finalAmount,
      b.paymentMethod, b.paymentStatus, b.status, b.bookedBy,
      b.createdAt ? new Date(b.createdAt).toLocaleString('en-GB') : ''
    ];
    csvContent += row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportData.reportNumber || 'Daily-Court-Report'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Component ───────────────────────────────────────────────────────────

const DailyCourtBookingReport = ({ overrideArenaId } = {}) => {
  const { user } = useAuth();
  const { allArenas, selectedArenaId, setSelectedArenaId } = useArenaPanel();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const effectiveArenaId = overrideArenaId || selectedArenaId;

  // ── Filter State ──────────────────────────────────────────────────
  const [dateMode, setDateMode] = useState('today');
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [courtFilter, setCourtFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [pricingTypeFilter, setPricingTypeFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // ── View Mode: 'matrix' (Timeline Grid) vs 'list' (Expandable Cards)
  const [viewMode, setViewMode] = useState('matrix');

  // ── Report State ──────────────────────────────────────────────────
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);

  // ── UI State ──────────────────────────────────────────────────────
  const [expandedCourts, setExpandedCourts] = useState({});
  const [exporting, setExporting] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (dateMode === 'today') { setFromDate(todayStr()); setToDate(todayStr()); }
    else if (dateMode === 'yesterday') { setFromDate(yesterdayStr()); setToDate(yesterdayStr()); }
  }, [dateMode]);

  // ── Fetch Report Data ─────────────────────────────────────────────
  const fetchReport = useCallback(async () => {
    if (!isApiConfigured() || !getAuthToken()) return;
    const arenaId = isSuperAdmin ? effectiveArenaId : undefined;
    if (isSuperAdmin && !arenaId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getDailyCourtReport(
        {
          arenaId,
          from: fromDate,
          to: toDate,
          courtId: courtFilter,
          status: statusFilter,
          paymentMethod: paymentFilter,
          pricingType: pricingTypeFilter,
          search,
          limit: 500,
        },
        user?.role
      );
      setReportData(data);
      if (data.courts) {
        const expanded = {};
        data.courts.forEach((c) => { expanded[c.courtId] = true; });
        setExpandedCourts(expanded);
      }
    } catch (e) {
      setError(e.message || 'Failed to load operational report');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, effectiveArenaId, fromDate, toDate, courtFilter, statusFilter, paymentFilter, pricingTypeFilter, search, user?.role]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const toggleCourt = (courtId) => {
    setExpandedCourts((prev) => ({ ...prev, [courtId]: !prev[courtId] }));
  };

  const handleExpandAll = () => {
    const expanded = {};
    (reportData?.courts || []).forEach((c) => { expanded[c.courtId] = true; });
    setExpandedCourts(expanded);
  };

  const handleCollapseAll = () => setExpandedCourts({});

  const handleExportPDF = async () => {
    if (!reportData) return;
    setExporting(true);
    try {
      await exportPDF(
        reportData,
        reportData.arena?.name || 'Arena',
        fromDate === toDate ? fromDate : `${fromDate} to ${toDate}`,
        user?.name || 'Admin'
      );
    } catch (e) {
      alert('PDF export failed: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!reportData) return;
    setExporting(true);
    try {
      await exportExcel(reportData, fromDate === toDate ? fromDate : `${fromDate}_${toDate}`);
    } catch (e) {
      alert('Excel export failed: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    exportCSV(reportData, fromDate === toDate ? fromDate : `${fromDate}_${toDate}`);
  };

  const handlePrint = () => window.print();

  const s = reportData?.summary;
  const cStats = reportData?.customerStats;
  const courts = reportData?.courts || [];
  const matrixData = reportData?.matrix;
  const arenaInfo = reportData?.arena;

  return (
    <div className="bg-[#F4F7F6] min-h-full font-sans print:bg-white" ref={printRef}>
      {/* Receipt Modal */}
      {selectedReceiptBooking && (
        <ReceiptModal
          booking={selectedReceiptBooking}
          arena={arenaInfo}
          onClose={() => setSelectedReceiptBooking(null)}
        />
      )}

      <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">

        {/* ── Official Enterprise Header ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#CE2029] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#CE2029]/20 shrink-0">
              <BarChart3 size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#CE2029]/10 text-[#CE2029] text-[9px] font-black uppercase tracking-widest border border-[#CE2029]/20">
                  {reportData?.reportNumber || 'DAILY OPERATIONS REPORT'}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Ref: {reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleString() : 'Live'}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-[#36454F] mt-1 tracking-tight">
                {arenaInfo?.name || 'AMM SPORTS ARENA'}
              </h1>
              <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-3 mt-1">
                <span><MapPin size={12} className="inline mr-1 text-[#CE2029]" />{arenaInfo?.address}</span>
                <span><Phone size={12} className="inline mr-1 text-slate-400" />{arenaInfo?.phone}</span>
                <span><Hash size={12} className="inline mr-1 text-slate-400" />GST: {arenaInfo?.gstNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <button onClick={fetchReport} disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#36454F] text-white text-[11px] font-bold uppercase tracking-widest shadow-sm hover:opacity-90 transition-all">
              <Printer size={14} /> Print
            </button>
            <div className="relative group">
              <button disabled={!reportData || exporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#CE2029] text-white text-[11px] font-bold uppercase tracking-widest shadow-sm hover:opacity-90 transition-all disabled:opacity-50">
                <Download size={14} /> Export {exporting && '...'}
                <ChevronDown size={12} />
              </button>
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all">
                <button onClick={handleExportPDF} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-[#36454F] hover:bg-slate-50 transition-colors">
                  <FileText size={14} className="text-[#CE2029]" /> Export PDF
                </button>
                <button onClick={handleExportExcel} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-[#36454F] hover:bg-slate-50 transition-colors border-t border-slate-100">
                  <FileSpreadsheet size={14} className="text-emerald-600" /> Export Excel
                </button>
                <button onClick={handleExportCSV} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-[#36454F] hover:bg-slate-50 transition-colors border-t border-slate-100">
                  <Table2 size={14} className="text-blue-600" /> Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filters Bar ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
                <Filter size={14} className="text-[#CE2029]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#36454F]">Filters</span>
              </div>
              <div className="flex gap-1.5">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: 'custom', label: 'Custom Date' },
                  { id: 'range', label: 'Date Range' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setDateMode(id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${
                      dateMode === id
                        ? 'bg-[#CE2029] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle (Matrix vs List) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  viewMode === 'matrix' ? 'bg-[#CE2029] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid size={13} /> Court Matrix Timeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  viewMode === 'list' ? 'bg-[#CE2029] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Table2 size={13} /> Detailed Booking Cards
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {(dateMode === 'custom' || dateMode === 'range') && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                  <Calendar size={13} className="text-slate-400" />
                  <input type="date" value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-transparent text-[11px] font-semibold text-[#36454F] outline-none border-none" />
                </div>
                {dateMode === 'range' && (
                  <>
                    <span className="text-slate-400 text-sm">→</span>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                      <Calendar size={13} className="text-slate-400" />
                      <input type="date" value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="bg-transparent text-[11px] font-semibold text-[#36454F] outline-none border-none" />
                    </div>
                  </>
                )}
              </div>
            )}

            {isSuperAdmin && !overrideArenaId && allArenas.length > 0 && (
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                <Building2 size={13} className="text-slate-400" />
                <select
                  value={selectedArenaId}
                  onChange={(e) => setSelectedArenaId(e.target.value)}
                  className="bg-transparent text-[11px] font-semibold text-[#36454F] outline-none border-none cursor-pointer pr-2 max-w-[160px]"
                >
                  {allArenas.map((a) => (
                    <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
              <Target size={13} className="text-slate-400" />
              <select value={courtFilter} onChange={(e) => setCourtFilter(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-[#36454F] outline-none border-none cursor-pointer pr-2">
                <option value="">All Courts</option>
                {courts.map((c) => (
                  <option key={c.courtId} value={c.courtId}>{c.courtName}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
              <CheckCircle2 size={13} className="text-slate-400" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-[#36454F] outline-none border-none cursor-pointer pr-2">
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
              <CreditCard size={13} className="text-slate-400" />
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-[#36454F] outline-none border-none cursor-pointer pr-2">
                <option value="">All Payments</option>
                <option value="online">Online</option>
                <option value="cash">Cash</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>

            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
              <Zap size={13} className="text-slate-400" />
              <select value={pricingTypeFilter} onChange={(e) => setPricingTypeFilter(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-[#36454F] outline-none border-none cursor-pointer pr-2">
                <option value="">All Pricing</option>
                <option value="peak">Peak Hours</option>
                <option value="normal">Normal Hours</option>
              </select>
            </div>

            <form onSubmit={handleSearch} className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 flex-1 min-w-[220px]">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search Receipt #, customer, phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-[#36454F] outline-none border-none flex-1 placeholder:text-slate-300"
              />
              {search && (
                <button type="button" onClick={() => { setSearchInput(''); setSearch(''); }}
                  className="text-slate-400 hover:text-[#CE2029]">
                  <X size={12} />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* ── Loading / Error ──────────────────────────────────────────── */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#CE2029]/20 border-t-[#CE2029] rounded-full animate-spin" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Generating Enterprise Operational Report...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <div>
              <p className="font-bold text-red-700 text-sm">Report Generation Error</p>
              <p className="text-[11px] text-red-500 mt-1">{error}</p>
            </div>
            <button onClick={fetchReport} className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg text-[11px] font-bold">Retry</button>
          </div>
        )}

        {/* ── Main Report Contents ─────────────────────────────────────── */}
        {!loading && s && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* ── High Priority Feature: Court Booking Matrix / Timeline View ── */}
            {viewMode === 'matrix' && matrixData && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#36454F] flex items-center gap-2">
                      <LayoutGrid size={16} className="text-[#CE2029]" /> Court Booking Matrix / Slot Timeline
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Operational overview showing court utilization at every hour slot for {fmtDate(fromDate)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Booked</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" /> Available</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Maintenance</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Academy</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-center text-[10px] border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-black uppercase">
                        <th className="p-3 text-left w-36 bg-slate-200/60 sticky left-0 z-10">Time Slot</th>
                        {matrixData.rows.map((r) => (
                          <th key={r.courtId} className="p-3 border-l border-slate-200 min-w-[130px]">
                            <div>{r.courtName}</div>
                            <div className="text-[8px] text-slate-400 font-normal uppercase">{r.courtType}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {matrixData.timeSlots.map((slotTime) => (
                        <tr key={slotTime} className="hover:bg-slate-50/50">
                          <td className="p-2.5 text-left font-mono font-bold text-slate-700 bg-slate-50 border-r border-slate-200 sticky left-0 z-10">
                            {slotTime}
                          </td>
                          {matrixData.rows.map((row) => {
                            const info = row.slots[slotTime] || { status: 'AVAILABLE' };
                            if (info.status === 'BOOKED') {
                              return (
                                <td key={row.courtId} className="p-2 border-l border-slate-200 bg-emerald-50 text-emerald-800 font-bold">
                                  <div className="rounded-lg p-1.5 bg-emerald-500/10 border border-emerald-300 text-left text-[9px] space-y-0.5">
                                    <div className="flex justify-between items-center">
                                      <span className="font-black text-emerald-900 truncate">{info.customerName}</span>
                                      <span className="font-mono text-[8px] text-emerald-600">#{info.bookingId}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[8px]">
                                      <span className="text-emerald-700 font-mono">OMR {fmtOMR(info.price)}</span>
                                      <span className="uppercase text-[7.5px] font-extrabold text-emerald-600">{info.paymentMethod}</span>
                                    </div>
                                  </div>
                                </td>
                              );
                            }
                            if (info.status === 'MAINTENANCE') {
                              return (
                                <td key={row.courtId} className="p-2 border-l border-slate-200 bg-amber-50 text-amber-700 font-bold text-[9px]">
                                  <span className="px-2 py-1 rounded bg-amber-100 border border-amber-300 block">Maintenance</span>
                                </td>
                              );
                            }
                            if (info.status === 'ACADEMY') {
                              return (
                                <td key={row.courtId} className="p-2 border-l border-slate-200 bg-purple-50 text-purple-700 font-bold text-[9px]">
                                  <span className="px-2 py-1 rounded bg-purple-100 border border-purple-300 block">Academy</span>
                                </td>
                              );
                            }
                            return (
                              <td key={row.courtId} className="p-2 border-l border-slate-200 text-slate-300 font-medium">
                                <span className="text-[9px] text-slate-400">Available</span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Summary Stats Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
              <SummaryCard icon={Users} label="Total Bookings" value={s.total} sub="All Statuses" accent />
              <SummaryCard icon={CheckCircle2} label="Confirmed" value={s.confirmed} color="#22c55e" />
              <SummaryCard icon={Clock} label="Pending" value={s.pending} color="#f59e0b" />
              <SummaryCard icon={XCircle} label="Cancelled" value={s.cancelled} color="#ef4444" />
              <SummaryCard icon={Activity} label="Completed" value={s.completed} color="#6366f1" />
              <SummaryCard icon={Zap} label="Peak Bookings" value={s.peakBookings} color="#f97316" />
              <SummaryCard icon={TrendingUp} label="Normal Bookings" value={s.normalBookings} color="#64748b" />
            </div>

            {/* ── Daily Cash & Payment Reconciliation ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Cash Collection */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#36454F] flex items-center gap-2">
                  <Banknote size={15} className="text-emerald-600" /> Daily Cash & Payment Reconciliation
                </h3>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="text-emerald-800 font-bold uppercase">Cash Collection</span>
                    <span className="font-black text-emerald-700 font-mono">OMR {fmtOMR(s.cashRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 border border-blue-100">
                    <span className="text-blue-800 font-bold uppercase">Online Payments</span>
                    <span className="font-black text-blue-700 font-mono">OMR {fmtOMR(s.onlineRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-purple-50 border border-purple-100">
                    <span className="text-purple-800 font-bold uppercase">Wallet Payments</span>
                    <span className="font-black text-purple-700 font-mono">OMR {fmtOMR(s.walletRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <span className="text-amber-800 font-bold uppercase">Coupons / Discount</span>
                    <span className="font-black text-amber-700 font-mono">OMR {fmtOMR(s.couponRevenue)}</span>
                  </div>
                  {s.refundAmount > 0 && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-red-50 border border-red-100 text-red-700">
                      <span className="font-bold uppercase">Refunds Issued</span>
                      <span className="font-black font-mono">-OMR {fmtOMR(s.refundAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span className="text-sm font-black uppercase text-[#36454F]">Net Total Revenue</span>
                    <span className="text-base font-black text-[#CE2029] font-mono">OMR {fmtOMR(s.netRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Booking Source Breakdown & Customer Stats */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#36454F] flex items-center gap-2">
                  <Layers size={15} className="text-[#CE2029]" /> Booking Source & Customer Stats
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Customer App</span>
                      <span className="text-lg font-black text-[#36454F]">{s.sources.app}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Reception / Walk-in</span>
                      <span className="text-lg font-black text-[#CE2029]">{s.sources.walkin + s.sources.admin}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Unique Customers</span>
                      <span className="font-black text-[#36454F]">{cStats?.uniqueCustomers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Returning Players</span>
                      <span className="font-black text-emerald-600">{cStats?.returningCustomers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">New Players</span>
                      <span className="font-black text-blue-600">{cStats?.newCustomers || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Peak Hour Analysis */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#36454F] flex items-center gap-2">
                  <Zap size={15} className="text-orange-500" /> Peak Hour Operational Analysis
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-orange-800 font-bold uppercase text-[9px]">Peak Revenue</span>
                      <span className="font-black text-orange-700 font-mono">OMR {fmtOMR(s.peakRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-800 font-bold uppercase text-[9px]">Normal Revenue</span>
                      <span className="font-black text-slate-700 font-mono">OMR {fmtOMR(s.normalRevenue)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold">Busiest Hour</span>
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-black text-[11px]">{s.peakHour} ({s.peakHourCount} bookings)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold">Quiet Slot</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-black text-[11px]">{s.leastHour}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Court Performance Ranking ── */}
            {reportData?.courtRankings?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#36454F] flex items-center gap-2">
                  <Award size={15} className="text-amber-500" /> Court Performance Ranking
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {reportData.courtRankings.map((c, idx) => (
                    <div key={c.courtId} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#CE2029]/10 text-[#CE2029] font-black text-xs flex items-center justify-center">
                          #{idx + 1}
                        </div>
                        <div>
                          <span className="font-black text-xs text-slate-800 block">{c.courtName}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">{c.utilization.utilizationPct}% Occupancy</span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-xs text-[#CE2029]">OMR {fmtOMR(c.revenue.net)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Court-wise Expandable Cards View ── */}
            {viewMode === 'list' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-black uppercase tracking-[0.15em] text-[#36454F] flex items-center gap-2">
                    <Target size={16} className="text-[#CE2029]" />
                    Court-wise Detailed Cards ({courts.length} courts)
                  </h3>
                  <div className="flex gap-2 print:hidden">
                    <button onClick={handleExpandAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-500 hover:text-[#CE2029] transition-colors">
                      <Eye size={12} /> Expand All
                    </button>
                    <button onClick={handleCollapseAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-500 hover:text-[#CE2029] transition-colors">
                      <EyeOff size={12} /> Collapse All
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {courts.map((court) => (
                    <CourtSection
                      key={court.courtId}
                      court={court}
                      expanded={!!expandedCourts[court.courtId]}
                      onToggle={() => toggleCourt(court.courtId)}
                      onReceiptClick={(b) => setSelectedReceiptBooking(b)}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Print Styles ────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default DailyCourtBookingReport;
