import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/users" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <Users size={20} />
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-600">Admin User</span>
            <div className="w-8 h-8 rounded-full bg-slate-200" />
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
