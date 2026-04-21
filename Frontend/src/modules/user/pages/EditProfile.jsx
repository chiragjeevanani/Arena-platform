import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import ShuttleButton from '../components/ShuttleButton';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { patchMyProfile } from '../../../services/meApi';
import { meRequest } from '../../../services/authApi';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop';

const EditProfile = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user, setUser } = useAuth();

  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem('userProfileImage') || DEFAULT_AVATAR
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setPhone(user.phone || '');
    if (user.avatar) setProfileImage(user.avatar);
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaveError('');
    setSaving(true);
    try {
      localStorage.setItem('userProfileImage', profileImage);
      if (isApiConfigured() && getAuthToken()) {
        await patchMyProfile({
          name: name.trim(),
          phone: phone.trim(),
          avatarUrl: profileImage,
        });
        const me = await meRequest();
        const u = me.user;
        const mapped = {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          phone: u.phone || '',
          assignedArena: u.assignedArenaId || 'all',
          avatar: u.avatarUrl || profileImage || DEFAULT_AVATAR,
        };
        setUser(mapped);
        localStorage.setItem('user', JSON.stringify(mapped));
      }
      navigate('/profile');
    } catch (e) {
      setSaveError(e.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen pb-32 relative overflow-hidden ${'bg-[#F8FAFC]'}`}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        className="hidden" 
        accept="image/*"
      />
      {/* Premium Background Decorative Elements */}
      {!isDark && (
        <>
          <div className="absolute top-40 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[600px] -left-24 w-80 h-80 bg-[#CE2029]/10 rounded-full blur-[100px] pointer-events-none" />
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
          {/* Header - Always Project Theme */}
          <div className={`px-6 pt-5 pb-5 backdrop-blur-2xl border-b border-white/10 transition-all duration-500 bg-[#CE2029] shadow-[0_15px_40px_rgba(206, 32, 41,0.25)]`}>
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
                    src={profileImage}
                    alt="User"
                    className="w-full h-full object-cover md:rounded-none rounded-lg transition-all duration-500 group-hover:scale-110"
                  />
                  {!isDark && <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />}
                </div>
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#CE2029] text-white md:rounded-none rounded-lg border-2 border-white flex items-center justify-center shadow-xl active:scale-90 transition-all hover:bg-[#CE2029]/90"
                >
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full bg-transparent font-bold text-[13px] outline-none mt-1 ${'text-[#0F172A]'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className={`p-3 md:rounded-none rounded-xl border transition-all duration-500 relative overflow-hidden group ${
                  isDark 
                    ? 'bg-white/5 border-white/10 hover:border-emerald-500/40' 
                    : 'bg-white border-slate-200 shadow-[0_4px_8px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_16_rgba(15,23,42,0.06)]'
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
                        value={user?.email || ''}
                        readOnly
                        className={`w-full bg-transparent font-bold text-[13px] outline-none mt-1 opacity-70 ${'text-[#0F172A]'}`}
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
            {saveError && <p className="text-center text-xs text-red-600 font-semibold mt-4">{saveError}</p>}
            <div className="mt-10">
              <ShuttleButton
                className="w-full !rounded-none !py-4 active:scale-[0.98] transition-all shadow-xl shadow-[#CE2029]/20 text-[12px] uppercase tracking-widest font-black"
                variant="red"
                disabled={saving}
                onClick={() => void handleSave()}
              >
                {saving ? 'Saving…' : 'Save Profile Changes'}
              </ShuttleButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile;


