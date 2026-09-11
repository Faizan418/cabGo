import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { Wallet, CheckCircle2, CreditCard, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { createRechargeIntent, confirmRecharge } from '../../api/captainApi';

const presetAmounts = [500, 1000, 2000, 5000];

const WalletRechargeModal = ({ isOpen, onClose, onRechargeSuccess }) => {
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [provider, setProvider] = useState('EasyPaisa / JazzCash');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const activeAmount = customAmount ? Number(customAmount) : amount;

  const handleSelectPreset = (val) => {
    setAmount(val);
    setCustomAmount('');
    setError('');
  };

  const handleCustomChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    setError('');
  };

  const handleSubmitRecharge = async (e) => {
    e.preventDefault();
    setError('');

    if (!activeAmount || activeAmount < 100) {
      setError('Minimum recharge amount is Rs. 100');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create payment intent on backend
      const intent = await createRechargeIntent(activeAmount);

      // 2. Confirm payment transaction
      const res = await confirmRecharge({
        amount: activeAmount,
        paymentReference: intent.paymentReference,
        provider,
      });

      setSuccessData(res);
      if (onRechargeSuccess) {
        onRechargeSuccess(res);
      }
    } catch (err) {
      setError(err.message || 'Recharge failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessData(null);
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={successData ? 'Recharge Successful!' : 'Recharge Commission Wallet'}
    >
      {successData ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">
              Rs. {successData.amount} Added!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your prepaid commission balance has been updated immediately.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">New Wallet Balance</span>
              <span className="font-bold text-slate-900">Rs. {successData.balanceAfter}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Payment Reference</span>
              <span className="font-mono text-slate-700">{successData.transaction?.paymentReference || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Channel</span>
              <span className="font-semibold text-slate-800">{provider}</span>
            </div>
          </div>

          <Button variant="primary" fullWidth size="lg" onClick={handleClose}>
            Done & Return to Dashboard
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmitRecharge} className="space-y-4">
          <ErrorMessage message={error} onDismiss={() => setError('')} />

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block">Prepaid Commission Balance:</strong>
              When riders pay you in cash, CabGo's platform commission is deducted automatically from this balance.
            </div>
          </div>

          {/* Preset Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Recharge Amount
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectPreset(amt)}
                  className={`py-3 px-2 rounded-xl text-center font-bold text-sm border-2 transition-all cursor-pointer select-none ${
                    !customAmount && amount === amt
                      ? 'border-amber-500 bg-amber-50 text-slate-900 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  Rs. {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Or Custom Amount (PKR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                Rs.
              </span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Enter amount (min Rs. 100)"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'EasyPaisa / JazzCash', label: 'Mobile Wallet (JazzCash/EasyPaisa)' },
                { id: 'Debit / Credit Card', label: 'Bank Card / Transfer' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setProvider(m.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    provider === m.id
                      ? 'border-amber-500 bg-amber-50/70 text-slate-900 shadow-sm'
                      : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1 text-slate-500" />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
              className="font-bold"
            >
              Recharge Rs. {activeAmount || 0}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default WalletRechargeModal;
