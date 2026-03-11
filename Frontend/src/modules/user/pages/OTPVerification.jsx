import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Message, ArrowBackIos } from '@mui/icons-material';
import { motion } from 'framer-motion';

const OTPVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '']);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white px-6 py-12 flex flex-col">
      <button onClick={() => navigate(-1)} className="mb-8 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
        <ArrowBackIos className="text-slate-900 translate-x-1" sx={{ fontSize: 18 }} />
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-12"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl mx-auto flex items-center justify-center">
             <Message className="text-[#03396C]" sx={{ fontSize: 40 }} />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">Verify Code</h1>
          <p className="text-slate-500 mt-2">We sent a 4-digit code to your phone <br /> <span className="text-slate-900 font-semibold">+91 98765 43210</span></p>
        </div>

        <div className="flex justify-center space-x-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-16 h-16 border-2 border-slate-100 bg-slate-50 rounded-2xl text-center text-2xl font-bold text-slate-900 focus:border-[#03396C] focus:outline-none focus:ring-4 focus:ring-[#03396C]/10 transition-all"
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-slate-500">
            Resend code in {' '}
            <span className="text-[#03396C] font-bold">00:45</span>
          </p>
        </div>

        <Button
          fullWidth
          onClick={handleSubmit}
          variant="contained"
          size="large"
          className="bg-[#03396C] py-4"
          sx={{ borderRadius: '16px', textTransform: 'none', fontWeight: 'bold', backgroundColor: '#03396C' }}
        >
          Verify & Continue
        </Button>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
