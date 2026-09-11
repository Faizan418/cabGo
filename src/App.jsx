import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CaptainLogin from './pages/CaptainLogin';
import CaptainRegister from './pages/CaptainRegister';
import UserDashboard from './pages/UserDashboard';
import CaptainDashboard from './pages/CaptainDashboard';
import CaptainProfile from './pages/CaptainProfile';
import Profile from './pages/Profile';
import RideHistory from './pages/RideHistory';
import ForgotPassword from './pages/ForgotPassword';
import Loading from './pages/Loading';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          {/* Public Landing & Info */}
          <Route path="/" element={<Home />} />
          <Route path="/loading" element={<Loading />} />

          {/* User Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password/user" element={<ForgotPassword userType="user" />} />

          {/* Captain Auth Routes */}
          <Route path="/captain/login" element={<CaptainLogin />} />
          <Route path="/captain/register" element={<CaptainRegister />} />
          <Route path="/forgot-password/captain" element={<ForgotPassword userType="captain" />} />

          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="user">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rides"
            element={
              <ProtectedRoute requiredRole="user">
                <RideHistory />
              </ProtectedRoute>
            }
          />

          {/* Protected Captain Routes */}
          <Route
            path="/captain/dashboard"
            element={
              <ProtectedRoute requiredRole="captain">
                <CaptainDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/captain/profile"
            element={
              <ProtectedRoute requiredRole="captain">
                <CaptainProfile />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
