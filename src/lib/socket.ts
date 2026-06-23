import { io } from 'socket.io-client';

// Get the current hostname for dynamic connection
const hostname = window.location.hostname;

// Connect to the backend server
export const socket = io(`http://${hostname}:3000`, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Add error handling
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('connect', () => {
  console.log('Socket connected successfully');
});