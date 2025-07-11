
interface Player {
  id: string;
  name: string;
  score: number;
  character: string;
}

interface GameStatusProps {
  leader: Player | undefined;
  highestScore: number;
}

const GameStatus = ({ leader, highestScore }: GameStatusProps) => {
  if (highestScore === 0) return null;

  return (
    <div className="bg-gray-100 border-green-600 border-8 rounded-3xl p-4 text-center shadow-2xl drop-shadow-lg">
      <p className="text-primary font-semibold">
        {leader?.name} is leading with {highestScore} bitcoins mined!
      </p>
    </div>
  );
};

export default GameStatus;
