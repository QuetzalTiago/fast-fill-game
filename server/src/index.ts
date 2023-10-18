import express from "express";
import http from "http";
import { Server } from "socket.io";
import {
  assignColor,
  checkGameResult,
  getWinnerOnDisconnect,
  resetGameState,
  initialGameState,
} from "./utils/game";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let gameState = initialGameState;

const lastInteractionTime = new Map<string, number>();

let timerInterval: NodeJS.Timeout;

const startGameInterval = () => {
  timerInterval = setInterval(() => {
    gameState.timer++;
    io.emit("timerUpdate", gameState.timer);
  }, 1000);
};

const maxIdleTime = 5 * 60 * 1000; // 5 minutes

// Check for idle players
setInterval(() => {
  const now = Date.now();
  for (const [socketId, lastTime] of lastInteractionTime) {
    if (now - lastTime > maxIdleTime) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
      }
      lastInteractionTime.delete(socketId);
    }
  }
}, 60 * 1000);

io.on("connection", (socket) => {
  socket.emit("currentBoard", gameState.board);

  if (gameState.players.size < 2) {
    const assignedColor = assignColor(gameState);

    if (assignedColor) {
      gameState.players.set(socket.id, assignedColor);
      socket.emit("assignedColor", assignedColor);

      if (gameState.players.size === 2 && !gameState.result) {
        startGameInterval();
      }

      const result = checkGameResult(gameState.board);
      if (result) {
        io.emit("gameResult", result);
        io.emit("timerUpdate", gameState.timer);
      }
    }
  }

  socket.on("squareClicked", (row: number, col: number) => {
    lastInteractionTime.set(socket.id, Date.now());
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
  });

  socket.on("resetGame", () => {
    lastInteractionTime.set(socket.id, Date.now());
    if (gameState.players.has(socket.id)) {
      gameState = resetGameState(gameState);

      io.emit("currentBoard", gameState.board);
      io.emit("timerUpdate", gameState.timer);
      io.emit("gameResult", gameState.result);
      if (gameState.players.size == 2) {
        startGameInterval();
      }
    }
  });

  socket.on("disconnect", () => {
    const disconnectedPlayerColor = gameState.players.get(socket.id);

    if (disconnectedPlayerColor) {
      if (!gameState.result) {
        const winnerColor = getWinnerOnDisconnect(disconnectedPlayerColor);
        if (winnerColor) {
          gameState.result = winnerColor;
          io.emit("gameResult", winnerColor);
        }
      }
    }
    gameState.players.delete(socket.id);

    if (gameState.players.size === 0) {
      clearInterval(timerInterval);
      gameState = resetGameState(gameState);
    }
  });
});

server.listen(3001, () => {
  console.log("Listening on *:3001");
});
