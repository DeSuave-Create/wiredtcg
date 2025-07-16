import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, ArrowLeft } from 'lucide-react';

interface RoomCreatorProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  isLoading: boolean;
}

const RoomCreator = ({ onCreateRoom, onJoinRoom, isLoading }: RoomCreatorProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/score')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Score Keeper
        </Button>
      </div>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">WIRED Rooms</h1>
        <p className="text-muted-foreground">Create or join a multiplayer game room</p>
      </div>

      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Room
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Start a new game room and become the admin. You'll get a 5-character code to share with others.
          </p>
          <Button 
            onClick={onCreateRoom} 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Room'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Users className="h-5 w-5" />
            Join Existing Room
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Enter a room code to join an existing game as a participant.
          </p>
          <Button 
            onClick={onJoinRoom} 
            variant="outline" 
            className="w-full" 
            size="lg"
          >
            Join Room
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomCreator;