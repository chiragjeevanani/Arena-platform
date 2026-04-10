import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Message, ArrowBackIos } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const OTPVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '']);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handling backspace to focus previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.join('').length < 4) return;
    login();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FFF1F1] md:bg-white flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#CE2029]/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#CE2029]/10 rounded-full blur-[80px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full md:max-w-[440px] bg-transparent md:bg-white md:p-10 md:rounded-none rounded-[40px] md:shadow-[0_20px_60px_rgba(206, 32, 41,0.08)] md:border md:border-slate-100"
      >
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 w-11 h-11 rounded-full bg-white/80 border border-slate-100 flex items-center justify-center hover:bg-[#CE2029] hover:text-white transition-all shadow-sm active:scale-90"
        >
          <ArrowBackIos className="translate-x-1" sx={{ fontSize: 18 }} />
        </button>

        <div className="space-y-10">
          <div className="text-center">
            <div className="w-24 h-24 bg-white/50 backdrop-blur-md rounded-[32px] mx-auto flex items-center justify-center shadow-xl shadow-[#CE2029]/10 border border-white/40">
               <Message className="text-[#CE2029]" sx={{ fontSize: 44 }} />
            </div>
            <h1 className="mt-8 text-3xl font-black text-[#0F172A] tracking-tight" style={{ fontFamily: "'Montserrat', 'Outfit', sans-serif" }}>Verify Code</h1>
            <p className="text-slate-500 mt-3 font-medium px-4">We sent a 4-digit code to your registered <br /> phone number <span className="text-[#0F172A] font-bold">+91 98*** *3210</span></p>
          </div>

          <div className="flex justify-center space-x-3 sm:space-x-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                autoFocus={index === 0}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-16 sm:w-16 sm:h-20 bg-white/70 border-2 border-slate-100 backdrop-blur-md rounded-2xl text-center text-3xl font-black text-[#0F172A] shadow-inner focus:border-[#CE2029] focus:bg-white focus:outline-none focus:ring-8 focus:ring-[#CE2029]/5 transition-all outline-none"
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-slate-500 font-medium">
              Didn't receive the code? {' '}
              <button className="text-[#CE2029] font-bold hover:underline">Resend in 0:45</button>
            </p>
          </div>

          <Button
            fullWidth
            onClick={handleSubmit}
            variant="contained"
            size="large"
            className="bg-[#CE2029] hover:bg-[#CE2029]/90 py-4 shadow-xl shadow-[#CE2029]/30 active:scale-95 transition-all"
            sx={{ 
                borderRadius: '16px', 
                textTransform: 'none', 
                fontWeight: 'bold', 
                fontSize: '1.05rem', 
                backgroundColor: '#CE2029',
                letterSpacing: '0.02em'
            }}
          >
            Verify & Continue
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;


