# 🚖 Cab Backend API Documentation

## Base URL

```text
http://localhost:4000
```

---

# 📌 Authentication Routes (Users)

| Method | Endpoint | Auth Required | Description |
|---------|----------|--------------|-------------|
| POST | `/users/register` | ❌ No | Register a new user |
| POST | `/users/login` | ❌ No | Login user |
| GET | `/users/profile` | ✅ User | Get logged-in user profile |
| GET | `/users/logout` | ✅ User | Logout user |
| GET | `/users/ride-history` | ✅ User | Get all rides of the logged-in user |
| POST | `/users/forgot-password` | ❌ No | Send 5-digit password reset OTP to user email |
| POST | `/users/verify-reset-otp` | ❌ No | Verify 5-digit OTP and get temporary reset token |
| POST | `/users/reset-password` | ❌ No | Reset user password using verified reset token |

---

# 🚕 Authentication Routes (Captains)

| Method | Endpoint | Auth Required | Description |
|---------|----------|--------------|-------------|
| POST | `/captains/register` | ❌ No | Register a new captain |
| POST | `/captains/login` | ❌ No | Login captain |
| GET | `/captains/profile` | ✅ Captain | Get captain profile |
| GET | `/captains/logout` | ✅ Captain | Logout captain |
| PATCH | `/captains/toggle-availability` | ✅ Captain | Toggle captain availability (Online / Offline) |
| GET | `/captains/current-ride` | ✅ Captain | Get captain's current ride |
| POST | `/captains/forgot-password` | ❌ No | Send 5-digit password reset OTP to captain email |
| POST | `/captains/verify-reset-otp` | ❌ No | Verify 5-digit OTP and get temporary reset token |
| POST | `/captains/reset-password` | ❌ No | Reset captain password using verified reset token |

---

# 🚗 Ride Routes

| Method | Endpoint | Auth Required | Description |
|---------|----------|--------------|-------------|
| POST | `/rides/create` | ✅ User | Create a new ride |
| GET | `/rides/get-fare` | ✅ User | Calculate ride fare |
| POST | `/rides/confirm` | ✅ Captain | Captain accepts ride |
| GET | `/rides/start-ride` | ✅ Captain | Start ride (OTP Verification) |
| POST | `/rides/end-ride` | ✅ Captain | Complete ride |
| POST | `/rides/arrive` | ✅ Captain | Mark captain as arrived |
| POST | `/rides/cancel` | ✅ User / Captain | Cancel ride |

---

# 🗺️ Maps Routes

| Method | Endpoint | Auth Required | Description |
|---------|----------|--------------|-------------|
| GET | `/maps/get-coordinates` | ✅ User | Convert address into coordinates |
| GET | `/maps/get-distance-time` | ✅ User | Get distance and estimated travel time |
| GET | `/maps/get-suggestions` | ✅ User | Get location autocomplete suggestions |

---

# 🔐 Authentication

Protected routes require a valid JWT token.

Example:

```http
Authorization: Bearer <your_jwt_token>
```

---

# 📋 HTTP Status Codes

| Status Code | Meaning |
|--------------|---------|
| 200 | Success |
| 201 | Resource Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

# 🚀 Project Modules

- 👤 User Authentication
- 🚖 Captain Authentication
- 🚗 Ride Management
- 📍 Google Maps Integration
- 💰 Fare Calculation
- 📌 Ride Tracking
- 🔐 JWT Authentication

---

# 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt
- Google Maps API
- Socket.io (Real-Time Ride Updates)

---

# 👨‍💻 API Flow

```text
User Register/Login
        
        ▼
Create Ride
        │
        ▼
Fare Calculation
        │
        ▼
Captain Accept Ride
        │
        ▼
Captain Arrives
        │
        ▼
OTP Verification
        │
        ▼
Ride Starts
        │
        ▼
Ride Ends
```

---

# 📬 Contact

If you have any questions regarding this API, feel free to contact the project maintainer.
