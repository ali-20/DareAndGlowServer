import { handleRoomEvents } from './roomHandler.js';
// import { handleGameEvents } from './gameHandler.js';
import { leaveRoom } from '../../services/roomService.js';


export const handleConnection = (io, socket) => {
console.log(`Socket connected: ${socket.id}`);


handleRoomEvents(io, socket);
// handleGameEvents(io, socket);


socket.on('disconnect', () => {
console.log(`Socket disconnected: ${socket.id}`);
// remove player from any room they were in
for (const [roomId] of io.sockets.adapter.rooms) {
leaveRoom(roomId, socket.id);
io.to(roomId).emit('player_left', { id: socket.id });
}
});
};