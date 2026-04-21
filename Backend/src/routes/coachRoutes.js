const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  listCoachBatches,
  listBatchStudents,
  listCoachStudentsAll,
  listBatchAttendance,
  upsertBatchAttendance,
  listCoachAttendanceHistory,
} = require('../controllers/coachBatchController');
const {
  listBatchProgress,
  upsertBatchProgress,
  listAllCoachProgress,
  listBatchesForStudent,
  listCoachRemarks,
  createCoachRemark,
  deleteCoachRemark,
  patchCoachRemark,
} = require('../controllers/coachProgressController');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('COACH'));

router.get('/batches', asyncHandler(listCoachBatches));
router.get('/students', asyncHandler(listCoachStudentsAll));
router.get('/students/:userId/batches', asyncHandler(listBatchesForStudent));
router.get('/attendance-history', asyncHandler(listCoachAttendanceHistory));
router.get('/batches/:batchId/students', asyncHandler(listBatchStudents));
router.get('/batches/:batchId/attendance', asyncHandler(listBatchAttendance));
router.put('/batches/:batchId/attendance', asyncHandler(upsertBatchAttendance));

router.get('/progress-summary', asyncHandler(listAllCoachProgress));
router.get('/batches/:batchId/progress', asyncHandler(listBatchProgress));
router.put('/batches/:batchId/progress', asyncHandler(upsertBatchProgress));

router.get('/remarks', asyncHandler(listCoachRemarks));
router.post('/remarks', asyncHandler(createCoachRemark));
router.delete('/remarks/:remarkId', asyncHandler(deleteCoachRemark));
router.patch('/remarks/:remarkId', asyncHandler(patchCoachRemark));

module.exports = router;
