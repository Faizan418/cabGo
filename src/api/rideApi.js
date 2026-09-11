import api from './axios';

// Get Fare Estimation for all vehicle types
export const getFare = async (pickup, destination) => {
  const response = await api.get('/rides/get-fare', {
    params: { pickup, destination },
  });
  return response.data; // { auto: number, car: number, bike: number }
};

// Create a new ride request
export const createRide = async ({ pickup, destination, vehicleType }) => {
  const response = await api.post('/rides/create', {
    pickup,
    destination,
    vehicleType,
  });
  return response.data; // ride object
};

// Captain confirms / accepts ride
export const confirmRide = async (rideId) => {
  const response = await api.post('/rides/confirm', { rideId });
  return response.data; // updated ride object
};

// Captain marks arrived at pickup
export const arriveRide = async (rideId) => {
  const response = await api.post('/rides/arrive', { rideId });
  return response.data; // updated ride object
};

// Captain starts ride with OTP
export const startRide = async (rideId, otp) => {
  const response = await api.get('/rides/start-ride', {
    params: { rideId, otp },
  });
  return response.data; // updated ride object
};

// Captain ends ride
export const endRide = async (rideId) => {
  const response = await api.post('/rides/end-ride', { rideId });
  return response.data; // { message, ride, paymentInfo }
};

// Cancel ride (User or Captain)
export const cancelRide = async (rideId, reason = '') => {
  const response = await api.post('/rides/cancel', {
    rideId,
    reason,
  });
  return response.data; // { message, ride }
};

// Captain confirms cash payment
export const confirmCashPayment = async (rideId) => {
  const response = await api.post('/rides/confirm-cash-payment', { rideId });
  return response.data; // { message, ride }
};
