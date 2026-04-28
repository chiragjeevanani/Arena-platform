/** Map API coaching batch to UI card shape used by coach pages */
export function mapApiBatchToCard(b) {
  const id = String(b.id || '');
  const palette = ['#CE2029', '#36454F', '#6366f1', '#f59e0b', '#22c55e', '#ec4899'];
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const color = palette[h % palette.length];
  const schedule = (b.schedule || '').trim();
  const scheduleTime = (b.scheduleTime || '').trim();
  const time = scheduleTime || (schedule && schedule.includes('–') ? schedule : schedule || `${b.startDate || ''} – ${b.endDate || ''}`.trim() || '—');
  return {
    id,
    name: b.title || 'Batch',
    level: 'Open',
    students: typeof b.enrolledCount === 'number' ? b.enrolledCount : 0,
    maxStudents: Number(b.capacity) || 0,
    schedule: schedule || `${b.startDate} – ${b.endDate}`,
    time,
    arena: b.arenaName || '—',
    court: '—',
    color,
    type: /online|zoom|virtual/i.test(schedule + scheduleTime + (b.description || '')) ? 'Online' : 'Offline',
    raw: b,
  };
}
