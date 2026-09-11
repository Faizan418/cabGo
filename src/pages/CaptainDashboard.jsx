import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket, useSocketEvent } from '../hooks/useSocket';
import {
  toggleAvailability,
  getCurrentRide,
} from '../api/captainApi';
import {
  confirmRide,
  arriveRide,
  startRide,
  endRide,
  confirmCashPayment,
  cancelRide,
} from '../api/rideApi';
import Navbar from '../components/common/Navbar';
import MapView from '../components/map/MapView';
import CurrentRideCard from '../components/captain/CurrentRideCard';
import NewRideModal from '../components/captain/NewRideModal';
import EarningsWidget from '../components/captain/EarningsWidget';
import CaptainWalletCard from '../components/captain/CaptainWalletCard';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import { Power, Radio, Car, Shield, Navigation, AlertCircle } from 'lucide-react';

const CaptainDashboard = () => {
  const { captain, updateCaptain } = useAuth();
  const { emitLocationUpdate } = useSocket();

  // Availability state
  const isOnline = captain?.status === 'active';
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Active Ride & Request state
  const [activeRide, setActiveRide] = useState(null);
  const [incomingRide, setIncomingRide] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [dashboardError, setDashboardError] = useState('');

  // 1. Fetch current active ride on mount
  useEffect(() => {
    const checkCurrentRide = async () => {
      try {
        const res = await getCurrentRide();
        if (res.ride) {
          setActiveRide(res.ride);
        }
      } catch (err) {
        console.warn('Check current ride error:', err.message);
      }
    };

    checkCurrentRide();
  }, []);

  // 2. Periodic captain location emission
  useEffect(() => {
    if (!isOnline) return;

    // Send captain location to socket
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            emitLocationUpdate({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          () => {
            // Default Lahore captain coordinates
            emitLocationUpdate({ lat: 31.5204, lng: 74.3587 });
          }
        );
      } else {
        emitLocationUpdate({ lat: 31.5204, lng: 74.3587 });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isOnline, emitLocationUpdate]);

  // 3. Online/Offline toggle
  const handleToggleOnline = async () => {
    setDashboardError('');
    setIsTogglingStatus(true);
    const newStatus = isOnline ? 'unactive' : 'active';

    try {
      const res = await toggleAvailability(newStatus);
      updateCaptain({ status: newStatus });
    } catch (err) {
      setDashboardError(err.message || 'Failed to update availability status.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // 4. Accept Incoming Ride
  const handleAcceptRide = async (rideId) => {
    setIsProcessingAction(true);
    try {
      const confirmed = await confirmRide(rideId);
      setActiveRide(confirmed);
      setIncomingRide(null);
    } catch (err) {
      setDashboardError(err.message || 'Unable to accept ride. It may have been taken or cancelled.');
      setIncomingRide(null);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 5. Arrive at pickup
  const handleArrive = async (rideId) => {
    setIsProcessingAction(true);
    try {
      const updated = await arriveRide(rideId);
      setActiveRide(updated);
    } catch (err) {
      setDashboardError(err.message || 'Could not mark arrival.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 6. Start ride with OTP
  const handleStartRide = async (rideId, otp) => {
    setIsProcessingAction(true);
    try {
      const updated = await startRide(rideId, otp);
      setActiveRide(updated);
    } catch (err) {
      setDashboardError(err.message || 'Invalid OTP code provided. Please ask the passenger.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 7. End ride
  const handleEndRide = async (rideId) => {
    setIsProcessingAction(true);
    try {
      const res = await endRide(rideId);
      setActiveRide(res.ride);
    } catch (err) {
      setDashboardError(err.message || 'Could not complete ride.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 8. Confirm Cash Received
  const handleConfirmCash = async (rideId) => {
    setIsProcessingAction(true);
    try {
      const res = await confirmCashPayment(rideId);
      setActiveRide(null); // Clear completed ride from view
    } catch (err) {
      setDashboardError(err.message || 'Could not confirm payment.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 9. Cancel ride
  const handleCancelRide = async (rideId, reason) => {
    setIsProcessingAction(true);
    try {
      await cancelRide(rideId, reason);
      setActiveRide(null);
    } catch (err) {
      setDashboardError(err.message || 'Could not cancel ride.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // ================= SOCKET REAL-TIME LISTENERS =================

  // New incoming ride request broadcast from backend
  useSocketEvent('new-ride', (newRide) => {
    console.log('🚨 Socket Event: new-ride received by captain', newRide);
    // Only accept if captain is online and not on an ongoing active ride
    if (isOnline && !activeRide) {
      setIncomingRide(newRide);
    }
  });

  // User cancelled ride
  useSocketEvent('ride-cancelled', (data) => {
    console.log('🚫 Socket Event: ride-cancelled', data);
    if (incomingRide && incomingRide._id === data.rideId) {
      setIncomingRide(null);
    }
    if (activeRide && activeRide._id === data.rideId) {
      setActiveRide(null);
      setDashboardError(`Passenger cancelled ride. Reason: ${data.reason || 'No reason provided'}`);
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Left Side: Captain Control Panel */}
        <div className="w-full lg:w-[480px] xl:w-[520px] bg-white border-r border-slate-200 z-20 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-64px)] lg:max-h-[calc(100vh-80px)] space-y-6">
          {/* Captain Header & Online Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-3xl shadow-lg border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/20">
                {captain?.fullname?.firstname?.[0]?.toUpperCase() || 'C'}
              </div>
              <div>
                <h2 className="font-extrabold text-base text-white leading-tight">
                  Captain {captain?.fullname?.firstname}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
                    {isOnline ? 'Online & Available' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              type="button"
              onClick={handleToggleOnline}
              disabled={isTogglingStatus}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-md active:scale-95 ${
                isOnline
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
            >
              <Power className="w-4 h-4 stroke-[2.5]" />
              <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
            </button>
          </div>

          {/* Verification Status Warning if Pending */}
          {captain?.verificationStatus === 'pending' && (
            <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-3xl text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Account Verification Under Review</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Your driver profile and vehicle documents are currently awaiting administrator review. You will be able to go online and accept rides once approved.
              </p>
            </div>
          )}

          <ErrorMessage
            message={dashboardError}
            onDismiss={() => setDashboardError('')}
          />

          {/* Active Ride Card if Captain is currently assigned */}
          {activeRide ? (
            <CurrentRideCard
              ride={activeRide}
              onArrive={handleArrive}
              onStartRide={handleStartRide}
              onEndRide={handleEndRide}
              onConfirmCash={handleConfirmCash}
              onCancelRide={handleCancelRide}
              isProcessing={isProcessingAction}
            />
          ) : (
            /* Idle Radar State & Earnings */
            <div className="space-y-6">
              {/* Prepaid Commission Wallet Card */}
              <CaptainWalletCard verificationStatus={captain?.verificationStatus} />

              {/* Radar Status Notice */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 text-center space-y-3">
                <div className="relative flex items-center justify-center w-16 h-16 mx-auto">
                  <div
                    className={`absolute inset-0 rounded-full ${
                      isOnline ? 'bg-amber-500/20 radar-pulse' : 'bg-slate-200'
                    }`}
                  />
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isOnline ? 'bg-amber-500 text-slate-950' : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isOnline ? 'Scanning for nearby riders...' : 'You are currently offline'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    {isOnline
                      ? 'Stay on this page. When a passenger in your vicinity books a ride matching your vehicle, you will receive an instant audio-visual alert.'
                      : 'Toggle your status online to begin receiving ride requests and earning fares.'}
                  </p>
                </div>
              </div>

              {/* Earnings Widget */}
              <EarningsWidget />

              {/* Vehicle Specs Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Registered Vehicle</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {captain?.vehicle?.color} {captain?.vehicle?.vehicleType}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-medium">License Plate</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border">
                    {captain?.vehicle?.plate}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Map View */}
        <div className="w-full lg:flex-1 h-[400px] sm:h-[500px] lg:h-[calc(100vh-80px)] relative">
          <MapView
            pickupCoords={activeRide?.pickupCoords}
            destinationCoords={activeRide?.destinationCoords}
            height="100%"
          />
        </div>
      </div>

      {/* New Ride Offer Popup Modal */}
      <NewRideModal
        rideRequest={incomingRide}
        onAccept={handleAcceptRide}
        onDecline={() => setIncomingRide(null)}
        isAccepting={isProcessingAction}
      />
    </div>
  );
};

export default CaptainDashboard;
