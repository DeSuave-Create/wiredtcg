import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { roomStorage } from '@/services/roomStorage';
import type { RoomWithPlayers, Player } from '@/services/roomStorage';
import RoomCreator from '@/components/room/RoomCreator';
import RoomJoiner from '@/components/room/RoomJoiner';
import AdminScoreKeeper from '@/components/room/AdminScoreKeeper';
import ScoreBoard from '@/components/room/ScoreBoard';

const Room = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentView, setCurrentView] = useState<'create' | 'join' | 'room'>('create');
  const [room, setRoom] = useState<RoomWithPlayers | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check admin status when room changes
  useEffect(() => {
    if (room) {
      const adminToken = localStorage.getItem(`room_admin_${room.code}`);
      setIsAdmin(adminToken === room.admin_token);
    }
  }, [room]);

  // Auto-join room if roomCode is in URL
  useEffect(() => {
    if (roomCode) {
      setCurrentView('room');
      handleJoinRoom(roomCode);
    }
  }, [roomCode]);

  // Subscribe to room updates
  useEffect(() => {
    if (!room) return;

    const unsubscribe = roomStorage.subscribeToRoom(room.code, (updatedRoom) => {
      if (updatedRoom) {
        setRoom(updatedRoom);
      }
    });

    return unsubscribe;
  }, [room?.code]);

  const generateRoomCode = () => {
    return Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const generateAdminToken = () => {
    return crypto.randomUUID();
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const code = generateRoomCode();
      const adminToken = generateAdminToken();

      // Create room in database
      const createdRoom = await roomStorage.createRoom({
        code,
        admin_token: adminToken
      });

      // Import players from ScoreKeeper if available
      const savedPlayers = localStorage.getItem('scorekeeper-players');
      if (savedPlayers) {
        try {
          const scorekeeperPlayers = JSON.parse(savedPlayers);
          // Add players to the room
          for (const player of scorekeeperPlayers) {
            await roomStorage.addPlayer(createdRoom.id, {
              name: player.name,
              character: player.character,
              score: player.score
            });
          }
        } catch (error) {
          console.log('Error importing scorekeeper players:', error);
        }
      }

      // Get the complete room with players
      const roomWithPlayers = await roomStorage.getRoom(code);
      setRoom(roomWithPlayers);
      setIsAdmin(true);
      
      // Store admin credentials
      localStorage.setItem(`room_admin_${code}`, adminToken);
      
      // Navigate to room
      navigate(`/room/${code}`);
      setCurrentView('room');
      
      toast({
        title: "Room Created!",
        description: `Room code: ${code}`,
      });
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (code: string) => {
    setIsLoading(true);
    try {
      const existingRoom = await roomStorage.getRoom(code);
      
      if (existingRoom) {
        setRoom(existingRoom);
        setCurrentView('room');
        
        toast({
          title: "Joined Room!",
          description: `Connected to room ${code}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Room not found. Please check the room code.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Error",
        description: "Failed to join room",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePlayers = async (players: Player[]) => {
    if (!room || !isAdmin) return;
    
    try {
      await roomStorage.bulkUpdatePlayers(room.id, players);
      
      toast({
        title: "Players Updated!",
        description: "Player information has been saved",
      });
    } catch (error) {
      console.error('Error updating players:', error);
      toast({
        title: "Error",
        description: "Failed to update players",
        variant: "destructive"
      });
    }
  };

  const handleUpdateScore = async (playerId: string, change: number) => {
    if (!room) return;
    
    try {
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        const newScore = Math.max(0, player.score + change);
        await roomStorage.updatePlayer(playerId, { score: newScore });
      }
    } catch (error) {
      console.error('Error updating score:', error);
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive"
      });
    }
  };

  const handleResetScores = async () => {
    if (!room || !isAdmin) return;
    
    try {
      const resetPromises = room.players.map(player => 
        roomStorage.updatePlayer(player.id, { score: 0 })
      );
      await Promise.all(resetPromises);
      
      toast({
        title: "Scores Reset!",
        description: "All player scores have been reset to 0",
      });
    } catch (error) {
      console.error('Error resetting scores:', error);
      toast({
        title: "Error",
        description: "Failed to reset scores",
        variant: "destructive"
      });
    }
  };

  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto pt-20">
          <RoomCreator 
            onCreateRoom={handleCreateRoom}
            onJoinRoom={() => setCurrentView('join')}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'join') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto pt-20">
          <RoomJoiner 
            onJoinRoom={handleJoinRoom}
            onBack={() => setCurrentView('create')}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isAdmin ? (
        // Admin View - Full ScoreKeeper-like interface
        <div className="container mx-auto px-4 py-8">
          <AdminScoreKeeper
            players={room.players}
            roomCode={room.code}
            onUpdatePlayers={handleUpdatePlayers}
            onUpdateScore={handleUpdateScore}
            onResetScores={handleResetScores}
          />
        </div>
      ) : (
        // Participant View - Just the scoreboard
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="bg-card border-b px-4 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/score')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Score Keeper
                </Button>
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Room {room.code}</h1>
                  <p className="text-sm text-muted-foreground">
                    {room.players.length} player{room.players.length !== 1 ? 's' : ''} • Participant View
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Score Board */}
            <ScoreBoard
              players={room.players}
              isAdmin={false}
              onUpdateScore={() => {}} // No-op for participants
            />

            {/* Room Info */}
            <div className="text-center p-4 bg-card rounded-lg border">
              <h3 className="font-semibold mb-2">Room Code</h3>
              <p className="text-2xl font-bold text-primary mb-2">{room.code}</p>
              <p className="text-sm text-muted-foreground">
                You're viewing as a participant. Only the admin can make changes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
