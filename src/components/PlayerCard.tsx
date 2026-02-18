
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
  artworkScale?: string;
  defaultScale?: number;
  artworkOffsetY?: string;
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
    return characters.find((c) => c.id === characterId) || characters[0];
  };

  const character = getCharacter(player.character);
  const artworkScale = character.defaultScale || 0.9;

  const roleColors: Record<string, {text: string; rgb: string;}> = {
    'security-specialist': { text: 'text-red-400', rgb: '239, 68, 68' },
    'facilities': { text: 'text-yellow-400', rgb: '250, 204, 21' },
    'supervisor': { text: 'text-green-400', rgb: '34, 197, 94' },
    'field-tech': { text: 'text-blue-400', rgb: '59, 130, 246' },
    'headhunter': { text: 'text-teal-400', rgb: '20, 184, 166' },
    'auditor': { text: 'text-pink-400', rgb: '236, 72, 153' }
  };
  const colors = roleColors[player.character] || roleColors['security-specialist'];
  const rgb = colors.rgb;

  const cardBorderStyle: React.CSSProperties = isLeader
    ? {
        border: '3px solid rgba(200, 180, 255, 0.9)',
        boxShadow: `0 0 4px rgba(255,255,255,0.7), 0 0 10px rgba(200,170,255,0.5), 0 0 20px rgba(160,120,255,0.3), 0 0 35px rgba(140,100,255,0.15), inset 0 0 12px rgba(255,255,255,0.10), inset 0 0 1px rgba(255,255,255,0.40)`,
      }
    : {
        border: `3px solid rgba(${rgb}, 0.85)`,
        boxShadow: `0 0 18px rgba(${rgb}, 0.35), 0 0 42px rgba(255,255,255,0.12), inset 0 0 12px rgba(255,255,255,0.10), inset 0 0 1px rgba(255,255,255,0.40)`,
      };

  const prismaticBg = isLeader
    ? `linear-gradient(135deg, rgba(200,180,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(200,180,255,0.12) 100%)`
    : `linear-gradient(135deg, rgba(${rgb},0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(${rgb},0.12) 100%)`;

  return (
    <div
      className="relative overflow-hidden transition-all duration-300 hover:scale-[1.03] rounded-3xl"
      style={{
        backgroundImage: `url('/lovable-uploads/a08479d2-01b1-41b6-8666-5ded32438273.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        ...cardBorderStyle,
      }}>

      {/* Prismatic gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', borderRadius: 'inherit', background: prismaticBg }} />
      {/* Corner illumination */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', borderRadius: 'inherit', background: 'radial-gradient(ellipse at 10% 10%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at 90% 90%, rgba(255,255,255,0.08) 0%, transparent 50%)' }} />


      {/* ====== MOBILE LAYOUT ====== */}
      <div className="md:hidden relative z-10">
        <div className="flex items-center gap-2 p-2">
          {/* Left: Trash */}
          <div className="flex-shrink-0">
            {canRemove ?
            <Button
              onClick={() => onRemove(player.id)}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-red-900/30 h-7 w-7 p-0"
              type="button">

                <Trash2 className="h-3 w-3" />
              </Button> :
            <div className="h-7 w-7" />}
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
              className="text-xs font-semibold border-gray-600 h-6 px-2 text-center bg-gray-800 text-white rounded-xl focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500" />

            <Select value={player.character} onValueChange={(value) => onUpdateCharacter(player.id, value)}>
              <SelectTrigger className="border-gray-600 bg-gray-800 text-gray-200 text-xs h-5 px-2 rounded-xl focus:ring-0 text-center justify-center">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {characters.map((char) =>
                <SelectItem key={char.id} value={char.id} className="hover:bg-blue-900/40 text-xs text-gray-200">
                    {char.name}
                  </SelectItem>
                )}
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
              <div className={`text-sm font-bold text-red-500 leading-none`}>{player.score}</div>
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
        {canRemove &&
        <Button
          onClick={() => onRemove(player.id)}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-red-400 hover:bg-red-900/30 h-6 w-6 p-0 z-30"
          type="button">

            <Trash2 className="h-3 w-3" />
          </Button>
        }

        {/* Classification name AS the dropdown */}
        <div className="w-full">
          <Select value={player.character} onValueChange={(value) => onUpdateCharacter(player.id, value)}>
            <SelectTrigger
              className={`text-[26px] font-black tracking-wide rounded-xl text-center justify-center bg-transparent ${colors.text} uppercase h-auto py-1 hover:underline cursor-pointer [&>span]:truncate w-full whitespace-nowrap`}
              style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
            >
              <SelectValue>{character.name}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {characters.map((char) =>
              <SelectItem key={char.id} value={char.id} className="hover:bg-blue-900/40 text-gray-200">
                  {char.name}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Player Name */}
        <div className="w-full">
          <Input
            value={player.name}
            onChange={(e) => onUpdateName(player.id, e.target.value)}
            className="text-center font-bold text-[24px] border-gray-600 rounded-xl bg-gray-800 text-white h-10 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500" />

        </div>

        {/* Bitcoins Mined label */}
        <div className="flex items-center justify-center gap-2">
          <Bitcoin className="h-6 w-6 text-yellow-400" />
          <span className="text-[20px] text-gray-400">Bitcoins Mined</span>
        </div>

        {/* Score */}
        <div className={`font-black h-[60px] flex items-center justify-center ${isLeader ? 'text-[54px] text-yellow-600' : 'text-5xl text-red-500'}`}>
          {player.score}
        </div>

        {/* Classification artwork */}
        <div className="flex-1 flex items-center justify-center w-full overflow-hidden p-0">
          <img
            src={character.artwork || character.image}
            alt={character.name}
            className="w-full h-full object-contain opacity-90 border-0 shadow-none"
            style={{ transform: `scale(${artworkScale}) translateY(${character.artworkOffsetY || '0px'})` }} />
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
    </div>);

};

export default PlayerCard;