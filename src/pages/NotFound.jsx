import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 mb-6 shadow-xl">
        <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
      </div>

      <span className="text-sm font-bold uppercase tracking-widest text-cabgo-500 mb-2">
        404 Route Not Found
      </span>

      <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
        Looks like you took a wrong turn!
      </h1>

      <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
        The destination you are trying to reach doesn't exist or has been moved. Let's get you back on the main road.
      </p>

      <Link to="/">
        <Button variant="primary" size="lg" icon={ArrowLeft}>
          Back to Safety (Home)
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
