/** Event setup form helpers (schedule, blocked courts, entry categories). */
export const TYPE_LABEL = { single: 'Single player', pair: 'Pair (2 players)', team: 'Team' };

/** Default event setup: today-less, all day, all courts of the first arena, one category. */
export const emptySetup = () => ({
  startDate: '', days: 1, allDay: true, startTime: '16:00', endTime: '22:00',
  blockCourts: true, holdArenaId: '', courtIds: [],
  categories: [{ name: 'Singles', type: 'single', minPlayers: 1, maxPlayers: 1, fee: '', maxEntries: '' }],
});

/** Event (from the API) → form setup. Older events without eventInfo use the subtitle date/fee. */
export function setupFromEvent(ev) {
  const info = ev?.eventInfo;
  const parts = String(ev?.subtitle || '').split('|').map((s) => s.trim());
  if (!info) {
    const s = emptySetup();
    s.startDate = /^\d{4}-\d{2}-\d{2}$/.test(parts[0] || '') ? parts[0] : '';
    s.blockCourts = false;
    s.categories = [{ name: 'Entry', type: 'single', minPlayers: 1, maxPlayers: 1, fee: parts[3] && !Number.isNaN(Number(parts[3])) ? parts[3] : '', maxEntries: '' }];
    return s;
  }
  return {
    startDate: info.startDate || '', days: info.days || 1, allDay: info.allDay !== false,
    startTime: info.allDay === false ? info.startTime : '16:00', endTime: info.allDay === false ? info.endTime : '22:00',
    blockCourts: (info.courtIds || []).length > 0, holdArenaId: info.holdArenaId || '', courtIds: info.courtIds || [],
    categories: (info.categories || []).map((c) => ({ id: c.id, name: c.name, type: c.type, minPlayers: c.minPlayers, maxPlayers: c.maxPlayers, fee: String(c.fee ?? ''), maxEntries: c.maxEntries ? String(c.maxEntries) : '' })),
  };
}

/** Form setup → { eventInfo, timeText, feeText } for the API (fee text keeps older screens working). */
export function setupToPayload(s) {
  const categories = s.categories.filter((c) => c.name.trim()).map((c) => ({
    ...(c.id ? { id: c.id } : {}), name: c.name.trim(), type: c.type,
    minPlayers: c.type === 'team' ? Number(c.minPlayers) : c.type === 'pair' ? 2 : 1,
    maxPlayers: c.type === 'team' ? Number(c.maxPlayers) : c.type === 'pair' ? 2 : 1,
    fee: Number(c.fee) || 0, maxEntries: Number(c.maxEntries) || 0,
  }));
  const fees = categories.map((c) => c.fee);
  return {
    eventInfo: {
      startDate: s.startDate, days: Number(s.days) || 1, allDay: s.allDay, startTime: s.startTime, endTime: s.endTime,
      holdArenaId: s.blockCourts ? s.holdArenaId : null, courtIds: s.blockCourts ? s.courtIds : [], categories,
    },
    timeText: s.allDay ? 'All day' : `${s.startTime}–${s.endTime}`,
    feeText: fees.length ? String(Math.min(...fees)) : '0',
  };
}

/** Problems that stop the form from continuing (shown under the step). */
export function setupProblems(s, step) {
  const p = [];
  if (step === 'schedule') {
    if (!s.startDate) p.push('Choose the start date');
    if (!s.allDay && s.endTime !== '00:00' && s.endTime <= s.startTime) p.push('The end time must be after the start time');
    if (s.blockCourts && (!s.holdArenaId || !s.courtIds.length)) p.push('Tick the courts the event uses (or switch off "Block courts")');
  }
  if (step === 'categories') {
    if (!s.categories.length) p.push('Add at least one category');
    s.categories.forEach((c, i) => {
      if (!c.name.trim()) p.push(`Category ${i + 1}: enter a name`);
      if (c.fee === '' || Number(c.fee) < 0 || Number.isNaN(Number(c.fee))) p.push(`${c.name || `Category ${i + 1}`}: enter the fee (0 = free)`);
      if (c.type === 'team' && !(Number(c.minPlayers) >= 2 && Number(c.maxPlayers) >= Number(c.minPlayers) && Number(c.maxPlayers) <= 30)) p.push(`${c.name || `Category ${i + 1}`}: team size from 2 up to 30 (min ≤ max)`);
    });
  }
  return p;
}
