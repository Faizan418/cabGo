import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { getWalletTransactions } from '../../api/captainApi';
import {
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Unlock,
  RotateCcw,
  Loader2,
  Calendar
} from 'lucide-react';

const WalletLedgerModal = ({ isOpen, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLedger = async (targetPage = 1, type = null) => {
    setIsLoading(true);
    try {
      const res = await getWalletTransactions({
        page: targetPage,
        limit: 8,
        type: type && type !== 'ALL' ? type : undefined,
      });
      setTransactions(res.transactions || []);
      setTotalPages(res.pagination?.pages || 1);
      setPage(res.pagination?.page || 1);
    } catch (err) {
      console.warn('Fetch ledger error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLedger(1, filterType);
    }
  }, [isOpen, filterType]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'RECHARGE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
            <ArrowDownLeft className="w-3 h-3" /> Recharge
          </span>
        );
      case 'COMMISSION':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md">
            <ArrowUpRight className="w-3 h-3" /> Commission
          </span>
        );
      case 'RESERVE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
            <Lock className="w-3 h-3" /> Reserve
          </span>
        );
      case 'RELEASE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
            <Unlock className="w-3 h-3" /> Release
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md">
            {type}
          </span>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Commission Wallet Audit Ledger">
      <div className="space-y-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'RECHARGE', 'COMMISSION', 'RESERVE', 'RELEASE'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterType === t
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span>Loading ledger records...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs space-y-1">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">No transactions found</p>
            <p>Wallet transactions will appear here as rides are accepted and completed.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div
                key={tx._id}
                className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(tx.type)}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(tx.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 text-[11px]">
                    {tx.description || `Transaction #${tx._id.slice(-6)}`}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Balance: Rs. {tx.balanceBefore} → <strong>Rs. {tx.balanceAfter}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black text-sm block ${
                      tx.type === 'RECHARGE' || tx.type === 'RELEASE'
                        ? 'text-emerald-600'
                        : tx.type === 'COMMISSION'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {tx.type === 'COMMISSION' && '-'}
                    {tx.type === 'RECHARGE' && '+'}
                    Rs. {tx.amount}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => fetchLedger(page - 1, filterType)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page <strong>{page}</strong> of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => fetchLedger(page + 1, filterType)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default WalletLedgerModal;
