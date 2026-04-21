# Manual QA checklist (integrated API)

Use with `VITE_API_URL` set on the frontend and backend `.env` (`MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, optional `MOCK_PAYMENT_WEBHOOK_SECRET`, `ALLOW_COACH_SELF_REGISTER`).

## Health and auth

- [ ] `GET /api/health` returns 200 and database status as expected.
- [ ] Customer register → login → JWT stored; `GET /api/auth/me` matches UI.
- [ ] (Dev only) OTP verify: with `DEV_OTP_ENABLED=true`, `POST /api/auth/verify-otp` accepts the configured `DEV_OTP_CODE` (default 1234); when disabled it returns 503.
- [ ] Token refresh after access expiry (or forced 401) recovers without full logout.
- [ ] Logout revokes refresh token and clears client storage.
- [ ] Forgot password → reset flow (dev: `PASSWORD_RESET_RETURN_TOKEN=true` or email pipeline when implemented).

## Customer

- [ ] Public arenas list/detail; court availability for a date updates after bookings.
- [ ] Create booking (wallet or configured method); appears under **My Bookings**; cancel applies correct wallet refund when applicable.
- [ ] Wallet top-up via mock intent + webhook; balance updates on **Wallet**.
- [ ] Purchase membership; discount reflected on next booking if configured.
- [ ] Coaching: browse batches → enroll → **Dashboard / Coaching** shows enrollment; cancel enrollment succeeds.
- [ ] **Edit profile**: name, phone, avatar persist via `PATCH /api/me/profile`.
- [ ] **My attendance**: calendar reflects `GET /api/me/attendance` for the visible month when sessions exist.

## Super admin

- [ ] Arenas / courts / image upload (if Cloudinary configured).
- [ ] **Identity Registry**: users load from `GET /api/admin/users`; role / arena scope save via `PATCH /api/admin/users/:id`; suspend sets inactive.
- [ ] **Financial Analytics**: live summary strip matches `GET /api/admin/reports/summary` for selected date range.
- [ ] **Sponsors**: list/create/delete via admin sponsor endpoints.
- [ ] Bookings, membership plans, coaching batches, inventory, POS, CMS (existing flows).

## Arena staff

- [ ] Login as `ARENA_ADMIN` / `RECEPTIONIST`; scoped `arenaId` enforced on listings and mutations.
- [ ] Arena dashboard bookings for selected date load.

## Coach

- [ ] `POST /api/auth/coach-register` (unless `ALLOW_COACH_SELF_REGISTER=false`) then login.
- [ ] **Coach dashboard** lists assigned batches (`GET /api/coach/batches`).
- [ ] **My students** lists enrollments across batches (`GET /api/coach/students`).
- [ ] **Attendance**: mark session → `PUT /api/coach/batches/:batchId/attendance`; history appears; customer **My attendance** shows statuses.

## Automated regression

- [ ] `cd Backend && npm test`
- [ ] `cd Frontend && npm test`
