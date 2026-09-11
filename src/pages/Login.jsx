import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Car, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Redirect to destination or default dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.message || 'Unable to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-cabgo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cabgo-600 to-cabgo-400 flex items-center justify-center shadow-lg shadow-cabgo-500/20 group-hover:scale-105 transition-transform">
            <Car className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-3xl font-black tracking-tight text-white">
            Cab<span className="text-cabgo-500">Go</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Sign in to your passenger account to request rides.
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
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="name@example.com"
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
                to="/forgot-password/user"
                className="text-xs font-semibold text-cabgo-600 hover:text-cabgo-700 hover:underline transition-colors"
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
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Links */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-cabgo-600 hover:text-cabgo-700 underline underline-offset-2"
              >
                Sign up as Passenger
              </Link>
            </p>

            <div className="pt-2">
              <Link
                to="/captain/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                <span>Are you a driver?</span>
                <span className="text-amber-600 font-bold">Captain Login →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
