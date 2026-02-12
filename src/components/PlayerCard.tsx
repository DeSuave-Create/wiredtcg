
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
  const borderColor = isLeader ? 'border-yellow-400' : 'border-blue-500';

  return (
    <div className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${borderColor} border-2 rounded-3xl shadow-2xl drop-shadow-lg hover:shadow-3xl hover:drop-shadow-2xl bg-gray-900/95`}>
      {/* Circuit board pattern background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(100, 150, 255, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 80% 20%, rgba(100, 150, 255, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 20% 80%, rgba(100, 150, 255, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 80% 80%, rgba(100, 150, 255, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 50% 50%, rgba(100, 150, 255, 0.3) 2px, transparent 2px),
          linear-gradient(rgba(100, 150, 255, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(100, 150, 255, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px, 40px 40px, 40px 40px, 40px 40px, 40px 40px, 20px 20px, 20px 20px'
      }}></div>

      {/* Mobile Layout - Compact */}
      <div className="md:hidden p-3 relative z-10">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Trash Button */}
          <div className="flex-shrink-0">
            {canRemove && (
              <Button
                onClick={() => onRemove(player.id)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-red-400 hover:bg-red-900/30 h-7 w-7 p-0 bg-gray-800 rounded-xl"
                type="button"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            {!canRemove && <div className="h-7 w-7"></div>}
          </div>
          
          {/* Character Image */}
          <div className="flex-shrink-0">
            <img 
              src={character.image} 
              alt={character.name} 
              className="h-8 w-8 object-contain rounded"
            />
          </div>
          
          {/* Center: Player Name and Character Selection */}
          <div className="flex-1 min-w-0 space-y-1">
            <Input
              value={player.name}
              onChange={(e) => onUpdateName(player.id, e.target.value)}
              className="text-xs font-semibold border-gray-600 border h-6 px-2 text-center bg-gray-800 text-white rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Select value={player.character} onValueChange={(value) => onUpdateCharacter(player.id, value)}>
              <SelectTrigger className="border-gray-600 border bg-gray-800 text-gray-200 text-xs h-5 px-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none text-center justify-center">
                <SelectValue className="text-center" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {characters.map((char) => (
                  <SelectItem key={char.id} value={char.id} className="hover:bg-blue-900/40 text-xs text-center text-gray-200">
                    {char.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Right: Score Controls */}
          <div className="flex-shrink-0 flex items-center gap-1">
            <Button
              onClick={() => onUpdateScore(player.id, -1)}
              variant="outline"
              size="sm"
              className="border-gray-600 text-red-400 hover:bg-gray-700 h-7 w-7 p-0 bg-gray-800 rounded-xl"
              type="button"
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <div className="flex flex-col items-center min-w-[35px]">
              <Bitcoin className="h-3 w-3 text-yellow-400" />
              <div className={`text-sm font-bold text-red-500 leading-none ${isLeader ? 'animate-pulse-bitcoin' : ''}`}>
                {player.score}
              </div>
            </div>
            
            <Button
              onClick={() => onUpdateScore(player.id, 1)}
              variant="outline"
              size="sm"
              className="border-gray-600 text-blue-400 hover:bg-gray-700 h-7 w-7 p-0 bg-gray-800 rounded-xl"
              type="button"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block p-6 space-y-4 relative z-10">
        {/* Remove Button - Top Right for Desktop */}
        {canRemove && (
          <Button
            onClick={() => onRemove(player.id)}
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 border-gray-600 text-red-400 hover:bg-red-900/30 h-6 w-6 p-0 z-10 rounded-xl bg-gray-800"
            type="button"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}

        {/* Character Display */}
        <div className="text-center">
          <img 
            src={character.image} 
            alt={character.name} 
            className="h-20 w-auto object-contain mx-auto mb-2 rounded-lg"
          />
          <Select value={player.character} onValueChange={(value) => onUpdateCharacter(player.id, value)}>
            <SelectTrigger className="border-gray-600 border text-sm rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none text-center justify-center bg-gray-800 text-gray-200">
              <SelectValue className="text-center" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {characters.map((char) => (
                <SelectItem key={char.id} value={char.id} className="hover:bg-blue-900/40 text-center text-gray-200">
                  {char.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Player Name */}
        <Input
          value={player.name}
          onChange={(e) => onUpdateName(player.id, e.target.value)}
          className="text-center font-semibold text-lg border-gray-600 border rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0 bg-gray-800 text-white"
        />

        {/* Bitcoin Score Display */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Bitcoin className="h-6 w-6 text-yellow-400" />
            <span className="text-sm text-gray-400">Bitcoins Mined</span>
          </div>
          <div className={`text-4xl font-bold mb-4 text-red-500 ${isLeader ? 'animate-pulse-bitcoin' : ''}`}>
            {player.score}
          </div>
          
          {/* Score Controls */}
          <div className="flex flex-col xs:flex-row justify-center gap-2 xs:space-x-2 xs:space-y-0">
            <Button
              onClick={() => onUpdateScore(player.id, -1)}
              variant="outline"
              size="sm"
              className="border-gray-600 text-red-400 hover:bg-gray-700 w-full xs:w-auto rounded-xl bg-gray-800"
              type="button"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onUpdateScore(player.id, 1)}
              variant="outline"
              size="sm"
              className="border-gray-600 text-blue-400 hover:bg-gray-700 w-full xs:w-auto rounded-xl bg-gray-800"
              type="button"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
