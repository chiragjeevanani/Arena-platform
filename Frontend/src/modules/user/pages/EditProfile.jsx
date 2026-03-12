import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { useTheme } from '../context/ThemeContext';

const EditProfile = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen pb-32 ${isDark ? '' : 'bg-slate-50/50'}`}>
      {/* Header */}
      <div className={`px-6 pt-5 pb-5 sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${isDark ? 'bg-[#08142B]/80 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border active:scale-95 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white border-blue-100 text-[#0A1F44] shadow-sm'}`}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className={`text-lg font-bold font-display ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}>Edit Profile</h1>
        </div>
      </div>

      <div className="px-6 mt-8">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className={`w-32 h-32 rounded-[40px] overflow-hidden border-4 p-1 shadow-2xl ${isDark ? 'border-white/10 bg-white/5' : 'border-white bg-white'}`}>
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop"
                alt="User"
                className="w-full h-full object-cover rounded-[32px]"
              />
            </div>
            <button className="absolute -bottom-1 -right-1 w-11 h-11 bg-blue-500 text-white rounded-2xl border-4 border-white flex items-center justify-center shadow-xl active:scale-90 transition-all">
              <Camera size={18} />
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="mt-10 space-y-6">
          <div className="space-y-4">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] px-1 ${isDark ? 'text-white/40' : 'text-[#0A1F44]/40'}`}>Personal Information</h3>
            
            <div className={`p-4 rounded-[24px] border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                  <User size={18} />
                </div>
                <div className="flex-1">
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>Full Name</p>
                  <input 
                    type="text" 
                    defaultValue="Muhammad Haroos"
                    className={`w-full bg-transparent font-bold text-base outline-none mt-0.5 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}
                  />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-[24px] border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5 text-emerald-400' : 'bg-emerald-50 text-emerald-500'}`}>
                  <Mail size={18} />
                </div>
                <div className="flex-1">
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>Email Address</p>
                  <input 
                    type="email" 
                    defaultValue="haroos.design@gmail.com"
                    className={`w-full bg-transparent font-bold text-base outline-none mt-0.5 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}
                  />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-[24px] border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5 text-amber-400' : 'bg-amber-50 text-amber-500'}`}>
                  <Phone size={18} />
                </div>
                <div className="flex-1">
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>Phone Number</p>
                  <input 
                    type="tel" 
                    defaultValue="+91 98765 43210"
                    className={`w-full bg-transparent font-bold text-base outline-none mt-0.5 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}
                  />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-[24px] border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-blue-50 shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5 text-purple-400' : 'bg-purple-50 text-purple-500'}`}>
                  <MapPin size={18} />
                </div>
                <div className="flex-1">
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-white/20' : 'text-[#0A1F44]/30'}`}>Location</p>
                  <input 
                    type="text" 
                    defaultValue="Dubai, UAE"
                    className={`w-full bg-transparent font-bold text-base outline-none mt-0.5 ${isDark ? 'text-white' : 'text-[#0A1F44]'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <ShuttleButton 
            className="w-full !rounded-[24px] !py-4 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
            variant="blue"
            onClick={() => {
              // Simulate save
              navigate('/profile');
            }}
          >
            Save Changes
          </ShuttleButton>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
