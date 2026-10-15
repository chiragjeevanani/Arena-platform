import { jsPDF } from 'jspdf';
import Logo from '../assets/Logo (3).png';

/**
 * Booking receipt PDF (tax invoice + terms page), drawn with jsPDF vectors so
 * it stays crisp and doesn't depend on html2canvas rendering the live DOM.
 * Layout mirrors "AMM Sports Arena Booking Bill & Terms.pdf", with the logo in
 * place of the "AMM SPORTS ARENA" heading.
 */

const PAGE_W = 210;
const PAGE_H = 297;
const M = 18;
const R = PAGE_W - M;
const CONTENT_W = R - M;
const FOOTER_Y = 279;
const BODY_BOTTOM = FOOTER_Y - 8;

const C = {
  ink: '#0F172A',
  text: '#334155',
  muted: '#64748B',
  body: '#475569',
  line: '#E2E8F0',
  rule: '#CBD5E1',
  panel: '#F8FAFC',
  blue: '#2563EB',
  paidBg: '#DCFCE7',
  paidFg: '#15803D',
  cancelBg: '#FEE2E2',
  cancelFg: '#B91C1C',
};

const FACILITY_TAGLINE = 'Premier Badminton & Racquet Facility';
const FACILITY_CONTACT = 'Ghala, Muscat | Contact: 91783155 | www.ammsportsarena.com';

const REMINDER_TEXT =
  'Please present this digital or printed bill upon arrival at the front desk. Ensure all players carry non-marking court shoes. Full terms and conditions apply on the reverse side.';

const TERMS_INTRO =
  'By completing this booking and utilizing the facilities at AMM Sports Arena, the hirer and all participating players agree to adhere strictly to the following binding clauses.';

const TERMS = [
  {
    title: '1. Advance Payment & Confirmation',
    body: 'All court bookings must be paid for in full at the time of booking to secure the slot. Unpaid reservations are subject to automatic cancellation and release back into the public availability pool.',
  },
  {
    title: '2. Cancellation & Refund Policy',
    body: 'Cancellations must be made at least 24 hours prior to the scheduled booking time to receive a full refund or account credit. Cancellations made within 24 hours will forfeit the entire booking fee.',
  },
  {
    title: '3. Time Adherence & Overstay',
    body: 'Bookings are strictly time-bound. Late arrivals do not extend the allocated booking end time. Players must vacate the court promptly. Overstaying or unauthorized use incurs casual standard billing.',
  },
  {
    title: '4. Proper Footwear & Attire',
    body: 'Non-marking court shoes are strictly mandatory on all badminton courts to prevent specialized floor damage. Management reserves the right to deny court entry without refund for inappropriate footwear.',
  },
  {
    title: '5. Limitation of Liability',
    body: 'The facility, management, and staff accept no liability for any physical injuries, accidents, or medical incidents sustained on or off the courts. Players participate entirely at their own risk.',
  },
  {
    title: '6. Property & Valuables',
    body: 'Management is not responsible for personal belongings, equipment, or valuables lost, stolen, or damaged on premises. Players are solely responsible for securing their own personal gear.',
  },
  {
    title: '7. Code of Conduct & Facility Property',
    body: 'Food, open drinks (except water in closed bottles), and smoking are strictly prohibited inside the court enclosure. Any intentional damage to nets, posts, or facility property will result in immediate penalty charges matching replacement costs, plus potential suspension from future bookings.',
    full: true,
  },
];

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export const formatOmr = (n) => `OMR ${(Number(n) || 0).toFixed(3)}`;

/** "2026-10-10" / Date / ISO → "Oct 10, 2026"; unparseable strings pass through. */
export function formatReceiptDate(value) {
  if (!value) return '—';
  let d;
  if (value instanceof Date) d = value;
  else {
    const raw = String(value).trim();
    const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    d = ymd ? new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3])) : new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
  }
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseClock(str) {
  const m = String(str).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2] || '0', 10);
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

/** "06:00 PM - 07:00 PM" → "1 hr"; returns '—' when the slot can't be parsed. */
export function slotDurationLabel(slot) {
  const parts = String(slot || '').split(/\s*[-–—]\s*|\s+to\s+/i);
  if (parts.length !== 2) return '—';
  const start = parseClock(parts[0]);
  let end = parseClock(parts[1]);
  if (start == null || end == null) return '—';
  if (end <= start) end += 24 * 60;
  const hrs = (end - start) / 60;
  const n = Number.isInteger(hrs) ? hrs : Number(hrs.toFixed(1));
  return `${n} hr${n === 1 ? '' : 's'}`;
}

function slotHours(slot) {
  const label = slotDurationLabel(slot);
  const n = parseFloat(label);
  return Number.isFinite(n) ? n : 0;
}

export function paymentMethodLabel(method) {
  const m = String(method || '').toLowerCase();
  if (!m) return 'Online Card Gateway';
  if (m === 'wallet') return 'Wallet';
  if (m === 'partial_wallet') return 'Wallet + Online Gateway';
  if (['online', 'card', 'upi', 'bank_muscat', 'smartpay', 'gateway'].includes(m)) return 'Online Card Gateway';
  if (m === 'cash') return 'Cash';
  return m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function rateTypeLabel(pricingType) {
  return String(pricingType || '').toLowerCase() === 'peak' ? 'Peak Rate' : 'Standard Rate';
}

function shortRef(id, len) {
  const s = String(id || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
  return s ? s.slice(-len) : '';
}

// ---------------------------------------------------------------------------
// Logo (trimmed of its transparent padding, cached)
// ---------------------------------------------------------------------------

let logoPromise = null;

function loadLogo() {
  if (logoPromise) return logoPromise;
  logoPromise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, w, h);
        let minX = w, minY = h, maxX = -1, maxY = -1;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const a = data[i + 3];
            const nearWhite = data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245;
            if (a > 16 && !nearWhite) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        if (maxX < 0) {
          resolve({ dataUrl: canvas.toDataURL('image/png'), ratio: w / h });
          return;
        }
        const tw = maxX - minX + 1;
        const th = maxY - minY + 1;
        const out = document.createElement('canvas');
        out.width = tw;
        out.height = th;
        const octx = out.getContext('2d');
        // Flatten onto white and embed as JPEG — a raw PNG bloats the PDF to ~1MB.
        octx.fillStyle = '#FFFFFF';
        octx.fillRect(0, 0, tw, th);
        octx.drawImage(canvas, minX, minY, tw, th, 0, 0, tw, th);
        resolve({ dataUrl: out.toDataURL('image/jpeg', 0.92), ratio: tw / th });
      } catch (e) {
        console.warn('Receipt logo processing failed:', e);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = Logo;
  }).catch(() => null).then((res) => {
    if (!res) logoPromise = null; // allow a retry next time
    return res;
  });
  return logoPromise;
}

// ---------------------------------------------------------------------------
// Drawing primitives
// ---------------------------------------------------------------------------

function setFont(pdf, size, style = 'normal', color = C.text) {
  pdf.setFont('helvetica', style);
  pdf.setFontSize(size);
  pdf.setTextColor(color);
}

function hLine(pdf, x1, x2, y, color, width) {
  pdf.setDrawColor(color);
  pdf.setLineWidth(width);
  pdf.line(x1, y, x2, y);
}

function panel(pdf, x, y, w, h, accent) {
  pdf.setFillColor(C.panel);
  pdf.setDrawColor(C.line);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(x, y, w, h, 1.2, 1.2, 'FD');
  if (accent) {
    pdf.setFillColor(accent);
    pdf.rect(x, y, 0.9, h, 'F');
  }
}

/** "Label: value" on one baseline, wrapping the value if needed. Returns lines used. */
function labelValue(pdf, label, value, x, y, maxW, lineH) {
  setFont(pdf, 9, 'bold', C.ink);
  const lw = pdf.getTextWidth(`${label} `);
  pdf.text(`${label} `, x, y);
  setFont(pdf, 9, 'normal', C.text);
  const lines = pdf.splitTextToSize(String(value ?? '—'), Math.max(10, maxW - lw));
  lines.forEach((ln, i) => pdf.text(ln, x + lw, y + i * lineH));
  return lines.length;
}

function measureLabelValue(pdf, label, value, maxW) {
  setFont(pdf, 9, 'bold');
  const lw = pdf.getTextWidth(`${label} `);
  setFont(pdf, 9, 'normal');
  return pdf.splitTextToSize(String(value ?? '—'), Math.max(10, maxW - lw)).length;
}

function pill(pdf, text, xRight, baseline, bg, fg) {
  setFont(pdf, 7.5, 'bold', fg);
  const tw = pdf.getTextWidth(text);
  const w = tw + 5;
  const h = 4.6;
  pdf.setFillColor(bg);
  pdf.roundedRect(xRight - w, baseline - 3.4, w, h, 2.3, 2.3, 'F');
  pdf.text(text, xRight - w / 2, baseline, { align: 'center' });
  return w;
}

function drawFooter(pdf, leftText, page, total) {
  hLine(pdf, M, R, FOOTER_Y, C.line, 0.25);
  setFont(pdf, 8.5, 'normal', C.muted);
  pdf.text(leftText, M, FOOTER_Y + 6);
  pdf.text(`Page ${page} of ${total}`, R, FOOTER_Y + 6, { align: 'right' });
}

// ---------------------------------------------------------------------------
// Page 1: tax invoice
// ---------------------------------------------------------------------------

const COLS = [
  { key: 'date', label: 'DATE', x: M, w: 34.5 },
  { key: 'court', label: 'COURT', x: M + 34.5, w: 20 },
  { key: 'slot', label: 'TIME SLOT', x: M + 54.5, w: 41 },
  { key: 'rateType', label: 'RATE TYPE', x: M + 95.5, w: 29 },
  { key: 'duration', label: 'DURATION', x: M + 124.5, w: 22 },
  { key: 'amount', label: 'AMOUNT', x: M + 146.5, w: CONTENT_W - 146.5, right: true },
];
const CELL_PAD = 2.8;

function drawTableHeader(pdf, y) {
  pdf.setFillColor(C.ink);
  pdf.rect(M, y, CONTENT_W, 8, 'F');
  setFont(pdf, 8, 'bold', '#FFFFFF');
  COLS.forEach((c) => {
    if (c.right) pdf.text(c.label, c.x + c.w - CELL_PAD, y + 5.3, { align: 'right' });
    else pdf.text(c.label, c.x + CELL_PAD, y + 5.3);
  });
  return y + 8;
}

function drawInvoiceHeader(pdf, r, logo) {
  // Left: logo (replaces the "AMM SPORTS ARENA" heading) + facility lines
  const logoH = 19;
  let leftBottom;
  if (logo) {
    const logoW = Math.min(logoH * logo.ratio, 70);
    pdf.addImage(logo.dataUrl, logo.dataUrl.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG', M, 11, logoW, logoW / logo.ratio);
    leftBottom = 11 + logoW / logo.ratio;
  } else {
    setFont(pdf, 20, 'bold', C.ink);
    pdf.text('AMM SPORTS ARENA', M, 22);
    leftBottom = 24;
  }
  setFont(pdf, 9, 'normal', C.muted);
  pdf.text(FACILITY_TAGLINE, M, leftBottom + 5);
  pdf.text(FACILITY_CONTACT, M, leftBottom + 9.3);

  // Right: title + meta
  setFont(pdf, 16, 'bold', C.blue);
  pdf.text('TAX INVOICE', R, 19, { align: 'right' });

  const meta = (label, value, y) => {
    setFont(pdf, 9, 'normal', C.muted);
    const vw = pdf.getTextWidth(value);
    pdf.text(value, R, y, { align: 'right' });
    setFont(pdf, 9, 'bold', C.text);
    pdf.text(label, R - vw - 1, y, { align: 'right' });
  };
  meta('Invoice #:', r.invoiceNo, 25.5);
  meta('Date:', r.invoiceDate, 30);

  const cancelled = r.status === 'CANCELLED';
  const pw = pill(pdf, r.status, R, 35.2, cancelled ? C.cancelBg : C.paidBg, cancelled ? C.cancelFg : C.paidFg);
  setFont(pdf, 9, 'bold', C.text);
  pdf.text('Status:', R - pw - 1.2, 35.2, { align: 'right' });

  const dividerY = Math.max(leftBottom + 13, 40);
  hLine(pdf, M, R, dividerY, C.ink, 0.7);
  return dividerY;
}

function drawInfoPanels(pdf, r, top) {
  const gap = 4;
  const w = (CONTENT_W - gap) / 2;
  const innerW = w - 8;
  const lineH = 4.6;

  const billed = [
    r.customer.phone && ['Phone:', r.customer.phone],
    r.customer.email && ['Email:', r.customer.email],
    r.customer.memberId && ['Member ID:', r.customer.memberId],
  ].filter(Boolean);
  const summary = [
    ['Booking Reference:', r.bookingRef],
    ['Payment Method:', r.paymentMethod],
    r.totalSlots && ['Total Slots:', r.totalSlots],
    ...(r.extraSummary || []),
  ].filter(Boolean);

  setFont(pdf, 9, 'bold');
  const nameLines = pdf.splitTextToSize(r.customer.name || 'Valued Customer', innerW);
  const leftLines = nameLines.length + billed.reduce((n, [l, v]) => n + measureLabelValue(pdf, l, v, innerW), 0);
  const rightLines = summary.reduce((n, [l, v]) => n + measureLabelValue(pdf, l, v, innerW), 0);
  const h = 13 + Math.max(leftLines, rightLines) * lineH;

  const xL = M;
  const xR = M + w + gap;
  panel(pdf, xL, top, w, h, C.blue);
  panel(pdf, xR, top, w, h, C.blue);

  setFont(pdf, 9.5, 'bold', C.ink);
  pdf.text('BILLED TO:', xL + 4.5, top + 6.5);
  pdf.text('BOOKING SUMMARY:', xR + 4.5, top + 6.5);

  let y = top + 11.5;
  setFont(pdf, 9, 'bold', C.ink);
  nameLines.forEach((ln) => {
    pdf.text(ln, xL + 4.5, y);
    y += lineH;
  });
  billed.forEach(([l, v]) => {
    setFont(pdf, 9, 'normal', C.text);
    const lines = pdf.splitTextToSize(`${l} ${v}`, innerW);
    lines.forEach((ln) => {
      pdf.text(ln, xL + 4.5, y);
      y += lineH;
    });
  });

  y = top + 11.5;
  summary.forEach(([l, v]) => {
    y += labelValue(pdf, l, v, xR + 4.5, y, innerW, lineH) * lineH;
  });

  return top + h;
}

function drawLineItems(pdf, r, startY, newPage) {
  let y = startY;
  setFont(pdf, 11, 'bold', C.ink);
  pdf.text(r.itemsTitle, M, y);
  hLine(pdf, M, R, y + 2.2, C.rule, 0.3);
  y = drawTableHeader(pdf, y + 4);

  r.items.forEach((item, idx) => {
    setFont(pdf, 9, 'normal', C.text);
    const cells = COLS.map((c) => {
      const v = c.key === 'amount' ? formatOmr(item.amount) : (item[c.key] ?? '—');
      return pdf.splitTextToSize(String(v), c.w - CELL_PAD * 2);
    });
    const rowH = Math.max(...cells.map((l) => l.length)) * 4 + 4.8;

    if (y + rowH > BODY_BOTTOM) {
      y = drawTableHeader(pdf, newPage());
    }

    if (idx % 2 === 1) {
      pdf.setFillColor(C.panel);
      pdf.rect(M, y, CONTENT_W, rowH, 'F');
    }
    setFont(pdf, 9, 'normal', C.text);
    COLS.forEach((c, ci) => {
      cells[ci].forEach((ln, li) => {
        const ty = y + 5.4 + li * 4;
        if (c.right) pdf.text(ln, c.x + c.w - CELL_PAD, ty, { align: 'right' });
        else pdf.text(ln, c.x + CELL_PAD, ty);
      });
    });
    y += rowH;
    hLine(pdf, M, R, y, C.line, 0.25);
  });
  return y;
}

function drawTotals(pdf, r, startY, newPage) {
  const rows = [['Subtotal', r.subtotal]];
  if (r.discount > 0.0005) rows.push(['Discount', -r.discount]);
  if (r.taxAmount > 0.0005) rows.push([`VAT (${r.taxPercent}%)`, r.taxAmount]);
  const blockH = rows.length * 7 + 10;

  let y = startY + 1.5;
  if (y + blockH > BODY_BOTTOM) y = newPage();

  const x1 = M + 107;
  rows.forEach(([label, val], i) => {
    setFont(pdf, 9.5, 'normal', C.muted);
    pdf.text(label, x1 + 2.8, y + 5);
    setFont(pdf, 9.5, 'bold', C.ink);
    const txt = val < 0 ? `- ${formatOmr(-val)}` : formatOmr(val);
    pdf.text(txt, R - CELL_PAD, y + 5, { align: 'right' });
    y += 7;
    if (i < rows.length - 1) hLine(pdf, x1, R, y, C.line, 0.25);
  });
  hLine(pdf, x1, R, y, C.ink, 0.6);
  setFont(pdf, 11.5, 'normal', C.blue);
  pdf.text('Grand Total', x1 + 2.8, y + 6.3);
  setFont(pdf, 11.5, 'bold', C.blue);
  pdf.text(formatOmr(r.total), R - CELL_PAD, y + 6.3, { align: 'right' });
  return y + 10;
}

function drawReminder(pdf, startY, newPage) {
  setFont(pdf, 9, 'normal', C.text);
  const lines = pdf.splitTextToSize(REMINDER_TEXT, CONTENT_W - 9);
  const h = 11.5 + lines.length * 4.5;
  let y = startY + 3;
  if (y + h > BODY_BOTTOM) y = newPage();
  panel(pdf, M, y, CONTENT_W, h, C.ink);
  setFont(pdf, 9.5, 'bold', C.ink);
  pdf.text('IMPORTANT REMINDER', M + 4.5, y + 6.3);
  setFont(pdf, 9, 'normal', C.text);
  lines.forEach((ln, i) => pdf.text(ln, M + 4.5, y + 11.3 + i * 4.5));
  return y + h;
}

// ---------------------------------------------------------------------------
// Terms page
// ---------------------------------------------------------------------------

function drawTermsPage(pdf) {
  let y = 22;
  setFont(pdf, 12, 'bold', C.ink);
  pdf.text('TERMS, CONDITIONS & FACILITY RULES', M, y);
  hLine(pdf, M, R, y + 2.4, C.rule, 0.3);

  setFont(pdf, 9, 'normal', C.muted);
  const intro = pdf.splitTextToSize(TERMS_INTRO, CONTENT_W);
  intro.forEach((ln, i) => pdf.text(ln, M, y + 7 + i * 3.9));
  y += 7 + intro.length * 3.9 + 2;

  const gap = 3.5;
  const halfW = (CONTENT_W - gap) / 2;
  const lineH = 4.1;

  const cardBody = (t, w) => {
    setFont(pdf, 9, 'normal', C.body);
    return pdf.splitTextToSize(t.body, w - 7);
  };
  const drawCard = (t, x, top, w, h, body) => {
    pdf.setFillColor(C.panel);
    pdf.setDrawColor(C.line);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(x, top, w, h, 1.2, 1.2, 'FD');
    setFont(pdf, 9.5, 'bold', C.ink);
    pdf.text(t.title, x + 3.5, top + 6);
    setFont(pdf, 9, 'normal', C.body);
    body.forEach((ln, i) => pdf.text(ln, x + 3.5, top + 10.8 + i * lineH));
  };

  for (let i = 0; i < TERMS.length; ) {
    const t = TERMS[i];
    if (t.full) {
      const body = cardBody(t, CONTENT_W);
      const h = 9 + body.length * lineH + 2.5;
      // Full-width card uses white fill + slightly stronger border, like the template.
      pdf.setFillColor('#FFFFFF');
      pdf.setDrawColor(C.rule);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(M, y, CONTENT_W, h, 1.2, 1.2, 'FD');
      setFont(pdf, 9.5, 'bold', C.ink);
      pdf.text(t.title, M + 3.5, y + 6);
      setFont(pdf, 9, 'normal', C.body);
      body.forEach((ln, li) => pdf.text(ln, M + 3.5, y + 10.8 + li * lineH));
      y += h + gap;
      i += 1;
      continue;
    }
    const a = t;
    const b = TERMS[i + 1] && !TERMS[i + 1].full ? TERMS[i + 1] : null;
    const bodyA = cardBody(a, halfW);
    const bodyB = b ? cardBody(b, halfW) : [];
    const h = 9 + Math.max(bodyA.length, bodyB.length) * lineH + 2.5;
    drawCard(a, M, y, halfW, h, bodyA);
    if (b) drawCard(b, M + halfW + gap, y, halfW, h, bodyB);
    y += h + gap;
    i += b ? 2 : 1;
  }

  y += 1;
  pdf.setLineDashPattern([0.8, 0.8], 0);
  hLine(pdf, M, R, y, C.rule, 0.25);
  pdf.setLineDashPattern([], 0);

  y += 6;
  setFont(pdf, 9, 'bold', C.muted);
  pdf.text('Facility Support Desk:', M, y);
  const lw = pdf.getTextWidth('Facility Support Desk: ');
  setFont(pdf, 9, 'normal', C.muted);
  pdf.text('91783155 (Ghala)', M + lw, y);

  const site = 'www.ammsportsarena.com';
  const sw = pdf.getTextWidth(site);
  pdf.text(site, R, y, { align: 'right' });
  setFont(pdf, 9, 'bold', C.muted);
  pdf.text('Website:', R - sw - 1, y, { align: 'right' });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * @param {object} r Normalized receipt (see buildReceiptFrom* helpers).
 * @returns {Promise<jsPDF>}
 */
export async function createBookingReceiptPdf(r, { logo: logoOverride } = {}) {
  const logo = logoOverride !== undefined ? logoOverride : await loadLogo();
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  const newPage = () => {
    pdf.addPage();
    return 18;
  };

  let y = drawInvoiceHeader(pdf, r, logo);
  y = drawInfoPanels(pdf, r, y + 6);
  y = drawLineItems(pdf, r, y + 10, newPage);
  y = drawTotals(pdf, r, y, newPage);
  drawReminder(pdf, y, newPage);

  const invoicePages = pdf.getNumberOfPages();
  pdf.addPage();
  drawTermsPage(pdf);

  const total = pdf.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    pdf.setPage(p);
    drawFooter(pdf, p <= invoicePages ? 'AMM Sports Arena Booking Receipt' : 'AMM Sports Arena Terms & Conditions', p, total);
  }
  return pdf;
}

export async function downloadBookingReceiptPdf(r) {
  const pdf = await createBookingReceiptPdf(r);
  pdf.save(r.fileName || `Receipt-${r.invoiceNo}.pdf`);
}

function finalizeReceipt({ id, createdAt, status, customer, paymentMethod, items, total, taxPercent, taxAmount, itemsTitle, totalSlots, extraSummary }) {
  const subtotal = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const tax = Number(taxAmount) > 0 ? Number(taxAmount) : 0;
  const grand = Number(total) || 0;
  const discount = Math.max(0, subtotal + tax - grand);
  const issued = createdAt ? new Date(createdAt) : new Date();
  const issuedDate = Number.isNaN(issued.getTime()) ? new Date() : issued;
  const ref = shortRef(id, 6) || shortRef(Date.now().toString(36), 6);

  return {
    invoiceNo: `INV-${issuedDate.getFullYear()}-${ref}`,
    invoiceDate: issuedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    status: String(status || '').toLowerCase() === 'cancelled' ? 'CANCELLED' : 'PAID',
    customer: {
      name: customer?.name || 'Valued Customer',
      phone: customer?.phone || '',
      email: customer?.email || '',
    },
    bookingRef: id ? `BRK-${shortRef(id, 8)}` : '—',
    paymentMethod: paymentMethodLabel(paymentMethod),
    totalSlots,
    extraSummary,
    itemsTitle: itemsTitle || 'COURT RESERVATION LINE ITEMS',
    items,
    subtotal,
    discount,
    taxPercent: Number(taxPercent) || 0,
    taxAmount: tax,
    total: grand,
    fileName: `Receipt-${ref}.pdf`,
  };
}

function totalSlotsLabel(items) {
  const hours = items.reduce((s, it) => s + slotHours(it.slot), 0);
  const courts = new Set(items.map((it) => it.court).filter(Boolean)).size || 1;
  if (!hours) return `${items.length} Slot${items.length === 1 ? '' : 's'}`;
  const h = Number.isInteger(hours) ? hours : Number(hours.toFixed(1));
  return `${h} Hour${h === 1 ? '' : 's'} (${courts} Court${courts === 1 ? '' : 's'})`;
}

/**
 * From a dashboard/booking-details card (meBookingAdapter / enrollment / event adapters).
 */
export function buildReceiptFromBookingCard(booking, user) {
  const price = parseFloat(String(booking.price ?? 0).replace(/[^\d.]/g, '')) || 0;
  const taxPct = Number(booking.taxPercent) || 0;
  const base = Number(booking.basePrice) || 0;
  const hasTax = taxPct > 0 && base > 0 && price > base;
  const kind = String(booking.type || '').toLowerCase();
  const isCourt = !['coaching', 'tournament', 'membership'].includes(kind);

  const item = {
    date: formatReceiptDate(booking.rawDate || booking.date),
    court: booking.courtName || (isCourt ? 'Main Court' : '—'),
    slot: booking.slot || '—',
    rateType: isCourt ? rateTypeLabel(booking.pricingType) : kind === 'coaching' ? 'Academy Fee' : kind === 'tournament' ? 'Event Entry' : 'Membership',
    duration: isCourt ? slotDurationLabel(booking.slot) : '—',
    amount: hasTax ? base : price,
  };

  return finalizeReceipt({
    id: booking.id,
    createdAt: booking.createdAt,
    status: booking.status,
    customer: { name: user?.name || booking.customerName, phone: user?.phone, email: user?.email },
    paymentMethod: booking.paymentMethod,
    items: [item],
    total: price,
    taxPercent: hasTax ? taxPct : 0,
    taxAmount: hasTax ? price - base : 0,
    itemsTitle: isCourt ? 'COURT RESERVATION LINE ITEMS' : 'BOOKING LINE ITEMS',
    totalSlots: isCourt ? totalSlotsLabel([item]) : undefined,
    extraSummary: isCourt ? undefined : [['Program:', booking.arenaName || '—']],
  });
}

/**
 * From the /booking-success navigation state (court booking with one or more
 * slots, coaching enrollment, membership, wallet top-up, event).
 */
export function buildReceiptFromSuccessState(data, user) {
  const total = Number(data?.amount) || 0;
  const apiBooking = data?.booking || {};
  const id = apiBooking.id || data?.enrollment?.id || data?.payment?.id;
  const createdAt = apiBooking.createdAt || data?.transactionAt || data?.payment?.completedAt;
  const paymentMethod = apiBooking.paymentMethod || data?.payment?.method || data?.payment?.provider;
  const customer = { name: user?.name, phone: user?.phone, email: user?.email };
  const today = formatReceiptDate(createdAt || new Date());

  const single = (row, title, extraSummary) =>
    finalizeReceipt({ id, createdAt, status: 'paid', customer, paymentMethod, items: [{ amount: total, duration: '—', ...row }], total, itemsTitle: title, extraSummary });

  if (data?.type === 'wallet_top_up') {
    return single({ date: today, court: '—', slot: '—', rateType: 'Wallet Top-up' }, 'TRANSACTION LINE ITEMS');
  }
  if (data?.type === 'membership') {
    return single(
      { date: today, court: data.plan?.name || 'Membership', slot: data.plan?.duration || '—', rateType: 'Membership' },
      'MEMBERSHIP LINE ITEMS',
    );
  }
  if (data?.type === 'coaching' || data?.batch) {
    return single(
      { date: today, court: data.batch?.level || 'Batch', slot: data.batch?.timing || '—', rateType: 'Academy Fee' },
      'BOOKING LINE ITEMS',
      [['Program:', data.batch?.title || data.batch?.name || data.batch?.arenaName || '—']],
    );
  }
  if (data?.type === 'event') {
    return single(
      { date: formatReceiptDate(data.date || createdAt), court: 'Event Entry', slot: data.slot?.time || '—', rateType: 'Event Entry' },
      'BOOKING LINE ITEMS',
      [['Event:', data.event?.title || data.event?.name || '—']],
    );
  }

  // Court checkout (single court or cart) passes one line per booked slot.
  if (Array.isArray(data?.lines) && data.lines.length) {
    const items = data.lines.map((l) => ({
      date: formatReceiptDate(l.dateYmd || l.date),
      court: l.courtName || 'Court',
      slot: l.timeSlot || '—',
      rateType: rateTypeLabel(l.pricingType || l.pricing?.type),
      duration: slotDurationLabel(l.timeSlot),
      // List price per slot; member / coupon discounts show as one Discount line below.
      amount: Math.max(Number(l.price) || 0, Number(l.amount) || 0),
    }));
    const summaryRows = [];
    if (data.lines.length > 1) summaryRows.push(['Booking IDs:', data.lines.map((l) => `BRK-${shortRef(l.bookingId, 8)}`).join(', ')]);
    if (data.couponCode) summaryRows.push(['Coupon:', `${data.couponCode} (-${formatOmr(data.couponDiscount)})`]);
    return finalizeReceipt({
      id,
      createdAt,
      status: 'paid',
      customer,
      paymentMethod,
      items,
      total,
      totalSlots: totalSlotsLabel(items),
      extraSummary: summaryRows.length ? summaryRows : undefined,
    });
  }

  const slots = Array.isArray(data?.slots) && data.slots.length ? data.slots : data?.slot ? [data.slot] : [];
  const court = data?.court?.name || apiBooking.courtName || 'Court';
  const date = formatReceiptDate(data?.date || apiBooking.date);
  const items = (slots.length ? slots : [{ time: apiBooking.timeSlot }]).map((s) => {
    const time = s?.time || s?.timeSlot || apiBooking.timeSlot || '—';
    const priceRaw = s?.price ?? s?.pricing?.finalPrice;
    return {
      date,
      court,
      slot: time,
      rateType: rateTypeLabel(s?.pricing?.pricingType || s?.pricingType || apiBooking.pricingType),
      duration: slotDurationLabel(time),
      amount: priceRaw != null ? Number(priceRaw) || 0 : null,
    };
  });
  // If per-slot prices are missing, spread the paid total evenly.
  if (items.some((it) => it.amount == null)) {
    const each = items.length ? total / items.length : total;
    items.forEach((it) => { it.amount = each; });
  }

  return finalizeReceipt({
    id,
    createdAt,
    status: 'paid',
    customer,
    paymentMethod,
    items,
    total,
    totalSlots: totalSlotsLabel(items),
  });
}
