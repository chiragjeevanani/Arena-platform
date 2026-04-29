import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, History, Wallet, Bell, Shield, HelpCircle, LogOut, ChevronRight, Pencil, Star, Settings, ArrowLeft, MapPin, QrCode, Ticket, Zap, Trophy, TrendingUp, ChevronLeft, CreditCard, Crown, CheckCircle2, Activity, FileText, Download, X, Calendar, BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { listMyBookings } from '../../../services/bookingsApi';
import { getMyWallet, listMyMemberships, listMyEnrollments, getMyEnrollmentById } from '../../../services/meApi';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop';
const DEFAULT_COACH_IMG =
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop';

function formatShortDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

function pickNextBooking(bookings) {
  const today = new Date().toISOString().slice(0, 10);
  const active = (bookings || []).filter(
    (b) => ['pending', 'confirmed'].includes(b.status) && b.date >= today
  );
  active.sort(
    (a, b) =>
      a.date.localeCompare(b.date) || String(a.timeSlot || '').localeCompare(String(b.timeSlot || ''))
  );
  return active[0] || null;
}

const NO_MEMBERSHIP = {
  status: 'none',
  planId: null,
  planName: '',
  category: '',
  discountPercent: 0,
  startDate: '',
  expiryDate: '',
  benefits: [],
};

const Profile = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user, logout } = useAuth();

  const [nextMatch, setNextMatch] = useState(null);
  const [activeCoaching, setActiveCoaching] = useState(null);
  const [membership, setMembership] = useState(NO_MEMBERSHIP);
  const [favoriteArenas] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [stats, setStats] = useState({ arenasVisited: 0, bookingsTotal: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isApiConfigured() || !getAuthToken()) return;
      try {
        const [bookingsRes, walletRes, memRes, enrRes] = await Promise.all([
          listMyBookings(),
          getMyWallet(),
          listMyMemberships(),
          listMyEnrollments(),
        ]);
        if (cancelled) return;
        const bookings = bookingsRes.bookings || [];
        const nb = pickNextBooking(bookings);
        setNextMatch(
          nb
            ? {
                arenaName: nb.arenaName || 'Arena',
                courtName: nb.courtName || 'Court',
                arenaImage: DEFAULT_AVATAR,
                timeLabel: nb.timeSlot || '',
                dateLabel: nb.date || '',
              }
            : null
        );
        setWalletBalance(Number(walletRes.wallet?.balance ?? 0));
        const arenaIds = new Set(bookings.map((b) => b.arenaId).filter(Boolean));
        setStats({ arenasVisited: arenaIds.size, bookingsTotal: bookings.length });

        const activeMem = (memRes.memberships || []).find((m) => m.status === 'active');
        if (activeMem) {
          setMembership({
            status: 'active',
            planId: activeMem.membershipPlanId,
            planName: activeMem.planName || 'Membership',
            category: 'standard',
            discountPercent: activeMem.discountPercent ?? 0,
            startDate: formatShortDate(activeMem.startsAt),
            expiryDate: formatShortDate(activeMem.expiresAt),
            benefits: [],
          });
        } else {
          const expired = (memRes.memberships || []).find((m) => m.status === 'expired');
          if (expired) {
            setMembership({
              status: 'expired',
              planId: expired.membershipPlanId,
              planName: expired.planName || 'Membership',
              category: 'standard',
              discountPercent: expired.discountPercent ?? 0,
              startDate: formatShortDate(expired.startsAt),
              expiryDate: formatShortDate(expired.expiresAt),
              benefits: [],
            });
          } else {
            setMembership(NO_MEMBERSHIP);
          }
        }

        const enr = (enrRes.enrollments || []).find((e) =>
          ['pending', 'confirmed'].includes(e.status)
        );
        if (enr) {
          setActiveCoaching({
            id: enr.id,
            coachName: enr.batchTitle || 'Coaching batch',
            image: DEFAULT_COACH_IMG,
          });

          // Fetch detailed metrics for the active enrollment
          try {
            const detailRes = await getMyEnrollmentById(enr.id);
            if (detailRes.enrollment?.metrics?.length > 0) {
              const rawMetrics = detailRes.enrollment.metrics;
              
              // Helper to group 29 metrics into readable categories
              const categorize = (items) => {
                const groups = {
                  'Technical': [],
                  'Physical': [],
                  'Tactical': [],
                  'Mental': [],
                  'Discipline': []
                };

                items.forEach(m => {
                  const n = m.name.toLowerCase();
                  if (n.includes('attendance')) groups['Discipline'].push(m);
                  else if (n.includes('speed') || n.includes('strength') || n.includes('movement') || n.includes('fitness')) groups['Physical'].push(m);
                  else if (n.includes('strategy') || n.includes('positioning') || n.includes('gameplay')) groups['Tactical'].push(m);
                  else if (n.includes('mental') || n.includes('focus') || n.includes('discipline')) groups['Mental'].push(m);
                  else groups['Technical'].push(m);
                });

                return Object.entries(groups)
                  .filter(([_, ms]) => ms.length > 0)
                  .map(([name, ms]) => ({
                    name,
                    score: Math.round(ms.reduce((acc, i) => acc + i.score, 0) / ms.length),
                    metrics: ms
                  }));
              };

              const categories = categorize(rawMetrics);
              const overall = Math.round(rawMetrics.reduce((acc, m) => acc + (m.score || 0), 0) / rawMetrics.length * 10);
              
              setPerformanceData({
                weekly: { overall, trend: '+2.4%', categories },
                monthly: { overall, trend: '+5.1%', categories },
              });
            }
          } catch (err) {
            console.error('Failed to fetch coaching metrics:', err);
          }
        } else {
          setActiveCoaching(null);
        }
      } catch {
        /* keep fallbacks */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [performanceMode, setPerformanceMode] = useState('weekly');
  const [showReportCard, setShowReportCard] = useState(false);
  const [performanceData, setPerformanceData] = useState({
    weekly: { overall: 0, trend: '—', categories: [] },
    monthly: { overall: 0, trend: '—', categories: [] },
  });

  const displayName = user?.name?.trim() || 'Your profile';
  const roleLabel = user?.role ? String(user.role).replace(/_/g, ' ') : 'Member';

  const menuItems = [
    { icon: History, label: 'Booking History', path: '/bookings' },
    { icon: Calendar, label: 'My Attendance', path: '/profile/attendance' },
    { icon: Wallet, label: 'My Wallet Tracker', path: '/profile/wallet' },
    { icon: Crown, label: 'My Membership Plan', path: '/membership' },
    { icon: Shield, label: 'Privacy & Security', path: '/profile/privacy' },
    { icon: HelpCircle, label: 'Help & Support', path: '/profile/help' },
  ];

  return (
    <div className={`min-h-screen pb-24 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0a0a0c]' : 'bg-[#fafafa]'}`}>
      <div id="profile-page-content">
        {/* Background Decorative Glows */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#CE2029]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className={`absolute top-[40%] -left-32 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none ${isDark ? 'bg-blue-500/10' : 'bg-blue-400/10'}`} />

        {/* HEADER SECTION (Red Bar matching other global layouts) */}
        <div className={`px-4 md:px-6 py-6 pb-8 rounded-b-[2rem] relative overflow-hidden transition-all duration-500 z-[100] mb-6 shadow-xl bg-[#CE2029]`}>
          {/* Subtle dynamic pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[size:16px_16px]" />
          
          <div className="flex items-center justify-between relative z-10 w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all bg-white/5 border-white/10 text-white hover:bg-white/10 shadow-sm"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative group cursor-pointer" onClick={() => navigate('/profile/edit')}>
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 p-0.5 shadow-md border-white/20">
                    <img
                      src={user?.avatar || localStorage.getItem('userProfileImage') || DEFAULT_AVATAR}
                      alt="User"
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-black font-display leading-tight tracking-tight text-white shadow-sm">
                    {displayName}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{roleLabel}</span>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => navigate('/profile/edit')} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white shadow-sm">
              <Pencil size={18} />
            </button>
          </div>
        </div>

        <div className="px-4 md:px-6 max-w-5xl mx-auto relative z-20">
          
          {/* HERO DASHBOARD GRID */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* 1. Next Match Widget */}
            <div className="md:col-span-8 group">
              <h3 className={`text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Next Up</h3>
              {nextMatch ? (
                <motion.div 
                  whileHover={{ y: -2 }}
                  className={`relative rounded-2xl overflow-hidden border p-4 shadow-sm transition-all hover:shadow-md ${
                    isDark 
                      ? 'bg-[#12141a] border-white/5 group-hover:border-white/10' 
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#CE2029]/10 to-transparent rounded-bl-full pointer-events-none" />
                  
                  <div className="flex flex-row items-center justify-between gap-4 relative z-10 w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-slate-200/20">
                        <img src={nextMatch.arenaImage} alt="Arena" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#CE2029]/10 text-[#CE2029] mb-1.5 w-max">
                          <Zap size={10} className="fill-[#CE2029]" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">
                            {nextMatch.dateLabel} · {nextMatch.timeLabel}
                          </span>
                        </div>
                        <h4 className={`text-sm md:text-base font-bold leading-tight line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {nextMatch.arenaName}
                        </h4>
                        <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <MapPin size={10} /> {nextMatch.courtName}
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      <button className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#CE2029] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all hover:bg-[#d83f36]">
                        <Ticket size={14} /> Ticket
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className={`rounded-2xl border border-dashed flex items-center justify-center p-6 text-center ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#CE2029]/10 text-[#CE2029] flex items-center justify-center">
                      <Ticket size={16} />
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No upcoming matches</p>
                      <button onClick={() => navigate('/arenas')} className="text-[#CE2029] text-[10px] font-bold uppercase tracking-wider hover:underline">Book a Court</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Wallet & Finance Snapshot */}
            <div className="md:col-span-4 group">
              <h3 className={`text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>My Wallet</h3>
              <div className={`h-[90px] md:h-[102px] rounded-2xl border p-4 flex justify-between relative overflow-hidden transition-all shadow-sm ${
                isDark 
                  ? 'bg-gradient-to-br from-[#16181f] to-[#12141a] border-white/5 group-hover:border-white/10' 
                  : 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-800' // Keep it dark and premium even on light mode
              }`}>
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[size:12px_12px]" />
                
                <div className="relative z-10 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-1 text-white/60">
                    <Wallet size={12} />
                    <p className="text-[9px] uppercase tracking-wider font-bold">Balance</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-white/80 text-sm font-bold">OMR </span>
                    <span className="text-white text-2xl md:text-3xl font-black tracking-tight">
                      {walletBalance.toFixed(3)}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-end gap-2 justify-center">
                  <button onClick={() => navigate('/profile/wallet')} className="px-3 py-1.5 rounded-lg bg-[#CE2029] text-white text-[10px] md:text-xs font-bold tracking-wide hover:bg-[#d83f36] transition-colors shadow-sm w-full text-center">
                    Top Up
                  </button>
                  <button onClick={() => navigate('/bookings')} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[10px] md:text-xs font-bold tracking-wide hover:bg-white/20 transition-colors shadow-sm w-full text-center backdrop-blur-md border border-white/5">
                    History
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECONDARY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">
            
            {/* 3. Favorite Arenas (Compact) */}
            <div className="md:col-span-7">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Book It Again</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
                {favoriteArenas.length === 0 && (
                  <p className={`text-xs py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Book an arena to see quick links here.
                  </p>
                )}
                {favoriteArenas.map((arena) => (
                  <div key={arena.id} onClick={() => navigate(`/arenas/${arena.id}`)} className={`min-w-[190px] md:min-w-[220px] p-2.5 rounded-2xl border cursor-pointer group transition-all snap-start shadow-sm hover:shadow-md ${
                    isDark ? 'bg-[#12141a] border-white/5 hover:border-[#CE2029]/30' : 'bg-white border-slate-100 hover:border-[#CE2029]/40'
                  }`}>
                    <div className="flex gap-2.5 items-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <img src={arena.image} alt={arena.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className={`text-xs font-bold tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{arena.name}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={9} className="text-[#CE2029] fill-[#CE2029]" />
                          <span className={`text-[9px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>{arena.rating} • {arena.distance}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Active Coaching Combined */}
            <div className="md:col-span-5">
               <h3 className={`text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>My Coaching</h3>
               {activeCoaching ? (
                 <div 
                   onClick={() => navigate(`/bookings/${activeCoaching.id}`)}
                   className={`p-3.5 md:p-4 rounded-2xl border shadow-sm flex items-center justify-between transition-all cursor-pointer group ${
                   isDark ? 'bg-[#12141a] border-white/5 hover:border-[#CE2029]/20 hover:-translate-y-1' : 'bg-white border-slate-100 hover:border-[#CE2029]/30 hover:-translate-y-1'
                 }`}>
                   <div className="flex gap-3 items-center w-full">
                     <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 flex-shrink-0">
                       <img src={activeCoaching.image} alt="Coach" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                       <div className="flex items-center justify-between">
                         <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{activeCoaching.coachName}</h4>
                         <ChevronRight size={14} className="text-slate-400 group-hover:text-[#CE2029] transition-colors" />
                       </div>
                       <p className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Program</p>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className={`h-[68px] md:h-[74px] rounded-2xl border border-dashed flex items-center justify-center p-4 text-center ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                   <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No active coaching</span>
                 </div>
               )}
            </div>
          </div>

          {/* MY MEMBERSHIP SECTION */}
          <div className="mt-6">
            <h3 className={`text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>My Membership</h3>
            {membership.status === 'none' ? (
              <div
                onClick={() => navigate('/membership')}
                className={`cursor-pointer rounded-2xl border border-dashed p-4 flex items-center gap-3 transition-all hover:border-[#CE2029]/40 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50 hover:bg-[#CE2029]/5'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#CE2029]/10 flex items-center justify-center shrink-0">
                  <Crown size={18} className="text-[#CE2029]" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>No Active Membership</p>
                  <p className="text-[10px] text-[#CE2029] font-black uppercase tracking-widest mt-0.5">View Plans →</p>
                </div>
              </div>
            ) : (
              <motion.div
                whileHover={{ y: -1 }}
                className={`rounded-2xl border p-4 shadow-sm relative overflow-hidden transition-all ${
                  membership.category === 'premium'
                    ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200'
                    : isDark ? 'bg-[#12141a] border-white/5' : 'bg-white border-slate-100'
                }`}
              >
                {/* Expired overlay */}
                {membership.status === 'expired' && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                    <div className="text-center">
                      <p className="text-xs font-black text-red-600 uppercase tracking-widest">Membership Expired</p>
                      <button onClick={() => navigate('/membership')} className="mt-2 px-4 py-1.5 rounded-xl bg-[#CE2029] text-white text-[10px] font-black uppercase tracking-widest">
                        Renew Now
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      membership.category === 'premium' ? 'bg-amber-100' : 'bg-indigo-50'
                    }`}>
                      <Crown size={18} className={membership.category === 'premium' ? 'text-amber-500' : 'text-indigo-500'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{membership.planName}</h4>
                        <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                          membership.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>{membership.status}</span>
                      </div>
                      <p className={`text-[10px] font-bold mt-0.5 ${
                        membership.category === 'premium' ? 'text-amber-600' : 'text-indigo-600'
                      } uppercase tracking-widest`}>
                        {membership.category === 'premium' ? 'Premium' : membership.category === 'individual' ? 'Individual' : 'Standard'} · {membership.discountPercent}% off bookings
                      </p>
                      <div className={`flex items-center gap-2 mt-1.5 text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span>{membership.startDate} → {membership.expiryDate}</span>
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 size={16} className={membership.status === 'active' ? 'text-green-500' : 'text-red-400'} />
                </div>

                {/* Benefits preview */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {membership.benefits.slice(0, 2).map((b, i) => (
                    <span key={i} className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                      membership.category === 'premium' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                    }`}>{b}</span>
                  ))}
                  {membership.benefits.length > 2 && (
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>+{membership.benefits.length - 2} more</span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => navigate('/membership')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                    isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>Upgrade Plan</button>
                  <button onClick={() => navigate('/membership')} className="flex-1 py-2 rounded-xl bg-[#CE2029] text-white text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-[#d83f36] transition-all">
                    Renew
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* PERFORMANCE ANALYTICS SECTION */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Performance Analytics</h3>
              <div className={`flex p-0.5 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                {['weekly', 'monthly'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPerformanceMode(mode)}
                    className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${
                      performanceMode === mode 
                        ? 'bg-[#CE2029] text-white shadow-sm' 
                        : `text-slate-500 hover:text-${isDark ? 'white' : 'slate-900'}`
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* 1. Overall Score Card - COMPACTED */}
              <div className={`md:col-span-4 p-4 rounded-2xl border relative overflow-hidden flex flex-col justify-between ${
                isDark ? 'bg-[#12141a] border-white/5' : 'bg-white border-slate-100 shadow-sm'
              }`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#CE2029]/10 rounded-bl-full pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Activity size={10} className="text-[#CE2029]" />
                    <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Overall Mastery</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <h4 className={`text-3xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {performanceData[performanceMode].categories.length
                        ? `${performanceData[performanceMode].overall}%`
                        : '—'}
                    </h4>
                    {performanceData[performanceMode].categories.length > 0 && (
                      <div className="flex items-center gap-0.5 text-emerald-500 font-bold text-[10px]">
                        <TrendingUp size={10} />
                        <span>{performanceData[performanceMode].trend}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setShowReportCard(true)}
                  disabled={!performanceData[performanceMode].categories.length}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-[#CE2029] hover:text-white transition-all group disabled:opacity-40 disabled:pointer-events-none"
                >
                  <FileText size={12} className="group-hover:scale-110 transition-transform" /> Full Report
                </button>
              </div>

              {/* 2. Detailed Performance Matrix - COMPACTED */}
              <div className={`md:col-span-8 p-4 rounded-2xl border ${
                isDark ? 'bg-[#12141a] border-white/5' : 'bg-white border-slate-100 shadow-sm'
              }`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {performanceData[performanceMode].categories.length === 0 ? (
                    <p className={`text-xs col-span-full py-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Coaching performance scores will appear here when your academy syncs assessments.
                    </p>
                  ) : (
                    performanceData[performanceMode].categories.map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{cat.name}</span>
                          <span className="text-[9px] font-black text-[#CE2029]">{cat.score}/10</span>
                        </div>
                        <div className={`h-1 w-full rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.score * 10}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                            className="h-full bg-[#CE2029] rounded-full"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PLAYER STATS & SETTINGS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">
            
            {/* Quick Stats */}
            <div className="md:col-span-4 flex flex-row md:flex-col gap-3">
              <div className={`flex-1 p-3.5 md:p-4 rounded-2xl border shadow-sm flex items-center justify-between ${isDark ? 'bg-[#12141a] border-white/5' : 'bg-white border-slate-100'}`}>
                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-widest mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Arenas visited</p>
                  <h4 className={`font-black font-display text-xl ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {stats.arenasVisited || '—'}
                  </h4>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Trophy size={16} />
                </div>
              </div>
              <div className={`flex-1 p-3.5 md:p-4 rounded-2xl border shadow-sm flex items-center justify-between ${isDark ? 'bg-[#12141a] border-white/5' : 'bg-white border-slate-100'}`}>
                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-widest mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bookings</p>
                  <h4 className={`font-black font-display text-xl ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {stats.bookingsTotal || '—'}
                  </h4>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
              </div>
            </div>

            {/* Settings / Navigation List */}
            <div className="md:col-span-8 flex flex-col h-full justify-between">
              <div className={`rounded-2xl border shadow-sm overflow-hidden flex-1 ${isDark ? 'bg-[#12141a] border-white/5' : 'bg-white border-slate-100'}`}>
                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center justify-between px-4 py-3 border-b last:border-0 transition-colors group ${
                      isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isDark ? 'bg-white/5 text-slate-400 group-hover:text-[#CE2029] group-hover:bg-[#CE2029]/10' : 'bg-slate-100 text-slate-500 group-hover:text-[#CE2029] group-hover:bg-[#CE2029]/10'
                      }`}>
                        <item.icon size={16} />
                      </div>
                      <span className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item.label}</span>
                    </div>
                    <ChevronRight size={14} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
                  </button>
                ))}
              </div>

              <button 
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                className={`w-full mt-3 px-4 py-3 rounded-2xl border flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-widest shadow-sm ${
                  isDark 
                    ? 'bg-red-500/5 border-red-500/10 text-red-500 hover:bg-red-500/10' 
                    : 'bg-white border-red-100 text-red-500 hover:bg-red-50'
                }`}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OVERALL REPORT CARD MODAL */}
      <ReportCardModal 
        isOpen={showReportCard} 
        onClose={() => setShowReportCard(false)} 
        isDark={isDark} 
        data={performanceData[performanceMode]}
        mode={performanceMode}
        user={user}
        activeCoaching={activeCoaching}
        membership={membership}
      />
    </div>
  );
};

// REPORT CARD MODAL COMPONENT
const ReportCardModal = ({ isOpen, onClose, isDark, data, mode, user, activeCoaching, membership }) => {
  if (!isOpen) return null;

  const categories = data?.categories || [];
  if (!categories.length) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 backdrop-blur-md bg-black/70"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark ? 'bg-[#0f1115] border-white/10 text-white' : 'bg-white border-slate-200 text-[#36454F]'
            }`}
          >
            <h3 className="text-lg font-black mb-2">No report yet</h3>
            <p className="text-sm opacity-80 mb-6">
              Performance breakdowns will be available after your coach or system publishes assessment data.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#CE2029] text-white text-xs font-black uppercase tracking-widest"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const chartData = categories.map(cat => ({
    subject: cat.name,
    A: cat.score,
  }));

  const handleDownload = () => window.print();

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 backdrop-blur-md bg-black/70"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }}
          className={`print-container relative w-full max-w-3xl max-h-[85vh] rounded-none shadow-2xl overflow-y-auto flex flex-col pb-32 ${
            isDark ? 'bg-[#0f1115] border border-white/10' : 'bg-white border border-slate-200'
          }`}
        >
          <div className="print-content flex-1 flex flex-col">
            {/* OFFICIAL PRINT HEADER (Specifically isolated for print) */}
            <div className="print-header-visible border-b-4 border-[#CE2029] pb-6 mb-8 w-full">
              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-slate-900 leading-none">
                  Arena CRM
                </h1>
              </div>
              <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-[#CE2029]">
                  PLAYER REPORT
                </h2>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  DATE- {new Date().getDate()}-{new Date().toLocaleString('en-US', { month: 'long' })}-{new Date().getFullYear()}
                </div>
              </div>
            </div>

            {/* Compact Header (Screen view Only versions usually hide on print if we have a print header, but user might want both if they are different styles) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 relative z-10 bg-gradient-to-r from-[#CE2029]/10 to-transparent print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#CE2029]/10 flex items-center justify-center">
                  <Trophy size={14} className="text-[#CE2029]" />
                </div>
                <div>
                  <h2 className={`text-lg font-black italic uppercase tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Performance <span className="text-[#CE2029]">Snapshot</span>
                  </h2>
                  <p className={`text-[8px] font-black uppercase tracking-widest opacity-50 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {mode} assessment
                  </p>
                </div>
              </div>
              <button onClick={onClose} className={`no-print w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isDark ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}>
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-wrap gap-x-12 gap-y-4 mb-8 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-6 print:flex">
              <div className="flex flex-col gap-1">
                <span className="opacity-50">Student Name</span>
                <span className="text-slate-900 text-[11px] font-black tracking-tight">{user?.name || '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="opacity-50">Student ID</span>
                <span className="text-slate-900 text-[11px] font-black tracking-tight">{user?._id?.slice(-8).toUpperCase() || user?.id?.slice(-8).toUpperCase() || '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="opacity-50">Batch Name</span>
                <span className="text-slate-900 text-[11px] font-black tracking-tight">{activeCoaching?.coachName || '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="opacity-50">Membership</span>
                <span className="text-slate-900 text-[11px] font-black tracking-tight">{membership?.planName || 'None'}</span>
              </div>
            </div>

            <div className="flex-1 custom-scrollbar">
              {/* Top Grid: Chart & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b border-white/5">
                {/* Radar Chart Section */}
                <div className="md:col-span-4 p-4 flex items-center justify-center bg-white/[0.01]">
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                          <PolarGrid stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9, fontWeight: '900' }} />
                          <Radar name="Player" dataKey="A" stroke="#CE2029" fill="#CE2029" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 border-l border-white/5">
                  {[
                    { label: 'Overall Mastery', value: `${data.overall}%`, trend: '—', icon: Activity, color: '#CE2029' },
                    { label: 'Attendance Rate', value: '—', trend: '—', icon: CheckCircle2, color: '#22c55e' },
                    { label: 'Training Load', value: '—', trend: '—', icon: Zap, color: '#f59e0b' },
                  ].map((stat, i) => (
                    <div key={i} className={`p-4 border-r border-b border-white/5 flex flex-col justify-center`}>
                      <p className="text-[7px] font-black uppercase tracking-widest text-slate-500 mb-1 leading-none">{stat.label}</p>
                      <div className="flex items-baseline gap-1.5">
                        <p className={`text-xl font-black italic ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                        <span className="text-[8px] font-bold text-emerald-500">{stat.trend}</span>
                      </div>
                    </div>
                  ))}
                  <div className="col-span-full sm:col-span-1 p-4 flex items-center gap-3 bg-gradient-to-br from-[#CE2029]/5 to-transparent">
                    <div className="w-10 h-10 rounded-xl bg-[#CE2029] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#CE2029]/20">
                      <Star size={18} fill="white" />
                    </div>
                    <div>
                      <p className="text-[7px] font-black uppercase tracking-widest text-[#CE2029]">Ranking</p>
                      <p className="text-[10px] font-black uppercase italic leading-none text-slate-900 dark:text-white">—</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown - More Compact */}
              <div className="p-6 pt-5">
                 <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-x-12 gap-y-8">
                    {data.categories.map((cat, idx) => (
                      <div key={idx} className="group page-break-inside-avoid">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-[#CE2029]`}>{cat.name}</span>
                          <span className={`text-[11px] font-black ${isDark ? 'text-white' : 'text-[#CE2029]'}`}>{cat.score}.0</span>
                        </div>
                        <div className="space-y-3">
                          {cat.metrics && cat.metrics.map((m, midx) => (
                            <div key={midx}>
                              <div className="flex justify-between items-center text-[9px] font-bold mb-1 ml-0.5">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{m.name}</span>
                                <span className={isDark ? 'text-white' : 'text-slate-900'}>{m.score}</span>
                              </div>
                              <div className={`h-1.5 w-full rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${m.score * 10}%` }} transition={{ delay: 0.3, duration: 0.6 }} className="h-full bg-[#CE2029] rounded-full shadow-[0_0_8px_rgba(206,32,41,0.2)]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Compact Action Bar */}
            <div className="no-print px-6 py-6 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row gap-3 relative z-20">
               <button 
                 onClick={() => {
                   const btn = document.getElementById('download-btn-text');
                   const originalText = btn.innerText;
                   const originalTitle = document.title;
                   btn.innerText = 'GENERATING PDF...';
                   setTimeout(() => {
                     btn.innerText = 'DOWNLOAD READY';
                     setTimeout(() => {
                       document.title = "AMM sports arena - badminton court booking";
                       window.print();
                       document.title = originalTitle;
                       btn.innerText = originalText;
                     }, 500); // 500ms delay as requested
                   }, 1500);
                 }}
                 className="flex-[2] bg-gradient-to-r from-[#CE2029] to-[#d83f36] text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-lg shadow-[#CE2029]/25 hover:shadow-[#CE2029]/40 active:scale-95 transition-all outline-none"
               >
                 <Download size={16} className="animate-bounce" /> 
                 <span id="download-btn-text">Download Performance PDF</span>
               </button>
               
               <button 
                 onClick={onClose} 
                 className={`flex-1 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] border transition-all active:scale-95 ${
                   isDark 
                     ? 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white' 
                     : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                 }`}
               >
                 Dismiss
               </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Profile;
