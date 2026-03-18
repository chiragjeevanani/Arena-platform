import { useState, useEffect } from 'react';
import { 
  PoundSterling, CalendarDays,
  ChevronLeft, ChevronRight,
  Receipt, WalletCards, Users
} from 'lucide-react';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [calendarView, setCalendarView] = useState('Week');

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // MOCK DATA specifically for UI display to match the reference image exactly
  const scheduleBookings = [
    { name: 'John Smith', time: '6:00 PM - 7:00 PM', bgColor: '#eb483f', textColor: '#ffffff', colStart: 3, rowStart: 3, rowSpan: 2 }, // Wed 6pm
    { name: 'Rynn Scott', time: '5:00 PM - 6:00 PM', bgColor: '#ff6b6b', textColor: '#ffffff', colStart: 2, rowStart: 2, rowSpan: 2 }, // Tue 5pm
    { name: 'Emily Brown', time: '7:00 PM - 8:00 PM', bgColor: '#ff6b6b', textColor: '#ffffff', colStart: 3, rowStart: 4, rowSpan: 2 }, // Wed 7pm
    { name: 'Mark Davis', time: '4:00 PM - 5:00 PM', bgColor: '#E88E3E', textColor: '#ffffff', colStart: 4, rowStart: 1, rowSpan: 2 }, // Thu 4pm
    { name: 'Emma Clark', time: '8:00 PM - 9:00 PM', bgColor: '#98B84B', textColor: '#ffffff', colStart: 5, rowStart: 5, rowSpan: 2 }, // Fri 8pm
  ];

  const recentBookings = [
    { date: '24 Apr', court: 'Court 1', time: '6:00 PM - 7:00', player: 'John Smith', status: 'Confirmed', statusBg: '#eb483f', statusText: '#ffffff' },
    { date: '24 Apr', court: 'Court 4', time: '6:00 PM - 7:00', player: 'Mark Davis', status: 'Paid', statusBg: '#ff6b6b', statusText: '#ffffff' },
    { date: '24 Apr', court: 'Court 1', time: '7:00 PM - 8:00', player: 'Emily Brown', status: 'Paid', statusBg: '#ff6b6b', statusText: '#ffffff' },
    { date: '26 Apr', court: 'Court 3', time: '6:30 PM - 7:30', player: 'Ryan Wilson', status: 'Pending', statusBg: '#E88E3E', statusText: '#ffffff' },
  ];

  const paymentList = [
    { player: 'Mark Davis', amount: '₹1500', method: 'Card', status: 'Completed', statusBg: '#76A87A', statusText: '#ffffff' },
    { player: 'Emily Brown', amount: '₹2000', method: 'Cash', status: 'Paid', statusBg: '#ff6b6b', statusText: '#ffffff' },
    { player: 'Ryan Wilson', amount: '₹1200', method: 'Online', status: 'Pending', statusBg: '#E88E3E', statusText: '#ffffff' },
  ];

  const playersList = [
    { name: 'John Smith', phone: '07123 436789', lastVisit: '22 Apr 2024' },
    { name: 'Emily Brown', phone: '07954 371987', lastVisit: '20 Apr 2024' },
    { name: 'Ryan Wilson', phone: '07367 930123', lastVisit: '18 Apr 2024' },
  ];

  return (
    <div className="bg-[#F4F7F6] min-h-full p-4 md:p-6 lg:p-8 font-sans">

      {/* Main Grid Layout to match reference image */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6 max-w-[1600px] mx-auto">
        
        {/* Left Column (Main Content) */}
        <div className="xl:col-span-8 flex flex-col gap-5 lg:gap-6">
          
          {/* Bookings Overview Schedule Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:border-[#eb483f]/40">
            <div className="p-3 md:p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-[#1a2b3c]">Bookings Overview</h2>
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
                <button 
                  onClick={() => setCalendarView('Week')}
                  className={`px-6 py-1.5 text-[15px] font-medium rounded-md transition-colors ${calendarView === 'Week' ? 'text-[#243B53] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'text-slate-500 hover:bg-slate-50'}`}
                >Week</button>
                <button 
                  onClick={() => setCalendarView('Month')}
                  className={`px-6 py-1.5 text-[15px] font-medium rounded-md transition-colors ${calendarView === 'Month' ? 'text-[#eb483f] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'text-slate-500 hover:bg-slate-50'}`}
                >Month</button>
              </div>
            </div>

            <div className="p-3 md:p-4 pb-6">
              {calendarView === 'Week' ? (
                <>
                  {/* Calendar Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-6 w-full max-w-2xl mx-auto">
                      <button className="text-slate-400 hover:text-slate-600"><ChevronLeft size={16} /></button>
                      <div className="flex-1 grid grid-cols-5 text-center text-sm font-medium text-slate-500">
                        <div><span className="text-[#1a2b3c] font-bold">Mon</span> 22</div>
                        <div><span className="text-[#eb483f] bg-[#eb483f]/10 px-2 py-0.5 rounded font-bold">Tue 23</span></div>
                        <div>Wed 24</div>
                        <div>Thu 25</div>
                        <div>Fri 26</div>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600"><ChevronRight size={16} /></button>
                    </div>
                  </div>

                  {/* Weekly Calendar Grid */}
                  <div className="border border-slate-100 rounded-lg overflow-hidden relative min-w-[700px] bg-slate-50/30">
                    {/* Horizontal grid lines (Time Slots on Y-axis) */}
                    <div className="grid grid-rows-6 divide-y divide-slate-100 border-b border-slate-100 h-[400px]">
                      {['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'].map((time, idx) => (
                        <div key={idx} className="flex flex-col justify-start pt-2 px-4 text-xs font-bold text-slate-500 border-r border-slate-100 bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
                          {time}
                        </div>
                      ))}
                    </div>
                    
                    {/* Vertical grid lines (Days) overlayed */}
                    <div className="absolute inset-y-0 left-[84px] right-0 grid grid-cols-5 divide-x divide-slate-100 pointer-events-none">
                      <div className="bg-transparent" />
                      <div className="bg-[#eb483f]/[0.02]" /> {/* Subtle active day highlight for Tue 23 */}
                      <div className="bg-transparent" />
                      <div className="bg-transparent" />
                      <div className="bg-transparent" />
                    </div>

                    {/* Booking Blocks overlay */}
                    <div className="absolute inset-y-0 left-[84px] right-0 grid grid-cols-5 grid-rows-12 p-3 gap-x-3 gap-y-1">
                      {scheduleBookings.map((bk, i) => (
                        <div 
                          key={i} 
                          className="rounded-lg p-2.5 shadow-sm font-bold flex flex-col justify-center border border-black/5 hover:scale-[1.02] transition-transform cursor-pointer"
                          style={{ 
                            backgroundColor: bk.bgColor,
                            color: bk.textColor,
                            gridColumnStart: bk.colStart, 
                            gridRowStart: (bk.rowStart * 2) - 1, 
                            gridRowEnd: `span ${bk.rowSpan * 2}` 
                          }}
                        >
                          <p className="text-xs font-semibold leading-tight truncate">{bk.name}</p>
                          <p className="text-[10px] opacity-90 truncate leading-tight mt-1">{bk.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <button className="text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1 text-sm"><ChevronLeft size={16} /> Mar</button>
                    <h3 className="text-[#1a2b3c] font-bold text-lg">April 2026</h3>
                    <button className="text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1 text-sm">May <ChevronRight size={16} /></button>
                  </div>
                  <div className="border border-slate-100 rounded-lg overflow-hidden relative min-w-[700px] bg-white">
                    <div className="grid grid-cols-7 border-b border-slate-100 bg-[#F8F9FA]">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                        <div key={i} className="text-center py-3 text-xs font-bold text-slate-500 border-r border-slate-100 last:border-r-0">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 min-h-[400px]">
                      {Array.from({ length: 35 }).map((_, i) => {
                        const dayNumber = i - 2; // Offset for April 2026 starts on Wed
                        const isCurrentMonth = dayNumber > 0 && dayNumber <= 30;
                        const hasEvent = [5, 12, 18, 23, 24].includes(dayNumber);
                        const isToday = dayNumber === 23;
                        
                        return (
                          <div key={i} className={`border-r border-b border-slate-100 last:border-r-0 p-2 min-h-[100px] ${isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'}`}>
                            {isCurrentMonth && (
                              <div className="flex flex-col h-full">
                                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-1 ${isToday ? 'bg-[#eb483f] text-white shadow-md' : 'text-[#1a2b3c]'}`}>
                                  {dayNumber}
                                </span>
                                {hasEvent && (
                                  <div className="mt-auto px-2 py-1.5 bg-[#eb483f]/10 text-[#eb483f] rounded-md text-[10px] font-bold truncate border border-[#eb483f]/20">
                                    {dayNumber % 3 + 1} Bookings
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recent Bookings Table Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:border-[#eb483f]/40">
            <div className="p-3 md:p-4 border-b border-slate-100 flex items-center gap-2">
              <CalendarDays className="text-[#eb483f]" size={20} />
              <h3 className="text-lg font-bold text-[#1a2b3c]">Recent Bookings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#F8F9FA] text-[#1a2b3c] font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Court</th>
                    <th className="px-6 py-4 flex items-center gap-1">Time <ChevronRight size={12} className="rotate-90"/></th>
                    <th className="px-6 py-4">Player Name</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentBookings.map((bk, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 font-medium">{bk.date}</td>
                      <td className="px-6 py-4 text-slate-700">{bk.court}</td>
                      <td className="px-6 py-4 text-slate-700">{bk.time}</td>
                      <td className="px-6 py-4 font-semibold text-[#1a2b3c]">{bk.player}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded" style={{ backgroundColor: bk.statusBg, color: bk.statusText }}>
                          {bk.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar Content) */}
        <div className="xl:col-span-4 flex flex-col gap-5 lg:gap-6">
          
          {/* Stats Cards container */}
          <div className="bg-[#F4F7F6] ring-1 ring-slate-200/50 rounded-xl overflow-hidden shadow-sm flex flex-col gap-[2px] transition-all hover:ring-[#eb483f]/40">
            {/* Pending Payments stat */}
            <div className="bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f] shrink-0">
                  <div className="text-lg font-bold">₹</div>
                </div>
                <div>
                  <p className="text-[#1a2b3c] font-bold text-sm mb-0.5">Pending Payments</p>
                  <p className="text-xs text-slate-500 font-medium">₹3,250.00</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#113F47] tracking-tight">₹500.00</p>
            </div>

            {/* Upcoming Bookings stat */}
            <div className="bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#eb483f]/10 flex items-center justify-center text-[#eb483f] shrink-0">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="text-[#1a2b3c] font-bold text-sm mb-0.5">Upcoming Bookings</p>
                  <p className="text-xs text-slate-500 font-medium">₹2,750.00</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#113F47]">8</p>
            </div>
          </div>

          {/* Payments Side Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:border-[#eb483f]/40">
            <div className="p-4 flex items-center gap-2 border-b border-slate-100">
              <Receipt className="text-[#eb483f]" size={18} />
              <h3 className="text-lg font-extrabold text-[#1a2b3c]">Payments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#0A1F44] text-white font-medium">
                  <tr>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment M</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-[13px]">
                  {paymentList.map((pay, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#1a2b3c]">{pay.player}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-700">{pay.amount}</td>
                      <td className="px-4 py-3.5 text-slate-600">{pay.method}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded" style={{ backgroundColor: pay.statusBg, color: pay.statusText }}>
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Player Management Side Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-auto transition-all hover:border-[#eb483f]/40">
            <div className="p-4 flex items-center gap-2 border-b border-slate-100">
              <Users className="text-[#eb483f]" size={18} />
              <h3 className="text-lg font-extrabold text-[#1a2b3c]">Player Management</h3>
            </div>
            <div className="flex bg-[#F8F9FA] px-4 py-3 border-b border-slate-100 text-[#1a2b3c] font-bold text-xs justify-between">
              <div className="w-[40%]">Player Name</div>
              <div className="w-[30%]">Phone</div>
              <div className="w-[30%] text-right">Last Visit</div>
            </div>
            <div className="divide-y divide-slate-50 text-[13px]">
              {playersList.map((player, idx) => (
                <div key={idx} className="flex px-4 py-3.5 items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="font-bold text-[#1a2b3c] w-[40%] truncate pr-2">
                    {player.name}
                    <span className="block text-[10px] font-normal text-slate-500 mt-0.5 truncate">{player.name.replace(' ', '.').toLowerCase()}@email.com</span>
                  </div>
                  <div className="text-slate-600 w-[30%] truncate pr-2">{player.phone}</div>
                  <div className="text-slate-600 w-[30%] text-right truncate">{player.lastVisit}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
