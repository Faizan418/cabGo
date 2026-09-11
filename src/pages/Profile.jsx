import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../api/authApi';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  User,
  Mail,
  Shield,
  LogOut,
  Car,
  Calendar,
  Clock,
  CheckCircle,
} from 'lucide-react';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await getUserProfile();
        setProfileData(res.user);
        updateUser(res.user);
      } catch (err) {
        setError(err.message || 'Unable to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Account Settings
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                User Profile
              </h1>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 self-start sm:self-auto"
              icon={LogOut}
            >
              Sign Out
            </Button>
          </div>

          <ErrorMessage message={error} onDismiss={() => setError('')} />

          {isLoading ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-md">
              <Loader text="Loading your profile..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Profile Avatar Card */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200/80 flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cabgo-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-3xl shadow-xl shadow-cabgo-500/20">
                  {profileData?.fullname?.firstname?.[0]?.toUpperCase() || 'U'}
                </div>

                <div>
                  <h3 className="font-extrabold text-xl text-slate-900">
                    {profileData?.fullname?.firstname} {profileData?.fullname?.lastname || ''}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{profileData?.email}</p>
                </div>

                <div className="w-full pt-4 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    Verified Passenger
                  </span>
                </div>
              </div>

              {/* Right Profile Details */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/80 space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-400 font-semibold block">First Name</span>
                      <p className="font-bold text-slate-900 mt-1">
                        {profileData?.fullname?.firstname || '--'}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-400 font-semibold block">Last Name</span>
                      <p className="font-bold text-slate-900 mt-1">
                        {profileData?.fullname?.lastname || 'None provided'}
                      </p>
                    </div>

                    <div className="sm:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-400 font-semibold block">Registered Email</span>
                      <p className="font-bold text-slate-900 mt-1">
                        {profileData?.email || '--'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Security & Preferences
                    </h4>
                    <div className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-xs">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="font-bold text-slate-900">End-to-End Trip Verification</p>
                          <p className="text-slate-500 mt-0.5">
                            OTP verification is permanently enabled on all your ride requests.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
