import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users } from 'lucide-react';

interface RoomCreatorProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  isLoading: boolean;
}

const RoomCreator = ({ onCreateRoom, onJoinRoom, isLoading }: RoomCreatorProps) => {
  return (
    <div className="space-y-6">
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