import React from 'react';
import { Car, Bike, MapPin, User, Banknote, Clock } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const NewRideModal = ({
  rideRequest,
  onAccept,
  onDecline,
  isAccepting = false,
}) => {
  if (!rideRequest) return null;

  return (
    <Modal
      isOpen={!!rideRequest}
      onClose={onDecline}
      title="New Ride Request Available!"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Fare & Vehicle Highlight */}
        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cabgo-500 text-slate-950 flex items-center justify-center font-bold">
              {rideRequest.vehicleType === 'bike' ? (
                <Bike className="w-6 h-6" />
              ) : (
                <Car className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Vehicle Type
              </span>
              <span className="text-base font-extrabold text-slate-900 capitalize">
                CabGo {rideRequest.vehicleType}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Fare
            </span>
            <span className="text-2xl font-black text-slate-900">
              Rs. {rideRequest.fare}
            </span>
          </div>
        </div>

        {/* Passenger Info */}
        {rideRequest.user && (
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
              {rideRequest.user.fullname?.firstname?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-bold text-slate-800">
                {rideRequest.user.fullname?.firstname} {rideRequest.user.fullname?.lastname || ''}
              </p>
              <p className="text-slate-400 text-[11px]">Passenger</p>
            </div>
          </div>
        )}

        {/* Route Details */}
        <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <span className="text-slate-400 font-semibold block">Pickup Location</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {rideRequest.pickup}
              </p>
            </div>
          </div>

          <div className="ml-1.5 border-l-2 border-dashed border-slate-300 h-4" />

          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 mt-1 shrink-0" />
            <div>
              <span className="text-slate-400 font-semibold block">Dropoff Destination</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {rideRequest.destination}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={isAccepting}
            className="border-slate-300 text-slate-700"
          >
            Decline
          </Button>
          <Button
            variant="primary"
            onClick={() => onAccept(rideRequest._id)}
            isLoading={isAccepting}
          >
            Accept Ride
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NewRideModal;
