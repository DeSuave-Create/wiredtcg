
import { useState } from 'react';
import { Plus, Minus, Users, Trash2, RotateCcw, Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
  score: number;
  character: string;
}

const characters = [
  { id: 'dev', name: '👨‍💻 Developer', icon: '💻' },
  { id: 'admin', name: '🔧 System Admin', icon: '⚙️' },
  { id: 'hacker', name: '🕵️ Ethical Hacker', icon: '🔐' },
  { id: 'analyst', name: '📊 Data Analyst', icon: '📈' },
  { id: 'engineer', name: '🏗️ Network Engineer', icon: '🌐' },
];

const ScoreKeeper = () => {
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Player 1', score: 0, character: 'dev' },
    { id: '2', name: 'Player 2', score: 0, character: 'admin' }
  ]);

  const addPlayer = () => {
    if (players.length < 5) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: `Player ${players.length + 1}`,
        score: 0,
        character: 'dev'
      };
      setPlayers([...players, newPlayer]);
    }
  };

  const removePlayer = (playerId: string) => {
    if (players.length > 2) {
      setPlayers(players.filter(p => p.id !== playerId));
    }
  };

  const updateScore = (playerId: string, change: number) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, score: Math.max(0, p.score + change) } : p
    ));
  };

  const updatePlayerName = (playerId: string, name: string) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, name } : p
    ));
  };

  const updatePlayerCharacter = (playerId: string, character: string) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, character } : p
    ));
  };

  const resetAllScores = () => {
    console.log('Reset button clicked');
    setPlayers(prevPlayers => {
      const resetPlayers = prevPlayers.map(p => ({ ...p, score: 0 }));
      console.log('Players reset:', resetPlayers);
      return resetPlayers;
    });
    toast({
      title: "Network Reset!",
      description: "All mining operations have been reset to 0 bitcoins.",
    });
  };

  const getCharacter = (characterId: string) => {
    return characters.find(c => c.id === characterId) || characters[0];
  };

  const getHighestScore = () => {
    return Math.max(...players.map(p => p.score));
  };

  const getLeader = () => {
    const highest = getHighestScore();
    return players.find(p => p.score === highest);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bitcoin className="h-6 w-6 text-secondary" />
          <h2 className="text-2xl font-bold text-primary">Bitcoin Mining Tracker</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={resetAllScores}
            variant="outline"
            size="sm"
            className="neon-border text-secondary hover:bg-secondary/10"
            type="button"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Network
          </Button>
          {players.length < 5 && (
            <Button
              onClick={addPlayer}
              className="bg-primary text-primary-foreground hover:bg-primary/80 neon-glow"
              type="button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Miner
            </Button>
          )}
        </div>
      </div>

      {/* Game Status */}
      {getHighestScore() > 0 && (
        <div className="neon-border bg-card/50 p-4 rounded-lg text-center">
          <p className="text-primary font-semibold">
            {getLeader()?.name} is leading with {getHighestScore()} bitcoins mined!
          </p>
        </div>
      )}

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => {
          const character = getCharacter(player.character);
          const isLeader = player.score === getHighestScore() && player.score > 0;
          return (
            <div key={player.id} className={`neon-border bg-card/50 p-6 rounded-lg space-y-4 ${isLeader ? 'ring-2 ring-secondary/50' : ''}`}>
              {/* Character Display */}
              <div className="text-center">
                <div className="text-4xl mb-2">{character.icon}</div>
                <Select value={player.character} onValueChange={(value) => updatePlayerCharacter(player.id, value)}>
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
                onChange={(e) => updatePlayerName(player.id, e.target.value)}
                className="text-center font-semibold text-lg neon-border bg-input"
              />

              {/* Bitcoin Score Display */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Bitcoin className="h-6 w-6 text-secondary" />
                  <span className="text-sm text-muted-foreground">Bitcoins Mined</span>
                </div>
                <div className={`text-4xl font-bold mb-4 ${isLeader ? 'text-secondary animate-pulse-neon' : 'text-primary'}`}>
                  {player.score}
                </div>
                
                {/* Score Controls */}
                <div className="flex justify-center space-x-2">
                  <Button
                    onClick={() => updateScore(player.id, -1)}
                    variant="outline"
                    size="sm"
                    className="neon-border text-destructive hover:bg-destructive/10"
                    type="button"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => updateScore(player.id, 1)}
                    variant="outline"
                    size="sm"
                    className="neon-border text-primary hover:bg-primary/10"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Remove Player */}
              {players.length > 2 && (
                <Button
                  onClick={() => removePlayer(player.id)}
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
        })}
      </div>

      {/* Game Info */}
      <div className="neon-border bg-card/30 p-4 rounded-lg text-center">
        <p className="text-muted-foreground text-sm">
          Build your network, connect to the switch, and start mining bitcoins.
          <br />
          Attack opponents, make deals, and race to reach the target score first!
          <br />
          <span className="text-primary">Active Miners: {players.length}/5</span>
        </p>
      </div>
    </div>
  );
};

export default ScoreKeeper;
