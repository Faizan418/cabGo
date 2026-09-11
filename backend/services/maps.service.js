// // services/maps.service.js

// const axios = require('axios');
// const captainModel = require('../models/captain.model');

// module.exports.getAddressCoordinate = async (address) => {
//     const apiKey = process.env.GOOGLE_MAPS_API;
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

//     try {
//         const response = await axios.get(url);
//         if (response.data.status === 'OK') {
//             const location = response.data.results[0].geometry.location;
//             return {
//                 lat: location.lat,
//                 lng: location.lng
//             };
//         } else {
//             throw new Error('Unable to fetch coordinates');
//         }
//     } catch (error) {
//         console.error(error);
//         throw error;
//     }
// };

// module.exports.getDistanceTime = async (origin, destination) => {
//     if (!origin || !destination) {
//         throw new Error('Origin and destination are required');
//     }

//     const apiKey = process.env.GOOGLE_MAPS_API;
//     const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

//     try {
//         const response = await axios.get(url);
//         if (response.data.status === 'OK') {
//             if (response.data.rows[0].elements[0].status === 'ZERO_RESULTS') {
//                 throw new Error('No routes found');
//             }
//             return response.data.rows[0].elements[0];
//         } else {
//             throw new Error('Unable to fetch distance and time');
//         }
//     } catch (err) {
//         console.error(err);
//         throw err;
//     }
// };

// module.exports.getAutoCompleteSuggestions = async (input) => {
//     if (!input) {
//         throw new Error('query is required');
//     }

//     const apiKey = process.env.GOOGLE_MAPS_API;
//     const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

//     try {
//         const response = await axios.get(url);
//         if (response.data.status === 'OK') {
//             return response.data.predictions
//                 .map(prediction => prediction.description)
//                 .filter(value => value);
//         } else {
//             throw new Error('Unable to fetch suggestions');
//         }
//     } catch (err) {
//         console.error(err);
//         throw err;
//     }
// };

// module.exports.getCaptainInTheRadius = async (lat, lng, radius) => {
//     const captains = await captainModel.find({
//         status: 'active',
//         location: {
//             $geoWithin: {
//                 $centerSphere: [[lng, lat], radius / 6371]
//             }
//         }
//     });
//     return captains;
// };

// services/maps.service.js

const captainModel = require('../models/captain.model');

// Fake coordinates for testing
const fakeLocations = {
  'lahore': { lat: 31.5204, lng: 74.3587 },
  'karachi': { lat: 24.8607, lng: 67.0011 },
  'islamabad': { lat: 33.6844, lng: 73.0479 },
  'rawalpindi': { lat: 33.5651, lng: 73.0169 },
  'faisalabad': { lat: 31.4504, lng: 73.1350 },
  'multan': { lat: 30.1575, lng: 71.5249 },
  'default': { lat: 31.5204, lng: 74.3587 }
};

function getFakeCoords(address = '') {
  const key = address.toLowerCase().trim();
  for (let city in fakeLocations) {
    if (key.includes(city)) {
      return fakeLocations[city];
    }
  }
  // Random slight variation for different addresses
  return {
    lat: 31.5204 + (Math.random() * 0.05),
    lng: 74.3587 + (Math.random() * 0.05)
  };
}

module.exports.getAddressCoordinate = async (address) => {
  console.log('📍 Using FAKE coordinates for:', address);
  return getFakeCoords(address);
};

module.exports.getDistanceTime = async (origin, destination) => {
  console.log('📏 Using FAKE distance/time for:', origin, '→', destination);

  // Fake distance between 3km to 15km
  const distanceInMeters = Math.floor(Math.random() * 12000) + 3000;
  const durationInSeconds = Math.floor(distanceInMeters / 8); // approx speed

  return {
    distance: {
      text: `${(distanceInMeters / 1000).toFixed(1)} km`,
      value: distanceInMeters
    },
    duration: {
      text: `${Math.floor(durationInSeconds / 60)} mins`,
      value: durationInSeconds
    },
    status: 'OK'
  };
};

module.exports.getAutoCompleteSuggestions = async (input) => {
  const suggestions = [
    `${input}, Lahore`,
    `${input}, Karachi`,
    `${input}, Islamabad`,
    `${input} Road, Lahore`,
    `${input} Market, Karachi`
  ];
  return suggestions;
};


module.exports.getCaptainInTheRadius = async (lat, lng, radius, vehicleType = null) => {
    console.log('🔍 Searching captains...');
    console.log('📍 Lat:', lat, 'Lng:', lng, 'Radius:', radius);
    console.log('🚗 VehicleType filter:', vehicleType);

    // Pehle saare active captains dekh lo (debug)
    const allActive = await captainModel.find({ status: 'active' });
    console.log('✅ Total active captains:', allActive.length);

    allActive.forEach((c) => {
        console.log('---');
        console.log('Name:', c.fullname?.firstname);
        console.log('VehicleType:', c.vehicle?.vehicleType);
        console.log('Location:', c.location?.coordinates);
        console.log('Status:', c.status);
    });

    const query = {
        status: 'active',
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius / 6371]
            }
        }
    };

    if (vehicleType) {
        query['vehicle.vehicleType'] = vehicleType;
    }

    const captains = await captainModel.find(query);
    console.log('🎯 Matching captains found:', captains.length);

    return captains;
};