interface ScoreProps {
  board: string[][];
  playerColor: string | null;
}

const Score: React.FC<ScoreProps> = ({ board, playerColor }) => {
  const redCount = board.flat().filter((cell) => cell === "red").length;
  const blueCount = board.flat().filter((cell) => cell === "blue").length;

  return (
    <div className="flex mt-4 space-x-4">
      <div
        className={`text-red-500 ${playerColor === "red" ? "underline" : ""}`}
      >
        Red: {redCount}
      </div>
      <div
        className={`text-blue-500 ${playerColor === "blue" ? "underline" : ""}`}
      >
        Blue: {blueCount}
      </div>
    </div>
  );
};

export default Score;
