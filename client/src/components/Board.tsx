import Cell from "./Cell";

interface Props {
  board: string[][];
  gameResult: string | null;
  onUpdateBoard: (rowIndex: number, colIndex: number) => void;
}

const Board: React.FC<Props> = ({ board, gameResult, onUpdateBoard }) => {
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (board[rowIndex][colIndex] || gameResult) {
      return;
    }
    onUpdateBoard(rowIndex, colIndex);
  };

  return (
    <div className="grid grid-cols-4 gap-1">
      {board.map((row, rowIndex) =>
        row.map((color, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            color={color}
            onClick={() => handleCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default Board;
