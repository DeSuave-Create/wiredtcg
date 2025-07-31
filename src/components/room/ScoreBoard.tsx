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
      {/* Live Scores Section - FAQ style */}
      <div className="bg-gray-100 rounded-3xl border-2 border-gray-200 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Live Scores</h2>
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {players.length} player{players.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className="bg-gray-50 rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-bold text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{player.name}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {editingScore === player.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={tempScore}
                        onChange={(e) => setTempScore(parseInt(e.target.value) || 0)}
                        className="w-20 text-center rounded-xl border-2"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveScore(player.id)}
                        className="h-8 w-8 p-0 rounded-xl"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="h-8 w-8 p-0 rounded-xl border-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-800 min-w-[4rem] text-center">
                        {player.score}
                      </span>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustScore(player.id, -1)}
                            className="h-10 w-10 p-0 rounded-xl border-2 border-red-600 text-red-600 hover:bg-red-50"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustScore(player.id, 1)}
                            className="h-10 w-10 p-0 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditScore(player)}
                            className="h-10 w-10 p-0 rounded-xl border-2 border-gray-600 text-gray-600 hover:bg-gray-50"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Player Cards Grid for Visual Display - Only show for admins */}
      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedPlayers.map((player, index) => {
            const cardColors = ['green', 'blue', 'red', 'yellow', 'purple', 'orange'] as const;
            return (
              <PlayerCard
                key={player.id}
                name={player.name}
                score={player.score}
                isLeader={player.score === Math.max(...players.map(p => p.score)) && player.score > 0}
                cardColor={cardColors[index % cardColors.length]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScoreBoard;