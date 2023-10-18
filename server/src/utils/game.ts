export interface GameState {
  board: string[][];
  timer: number;
  players: Map<string, string>;
  result: string | null;
}

const getEmptyBoard = (): string[][] =>
  Array.from({ length: 4 }, () => Array(4).fill(""));

export const initialGameState: GameState = {
  board: getEmptyBoard(),
  timer: 0,
  players: new Map(),
  result: null,
};

export const checkGameResult = (board: string[][]): string | null => {
  const redCount = board.flat().filter((cell) => cell === "red").length;
  const blueCount = board.flat().filter((cell) => cell === "blue").length;

  if (redCount + blueCount === 16) {
    if (redCount > blueCount) return "red";
    if (blueCount > redCount) return "blue";
    return "draw";
  }

  return null;
};

export const assignColor = (gameState: GameState): string | null => {
  const isRedTaken = Array.from(gameState.players.values()).includes("red");
  const isBlueTaken = Array.from(gameState.players.values()).includes("blue");

  if (!isRedTaken) {
    return "red";
  } else if (!isBlueTaken) {
    return "blue";
  }

  return null;
};

export const resetGameState = (gameState: GameState): GameState => {
  return {
    ...gameState,
    board: getEmptyBoard(),
    timer: 0,
    result: null,
  };
};

export const getWinnerOnDisconnect = (
  disconnectedPlayerColor: string
): string | null => {
  if (disconnectedPlayerColor === "red") {
    return "blue";
  } else if (disconnectedPlayerColor === "blue") {
    return "red";
  }
  return null;
};
