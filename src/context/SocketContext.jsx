import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const SocketProvider = ({ children }) => {
  const { user, captain, role, isAuthenticated } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect when user or captain is authenticated
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id);
      setIsConnected(true);

      const userId = role === 'captain' ? captain?._id : user?._id;
      if (userId && role) {
        newSocket.emit('join', {
          userId,
          userType: role, // 'user' | 'captain'
        });
        console.log(`📡 Emitted join for ${role} ${userId}`);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?._id, captain?._id, role]);

  // Helper to send live location
  const emitLocationUpdate = (location) => {
    if (!socket || !isConnected) return;
    const userId = role === 'captain' ? captain?._id : user?._id;
    if (!userId || !location?.lat || !location?.lng) return;

    if (role === 'captain') {
      socket.emit('update-location-captain', { userId, location });
    } else if (role === 'user') {
      socket.emit('update-location-user', { userId, location });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, emitLocationUpdate }}>
      {children}
    </SocketContext.Provider>
  );
};
