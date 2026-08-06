const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const CourtSlot = require('../models/CourtSlot');
const AvailabilityBlock = require('../models/AvailabilityBlock');
const Arena = require('../models/Arena');
const User = require('../models/User');

/**
 * Map a JS Date to the 3-letter day abbreviation used in CourtSlot.dayOfWeek
 */
function getDayOfWeek(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
}

/**
 * Normalize time slot string to clean 12-hour format e.g. "06:00 AM - 07:00 AM"
 */
function normalizeTimeSlot(slot) {
  if (!slot) return '';
  let s = String(slot).trim();
  
  // Match "06:00-07:00" or "06:00 - 07:00" or "6:00-7:00"
  const match24 = s.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h1 = parseInt(match24[1], 10);
    const m1 = match24[2];
    const h2 = parseInt(match24[3], 10);
    const m2 = match24[4];

    const to12 = (h, m) => {
      const period = h >= 12 ? 'PM' : 'AM';
      let h12 = h % 12;
      if (h12 === 0) h12 = 12;
      return `${String(h12).padStart(2, '0')}:${m} ${period}`;
    };
    return `${to12(h1, m1)} - ${to12(h2, m2)}`;
  }

  // Match "06:00 AM - 07:00 AM" or "6:00 AM - 7:00 AM"
  const match12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    const h1 = String(parseInt(match12[1], 10)).padStart(2, '0');
    const m1 = match12[2];
    const p1 = match12[3].toUpperCase();
    const h2 = String(parseInt(match12[4], 10)).padStart(2, '0');
    const m2 = match12[5];
    const p2 = match12[6].toUpperCase();
    return `${h1}:${m1} ${p1} - ${h2}:${m2} ${p2}`;
  }

  return s;
}

/**
 * Standard 12-hour time slot list generator (06:00 AM to 11:00 PM)
 */
function getStandardTimeSlots() {
  const slots = [];
  for (let h = 6; h <= 23; h++) {
    const format12 = (hr) => {
      const period = hr >= 12 ? 'PM' : 'AM';
      let h12 = hr % 12;
      if (h12 === 0) h12 = 12;
      return `${String(h12).padStart(2, '0')}:00 ${period}`;
    };
    slots.push(`${format12(h)} - ${format12(h + 1)}`);
  }
  return slots;
}

/**
 * GET /api/admin/reports/daily          (Super Admin — arenaId from query)
 * GET /api/arena-admin/reports/daily    (Arena Admin — arenaId from req.arenaScopeId)
 */
async function getDailyCourtReport(req, res) {
  try {
    // ── Resolve arena ID based on caller role ───────────────────────────
    let arenaId;
    if (req.arenaScopeId) {
      arenaId = req.arenaScopeId;
    } else {
      const qArena = (req.query.arenaId || '').trim();
      if (!qArena || !mongoose.isValidObjectId(qArena)) {
        return res.status(400).json({ error: 'arenaId is required' });
      }
      arenaId = qArena;
    }

    const arenaOid = new mongoose.Types.ObjectId(arenaId);

    // ── Date range ──────────────────────────────────────────────────────
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const from = (req.query.from || today).trim();
    const to = (req.query.to || from).trim();

    // ── Optional filters ────────────────────────────────────────────────
    const statusFilter = (req.query.status || '').trim(); // confirmed|cancelled|pending|completed|all
    const courtFilter = (req.query.courtId || '').trim();
    const paymentMethodFilter = (req.query.paymentMethod || '').trim();
    const pricingTypeFilter = (req.query.pricingType || '').trim(); // peak|normal
    const searchQuery = (req.query.search || '').trim();

    // ── Pagination ──────────────────────────────────────────────────────
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 200));
    const skip = (page - 1) * limit;

    // ── Fetch courts for this arena ─────────────────────────────────────
    const courtQuery = { arenaId: arenaOid, status: 'active' };
    if (courtFilter && mongoose.isValidObjectId(courtFilter)) {
      courtQuery._id = new mongoose.Types.ObjectId(courtFilter);
    }
    const courts = await Court.find(courtQuery).sort({ name: 1 }).lean();
    const courtIds = courts.map((c) => c._id);

    if (courtIds.length === 0) {
      return res.json(buildEmptyResponse(arenaId, from, to));
    }

    // ── Build booking match ─────────────────────────────────────────────
    const bookingMatch = {
      arenaId: arenaOid,
      date: { $gte: from, $lte: to },
      courtId: { $in: courtIds },
    };

    if (statusFilter && statusFilter !== 'all') {
      bookingMatch.status = statusFilter;
    }
    if (paymentMethodFilter) {
      bookingMatch.paymentMethod = paymentMethodFilter;
    }
    if (pricingTypeFilter) {
      bookingMatch.pricingType = pricingTypeFilter;
    }

    if (searchQuery && mongoose.isValidObjectId(searchQuery)) {
      bookingMatch._id = new mongoose.Types.ObjectId(searchQuery);
    }

    // ── Fetch all bookings with user/bookedBy populated ─────────────────
    const allBookings = await Booking.find(bookingMatch)
      .populate('userId', 'name phone email createdAt')
      .populate('bookedBy', 'name role')
      .populate('courtId', 'name type')
      .sort({ courtId: 1, date: 1, timeSlot: 1 })
      .lean();

    // ── Fetch arena details ─────────────────────────────────────────────
    const arena = await Arena.findById(arenaOid).lean();

    // ── Apply in-memory search ──────────────────────────────────────────
    let bookings = allBookings;
    if (searchQuery && !mongoose.isValidObjectId(searchQuery)) {
      const q = searchQuery.toLowerCase();
      bookings = allBookings.filter((b) => {
        const userName = (b.userId?.name || '').toLowerCase();
        const userPhone = (b.userId?.phone || '').toLowerCase();
        const courtName = (b.courtId?.name || '').toLowerCase();
        const bookingId = b._id.toString().toLowerCase();
        const receiptNo = `rec-${b._id.toString().slice(-6)}`.toLowerCase();
        return (
          userName.includes(q) ||
          userPhone.includes(q) ||
          courtName.includes(q) ||
          bookingId.includes(q) ||
          receiptNo.includes(q)
        );
      });
    }

    // ── Compute summary stats ───────────────────────────────────────────
    const summary = computeSummary(bookings);

    // ── Customer statistics ─────────────────────────────────────────────
    const customerStats = await computeCustomerStats(bookings);

    // ── Court breakdown & Matrix ────────────────────────────────────────
    const { courtBreakdown, matrix, timeSlotsList } = await buildCourtBreakdownAndMatrix(
      courts,
      bookings,
      arenaOid,
      from,
      to
    );

    // ── Court Performance Ranking ───────────────────────────────────────
    const courtRankings = [...courtBreakdown].sort((a, b) => b.revenue.net - a.revenue.net);

    // ── Hourly Revenue Analysis ────────────────────────────────────────
    const hourlyRevenue = computeHourlyRevenue(bookings);

    // ── Report Metadata ────────────────────────────────────────────────
    const reportNumber = `DCR-${from.replace(/-/g, '')}-${arenaId.slice(-5).toUpperCase()}`;

    // ── Pagination ──────────────────────────────────────────────────────
    const total = bookings.length;
    const paginatedBookings = bookings.slice(skip, skip + limit);

    return res.json({
      reportNumber,
      arena: arena
        ? {
            id: arena._id,
            name: arena.name,
            logoUrl: arena.logoUrl || null,
            address: arena.location || arena.address || 'Muscat, Oman',
            phone: arena.phone || '+968 9000 0000',
            gstNumber: arena.taxNumber || arena.gstNumber || 'OM-TAX-982410',
          }
        : { id: arenaId, name: 'Arena', logoUrl: null, address: 'Muscat, Oman', phone: '+968 9000 0000', gstNumber: 'OM-TAX-982410' },
      range: { from, to },
      generatedAt: new Date().toISOString(),
      generatedBy: req.user?.name || 'Administrator',
      summary,
      customerStats,
      courtRankings,
      hourlyRevenue,
      matrix: {
        timeSlots: timeSlotsList,
        rows: matrix,
      },
      courts: courtBreakdown,
      bookings: paginatedBookings.map((b) => formatBooking(b, arena)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[DailyReport]', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function computeSummary(bookings) {
  let totalRevenue = 0;
  let onlineRevenue = 0;
  let cashRevenue = 0;
  let walletRevenue = 0;
  let couponRevenue = 0;
  let refundAmount = 0;
  let confirmed = 0;
  let pending = 0;
  let cancelled = 0;
  let completed = 0;
  let peakBookings = 0;
  let normalBookings = 0;
  let peakRevenue = 0;
  let normalRevenue = 0;

  const sources = {
    app: 0,
    walkin: 0,
    admin: 0,
    superAdmin: 0,
  };

  const hourCounts = {};

  for (const b of bookings) {
    switch (b.status) {
      case 'confirmed': confirmed++; break;
      case 'pending': pending++; break;
      case 'cancelled': cancelled++; break;
      case 'completed': completed++; break;
      default: break;
    }

    const bookedByName = (b.bookedBy?.name || '').toLowerCase();
    const bookedByRole = (b.bookedBy?.role || '').toUpperCase();

    if (bookedByRole === 'SUPER_ADMIN') {
      sources.superAdmin++;
    } else if (bookedByRole === 'ARENA_ADMIN' || bookedByRole === 'RECEPTIONIST') {
      sources.admin++;
    } else if (bookedByName.includes('walk-in') || bookedByName.includes('reception')) {
      sources.walkin++;
    } else {
      sources.app++;
    }

    if (b.status !== 'cancelled' && b.paymentStatus !== 'refunded') {
      const amt = b.finalPrice || b.amount || 0;
      totalRevenue += amt;

      const pm = (b.paymentMethod || 'online').toLowerCase();
      if (pm === 'cash') cashRevenue += amt;
      else if (pm === 'wallet') walletRevenue += amt;
      else if (pm === 'coupon') couponRevenue += amt;
      else onlineRevenue += amt;

      if (b.pricingType === 'peak') {
        peakRevenue += amt;
      } else {
        normalRevenue += amt;
      }
    }

    if (b.paymentStatus === 'refunded') {
      refundAmount += b.finalPrice || b.amount || 0;
    }

    if (b.pricingType === 'peak') peakBookings++;
    else normalBookings++;

    const slot = b.timeSlot || '';
    const hourMatch = slot.match(/^(\d{1,2}):/);
    if (hourMatch) {
      const h = String(parseInt(hourMatch[1], 10)).padStart(2, '0');
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
  }

  let peakHour = null;
  let peakHourCount = 0;
  let leastHour = null;
  let leastHourCount = Infinity;

  for (const [h, count] of Object.entries(hourCounts)) {
    if (count > peakHourCount) {
      peakHourCount = count;
      peakHour = `${h}:00`;
    }
    if (count < leastHourCount && count > 0) {
      leastHourCount = count;
      leastHour = `${h}:00`;
    }
  }

  return {
    total: bookings.length,
    confirmed,
    pending,
    cancelled,
    completed,
    totalRevenue,
    onlineRevenue,
    cashRevenue,
    walletRevenue,
    couponRevenue,
    refundAmount,
    netRevenue: totalRevenue - refundAmount,
    peakBookings,
    normalBookings,
    peakRevenue,
    normalRevenue,
    peakHour: peakHour || '18:00',
    peakHourCount,
    leastHour: leastHour || '11:00',
    sources,
  };
}

async function computeCustomerStats(bookings) {
  const userIds = [...new Set(bookings.map((b) => b.userId?._id?.toString()).filter(Boolean))];
  const totalUnique = userIds.length;

  if (totalUnique === 0) {
    return { uniqueCustomers: 0, newCustomers: 0, returningCustomers: 0 };
  }

  const priorBookings = await Booking.aggregate([
    { $match: { userId: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
  ]);

  let returningCustomers = 0;
  let newCustomers = 0;

  const countMap = {};
  priorBookings.forEach((p) => {
    countMap[p._id.toString()] = p.count;
  });

  userIds.forEach((id) => {
    if ((countMap[id] || 0) > 1) {
      returningCustomers++;
    } else {
      newCustomers++;
    }
  });

  return {
    uniqueCustomers: totalUnique,
    returningCustomers,
    newCustomers,
  };
}

function computeHourlyRevenue(bookings) {
  const hourly = {};
  for (let h = 6; h <= 23; h++) {
    const slotKey = String(h).padStart(2, '0') + ':00';
    hourly[slotKey] = { revenue: 0, count: 0 };
  }

  for (const b of bookings) {
    if (b.status === 'cancelled') continue;
    const slot = b.timeSlot || '';
    const hourMatch = slot.match(/^(\d{1,2}):/);
    if (hourMatch) {
      const hKey = `${String(parseInt(hourMatch[1], 10)).padStart(2, '0')}:00`;
      if (hourly[hKey]) {
        hourly[hKey].revenue += b.finalPrice || b.amount || 0;
        hourly[hKey].count += 1;
      }
    }
  }

  return hourly;
}

async function buildCourtBreakdownAndMatrix(courts, bookings, arenaOid, from, to) {
  const days = getDaysInRange(from, to);
  const dayAbbreviations = [...new Set(days.map(getDayOfWeek))];

  const courtIds = courts.map((c) => c._id);
  const allSlots = await CourtSlot.find({
    arenaId: arenaOid,
    courtId: { $in: courtIds.map((id) => id.toString()) },
    dayOfWeek: { $in: dayAbbreviations },
    isActive: true,
  }).lean();

  const blocks = await AvailabilityBlock.find({
    arenaId: arenaOid,
    courtId: { $in: courtIds },
    date: { $gte: from, $lte: to },
  }).lean();

  const bookingsByCourtId = {};
  for (const b of bookings) {
    const cid = b.courtId?._id?.toString() || b.courtId?.toString();
    if (!bookingsByCourtId[cid]) bookingsByCourtId[cid] = [];
    bookingsByCourtId[cid].push(b);
  }

  // Deduplicate and normalize time slot list for Matrix View
  const rawSlotTimes = [...allSlots.map((s) => s.timeSlot), ...bookings.map((b) => b.timeSlot)].filter(Boolean);
  const normalizedSlotTimes = [...new Set(rawSlotTimes.map(normalizeTimeSlot))].sort();

  const timeSlotsList = normalizedSlotTimes.length > 0 ? normalizedSlotTimes : getStandardTimeSlots();

  const matrix = [];

  const courtBreakdown = courts.map((court) => {
    const cid = court._id.toString();
    const courtBookings = bookingsByCourtId[cid] || [];
    const courtSlotsAll = allSlots.filter((s) => s.courtId === cid);

    const publicSlots = courtSlotsAll.filter((s) => s.type === 'Public');
    const academySlots = courtSlotsAll.filter((s) => s.type === 'Academy').length;
    const reservedSlots = courtSlotsAll.filter((s) => s.type === 'Reserved').length;
    const maintenanceSlots = courtSlotsAll.filter((s) => s.type === 'Maintenance').length;

    const courtBlocks = blocks.filter((b) => b.courtId.toString() === cid);
    const blockedSlots = courtBlocks.length;

    const bookedCount = courtBookings.filter((b) => b.status !== 'cancelled').length;

    const totalPublicCapacity = publicSlots.length > 0 ? publicSlots.length : timeSlotsList.length;
    const availableSlots = Math.max(0, totalPublicCapacity - bookedCount - blockedSlots);
    const utilizationPct =
      totalPublicCapacity > 0
        ? Math.min(100, Math.round((bookedCount / totalPublicCapacity) * 100))
        : 0;

    const courtRevenue = computeCourtRevenue(courtBookings);

    // Build Court Matrix Row (Time Slots mapping)
    const slotMap = {};
    timeSlotsList.forEach((slotTime) => {
      const activeBooking = courtBookings.find((b) => normalizeTimeSlot(b.timeSlot) === slotTime && b.status !== 'cancelled');
      const isBlocked = courtBlocks.some((blk) => isTimeSlotInBlock(slotTime, blk));
      const slotDef = courtSlotsAll.find((s) => normalizeTimeSlot(s.timeSlot) === slotTime);

      if (activeBooking) {
        slotMap[slotTime] = {
          status: 'BOOKED',
          bookingId: activeBooking._id.toString().slice(-8).toUpperCase(),
          receiptNumber: `REC-${activeBooking._id.toString().slice(-6).toUpperCase()}`,
          customerName: activeBooking.userId?.name || 'Walk-in Customer',
          customerPhone: activeBooking.userId?.phone || '',
          price: activeBooking.finalPrice || activeBooking.amount || 0,
          pricingType: activeBooking.pricingType || 'normal',
          paymentMethod: activeBooking.paymentMethod || 'online',
          bookingStatus: activeBooking.status,
        };
      } else if (isBlocked) {
        slotMap[slotTime] = { status: 'MAINTENANCE', label: 'Maintenance' };
      } else if (slotDef?.type === 'Academy') {
        slotMap[slotTime] = { status: 'ACADEMY', label: 'Academy Class' };
      } else if (slotDef?.type === 'Reserved') {
        slotMap[slotTime] = { status: 'RESERVED', label: 'Reserved' };
      } else {
        slotMap[slotTime] = { status: 'AVAILABLE', label: 'Available' };
      }
    });

    matrix.push({
      courtId: cid,
      courtName: court.name,
      courtType: court.type || 'Standard',
      slots: slotMap,
    });

    return {
      courtId: cid,
      courtName: court.name,
      courtType: court.type || 'Standard',
      revenue: courtRevenue,
      utilization: {
        totalSlots: totalPublicCapacity,
        available: availableSlots,
        booked: bookedCount,
        blocked: blockedSlots,
        maintenance: maintenanceSlots,
        academy: academySlots,
        reserved: reservedSlots,
        utilizationPct,
      },
      bookings: courtBookings.map((b) => formatBooking(b, null)),
    };
  });

  return { courtBreakdown, matrix, timeSlotsList };
}

function isTimeSlotInBlock(slotTime, block) {
  if (!block.startTime || !block.endTime) return true;
  const slotStart = slotTime.split('-')[0]?.trim();
  if (!slotStart) return false;
  return slotStart >= block.startTime && slotStart < block.endTime;
}

function computeCourtRevenue(bookings) {
  let online = 0, cash = 0, wallet = 0, coupon = 0, refunds = 0;
  for (const b of bookings) {
    if (b.status === 'cancelled') continue;
    if (b.paymentStatus === 'refunded') {
      refunds += b.finalPrice || b.amount || 0;
      continue;
    }
    const amt = b.finalPrice || b.amount || 0;
    const pm = (b.paymentMethod || 'online').toLowerCase();
    if (pm === 'cash') cash += amt;
    else if (pm === 'wallet') wallet += amt;
    else if (pm === 'coupon') coupon += amt;
    else online += amt;
  }
  const gross = online + cash + wallet + coupon;
  return {
    online,
    cash,
    wallet,
    coupon,
    refunds,
    gross,
    net: gross - refunds,
  };
}

function formatBooking(b, arena = null) {
  const userId = b.userId;
  const court = b.courtId;
  return {
    id: b._id.toString(),
    bookingId: b._id.toString().slice(-8).toUpperCase(),
    receiptNumber: `REC-${b._id.toString().slice(-6).toUpperCase()}`,
    customerName: userId?.name || 'Walk-in Customer',
    customerPhone: userId?.phone || '—',
    customerEmail: userId?.email || '',
    courtName: court?.name || '—',
    courtId: court?._id?.toString() || b.courtId?.toString() || '',
    date: b.date,
    timeSlot: normalizeTimeSlot(b.timeSlot),
    pricingType: b.pricingType || 'normal',
    basePrice: b.normalPrice || b.basePrice || 0,
    peakSurcharge: b.peakSurcharge || 0,
    finalAmount: b.finalPrice || b.amount || 0,
    paymentMethod: b.paymentMethod || 'online',
    paymentStatus: b.paymentStatus || 'pending',
    status: b.status,
    bookedBy: b.bookedBy?.name || 'Customer App',
    bookedByRole: b.bookedBy?.role || 'CUSTOMER',
    createdAt: b.createdAt,
    sport: court?.type || 'Badminton',
    arenaName: arena?.name || 'Arena',
  };
}

function getDaysInRange(from, to) {
  const days = [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  const cur = new Date(start);
  while (cur <= end) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}

function buildEmptyResponse(arenaId, from, to) {
  return {
    reportNumber: `DCR-${from.replace(/-/g, '')}-${arenaId.slice(-5).toUpperCase()}`,
    arena: { id: arenaId, name: 'Arena', logoUrl: null, address: 'Muscat, Oman', phone: '+968 9000 0000', gstNumber: 'OM-TAX-982410' },
    range: { from, to },
    generatedAt: new Date().toISOString(),
    generatedBy: 'Administrator',
    summary: {
      total: 0, confirmed: 0, pending: 0, cancelled: 0, completed: 0,
      totalRevenue: 0, onlineRevenue: 0, cashRevenue: 0, walletRevenue: 0,
      couponRevenue: 0, refundAmount: 0, netRevenue: 0,
      peakBookings: 0, normalBookings: 0, peakRevenue: 0, normalRevenue: 0,
      peakHour: '18:00', peakHourCount: 0, leastHour: '11:00',
      sources: { app: 0, walkin: 0, admin: 0, superAdmin: 0 },
    },
    customerStats: { uniqueCustomers: 0, returningCustomers: 0, newCustomers: 0 },
    courtRankings: [],
    hourlyRevenue: {},
    matrix: { timeSlots: getStandardTimeSlots(), rows: [] },
    courts: [],
    bookings: [],
    pagination: { total: 0, page: 1, limit: 200, pages: 0 },
  };
}

module.exports = { getDailyCourtReport };
