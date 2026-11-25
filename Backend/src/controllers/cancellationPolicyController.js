const { getCancellationPolicy, loadCancellationPolicy, saveCancellationPolicy, LIMITS } = require('../services/cancellationPolicy');

/** GET /public/policies/cancellation — numbers the app shows in its help, policy and receipt texts. */
async function getPublicCancellationPolicy(req, res) {
  const p = getCancellationPolicy();
  return res.json({ policy: { refundHours: p.refundHours, graceMinutes: p.graceMinutes } });
}

/** GET /admin/settings/cancellation-policy (Super Admin) */
async function getAdminCancellationPolicy(req, res) {
  const p = await loadCancellationPolicy();
  return res.json({ policy: p, limits: LIMITS });
}

/** PUT /admin/settings/cancellation-policy  { refundHours, graceMinutes } (Super Admin) */
async function updateAdminCancellationPolicy(req, res) {
  try {
    const p = await saveCancellationPolicy(req.body || {}, req.auth.sub);
    return res.json({ policy: p, limits: LIMITS });
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: err.message });
    throw err;
  }
}

module.exports = { getPublicCancellationPolicy, getAdminCancellationPolicy, updateAdminCancellationPolicy };
