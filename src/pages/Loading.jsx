import React from 'react';
import { Car } from 'lucide-react';

const Loading = ({ message = 'Connecting to CabGo...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
      <div className="relative flex items-center justify-center mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-cabgo-500 animate-spin" />
        <div className="absolute flex flex-col items-center justify-center">
          <Car className="w-8 h-8 text-cabgo-400 animate-bounce" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Cab<span className="text-cabgo-500">Go</span>
        </h2>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-cabgo-500 animate-ping" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
};

export default Loading;



