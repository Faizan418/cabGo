// // socket.js

// const socketIo = require("socket.io");
// const userModel = require("./models/user.model");
// const captainModel = require("./models/captain.model");
// const rideModel = require("./models/ride.model");

// let io;

// function initializeSocket(server) {
//   io = socketIo(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log(`🟢 Client connected: ${socket.id}`);



// // socket.js — connection ke andar
// socket.on("update-location-user", async (data) => {
//   const { userId, location } = data;
//   if (!userId || !location?.lat || !location?.lng) return;

//   try {
//     await userModel.findByIdAndUpdate(userId, {
//       location: {
//         type: "Point",
//         coordinates: [location.lng, location.lat]
//       }
//     });

//     // Active ride pe captain ko bhejo
//     const ride = await rideModel.findOne({
//       user: userId,
//       status: { $in: ["accepted", "arriving", "arrived", "ongoing"] }
//     }).populate("captain");

//     if (ride?.captain?.socketId) {
//       sendMessageToSocketId(ride.captain.socketId, {
//         event: "user-location-update",
//         data: { location, rideId: ride._id }
//       });
//     }
//   } catch (err) {
//     console.log("User location error:", err.message);
//   }
// });





//     // =========================
//     // 🔹 JOIN EVENT
//     // =========================
//     socket.on("join", async (data) => {
//       const { userId, userType } = data;

//       if (!userId || !userType) {
//         console.log("❌ Invalid join data");
//         return;
//       }

//       try {
//         if (userType === "user") {
//           await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
//           console.log(`👤 User joined: ${userId} → ${socket.id}`);
//         }

//         if (userType === "captain") {
//           await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
//           console.log(`🚖 Captain joined: ${userId} → ${socket.id}`);
//         }
//       } catch (err) {
//         console.log("❌ Join error:", err.message);
//       }
//     });

//     // socket.js — connection ke andar
// socket.on("update-location-user", async (data) => {
//   const { userId, location } = data;
//   if (!userId || !location?.lat || !location?.lng) return;

//   try {
//     await userModel.findByIdAndUpdate(userId, {
//       location: {
//         type: "Point",
//         coordinates: [location.lng, location.lat]
//       }
//     });

//     // Active ride pe captain ko bhejo
//     const ride = await rideModel.findOne({
//       user: userId,
//       status: { $in: ["accepted", "arriving", "arrived", "ongoing"] }
//     }).populate("captain");

//     if (ride?.captain?.socketId) {
//       sendMessageToSocketId(ride.captain.socketId, {
//         event: "user-location-update",
//         data: { location, rideId: ride._id }
//       });
//     }
//   } catch (err) {
//     console.log("User location error:", err.message);
//   }
// });

//     // =========================
//     // 🔹 UPDATE CAPTAIN LOCATION + ARRIVAL DETECTION
//     // =========================
//     socket.on("update-location-captain", async (data) => {
//       const { userId, location } = data;

//       if (!userId || !location?.lat || !location?.lng) {
//         console.log("❌ Invalid location data");
//         return;
//       }

//       try {
//         // Update Captain Location
//         await captainModel.findByIdAndUpdate(userId, {
//           location: {
//             type: "Point",
//             coordinates: [location.lng, location.lat],
//           },
//         });

//         // Find Active Ride
//         const ride = await rideModel
//           .findOne({
//             captain: userId,
//             status: { $in: ["accepted", "arriving", "ongoing", "arrived"] },
//           })
//           .populate("user");

//         if (!ride) return;

//         // Send Live Location to User
//         if (ride.user?.socketId) {
//           sendMessageToSocketId(ride.user.socketId, {
//             event: "captain-location-update",
//             data: { location, rideId: ride._id }
//           });
//         }

//         // 🔥 Driver Arrival Detection
//         if (ride && ride.user && ride.pickupCoords) {
//           const captainLat = location.lat;
//           const captainLng = location.lng;

//           const userLat = ride.pickupCoords.lat;
//           const userLng = ride.pickupCoords.lng;

//           // Better distance calculation (approx)
//           const dx = captainLat - userLat;
//           const dy = captainLng - userLng;
//           const distance = Math.sqrt(dx * dx + dy * dy) * 111000; // meters

//           console.log(`📏 Distance to pickup: ${distance.toFixed(0)} meters`);

//           if (distance < 100 && ride.status !== "arrived") {
//             ride.status = "arrived";
//             await ride.save();

//             if (ride.user.socketId) {
//               sendMessageToSocketId(ride.user.socketId, {
//                 event: "driver-arrived",
//                 data: ride,
//               });
//             }

//             console.log(`🚗 Driver ARRIVED at pickup for ride ${ride._id}`);
//           }
//         }

//       } catch (err) {
//         console.log("❌ Location update error:", err.message);
//       }
//     });

//     // =========================
//     // 🔹 DISCONNECT
//     // =========================
//     socket.on("disconnect", async () => {
//       console.log(`🔴 Client disconnected: ${socket.id}`);

//       try {
//         await userModel.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
//         await captainModel.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
//       } catch (err) {
//         console.log("❌ Disconnect cleanup error:", err.message);
//       }
//     });
//   });
// }

// // =========================
// // 🔹 Helper Function
// // =========================
// function sendMessageToSocketId(socketId, messageObject) {
//   if (!io) {
//     console.log("❌ Socket.io not initialized");
//     return;
//   }
//   if (!socketId) return;

//   console.log(`📡 Sending ${messageObject.event} → ${socketId}`);
//   io.to(socketId).emit(messageObject.event, messageObject.data);
// }

// module.exports = { initializeSocket, sendMessageToSocketId };



// socket.js

const socketIo = require("socket.io");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");
const rideModel = require("./models/ride.model");

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🟢 Client connected: ${socket.id}`);

    // JOIN
    socket.on("join", async (data) => {
      const { userId, userType } = data;
      if (!userId || !userType) return;

      try {
        if (userType === "user") {
          await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
          console.log(`👤 User joined: ${userId} → ${socket.id}`);
        }
        if (userType === "captain") {
          await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
          console.log(`🚖 Captain joined: ${userId} → ${socket.id}`);
        }
      } catch (err) {
        console.log("❌ Join error:", err.message);
      }
    });

    // CAPTAIN LOCATION
    socket.on("update-location-captain", async (data) => {
      const { userId, location } = data;
      if (!userId || !location?.lat || !location?.lng) return;

      try {
        await captainModel.findByIdAndUpdate(userId, {
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat],
          },
        });

        // Active ride user ko location bhejo
        const ride = await rideModel
          .findOne({
            captain: userId,
            status: { $in: ["accepted", "arriving", "arrived", "ongoing"] },
          })
          .populate("user");

        if (ride?.user?.socketId) {
          sendMessageToSocketId(ride.user.socketId, {
            event: "captain-location-update",
            data: { location, rideId: ride._id },
          });
        }
      } catch (err) {
        console.log("❌ Captain location error:", err.message);
      }
    });

    // USER LOCATION
    socket.on("update-location-user", async (data) => {
      const { userId, location } = data;
      if (!userId || !location?.lat || !location?.lng) return;

      try {
        // Active ride captain ko location bhejo
        const ride = await rideModel
          .findOne({
            user: userId,
            status: { $in: ["accepted", "arriving", "arrived", "ongoing"] },
          })
          .populate("captain");

        if (ride?.captain?.socketId) {
          sendMessageToSocketId(ride.captain.socketId, {
            event: "user-location-update",
            data: { location, rideId: ride._id },
          });
        }
      } catch (err) {
        console.log("❌ User location error:", err.message);
      }
    });

    // DISCONNECT
    socket.on("disconnect", async () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
      try {
        await userModel.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
        await captainModel.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
      } catch (err) {
        console.log("❌ Disconnect cleanup error:", err.message);
      }
    });
  });
}

function sendMessageToSocketId(socketId, messageObject) {
  if (!io) {
    console.log("❌ Socket.io not initialized");
    return;
  }
  if (!socketId) return;

  console.log(`📡 Sending ${messageObject.event} → ${socketId}`);
  io.to(socketId).emit(messageObject.event, messageObject.data);
}

module.exports = { initializeSocket, sendMessageToSocketId };