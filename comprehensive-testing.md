# Comprehensive Testing Plan

## Goal
Fix all currently broken tests and implement comprehensive test coverage for untested features (specifically Coach Attendance) in both Backend and Frontend.

## Analysis
- **Backend**: 5 failures in auth, bookings, security, and financial tests.
- **Frontend**: Multiple failures in API contracts and coaching batch adapters.
- **Untested**: Coach Attendance feature (Arena, Coach, and Admin panels).

## Tasks
- [ ] Task 1: Fix Backend Security IDOR tests (Expected 403, Received 404) → Verify: `npm test tests/security.advanced.test.js` passes
- [ ] Task 2: Fix Backend Wallet refund tests (Expected 200, Received 500) → Verify: `npm test tests/phase10.financial.test.js` passes
- [ ] Task 3: Fix Frontend API contract tests (unexpected headers argument) → Verify: `npm test tests/arenaStaffApi.contract.test.js` passes
- [ ] Task 4: Fix Frontend Coaching Batch adapter tests (schedule mapping) → Verify: `npm test tests/coachingBatchAdapter.test.js` passes
- [ ] Task 5: Implement Backend integration tests for `StaffAttendance` → Verify: `npm test tests/staffAttendance.test.js` (New)
- [ ] Task 6: Implement Frontend unit tests for `CoachAttendance.jsx` component → Verify: `npm test tests/CoachAttendance.test.jsx` (New)
- [ ] Task 7: Run full project verification scripts → Verify: `python .agent/scripts/checklist.py .`

## Done When
- [ ] All backend tests pass
- [ ] All frontend tests pass
- [ ] Coverage report shows >80% for critical business logic (Bookings, Attendance, Auth)
