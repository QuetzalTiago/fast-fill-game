interface Props {
  elapsedTime: number;
}

const Timer: React.FC<Props> = ({ elapsedTime }) => {
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  return (
    <div className="text-xl font-bold mt-4">
      {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
};

export default Timer;
