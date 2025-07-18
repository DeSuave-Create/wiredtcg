import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Edit3, Check, X } from 'lucide-react';
import PlayerCard from '../PlayerCard';

interface Player {
  id: string;
  name: string;
  score: number;
  created_at: string;
  updated_at: string;
}

interface ScoreBoardProps {
  players: Player[];
  isAdmin: boolean;
  onUpdateScore: (playerId: string, newScore: number) => void;
}

const ScoreBoard = ({ players, isAdmin, onUpdateScore }: ScoreBoardProps) => {
  const [editingScore, setEditingScore] = useState<string | null>(null);
  const [tempScore, setTempScore] = useState<number>(0);

  const handleEditScore = (player: Player) => {
    setEditingScore(player.id);
    setTempScore(player.score);
  };

  const handleSaveScore = (playerId: string) => {
    onUpdateScore(playerId, tempScore);
    setEditingScore(null);
  };

  const handleCancelEdit = () => {
    setEditingScore(null);
    setTempScore(0);
  };

  const adjustScore = (playerId: string, adjustment: number) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      onUpdateScore(playerId, Math.max(0, player.score + adjustment));
    }
  };

  if (players.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No players in this room yet.</p>
          {isAdmin && (
            <p className="text-sm text-muted-foreground mt-2">
              Use "Edit Players" to add players to the room.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Sort players by score (highest first), then by creation time for stability
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Live Scores
            <span className="text-sm font-normal text-muted-foreground">
              {players.length} player{players.length !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
            >
              <div className="flex items-center gap-3">
                <div className="text-sm font-mono text-muted-foreground w-6">
                  #{index + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{player.name}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingScore === player.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={tempScore}
                      onChange={(e) => setTempScore(parseInt(e.target.value) || 0)}
                      className="w-20 text-center"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveScore(player.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl font-bold min-w-[3rem] text-center">
                      {player.score}
                    </span>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => adjustScore(player.id, -1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => adjustScore(player.id, 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditScore(player)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Player Cards Grid for Visual Display */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            name={player.name}
            score={player.score}
          />
        ))}
      </div>
    </div>
  );
};

export default ScoreBoard;