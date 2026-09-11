import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldAlert,
  Gauge,
} from 'lucide-react';
import {
  sendUserResetOtp,
  verifyUserResetOtp,
  resetUserPassword,
  sendCaptainResetOtp,
  verifyCaptainResetOtp,
  resetCaptainPassword,
} from '../api/authApi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ErrorMessage from '../components/common/ErrorMessage';

const ForgotPassword = ({ userType = 'user' }) => {
  const isCaptain = userType === 'captain';
  const navigate = useNavigate();

  // Multi-step form state: 1 = Email, 2 = OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);

  // Form Fields
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // 60-second Resend Cooldown
  const [cooldown, setCooldown] = useState(0);
  const otpInputsRef = useRef([]);

  // Timer countdown effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first OTP box on entering Step 2
  useEffect(() => {
    if (step === 2 && otpInputsRef.current[0]) {
      otpInputsRef.current[0].focus();
    }
  }, [step]);

  // ================= STEP 1: SEND OTP =================
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setApiError('');
    setApiSuccess('');

    if (!email.trim()) {
      setFieldErrors({ email: 'Please enter your registered email address' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    try {
      if (isCaptain) {
        await sendCaptainResetOtp({ email: email.trim() });
      } else {
        await sendUserResetOtp({ email: email.trim() });
      }

      setApiSuccess('A 5-digit verification code has been sent to your email.');
      setCooldown(60);
      setStep(2);
    } catch (err) {
      setApiError(err.message || 'Unable to send reset code. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const handleResendOtp = async () => {
    if (cooldown > 0 || isLoading) return;
    setApiError('');
    setApiSuccess('');
    setIsLoading(true);

    try {
      if (isCaptain) {
        await sendCaptainResetOtp({ email: email.trim() });
      } else {
        await sendUserResetOtp({ email: email.trim() });
      }

      setApiSuccess('A new 5-digit verification code has been sent.');
      setCooldown(60);
      setOtpDigits(['', '', '', '', '']);
      if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
    } catch (err) {
      setApiError(err.message || 'Unable to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= OTP BOX HANDLERS =================
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1); // Only numeric digit
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setApiError('');

    // Auto-advance to next box
    if (digit && index < 4 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 5; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(newDigits);

    // Focus last filled box
    const focusIndex = Math.min(pastedData.length, 4);
    if (otpInputsRef.current[focusIndex]) {
      otpInputsRef.current[focusIndex].focus();
    }
  };

  // ================= STEP 2: VERIFY OTP =================
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setApiError('');
    setApiSuccess('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 5) {
      setApiError('Please enter the complete 5-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      let res;
      if (isCaptain) {
        res = await verifyCaptainResetOtp({ email: email.trim(), otp: fullOtp });
      } else {
        res = await verifyUserResetOtp({ email: email.trim(), otp: fullOtp });
      }

      setResetToken(res.resetToken);
      setStep(3);
    } catch (err) {
      setApiError(err.message || 'The OTP you entered is incorrect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= STEP 3: RESET PASSWORD =================
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setApiError('');
    setApiSuccess('');

    const errors = {};
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      if (isCaptain) {
        await resetCaptainPassword({
          resetToken,
          newPassword,
          confirmPassword,
        });
      } else {
        await resetUserPassword({
          resetToken,
          newPassword,
          confirmPassword,
        });
      }

      setStep(4);
    } catch (err) {
      setApiError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginRoute = isCaptain ? '/captain/login' : '/login';
  const roleTitle = isCaptain ? 'Captain' : 'Passenger';

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            {isCaptain ? (
              <Gauge className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            ) : (
              <Car className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            )}
          </div>
          <span className="text-3xl font-black tracking-tight text-white">
            Cab<span className="text-cabgo-500">Go</span>
          </span>
        </Link>

        {/* Step Progress Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 mb-3">
          <span className="text-amber-400">{roleTitle}</span>
          <span>&bull;</span>
          <span>
            {step === 1 && 'Step 1: Enter Email'}
            {step === 2 && 'Step 2: Verify Code'}
            {step === 3 && 'Step 3: New Password'}
            {step === 4 && 'Step 4: Complete'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          {step === 1 && 'Forgot Password'}
          {step === 2 && 'Enter Verification Code'}
          {step === 3 && 'Create New Password'}
          {step === 4 && 'Password Reset Complete'}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          {step === 1 && `Enter the email associated with your CabGo ${roleTitle.toLowerCase()} account.`}
          {step === 2 && `We sent a 5-digit verification code to ${email}.`}
          {step === 3 && 'Choose a strong, secure password for your account.'}
          {step === 4 && 'Your credentials have been safely updated.'}
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white text-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100 space-y-6">
          <ErrorMessage
            message={apiError}
            onDismiss={() => setApiError('')}
          />

          {apiSuccess && step === 2 && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{apiSuccess}</span>
            </div>
          )}

          {/* ================= STEP 1: EMAIL INPUT ================= */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5" noValidate>
              <Input
                label="Registered Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors({ ...fieldErrors, email: '' });
                }}
                placeholder="name@example.com"
                icon={Mail}
                error={fieldErrors.email}
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
                className="font-bold"
              >
                Send Verification Code
              </Button>
            </form>
          )}

          {/* ================= STEP 2: 5-DIGIT OTP BOXES ================= */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center mb-3">
                  5-Digit Security Code
                </label>

                {/* 5 Distinct OTP Input Boxes */}
                <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputsRef.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-12 h-14 sm:w-14 sm:h-16 text-center font-mono text-2xl font-black rounded-2xl border-2 transition-all select-none focus:outline-none
                        ${
                          digit
                            ? 'border-cabgo-500 bg-amber-50/50 text-slate-950 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-900 focus:border-cabgo-500 focus:ring-2 focus:ring-cabgo-200'
                        }
                      `}
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
                disabled={otpDigits.join('').length !== 5}
                className="font-bold"
              >
                Verify Code
              </Button>

              {/* Resend OTP with 60s Countdown */}
              <div className="pt-2 text-center">
                {cooldown > 0 ? (
                  <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Resend code in <strong className="text-slate-900 font-bold">{cooldown}s</strong></span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-xs font-bold text-cabgo-600 hover:text-cabgo-700 underline underline-offset-2 hover:opacity-80 transition-opacity"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              {/* Change email link */}
              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setApiError('');
                    setApiSuccess('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  &larr; Use a different email
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 3: CREATE NEW PASSWORD ================= */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
              <div className="relative">
                <Input
                  label="New Password"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setFieldErrors({ ...fieldErrors, newPassword: '' });
                  }}
                  placeholder="At least 6 characters"
                  icon={Lock}
                  error={fieldErrors.newPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-9 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                  }}
                  placeholder="Repeat new password"
                  icon={Lock}
                  error={fieldErrors.confirmPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-9 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                  className="font-bold"
                >
                  Reset Password
                </Button>
              </div>
            </form>
          )}

          {/* ================= STEP 4: SUCCESS STATE ================= */}
          {step === 4 && (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">
                  Password Reset Successful
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your password has been updated securely. You can now log into your CabGo {roleTitle.toLowerCase()} account.
                </p>
              </div>

              <div className="pt-3">
                <Link to={loginRoute}>
                  <Button variant="primary" fullWidth size="lg" className="font-bold">
                    Back to {roleTitle} Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Footer Link back to Login */}
          {step < 4 && (
            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                to={loginRoute}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to {roleTitle} Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
