import React from "react";

export interface ISquare {
  color: string;
}

interface SquareProps {
  color: string;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ color, onClick }) => {
  return (
    <div
      className={`w-16 h-16 ${
        color ? `bg-${color}-500` : "bg-gray-200"
      } border`}
      onClick={onClick}
    ></div>
  );
};

export default Square;
