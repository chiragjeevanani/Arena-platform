import { apiJson } from './apiClient';

export function listAdminCourtSlots(arenaId, courtId, day) {
  const q = new URLSearchParams();
  if (day) q.append('day', day);
  return apiJson(`/api/admin/arenas/${encodeURIComponent(arenaId)}/courts/${encodeURIComponent(courtId)}/slots?${q}`, {
    method: 'GET',
  });
}

export function listAdminArenaSlots(arenaId, day) {
  const q = new URLSearchParams();
  if (day) q.append('day', day);
  return apiJson(`/api/admin/arenas/${encodeURIComponent(arenaId)}/slots?${q}`, {
    method: 'GET',
  });
}

export function createAdminCourtSlot(arenaId, courtId, body) {
  return apiJson(`/api/admin/arenas/${encodeURIComponent(arenaId)}/courts/${encodeURIComponent(courtId)}/slots`, {
    method: 'POST',
    body,
  });
}

export function deleteAdminCourtSlot(slotId) {
  return apiJson(`/api/admin/slots/${encodeURIComponent(slotId)}`, {
    method: 'DELETE',
  });
}
