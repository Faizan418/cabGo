import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Car,
  Mail,
  Lock,
  User,
  Hash,
  Palette,
  Users,
  ArrowRight,
  ArrowLeft,
  Gauge,
  Bike,
  Phone,
  ShieldCheck,
  FileText,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';

const CaptainRegister = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1 or 2

  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    cnic: '',
    password: '',
    confirmPassword: '',

    // Step 2: Vehicle & License Details
    vehicleType: 'car', // 'car' | 'bike' | 'auto'
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '2020',
    vehicleColor: '',
    vehiclePlate: '',
    vehicleCapacity: '4',
    drivingLicense: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { registerCaptain } = useAuth();
  const navigate = useNavigate();

  // Helper to format CNIC
  const formatCnic = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };

  // Validate Step 1
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    } else if (formData.firstname.trim().length < 3) {
      newErrors.firstname = 'First name must be at least 3 characters long';
    }

    if (formData.lastname.trim() && formData.lastname.trim().length < 3) {
      newErrors.lastname = 'Last name must be at least 3 characters long';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+ -]{10,16}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
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

  // Validate Step 2
  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.vehicleMake.trim()) {
      newErrors.vehicleMake = 'Vehicle make is required (e.g. Toyota, Honda)';
    }

    if (!formData.vehicleModel.trim()) {
      newErrors.vehicleModel = 'Vehicle model is required (e.g. Corolla, City)';
    }

    const yr = Number(formData.vehicleYear);
    if (!yr || yr < 1995 || yr > new Date().getFullYear() + 1) {
      newErrors.vehicleYear = 'Please enter a valid year';
    }

    if (!formData.vehicleColor.trim()) {
      newErrors.vehicleColor = 'Vehicle color is required';
    } else if (formData.vehicleColor.trim().length < 3) {
      newErrors.vehicleColor = 'Color must be at least 3 characters';
    }

    if (!formData.vehiclePlate.trim()) {
      newErrors.vehiclePlate = 'Vehicle registration number (plate) is required';
    } else if (formData.vehiclePlate.trim().length < 3) {
      newErrors.vehiclePlate = 'Plate number must be at least 3 characters';
    }

    if (!formData.drivingLicense.trim()) {
      newErrors.drivingLicense = 'Driving license number is required';
    }

    const capacity = Number(formData.vehicleCapacity);
    if (!capacity || capacity < 1) {
      newErrors.vehicleCapacity = 'Capacity must be at least 1 person';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setApiError('');
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      await registerCaptain({
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        cnic: formData.cnic.trim(),
        drivingLicense: formData.drivingLicense.trim(),
        password: formData.password,
        vehicleColor: formData.vehicleColor.trim(),
        vehiclePlate: formData.vehiclePlate.trim().toUpperCase(),
        vehicleCapacity: Number(formData.vehicleCapacity),
        vehicleType: formData.vehicleType,
        vehicleMake: formData.vehicleMake.trim(),
        vehicleModel: formData.vehicleModel.trim(),
        vehicleYear: Number(formData.vehicleYear),
      });

      navigate('/captain/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Captain registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10">
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
          Join CabGo Driver Network
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Drive on your schedule, enjoy 0% commission on your first 5 trips, and earn with transparency.
        </p>

        {/* 2-Step Progress Wizard Bar */}
        <div className="flex items-center justify-center gap-3 mt-6 max-w-sm mx-auto">
          <div
            onClick={() => currentStep === 2 && setCurrentStep(1)}
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              currentStep === 1
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 border border-slate-700 cursor-pointer hover:bg-slate-800'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center text-[10px]">
              1
            </div>
            <span>Personal Info</span>
          </div>

          <div className="w-4 h-0.5 bg-slate-800" />

          <div
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              currentStep === 2
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/40 text-slate-500 border border-slate-800'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
              2
            </div>
            <span>Vehicle Info</span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-white text-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100">
          <ErrorMessage
            message={apiError}
            onDismiss={() => setApiError('')}
            className="mb-5"
          />

          {/* ================= STEP 1: PERSONAL INFORMATION ================= */}
          {currentStep === 1 && (
            <form className="space-y-4" onSubmit={handleNextStep} noValidate>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Step 1 of 2: Personal Profile
                </span>
                <span className="text-xs text-slate-400">Identity & Login</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  name="firstname"
                  value={formData.firstname}
                  onChange={(e) => {
                    setFormData({ ...formData, firstname: e.target.value });
                    if (errors.firstname) setErrors({ ...errors, firstname: '' });
                  }}
                  placeholder="Usman"
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
                  placeholder="Ali"
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
                placeholder="captain@example.com"
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
                  placeholder="03219876543"
                  icon={Phone}
                  error={errors.phone}
                  required
                />

                <Input
                  label="CNIC Number (13 digits)"
                  name="cnic"
                  type="text"
                  value={formData.cnic}
                  onChange={(e) => {
                    setFormData({ ...formData, cnic: formatCnic(e.target.value) });
                    if (errors.cnic) setErrors({ ...errors, cnic: '' });
                  }}
                  placeholder="35202-1234567-2"
                  icon={ShieldCheck}
                  error={errors.cnic}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="font-bold"
                >
                  Continue to Vehicle Information
                </Button>
              </div>
            </form>
          )}

          {/* ================= STEP 2: VEHICLE & LICENSE DETAILS ================= */}
          {currentStep === 2 && (
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Step 2 of 2: Vehicle & License
                </span>
                <span className="text-xs text-slate-400">Fleet Verification</span>
              </div>

              {/* Vehicle Type Choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Vehicle Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'car', label: 'Car / Cab', icon: Car, defaultCap: 4 },
                    { id: 'bike', label: 'Moto / Bike', icon: Bike, defaultCap: 1 },
                    { id: 'auto', label: 'Auto Rickshaw', icon: Car, defaultCap: 3 },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          vehicleType: item.id,
                          vehicleCapacity: String(item.defaultCap),
                        })
                      }
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                        formData.vehicleType === item.id
                          ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5 mb-1" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Make & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Vehicle Make"
                  name="vehicleMake"
                  value={formData.vehicleMake}
                  onChange={(e) => {
                    setFormData({ ...formData, vehicleMake: e.target.value });
                    if (errors.vehicleMake) setErrors({ ...errors, vehicleMake: '' });
                  }}
                  placeholder="e.g. Toyota, Honda, Suzuki"
                  icon={Car}
                  error={errors.vehicleMake}
                  required
                />

                <Input
                  label="Vehicle Model"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={(e) => {
                    setFormData({ ...formData, vehicleModel: e.target.value });
                    if (errors.vehicleModel) setErrors({ ...errors, vehicleModel: '' });
                  }}
                  placeholder="e.g. Corolla GLI, CD 70"
                  error={errors.vehicleModel}
                  required
                />
              </div>

              {/* Year, Color, Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Year"
                  name="vehicleYear"
                  type="number"
                  min="1995"
                  max="2027"
                  value={formData.vehicleYear}
                  onChange={(e) => {
                    setFormData({ ...formData, vehicleYear: e.target.value });
                    if (errors.vehicleYear) setErrors({ ...errors, vehicleYear: '' });
                  }}
                  placeholder="2021"
                  icon={Calendar}
                  error={errors.vehicleYear}
                  required
                />

                <Input
                  label="Color"
                  name="vehicleColor"
                  value={formData.vehicleColor}
                  onChange={(e) => {
                    setFormData({ ...formData, vehicleColor: e.target.value });
                    if (errors.vehicleColor) setErrors({ ...errors, vehicleColor: '' });
                  }}
                  placeholder="White"
                  icon={Palette}
                  error={errors.vehicleColor}
                  required
                />

                <Input
                  label="Capacity"
                  name="vehicleCapacity"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.vehicleCapacity}
                  onChange={(e) => {
                    setFormData({ ...formData, vehicleCapacity: e.target.value });
                    if (errors.vehicleCapacity) setErrors({ ...errors, vehicleCapacity: '' });
                  }}
                  placeholder="4"
                  icon={Users}
                  error={errors.vehicleCapacity}
                  required
                />
              </div>

              {/* Plate & Driving License */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Registration Number Plate"
                  name="vehiclePlate"
                  value={formData.vehiclePlate}
                  onChange={(e) => {
                    setFormData({ ...formData, vehiclePlate: e.target.value.toUpperCase() });
                    if (errors.vehiclePlate) setErrors({ ...errors, vehiclePlate: '' });
                  }}
                  placeholder="LEA-5555"
                  icon={Hash}
                  error={errors.vehiclePlate}
                  required
                />

                <Input
                  label="Driving License Number"
                  name="drivingLicense"
                  value={formData.drivingLicense}
                  onChange={(e) => {
                    setFormData({ ...formData, drivingLicense: e.target.value.toUpperCase() });
                    if (errors.drivingLicense) setErrors({ ...errors, drivingLicense: '' });
                  }}
                  placeholder="DL-LHR-98765"
                  icon={FileText}
                  error={errors.drivingLicense}
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>New Captain Promotion:</strong> Your first 5 completed trips are 100% commission-free (0% platform fee).
                </span>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentStep(1)}
                  icon={ArrowLeft}
                  iconPosition="left"
                  className="w-1/3"
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-2/3 font-bold"
                >
                  Complete Registration
                </Button>
              </div>
            </form>
          )}

          {/* Links */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-600">
              Already registered as a Captain?{' '}
              <Link
                to="/captain/login"
                className="font-bold text-amber-600 hover:text-amber-700 underline underline-offset-2"
              >
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptainRegister;
