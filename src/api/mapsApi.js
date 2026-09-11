import api from './axios';

export const getCoordinates = async (address) => {
  const response = await api.get('/maps/get-coordinates', {
    params: { address },
  });
  return response.data; // { lat, lng }
};

export const getDistanceTime = async (origin, destination) => {
  const response = await api.get('/maps/get-distance-time', {
    params: { origin, destination },
  });
  return response.data; // { distance: { text, value }, duration: { text, value }, status }
};

export const getSuggestions = async (input) => {
  if (!input || input.trim().length < 3) return [];
  const response = await api.get('/maps/get-suggestions', {
    params: { input },
  });
  return response.data; // Array of suggestion strings: ["Model Town, Lahore", ...]
};
