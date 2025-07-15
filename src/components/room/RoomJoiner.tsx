import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogIn } from 'lucide-react';

interface RoomJoinerProps {
  onJoinRoom: (code: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const RoomJoiner = ({ onJoinRoom, onBack, isLoading }: RoomJoinerProps) => {
  const [roomCode, setRoomCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.length === 5) {
      onJoinRoom(roomCode.toUpperCase());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Join Room</h1>
          <p className="text-muted-foreground">Enter the 5-character room code</p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <LogIn className="h-5 w-5" />
            Room Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter 5-character code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={5}
                className="text-center text-xl font-mono tracking-widest"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Example: ABC12
              </p>
            </div>
            <Button 
              type="submit"
              className="w-full" 
              size="lg"
              disabled={roomCode.length !== 5 || isLoading}
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomJoiner;