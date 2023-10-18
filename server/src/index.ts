import express from "express";
import http from "http";
import { Server } from "socket.io";
import {
  assignColor,
  checkGameResult,
  getWinnerOnDisconnect,
  resetGameState,
} from "./utils/game";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

interface GameState {
  board: string[][];
  timer: number;
  players: Map<string, string>;
  result: string | null;
}

const getEmptyBoard = () => Array.from({ length: 4 }, () => Array(4).fill(""));

const initialGameState: GameState = {
  board: getEmptyBoard(),
  timer: 0,
  players: new Map(),
  result: null,
};

let gameState = initialGameState;

let timerInterval: NodeJS.Timeout;

const startGameInterval = () => {
  timerInterval = setInterval(() => {
    gameState.timer++;
    io.emit("timerUpdate", gameState.timer);
  }, 1000);
};

io.on("connection", (socket) => {
  console.log("A player joined the game");
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
    console.log("User disconnected");

    const disconnectedPlayerColor = gameState.players.get(socket.id);

    if (disconnectedPlayerColor) {
      if (!gameState.result) {
        const winnerColor = getWinnerOnDisconnect(disconnectedPlayerColor);
        if (winnerColor) {
          gameState.result = winnerColor;
          io.emit("gameResult", winnerColor);
        }
      }

      gameState.players.delete(socket.id);
    }

    clearInterval(timerInterval);

    if (gameState.players.size === 0) {
      gameState = resetGameState(gameState);
    }
  });

  console.log(gameState);
});

server.listen(3001, () => {
  console.log("Listening on *:3001");
});
