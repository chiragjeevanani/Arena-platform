import { Outlet, Link } from 'react-router-dom';

const WebLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Badminton Arena</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Home</Link>
            <Link to="/courts" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Courts</Link>
            <Link to="/about" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">About</Link>
            <Link to="/contact" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-emerald-600 font-semibold px-4 py-2 hover:bg-emerald-50 rounded-lg transition-colors">
              Login
            </Link>
            <Link to="/" className="bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95">
              Book Now
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400">© 2026 Badminton Arena. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WebLayout;
