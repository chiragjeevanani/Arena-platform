import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { useTheme } from '../context/ThemeContext';

const EditProfile = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden ${'bg-[#F8FAFC]'}`}>
      {/* Premium Background Decorative Elements */}
      {!isDark && (
        <>
          <div className="absolute top-40 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#eb483f]/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Main Container for Compact Desktop View */}
      <div className="max-w-2xl mx-auto md:pt-12 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full overflow-hidden md:rounded-none rounded-none md:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.1)] md:border transition-all duration-500 ${
            isDark ? 'md:bg-white/[0.02] md:border-white/10' : 'md:bg-white md:border-slate-100'
          }`}
        >
          {/* Header - Always Dark */}
          <div className={`px-6 pt-5 pb-5 backdrop-blur-2xl border-b border-white/10 transition-all duration-500 bg-[#0F172A] shadow-[0_15px_40px_rgba(15,23,42,0.25)]`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 md:rounded-none rounded-2xl flex items-center justify-center border border-white/20 bg-white/10 text-white shadow-lg active:scale-95 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-base font-bold font-display text-white tracking-tight uppercase">Edit Profile</h1>
            </div>
          </div>

          <div className="px-6 md:px-10 py-8 relative z-10">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className={`w-24 h-24 md:rounded-none rounded-xl overflow-hidden border-4 p-0.5 shadow-xl transition-all duration-500 ${
                  'border-white bg-white hover:border-blue-100 hover:scale-105'
                }`}>
                  <img
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop"
                    alt="User"
                    className="w-full h-full object-cover md:rounded-none rounded-lg transition-all duration-500 group-hover:scale-110"
                  />
                  {!isDark && <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white md:rounded-none rounded-lg border-2 border-white flex items-center justify-center shadow-xl active:scale-90 transition-all hover:bg-blue-700">
                  <Camera size={14} />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="mt-8 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] ${'text-slate-500'}`}>Personal Information</h3>
                </div>
                
                <div className={`p-3 md:rounded-none rounded-xl border transition-all duration-500 relative overflow-hidden group ${
                  isDark 
                    ? 'bg-white/5 border-white/10 hover:border-blue-500/40' 
                    : 'bg-white border-slate-200 shadow-[0_4px_8px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_16px_-4px_rgba(15,23,42,0.06)]'
                }`}>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-10 h-10 md:rounded-none rounded-lg flex items-center justify-center transition-all duration-300 ${
                      'bg-blue-50 text-blue-600 group-hover:scale-110'
                    }`}>
                      <User size={16} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-[8px] font-black uppercase tracking-wider ${'text-slate-400'}`}>Full Name</p>
                      <input 
                        type="text" 
                        defaultValue="Muhammad Haroos"
                        className={`w-full bg-transparent font-bold text-[13px] outline-none mt-1 ${'text-[#0F172A]'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className={`p-3 md:rounded-none rounded-xl border transition-all duration-500 relative overflow-hidden group ${
                  isDark 
                    ? 'bg-white/5 border-white/10 hover:border-emerald-500/40' 
                    : 'bg-white border-slate-200 shadow-[0_4px_8px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_16px_-4px_rgba(15,23,42,0.06)]'
                }`}>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-10 h-10 md:rounded-none rounded-lg flex items-center justify-center transition-all duration-300 ${
                      'bg-emerald-50 text-emerald-600 group-hover:scale-110'
                    }`}>
                      <Mail size={16} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-[8px] font-black uppercase tracking-wider ${'text-slate-400'}`}>Email Address</p>
                      <input 
                        type="email" 
                        defaultValue="haroos.design@gmail.com"
                        className={`w-full bg-transparent font-bold text-[13px] outline-none mt-1 ${'text-[#0F172A]'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className={`p-3 md:rounded-none rounded-xl border transition-all duration-500 relative overflow-hidden group ${
                  isDark 
                    ? 'bg-white/5 border-white/10 hover:border-amber-500/40' 
                    : 'bg-white border-slate-200 shadow-[0_4px_8px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_16px_-4px_rgba(15,23,42,0.06)]'
                }`}>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-10 h-10 md:rounded-none rounded-lg flex items-center justify-center transition-all duration-300 ${
                      'bg-amber-50 text-amber-600 group-hover:scale-110'
                    }`}>
                      <Phone size={16} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-[8px] font-black uppercase tracking-wider ${'text-slate-400'}`}>Phone Number</p>
                      <input 
                        type="tel" 
                        defaultValue="+91 98765 43210"
                        className={`w-full bg-transparent font-bold text-[13px] outline-none mt-1 ${'text-[#0F172A]'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className={`p-3 md:rounded-none rounded-xl border transition-all duration-500 relative overflow-hidden group ${
                  isDark 
                    ? 'bg-white/5 border-white/10 hover:border-purple-500/40' 
                    : 'bg-white border-slate-200 shadow-[0_4px_8px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_16px_-4px_rgba(15,23,42,0.06)]'
                }`}>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-10 h-10 md:rounded-none rounded-lg flex items-center justify-center transition-all duration-300 ${
                      'bg-purple-50 text-purple-600 group-hover:scale-110'
                    }`}>
                      <MapPin size={16} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-[8px] font-black uppercase tracking-wider ${'text-slate-400'}`}>Location</p>
                      <input 
                        type="text" 
                        defaultValue="Dubai, UAE"
                        className={`w-full bg-transparent font-bold text-[13px] outline-none mt-1 ${'text-[#0F172A]'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10">
              <ShuttleButton 
                className="w-full !rounded-none !py-4 active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 text-[12px] uppercase tracking-widest font-black"
                variant="blue"
                onClick={() => {
                  // Simulate save
                  navigate('/profile');
                }}
              >
                Save Profile Changes
              </ShuttleButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile;


