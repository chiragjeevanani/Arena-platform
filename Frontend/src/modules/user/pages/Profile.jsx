import { useNavigate } from 'react-router-dom';
import { ArrowBack, Person, History, AccountBalanceWallet, Settings, HelpOutline, Logout, ChevronRight, Edit, Notifications, Shield, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Profile = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: <Person />, label: 'Edit Profile' },
    { icon: <History />, label: 'Booking History' },
    { icon: <AccountBalanceWallet />, label: 'My Wallet' },
    { icon: <Notifications />, label: 'Notifications' },
    { icon: <Shield />, label: 'Privacy & Security' },
    { icon: <HelpOutline />, label: 'Help & Support' }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Profile Header */}
      <div className="bg-white px-6 pt-16 pb-10 rounded-b-[48px] shadow-xl shadow-slate-200/50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-slate-50 shadow-2xl">
               <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop" alt="User" />
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#03396C] text-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center active:scale-90 transition-all">
               <Edit sx={{ fontSize: 18 }} />
            </button>
          </div>
          <h2 className="mt-6 text-2xl font-black text-slate-900 tracking-tight">Muhammad Haroos</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Premium Member</p>
          
          <div className="flex items-center mt-8 w-full border-t border-slate-100 pt-8">
            <div className="flex-1 text-center">
              <p className="text-xl font-black text-slate-900">12</p>
              <p className="text-[10px] items-center space-x-1 font-extrabold text-slate-400 uppercase tracking-widest mt-1">Bookings</p>
            </div>
            <div className="w-[1px] h-10 bg-slate-100" />
            <div className="flex-1 text-center">
              <p className="text-xl font-black text-slate-900">₹4.8k</p>
              <p className="text-[10px] items-center space-x-1 font-extrabold text-slate-400 uppercase tracking-widest mt-1">Spent</p>
            </div>
            <div className="w-[1px] h-10 bg-slate-100" />
            <div className="flex-1 text-center">
              <p className="text-xl font-black text-slate-900">4.9</p>
              <p className="text-[10px] items-center space-x-1 font-extrabold text-slate-400 uppercase tracking-widest mt-1 flex justify-center">Rating <Star sx={{ fontSize: 11, ml: 1 }} className="text-[#03396C]" /></p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-10 space-y-4">
        {menuItems.map((item, index) => (
          <motion.button 
            key={index}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white p-5 rounded-3xl border border-slate-100 flex items-center shadow-sm group hover:border-[#03396C]/20 active:bg-slate-50 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#03396C] group-hover:bg-[#03396C] group-hover:text-white transition-colors duration-300 mr-4">
               {item.icon}
            </div>
            <span className="flex-1 text-left font-bold text-slate-700 tracking-tight">{item.label}</span>
            <ChevronRight className="text-slate-300 group-hover:text-[#03396C] transition-colors" />
          </motion.button>
        ))}

        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/login')}
          className="w-full bg-red-50 p-5 rounded-3xl border border-red-100 flex items-center mt-6 shadow-sm group active:bg-red-100 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mr-4 text-red-500 shadow-inner">
             <Logout />
          </div>
          <span className="flex-1 text-left font-bold text-red-600 tracking-tight">Logout</span>
          <ChevronRight className="text-red-300" />
        </motion.button>
      </div>
    </div>
  );
};

export default Profile;
