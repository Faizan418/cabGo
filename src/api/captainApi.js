import api from './axios';

// Toggle availability: 'active' | 'unactive'
export const toggleAvailability = async (status) => {
  const response = await api.patch('/captains/toggle-availability', { status });
  return response.data; // { message, captain }
};

// Get current active ride
export const getCurrentRide = async () => {
  const response = await api.get('/captains/current-ride');
  return response.data; // { ride } or { message, ride: null }
};

// Get earnings
export const getEarnings = async (period = 'today') => {
  const response = await api.get('/captains/earnings', {
    params: { period }, // 'today' | 'yesterday' | 'week' | 'month' | 'previous_month'
  });
  return response.data; // { period, totalEarnings, totalRides, startDate, endDate }
};

// Get Wallet Balance and Promotion Status
export const getCaptainWallet = async () => {
  const response = await api.get('/captains/wallet');
  return response.data;
};

// Get Wallet Ledger Transactions
export const getWalletTransactions = async ({ page = 1, limit = 10, type } = {}) => {
  const params = { page, limit };
  if (type) params.type = type;
  const response = await api.get('/captains/wallet/transactions', { params });
  return response.data; // { transactions, pagination }
};

// Create Recharge Payment Intent
export const createRechargeIntent = async (amount) => {
  const response = await api.post('/captains/wallet/recharge/create-intent', { amount });
  return response.data;
};

// Confirm Wallet Recharge
export const confirmRecharge = async ({ amount, paymentReference, provider }) => {
  const response = await api.post('/captains/wallet/recharge/confirm', {
    amount,
    paymentReference,
    provider,
  });
  return response.data;
};
