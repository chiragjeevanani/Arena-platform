import { apiJson } from './apiClient';

const BASE = '/api/notifications';

export function listNotifications() {
  return apiJson(BASE, { method: 'GET' });
}

export function markNotificationAsRead(id) {
  return apiJson(`${BASE}/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
}

export function markAllNotificationsAsRead() {
  return apiJson(`${BASE}/read-all`, { method: 'PATCH' });
}

export function deleteNotification(id) {
  return apiJson(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
