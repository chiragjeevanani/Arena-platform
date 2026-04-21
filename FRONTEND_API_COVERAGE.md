# Frontend ↔ API coverage map

This document maps **Express routes** to **frontend service modules** and **pages**, and calls out **UI without a backing API**.

## Environment

- Customer/admin/coach API calls require `VITE_API_URL` (see [Frontend/src/services/config.js](Frontend/src/services/config.js)).
- Backend CORS: `CORS_ORIGIN` should match the Vite dev origin.

## Route ↔ service ↔ primary UI

| Backend prefix | Frontend service | Primary surfaces |
|----------------|------------------|-------------------|
| `GET /api/health` | (ops / manual) | Health checks |
| `/api/auth/*` | [authApi.js](Frontend/src/services/authApi.js) | Login, Signup, Coach self-register (`/coach-register`), Forgot/Reset password, Coach login |
| `/api/public/*` | [arenasApi.js](Frontend/src/services/arenasApi.js), [membershipsPublicApi.js](Frontend/src/services/membershipsPublicApi.js), [coachingPublicApi.js](Frontend/src/services/coachingPublicApi.js), [bookingsApi.js](Frontend/src/services/bookingsApi.js), [cmsApi.js](Frontend/src/services/cmsApi.js), [eventsApi.js](Frontend/src/services/eventsApi.js) | Home, Arena list/detail, Slot selection, Coaching, Events |
| `/api/me/*` | [bookingsApi.js](Frontend/src/services/bookingsApi.js), [meApi.js](Frontend/src/services/meApi.js) | Booking summary/success, Dashboard, Wallet, Memberships, Coaching summary, Payment, profile patch, customer attendance |
| `/api/webhooks/*` | [meApi.js](Frontend/src/services/meApi.js) | Wallet mock top-up |
| `/api/coach/*` | [coachApi.js](Frontend/src/services/coachApi.js) | Coach dashboard, roster (`/students`), attendance history, per-batch students and `PUT` attendance |
| `/api/admin/*` | [adminBookingsApi.js](Frontend/src/services/adminBookingsApi.js), [adminOpsApi.js](Frontend/src/services/adminOpsApi.js), [cmsApi.js](Frontend/src/services/cmsApi.js), [adminUsersApi.js](Frontend/src/services/adminUsersApi.js), [adminReportsApi.js](Frontend/src/services/adminReportsApi.js), [adminSponsorsApi.js](Frontend/src/services/adminSponsorsApi.js) | Admin panel: bookings, arenas, inventory, POS, CMS, **users**, **reports/summary**, **sponsors** |
| `/api/arena-admin/*` | [arenaAdminApi.js](Frontend/src/services/arenaAdminApi.js) | Arena panel login + dashboards |

## Gaps resolved in codebase (this iteration)

| Area | Notes |
|------|--------|
| Coach self-register | `POST /api/auth/coach-register` when `ALLOW_COACH_SELF_REGISTER=true` (default in dev; disable in production if needed). |
| Coach batch students & attendance | `GET/PUT /api/coach/batches/:batchId/students` and attendance under `/api/coach/batches/:batchId/attendance`. |
| Admin staff directory | `GET/PATCH /api/admin/users` (SUPER_ADMIN). **Role Management** screen remains a local permission matrix; server roles are fixed enums on `User`. |
| Financial summary | `GET /api/admin/reports/summary` for aggregates used by Financial Reports. |
| Sponsorships | `GET/POST/PATCH/DELETE /api/admin/sponsors` backed by `Sponsor` model. |
| Customer profile | `PATCH /api/me/profile` (name, phone, avatarUrl). |
| OTP (dev mode only) | `POST /api/auth/verify-otp` supported when backend has `DEV_OTP_ENABLED=true`; frontend reads `VITE_OTP_MODE=dev` (otherwise OTP is disabled and the UI guides users to password login). |
| Customer attendance view | `GET /api/me/attendance` derived from coach-recorded batch attendance. |

## UI still primarily local / product placeholders

| Page / module | Behaviour |
|----------------|-----------|
| [RoleManagement.jsx](Frontend/src/modules/admin/pages/RoleManagement.jsx) | Custom role matrix is **not** persisted; server uses fixed `User.role` values. |
| [OTPVerification.jsx](Frontend/src/modules/user/pages/OTPVerification.jsx) | No SMS OTP backend in this repo; dev-only verification exists via `POST /api/auth/verify-otp` when `DEV_OTP_ENABLED=true`. |
| Arena panel (`ArenaPanel/*`) | Many screens are still prototype UI; they show an explicit **Demo UI** banner until arena-admin APIs are implemented for those flows. |
| [Notifications.jsx](Frontend/src/modules/user/pages/Notifications.jsx), Help/Privacy copy | Mostly static UX. |

## Automated tests

- Backend: `cd Backend && npm test`
- Frontend: `cd Frontend && npm test`

See [Backend/docs/QA_CHECKLIST.md](Backend/docs/QA_CHECKLIST.md) for manual release checks.
