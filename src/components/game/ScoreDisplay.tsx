import { Player } from '@/types/game';
import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  players: Player[];
  currentPlayerIndex: number;
  countConnectedComputers: (network: Player['network']) => number;
}

export function ScoreDisplay({ players, currentPlayerIndex, countConnectedComputers }: ScoreDisplayProps) {
  return (
    <div className="flex justify-center gap-8">
      {players.map((player, index) => {
        const connectedComputers = countConnectedComputers(player.network);
        const isCurrentTurn = index === currentPlayerIndex;
        
        return (
          <div
            key={player.id}
            className={cn(
              "px-6 py-3 rounded-lg border-2 transition-all",
              isCurrentTurn 
                ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20" 
                : "border-gray-600 bg-black/30"
            )}
          >
            <div className="text-center">
              <div className={cn(
                "text-sm font-medium mb-1",
                isCurrentTurn ? "text-yellow-400" : "text-gray-400"
              )}>
                {player.name}
                {isCurrentTurn && " ◀"}
              </div>
              <div className="text-3xl font-bold text-accent-green">
                {player.score}
              </div>
              <div className="text-xs text-muted-foreground">
                bitcoin
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {connectedComputers} 💻 connected
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
