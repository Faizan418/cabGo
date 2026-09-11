import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Car, Mail, Lock, ArrowRight, Gauge } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';

const CaptainLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { loginCaptain } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await loginCaptain({
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate('/captain/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Captain login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Gauge className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-3xl font-black tracking-tight text-white">
            Cab<span className="text-cabgo-500">Go</span>
            <span className="text-xs uppercase ml-2 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold tracking-wider">
              Captain
            </span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Captain Portal Login
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Sign in to your driver account to accept rides and track daily earnings.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white text-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100">
          <ErrorMessage
            message={apiError}
            onDismiss={() => setApiError('')}
            className="mb-5"
          />

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Captain Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="captain@example.com"
              icon={Mail}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              placeholder="••••••••"
              icon={Lock}
              error={errors.password}
              required
            />

            <div className="flex items-center justify-end pt-0.5">
              <Link
                to="/forgot-password/captain"
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="pt-2">
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
                Sign In to Captain Hub
              </Button>
            </div>
          </form>

          {/* Links */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-600">
              Not yet registered as Captain?{' '}
              <Link
                to="/captain/register"
                className="font-bold text-amber-600 hover:text-amber-700 underline underline-offset-2"
              >
                Register as Captain
              </Link>
            </p>

            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                <span>Looking for rides?</span>
                <span className="text-slate-900 font-bold">Passenger Login →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptainLogin;
