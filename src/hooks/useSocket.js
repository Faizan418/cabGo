import { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Hook to subscribe to a socket event and cleanup automatically
export const useSocketEvent = (eventName, handler) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !eventName || !handler) return;

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, eventName, handler]);
};
