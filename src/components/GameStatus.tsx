
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
      <p className="text-primary font-semibold text-xl">
        <span className="text-blue-600">{leader?.name}</span> is leading with <span className="text-yellow-500">{highestScore}</span> bitcoins mined!
      </p>
    </div>
  );
};

export default GameStatus;
