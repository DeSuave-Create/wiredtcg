
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
  artwork?: string;
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

  const roleColors: Record<string, { border: string; text: string; shadow: string }> = {
    'security-specialist': { border: 'border-red-500', text: 'text-red-400', shadow: 'shadow-red-500/20' },
    'facilities': { border: 'border-yellow-400', text: 'text-yellow-400', shadow: 'shadow-yellow-400/20' },
    'supervisor': { border: 'border-green-500', text: 'text-green-400', shadow: 'shadow-green-500/20' },
    'field-tech': { border: 'border-blue-500', text: 'text-blue-400', shadow: 'shadow-blue-500/20' },
  };
  const colors = roleColors[player.character] || roleColors['security-specialist'];
  const borderColor = `${colors.border} ${colors.shadow}`;
  const leaderGlow = isLeader ? { textShadow: '0 0 20px rgba(250, 204, 21, 0.8), 0 0 40px rgba(250, 204, 21, 0.4)' } : undefined;

  const leaderBorderStyle = isLeader ? {
    borderColor: 'rgba(200, 180, 255, 0.9)',
    boxShadow: '0 0 4px rgba(255, 255, 255, 0.7), 0 0 10px rgba(200, 170, 255, 0.5), 0 0 20px rgba(160, 120, 255, 0.3), 0 0 35px rgba(140, 100, 255, 0.15)',
  } : undefined;

  return (
    <div
      className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.03] ${isLeader ? '' : borderColor} border-2 rounded-3xl ${isLeader ? '' : 'shadow-2xl'}`}
      style={{
        backgroundImage: `url('/lovable-uploads/a08479d2-01b1-41b6-8666-5ded32438273.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        ...leaderBorderStyle,
      }}
    >

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
              <div className={`text-sm font-bold text-red-500 leading-none ${isLeader ? 'animate-pulse-bitcoin' : ''}`} style={leaderGlow}>{player.score}</div>
            </div>
            <Button onClick={() => onUpdateScore(player.id, 1)} variant="ghost" size="sm" className="text-blue-400 hover:bg-gray-700 h-7 w-7 p-0" type="button">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* ====== DESKTOP LAYOUT ====== */}
      <div className="hidden md:flex flex-col items-center relative z-10 px-5 py-6 space-y-3 aspect-[5/7]">
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
            <SelectTrigger className={`border-none text-lg font-black tracking-wide rounded-xl focus:ring-0 text-center justify-center bg-transparent ${colors.text} uppercase h-auto py-1 hover:underline cursor-pointer [&>span]:truncate w-full whitespace-nowrap`}>
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
        <div className={`text-5xl font-black text-red-500 ${isLeader ? 'animate-pulse-bitcoin' : ''}`} style={leaderGlow}>
          {player.score}
        </div>

        {/* Classification artwork */}
        <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
          <img
            src={character.artwork || character.image}
            alt={character.name}
            className="w-3/4 h-auto object-contain opacity-90 border-0 shadow-none"
          />
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
