import React, { useState } from 'react';
import { Car, Bike, Check, Clock, Route, Users, ChevronDown, ChevronUp, Fuel } from 'lucide-react';

const vehicleOptions = [
  {
    type: 'bike',
    name: 'CabGo Moto',
    tagline: 'Fastest solo commute, bypass traffic',
    capacity: '1 Person',
    icon: Bike,
    speedNote: 'Fastest in traffic',
  },
  {
    type: 'auto',
    name: 'CabGo Auto',
    tagline: 'Pocket-friendly local rickshaw ride',
    capacity: '3 Persons',
    icon: Car,
    speedNote: 'Standard travel time',
  },
  {
    type: 'car',
    name: 'CabGo Comfort',
    tagline: 'Dedicated AC cab with trunk space',
    capacity: '4 Persons',
    icon: Car,
    speedNote: 'Comfort & climate control',
  },
];

const FareCard = ({
  fares,
  distanceTime,
  selectedVehicleType,
  onSelectVehicle,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!fares) return null;

  const selectedBreakdown = fares?.breakdowns?.[selectedVehicleType];

  return (
    <div className="space-y-4">
      {/* Route Stats Summary */}
      {distanceTime && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-cabgo-600" />
            <span>Distance: <strong className="text-slate-900">{distanceTime?.distance?.text || '--'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cabgo-600" />
            <span>Estimated Time: <strong className="text-slate-900">{distanceTime?.duration?.text || '--'}</strong></span>
          </div>
        </div>
      )}

      {/* Vehicle Options List */}
      <div className="space-y-2.5">
        {vehicleOptions.map((v) => {
          const isSelected = selectedVehicleType === v.type;
          const fareAmount = fares[v.type];
          const Icon = v.icon;

          return (
            <div
              key={v.type}
              onClick={() => onSelectVehicle(v.type)}
              className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
                isSelected
                  ? 'border-cabgo-500 bg-amber-50/40 shadow-md shadow-cabgo-500/10'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  {/* Vehicle Badge Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-cabgo-500 text-slate-950 font-bold'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{v.name}</h4>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Users className="w-3 h-3" />
                        {v.capacity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{v.tagline}</p>
                  </div>
                </div>

                {/* Price Tag & Check */}
                <div className="text-right shrink-0">
                  <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Rs. {fareAmount !== undefined ? fareAmount : '--'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Est. Fare
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-cabgo-500 text-slate-950 rounded-full flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Configurable Fare Breakdown Toggle */}
      {selectedBreakdown && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-600 space-y-2">
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-amber-600" />
              <span>Transparent Fare Breakdown</span>
            </span>
            {showBreakdown ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showBreakdown && (
            <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
              <div className="flex justify-between">
                <span>Base Flag-down Fare</span>
                <span className="font-semibold text-slate-900">Rs. {selectedBreakdown.baseFare}</span>
              </div>
              <div className="flex justify-between">
                <span>Distance Rate ({selectedBreakdown.distanceInKm} km)</span>
                <span className="font-semibold text-slate-900">Rs. {selectedBreakdown.distanceFare}</span>
              </div>
              <div className="flex justify-between">
                <span>Fuel Cost Factor</span>
                <span className="font-semibold text-slate-900">Rs. {selectedBreakdown.fuelSurcharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Booking & Platform Fee</span>
                <span className="font-semibold text-slate-900">Rs. {selectedBreakdown.bookingFee}</span>
              </div>
              {selectedBreakdown.surgeReason && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>{selectedBreakdown.surgeReason}</span>
                  <span>Active</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-200 font-black text-slate-900">
                <span>Total Estimated Fare</span>
                <span>Rs. {selectedBreakdown.totalFare}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FareCard;
