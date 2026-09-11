import React, { useState, useEffect } from 'react';
import {
  Wallet,
  PlusCircle,
  History,
  AlertTriangle,
  Gift,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import Button from '../common/Button';
import WalletRechargeModal from './WalletRechargeModal';
import WalletLedgerModal from './WalletLedgerModal';
import { getCaptainWallet } from '../../api/captainApi';

const CaptainWalletCard = ({ verificationStatus }) => {
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);

  const fetchWallet = async () => {
    try {
      const data = await getCaptainWallet();
      setWallet(data);
    } catch (err) {
      console.warn('Failed to load wallet:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleRechargeSuccess = () => {
    fetchWallet();
  };

  const isLowBalance = (wallet?.availableBalance ?? 0) < 150 && (wallet?.freeRidesRemaining ?? 0) === 0;

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Prepaid Commission Wallet
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowLedgerModal(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Ledger</span>
        </button>
      </div>

      {/* Balance Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1 relative z-10">
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Available to Ride
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            Rs. {wallet?.availableBalance ?? 0}
          </div>
          {wallet?.walletReserve > 0 && (
            <span className="text-[10px] text-amber-300/80 mt-1 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Rs. {wallet.walletReserve} in active ride reserve
            </span>
          )}
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Prepaid Balance
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white">
            Rs. {wallet?.walletBalance ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Deducted on completed cash trips
          </span>
        </div>
      </div>

      {/* Promotional Rule Banner: First 5 Completed Rides Free */}
      {wallet?.freeRidesRemaining > 0 ? (
        <div className="p-3.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-transparent border border-amber-500/30 rounded-2xl relative z-10 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
            <Gift className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                New Captain Bonus Active
              </span>
              <span className="text-[10px] font-bold bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30">
                0% Commission
              </span>
            </div>
            <p className="text-xs text-slate-200">
              Completed <strong>{wallet.completedRidesCount} / {wallet.promotionalTotal}</strong> rides.
              You have <span className="font-bold text-amber-300">{wallet.freeRidesRemaining} commission-free ride{wallet.freeRidesRemaining > 1 ? 's' : ''} remaining!</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/40 text-xs text-slate-400 flex items-center justify-between relative z-10">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Introductory 5 free rides completed
          </span>
          <span className="font-bold text-slate-300">
            {wallet?.commissionRate || 10}% Commission
          </span>
        </div>
      )}

      {/* Low Balance Warning Banner */}
      {isLowBalance && (
        <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5 relative z-10">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-rose-200 font-bold">Low Wallet Balance</strong>
            Your available balance is below Rs. 150. Recharge now to ensure you can accept incoming ride requests without interruption.
          </div>
        </div>
      )}

      {/* Recharge Button */}
      <div className="pt-1 relative z-10">
        <button
          type="button"
          onClick={() => setShowRechargeModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Top-Up Prepaid Balance</span>
        </button>
      </div>

      {/* Modals */}
      <WalletRechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        onRechargeSuccess={handleRechargeSuccess}
      />

      <WalletLedgerModal
        isOpen={showLedgerModal}
        onClose={() => setShowLedgerModal(false)}
      />
    </div>
  );
};

export default CaptainWalletCard;
