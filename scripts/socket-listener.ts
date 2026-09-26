import { io } from 'socket.io-client';

const socket = io(process.env.API_URL || 'http://localhost:3000', { path: '/socket.io' });
socket.on('connect', () => console.log('connected', socket.id));
socket.on('slot.booked', (event) => console.log('slot.booked', event));
socket.on('slot.released', (event) => console.log('slot.released', event));
