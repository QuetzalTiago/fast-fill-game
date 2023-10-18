// Square.tsx
import React from "react";

export type SquareColor = "blue" | "red" | "empty";

export interface ISquare {
  color: SquareColor;
}

interface SquareProps {
  color: SquareColor;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ color, onClick }) => {
  return (
    <div
      className={`w-16 h-16 ${
        color !== "empty" ? `bg-${color}-500` : "bg-gray-200"
      } border`}
      onClick={onClick}
    ></div>
  );
};

export default Square;
