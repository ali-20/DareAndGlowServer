let gameState = {
  players: [],
  currentTurn: null
};

function addPlayer(socketId) {
  if (!gameState.players.includes(socketId)) {
    gameState.players.push(socketId);
    if (gameState.players.length === 2 && !gameState.currentTurn) {
      const random = Math.floor(Math.random() * 2);
      gameState.currentTurn = gameState.players[random];
    }
  }
}

function removePlayer(socketId) {
  gameState.players = gameState.players.filter(p => p !== socketId);
  if (gameState.players.length < 2) {
    gameState.currentTurn = null;
  }
}

function getOpponent(socketId) {
  return gameState.players.find(p => p !== socketId);
}

function getGame() {
  return gameState;
}

function setTurn(socketId) {
  gameState.currentTurn = socketId;
}

module.exports = { addPlayer, removePlayer, getGame, getOpponent, setTurn };
