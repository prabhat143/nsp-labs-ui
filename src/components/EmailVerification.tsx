import React, { useState, useEffect } from 'react';
import { Mail, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerificationSuccess,
  onBack
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const maxAttempts = 3;
  const resendCooldown = 60; // 1 minute

  useEffect(() => {
    // Send initial verification email
    sendVerificationEmail();
  }, []);

  useEffect(() => {
    // Countdown timer
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setError('Verification code has expired. Please request a new one.');
    }
  }, [timeLeft]);

  const sendVerificationEmail = async () => {
    try {
      setResendLoading(true);
      setError('');
      
      const response = await apiService.sendVerificationEmail(email);
      
      if (response.success) {
        setSuccess('Verification code sent to your email address.');
        setTimeLeft(300); // Reset timer
        setCanResend(false);
        
        // Enable resend after cooldown
        setTimeout(() => setCanResend(true), resendCooldown * 1000);
      }
    } catch (err: any) {
      console.error('Failed to send verification email:', err);
      setError(err.message || 'Failed to send verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    if (attempts >= maxAttempts) {
      setError('Maximum verification attempts reached. Please request a new code.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.verifyEmail(email, verificationCode.trim());
      
      if (response.success && response.verified) {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        setAttempts(prev => prev + 1);
        setError(response.message || 'Invalid verification code. Please try again.');
        setVerificationCode('');
      }
    } catch (err: any) {
      console.error('Email verification failed:', err);
      setAttempts(prev => prev + 1);
      setError(err.message || 'Verification failed. Please try again.');
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || resendLoading) return;
    
    setAttempts(0); // Reset attempts on resend
    await sendVerificationEmail();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl p-8 border border-blue-200 shadow-lg">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-4">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a verification code to
        </p>
        <p className="font-medium text-gray-900 break-words">{email}</p>
      </div>

      <form onSubmit={handleVerifyCode} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-sm text-green-700">{success}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => {
              setVerificationCode(e.target.value.toUpperCase());
              setError('');
            }}
            className="w-full px-4 py-3 text-center text-lg font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent tracking-wider"
            placeholder="ENTER CODE"
            maxLength={6}
            disabled={loading || timeLeft <= 0}
          />
        </div>

        {/* Timer and Attempts */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>Expires in {formatTime(timeLeft)}</span>
          </div>
          <div className="text-gray-600">
            Attempts: {attempts}/{maxAttempts}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !verificationCode.trim() || timeLeft <= 0 || attempts >= maxAttempts}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>

        {/* Resend Code */}
        <div className="text-center space-y-3">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={!canResend || resendLoading}
            className="text-cyan-600 hover:text-cyan-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${resendLoading ? 'animate-spin' : ''}`} />
            <span>
              {resendLoading ? 'Sending...' : canResend ? 'Resend Code' : 'Resend Available Soon'}
            </span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-500 font-medium"
          >
            Back to Registration
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailVerification;
