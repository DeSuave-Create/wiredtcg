
interface GameInfoProps {
  playerCount: number;
  maxPlayers: number;
}

const GameInfo = ({ playerCount, maxPlayers }: GameInfoProps) => {
  return (
    <div className="relative overflow-hidden bg-gray-100 rounded-3xl p-4 text-center shadow-2xl drop-shadow-lg" style={{ backgroundColor: '#fffbef' }}>
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
      
      <p className="text-muted-foreground text-sm relative z-10">
        Build your network, connect to the switch, and start mining bitcoins.
        <br />
        Attack opponents, make deals, and race to reach the target score first!
        <br />
        <span className="text-primary">Active Miners: {playerCount}/{maxPlayers}</span>
      </p>
    </div>
  );
};

export default GameInfo;
