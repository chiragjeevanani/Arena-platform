import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { verifyEmailRequest } from '../../../services/authApi';

const EmailVerifiedPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      try {
        const response = await verifyEmailRequest(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        
        // Auto redirect to login after 5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Failed to verify email. The link may be expired or invalid.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-gray-800">Verifying your email...</h1>
            <p className="text-gray-600">Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-800">Email Verified!</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 italic">Redirecting to login in a few seconds...</p>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full justify-center"
            >
              Go to Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-800">Verification Failed</h1>
            <p className="text-red-600">{message}</p>
            <div className="pt-4 space-y-3">
              <Link 
                to="/signup" 
                className="block text-blue-600 hover:underline font-medium"
              >
                Try signing up again
              </Link>
              <Link 
                to="/login" 
                className="block text-gray-500 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EmailVerifiedPage;
