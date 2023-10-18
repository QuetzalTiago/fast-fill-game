interface ScoreProps {
  board: string[][];
  userColor: string | null;
}

const Score: React.FC<ScoreProps> = ({ board, userColor }) => {
  const redCount = board.flat().filter((cell) => cell === "red").length;
  const blueCount = board.flat().filter((cell) => cell === "blue").length;

  return (
    <div className="flex mt-4 space-x-4">
      <div className={`text-red-500 ${userColor === "red" ? "underline" : ""}`}>
        Red: {redCount}
      </div>
      <div
        className={`text-blue-500 ${userColor === "blue" ? "underline" : ""}`}
      >
        Blue: {blueCount}
      </div>
    </div>
  );
};

export default Score;
