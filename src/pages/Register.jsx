import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Car, Mail, Lock, User, ArrowRight, Phone, ShieldCheck } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';

const Register = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    cnic: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { registerUser } = useAuth();
  const navigate = useNavigate();

  // Helper to format CNIC as 35201-1234567-1
  const formatCnic = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    } else if (formData.firstname.trim().length < 3) {
      newErrors.firstname = 'First name must be at least 3 characters long';
    }

    if (formData.lastname.trim() && formData.lastname.trim().length < 3) {
      newErrors.lastname = 'Last name must be at least 3 characters long if provided';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+ -]{10,16}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (e.g. 03001234567)';
    }

    const cnicDigits = formData.cnic.replace(/\D/g, '');
    if (!formData.cnic.trim()) {
      newErrors.cnic = 'CNIC number is required';
    } else if (cnicDigits.length !== 13) {
      newErrors.cnic = 'CNIC must be exactly 13 digits (e.g. 35201-1234567-1)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await registerUser({
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        cnic: formData.cnic.trim(),
        password: formData.password,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
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
          Create Passenger Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Sign up to request rides across the city in seconds.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="First Name"
                name="firstname"
                value={formData.firstname}
                onChange={(e) => {
                  setFormData({ ...formData, firstname: e.target.value });
                  if (errors.firstname) setErrors({ ...errors, firstname: '' });
                }}
                placeholder="Ahmad"
                icon={User}
                error={errors.firstname}
                required
              />

              <Input
                label="Last Name"
                name="lastname"
                value={formData.lastname}
                onChange={(e) => {
                  setFormData({ ...formData, lastname: e.target.value });
                  if (errors.lastname) setErrors({ ...errors, lastname: '' });
                }}
                placeholder="Raza"
                error={errors.lastname}
              />
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                placeholder="03001234567"
                icon={Phone}
                error={errors.phone}
                required
              />

              <Input
                label="CNIC Number"
                name="cnic"
                type="text"
                value={formData.cnic}
                onChange={(e) => {
                  setFormData({ ...formData, cnic: formatCnic(e.target.value) });
                  if (errors.cnic) setErrors({ ...errors, cnic: '' });
                }}
                placeholder="35201-1234567-1"
                icon={ShieldCheck}
                error={errors.cnic}
                required
              />
            </div>

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              placeholder="Min 6 characters"
              icon={Lock}
              error={errors.password}
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                if (errors.confirmPassword)
                  setErrors({ ...errors, confirmPassword: '' });
              }}
              placeholder="Repeat password"
              icon={Lock}
              error={errors.confirmPassword}
              required
            />

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
                Create Account
              </Button>
            </div>
          </form>

          {/* Login switch */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-cabgo-600 hover:text-cabgo-700 underline underline-offset-2"
              >
                Log In
              </Link>
            </p>

            <div className="pt-2">
              <Link
                to="/captain/register"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                <span>Want to drive and earn?</span>
                <span className="text-amber-600 font-bold">Captain Sign Up →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
