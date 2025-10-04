const rooms = new Map();
import _ from 'lodash'
export const createRoom = (socketId, displayName) => {
  const room = {
    hostId: socketId,
    players: [{ id: socketId, name: displayName || "Host" }],
    createdAt: Date.now(),
    currentTurn: socketId,
  };
  rooms.set(socketId, room);
  return room;
};

export const getRoom = (roomId) => rooms.get(roomId);

export const joinRoom = (roomId, player) => {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.players.push(player);
  return room;
};

export const leaveRoom = (roomId, socketId) => {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.players = room.players.filter((p) => p.id !== socketId);
  if (room.players.length === 0) rooms.delete(roomId);
  return room;
};

export const switchTurn = (roomId, socketId) => {
   
  const room = _.cloneDeep(rooms.get(roomId));
  if (!room) return null;
  const otherPlayer =  room.players.find((p) => p.id != socketId);
  room.currentTurn = otherPlayer.id;
  rooms.set(roomId,room)
 
  return room;
};

export const getAllRooms = () =>
  Array.from(rooms.entries()).map(([id, r]) => ({ roomId: id, ...r }));
