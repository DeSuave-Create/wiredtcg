
import { useState, useEffect } from 'react';
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
  { id: 'zerotrust', name: '🔐 ZeroTrust', icon: '🕵️' },
  { id: 'deskjockey', name: '🎧 DeskJockey', icon: '💬' },
  { id: 'pingmaster', name: '🌐 PingMaster', icon: '📡' },
  { id: 'redtaperipper', name: '📋 RedTapeRipper', icon: '⚖️' },
  { id: 'clutchcache', name: '🎮 ClutchCache', icon: '🕹️' },
  { id: 'cloudcrafter', name: '☁️ CloudCrafter', icon: '⚙️' },
];

const defaultPlayers: Player[] = [
  { id: '1', name: 'Player 1', score: 0, character: 'zerotrust' },
  { id: '2', name: 'Player 2', score: 0, character: 'deskjockey' }
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
  const [players, setPlayers] = useState<Player[]>(() => {
    // Load from cookie on initialization
    const savedPlayers = getCookie('scorekeeper-players');
    if (savedPlayers) {
      try {
        return JSON.parse(savedPlayers);
      } catch (error) {
        console.log('Error parsing saved players:', error);
        return defaultPlayers;
      }
    }
    return defaultPlayers;
  });

  const maxPlayers = 6;
  const minPlayers = 2;

  // Save to cookie whenever players state changes
  useEffect(() => {
    setCookie('scorekeeper-players', JSON.stringify(players));
    console.log('Players saved to cookie:', players);
  }, [players]);

  const addPlayer = () => {
    console.log('Adding player, current count:', players.length);
    if (players.length < maxPlayers) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: `Player ${players.length + 1}`,
        score: 0,
        character: 'zerotrust'
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

      {/* Players - Mobile List / Desktop Grid */}
      <div className="flex flex-col space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0">
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
