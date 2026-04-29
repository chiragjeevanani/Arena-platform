/** Default assessment rubric (metric `id` matches API `metricKey`) */
export const COACH_PERFORMANCE_RUBRIC = [
  {
    category: 'Fundamentals',
    metrics: [
      { id: 'grip', name: 'Grip' },
      { id: 'serve_back', name: 'Serve (Back)' },
      { id: 'serve_front', name: 'Serve (Front)' },
    ],
  },
  {
    category: 'Footwork Matrix',
    metrics: [
      { id: 'footwork_front', name: 'Footwork (Front)' },
      { id: 'footwork_back', name: 'Footwork (Back)' },
    ],
  },
  {
    category: 'Forehand Excellence',
    metrics: [
      { id: 'fh_toss', name: 'Forehand (Toss)' },
      { id: 'fh_overhead_toss', name: 'Forehand (Overhead Toss)' },
      { id: 'fh_drive', name: 'Forehand Drive' },
      { id: 'fh_push', name: 'Forehand Push' },
      { id: 'fh_smash_straight', name: 'Forehand Smash (Straight)' },
      { id: 'fh_smash_cross', name: 'Forehand Smash (Cross)' },
      { id: 'fh_drop_straight', name: 'Forehand Drop (Straight)' },
      { id: 'fh_drop_cross', name: 'Forehand Drop (Cross)' },
      { id: 'fh_dribble_straight', name: 'Forehand Dribble (Straight)' },
      { id: 'fh_dribble_cross', name: 'Forehand Dribble (Cross)' },
    ],
  },
  {
    category: 'Backhand Proficiency',
    metrics: [
      { id: 'bh_toss', name: 'Backhand (Toss)' },
      { id: 'bh_drive', name: 'Backhand Drive' },
      { id: 'bh_smash_straight', name: 'Backhand Smash (Straight)' },
      { id: 'bh_smash_cross', name: 'Backhand Smash (Cross)' },
      { id: 'bh_drop_straight', name: 'Backhand Drop (Straight)' },
      { id: 'bh_drop_cross', name: 'Backhand Drop (Cross)' },
      { id: 'bh_dribble_straight', name: 'Backhand Dribble (Straight)' },
      { id: 'bh_dribble_cross', name: 'Backhand Dribble (Cross)' },
    ],
  },
  {
    category: 'Physical Dynamics',
    metrics: [
      { id: 'leg_strength', name: 'Leg Strength' },
      { id: 'arm_strength', name: 'Arm Strength' },
      { id: 'speed_movement', name: 'Speed of movement' },
    ],
  },
  {
    category: 'Strategy & Mindset',
    metrics: [
      { id: 'game_strategy', name: 'Game Strategy' },
      { id: 'mental_strength', name: 'Mental Strength' },
      { id: 'attendance', name: 'Attendance' },
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
