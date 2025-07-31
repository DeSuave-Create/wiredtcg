import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PlayerCard from '../PlayerCard';
import type { Player } from '@/services/roomStorage';
import { roomStorage } from '@/services/roomStorage';
import { useRateLimit } from '@/hooks/useRateLimit';

interface AdminScoreKeeperProps {
  players: Player[];
  roomCode: string;
  onUpdatePlayers: (players: Player[]) => void;
  onUpdateScore: (playerId: string, change: number) => void;
  onResetScores: () => void;
}

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
  
  // Rate limiting for score updates: max 10 updates per 10 seconds
  const { isAllowed: isScoreUpdateAllowed, getRemainingTime } = useRateLimit({
    limit: 10,
    windowMs: 10000
  });

  const maxPlayers = null; // No max limit
  const minPlayers = 1;

  // Create a stable, sorted list of players that only updates when players change
  const stablePlayers = useMemo(() => {
    // Create a stable sort by both created_at and id to ensure consistent ordering
    return [...players].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      // If timestamps are identical, fall back to id comparison for consistency
      return timeA !== timeB ? timeA - timeB : a.id.localeCompare(b.id);
    });
  }, [players]);

  // Sync with stable players
  useEffect(() => {
    setLocalPlayers(stablePlayers);
  }, [stablePlayers]);

  const addPlayer = async () => {
    // No max limit check
    const newPlayerData = { name: `Player ${localPlayers.length + 1}`, score: 0 };
    try {
      // Add to database - this will trigger real-time updates
      const roomData = await roomStorage.getRoom(roomCode);
      if (roomData) {
        await roomStorage.addPlayer(roomData.id, newPlayerData);
      }
    } catch (error) {
      console.error('Error adding player:', error);
      toast({
        title: "Error",
        description: "Failed to add player",
        variant: "destructive"
      });
    }
  };

  const removePlayer = async (playerId: string) => {
    if (localPlayers.length > minPlayers) {
      try {
        await roomStorage.removePlayer(playerId);
      } catch (error) {
        console.error('Error removing player:', error);
        toast({
          title: "Error", 
          description: "Failed to remove player",
          variant: "destructive"
        });
      }
    }
  };

  const updateScore = (playerId: string, change: number) => {
    if (!isScoreUpdateAllowed()) {
      const remainingTime = Math.ceil(getRemainingTime() / 1000);
      toast({
        title: "Rate Limited",
        description: `Please wait ${remainingTime} seconds before updating scores again`,
        variant: "destructive"
      });
      return;
    }
    
    onUpdateScore(playerId, change);
  };

  const updatePlayerName = async (playerId: string, name: string) => {
    const updatedPlayers = localPlayers.map(p => 
      p.id === playerId ? { ...p, name } : p
    );
    setLocalPlayers(updatedPlayers);
    
    // Update individual player in database
    try {
      await roomStorage.updatePlayer(playerId, { name });
    } catch (error) {
      console.error('Error updating player name:', error);
      toast({
        title: "Error",
        description: "Failed to update player name",
        variant: "destructive"
      });
    }
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

      {/* Game Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-3xl border shadow-lg">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {localPlayers.length} Players
          </span>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={addPlayer}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
          <Button 
            onClick={resetAllScores}
            variant="outline"
            size="sm"
          >
            Reset All Scores
          </Button>
        </div>
      </div>

      {/* Game Status */}
      {getLeader() && getHighestScore() > 0 && (
        <div className="text-center p-6 bg-green-50 rounded-3xl border-2 border-green-200 shadow-lg">
          <h3 className="font-semibold text-green-600 mb-2">Current Leader</h3>
          <p className="text-3xl font-bold text-gray-800 mb-1">{getLeader()?.name}</p>
          <p className="text-3xl font-bold text-gray-800">{getHighestScore()} points</p>
        </div>
      )}

      {/* Players Grid - Responsive layout */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {localPlayers.map((player, index) => (
          <AdminPlayerCard
            key={player.id}
            player={player}
            isLeader={player.score === getHighestScore() && player.score > 0}
            canRemove={localPlayers.length > minPlayers}
            onUpdateScore={updateScore}
            onUpdateName={updatePlayerName}
            onRemove={removePlayer}
            playerIndex={index}
          />
        ))}
      </div>

      {/* Room Sharing */}
      <div className="text-center p-4 bg-card rounded-3xl border shadow-lg">
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

// Admin Player Card Component
interface AdminPlayerCardProps {
  player: Player;
  isLeader: boolean;
  canRemove: boolean;
  onUpdateScore: (playerId: string, change: number) => void;
  onUpdateName: (playerId: string, name: string) => void;
  onRemove: (playerId: string) => void;
  playerIndex: number;
}

const AdminPlayerCard = ({ 
  player, 
  isLeader, 
  canRemove, 
  onUpdateScore, 
  onUpdateName, 
  onRemove,
  playerIndex
}: AdminPlayerCardProps) => {
  const cardColors = ['green', 'blue', 'red', 'yellow', 'purple', 'orange'] as const;
  const cardColor = cardColors[playerIndex % cardColors.length];

  return (
    <PlayerCard
      name={player.name}
      score={player.score}
      isEditable
      onNameChange={(name) => onUpdateName(player.id, name)}
      onScoreChange={(change) => onUpdateScore(player.id, change)}
      onRemove={() => onRemove(player.id)}
      canRemove={canRemove}
      isLeader={isLeader}
      cardColor={cardColor}
    />
  );
};

export default AdminScoreKeeper;