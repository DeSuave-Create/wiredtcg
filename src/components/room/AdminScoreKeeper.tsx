import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft } from 'lucide-react';
import GameHeader from '../GameHeader';
import GameStatus from '../GameStatus';
import PlayerCard from '../PlayerCard';
import GameInfo from '../GameInfo';

interface Player {
  id: string;
  name: string;
  character: string;
  score: number;
}

interface AdminScoreKeeperProps {
  players: Player[];
  roomCode: string;
  onUpdatePlayers: (players: Player[]) => void;
  onUpdateScore: (playerId: string, change: number) => void;
  onResetScores: () => void;
}

const characters = [
  { id: 'zerotrust', name: '🔐 ZeroTrust', icon: '🕵️' },
  { id: 'deskjockey', name: '🎧 DeskJockey', icon: '💬' },
  { id: 'pingmaster', name: '🌐 PingMaster', icon: '📡' },
  { id: 'redtaperipper', name: '📋 RedTapeRipper', icon: '⚖️' },
  { id: 'clutchcache', name: '🎮 ClutchCache', icon: '🕹️' },
  { id: 'cloudcrafter', name: '☁️ CloudCrafter', icon: '⚙️' },
];

const AdminScoreKeeper = ({ 
  players, 
  roomCode, 
  onUpdatePlayers, 
  onUpdateScore, 
  onResetScores 
}: AdminScoreKeeperProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [localPlayers, setLocalPlayers] = useState<Player[]>(players);

  const maxPlayers = 6;
  const minPlayers = 2;

  // Sync with parent component
  useEffect(() => {
    setLocalPlayers(players);
  }, [players]);

  const addPlayer = () => {
    if (localPlayers.length < maxPlayers) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: `Player ${localPlayers.length + 1}`,
        score: 0,
        character: 'zerotrust'
      };
      const updatedPlayers = [...localPlayers, newPlayer];
      setLocalPlayers(updatedPlayers);
      onUpdatePlayers(updatedPlayers);
    }
  };

  const removePlayer = (playerId: string) => {
    if (localPlayers.length > minPlayers) {
      const updatedPlayers = localPlayers.filter(p => p.id !== playerId);
      setLocalPlayers(updatedPlayers);
      onUpdatePlayers(updatedPlayers);
    }
  };

  const updateScore = (playerId: string, change: number) => {
    onUpdateScore(playerId, change);
  };

  const updatePlayerName = (playerId: string, name: string) => {
    const updatedPlayers = localPlayers.map(p => 
      p.id === playerId ? { ...p, name } : p
    );
    setLocalPlayers(updatedPlayers);
    onUpdatePlayers(updatedPlayers);
  };

  const updatePlayerCharacter = (playerId: string, character: string) => {
    const updatedPlayers = localPlayers.map(p => 
      p.id === playerId ? { ...p, character } : p
    );
    setLocalPlayers(updatedPlayers);
    onUpdatePlayers(updatedPlayers);
  };

  const resetAllScores = () => {
    onResetScores();
    toast({
      title: "Network Reset!",
      description: "All mining operations have been reset to 0 bitcoins.",
    });
  };

  const getHighestScore = () => {
    return Math.max(...localPlayers.map(p => p.score));
  };

  const getLeader = () => {
    const highest = getHighestScore();
    return localPlayers.find(p => p.score === highest);
  };

  return (
    <div className="space-y-6">
      {/* Room Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/score')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Score Keeper
        </Button>
        <div className="text-center">
          <h2 className="text-lg font-semibold">Room {roomCode}</h2>
          <p className="text-sm text-muted-foreground">Admin View</p>
        </div>
        <div className="w-32" /> {/* Spacer for centering */}
      </div>

      <GameHeader 
        playerCount={localPlayers.length}
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
        {localPlayers.map((player) => {
          const isLeader = player.score === getHighestScore() && player.score > 0;
          return (
            <PlayerCard
              key={player.id}
              player={player}
              characters={characters}
              isLeader={isLeader}
              canRemove={localPlayers.length > minPlayers}
              onUpdateScore={updateScore}
              onUpdateName={updatePlayerName}
              onUpdateCharacter={updatePlayerCharacter}
              onRemove={removePlayer}
            />
          );
        })}
      </div>

      <GameInfo 
        playerCount={localPlayers.length}
        maxPlayers={maxPlayers}
      />

      {/* Room Sharing */}
      <div className="text-center p-4 bg-card rounded-lg border">
        <h3 className="font-semibold mb-2">Share Room Code</h3>
        <p className="text-2xl font-bold text-primary mb-2">{roomCode}</p>
        <Button 
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/room/${roomCode}`);
            toast({ title: "Copied!", description: "Room link copied to clipboard" });
          }}
          variant="outline"
          size="sm"
        >
          Copy Room Link
        </Button>
      </div>
    </div>
  );
};

export default AdminScoreKeeper;