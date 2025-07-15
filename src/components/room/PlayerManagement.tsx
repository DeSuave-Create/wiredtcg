import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  role: string;
  score: number;
}

interface PlayerManagementProps {
  players: Player[];
  onUpdatePlayers: (players: Player[]) => void;
  onClose: () => void;
}

const AVAILABLE_ROLES = [
  'Network',
  'ISP', 
  'End User',
  'Hacker',
  'Government',
  'Corporation'
];

const PlayerManagement = ({ players, onUpdatePlayers, onClose }: PlayerManagementProps) => {
  const [editablePlayers, setEditablePlayers] = useState<Player[]>(players);

  const addPlayer = () => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: `Player ${editablePlayers.length + 1}`,
      role: 'Network',
      score: 0
    };
    setEditablePlayers([...editablePlayers, newPlayer]);
  };

  const removePlayer = (id: string) => {
    setEditablePlayers(editablePlayers.filter(p => p.id !== id));
  };

  const updatePlayer = (id: string, field: keyof Player, value: string | number) => {
    setEditablePlayers(editablePlayers.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSave = () => {
    onUpdatePlayers(editablePlayers);
    onClose();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Players</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {editablePlayers.map((player) => (
          <div key={player.id} className="flex gap-2 items-center">
            <Input
              placeholder="Player name"
              value={player.name}
              onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
              className="flex-1"
            />
            <Select
              value={player.role}
              onValueChange={(value) => updatePlayer(player.id, 'role', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Score"
              value={player.score}
              onChange={(e) => updatePlayer(player.id, 'score', parseInt(e.target.value) || 0)}
              className="w-20"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => removePlayer(player.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={addPlayer}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Player
          </Button>
          <Button
            onClick={handleSave}
            className="gap-2 ml-auto"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerManagement;