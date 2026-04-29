import { apiJson } from './apiClient';

export function listCoachBatches() {
  return apiJson('/api/coach/batches', { method: 'GET' });
}

export function listCoachStudentsAll() {
  return apiJson('/api/coach/students', { method: 'GET' });
}

export function listCoachAttendanceHistory(params = {}) {
  const q = new URLSearchParams();
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  const qs = q.toString();
  return apiJson(`/api/coach/attendance-history${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export function listBatchStudents(batchId) {
  return apiJson(`/api/coach/batches/${encodeURIComponent(batchId)}/students`, { method: 'GET' });
}

export function listBatchAttendance(batchId, params = {}) {
  const q = new URLSearchParams();
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  const qs = q.toString();
  return apiJson(`/api/coach/batches/${encodeURIComponent(batchId)}/attendance${qs ? `?${qs}` : ''}`, {
    method: 'GET',
  });
}

export function upsertBatchAttendance(batchId, body) {
  return apiJson(`/api/coach/batches/${encodeURIComponent(batchId)}/attendance`, {
    method: 'PUT',
    body,
  });
}

export function listCoachBatchesForStudent(userId) {
  return apiJson(`/api/coach/students/${encodeURIComponent(userId)}/batches`, { method: 'GET' });
}

export function listBatchProgress(batchId, userId) {
  const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return apiJson(`/api/coach/batches/${encodeURIComponent(batchId)}/progress${q}`, { method: 'GET' });
}

export function upsertBatchProgress(batchId, body) {
  return apiJson(`/api/coach/batches/${encodeURIComponent(batchId)}/progress`, { method: 'PUT', body });
}

export function listCoachProgressSummary() {
  return apiJson('/api/coach/progress-summary', { method: 'GET' });
}

export function listCoachRemarks(batchId) {
  return apiJson(`/api/coach/remarks?batchId=${encodeURIComponent(batchId)}`, { method: 'GET' });
}

export function createCoachRemark(body) {
  return apiJson('/api/coach/remarks', { method: 'POST', body });
}

export function deleteCoachRemark(remarkId) {
  return apiJson(`/api/coach/remarks/${encodeURIComponent(remarkId)}`, { method: 'DELETE' });
}

export function patchCoachRemark(remarkId, body) {
  return apiJson(`/api/coach/remarks/${encodeURIComponent(remarkId)}`, { method: 'PATCH', body });
}

export function listCoachLeaves() {
  return apiJson('/api/coach/leaves', { method: 'GET' });
}

export function createCoachLeave(body) {
  return apiJson('/api/coach/leaves', { method: 'POST', body });
}

export function deleteCoachLeave(leaveId) {
  return apiJson(`/api/coach/leaves/${encodeURIComponent(leaveId)}`, { method: 'DELETE' });
}

export function listCoachWorkAttendance() {
  return apiJson('/api/coach/work-attendance', { method: 'GET' });
}
