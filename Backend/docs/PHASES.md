# Backend build phases (TDD)

Work **one phase at a time**: add failing tests first, implement the minimum to pass, then move on.

## Done

### Phase 1 — Foundation

- Express app factory (`createApp`) for tests vs `server.js` for runtime.
- `GET /api/health`.
- Mongo connection helper (`connectDB` / `disconnectDB`).
- Jest + Supertest + MongoMemoryServer (tests do not hit Atlas).

**Tests:** `tests/phase1.health.test.js`

### Phase 2 — Auth (JWT)

- `User` model (customer self-register; roles enum for future staff).
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- `requireAuth` middleware.

**Tests:** `tests/phase2.auth.test.js`

### Phase 3 — Arenas & courts + Cloudinary

- Models: `Arena`, `Court`.
- Public: `GET /api/public/arenas`, `GET /api/public/arenas/:id` (published only).
- Admin (`SUPER_ADMIN` only): `POST /api/admin/arenas`, `POST /api/admin/arenas/:arenaId/courts`, `DELETE /api/admin/courts/:courtId`.
- Upload: `POST /api/admin/upload/image` (multipart field `file`) using `CLOUDINARY_*` from `.env`.

**Tests:** `tests/phase3.arenas.test.js` (Cloudinary SDK is mocked in Jest; real uploads use your `.env` when running the server).

### Phase 4 — Bookings & court availability

- Model: `Booking` with partial unique index on `(courtId, date, timeSlot)` for active statuses (`pending` / `confirmed`).
- Customer (`CUSTOMER` JWT): `POST /api/me/bookings`, `GET /api/me/bookings`, `PATCH /api/me/bookings/:id/cancel`.
- Public: `GET /api/public/courts/:courtId/availability?date=YYYY-MM-DD` — standard hourly slots + `available` from bookings.
- Admin (`SUPER_ADMIN`): `GET /api/admin/bookings`, `PATCH /api/admin/bookings/:bookingId` (status).

**Tests:** `tests/phase4.bookings.test.js`

### Phase 5 — Membership & wallet

- Models: `MembershipPlan`, `UserMembership`, `Wallet`, `WalletTransaction`.
- Pricing: server-side hourly court price from `Arena.pricePerHour` with best active membership `discountPercent` for that arena; optional client `amount` must match when sent.
- Customer: `GET/POST /api/me/wallet`, `GET/POST /api/me/memberships` (purchase debits wallet).
- Public: `GET /api/public/arenas/:arenaId/membership-plans` (published arenas only).
- Admin: `POST/GET /api/admin/membership-plans` (list requires `?arenaId=`).
- Bookings: `paymentMethod: 'wallet'` debits wallet; duplicate slot after debit triggers refund credit.

**Tests:** `tests/phase5.membership-wallet.test.js`

### Phase 6 — Coaching, inventory, POS, CMS

- Models: `CoachingBatch`, `BatchEnrollment`, `InventoryItem`, `PosSale`, `CmsContent` (`kind`: `hero` \| `event` \| `category`).
- Admin (`SUPER_ADMIN`): coaching batches CRUD-ish (create, list by `arenaId`, patch); inventory create/list/patch; POS `POST/GET /api/admin/pos/sales`; CMS `POST/GET/PATCH/DELETE /api/admin/cms`.
- Coach (`COACH` JWT): `GET /api/coach/batches` (assigned batches + arena name).
- Customer: `POST/GET /api/me/enrollments`, `PATCH /api/me/enrollments/:id/cancel`.
- Public: `GET /api/public/arenas/:arenaId/coaching-batches` (published arena + published batches, enrollment counts); `GET /api/public/cms?kind=` (optional `arenaId` merges global + arena-specific rows).

**Tests:** `tests/phase6.coaching-inventory-cms.test.js`

### Phase 7 (Frontend) — Customer booking UI ↔ API

When `VITE_API_URL` is set:

- **Slot selection** loads `GET /api/public/arenas/:id` if needed, then `GET /api/public/courts/:courtId/availability?date=` (maps to existing slot grid; mock grid remains when API is unset).
- **Booking summary** for live checkout: logged-in **CUSTOMER** uses `POST /api/me/bookings` (no client `amount`; server pricing + membership). Others see sign-in hint; mock flow still uses `/payment` when not on API checkout.
- **Booking success** persists dashboard entry using real `booking.id` when present.

**Manual:** run Backend (`npm run dev`) + Frontend with `Frontend/.env.development` pointing at the API.

### Phase 8 — Arena-scoped staff (RBAC)

- `ARENA_ADMIN` / `RECEPTIONIST` with `assignedArenaId` access `/api/arena-admin/*`.
- Query/body `arenaId` must match assignment; booking/batch/inventory/CMS resources must belong to that arena.
- Scoped listings and updates (bookings, membership plans, coaching batches, inventory, POS sales, CMS). Arena/court creation and global uploads remain `SUPER_ADMIN` on `/api/admin`.

**Tests:** `tests/phase8.arena-rbac.test.js`

### Phase 9 — Mock payment intents + webhook

- `Payment` model; `POST /api/me/payments/intent` (CUSTOMER, `top_up` only for now); `GET /api/me/payments`.
- `POST /api/webhooks/payments/mock` with header `x-mock-payment-secret` matching `MOCK_PAYMENT_WEBHOOK_SECRET` — confirms pending payment, credits wallet idempotently.

**Tests:** `tests/phase9.payments.test.js`  
**Env:** `MOCK_PAYMENT_WEBHOOK_SECRET` (see `.env.example`).

### Phase 10 — Financial consistency (wallet cancel)

- Wallet-paid bookings set `paymentStatus: 'paid'` on create.
- `PATCH /api/me/bookings/:id/cancel` credits the wallet for `paymentMethod: 'wallet'`, appends a `WalletTransaction` (`reason: 'refund'`, `meta.bookingId`), sets `paymentStatus: 'refunded'`. Online bookings cancel without wallet movement.

**Tests:** `tests/phase10.financial.test.js`

### Phase 11 — Auth & ops hardening

- `GET /api/health` — Mongo `ping`; `db: 'up'|'down'`; `503` when DB unreachable.
- **Refresh tokens** (opaque, stored hashed): login returns `refreshToken`; `POST /api/auth/refresh` issues new access JWT; `POST /api/auth/logout` revokes the refresh token.
- **Password reset:** `POST /api/auth/forgot-password` `{ email }` (always `{ ok: true }` for unknown emails); `POST /api/auth/reset-password` `{ token, newPassword }`. When `PASSWORD_RESET_RETURN_TOKEN=true` (e.g. Jest), forgot-password may include `resetToken` for flows without email — **do not enable in production**.
- **Rate limits:** in-memory per-IP on auth mutating routes (`register`, `login`, `refresh`, `logout`, `forgot-password`, `reset-password`) via `AUTH_RATE_LIMIT_MAX` / `AUTH_RATE_LIMIT_WINDOW_MS`.
- **AuditLog** model: e.g. `password_reset` with `meta.userId` after successful reset.

**Tests:** `tests/phase11.auth-ops.test.js`

## Next (recommended order)

- Richer POS (taxes, receipts), paid coaching enrollments, real payment gateway, email delivery for password reset.

---

Run tests: `npm test`  
Local API: copy `.env.example` to `.env`, set `MONGODB_URI` and `JWT_SECRET`, then `npm run dev`.
