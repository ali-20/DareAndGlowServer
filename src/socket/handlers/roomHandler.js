import {
  createRoom,
  getRoom,
  joinRoom,
  switchTurn,
} from "../../services/roomService.js";
import { safeEmit } from "../../services/utils.js";

/**
 * Handles all room-related socket events
 */
export const handleRoomEvents = (io, socket) => {
  /**
   * Create a new game room
   */
  socket.on("create_room", (payload = {}, ack) => {
    const { displayName } = payload;
    const name = displayName || "Host";

   

    const room = createRoom(socket.id, name);
    socket.join(socket.id);

   

    // Notify creator that room is created
    safeEmit(socket, "room_created", {
      roomId: socket.id,
      players: room.players,
    });

    ack?.({ ok: true, roomId: socket.id, players: room.players });
    
  });

  /**
   * Join an existing game room
   */
  socket.on("join_room", (payload = {}, ack) => {
    const { roomId, displayName } = payload;
    const name = displayName || "Guest";

   

    const player = { id: socket.id, name };
    const room = joinRoom(roomId, player);

    if (!room) {
     
      return ack?.({ ok: false, error: "room_not_found" });
    }

    socket.join(roomId);

    
   

    // Notify everyone in the room that a new player joined
    io.to(roomId).emit("player_joined", { players: room.players });
   

    // If two players are in the room, notify that the room is ready
    if (room.players.length === 2) {
      io.to(roomId).emit("game_start", { currentTurn: room.currentTurn });
      
    }

    ack?.({ ok: true, roomId, players: room.players });
   
  });

  socket.on("player_rolled", (payload = {}, ack) => {
    const { roomId, rolledNumber } = payload;

    // const room = switchTurn(roomId, socket.id);
    const room = getRoom(roomId);

    if (!room) {
     
      return ack?.({ ok: false, error: "room_not_found" });
    }

   

    // Notify everyone in the room that a new player joined
    io.to(roomId).emit("opponent_rolled", {
      rolledNumber: rolledNumber,
      // currentTurn: room.currentTurn,
    });

    ack?.({ ok: true, roomId, players: room.players });
   
  });

  socket.on("turn_switched", (payload = {}, ack) => {
    const { roomId } = payload;

    const room = switchTurn(roomId, socket.id);

    if (!room) {
      
      return ack?.({ ok: false, error: "room_not_found" });
    }

  

    // Notify everyone in the room that a new player joined
    io.to(roomId).emit("turn_switched", {
      currentTurn: room.currentTurn,
    });

    ack?.({ ok: true, roomId, players: room.players });
   
  });
};
