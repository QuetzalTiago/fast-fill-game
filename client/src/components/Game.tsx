/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React from "react";

// Components
import Board from "./Board";
import Timer from "./Timer";
import Score from "./Score";

// Hooks
import useSocketBoard from "./Hooks/useSocketBoard";

interface Props {}

const Game: React.FC<Props> = () => {
  const { board, gameResult, timer, playerColor, resetGame, updateBoard } =
    useSocketBoard();

  return (
    <div className="flex flex-col items-center mt-10">
      {board && (
        <>
          {!timer && (
            <div className="text-red-500 mb-4">Waiting for another player!</div>
          )}
          {timer !== 0 && !playerColor && (
            <div className="text-red-500 mb-4">
              Game is already in progress! Try again later.
            </div>
          )}
          <Board
            board={board}
            result={gameResult}
            onUpdateBoard={updateBoard}
            isActive={timer ? true : false}
          />
          <Timer elapsedTime={timer} />
          <Score board={board} playerColor={playerColor} />
          {gameResult && (
            <div className="mt-4 text-xl font-bold">
              {gameResult === playerColor && (
                <span className="text-green-500">You win!</span>
              )}
              {gameResult !== playerColor && gameResult !== "draw" && (
                <>
                  {gameResult === "red" && (
                    <span className="text-red-500">Red </span>
                  )}
                  {gameResult === "blue" && (
                    <span className="text-blue-500">Blue </span>
                  )}
                  wins!
                </>
              )}
              {gameResult === "draw" && (
                <span className="text-gray-500">It's a Draw!</span>
              )}
            </div>
          )}
          {gameResult && playerColor && (
            <button
              onClick={() => resetGame()}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Play Again
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Game;
