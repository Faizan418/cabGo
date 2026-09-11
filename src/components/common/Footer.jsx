import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Phone, Mail, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cabgo-600 to-cabgo-400 flex items-center justify-center shadow-lg shadow-cabgo-500/20">
                <Car className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white leading-none">
                  Cab<span className="text-cabgo-500">Go</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 leading-tight">
                  Express Cabs
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Your ride. Your way. CabGo is a next-generation urban mobility platform offering transparent fares, reliable drivers, and real-time live ride tracking.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Verified Drivers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cabgo-500 animate-pulse" />
                <span>24/7 Availability</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="hover:text-cabgo-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-cabgo-400 transition-colors">
                  Book a Ride
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-cabgo-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#safety" className="hover:text-cabgo-400 transition-colors">
                  Safety Measures
                </a>
              </li>
            </ul>
          </div>

          {/* Captain Portal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Drive with CabGo
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/captain/register" className="hover:text-cabgo-400 transition-colors">
                  Sign up as Captain
                </Link>
              </li>
              <li>
                <Link to="/captain/login" className="hover:text-cabgo-400 transition-colors">
                  Captain Login
                </Link>
              </li>
              <li>
                <Link to="/captain/dashboard" className="hover:text-cabgo-400 transition-colors">
                  Captain Portal
                </Link>
              </li>
              <li>
                <a href="#benefits" className="hover:text-cabgo-400 transition-colors">
                  Captain Earnings
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cabgo-500 shrink-0" />
                <span>+92 340 6044359</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cabgo-500 shrink-0" />
                <span>support@cabgo.app</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-cabgo-500 shrink-0" />
                <span>Karachi, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CabGo Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
