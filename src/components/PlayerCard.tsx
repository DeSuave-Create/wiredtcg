
import { Plus, Minus, Trash2, Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Player {
  id: string;
  name: string;
  score: number;
  character: string;
}

interface Character {
  id: string;
  name: string;
  icon: string;
  image: string;
}

interface PlayerCardProps {
  player: Player;
  characters: Character[];
  isLeader: boolean;
  canRemove: boolean;
  onUpdateScore: (playerId: string, change: number) => void;
  onUpdateName: (playerId: string, name: string) => void;
  onUpdateCharacter: (playerId: string, character: string) => void;
  onRemove: (playerId: string) => void;
}

const PlayerCard = ({
  player,
  characters,
  isLeader,
  canRemove,
  onUpdateScore,
  onUpdateName,
  onUpdateCharacter,
  onRemove
}: PlayerCardProps) => {
  const getCharacter = (characterId: string) => {
    return characters.find(c => c.id === characterId) || characters[0];
  };

  const character = getCharacter(player.character);
  const borderColor = isLeader ? 'border-yellow-400 shadow-yellow-400/30' : 'border-blue-500 shadow-blue-500/20';

  return (
    <div className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.03] ${borderColor} border-2 rounded-3xl shadow-2xl bg-gray-900`}>

      {/* ====== MOBILE LAYOUT ====== */}
      <div className="md:hidden relative z-10">
        <div className="flex items-center gap-2 p-2">
          {/* Left: Trash */}
          <div className="flex-shrink-0">
            {canRemove ? (
              <Button
                onClick={() => onRemove(player.id)}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-900/30 h-7 w-7 p-0"
                type="button"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            ) : <div className="h-7 w-7" />}
          </div>

          {/* Card image thumbnail */}
          <div className="flex-shrink-0">
            <img src={character.image} alt={character.name} className="h-12 w-auto object-contain rounded" />
          </div>

          {/* Name + Class dropdown */}
          <div className="flex-1 min-w-0 space-y-1">
            <Input
              value={player.name}
              onChange={(e) => onUpdateName(player.id, e.target.value)}
              className="text-xs font-semibold border-gray-600 h-6 px-2 text-center bg-gray-800 text-white rounded-xl focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500"
            />
            <Select value={player.character} onValueChange={(value) => onUpdateCharacter(player.id, value)}>
              <SelectTrigger className="border-gray-600 bg-gray-800 text-gray-200 text-xs h-5 px-2 rounded-xl focus:ring-0 text-center justify-center">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {characters.map((char) => (
                  <SelectItem key={char.id} value={char.id} className="hover:bg-blue-900/40 text-xs text-gray-200">
                    {char.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Score controls */}
          <div className="flex-shrink-0 flex items-center gap-1">
            <Button onClick={() => onUpdateScore(player.id, -1)} variant="ghost" size="sm" className="text-red-400 hover:bg-gray-700 h-7 w-7 p-0" type="button">
              <Minus className="h-3 w-3" />
            </Button>
            <div className="flex flex-col items-center min-w-[35px]">
              <Bitcoin className="h-3 w-3 text-yellow-400" />
              <div className={`text-sm font-bold text-red-500 leading-none ${isLeader ? 'animate-pulse-bitcoin' : ''}`}>{player.score}</div>
            </div>
            <Button onClick={() => onUpdateScore(player.id, 1)} variant="ghost" size="sm" className="text-blue-400 hover:bg-gray-700 h-7 w-7 p-0" type="button">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* ====== DESKTOP LAYOUT ====== */}
      <div className="hidden md:flex flex-col items-center relative z-10 px-5 py-6 space-y-4">
        {/* Remove button */}
        {canRemove && (
          <Button
            onClick={() => onRemove(player.id)}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-red-400 hover:bg-red-900/30 h-6 w-6 p-0 z-30"
            type="button"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}

        {/* Classification name AS the dropdown */}
        <div className="w-full">
          <Select value={player.character} onValueChange={(value) => onUpdateCharacter(player.id, value)}>
            <SelectTrigger className="border-none text-2xl font-black tracking-wide rounded-xl focus:ring-0 text-center justify-center bg-transparent text-blue-400 uppercase h-auto py-1 [&>svg]:hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {characters.map((char) => (
                <SelectItem key={char.id} value={char.id} className="hover:bg-blue-900/40 text-gray-200">
                  {char.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Player Name */}
        <div className="w-full">
          <Input
            value={player.name}
            onChange={(e) => onUpdateName(player.id, e.target.value)}
            className="text-center font-bold text-lg border-gray-600 rounded-xl bg-gray-800 text-white h-10 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500"
          />
        </div>

        {/* Bitcoins Mined label */}
        <div className="flex items-center justify-center gap-2">
          <Bitcoin className="h-5 w-5 text-yellow-400" />
          <span className="text-sm text-gray-400">Bitcoins Mined</span>
        </div>

        {/* Score */}
        <div className={`text-5xl font-black text-red-500 ${isLeader ? 'animate-pulse-bitcoin' : ''}`}>
          {player.score}
        </div>

        {/* +/- Buttons */}
        <div className="flex justify-center gap-3">
          <Button onClick={() => onUpdateScore(player.id, -1)} variant="outline" size="sm" className="border-gray-600 text-red-400 hover:bg-gray-700 rounded-xl bg-gray-800 w-20" type="button">
            <Minus className="h-4 w-4" />
          </Button>
          <Button onClick={() => onUpdateScore(player.id, 1)} variant="outline" size="sm" className="border-gray-600 text-blue-400 hover:bg-gray-700 rounded-xl bg-gray-800 w-20" type="button">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
