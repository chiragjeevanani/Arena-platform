import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Layouts - Lazy loaded to prevent loading admin/coach code on user app
const UserLayout = lazy(() => import('./layouts/UserLayout'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const CoachLayout = lazy(() => import('./layouts/CoachLayout'));
const ArenaLayout = lazy(() => import('./layouts/ArenaLayout'));

// Loading Fallback
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress sx={{ color: '#CE2029' }} />
  </Box>
);

// Auth Pages
const Login = lazy(() => import('./modules/user/pages/Login'));
const Signup = lazy(() => import('./modules/user/pages/Signup'));
const OTPVerification = lazy(() => import('./modules/user/pages/OTPVerification'));
const ForgotPassword = lazy(() => import('./modules/user/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./modules/user/pages/ResetPassword'));
const EmailVerifiedPage = lazy(() => import('./modules/user/pages/EmailVerifiedPage'));

// User Pages
const UserHome = lazy(() => import('./modules/user/pages/Home'));
const ArenaListing = lazy(() => import('./modules/user/pages/ArenaListing'));
const ArenaDetails = lazy(() => import('./modules/user/pages/ArenaDetails'));
const SlotSelection = lazy(() => import('./modules/user/pages/SlotSelection'));
const BookingSummary = lazy(() => import('./modules/user/pages/BookingSummary'));
const Payment = lazy(() => import('./modules/user/pages/Payment'));
const BookingSuccess = lazy(() => import('./modules/user/pages/BookingSuccess'));
const BookingDetails = lazy(() => import('./modules/user/pages/BookingDetails'));
const Dashboard = lazy(() => import('./modules/user/pages/Dashboard'));
const Coaching = lazy(() => import('./modules/user/pages/Coaching'));
const Profile = lazy(() => import('./modules/user/pages/Profile'));
const EditProfile = lazy(() => import('./modules/user/pages/EditProfile'));
const Wallet = lazy(() => import('./modules/user/pages/Wallet'));
const Notifications = lazy(() => import('./modules/user/pages/Notifications'));
const Events = lazy(() => import('./modules/user/pages/Events'));
const EventDetail = lazy(() => import('./modules/user/pages/EventDetail'));
const Privacy = lazy(() => import('./modules/user/pages/Privacy'));
const Help = lazy(() => import('./modules/user/pages/Help'));
const Terms = lazy(() => import('./modules/user/pages/Terms'));
const CoachingSummary = lazy(() => import('./modules/user/pages/CoachingSummary'));
const MembershipPlans = lazy(() => import('./modules/user/pages/MembershipPlans'));
const MyAttendance = lazy(() => import('./modules/user/pages/MyAttendance'));

// Admin Pages
const AdminDashboard = lazy(() => import('./modules/admin/pages/Dashboard'));
const RoleManagement = lazy(() => import('./modules/admin/pages/RoleManagement'));
const UserManagement = lazy(() => import('./modules/admin/pages/UserManagement'));
const ArenaManagement = lazy(() => import('./modules/admin/pages/ArenaManagement'));
const CourtManagement = lazy(() => import('./modules/admin/pages/CourtManagement'));
const SlotSchedule = lazy(() => import('./modules/admin/pages/SlotSchedule'));
const Bookings = lazy(() => import('./modules/admin/pages/Bookings'));
const CoachingAdmin = lazy(() => import('./modules/admin/pages/CoachingAdmin'));
const EventsAdmin = lazy(() => import('./modules/admin/pages/EventsAdmin'));
const Sponsorships = lazy(() => import('./modules/admin/pages/Sponsorships'));
const Inventory = lazy(() => import('./modules/admin/pages/Inventory'));
const RetailPOS = lazy(() => import('./modules/admin/pages/RetailPOS'));
const SalesHistory = lazy(() => import('./modules/admin/pages/SalesHistory'));
const TransactionDetails = lazy(() => import('./modules/admin/pages/TransactionDetails'));
const FinancialReports = lazy(() => import('./modules/admin/pages/FinancialReports'));
const AccountSettings = lazy(() => import('./modules/admin/pages/AccountSettings'));
const AdminLogin = lazy(() => import('./modules/admin/pages/AdminLogin'));
const MembershipMgmt = lazy(() => import('./modules/admin/pages/MembershipMgmt'));
const ActiveMemberships = lazy(() => import('./modules/admin/pages/ActiveMemberships'));
const Placeholder = lazy(() => import('./modules/admin/pages/Placeholder'));

// Coach Pages
const CoachDashboard = lazy(() => import('./modules/coach/pages/CoachDashboard'));
const MyStudents = lazy(() => import('./modules/coach/pages/MyStudents'));
const CoachLogin = lazy(() => import('./modules/coach/pages/CoachLogin'));
const CoachSignup = lazy(() => import('./modules/coach/pages/CoachSignup'));
const AttendanceRecords = lazy(() => import('./modules/coach/pages/AttendanceRecords'));
const CoachWorkAttendance = lazy(() => import('./modules/coach/pages/CoachWorkAttendance'));
const ScheduleCalendar = lazy(() => import('./modules/coach/pages/ScheduleCalendar'));
const ProgressTracker = lazy(() => import('./modules/coach/pages/ProgressTracker'));
const CoachBatches = lazy(() => import('./modules/coach/pages/CoachBatches'));
const BatchDetails = lazy(() => import('./modules/coach/pages/BatchDetails'));
const BatchStudents = lazy(() => import('./modules/coach/pages/BatchStudents'));
const StudentPerformance = lazy(() => import('./modules/coach/pages/StudentPerformance'));
const CoachProfile = lazy(() => import('./modules/coach/pages/CoachProfile'));

// Admin Extra Pages
const PricingManagement = lazy(() => import('./modules/admin/pages/PricingManagement'));
const EventBanners = lazy(() => import('./modules/admin/pages/EventBanners'));
const ArenaManagementPanel = lazy(() => import('./modules/admin/pages/ArenaManagementPanel'));
const FrontendHeroMgmt = lazy(() => import('./modules/admin/pages/FrontendHeroMgmt'));
const FrontendCategoryMgmt = lazy(() => import('./modules/admin/pages/FrontendCategoryMgmt'));
const ArenaListAdmin = lazy(() => import('./modules/admin/pages/ArenaListAdmin'));
const ArenaDetailsAdmin = lazy(() => import('./modules/admin/pages/ArenaDetailsAdmin'));
const CourtSlotsAdmin = lazy(() => import('./modules/admin/pages/CourtSlotsAdmin'));

// Arena Panel (Standalone)
const ArenaLogin = lazy(() => import('./modules/arena/pages/ArenaLogin'));
const ArenaDashboard = lazy(() => import('./modules/arena/pages/ArenaDashboard'));

const ArenaDetailsPage = lazy(() => import('./modules/arena/pages/index.jsx').then(m => ({ default: m.ArenaDetailsPage })));
const CourtMgmtPage = lazy(() => import('./modules/arena/pages/index.jsx').then(m => ({ default: m.CourtMgmtPage })));
const SlotConfigPage = lazy(() => import('./modules/arena/pages/index.jsx').then(m => ({ default: m.SlotConfigPage })));
const PricingRulesPage = lazy(() => import('./modules/arena/pages/index.jsx').then(m => ({ default: m.PricingRulesPage })));
const AvailabilityPage = lazy(() => import('./modules/arena/pages/index.jsx').then(m => ({ default: m.AvailabilityPage })));
const InventoryPage = lazy(() => import('./modules/arena/pages/index.jsx').then(m => ({ default: m.InventoryPage })));
const EventsAdminPage = lazy(() => import('./modules/arena/pages/index.jsx').then(m => ({ default: m.EventsAdminPage })));
const RetailPOSPage = lazy(() => import('./modules/arena/pages/index.jsx').then(m => ({ default: m.RetailPOSPage })));
const AccountSettingsPage = lazy(() => import('./modules/arena/pages/index.jsx').then(m => ({ default: m.AccountSettingsPage })));
const AttendancePage = lazy(() => import('./modules/arena/pages/index.jsx').then(m => ({ default: m.AttendancePage })));


// Components
import ScrollToTop from './components/ScrollToTop';

const muiTheme = createTheme({
  typography: {
    fontFamily: '"Outfit", sans-serif',
    fontSize: 16.5,
  },
  palette: {
    text: {
      primary: '#36454F',
      secondary: '#818589',
    },
    grey: {
      400: '#818589',
      500: '#818589',
      600: '#818589',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Unified Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* === ARENA PANEL (Standalone) === */}
            <Route path="/arena/login" element={<ArenaLogin />} />
            <Route path="/arena" element={<ArenaLayout />}>
              <Route path="sales/:saleId" element={<TransactionDetails />} />
              <Route index element={<ArenaDashboard />} />
              <Route path="details" element={<ArenaDetailsPage />} />
              <Route path="courts" element={<CourtMgmtPage />} />
              <Route path="slots" element={<SlotConfigPage />} />
              <Route path="pricing" element={<PricingRulesPage />} />
              <Route path="availability" element={<AvailabilityPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="events" element={<EventsAdminPage />} />
              <Route path="retail" element={<RetailPOSPage />} />
              <Route path="ledger" element={<Bookings />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="account-settings" element={<AccountSettingsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="roles" element={<RoleManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="arenas" element={<ArenaManagement />} />
              <Route path="courts" element={<CourtManagement />} />
              <Route path="slots" element={<SlotSchedule />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="coaching" element={<CoachingAdmin />} />
              <Route path="events" element={<EventsAdmin />} />
              <Route path="sponsorships" element={<Sponsorships />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="pos" element={<RetailPOS />} />
              <Route path="sales" element={<SalesHistory />} />
              <Route path="sales/:saleId" element={<TransactionDetails />} />
              <Route path="reports" element={<FinancialReports />} />
              <Route path="pricing" element={<PricingManagement />} />
              <Route path="membership" element={<MembershipMgmt />} />
              <Route path="membership/active" element={<ActiveMemberships />} />
              <Route path="user/hero" element={<FrontendHeroMgmt />} />
              <Route path="user/events" element={<EventBanners />} />
              <Route path="user/booking" element={<FrontendCategoryMgmt />} />
              <Route path="arena/details" element={<ArenaListAdmin />} />
              <Route path="arena/details/:id" element={<ArenaDetailsAdmin />} />
              <Route path="arena/slots/:arenaId/:courtId" element={<CourtSlotsAdmin />} />
              <Route path="settings" element={<AccountSettings />} />
              <Route path="arena-panel" element={<ArenaManagementPanel />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/otp-verify" element={<OTPVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/verify-email" element={<EmailVerifiedPage />} />

            {/* User App Routes (Mobile-first) - Primary Entry */}
            <Route path="/" element={<UserLayout />}>
              <Route index element={<UserHome />} />
              <Route path="arenas" element={<ArenaListing />} />
              <Route path="events" element={<Events />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="bookings" element={<Dashboard />} />
              <Route path="coaching" element={<Coaching />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/edit" element={<EditProfile />} />
              <Route path="profile/wallet" element={<Wallet />} />
              <Route path="profile/attendance" element={<MyAttendance />} />
              <Route path="profile/notifications" element={<Notifications />} />
              <Route path="profile/privacy" element={<Privacy />} />
              <Route path="profile/help" element={<Help />} />
              <Route path="terms" element={<Terms />} />
            </Route>

            {/* Booking Flow (Separate from Bottom Nav but still under User Context) */}
            <Route path="/arenas/:id" element={<ArenaDetails />} />
            <Route path="/book/:arenaId/:courtId" element={<SlotSelection />} />
            <Route path="/booking-summary" element={<BookingSummary />} />
            <Route path="/coaching-summary" element={<CoachingSummary />} />
            <Route path="/membership" element={<MembershipPlans />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/bookings/:id" element={<BookingDetails />} />

            {/* Coach Routes */}
            <Route path="/coach" element={<CoachLayout />}>
              <Route index element={<CoachDashboard />} />
              <Route path="schedule" element={<ScheduleCalendar />} />
              <Route path="batches" element={<CoachBatches />} />
              <Route path="batches/:id" element={<BatchDetails />} />
              <Route path="batches/:id/students" element={<BatchStudents />} />
              <Route path="students/:id/performance" element={<StudentPerformance />} />
              <Route path="students" element={<MyStudents />} />
              <Route path="attendance" element={<AttendanceRecords />} />
              <Route path="work-logs" element={<CoachWorkAttendance />} />
              <Route path="progress" element={<ProgressTracker />} />
              <Route path="profile" element={<CoachProfile />} />
            </Route>

            <Route path="/coach/login" element={<CoachLogin />} />
            <Route path="/coach/signup" element={<CoachSignup />} />


            {/* Fallback (must be last) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </MuiThemeProvider>
  );
}

export default App;

