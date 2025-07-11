
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
    <div className="relative overflow-hidden bg-gray-100 border-green-600 border-2 rounded-3xl p-4 text-center shadow-2xl drop-shadow-lg" style={{ backgroundColor: '#fffbef' }}>
      {/* Circuit board pattern background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 80% 20%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 20% 80%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 80% 80%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 50% 50%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
          linear-gradient(rgba(200, 200, 200, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200, 200, 200, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px, 40px 40px, 40px 40px, 40px 40px, 40px 40px, 20px 20px, 20px 20px'
      }}></div>
      
      <p className="text-primary font-semibold text-xl relative z-10">
        <span className="text-blue-600">{leader?.name}</span> is leading with <span className="text-yellow-500">{highestScore}</span> bitcoins mined!
      </p>
    </div>
  );
};

export default GameStatus;
