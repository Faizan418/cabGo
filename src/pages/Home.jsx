import React from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Bike,
  ShieldCheck,
  Clock,
  Compass,
  Zap,
  ArrowRight,
  CheckCircle,
  MapPin,
  Sparkles,
  Users,
  Award,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white selection:bg-cabgo-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden">
          {/* Subtle glowing backdrops */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cabgo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 left-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Heading & CTAs */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5 text-cabgo-400" />
                  <span>The Smarter Way to Move Around Town</span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]">
                  Your ride.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cabgo-400 via-amber-300 to-yellow-500">
                    Your way.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Request comfortable cabs, speedy motos, and reliable rickshaws at transparent rates. Powered by verified captains and live GPS tracking.
                </p>

                {/* Hero Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="xl"
                      fullWidth
                      icon={ArrowRight}
                      iconPosition="right"
                      className="font-bold text-base"
                    >
                      Book a Ride Now
                    </Button>
                  </Link>

                  <Link to="/captain/register" className="w-full sm:w-auto">
                    <Button
                      variant="dark"
                      size="xl"
                      fullWidth
                      className="font-semibold text-base"
                    >
                      Drive & Earn with Us
                    </Button>
                  </Link>
                </div>

                {/* Quick Trust Badges */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-left max-w-md mx-auto lg:mx-0">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-white">
                      &lt; 3 min
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Average Pickup
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-amber-400">
                      100%
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Verified Captains
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-white">
                      24/7
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Live Support
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Card Mockup */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-sm sm:max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
                  {/* Floating Ride Badge */}
                  <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-cabgo-500/20 text-cabgo-400 flex items-center justify-center font-bold">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">CabGo Express</h4>
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Captains Active Nearby
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">
                      Live Rate
                    </span>
                  </div>

                  {/* Route Teaser */}
                  <div className="py-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 mt-1 shrink-0 shadow-sm shadow-emerald-400/50" />
                      <div className="flex-1 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/50">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Current Location
                        </span>
                        <span className="text-xs font-semibold text-slate-100">
                          Malir-15, Malir Court
                        </span>
                      </div>
                    </div>

                    <div className="ml-1.5 border-l-2 border-dashed border-slate-700 h-4" />

                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-amber-400 mt-1 shrink-0 shadow-sm shadow-amber-400/50" />
                      <div className="flex-1 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/50">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Where to?
                        </span>
                        <span className="text-xs font-semibold text-slate-100">
                          PIA, Pakistan International Airport (KHI)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Fleet Selector Preview */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/90 border border-cabgo-500/50 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cabgo-500 text-slate-950 flex items-center justify-center font-bold">
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white">CabGo Comfort</p>
                          <p className="text-[10px] text-slate-400">4 seats • Air Conditioned</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-amber-400 text-sm">
                        Rs. 340
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs opacity-70">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center font-bold">
                          <Bike className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white">CabGo Moto</p>
                          <p className="text-[10px] text-slate-400">1 seat • Fast lane</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-300 text-sm">
                        Rs. 180
                      </span>
                    </div>
                  </div>

                  {/* Instant Booking Trigger */}
                  <div className="pt-5">
                    <Link to="/dashboard">
                      <Button variant="primary" fullWidth size="md" className="font-bold">
                        Experience CabGo
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. HOW IT WORKS */}
        <section id="how-it-works" className="py-20 bg-slate-900 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Effortless Travel
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                How CabGo Works in 3 Steps
              </h2>
              <p className="text-sm text-slate-400">
                No complicated hurdles. Set your points, pick your ride, and arrive safely.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {/* Step 1 */}
              <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-cabgo-500/10 text-cabgo-400 flex items-center justify-center font-black text-lg border border-cabgo-500/20">
                  01
                </div>
                <h3 className="text-xl font-bold text-white">Set Your Route</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Enter pickup and destination with intuitive real-time autocomplete suggestions.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-cabgo-500/10 text-cabgo-400 flex items-center justify-center font-black text-lg border border-cabgo-500/20">
                  02
                </div>
                <h3 className="text-xl font-bold text-white">Choose Your Vehicle</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Compare transparent upfront fares for Moto, Auto, and AC Comfort cabs before booking.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-cabgo-500/10 text-cabgo-400 flex items-center justify-center font-black text-lg border border-cabgo-500/20">
                  03
                </div>
                <h3 className="text-xl font-bold text-white">Board with OTP</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Verify your trip with a secure 6-digit OTP, track your live journey, and pay cash on arrival.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CORE FEATURES / BENEFITS */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                The CabGo Advantage
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Built for Speed, Safety & Clarity
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <Zap className="w-8 h-8 text-amber-400" />
                <h4 className="font-bold text-lg text-white">Instant Matching</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time Socket dispatching connects you directly with the nearest available captain.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                <h4 className="font-bold text-lg text-white">Verified Captains</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every driver is thoroughly vetted with registered vehicle documentation and safety checks.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <Compass className="w-8 h-8 text-sky-400" />
                <h4 className="font-bold text-lg text-white">Live Tracking</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Monitor your captain approaching on the map and share ride status with peace of mind.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <Award className="w-8 h-8 text-yellow-400" />
                <h4 className="font-bold text-lg text-white">Zero Hidden Charges</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clear upfront fare calculation based on distance, duration, and transparent rates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SAFETY SECTION */}
        <section id="safety" className="py-20 bg-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Our Uncompromising Promise
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                  Your safety is engineered into every trip.
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  We believe that every passenger and driver deserves a secure and predictable commute. From encrypted OTP authentication to 24/7 support, we have you covered.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-200">
                      6-digit encrypted ride-start OTP verification
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-200">
                      Driver and vehicle plate inspection before onboarding
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-200">
                      Real-time live trip GPS telemetry
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Emergency Support</h4>
                      <p className="text-xs text-slate-400">Available day and night</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Have questions or urgent trip inquiries? Our safety operations center is reachable around the clock via live helpline and in-app assistance.
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Helpline Assistance</span>
                    <span className="text-amber-400 font-bold">+92 300 0000000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CAPTAIN CALLOUT BANNER */}
        <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-amber-500 via-cabgo-500 to-yellow-500 rounded-3xl p-8 sm:p-14 text-slate-950 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-slate-900/80">
                  Drive with CabGo
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                  Earn on your own schedule. Drive with pride.
                </h2>
                <p className="text-sm sm:text-base text-slate-900/90 font-medium leading-relaxed">
                  Join thousands of captains driving cars, bikes, and rickshaws with instant cash payouts, flexible shifts, and dedicated driver support.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  <Link to="/captain/register" className="w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="lg"
                      fullWidth
                      className="font-black text-sm"
                    >
                      Register as Captain
                    </Button>
                  </Link>
                  <Link to="/captain/login" className="w-full sm:w-auto">
                    <button
                      type="button"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-slate-950 text-slate-950 font-bold text-sm hover:bg-slate-950/10 transition-colors"
                    >
                      Captain Login
                    </button>
                  </Link>
                </div>
              </div>

              {/* Decorative Watermark */}
              <div className="absolute right-4 -bottom-10 opacity-15 pointer-events-none hidden md:block">
                <Car className="w-80 h-80 text-slate-950" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
