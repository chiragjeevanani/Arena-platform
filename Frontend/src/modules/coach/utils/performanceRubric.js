/** Default assessment rubric (metric `id` matches API `metricKey`) */
export const COACH_PERFORMANCE_RUBRIC = [
  {
    category: 'Technical',
    metrics: [
      { id: 'footwork', name: 'Footwork' },
      { id: 'stroke', name: 'Stroke consistency' },
      { id: 'net', name: 'Net play' },
    ],
  },
  {
    category: 'Physical',
    metrics: [
      { id: 'agility', name: 'Agility' },
      { id: 'endurance', name: 'Endurance' },
    ],
  },
  {
    category: 'Tactical',
    metrics: [
      { id: 'position', name: 'Court positioning' },
      { id: 'serve', name: 'Serve strategy' },
    ],
  },
];

export function buildMetricsPayloadFromRubric(rubric, scores) {
  const out = [];
  rubric.forEach((group) => {
    group.metrics.forEach((m) => {
      out.push({
        metricKey: m.id,
        groupCategory: group.category,
        name: m.name,
        score: Math.min(10, Math.max(0, Number(scores[m.id]) || 0)),
      });
    });
  });
  return out;
}

export function scoresFromApiMetrics(apiMetrics) {
  const scores = {};
  (apiMetrics || []).forEach((row) => {
    if (row.metricKey) scores[row.metricKey] = row.score;
  });
  return scores;
}
