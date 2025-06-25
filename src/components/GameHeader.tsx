
import { Plus, RotateCcw, Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameHeaderProps {
  playerCount: number;
  maxPlayers: number;
  onAddPlayer: () => void;
  onReset: () => void;
}

const GameHeader = ({ playerCount, maxPlayers, onAddPlayer, onReset }: GameHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center space-x-2">
        <Bitcoin className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-primary">Bitcoin Mining Tracker</h2>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="neon-border text-secondary hover:bg-secondary/10 w-full sm:w-auto"
          type="button"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Network
        </Button>
        {playerCount < maxPlayers && (
          <Button
            onClick={onAddPlayer}
            className="bg-primary text-primary-foreground hover:bg-primary/80 neon-glow w-full sm:w-auto"
            type="button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Miner
          </Button>
        )}
      </div>
    </div>
  );
};

export default GameHeader;
