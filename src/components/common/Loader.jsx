import React from 'react';
import { Car } from 'lucide-react';

export const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div className="relative">
        <div
          className={`${sizes[size]} rounded-full border-4 border-slate-200 border-t-cabgo-500 animate-spin`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Car className="w-4 h-4 text-cabgo-600 animate-pulse" />
        </div>
      </div>
      {text && <p className="text-xs font-medium text-slate-500 tracking-wide">{text}</p>}
    </div>
  );
};

export const FullScreenLoader = ({ text = 'Starting your CabGo experience...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-cabgo-500 animate-spin" />
        <div className="absolute flex items-center justify-center">
          <span className="text-2xl font-black tracking-tight text-white">
            Cab<span className="text-cabgo-500">Go</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
        <span className="w-2 h-2 rounded-full bg-cabgo-500 animate-ping" />
        <p>{text}</p>
      </div>
    </div>
  );
};

export const Skeleton = ({ className = '' }) => {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
};

export default Loader;
