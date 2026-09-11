import React, { useState } from 'react';
import {
  Car,
  Bike,
  Shield,
  Phone,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  MapPin,
  Banknote,
  XCircle,
} from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';

const RideStatusCard = ({
  ride,
  onCancelRide,
  isCancelling = false,
  onBookNewRide,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!ride) return null;

  const handleConfirmCancel = () => {
    onCancelRide(ride._id, cancelReason);
    setShowCancelModal(false);
  };

  const status = ride.status;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-100 space-y-5">
      {/* 1. Status Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Ride Status
          </span>
          <h3 className="text-lg font-black text-slate-900 capitalize flex items-center gap-2">
            {status === 'pending' && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                Finding Captain...
              </>
            )}
            {status === 'accepted' && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Captain On The Way
              </>
            )}
            {status === 'arrived' && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Captain Arrived!
              </>
            )}
            {status === 'ongoing' && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                Ride In Progress
              </>
            )}
            {status === 'completed' && (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Trip Completed
              </>
            )}
            {status === 'cancelled' && (
              <>
                <XCircle className="w-5 h-5 text-rose-500" />
                Ride Cancelled
              </>
            )}
          </h3>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 font-semibold block">Fare</span>
          <span className="text-lg font-black text-slate-900">
            Rs. {ride.fare}
          </span>
        </div>
      </div>

      {/* 2. Searching Radar State */}
      {status === 'pending' && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-cabgo-500/20 radar-pulse" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cabgo-500 to-amber-300 flex items-center justify-center shadow-lg shadow-cabgo-500/30">
              <Car className="w-8 h-8 text-slate-950 animate-bounce" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base">
              Contacting nearby captains...
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Please wait while captains review your ride request. You will be notified as soon as someone accepts.
            </p>
          </div>
        </div>
      )}

      {/* 3. Captain Info Card (when accepted, arrived, or ongoing) */}
      {(status === 'accepted' || status === 'arrived' || status === 'ongoing') &&
        ride.captain && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-base shadow-sm">
                  {ride.captain.fullname?.firstname?.[0]?.toUpperCase() || 'C'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {ride.captain.fullname?.firstname} {ride.captain.fullname?.lastname || ''}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="capitalize font-medium text-slate-700">
                      {ride.captain.vehicle?.color} {ride.captain.vehicle?.vehicleType}
                    </span>
                    <span>•</span>
                    <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border text-slate-800">
                      {ride.captain.vehicle?.plate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* OTP Display Badge */}
            {ride.otp && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-cabgo-600" />
                  <span className="text-xs font-semibold text-slate-700">
                    Your Boarding OTP:
                  </span>
                </div>
                <div className="font-mono text-lg font-black tracking-widest text-slate-900 bg-white px-3 py-1 rounded-lg border border-amber-300 shadow-sm">
                  {ride.otp}
                </div>
              </div>
            )}
          </div>
        )}

      {/* 4. Ride Location Route Preview */}
      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
          <div className="flex-1">
            <span className="text-slate-400 font-medium block">Pickup</span>
            <p className="font-semibold text-slate-800">{ride.pickup}</p>
          </div>
        </div>
        <div className="ml-1 border-l-2 border-dashed border-slate-200 h-3" />
        <div className="flex items-start gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
          <div className="flex-1">
            <span className="text-slate-400 font-medium block">Destination</span>
            <p className="font-semibold text-slate-800">{ride.destination}</p>
          </div>
        </div>
      </div>

      {/* 5. Completed Cash Payment Alert */}
      {status === 'completed' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto">
            <Banknote className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-emerald-900 text-sm">
            Cash Payment of Rs. {ride.fare}
          </h4>
          <p className="text-xs text-emerald-700">
            {ride.paymentStatus === 'paid'
              ? 'Captain has confirmed receiving cash payment. Thank you for riding with CabGo!'
              : 'Please pay cash to your captain upon arrival.'}
          </p>
        </div>
      )}

      {/* 6. Cancelled Notice */}
      {status === 'cancelled' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
          <p className="font-bold text-rose-900">
            Ride was cancelled by {ride.cancelledBy || 'system'}.
          </p>
          {ride.cancellationReason && (
            <p className="text-rose-700">Reason: {ride.cancellationReason}</p>
          )}
        </div>
      )}

      {/* 7. Action Buttons */}
      <div className="pt-2">
        {status === 'completed' || status === 'cancelled' ? (
          <Button
            variant="primary"
            fullWidth
            onClick={onBookNewRide}
          >
            Book Another Ride
          </Button>
        ) : (
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowCancelModal(true)}
            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-xs"
            disabled={status === 'ongoing'}
          >
            Cancel Ride
          </Button>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Ride Request?"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl text-amber-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p>
              Are you sure you want to cancel this ride? If a captain is already travelling to your pickup, this may inconvenience them.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Cancellation (Optional)
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed my mind, found another ride..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cabgo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelModal(false)}
            >
              Keep Ride
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleConfirmCancel}
            >
              Yes, Cancel Ride
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RideStatusCard;
