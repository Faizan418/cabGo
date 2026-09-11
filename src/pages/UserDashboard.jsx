import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket, useSocketEvent } from '../hooks/useSocket';
import {
  getFare,
  createRide,
  cancelRide,
} from '../api/rideApi';
import { getCoordinates, getDistanceTime } from '../api/mapsApi';
import Navbar from '../components/common/Navbar';
import MapView from '../components/map/MapView';
import LocationInput from '../components/booking/LocationInput';
import FareCard from '../components/booking/FareCard';
import RideStatusCard from '../components/booking/RideStatusCard';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import { ArrowRight, Car, Compass, Navigation } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { emitLocationUpdate } = useSocket();

  // Booking Form State
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [captainCoords, setCaptainCoords] = useState(null);

  // Fare & Estimation State
  const [fares, setFares] = useState(null);
  const [distanceTime, setDistanceTime] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState('car');
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);

  // Active Ride State
  const [activeRide, setActiveRide] = useState(null);
  const [isRequestingRide, setIsRequestingRide] = useState(false);
  const [isCancellingRide, setIsCancellingRide] = useState(false);
  const [dashboardError, setDashboardError] = useState('');

  // 1. Calculate Fare when both pickup and destination are provided
  const handleCalculateFare = async (originLoc = pickup, destLoc = destination) => {
    if (!originLoc || !destLoc || originLoc.trim().length < 3 || destLoc.trim().length < 3) {
      return;
    }

    setDashboardError('');
    setIsCalculatingFare(true);

    try {
      // Fetch coordinates concurrently for map rendering
      const [pCoords, dCoords, fareRes, distTimeRes] = await Promise.all([
        getCoordinates(originLoc).catch(() => null),
        getCoordinates(destLoc).catch(() => null),
        getFare(originLoc, destLoc),
        getDistanceTime(originLoc, destLoc).catch(() => null),
      ]);

      if (pCoords) setPickupCoords(pCoords);
      if (dCoords) setDestinationCoords(dCoords);
      setFares(fareRes);
      setDistanceTime(distTimeRes);
    } catch (err) {
      setDashboardError(err.message || 'Unable to calculate fare for these locations.');
    } finally {
      setIsCalculatingFare(false);
    }
  };

  // 2. Handle Current Location button (Geolocation)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setDashboardError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setPickupCoords(coords);
        setPickup('Current Location (Lahore)');
        emitLocationUpdate(coords);
      },
      () => {
        // Fallback default city location
        setPickupCoords({ lat: 31.5204, lng: 74.3587 });
        setPickup('Gulberg, Lahore');
      }
    );
  };

  // 3. Confirm & Request Ride
  const handleRequestRide = async () => {
    if (!pickup || !destination) {
      setDashboardError('Please provide both pickup and destination locations.');
      return;
    }

    setDashboardError('');
    setIsRequestingRide(true);

    try {
      const ride = await createRide({
        pickup: pickup.trim(),
        destination: destination.trim(),
        vehicleType: selectedVehicleType,
      });

      setActiveRide(ride);
    } catch (err) {
      setDashboardError(err.message || 'Failed to create ride request. Please try again.');
    } finally {
      setIsRequestingRide(false);
    }
  };

  // 4. Cancel Active Ride
  const handleCancelRide = async (rideId, reason) => {
    setIsCancellingRide(true);
    try {
      const res = await cancelRide(rideId, reason);
      setActiveRide(res.ride || { ...activeRide, status: 'cancelled', cancellationReason: reason });
    } catch (err) {
      setDashboardError(err.message || 'Could not cancel ride.');
    } finally {
      setIsCancellingRide(false);
    }
  };

  // Reset to new booking
  const handleBookNewRide = () => {
    setActiveRide(null);
    setFares(null);
    setDistanceTime(null);
    setPickup('');
    setDestination('');
    setPickupCoords(null);
    setDestinationCoords(null);
    setCaptainCoords(null);
    setDashboardError('');
  };

  // ================= SOCKET REAL-TIME LISTENERS =================

  // Captain Confirmed Ride
  useSocketEvent('ride-confirmed', (updatedRide) => {
    console.log('🎉 Socket Event: ride-confirmed', updatedRide);
    setActiveRide(updatedRide);
  });

  // Captain Arrived at Pickup
  useSocketEvent('captain-arrived', (updatedRide) => {
    console.log('🚖 Socket Event: captain-arrived', updatedRide);
    setActiveRide((prev) => ({
      ...prev,
      ...updatedRide,
      status: 'arrived',
    }));
  });

  // Ride Started (OTP verified)
  useSocketEvent('ride-started', (updatedRide) => {
    console.log('🟢 Socket Event: ride-started', updatedRide);
    setActiveRide((prev) => ({
      ...prev,
      ...updatedRide,
      status: 'ongoing',
    }));
  });

  // Ride Completed (Cash Pending)
  useSocketEvent('ride-completed-cash', (data) => {
    console.log('🏁 Socket Event: ride-completed-cash', data);
    setActiveRide((prev) => ({
      ...prev,
      status: 'completed',
      paymentStatus: 'pending',
    }));
  });

  // Cash Payment Confirmed by Captain
  useSocketEvent('cash-payment-confirmed', (data) => {
    console.log('💰 Socket Event: cash-payment-confirmed', data);
    setActiveRide((prev) => ({
      ...prev,
      paymentStatus: 'paid',
    }));
  });

  // Ride Cancelled by Captain
  useSocketEvent('ride-cancelled', (data) => {
    console.log('🚫 Socket Event: ride-cancelled', data);
    setActiveRide((prev) => ({
      ...prev,
      status: 'cancelled',
      cancelledBy: data.cancelledBy || 'captain',
      cancellationReason: data.reason || 'Cancelled by captain',
    }));
  });

  // Captain Live Location Tracking
  useSocketEvent('captain-location-update', (data) => {
    if (data?.location?.lat && data?.location?.lng) {
      setCaptainCoords(data.location);
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Left Side: Booking & Ride Management Panel */}
        <div className="w-full lg:w-[460px] xl:w-[500px] bg-white border-r border-slate-200 z-20 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-64px)] lg:max-h-[calc(100vh-80px)]">
          {/* Welcome User Tag */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Welcome, {user?.fullname?.firstname || 'Rider'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeRide ? 'Ride Details' : 'Where are you going?'}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-sm">
              <Car className="w-5 h-5" />
            </div>
          </div>

          <ErrorMessage
            message={dashboardError}
            onDismiss={() => setDashboardError('')}
            className="mb-4"
          />

          {/* ACTIVE RIDE CARD VIEW */}
          {activeRide ? (
            <RideStatusCard
              ride={activeRide}
              onCancelRide={handleCancelRide}
              isCancelling={isCancellingRide}
              onBookNewRide={handleBookNewRide}
            />
          ) : (
            /* BOOKING FLOW VIEW */
            <div className="space-y-5">
              {/* Location Inputs */}
              <div className="space-y-3.5 bg-slate-50 p-4 rounded-3xl border border-slate-200/80">
                <LocationInput
                  label="Pickup Point"
                  value={pickup}
                  onChange={(val) => setPickup(val)}
                  onSelectSuggestion={(val) => {
                    setPickup(val);
                    if (destination) handleCalculateFare(val, destination);
                  }}
                  placeholder="Where from? e.g. Gulberg, Lahore"
                  iconColor="text-emerald-500"
                  enableCurrentLocation
                  onUseCurrentLocation={handleUseCurrentLocation}
                />

                <LocationInput
                  label="Dropoff Destination"
                  value={destination}
                  onChange={(val) => setDestination(val)}
                  onSelectSuggestion={(val) => {
                    setDestination(val);
                    if (pickup) handleCalculateFare(pickup, val);
                  }}
                  placeholder="Where to? e.g. Airport, Lahore"
                  iconColor="text-cabgo-500"
                />

                {pickup && destination && !fares && (
                  <Button
                    variant="secondary"
                    fullWidth
                    size="md"
                    isLoading={isCalculatingFare}
                    onClick={() => handleCalculateFare(pickup, destination)}
                    className="mt-2 text-xs font-bold"
                  >
                    Calculate Fares
                  </Button>
                )}
              </div>

              {/* Fare & Vehicle Selection */}
              {fares && (
                <div className="space-y-4 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Select CabGo Ride
                  </h3>

                  <FareCard
                    fares={fares}
                    distanceTime={distanceTime}
                    selectedVehicleType={selectedVehicleType}
                    onSelectVehicle={(type) => setSelectedVehicleType(type)}
                  />

                  {/* Request Ride CTA */}
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      fullWidth
                      size="xl"
                      isLoading={isRequestingRide}
                      onClick={handleRequestRide}
                      icon={ArrowRight}
                      iconPosition="right"
                      className="font-black text-base shadow-xl"
                    >
                      Request CabGo {selectedVehicleType.toUpperCase()}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Interactive Real-Time Map */}
        <div className="w-full lg:flex-1 h-[400px] sm:h-[500px] lg:h-[calc(100vh-80px)] relative">
          <MapView
            pickupCoords={pickupCoords}
            destinationCoords={destinationCoords}
            captainCoords={captainCoords}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
