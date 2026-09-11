import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserRideHistory } from '../api/authApi';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  Car,
  Bike,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Route,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';

const statusFilters = [
  { id: 'all', label: 'All Rides' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'pending', label: 'Pending' },
];

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [currentFilter, setCurrentFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRides = async (status = currentFilter, page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getUserRideHistory({ status, page, limit: 10 });
      setRides(data.rides || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      setError(err.message || 'Unable to fetch ride history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRides(currentFilter, 1);
  }, [currentFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchRides(currentFilter, newPage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Trip Records
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              My Ride History
            </h1>
          </div>

          <Link to="/dashboard">
            <Button variant="primary" size="sm" icon={Plus}>
              Book New Ride
            </Button>
          </Link>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setCurrentFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                currentFilter === f.id
                  ? 'bg-slate-900 text-amber-400 shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ErrorMessage message={error} onDismiss={() => setError('')} />

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-md">
            <Loader text="Retrieving your ride history..." />
          </div>
        ) : rides.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center shadow-md border border-slate-200/80 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
              <Car className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">No rides yet</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                You haven't taken any trips under this category yet. Book your first ride with CabGo!
              </p>
            </div>
            <div className="pt-2">
              <Link to="/dashboard">
                <Button variant="primary" size="md">
                  Book Your First Ride
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Rides List */
          <div className="space-y-4">
            {rides.map((r) => {
              const dateStr = new Date(r.createdAt || Date.now()).toLocaleDateString(
                'en-US',
                {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              );

              return (
                <div
                  key={r._id}
                  className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200/80 space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                        {r.vehicleType === 'bike' ? (
                          <Bike className="w-4 h-4" />
                        ) : (
                          <Car className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-black text-sm text-slate-900 capitalize">
                          CabGo {r.vehicleType}
                        </span>
                        <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2">
                          {dateStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="text-base font-black text-slate-900">
                        Rs. {r.fare}
                      </span>
                      <span
                        className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          r.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : r.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-slate-400 font-semibold block">Pickup</span>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">
                          {r.pickup}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-slate-400 font-semibold block">Destination</span>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">
                          {r.destination}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Captain Info if Assigned */}
                  {r.captain && (
                    <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Captain:{' '}
                        <strong className="text-slate-800">
                          {r.captain.fullname?.firstname} {r.captain.fullname?.lastname || ''}
                        </strong>
                      </span>
                      {r.captain.vehicle?.plate && (
                        <span className="font-mono font-bold bg-slate-50 px-2 py-0.5 rounded border">
                          {r.captain.vehicle.plate}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <span className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total rides)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    icon={ChevronLeft}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    icon={ChevronRight}
                    iconPosition="right"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RideHistory;
