import api from './axios';

// ================= USER AUTH =================

export const registerUser = async ({ firstname, lastname, email, password, phone, cnic }) => {
  const response = await api.post('/users/register', {
    fullname: {
      firstname,
      lastname: lastname || undefined,
    },
    email,
    password,
    phone,
    cnic,
  });
  return response.data; // { token, user }
};

export const loginUser = async ({ email, password }) => {
  const response = await api.post('/users/login', {
    email,
    password,
  });
  return response.data; // { token, user }
};

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data; // { user }
};

export const logoutUser = async () => {
  const response = await api.get('/users/logout');
  return response.data; // { message }
};

export const getUserRideHistory = async ({ status, page = 1, limit = 10 } = {}) => {
  const params = { page, limit };
  if (status && status !== 'all') {
    params.status = status;
  }
  const response = await api.get('/users/ride-history', { params });
  return response.data; // { rides, pagination: { total, page, limit, pages } }
};

// ================= CAPTAIN AUTH =================

export const registerCaptain = async ({
  firstname,
  lastname,
  email,
  password,
  phone,
  cnic,
  drivingLicense,
  vehicleColor,
  vehiclePlate,
  vehicleCapacity,
  vehicleType,
  vehicleMake,
  vehicleModel,
  vehicleYear,
}) => {
  const response = await api.post('/captains/register', {
    fullname: {
      firstname,
      lastname: lastname || undefined,
    },
    email,
    password,
    phone,
    cnic,
    drivingLicense,
    vehicle: {
      color: vehicleColor,
      plate: vehiclePlate,
      capacity: Number(vehicleCapacity),
      vehicleType,
      make: vehicleMake || undefined,
      model: vehicleModel || undefined,
      year: vehicleYear ? Number(vehicleYear) : undefined,
    },
  });
  return response.data; // { token, captain, message }
};

export const loginCaptain = async ({ email, password }) => {
  const response = await api.post('/captains/login', {
    email,
    password,
  });
  return response.data; // { token, captain }
};

export const getCaptainProfile = async () => {
  const response = await api.get('/captains/profile');
  return response.data; // { captain }
};

export const logoutCaptain = async () => {
  const response = await api.get('/captains/logout');
  return response.data; // { message }
};

// ================= PASSWORD RESET =================

export const sendUserResetOtp = async ({ email }) => {
  const response = await api.post('/users/forgot-password', { email });
  return response.data; // { message }
};

export const verifyUserResetOtp = async ({ email, otp }) => {
  const response = await api.post('/users/verify-reset-otp', { email, otp });
  return response.data; // { message, resetToken }
};

export const resetUserPassword = async ({ resetToken, newPassword, confirmPassword }) => {
  const response = await api.post('/users/reset-password', {
    resetToken,
    newPassword,
    confirmPassword,
  });
  return response.data; // { message }
};

export const sendCaptainResetOtp = async ({ email }) => {
  const response = await api.post('/captains/forgot-password', { email });
  return response.data; // { message }
};

export const verifyCaptainResetOtp = async ({ email, otp }) => {
  const response = await api.post('/captains/verify-reset-otp', { email, otp });
  return response.data; // { message, resetToken }
};

export const resetCaptainPassword = async ({ resetToken, newPassword, confirmPassword }) => {
  const response = await api.post('/captains/reset-password', {
    resetToken,
    newPassword,
    confirmPassword,
  });
  return response.data; // { message }
};
