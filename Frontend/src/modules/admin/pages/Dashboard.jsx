import { ArrowUpRight, Users, CalendarDays, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Revenue', value: '$12,450', icon: DollarSign, trend: '+12%', color: 'bg-emerald-500' },
    { label: 'Total Bookings', value: '450', icon: CalendarDays, trend: '+5%', color: 'bg-blue-500' },
    { label: 'Active Users', value: '1,200', icon: Users, trend: '+18%', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                <stat.icon size={24} />
              </div>
              <span className="text-emerald-600 text-sm font-semibold flex items-center">
                {stat.trend} <ArrowUpRight size={16} className="ml-1" />
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Recent Bookings</h3>
          <button className="text-sm text-emerald-600 font-semibold hover:underline">View all</button>
        </div>
        <div className="p-6">
          <div className="text-center py-12 text-slate-400">
             No recent bookings found.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
