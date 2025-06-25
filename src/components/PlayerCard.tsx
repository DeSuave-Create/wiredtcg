
import { useState } from 'react';
import { Plus, Minus, Trash2, Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Player {
  id: string;
  name: string;
  score: number;
  character: string;
}

interface Character {
  id: string;
  name: string;
  icon: string;
}

interface PlayerCardProps {
  player: Player;
  characters: Character[];
  isLeader: boolean;
  canRemove: boolean;
  onUpdateScore: (playerId: string, change: number) => void;
  onUpdateName: (playerId: string, name: string) => void;
  onUpdateCharacter: (playerId: string, character: string) => void;
  onRemove: (playerId: string) => void;
}

const PlayerCard = ({
  player,
  characters,
  isLeader,
  canRemove,
  onUpdateScore,
  onUpdateName,
  onUpdateCharacter,
  onRemove
}: PlayerCardProps) => {
  const getCharacter = (characterId: string) => {
    return characters.find(c => c.id === characterId) || characters[0];
  };

  const character = getCharacter(player.character);

  return (
    <div className={`neon-border bg-card/50 p-6 rounded-lg space-y-4 ${isLeader ? 'ring-2 ring-secondary/50' : ''}`}>
      {/* Character Display */}
      <div className="text-center">
        <div className="text-4xl mb-2">{character.icon}</div>
        <Select value={player.character} onValueChange={(value) => onUpdateCharacter(player.id, value)}>
          <SelectTrigger className="neon-border bg-input text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-primary/30">
            {characters.map((char) => (
              <SelectItem key={char.id} value={char.id} className="hover:bg-primary/20">
                {char.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Player Name */}
      <Input
        value={player.name}
        onChange={(e) => onUpdateName(player.id, e.target.value)}
        className="text-center font-semibold text-lg neon-border bg-input"
      />

      {/* Bitcoin Score Display */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Bitcoin className="h-6 w-6 text-yellow-500" />
          <span className="text-sm text-muted-foreground">Bitcoins Mined</span>
        </div>
        <div className={`text-4xl font-bold mb-4 text-red-500 ${isLeader ? 'animate-pulse-neon' : ''}`}>
          {player.score}
        </div>
        
        {/* Score Controls */}
        <div className="flex flex-col xs:flex-row justify-center gap-2 xs:space-x-2 xs:space-y-0">
          <Button
            onClick={() => onUpdateScore(player.id, -1)}
            variant="outline"
            size="sm"
            className="neon-border text-destructive hover:bg-destructive/10 w-full xs:w-auto"
            type="button"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onUpdateScore(player.id, 1)}
            variant="outline"
            size="sm"
            className="neon-border text-primary hover:bg-primary/10 w-full xs:w-auto"
            type="button"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Remove Player */}
      {canRemove && (
        <Button
          onClick={() => onRemove(player.id)}
          variant="outline"
          size="sm"
          className="w-full neon-border text-destructive hover:bg-destructive/10"
          type="button"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove Miner
        </Button>
      )}
    </div>
  );
};

export default PlayerCard;
