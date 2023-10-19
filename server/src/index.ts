import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import {
  assignColor,
  checkGameResult,
  getWinnerOnDisconnect,
  resetGameState,
  initialGameState,
} from "./utils/game";

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [process.env.CLIENT_URL || "http://localhost:3000"];

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const MAX_PLAYERS = 2;
const MAX_IDLE_TIME = 5 * 60 * 1000; // 5 minutes
const IDLE_CHECK_INTERVAL = 60 * 1000; // 1 minute
const PORT = process.env.PORT || 3001;

let gameState = initialGameState;

const lastInteractionTime = new Map<string, number>();

let timerInterval: NodeJS.Timeout;

const startGameInterval = () => {
  timerInterval && clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    gameState.timer++;
    io.emit("timerUpdate", gameState.timer);
  }, 1000);
};

// Check for idle players
setInterval(() => {
  const now = Date.now();
  for (const [socketId, lastTime] of lastInteractionTime.entries()) {
    if (now - lastTime > MAX_IDLE_TIME) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
      }
      lastInteractionTime.delete(socketId);
    }
  }
}, IDLE_CHECK_INTERVAL);

io.on("connection", (socket) => {
  try {
    handleNewConnection(socket);
  } catch (error) {
    console.error("Error handling new connection:", error);
  }
});

const handleNewConnection = (socket: Socket) => {
  socket.emit("boardUpdate", gameState.board);

  if (gameState.players.size < MAX_PLAYERS) {
    handleStartGame(socket);
  }
  socket.on("squareClicked", (row, col) => {
    try {
      handleSquareClicked(socket, row, col);
      lastInteractionTime.set(socket.id, Date.now());
    } catch (error) {
      console.error("Error handling square click:", error);
    }
  });

  socket.on("resetGame", () => {
    try {
      handleResetGame(socket);
      lastInteractionTime.set(socket.id, Date.now());
    } catch (error) {
      console.error("Error resetting the game:", error);
    }
  });

  socket.on("disconnect", () => {
    try {
      handleDisconnect(socket);
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
};

const handleStartGame = (socket: Socket) => {
  const assignedColor = assignColor(gameState);

  if (assignedColor) {
    gameState.players.set(socket.id, assignedColor);
    socket.emit("assignedColor", assignedColor);

    if (gameState.players.size === 2 && !gameState.result) {
      startGameInterval();
    }
  }
};

const handleSquareClicked = (socket: Socket, row: number, col: number) => {
  const playerColor = gameState.players.get(socket.id);

  if (gameState.board[row][col] === "" && playerColor) {
    gameState.board[row][col] = playerColor;
    io.emit("boardUpdate", gameState.board);

    const result = checkGameResult(gameState.board);
    if (result) {
      io.emit("gameResult", result);
      gameState.result = result;
      clearInterval(timerInterval);
    }
  }
};

const handleResetGame = (socket: Socket) => {
  if (gameState.players.has(socket.id)) {
    gameState = resetGameState(gameState);

    io.emit("boardUpdate", gameState.board);
    io.emit("timerUpdate", gameState.timer);
    io.emit("gameResult", gameState.result);
    if (gameState.players.size == 2) {
      startGameInterval();
    }
  }
};

const handleDisconnect = (socket: Socket) => {
  const disconnectedPlayerColor = gameState.players.get(socket.id);

  if (disconnectedPlayerColor) {
    if (!gameState.result) {
      const winnerColor = getWinnerOnDisconnect(disconnectedPlayerColor);
      if (winnerColor) {
        gameState.result = winnerColor;

        clearInterval(timerInterval);
        io.emit("gameResult", winnerColor);
      }
    }
  }
  gameState.players.delete(socket.id);

  if (gameState.players.size === 0) {
    gameState = resetGameState(gameState);
  }
};

server.listen(PORT, () => {
  console.log(`[SERVER] Listening on port ${PORT}`);
});
