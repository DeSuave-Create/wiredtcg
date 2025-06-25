
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
    <div className="neon-border bg-card/50 p-4 rounded-lg text-center">
      <p className="text-primary font-semibold">
        {leader?.name} is leading with {highestScore} bitcoins mined!
      </p>
    </div>
  );
};

export default GameStatus;
