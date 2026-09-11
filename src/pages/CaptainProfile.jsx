import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCaptainProfile } from '../api/authApi';
import { toggleAvailability, getEarnings } from '../api/captainApi';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  Car,
  Bike,
  Gauge,
  LogOut,
  ShieldCheck,
  Power,
  Users,
  Palette,
  Hash,
  Award,
  DollarSign,
  TrendingUp,
  Clock,
  Phone,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const periods = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

const CaptainProfile = () => {
  const { captain, logout, updateCaptain } = useAuth();
  const [profileData, setProfileData] = useState(captain);
  const [earningsData, setEarningsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 1. Fetch Captain Profile
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      setError('');
      try {
        const res = await getCaptainProfile();
        setProfileData(res.captain);
        updateCaptain(res.captain);
      } catch (err) {
        setError(err.message || 'Failed to load captain profile.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // 2. Fetch Earnings for chosen period
  useEffect(() => {
    const fetchEarningsData = async () => {
      setIsLoadingEarnings(true);
      try {
        const res = await getEarnings(selectedPeriod);
        setEarningsData(res);
      } catch (err) {
        console.warn('Earnings load warning:', err.message);
      } finally {
        setIsLoadingEarnings(false);
      }
    };

    fetchEarningsData();
  }, [selectedPeriod]);

  // 3. Online/Offline toggle
  const handleToggleOnline = async () => {
    setIsTogglingStatus(true);
    const newStatus = profileData?.status === 'active' ? 'unactive' : 'active';
    try {
      await toggleAvailability(newStatus);
      setProfileData((prev) => ({ ...prev, status: newStatus }));
      updateCaptain({ status: newStatus });
    } catch (err) {
      setError(err.message || 'Could not update availability.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // 4. Logout
  const handleLogout = async () => {
    await logout();
    navigate('/captain/login');
  };

  const isOnline = profileData?.status === 'active';
  const vehicleType = profileData?.vehicle?.vehicleType || 'car';
  const VehicleIcon = vehicleType === 'bike' ? Bike : Car;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Captain Portal & Credentials</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Captain Profile
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/captain/dashboard">
              <Button
                variant="primary"
                size="sm"
                icon={Gauge}
                className="font-bold shadow-md"
              >
                Control Panel
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
              icon={LogOut}
            >
              Sign Out
            </Button>
          </div>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError('')} />

        {isLoadingProfile ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-md border border-slate-200/80">
            <Loader text="Loading captain credentials..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Identity & Status */}
            <div className="lg:col-span-4 space-y-6">
              {/* Captain ID Badge Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 text-center space-y-4">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="w-24 h-24 rounded-3xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-3xl shadow-xl shadow-amber-500/10 border-2 border-amber-500/30">
                    {profileData?.fullname?.firstname?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
                      isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full bg-white ${
                        isOnline ? 'animate-ping' : ''
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-xl text-slate-900">
                    Captain {profileData?.fullname?.firstname} {profileData?.fullname?.lastname || ''}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{profileData?.email}</p>
                </div>

                {/* Status Switch Badge */}
                <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Status: {isOnline ? 'Active / Online' : 'Offline'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleOnline}
                    disabled={isTogglingStatus}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${
                      isOnline
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                    }`}
                  >
                    <Power className="w-4 h-4 stroke-[2.5]" />
                    <span>{isOnline ? 'Switch to Offline' : 'Go Online Now'}</span>
                  </button>
                </div>

                {/* Verified Badge */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50/80 py-2 rounded-xl border border-emerald-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified CabGo Captain</span>
                </div>
              </div>

              {/* Lifetime Stats Card */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cabgo-500/20 text-cabgo-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Lifetime Records
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Total Earnings
                    </span>
                    <span className="text-xl font-black text-amber-400">
                      Rs. {profileData?.earnings || 0}
                    </span>
                  </div>

                  <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Total Rides
                    </span>
                    <span className="text-xl font-black text-white">
                      {profileData?.totalRides || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Vehicle & Revenue Insights */}
            <div className="lg:col-span-8 space-y-6">
              {/* Vehicle Specifications Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                      <VehicleIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        Registered Vehicle Specs
                      </h3>
                      <p className="text-xs text-slate-500 capitalize">
                        CabGo {vehicleType} Category
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-extrabold text-sm px-3 py-1.5 bg-slate-100 text-slate-900 rounded-xl border border-slate-200">
                    {profileData?.vehicle?.plate || 'UNASSIGNED'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center border shadow-xs">
                      <Palette className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                        Color
                      </span>
                      <span className="font-bold text-slate-900 capitalize text-sm">
                        {profileData?.vehicle?.color || '--'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center border shadow-xs">
                      <Hash className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                        Plate Number
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {profileData?.vehicle?.plate || '--'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center border shadow-xs">
                      <Users className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                        Passenger Capacity
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {profileData?.vehicle?.capacity || 1} Persons
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings Performance Explorer */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        Revenue Performance Breakdown
                      </h3>
                      <p className="text-xs text-slate-500">
                        Filter payouts by time horizon
                      </p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                    {periods.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPeriod(p.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          selectedPeriod === p.id
                            ? 'bg-slate-900 text-amber-400 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoadingEarnings ? (
                  <div className="py-8 text-center">
                    <Loader size="sm" text="Retrieving earnings..." />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl border border-slate-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        {selectedPeriod.toUpperCase()} Net Cash Fare
                      </span>
                      <div className="text-3xl font-black text-amber-400">
                        Rs. {earningsData?.totalEarnings || 0}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        100% credited to your account
                      </p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Completed Trips in Period
                      </span>
                      <div className="text-3xl font-black text-slate-900">
                        {earningsData?.totalRides || 0}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Rides successfully resolved
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Captain Safety & Dedicated Support */}
              <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      24/7 Captain Dispatch Support
                    </h4>
                    <p className="text-xs text-slate-600">
                      Have on-road issues or route queries? Our captain helpline is active 24/7.
                    </p>
                  </div>
                </div>

                <div className="font-mono font-bold text-xs bg-white px-3 py-1.5 rounded-xl border border-amber-200 text-amber-900 shrink-0">
                  +92 300 0000000
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CaptainProfile;
