
interface GameInfoProps {
  playerCount: number;
  maxPlayers: number;
}

const GameInfo = ({ playerCount, maxPlayers }: GameInfoProps) => {
  return (
    <div className="neon-border bg-card/30 p-4 rounded-lg text-center">
      <p className="text-muted-foreground text-sm">
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
