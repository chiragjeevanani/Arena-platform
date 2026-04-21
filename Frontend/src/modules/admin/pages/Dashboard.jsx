import { useState, useEffect } from 'react';
import { 
  PoundSterling, CalendarDays,
  ChevronLeft, ChevronRight,
  Receipt, WalletCards, Users
} from 'lucide-react';
import { fetchPublicArenas } from '../../../services/arenasApi';
import { normalizeListArena } from '../../../utils/arenaAdapter';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { getAdminReportSummary } from '../../../services/adminReportsApi';
import { listAdminBookings } from '../../../services/adminBookingsApi';
import { listAdminPosSales } from '../../../services/adminOpsApi';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [calendarView, setCalendarView] = useState('Week');
  const [summary, setSummary] = useState(null);
  const [scheduleBookings, setScheduleBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [paymentList, setPaymentList] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isApiConfigured() || !getAuthToken()) {
      setIsLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const arenasRes = await fetchPublicArenas();
        const arenas = (arenasRes.arenas || []).map(normalizeListArena);
        const aid = arenas[0]?.id ? String(arenas[0].id) : '';
        if (cancelled) return;
        if (!aid) {
          setIsLoading(false);
          return;
        }
        const [rep, books, pos] = await Promise.all([
          getAdminReportSummary({ arenaId: aid }),
          listAdminBookings({ arenaId: aid }),
          listAdminPosSales(aid),
        ]);
        if (cancelled) return;
        setSummary(rep);
        const bks = (books.bookings || []).slice(0, 8);
        setRecentBookings(
          bks.map((b) => ({
            date: b.date || '—',
            court: b.courtName || '—',
            time: b.timeSlot || '—',
            player: `User …${String(b.userId || '').slice(-6)}`,
            status: b.status || '—',
            statusBg: b.status === 'confirmed' ? '#d1fae5' : '#f1f5f9',
            statusText: b.status === 'confirmed' ? '#047857' : '#64748b',
          }))
        );
        const sales = (pos.sales || []).slice(0, 8);
        setPaymentList(
          sales.map((s) => ({
            player: `POS ${String(s.id || '').slice(-6)}`,
            amount: `${Number(s.totalAmount || 0).toFixed(2)}`,
            method: 'POS',
            status: 'Paid',
            statusBg: '#d1fae5',
            statusText: '#047857',
          }))
        );
        setScheduleBookings([]);
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);


  return (
    <div className="bg-[#F4F7F6] min-h-full p-4 md:p-6 lg:p-8 font-sans">
      {loadError ? (
        <div className="max-w-[1600px] mx-auto mb-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs font-bold px-4 py-3">
          {loadError}
        </div>
      ) : null}

      {/* Main Grid Layout to match reference image */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6 max-w-[1600px] mx-auto">
        
        {/* Left Column (Main Content) */}
        <div className="xl:col-span-8 flex flex-col gap-5 lg:gap-6">
          
          {/* Bookings Overview Schedule Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:border-[#CE2029]/40">
            <div className="p-3 md:p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-[#36454F]">Bookings Overview</h2>
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
                <button 
                  onClick={() => setCalendarView('Week')}
                  className={`px-6 py-1.5 text-[15px] font-medium rounded-md transition-colors ${calendarView === 'Week' ? 'text-[#243B53] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'text-[#36454F] hover:bg-slate-50'}`}
                >Week</button>
                <button 
                  onClick={() => setCalendarView('Month')}
                  className={`px-6 py-1.5 text-[15px] font-medium rounded-md transition-colors ${calendarView === 'Month' ? 'text-[#CE2029] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'text-[#36454F] hover:bg-slate-50'}`}
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
                        <div><span className="text-[#36454F] font-bold">Mon</span> 22</div>
                        <div><span className="text-[#CE2029] bg-[#CE2029]/10 px-2 py-0.5 rounded font-bold">Tue 23</span></div>
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
                      <div className="bg-[#CE2029]/[0.02]" /> {/* Subtle active day highlight for Tue 23 */}
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
                    <h3 className="text-[#36454F] font-bold text-lg">April 2026</h3>
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
                        const hasEvent = false;
                        const isToday = dayNumber === 23;
                        
                        return (
                          <div key={i} className={`border-r border-b border-slate-100 last:border-r-0 p-2 min-h-[100px] ${isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'}`}>
                            {isCurrentMonth && (
                              <div className="flex flex-col h-full">
                                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-1 ${isToday ? 'bg-[#CE2029] text-white shadow-md' : 'text-[#36454F]'}`}>
                                  {dayNumber}
                                </span>
                                {hasEvent && (
                                  <div className="mt-auto px-2 py-1.5 bg-[#CE2029]/10 text-[#CE2029] rounded-md text-[10px] font-bold truncate border border-[#CE2029]/20">
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:border-[#CE2029]/40">
            <div className="p-3 md:p-4 border-b border-slate-100 flex items-center gap-2">
              <CalendarDays className="text-[#CE2029]" size={20} />
              <h3 className="text-lg font-bold text-[#36454F]">Recent Bookings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#F8F9FA] text-[#36454F] font-semibold border-b border-slate-100">
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
                      <td className="px-6 py-4 font-semibold text-[#36454F]">{bk.player}</td>
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
          <div className="bg-[#F4F7F6] ring-1 ring-slate-200/50 rounded-xl overflow-hidden shadow-sm flex flex-col gap-[2px] transition-all hover:ring-[#CE2029]/40">
            {/* Pending Payments stat */}
            <div className="bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029] shrink-0">
                  <div className="text-xs font-black">OMR</div>
                </div>
                <div>
                  <p className="text-[#36454F] font-bold text-sm mb-0.5">Pending Payments</p>
                  <p className="text-xs text-slate-500 font-medium">Booking revenue (confirmed)</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#113F47] tracking-tight">
                {summary ? Number(summary.bookings?.revenueAmount || 0).toFixed(2) : isLoading ? '…' : '—'}
              </p>
            </div>

            {/* Upcoming Bookings stat */}
            <div className="bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#CE2029]/10 flex items-center justify-center text-[#CE2029] shrink-0">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="text-[#36454F] font-bold text-sm mb-0.5">Bookings</p>
                  <p className="text-xs text-slate-500 font-medium">Confirmed + completed</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#113F47]">
                {summary ? summary.bookings?.confirmedOrCompleted ?? 0 : isLoading ? '…' : '—'}
              </p>
            </div>
          </div>

          {/* Payments Side Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:border-[#CE2029]/40">
            <div className="p-4 flex items-center gap-2 border-b border-slate-100">
              <Receipt className="text-[#CE2029]" size={18} />
              <h3 className="text-lg font-extrabold text-[#36454F]">Payments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#36454F] text-white font-medium">
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
                      <td className="px-4 py-3.5 font-bold text-[#36454F]">{pay.player}</td>
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



        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
