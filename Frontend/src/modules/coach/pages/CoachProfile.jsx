import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mail, Phone, MapPin, Award, Calendar, Shield, Save, User, Star, TrendingUp } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';
import { useAuth } from '../../user/context/AuthContext';
import { isApiConfigured } from '../../../services/config';
import { getAuthToken } from '../../../services/apiClient';
import { patchMyProfile } from '../../../services/meApi';
import { meRequest } from '../../../services/authApi';

const CoachProfile = () => {
  const { isDark } = useTheme();
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Coach',
    email: user?.email || '',
    role: user?.role === 'COACH' ? 'HEAD COACH (BADMINTON)' : (user?.role || 'COACH'),
    bio: user?.bio || 'Dedicated professional badminton coach with 8+ years of experience training state-level athletes and junior champions. Expert in technical analytics and high-intensity stamina conditioning.',
    experience: user?.experience || '8 Years',
    phone: user?.phone || '',
    location: user?.location || 'Muscat, Oman',
    specialization: user?.specialization || ['Technical Footwork', 'Smash Precision', 'Junior Development'],
    achievements: user?.achievements?.length ? user.achievements : ['Gold Medalist (Internal Masters)', 'Certified BWF Coach (Lv 2)'],
    avatar: user?.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
    hours: user?.hours || '1.4k',
    wins: user?.wins || '94%'
  });

  useEffect(() => {
    if (!user) return;
    setProfileData((prev) => ({
      ...prev,
      name: user.name || prev.name,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      avatar: user.avatar || prev.avatar,
      bio: user.bio || prev.bio,
      experience: user.experience || prev.experience,
      achievements: user.achievements?.length ? user.achievements : prev.achievements,
      hours: user.hours || prev.hours,
      wins: user.wins || prev.wins,
    }));
  }, [user]);

  const handleSave = async () => {
    setSaveError('');
    setSaving(true);
    try {
      if (isApiConfigured() && getAuthToken()) {
        await patchMyProfile({
          name: profileData.name.trim(),
          phone: profileData.phone.trim(),
          avatarUrl: profileData.avatar,
          bio: profileData.bio.trim(),
          experience: profileData.experience.trim(),
          achievements: profileData.achievements,
          hours: profileData.hours.trim(),
          wins: profileData.wins.trim(),
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
          avatar: u.avatarUrl || profileData.avatar,
        };
        setUser(mapped);
        localStorage.setItem('user', JSON.stringify(mapped));
        setProfileData((prev) => ({
          ...prev,
          name: mapped.name,
          email: mapped.email,
          phone: mapped.phone,
          avatar: mapped.avatar,
          bio: mapped.bio,
          experience: mapped.experience,
          achievements: mapped.achievements,
          hours: mapped.hours,
          wins: mapped.wins,
        }));
      }
      setIsEditing(false);
    } catch (e) {
      setSaveError(e.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-10">
      {saveError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-center text-xs font-semibold text-red-800">
          {saveError}
        </div>
      )}
      {/* Header / Banner - Ultra Compact */}
      <div className={`relative rounded-[28px] overflow-hidden shadow-lg transition-all duration-500 ${isDark ? 'bg-[#1a1d24] border border-white/5' : 'bg-white border border-slate-100'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#CE2029] via-transparent to-transparent opacity-[0.02]" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between px-6 py-4 gap-4">
          <div className="flex flex-col md:flex-row items-center gap-5">
            {/* Avatar Section - Ultra Compact */}
            <div className="relative group">
              <div className="relative w-16 h-16 rounded-[22px] border-2 border-white dark:border-white/10 shadow-md overflow-hidden bg-slate-200">
                <img 
                  src={profileData.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[#CE2029] text-white shadow-xl flex items-center justify-center border-2 border-white dark:border-[#1a1d24] cursor-pointer hover:scale-110 transition-transform">
                  <Camera size={10} strokeWidth={2.5} />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>

            {/* Identity Info - Ultra Compact */}
            <div className="text-center md:text-left">
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-400">verified coach</span>
              {isEditing ? (
                <input 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className={`bg-transparent text-xl font-black italic uppercase tracking-tighter outline-none border-b border-[#CE2029] w-full max-w-[200px] mt-0.5 ${isDark ? 'text-white' : 'text-[#1e293b]'}`}
                />
              ) : (
                <h2 className={`text-xl font-black italic uppercase tracking-tighter leading-none ${isDark ? 'text-white' : 'text-[#1e293b]'}`}>
                  <span className="text-[#CE2029]">{profileData.name.split(' ')[0]}</span> {profileData.name.split(' ').slice(1).join(' ')}
                </h2>
              )}
              <div className="flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 opacity-60">
                  {profileData.role}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button - Ultra Compact */}
          <button 
            type="button"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={saving}
            className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-60 ${
              isEditing 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-[#CE2029]/5 dark:bg-[#CE2029]/10 text-[#CE2029] border border-[#CE2029]/20 hover:bg-[#CE2029] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {isEditing ? <><Save size={12} /> {saving ? 'Saving…' : 'Save'}</> : <><User size={12} /> Edit</>}
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Contact Info - Compact */}
        <div className="md:col-span-1 space-y-4">
          <div className={`p-5 rounded-[24px] border shadow-sm ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-[#CE2029] mb-4">Contact</h3>
            <div className="space-y-3">
              {[
                { label: 'Email', value: profileData.email, icon: Mail, key: 'email' },
                { label: 'Phone', value: profileData.phone, icon: Phone, key: 'phone' },
                { label: 'Location', value: profileData.location, icon: MapPin, key: 'location' }
              ].map(item => (
                <div key={item.label} className="group">
                  <p className="text-[7px] font-black uppercase text-slate-400 mb-0.5">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <item.icon size={11} className="text-slate-300 group-hover:text-[#CE2029] transition-colors" />
                    {isEditing ? (
                      <input 
                        value={item.value}
                        onChange={(e) => setProfileData({...profileData, [item.key]: e.target.value})}
                        className={`bg-transparent text-[10px] font-bold outline-none border-b border-slate-100 w-full ${isDark ? 'text-white' : 'text-[#36454F]'}`}
                      />
                    ) : (
                      <p className="text-[10px] font-bold truncate">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-5 rounded-[24px] border shadow-sm ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between mb-3 text-[9px] font-black uppercase tracking-widest text-[#CE2029]">
               <span>Experience</span>
               <span className="text-slate-400 italic">Core Load</span>
            </div>
            {isEditing ? (
              <input 
                value={profileData.experience}
                onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                className={`w-full bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg text-[10px] font-black text-[#CE2029] outline-none border border-transparent focus:border-[#CE2029]`}
              />
            ) : (
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg text-center">
                 <span className="text-[11px] font-black text-[#CE2029]">{profileData.experience} Seniority</span>
              </div>
            )}
          </div>
        </div>

        {/* Biography & Achievements - Compact */}
        <div className="md:col-span-3 space-y-4">
          <div className={`p-6 rounded-[32px] border shadow-sm ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="text-[#CE2029]" size={16} />
                <h3 className="text-[10px] font-black uppercase tracking-widest italic">Coach Narrative</h3>
              </div>
            </div>
            {isEditing ? (
              <textarea 
                rows="3"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className={`w-full bg-slate-50 dark:bg-white/5 p-4 rounded-2xl text-[12px] font-medium leading-relaxed outline-none border border-transparent focus:border-[#CE2029] ${isDark ? 'text-white' : 'text-[#36454F]'}`}
              />
            ) : (
              <p className={`text-[12px] font-medium leading-relaxed opacity-70 ${isDark ? 'text-white' : 'text-[#36454F]'}`}>
                {profileData.bio}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-5 rounded-[24px] border shadow-sm ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
               <div className="flex items-center gap-2 mb-4">
                <Award className="text-amber-500" size={16} />
                <h3 className="text-[9px] font-black uppercase tracking-widest">Achievements</h3>
              </div>
               <ul className="space-y-2">
                {isEditing ? (
                  <textarea 
                    rows="3"
                    value={profileData.achievements.join('\n')}
                    onChange={(e) => setProfileData({...profileData, achievements: e.target.value.split('\n')})}
                    placeholder="Enter achievements (one per line)"
                    className={`w-full bg-slate-50 dark:bg-white/5 p-3 rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-[#CE2029] ${isDark ? 'text-white' : 'text-[#36454F]'}`}
                  />
                ) : (
                  profileData.achievements.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10px] font-bold opacity-80"><Star size={10} className="text-[#CE2029]" /> {a}</li>
                  ))
                )}
              </ul>
            </div>
            
            <div className={`p-5 rounded-[24px] border shadow-sm ${isDark ? 'bg-[#1a1d24] border-white/5' : 'bg-white border-slate-100'}`}>
               <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-blue-500" size={16} />
                <h3 className="text-[9px] font-black uppercase tracking-widest">Performance Matrix</h3>
              </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    {isEditing ? (
                      <input 
                        value={profileData.hours}
                        onChange={(e) => setProfileData({...profileData, hours: e.target.value})}
                        className="w-full bg-transparent text-[16px] font-black text-[#CE2029] leading-none outline-none border-b border-[#CE2029]/20"
                      />
                    ) : (
                      <p className="text-[16px] font-black text-[#CE2029] leading-none mb-1">{profileData.hours}</p>
                    )}
                    <p className="text-[7px] font-black uppercase text-slate-400">Hours</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    {isEditing ? (
                      <input 
                        value={profileData.wins}
                        onChange={(e) => setProfileData({...profileData, wins: e.target.value})}
                        className="w-full bg-transparent text-[16px] font-black text-[#CE2029] leading-none outline-none border-b border-[#CE2029]/20"
                      />
                    ) : (
                      <p className="text-[16px] font-black text-[#CE2029] leading-none mb-1">{profileData.wins}</p>
                    )}
                    <p className="text-[7px] font-black uppercase text-slate-400">Wins</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachProfile;
