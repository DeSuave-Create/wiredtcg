import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import GameHeader from './GameHeader';
import GameStatus from './GameStatus';
import PlayerCard from './PlayerCard';
import GameInfo from './GameInfo';

interface Player {
  id: string;
  name: string;
  score: number;
}

const defaultPlayers: Player[] = [
  { id: '1', name: 'Player 1', score: 0 },
  { id: '2', name: 'Player 2', score: 0 }
];

// Cookie helper functions
const setCookie = (name: string, value: string, days: number = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const ScoreKeeper = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>(() => {
    // Load from cookie on initialization
    const savedPlayers = getCookie('scorekeeper-players');
    if (savedPlayers) {
      try {
        const parsed = JSON.parse(savedPlayers);
        // Remove character field if it exists from old saves
        return parsed.map((p: any) => ({
          id: p.id,
          name: p.name,
          score: p.score
        }));
      } catch (error) {
        console.log('Error parsing saved players:', error);
        return defaultPlayers;
      }
    }
    return defaultPlayers;
  });

  const maxPlayers = null; // No max limit
  const minPlayers = 1;

  // Save to cookie whenever players state changes
  useEffect(() => {
    setCookie('scorekeeper-players', JSON.stringify(players));
  }, [players]);

  const addPlayer = () => {
    // No max limit check
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: `Player ${players.length + 1}`,
      score: 0,
    };
    setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
  };

  const removePlayer = (playerId: string) => {
    if (players.length > minPlayers) {
      setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== playerId));
    }
  };

  const updateScore = (playerId: string, change: number) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(p => 
        p.id === playerId ? { ...p, score: Math.max(0, p.score + change) } : p
      )
    );
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name } : p));
    localStorage.setItem('players', JSON.stringify(players.map(p => p.id === id ? { ...p, name } : p)));
  };

  const resetAllScores = () => {
    setPlayers(prevPlayers => prevPlayers.map(p => ({ ...p, score: 0 })));
    toast({
      title: "Network Reset!",
      description: "All scores have been reset to 0.",
    });
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
      {/* Leader Announcement */}
      {getLeader() && getHighestScore() > 0 && (
        <div className="text-center p-4 bg-green-100 rounded-lg border-2 border-green-600">
          <p className="text-lg font-semibold text-green-800">
            {getLeader()?.name} is leading with {getHighestScore()} bitcoins mined!
          </p>
        </div>
      )}

      <GameHeader 
        playerCount={players.length}
        maxPlayers={maxPlayers}
        onAddPlayer={addPlayer}
        onReset={resetAllScores}
      />

      <div className="text-center">
        <Button 
          onClick={() => navigate('/room')} 
          variant="outline" 
          className="bg-gray-100 rounded-3xl text-secondary hover:bg-gray-200 shadow-2xl drop-shadow-lg gap-2"
        >
          <Users className="h-4 w-4" />
          Join Multiplayer Room
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Play with friends online in real-time
        </p>
      </div>

      <GameStatus 
        leader={getLeader()}
        highestScore={getHighestScore()}
      />

      {/* Players Grid - More Compact, 3 columns */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto">
        {players.map((player, index) => {
          const isLeader = player.score === getHighestScore() && player.score > 0;
          const cardColors = ['green', 'blue', 'red', 'yellow', 'purple', 'orange'] as const;
          return (
            <PlayerCard
              key={player.id}
              name={player.name}
              score={player.score}
              isEditable
              onNameChange={(name) => updatePlayerName(player.id, name)}
              onScoreChange={(change) => updateScore(player.id, change)}
              onRemove={() => removePlayer(player.id)}
              canRemove={players.length > minPlayers}
              isLeader={isLeader}
              cardColor={cardColors[index % cardColors.length]}
            />
          );
        })}
      </div>

      <GameInfo 
        playerCount={players.length}
        maxPlayers={maxPlayers}
      />
    </div>
  );
};

export default ScoreKeeper;