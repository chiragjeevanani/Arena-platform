import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import CoachLayout from './layouts/CoachLayout';

// Auth Pages
import Login from './modules/user/pages/Login';
import Signup from './modules/user/pages/Signup';
import OTPVerification from './modules/user/pages/OTPVerification';

// User Pages
import UserHome from './modules/user/pages/Home';
import ArenaListing from './modules/user/pages/ArenaListing';
import ArenaDetails from './modules/user/pages/ArenaDetails';
import SlotSelection from './modules/user/pages/SlotSelection';
import BookingSummary from './modules/user/pages/BookingSummary';
import Payment from './modules/user/pages/Payment';
import BookingSuccess from './modules/user/pages/BookingSuccess';
import Dashboard from './modules/user/pages/Dashboard';
import Coaching from './modules/user/pages/Coaching';
import Profile from './modules/user/pages/Profile';
import EditProfile from './modules/user/pages/EditProfile';
import Wallet from './modules/user/pages/Wallet';
import Notifications from './modules/user/pages/Notifications';
import Privacy from './modules/user/pages/Privacy';
import Help from './modules/user/pages/Help';
import CoachingSummary from './modules/user/pages/CoachingSummary';

// Admin Pages
import AdminDashboard from './modules/admin/pages/Dashboard';
import RoleManagement from './modules/admin/pages/RoleManagement';
import UserManagement from './modules/admin/pages/UserManagement';
import ArenaManagement from './modules/admin/pages/ArenaManagement';
import CourtManagement from './modules/admin/pages/CourtManagement';
import SlotSchedule from './modules/admin/pages/SlotSchedule';
import Bookings from './modules/admin/pages/Bookings';
import CoachingAdmin from './modules/admin/pages/CoachingAdmin';
import EventsAdmin from './modules/admin/pages/EventsAdmin';
import Sponsorships from './modules/admin/pages/Sponsorships';
import Inventory from './modules/admin/pages/Inventory';
import RetailPOS from './modules/admin/pages/RetailPOS';
import FinancialReports from './modules/admin/pages/FinancialReports';
import AccountSettings from './modules/admin/pages/AccountSettings';
import AdminLogin from './modules/admin/pages/AdminLogin';
import Placeholder from './modules/admin/pages/Placeholder';

// Coach Pages
import CoachDashboard from './modules/coach/pages/CoachDashboard';
import MyStudents from './modules/coach/pages/MyStudents';
import AttendanceRecords from './modules/coach/pages/AttendanceRecords';
import StudentRemarks from './modules/coach/pages/StudentRemarks';

// Components
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp-verify" element={<OTPVerification />} />

        {/* User App Routes (Mobile-first) - Primary Entry */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<UserHome />} />
          <Route path="arenas" element={<ArenaListing />} />
          <Route path="arenas/:id" element={<ArenaDetails />} />
          <Route path="bookings" element={<Dashboard />} />
          <Route path="coaching" element={<Coaching />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="profile/wallet" element={<Wallet />} />
          <Route path="profile/notifications" element={<Notifications />} />
          <Route path="profile/privacy" element={<Privacy />} />
          <Route path="profile/help" element={<Help />} />
        </Route>

        {/* Booking Flow (Separate from Bottom Nav but still under User Context) */}
        <Route path="/book/:arenaId/:courtId" element={<SlotSelection />} />
        <Route path="/booking-summary" element={<BookingSummary />} />
        <Route path="/coaching-summary" element={<CoachingSummary />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/booking-success" element={<BookingSuccess />} />

        {/* Unified Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

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
          <Route path="reports" element={<FinancialReports />} />
          <Route path="settings" element={<AccountSettings />} />
        </Route>

        {/* Coach Routes */}
        <Route path="/coach" element={<CoachLayout />}>
          <Route index element={<CoachDashboard />} />
          <Route path="students" element={<MyStudents />} />
          <Route path="attendance" element={<AttendanceRecords />} />
          <Route path="remarks" element={<StudentRemarks />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
