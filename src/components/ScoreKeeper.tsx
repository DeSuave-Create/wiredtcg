
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
  { id = 'analyst', name: '📊 Data Analyst', icon: '📈' },
  { id: 'engineer', name: '🏗️ Network Engineer', icon: '🌐' },
];

const ScoreKeeper = () => {
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'ZeroTrust', score: 0, character: 'hacker' },
    { id: '2', name: 'DeskJockey', score: 0, character: 'admin' },
    { id: '3', name: 'PingMaster', score: 0, character: 'engineer' },
    { id: '4', name: 'RedTapeRipper', score: 0, character: 'analyst' },
    { id: '5', name: 'ClutchCache', score: 0, character: 'dev' }
  ]);

  const maxPlayers = 5;
  const minPlayers = 2;

  const addPlayer = () => {
    console.log('Adding player, current count:', players.length);
    if (players.length < maxPlayers) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: `Player ${players.length + 1}`,
        score: 0,
        character: 'dev'
      };
      setPlayers(prevPlayers => {
        const updatedPlayers = [...prevPlayers, newPlayer];
        console.log('Players after adding:', updatedPlayers);
        return updatedPlayers;
      });
    }
  };

  const removePlayer = (playerId: string) => {
    console.log('Removing player:', playerId, 'current count:', players.length);
    if (players.length > minPlayers) {
      setPlayers(prevPlayers => {
        const updatedPlayers = prevPlayers.filter(p => p.id !== playerId);
        console.log('Players after removing:', updatedPlayers);
        return updatedPlayers;
      });
    }
  };

  const updateScore = (playerId: string, change: number) => {
    console.log('Updating score for player:', playerId, 'change:', change);
    setPlayers(prevPlayers => {
      const updatedPlayers = prevPlayers.map(p => 
        p.id === playerId ? { ...p, score: Math.max(0, p.score + change) } : p
      );
      console.log('Players after score update:', updatedPlayers);
      return updatedPlayers;
    });
  };

  const updatePlayerName = (playerId: string, name: string) => {
    console.log('Updating name for player:', playerId, 'new name:', name);
    setPlayers(prevPlayers => {
      const updatedPlayers = prevPlayers.map(p => 
        p.id === playerId ? { ...p, name } : p
      );
      console.log('Players after name update:', updatedPlayers);
      return updatedPlayers;
    });
  };

  const updatePlayerCharacter = (playerId: string, character: string) => {
    console.log('Updating character for player:', playerId, 'new character:', character);
    setPlayers(prevPlayers => {
      const updatedPlayers = prevPlayers.map(p => 
        p.id === playerId ? { ...p, character } : p
      );
      console.log('Players after character update:', updatedPlayers);
      return updatedPlayers;
    });
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

  // Add debugging for render
  console.log('ScoreKeeper rendering with players:', players);

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
          console.log('Rendering PlayerCard for:', player.id, player.name);
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
