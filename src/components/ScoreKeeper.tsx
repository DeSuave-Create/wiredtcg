
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import GameHeader from './GameHeader';
import GameStatus from './GameStatus';
import PlayerCard from './PlayerCard';
import GameInfo from './GameInfo';

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

  const maxPlayers = 5;
  const minPlayers = 2;

  const addPlayer = () => {
    if (players.length < maxPlayers) {
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
    if (players.length > minPlayers) {
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

  const getHighestScore = () => {
    return Math.max(...players.map(p => p.score));
  };

  const getLeader = () => {
    const highest = getHighestScore();
    return players.find(p => p.score === highest);
  };

  return (
    <div className="space-y-6">
      <GameHeader 
        playerCount={players.length}
        maxPlayers={maxPlayers}
        onAddPlayer={addPlayer}
        onReset={resetAllScores}
      />

      <GameStatus 
        leader={getLeader()}
        highestScore={getHighestScore()}
      />

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => {
          const isLeader = player.score === getHighestScore() && player.score > 0;
          return (
            <PlayerCard
              key={player.id}
              player={player}
              characters={characters}
              isLeader={isLeader}
              canRemove={players.length > minPlayers}
              onUpdateScore={updateScore}
              onUpdateName={updatePlayerName}
              onUpdateCharacter={updatePlayerCharacter}
              onRemove={removePlayer}
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
