# Arena CRM API

Express + MongoDB + JWT (JavaScript).

## Commands

- `npm test` — Jest + Supertest (uses in-memory MongoDB; no Atlas required).
- `npm run dev` — Run API with `--watch` (loads `.env`).
- `npm start` — Production-style start.

## Configuration

Copy `.env.example` to `.env` and set `MONGODB_URI` (include database name, e.g. `/arena-crm`) and `JWT_SECRET`.

## API highlights (Phase 3–10)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/public/arenas` | No |
| GET | `/api/public/arenas/:id` | No |
| GET | `/api/public/arenas/:arenaId/membership-plans` | No |
| GET | `/api/public/arenas/:arenaId/coaching-batches` | No |
| GET | `/api/public/cms?kind=` (`hero`, `event`, `category`; optional `arenaId`) | No |
| GET | `/api/public/courts/:courtId/availability?date=` | No |
| POST | `/api/me/bookings` | Bearer `CUSTOMER` |
| GET | `/api/me/bookings` | Bearer `CUSTOMER` |
| PATCH | `/api/me/bookings/:id/cancel` | Bearer `CUSTOMER` |
| GET | `/api/me/wallet` | Bearer `CUSTOMER` |
| POST | `/api/me/wallet/top-up` | Bearer `CUSTOMER` |
| GET | `/api/me/memberships` | Bearer `CUSTOMER` |
| POST | `/api/me/memberships/purchase` | Bearer `CUSTOMER` |
| POST | `/api/me/enrollments` | Bearer `CUSTOMER` |
| GET | `/api/me/enrollments` | Bearer `CUSTOMER` |
| PATCH | `/api/me/enrollments/:id/cancel` | Bearer `CUSTOMER` |
| GET | `/api/coach/batches` | Bearer `COACH` |
| GET | `/api/admin/bookings` | Bearer `SUPER_ADMIN` |
| PATCH | `/api/admin/bookings/:bookingId` | Bearer `SUPER_ADMIN` |
| POST | `/api/admin/membership-plans` | Bearer `SUPER_ADMIN` |
| GET | `/api/admin/membership-plans?arenaId=` | Bearer `SUPER_ADMIN` |
| POST | `/api/admin/coaching-batches` | Bearer `SUPER_ADMIN` |
| GET | `/api/admin/coaching-batches?arenaId=` | Bearer `SUPER_ADMIN` |
| PATCH | `/api/admin/coaching-batches/:batchId` | Bearer `SUPER_ADMIN` |
| POST | `/api/admin/inventory` | Bearer `SUPER_ADMIN` |
| GET | `/api/admin/inventory?arenaId=` | Bearer `SUPER_ADMIN` |
| PATCH | `/api/admin/inventory/:itemId` | Bearer `SUPER_ADMIN` |
| POST | `/api/admin/pos/sales` | Bearer `SUPER_ADMIN` |
| GET | `/api/admin/pos/sales?arenaId=` | Bearer `SUPER_ADMIN` |
| POST | `/api/admin/cms` | Bearer `SUPER_ADMIN` |
| GET | `/api/admin/cms` | Bearer `SUPER_ADMIN` |
| PATCH | `/api/admin/cms/:contentId` | Bearer `SUPER_ADMIN` |
| DELETE | `/api/admin/cms/:contentId` | Bearer `SUPER_ADMIN` |
| POST | `/api/admin/arenas` | Bearer `SUPER_ADMIN` |
| POST | `/api/admin/arenas/:arenaId/courts` | Bearer `SUPER_ADMIN` |
| DELETE | `/api/admin/courts/:courtId` | Bearer `SUPER_ADMIN` |
| POST | `/api/admin/upload/image` | Bearer `SUPER_ADMIN`, multipart `file` |
| GET/PATCH | `/api/arena-admin/bookings` (and other arena-scoped admin resources) | Bearer `ARENA_ADMIN` / `RECEPTIONIST`, `arenaId` in query/body where applicable |
| POST | `/api/me/payments/intent` | Bearer `CUSTOMER` |
| GET | `/api/me/payments` | Bearer `CUSTOMER` |
| POST | `/api/webhooks/payments/mock` | Header `x-mock-payment-secret` (see `MOCK_PAYMENT_WEBHOOK_SECRET`) |
| POST | `/api/auth/refresh` | Body `{ refreshToken }` |
| POST | `/api/auth/logout` | Body `{ refreshToken }` |
| POST | `/api/auth/forgot-password` | Body `{ email }` |
| POST | `/api/auth/reset-password` | Body `{ token, newPassword }` |

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `.env` for uploads.  
Set `MOCK_PAYMENT_WEBHOOK_SECRET` if you use the mock payment webhook locally or in staging.  
Optional: `AUTH_RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_WINDOW_MS`, `REFRESH_TOKEN_TTL_MS`. Never set `PASSWORD_RESET_RETURN_TOKEN=true` in production (test-only).

## Roadmap

See [docs/PHASES.md](docs/PHASES.md) for phased delivery and what to build next with TDD.
