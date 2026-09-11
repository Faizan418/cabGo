import React, { useState, useEffect } from 'react';
import { Banknote, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { getEarnings } from '../../api/captainApi';

const periods = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

const EarningsWidget = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [earningsData, setEarningsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEarnings = async (period) => {
    setIsLoading(true);
    try {
      const data = await getEarnings(period);
      setEarningsData(data);
    } catch (err) {
      console.warn('Earnings fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings(selectedPeriod);
  }, [selectedPeriod]);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cabgo-500/20 text-cabgo-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Captain Earnings
          </h3>
        </div>

        {/* Period Selector Chips */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
          {periods.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPeriod(p.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedPeriod === p.id
                  ? 'bg-cabgo-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-6 flex items-center justify-center text-slate-400 text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-cabgo-500" />
          <span>Calculating earnings...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Net Revenue
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              Rs. {earningsData?.totalEarnings || 0}
            </div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Completed Trips
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {earningsData?.totalRides || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsWidget;
