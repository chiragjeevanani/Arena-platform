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
export const getWalkinCourts = () => apiJson(`${BASE}/walkin/courts`);

export const getWalkinSlots = (courtId, date) =>
  apiJson(`${BASE}/walkin/slots?courtId=${encodeURIComponent(courtId)}&date=${encodeURIComponent(date)}`);

export const createWalkinBooking = (body) =>
  apiJson(`${BASE}/walkin/book`, { method: 'POST', body });

export const updateMyBooking = (id, body) =>
  apiJson(`${BASE}/bookings/${encodeURIComponent(id)}`, { method: 'PATCH', body });
