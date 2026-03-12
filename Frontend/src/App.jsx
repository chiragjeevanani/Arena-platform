import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

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

// Admin Pages
import AdminDashboard from './modules/admin/pages/Dashboard';

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
        <Route path="/payment" element={<Payment />} />
        <Route path="/booking-success" element={<BookingSuccess />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<div className="text-2xl font-bold">User Management View</div>} />
          <Route path="settings" element={<div className="text-2xl font-bold">Admin Settings View</div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
