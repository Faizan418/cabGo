import React, { useState } from 'react';
import {
  MapPin,
  User,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Car,
  Navigation,
} from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';

const CurrentRideCard = ({
  ride,
  onArrive,
  onStartRide,
  onEndRide,
  onConfirmCash,
  onCancelRide,
  isProcessing = false,
}) => {
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!ride) return null;

  const handleStartWithOtp = () => {
    if (!otp || otp.trim().length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP provided by the passenger');
      return;
    }
    setOtpError('');
    onStartRide(ride._id, otp.trim());
  };

  const handleCancel = () => {
    onCancelRide(ride._id, cancelReason);
    setShowCancelModal(false);
  };

  const status = ride.status;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-100 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Assignment
          </span>
          <h3 className="text-lg font-black text-slate-900 capitalize">
            {status === 'accepted' && 'En Route to Pickup'}
            {status === 'arrived' && 'Arrived at Pickup'}
            {status === 'ongoing' && 'Ride in Progress'}
            {status === 'completed' && 'Trip Completed'}
          </h3>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400 block">Fare</span>
          <span className="text-lg font-black text-slate-900">Rs. {ride.fare}</span>
        </div>
      </div>

      {/* Passenger Info */}
      {ride.user && (
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cabgo-500 text-slate-950 flex items-center justify-center font-bold text-sm">
              {ride.user.fullname?.firstname?.[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {ride.user.fullname?.firstname} {ride.user.fullname?.lastname || ''}
              </h4>
              <p className="text-xs text-slate-500">{ride.user.email}</p>
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg">
            Passenger
          </span>
        </div>
      )}

      {/* Locations */}
      <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
        <div className="flex items-start gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
          <div>
            <span className="text-slate-400 font-semibold block">Pickup</span>
            <p className="font-bold text-slate-800 text-sm">{ride.pickup}</p>
          </div>
        </div>

        <div className="ml-1 border-l-2 border-dashed border-slate-300 h-3" />

        <div className="flex items-start gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
          <div>
            <span className="text-slate-400 font-semibold block">Destination</span>
            <p className="font-bold text-slate-800 text-sm">{ride.destination}</p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Flow Controls */}

      {/* STEP 1: ACCEPTED -> MARK ARRIVED */}
      {status === 'accepted' && (
        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isProcessing}
            onClick={() => onArrive(ride._id)}
          >
            I Have Arrived at Pickup
          </Button>

          <Button
            variant="outline"
            fullWidth
            size="sm"
            onClick={() => setShowCancelModal(true)}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            Cancel Assignment
          </Button>
        </div>
      )}

      {/* STEP 2: ARRIVED -> ENTER OTP */}
      {status === 'arrived' && (
        <div className="space-y-4 p-4 bg-amber-50/60 border border-amber-200/70 rounded-2xl">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>Passenger Verification</span>
          </div>
          <p className="text-xs text-amber-800">
            Ask the passenger for their 6-digit OTP to start the trip.
          </p>

          <div>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''));
                setOtpError('');
              }}
              placeholder="Enter 6-digit OTP"
              className="w-full text-center font-mono tracking-widest text-2xl font-black py-3 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {otpError && (
              <p className="mt-1 text-xs text-rose-500 font-semibold">{otpError}</p>
            )}
          </div>

          <Button
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isProcessing}
            onClick={handleStartWithOtp}
          >
            Verify OTP & Start Ride
          </Button>

          <Button
            variant="outline"
            fullWidth
            size="sm"
            onClick={() => setShowCancelModal(true)}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            Cancel Assignment
          </Button>
        </div>
      )}

      {/* STEP 3: ONGOING -> END RIDE */}
      {status === 'ongoing' && (
        <div className="space-y-3">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>Trip in progress. Drive safely to destination.</span>
          </div>

          <Button
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isProcessing}
            onClick={() => onEndRide(ride._id)}
          >
            Arrived at Destination & End Ride
          </Button>
        </div>
      )}

      {/* STEP 4: COMPLETED -> FINANCIAL BREAKDOWN & CASH COLLECTION */}
      {status === 'completed' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <h4 className="font-black text-emerald-950 text-base">
                  Trip Completed — Cash Payment
                </h4>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-200/60 text-emerald-900">
                Collect Cash
              </span>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Passenger Cash Fare</span>
                <span className="font-bold text-slate-900">Rs. {ride.fare}</span>
              </div>

              <div className="flex justify-between text-slate-700">
                <span>CabGo Commission ({ride.commissionRate ?? 10}%)</span>
                <span className={`font-bold ${ride.commissionAmount === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {ride.commissionAmount === 0 ? 'Rs. 0 (Promo Bonus)' : `- Rs. ${ride.commissionAmount}`}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-emerald-200/80 text-sm">
                <span className="font-black text-emerald-950">Your Net Earnings</span>
                <span className="font-black text-emerald-700">
                  Rs. {ride.captainEarning ?? (ride.fare - (ride.commissionAmount || 0))}
                </span>
              </div>
            </div>

            {/* Wallet Deduction Alert Banner */}
            <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-[11px] text-slate-600">
              {ride.commissionAmount === 0 ? (
                <span className="text-emerald-700 font-semibold">
                  🎉 <strong>New Captain Bonus:</strong> 0% commission applied. Rs. {ride.fare} is 100% yours!
                </span>
              ) : (
                <span>
                  💡 <strong>Wallet Settlement:</strong> Rs. {ride.commissionAmount} commission was automatically settled from your prepaid balance.
                </span>
              )}
            </div>
          </div>

          {ride.paymentStatus !== 'paid' ? (
            <Button
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isProcessing}
              onClick={() => onConfirmCash(ride._id)}
            >
              Confirm Cash Payment Received (Rs. {ride.fare})
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm py-2 bg-emerald-50 rounded-2xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
              <span>Ride fully resolved & saved</span>
            </div>
          )}
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Ride Assignment?"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl text-amber-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p>
              Cancelling an accepted ride will alert the passenger and return you to search mode.
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
              placeholder="e.g. Flat tire, traffic jam, emergency..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cabgo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelModal(false)}
            >
              Keep Assignment
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isProcessing}
              onClick={handleCancel}
            >
              Cancel Ride
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CurrentRideCard;
