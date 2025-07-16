import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Plus, RotateCcw, Edit3, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RoomCreator from '@/components/room/RoomCreator';
import RoomJoiner from '@/components/room/RoomJoiner';
import PlayerManagement from '@/components/room/PlayerManagement';
import ScoreBoard from '@/components/room/ScoreBoard';

interface Player {
  id: string;
  name: string;
  character: string;
  score: number;
}

interface Room {
  id: string;
  code: string;
  adminToken: string;
  players: Player[];
  createdAt: string;
  updatedAt: string;
}

const Room = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentView, setCurrentView] = useState<'create' | 'join' | 'room'>('create');
  const [room, setRoom] = useState<Room | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPlayers, setEditingPlayers] = useState(false);

  // Check if user is admin (stored in localStorage)
  useEffect(() => {
    if (room) {
      const adminToken = localStorage.getItem(`room_admin_${room.code}`);
      setIsAdmin(adminToken === room.adminToken);
    }
  }, [room]);

  // Auto-join room if roomCode is in URL
  useEffect(() => {
    if (roomCode) {
      setCurrentView('room');
      handleJoinRoom(roomCode);
    }
  }, [roomCode]);

  // Mock functions - replace with actual Supabase calls
  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      // Generate 5-character room code
      const code = Math.random().toString(36).substr(2, 5).toUpperCase();
      const adminToken = crypto.randomUUID();
      
      // Import players from ScoreKeeper if available
      const savedPlayers = localStorage.getItem('scorekeeper-players');
      let importedPlayers: Player[] = [];
      
      if (savedPlayers) {
        try {
          const scorekeeperPlayers = JSON.parse(savedPlayers);
          importedPlayers = scorekeeperPlayers.map((p: any) => ({
            id: p.id,
            name: p.name,
            character: p.character,
            score: p.score
          }));
        } catch (error) {
          console.log('Error importing scorekeeper players:', error);
        }
      }
      
      const newRoom: Room = {
        id: crypto.randomUUID(),
        code,
        adminToken,
        players: importedPlayers,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // TODO: Replace with Supabase call
      // const { data, error } = await supabase
      //   .from('rooms')
      //   .insert([newRoom])
      //   .select()
      //   .single();

      setRoom(newRoom);
      localStorage.setItem(`room_admin_${code}`, adminToken);
      navigate(`/room/${code}`);
      setCurrentView('room');
      
      toast({
        title: "Room Created!",
        description: `Room code: ${code}`,
      });
    } catch (error) {
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
      // TODO: Replace with Supabase call
      // const { data, error } = await supabase
      //   .from('rooms')
      //   .select('*')
      //   .eq('code', code)
      //   .single();

      // Mock room data
      const mockRoom: Room = {
        id: crypto.randomUUID(),
        code: code,
        adminToken: crypto.randomUUID(),
        players: [
          { id: '1', name: 'Player 1', character: 'zerotrust', score: 15 },
          { id: '2', name: 'Player 2', character: 'deskjockey', score: 8 },
          { id: '3', name: 'Player 3', character: 'pingmaster', score: 12 }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setRoom(mockRoom);
      setCurrentView('room');
      
      toast({
        title: "Joined Room!",
        description: `Connected to room ${code}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Room not found",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePlayers = async (players: Player[]) => {
    if (!room || !isAdmin) return;
    
    try {
      // TODO: Replace with Supabase call
      // const { error } = await supabase
      //   .from('rooms')
      //   .update({ players, updated_at: new Date().toISOString() })
      //   .eq('id', room.id);

      setRoom({ ...room, players, updatedAt: new Date().toISOString() });
      
      toast({
        title: "Players Updated!",
        description: "Player information has been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update players",
        variant: "destructive"
      });
    }
  };

  const handleUpdateScore = async (playerId: string, newScore: number) => {
    if (!room) return;
    
    const updatedPlayers = room.players.map(player => 
      player.id === playerId ? { ...player, score: newScore } : player
    );
    
    try {
      // TODO: Replace with Supabase call
      setRoom({ ...room, players: updatedPlayers, updatedAt: new Date().toISOString() });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive"
      });
    }
  };

  const handleResetScores = async () => {
    if (!room || !isAdmin) return;
    
    const resetPlayers = room.players.map(player => ({ ...player, score: 0 }));
    
    try {
      // TODO: Replace with Supabase call
      setRoom({ ...room, players: resetPlayers, updatedAt: new Date().toISOString() });
      
      toast({
        title: "Scores Reset!",
        description: "All player scores have been reset to 0",
      });
    } catch (error) {
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
                {room.players.length} player{room.players.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {isAdmin && (
            <Badge variant="secondary" className="gap-1">
              <Crown className="h-3 w-3" />
              Admin
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Admin Controls */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Admin Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => setEditingPlayers(!editingPlayers)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  {editingPlayers ? 'Save Players' : 'Edit Players'}
                </Button>
                <Button 
                  onClick={handleResetScores}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Scores
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Player Management (Admin Only) */}
        {isAdmin && editingPlayers && (
          <PlayerManagement
            players={room.players}
            onUpdatePlayers={handleUpdatePlayers}
            onClose={() => setEditingPlayers(false)}
          />
        )}

        {/* Score Board */}
        <ScoreBoard
          players={room.players}
          isAdmin={isAdmin}
          onUpdateScore={handleUpdateScore}
        />

        {/* Share Room Code */}
        <Card>
          <CardHeader>
            <CardTitle>Share Room</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                value={`${window.location.origin}/room/${room.code}`} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/room/${room.code}`);
                  toast({ title: "Copied!", description: "Room link copied to clipboard" });
                }}
                variant="outline"
              >
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Room;