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

    console.info(
      `[roomHandler][create_room] incoming -> socket=${socket.id}, displayName=${name}`
    );

    const room = createRoom(socket.id, name);
    socket.join(socket.id);

    console.info(
      `[roomHandler][create_room] room created -> roomId=${socket.id}, host=${socket.id}`
    );
    console.info(
      `[roomHandler][create_room] players: ${JSON.stringify(room.players)}`
    );

    // Notify creator that room is created
    safeEmit(socket, "room_created", {
      roomId: socket.id,
      players: room.players,
    });

    ack?.({ ok: true, roomId: socket.id, players: room.players });
    console.info(`[roomHandler][create_room] ack sent -> socket=${socket.id}`);
  });

  /**
   * Join an existing game room
   */
  socket.on("join_room", (payload = {}, ack) => {
    const { roomId, displayName } = payload;
    const name = displayName || "Guest";

    console.info(
      `[roomHandler][join_room] attempt -> socket=${socket.id}, displayName=${name}, roomId=${roomId}`
    );

    const player = { id: socket.id, name };
    const room = joinRoom(roomId, player);

    if (!room) {
      console.warn(
        `[roomHandler][join_room] failed -> room_not_found: roomId=${roomId}, socket=${socket.id}`
      );
      return ack?.({ ok: false, error: "room_not_found" });
    }

    socket.join(roomId);

    console.info(
      `[roomHandler][join_room] success -> socket=${socket.id} joined roomId=${roomId}`
    );
    console.info(
      `[roomHandler][join_room] players now: ${JSON.stringify(room.players)}`
    );

    // Notify everyone in the room that a new player joined
    io.to(roomId).emit("player_joined", { players: room.players });
    console.info(
      `[roomHandler][join_room] event emitted -> player_joined for roomId=${roomId}`
    );

    // If two players are in the room, notify that the room is ready
    if (room.players.length === 2) {
      io.to(roomId).emit("game_start", { currentTurn: room.currentTurn });
      console.info(
        `[roomHandler][join_room] event emitted -> game_start for roomId=${roomId}`
      );
    }

    ack?.({ ok: true, roomId, players: room.players });
    console.info(`[roomHandler][join_room] ack sent -> socket=${socket.id}`);
  });

  socket.on("player_rolled", (payload = {}, ack) => {
    const { roomId, rolledNumber } = payload;

    // const room = switchTurn(roomId, socket.id);
    const room = getRoom(roomId);

    if (!room) {
      console.warn(
        `[roomHandler][opponent_rolled] failed -> room_not_found: roomId=${roomId}, socket=${socket.id}`
      );
      return ack?.({ ok: false, error: "room_not_found" });
    }

    console.info(
      `[roomHandler][opponent_rolled] event emitted -> opponent_rolled for roomId=${roomId}`
    );

    // Notify everyone in the room that a new player joined
    io.to(roomId).emit("opponent_rolled", {
      rolledNumber: rolledNumber,
      // currentTurn: room.currentTurn,
    });

    ack?.({ ok: true, roomId, players: room.players });
    console.info(
      `[roomHandler][opponent_rolled] ack sent -> socket=${socket.id}`
    );
  });

  socket.on("turn_switched", (payload = {}, ack) => {
    const { roomId } = payload;

    const room = switchTurn(roomId, socket.id);

    if (!room) {
      console.warn(
        `[roomHandler][turn_switched] failed -> room_not_found: roomId=${roomId}, socket=${socket.id}`
      );
      return ack?.({ ok: false, error: "room_not_found" });
    }

    console.info(
      `[roomHandler][turn_switched] event emitted -> turn_switched for roomId=${roomId}`
    );

    // Notify everyone in the room that a new player joined
    io.to(roomId).emit("turn_switched", {
      currentTurn: room.currentTurn,
    });

    ack?.({ ok: true, roomId, players: room.players });
    console.info(
      `[roomHandler][turn_switched] ack sent -> socket=${socket.id}`
    );
  });
};
