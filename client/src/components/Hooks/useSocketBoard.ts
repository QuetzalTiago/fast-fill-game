import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

const useSocketBoard = () => {
  const [board, setBoard] = useState<string[][]>([]);
  const [color, setColor] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [gameResult, setGameResult] = useState<string | null>(null);

  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io(SERVER_URL);

    socketRef.current.on("currentBoard", (receivedBoard: string[][]) => {
      setBoard(receivedBoard);
    });

    socketRef.current.on("assignedColor", (assignedColor: string) => {
      setColor(assignedColor);
    });

    socketRef.current.on("boardUpdate", (updatedBoard: string[][]) => {
      setBoard(updatedBoard);
    });

    socketRef.current.on("timerUpdate", (updatedTime: number) => {
      setTimer(updatedTime);
    });

    socketRef.current.on("gameResult", (result: string) => {
      setGameResult(result);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const updateBoard = useCallback((row: number, col: number) => {
    if (socketRef.current) {
      socketRef.current.emit("squareClicked", row, col);
    }
  }, []);

  const resetGame = () => {
    if (socketRef.current) {
      socketRef.current.emit("resetGame");
    }
  };

  return {
    board,
    color,
    updateBoard,
    timer,
    resetGame,
    gameResult,
  };
};

export default useSocketBoard;
