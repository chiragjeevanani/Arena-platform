import { Outlet, NavLink } from 'react-router-dom';
import { Home, Sports, EventNote, School, Person } from '@mui/icons-material';

const UserLayout = () => {
  const navItems = [
    { path: '/', label: 'Home', icon: <Home /> },
    { path: '/arenas', label: 'Arenas', icon: <Sports /> },
    { path: '/bookings', label: 'Bookings', icon: <EventNote /> },
    { path: '/coaching', label: 'Coaching', icon: <School /> },
    { path: '/profile', label: 'Profile', icon: <Person /> }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white md:max-w-[450px] md:mx-auto md:shadow-2xl md:ring-1 md:ring-slate-100 relative overflow-x-hidden">
      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile App feel) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-4 py-3 pb-8 flex justify-around items-center z-[100] md:absolute shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center space-y-1.5 transition-all duration-300
              ${isActive ? 'text-[#03396C] scale-110' : 'text-slate-400 opacity-60 hover:opacity-100'}
            `}
          >
            <div className={`p-1 rounded-xl transition-all ${isActive => isActive ? 'bg-blue-50' : ''}`}>
               {item.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default UserLayout;
