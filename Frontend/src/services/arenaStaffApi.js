import { apiJson, apiMultipart } from './apiClient';

const BASE = '/api/arena-admin';

// Arena Self-Management
export const getMyArena = () => apiJson(`${BASE}/arena`);
export const patchMyArena = (body) => apiJson(`${BASE}/arena`, { method: 'PATCH', body });

export const uploadArenaImage = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return apiMultipart(`${BASE}/upload/image`, fd);
};

// Courts
export const listMyCourts = () => apiJson(`${BASE}/courts`);
export const createMyCourt = (body) => apiJson(`${BASE}/courts`, { method: 'POST', body });
export const patchMyCourt = (courtId, body) => apiJson(`${BASE}/courts/${courtId}`, { method: 'PATCH', body });
export const deleteMyCourt = (courtId) => apiJson(`${BASE}/courts/${courtId}`, { method: 'DELETE' });

// Court Slots
export const listMyCourtSlots = (courtId, day) => 
  apiJson(`${BASE}/courts/${courtId}/slots${day ? `?dayOfWeek=${day}` : ''}`);

export const createMyCourtSlot = (courtId, body) => 
  apiJson(`${BASE}/courts/${courtId}/slots`, { method: 'POST', body });

export const deleteMyCourtSlot = (slotId) => 
  apiJson(`${BASE}/slots/${slotId}`, { method: 'DELETE' });

// Availability Blocks
export const listMyBlocks = (params = {}) => {
  const q = new URLSearchParams();
  if (params.date) q.set('date', params.date);
  if (params.courtId) q.set('courtId', params.courtId);
  return apiJson(`${BASE}/blocks${q.toString() ? `?${q}` : ''}`);
};

export const getBlockSummary = (month) => 
    apiJson(`${BASE}/blocks/summary?month=${month}`);

export const createMyBlock = (body) => apiJson(`${BASE}/blocks`, { method: 'POST', body });
export const deleteMyBlock = (blockId) => apiJson(`${BASE}/blocks/${blockId}`, { method: 'DELETE' });

// Bookings (for availability overlay)
export const listMyBookings = (params = {}) => {
  const q = new URLSearchParams();
  if (params.date) q.set('date', params.date);
  if (params.arenaId) q.set('arenaId', params.arenaId);
  return apiJson(`${BASE}/bookings?${q}`);
};

// Walk-in Booking
export const getWalkinCourts = (arenaId) => 
  apiJson(`${BASE}/walkin/courts`, { 
    headers: arenaId ? { 'X-Arena-Id': arenaId } : {} 
  });

export const getWalkinSlots = (courtId, date, arenaId) =>
  apiJson(`${BASE}/walkin/slots?courtId=${encodeURIComponent(courtId)}&date=${encodeURIComponent(date)}`, {
    headers: arenaId ? { 'X-Arena-Id': arenaId } : {}
  });

export const createWalkinBooking = (body, arenaId) =>
  apiJson(`${BASE}/walkin/book`, { 
    method: 'POST', 
    body,
    headers: arenaId ? { 'X-Arena-Id': arenaId } : {}
  });

export const searchWalkinCustomers = (query, arenaId) =>
  apiJson(`${BASE}/walkin/customers/search?q=${encodeURIComponent(query)}`, {
    headers: arenaId ? { 'X-Arena-Id': arenaId } : {}
  });

export const createWalkinCustomer = (body, arenaId) =>
  apiJson(`${BASE}/walkin/customers`, {
    method: 'POST',
    body,
    headers: arenaId ? { 'X-Arena-Id': arenaId } : {}
  });

export const refundMyBooking = (id, { method = 'wallet', reference = '' } = {}) =>
  apiJson(`${BASE}/bookings/${encodeURIComponent(id)}/refund`, { method: 'POST', body: { method, reference } });

export const listMyManualRefunds = () => apiJson(`${BASE}/refunds`, { method: 'GET' });

export const updateMyBooking = (id, body) =>
  apiJson(`${BASE}/bookings/${encodeURIComponent(id)}`, { method: 'PATCH', body });

// Coaching attendance register (coach's marks, cross-checked by the arena / Super Admin)
export const getAttendanceRegister = (params = {}, arenaId) => {
  const q = new URLSearchParams();
  for (const k of ['batchId', 'from', 'to', 'status']) if (params[k]) q.set(k, params[k]);
  const qs = q.toString();
  return apiJson(`${BASE}/attendance-register${qs ? `?${qs}` : ''}`, { headers: arenaId ? { 'X-Arena-Id': arenaId } : {} });
};

export const updateAttendanceSession = (sessionId, body, arenaId) =>
  apiJson(`${BASE}/attendance-register/${encodeURIComponent(sessionId)}`, {
    method: 'PATCH',
    body,
    headers: arenaId ? { 'X-Arena-Id': arenaId } : {},
  });

// Staff roster (who works at the arena) and staff attendance. Super Admin passes the arena id.
const scope = (arenaId) => (arenaId ? { 'X-Arena-Id': arenaId } : {});
export const getStaffRoster = (arenaId) => apiJson(`${BASE}/staff-roster`, { headers: scope(arenaId) });
export const addRosterStaff = (body, arenaId) => apiJson(`${BASE}/staff-roster`, { method: 'POST', body, headers: scope(arenaId) });
export const updateRosterStaff = (id, body, arenaId) => apiJson(`${BASE}/staff-roster/${encodeURIComponent(id)}`, { method: 'PATCH', body, headers: scope(arenaId) });
export const removeRosterStaff = (id, arenaId) => apiJson(`${BASE}/staff-roster/${encodeURIComponent(id)}`, { method: 'DELETE', headers: scope(arenaId) });
export const getStaffAttendance = (params, arenaId) => {
  const q = new URLSearchParams({ arenaId });
  for (const k of ['date', 'startDate', 'endDate', 'staffId']) if (params?.[k]) q.set(k, params[k]);
  return apiJson(`${BASE}/staff-attendance?${q.toString()}`, { headers: scope(arenaId) });
};
export const markStaffAttendanceApi = (body, arenaId) =>
  apiJson(`${BASE}/staff-attendance`, { method: 'POST', body: { ...body, arenaId }, headers: scope(arenaId) });

// Reserved slots: a court time held for a player/team on chosen weekdays between two dates.
export const listReservedSlots = (status, arenaId) => apiJson(`${BASE}/reserved-slots?status=${encodeURIComponent(status || 'current')}`, { headers: scope(arenaId) });
export const createReservedSlot = (body, arenaId) => apiJson(`${BASE}/reserved-slots`, { method: 'POST', body, headers: scope(arenaId) });
export const updateReservedSlot = (id, body, arenaId) => apiJson(`${BASE}/reserved-slots/${encodeURIComponent(id)}`, { method: 'PATCH', body, headers: scope(arenaId) });
export const releaseReservedDate = (id, date, arenaId) => apiJson(`${BASE}/reserved-slots/${encodeURIComponent(id)}/release`, { method: 'POST', body: { date }, headers: scope(arenaId) });
export const restoreReservedDate = (id, date, arenaId) => apiJson(`${BASE}/reserved-slots/${encodeURIComponent(id)}/restore`, { method: 'POST', body: { date }, headers: scope(arenaId) });
export const endReservedSlot = (id, arenaId) => apiJson(`${BASE}/reserved-slots/${encodeURIComponent(id)}/end`, { method: 'POST', headers: scope(arenaId) });

// Coaching batches at this arena: students, attendance taken by the arena, adding students, app logins.
export const listArenaCoachingBatches = (status, arenaId) => apiJson(`${BASE}/coaching/batches?status=${encodeURIComponent(status || 'current')}`, { headers: scope(arenaId) });
export const listArenaBatchStudents = (batchId, arenaId) => apiJson(`${BASE}/coaching/batches/${encodeURIComponent(batchId)}/students`, { headers: scope(arenaId) });
export const addArenaBatchStudent = (batchId, body, arenaId) => apiJson(`${BASE}/coaching/batches/${encodeURIComponent(batchId)}/students`, { method: 'POST', body, headers: scope(arenaId) });
export const getArenaBatchAttendance = (batchId, date, arenaId) => apiJson(`${BASE}/coaching/batches/${encodeURIComponent(batchId)}/attendance?date=${encodeURIComponent(date)}`, { headers: scope(arenaId) });
export const saveArenaBatchAttendance = (batchId, body, arenaId) => apiJson(`${BASE}/coaching/batches/${encodeURIComponent(batchId)}/attendance`, { method: 'PUT', body, headers: scope(arenaId) });
export const createStudentLogin = (userId, body, arenaId) => apiJson(`${BASE}/coaching/students/${encodeURIComponent(userId)}/login`, { method: 'POST', body, headers: scope(arenaId) });
export const listArenaFees = (show, arenaId) => apiJson(`${BASE}/coaching/fees?show=${encodeURIComponent(show || 'due')}`, { headers: scope(arenaId) });
export const recordArenaFee = (enrollmentId, body, arenaId) => apiJson(`${BASE}/coaching/enrollments/${encodeURIComponent(enrollmentId)}/fee`, { method: 'POST', body, headers: scope(arenaId) });
export const searchArenaCustomers = (q, arenaId) => apiJson(`${BASE}/walkin/customers/search?q=${encodeURIComponent(q || '')}`, { headers: scope(arenaId) });

// Whole-arena bookings: every court, all day, for one client (price agreed offline).
export const listArenaBookings = (status, arenaId) => apiJson(`${BASE}/arena-bookings?status=${encodeURIComponent(status || 'upcoming')}`, { headers: scope(arenaId) });
export const previewArenaBooking = (p, arenaId) => apiJson(`${BASE}/arena-bookings/preview?${new URLSearchParams({ date: p.date, days: String(p.days || 1), allDay: String(p.allDay !== false), startTime: p.startTime || '', endTime: p.endTime || '' })}`, { headers: scope(arenaId) });
export const moveAffectedBooking = (holdId, bookingId, body, arenaId) => apiJson(`${BASE}/arena-bookings/${encodeURIComponent(holdId)}/affected/${encodeURIComponent(bookingId)}/move`, { method: 'POST', body, headers: scope(arenaId) });
export const refundAffectedBooking = (holdId, bookingId, arenaId) => apiJson(`${BASE}/arena-bookings/${encodeURIComponent(holdId)}/affected/${encodeURIComponent(bookingId)}/refund`, { method: 'POST', headers: scope(arenaId) });
export const getCourtSlots = (courtId, date, arenaId) => apiJson(`${BASE}/walkin/slots?courtId=${encodeURIComponent(courtId)}&date=${encodeURIComponent(date)}`, { headers: scope(arenaId) });
export const createArenaBooking = (body, arenaId) => apiJson(`${BASE}/arena-bookings`, { method: 'POST', body, headers: scope(arenaId) });
export const cancelArenaBooking = (id, arenaId) => apiJson(`${BASE}/arena-bookings/${encodeURIComponent(id)}/cancel`, { method: 'POST', headers: scope(arenaId) });
