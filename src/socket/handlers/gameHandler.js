const { getGame, getOpponent, setTurn } = require("../../services/gameService");

function gameHandler(io, socket) {
  // 🎲 When a player rolls the dice
  socket.on("player_rolled", ({ number }) => {
    const game = getGame();

    // Validate turn
    if (game.currentTurn !== socket.id) {
      socket.emit("error_message", { message: "Not your turn!" });
      return;
    }

    const opponent = getOpponent(socket.id);
    if (!opponent) return;

  

    // Send the rolled number to the opponent
    io.to(opponent).emit("opponent_rolled", { number });

    // Switch turn to the opponent
    setTurn(opponent);

    // Notify both players whose turn it is now
    io.to(socket.id).emit("turn_switched", { currentTurn: opponent });
    io.to(opponent).emit("turn_switched", { currentTurn: opponent });
  });
}

module.exports = gameHandler;
