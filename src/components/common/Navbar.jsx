import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Car,
  Menu,
  X,
  User,
  History,
  LogOut,
  Shield,
  Gauge,
  Compass,
} from 'lucide-react';
import Button from './Button';

const Navbar = () => {
  const { user, captain, role, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cabgo-600 to-cabgo-400 flex items-center justify-center shadow-lg shadow-cabgo-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                Cab<span className="text-cabgo-500">Go</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 leading-tight">
                Express Cabs
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl transition-colors ${
                isActive('/')
                  ? 'text-cabgo-500 bg-slate-800/80 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Home
            </Link>

            {isAuthenticated && role === 'user' && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-2 rounded-xl transition-colors ${
                    isActive('/dashboard')
                      ? 'text-cabgo-500 bg-slate-800/80 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Book Ride
                </Link>
                <Link
                  to="/rides"
                  className={`px-3.5 py-2 rounded-xl transition-colors ${
                    isActive('/rides')
                      ? 'text-cabgo-500 bg-slate-800/80 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Ride History
                </Link>
                <Link
                  to="/profile"
                  className={`px-3.5 py-2 rounded-xl transition-colors ${
                    isActive('/profile')
                      ? 'text-cabgo-500 bg-slate-800/80 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Profile
                </Link>
              </>
            )}

            {isAuthenticated && role === 'captain' && (
              <>
                <Link
                  to="/captain/dashboard"
                  className={`px-3.5 py-2 rounded-xl transition-colors ${
                    isActive('/captain/dashboard')
                      ? 'text-cabgo-500 bg-slate-800/80 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Control Panel
                </Link>
                <Link
                  to="/captain/profile"
                  className={`px-3.5 py-2 rounded-xl transition-colors ${
                    isActive('/captain/profile')
                      ? 'text-cabgo-500 bg-slate-800/80 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Captain Profile
                </Link>
              </>
            )}

            {!isAuthenticated && (
              <>
                <a
                  href="#how-it-works"
                  className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  How It Works
                </a>
                <a
                  href="#safety"
                  className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  Safety
                </a>
              </>
            )}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={role === 'captain' ? '/captain/profile' : '/profile'}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-cabgo-500/20 text-cabgo-400 flex items-center justify-center font-bold text-xs">
                    {role === 'captain'
                      ? captain?.fullname?.firstname?.[0]?.toUpperCase() || 'C'
                      : user?.fullname?.firstname?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white leading-tight">
                      {role === 'captain'
                        ? captain?.fullname?.firstname
                        : user?.fullname?.firstname}
                    </p>
                    <p className="text-[10px] text-cabgo-400 capitalize leading-none">
                      {role}
                    </p>
                  </div>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  icon={LogOut}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/captain/login"
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 px-3 py-2 rounded-xl hover:bg-amber-400/10 transition-colors"
                >
                  Drive with CabGo
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 text-slate-200 hover:bg-slate-800"
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              {role === 'user' ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <Car className="w-5 h-5 text-cabgo-500" />
                    Book Ride
                  </Link>
                  <Link
                    to="/rides"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <History className="w-5 h-5 text-cabgo-500" />
                    Ride History
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <User className="w-5 h-5 text-cabgo-500" />
                    My Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/captain/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <Gauge className="w-5 h-5 text-cabgo-500" />
                    Captain Dashboard
                  </Link>
                  <Link
                    to="/captain/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <User className="w-5 h-5 text-cabgo-500" />
                    Captain Profile
                  </Link>
                </>
              )}

              <div className="pt-4 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={handleLogout}
                  className="border-slate-700 text-slate-200 hover:bg-slate-800"
                  icon={LogOut}
                >
                  Logout ({role === 'captain' ? captain?.fullname?.firstname : user?.fullname?.firstname})
                </Button>
              </div>
            </>
          ) : (
            <div className="pt-4 space-y-2 border-t border-slate-800">
              <Link
                to="/captain/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center py-2.5 px-4 rounded-xl text-amber-400 bg-amber-500/10 font-semibold text-sm"
              >
                Become a CabGo Captain
              </Link>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    fullWidth
                    className="border-slate-700 text-slate-200 hover:bg-slate-800"
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth>
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
