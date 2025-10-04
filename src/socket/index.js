import { Server } from 'socket.io';
import { ALLOWED_ORIGIN } from '../config.js';
import { handleConnection } from './handlers/connectionHandler.js';


export const initSocketServer = (server) => {
const io = new Server(server, {
cors: {
origin: ALLOWED_ORIGIN,
methods: ['GET', 'POST'],
},
});


io.on('connection', (socket) => handleConnection(io, socket));


return io;
};