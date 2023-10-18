interface Props {
  color: string;
  onClick: () => void;
}

const Cell: React.FC<Props> = ({ color, onClick }) => {
  let bgColor = "";
  if (color === "red") {
    bgColor = "bg-red-500";
  } else if (color === "blue") {
    bgColor = "bg-blue-500";
  }

  return (
    <div
      onClick={onClick}
      className={`w-16 h-16 border-gray-400 border ${bgColor} active:opacity-70 cursor-pointer`}
    />
  );
};

export default Cell;
