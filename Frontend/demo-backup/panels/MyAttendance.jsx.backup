import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, BarChart3, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const MyAttendance = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [attendanceTab, setAttendanceTab] = useState('daily'); // 'daily' | 'monthly' | 'yearly'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthName = currentMonth.toLocaleString('default', { month: 'long' }).toUpperCase();
  const year = currentMonth.getFullYear();

  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
    setExpandedWeek(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
    setExpandedWeek(null);
  };

  const goToMonth = (monthIndex, year) => {
    setCurrentMonth(new Date(year, monthIndex, 1));
    setExpandedWeek(null);
    setShowCalendarView(false);
  };

  // Generate calendar days for the current month
  const getCalendarDays = () => {
    const daysInMonth = new Date(year, currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, currentMonth.getMonth(), 1).getDay();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', date: null, status: 'empty' });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, currentMonth.getMonth(), day);
      const dayOfWeek = date.getDay();
      // Mock attendance data - randomly assign present/absent
      const isPresent = Math.random() > 0.2;
      days.push({
        day: day,
        date: date,
        status: isPresent ? 'present' : 'absent'
      });
    }

    return days;
  };

  const getYearlyData = () => {
    const allMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const currentYearValue = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();
    
    let monthsToShow = 12;
    if (selectedYear > currentYearValue) {
      monthsToShow = 0;
    } else if (selectedYear === currentYearValue) {
      monthsToShow = currentMonthIndex + 1;
    }
    
    return allMonths.slice(0, monthsToShow).map((month, idx) => {
      const seed = (selectedYear % 100) + idx;
      const rate = Math.floor(((seed * 7) % 25) + 75); 
      return { month, rate };
    });
  };

  const yearlyData = getYearlyData();
  const yearlyAverage = yearlyData.length > 0 
    ? (yearlyData.reduce((acc, curr) => acc + curr.rate, 0) / yearlyData.length).toFixed(1) 
    : '0';
  const bestMonthObj = yearlyData.length > 0 
    ? yearlyData.reduce((prev, current) => (prev.rate > current.rate) ? prev : current)
    : { rate: 0 };
  const totalSessionsCount = yearlyData.length * 24;


  // Mock weekly attendance data
  const weeklyAttendanceData = [
    {
      week: 'Week 1',
      present: 5,
      total: 7,
      days: [
        { day: 'Sun', status: 'absent' },
        { day: 'Mon', status: 'present' },
        { day: 'Tue', status: 'absent' },
        { day: 'Wed', status: 'present' },
        { day: 'Thu', status: 'present' },
        { day: 'Fri', status: 'present' },
        { day: 'Sat', status: 'present' },
      ]
    },
    {
      week: 'Week 2',
      present: 6,
      total: 7,
      days: [
        { day: 'Sun', status: 'present' },
        { day: 'Mon', status: 'present' },
        { day: 'Tue', status: 'present' },
        { day: 'Wed', status: 'present' },
        { day: 'Thu', status: 'present' },
        { day: 'Fri', status: 'present' },
        { day: 'Sat', status: 'absent' },
      ]
    },
    {
      week: 'Week 3',
      present: 4,
      total: 7,
      days: [
        { day: 'Sun', status: 'absent' },
        { day: 'Mon', status: 'present' },
        { day: 'Tue', status: 'absent' },
        { day: 'Wed', status: 'absent' },
        { day: 'Thu', status: 'present' },
        { day: 'Fri', status: 'present' },
        { day: 'Sat', status: 'absent' },
      ]
    },
    {
      week: 'Week 4',
      present: 5,
      total: 7,
      days: [
        { day: 'Sun', status: 'present' },
        { day: 'Mon', status: 'present' },
        { day: 'Tue', status: 'present' },
        { day: 'Wed', status: 'present' },
        { day: 'Thu', status: 'absent' },
        { day: 'Fri', status: 'present' },
        { day: 'Sat', status: 'absent' },
      ]
    },
  ];

  return (
    <div className={`min-h-screen pb-24 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0a0a0c]' : 'bg-[#fafafa]'}`}>
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#CE2029]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className={`absolute top-[40%] -left-32 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none ${isDark ? 'bg-blue-500/10' : 'bg-blue-400/10'}`} />

      {/* HEADER SECTION */}
      <div className={`px-4 md:px-6 py-6 pb-8 rounded-b-[2rem] relative overflow-hidden transition-all duration-500 z-[100] mb-6 shadow-xl bg-[#CE2029]`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[size:16px_16px]" />
        
        <div className="flex items-center gap-3 relative z-10 max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all bg-white/5 border-white/10 text-white hover:bg-white/10 shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black font-display leading-tight tracking-tight text-white shadow-sm">
              My Attendance
            </h1>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5">Track your presence & consistency</p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 max-w-5xl mx-auto relative z-20">
        
        {/* Attendance Report Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 p-1 rounded-2xl border bg-white/5 backdrop-blur-md border-white/10">
            {[
              { id: 'daily', label: 'Daily', icon: Calendar },
              { id: 'monthly', label: 'Monthly', icon: BarChart3 },
              { id: 'yearly', label: 'Yearly', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAttendanceTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                  attendanceTab === tab.id
                    ? 'bg-[#CE2029] text-white shadow-md'
                    : 'text-slate-600 hover:text-[#CE2029] hover:bg-white/5'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report Content */}
        <div className={`rounded-3xl border shadow-sm overflow-hidden ${isDark ? 'bg-[#12141a] border-white/5' : 'bg-white border-slate-100'}`}>
          {attendanceTab === 'daily' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-bold uppercase tracking-wider text-slate-400">This Week</h5>
                <div className="flex gap-1">
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                    <ChevronLeft size={16} className={isDark ? 'text-white/40' : 'text-slate-400'} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                    <ChevronRight size={16} className={isDark ? 'text-white/40' : 'text-slate-400'} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                  <div key={day} className="text-center">
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{day}</p>
                    <div className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold uppercase tracking-wider transition-all ${
                      [0, 2, 3, 4, 6].includes(idx) 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {[0, 2, 3, 4, 6].includes(idx) ? '✓' : '✗'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Weekly Rate</p>
                  <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>71.4%</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Present</p>
                    <p className="text-lg font-black text-green-500">5</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Absent</p>
                    <p className="text-lg font-black text-red-500">2</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {attendanceTab === 'monthly' && (
            <div className="p-6 space-y-4">
              {/* Header with month navigation and view toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowCalendarView(!showCalendarView)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      showCalendarView 
                        ? 'bg-[#CE2029] text-white' 
                        : isDark ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {showCalendarView ? 'Week View' : 'Calendar View'}
                  </button>
                  <h5 className="text-sm font-bold uppercase tracking-wider text-slate-400">{monthName}</h5>
                </div>
                <div className="flex items-center gap-3">
                  {/* Year Selector */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newYear = selectedYear - 1;
                        setSelectedYear(newYear);
                        setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
                      }}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      <ChevronLeft size={14} className={isDark ? 'text-white/40' : 'text-slate-400'} />
                    </button>
                    <span className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-700'}`}>{selectedYear}</span>
                    <button
                      onClick={() => {
                        const newYear = selectedYear + 1;
                        setSelectedYear(newYear);
                        setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
                      }}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      <ChevronRight size={14} className={isDark ? 'text-white/40' : 'text-slate-400'} />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={goToPreviousMonth}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      <ChevronLeft size={16} className={isDark ? 'text-white/40' : 'text-slate-400'} />
                    </button>
                    <button 
                      onClick={() => setShowCalendarView(true)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                      title="Select Month"
                    >
                      <Calendar size={16} className={isDark ? 'text-white/40' : 'text-slate-400'} />
                    </button>
                    <button 
                      onClick={goToNextMonth}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      <ChevronRight size={16} className={isDark ? 'text-white/40' : 'text-slate-400'} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Month/Year Picker Modal */}
              <AnimatePresence>
                {showCalendarView && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setSelectedYear(selectedYear - 1)}
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                      >
                        <ChevronLeft size={16} className={isDark ? 'text-white/40' : 'text-slate-400'} />
                      </button>
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-400">{selectedYear}</span>
                      <button
                        onClick={() => setSelectedYear(selectedYear + 1)}
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                      >
                        <ChevronRight size={16} className={isDark ? 'text-white/40' : 'text-slate-400'} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                        <button
                          key={month}
                          onClick={() => goToMonth(idx, selectedYear)}
                          className={`py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            currentMonth.getMonth() === idx && currentMonth.getFullYear() === selectedYear
                              ? 'bg-[#CE2029] text-white'
                              : isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Weekly View */}
              {!showCalendarView && (
                <div className="space-y-3">
                  {weeklyAttendanceData.map((week, idx) => (
                    <div key={week.week}>
                      <button
                        onClick={() => setExpandedWeek(expandedWeek === idx ? null : idx)}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${isDark ? 'bg-white/5 border-white/5 hover:border-[#CE2029]/30' : 'bg-slate-50 border-slate-100 hover:border-[#CE2029]/30'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-700'}`}>{week.week}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-[#CE2029]">{week.present}/{week.total}</span>
                            <ChevronLeft 
                              size={14} 
                              className={`transition-transform duration-200 ${isDark ? 'text-white/40' : 'text-slate-400'} ${expandedWeek === idx ? 'rotate-90' : ''}`} 
                            />
                          </div>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-[#CE2029] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(week.present / week.total) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </button>

                      {/* Expanded daily attendance details */}
                      <AnimatePresence>
                        {expandedWeek === idx && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mt-2 p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}
                          >
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Daily Breakdown</p>
                            <div className="grid grid-cols-7 gap-2">
                              {week.days.map((day) => (
                                <div key={day.day} className="text-center">
                                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{day.day}</p>
                                  <div className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold uppercase transition-all ${
                                    day.status === 'present'
                                      ? 'bg-green-500 text-white shadow-md'
                                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                  }`}>
                                    {day.status === 'present' ? '✓' : '✗'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}

              {/* Full Calendar View */}
              {showCalendarView && !expandedWeek && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}
                >
                  {/* Calendar header */}
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center">
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{day}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {getCalendarDays().map((dayData, idx) => (
                      <div key={idx} className="text-center">
                        {dayData.status === 'empty' ? (
                          <div className="aspect-square" />
                        ) : (
                          <div className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer hover:scale-110 ${
                            dayData.status === 'present'
                              ? 'bg-green-500 text-white shadow-md'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {dayData.day}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Calendar legend */}
                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500" />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500/10 border border-red-500/20" />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Absent</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Monthly Stats */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Monthly Rate</p>
                  <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>83.3%</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total Days</p>
                    <p className="text-lg font-black text-[#CE2029]">24</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Attended</p>
                    <p className="text-lg font-black text-green-500">20</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {attendanceTab === 'yearly' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-bold uppercase tracking-wider text-slate-400">{selectedYear}</h5>
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      const newYear = selectedYear - 1;
                      setSelectedYear(newYear);
                      setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                  >
                    <ChevronLeft size={16} className={isDark ? 'text-white/40' : 'text-slate-400'} />
                  </button>
                  <button 
                    onClick={() => {
                      const newYear = selectedYear + 1;
                      setSelectedYear(newYear);
                      setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                  >
                    <ChevronRight size={16} className={isDark ? 'text-white/40' : 'text-slate-400'} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {yearlyData.length > 0 ? (
                  yearlyData.map((month) => (
                    <div key={month.month} className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-700'}`}>{month.month}</span>
                        <span className="text-sm font-black text-[#CE2029]">{month.rate}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#CE2029] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${month.rate}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`p-8 text-center rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No attendance data available for {selectedYear}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Yearly Average</p>
                  <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{yearlyAverage}%</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Best Month</p>
                    <p className="text-lg font-black text-green-500">{bestMonthObj.rate}%</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total Sessions</p>
                    <p className="text-lg font-black text-[#CE2029]">{totalSessionsCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#12141a] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <p className={`text-[9px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Overall Rate</p>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>89.5%</p>
          </div>
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#12141a] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <p className={`text-[9px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Streak</p>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>12 Days</p>
          </div>
          <div className={`p-4 rounded-2xl border col-span-2 md:col-span-1 ${isDark ? 'bg-[#12141a] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <p className={`text-[9px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Rank</p>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Top 5%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
