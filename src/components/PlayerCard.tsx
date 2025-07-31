import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PlayerCardProps {
  name: string;
  score: number;
  isEditable?: boolean;
  onNameChange?: (name: string) => void;
  onScoreChange?: (change: number) => void;
  onRemove?: () => void;
  canRemove?: boolean;
  isLeader?: boolean;
  cardColor?: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'orange';
}

const PlayerCard = ({ 
  name, 
  score, 
  isEditable = false, 
  onNameChange, 
  onScoreChange,
  onRemove,
  canRemove = false,
  isLeader = false,
  cardColor = 'green'
}: PlayerCardProps) => {
  const [localName, setLocalName] = useState(name);

  useEffect(() => {
    setLocalName(name);
  }, [name]);

  const getBorderColor = () => {
    if (isLeader) return 'border-yellow-400';
    switch (cardColor) {
      case 'green': return 'border-green-600';
      case 'blue': return 'border-blue-600';
      case 'red': return 'border-red-600';
      case 'yellow': return 'border-yellow-600';
      case 'purple': return 'border-purple-600';
      case 'orange': return 'border-orange-600';
      default: return 'border-green-600';
    }
  };

  const getPlayerIcon = () => {
    // Cycle through different character icons based on card color
    switch (cardColor) {
      case 'green': return '🕵️'; // ZeroTrust detective
      case 'blue': return '📡'; // PingMaster satellite  
      case 'red': return '⚖️'; // RedTapeRipper scales
      case 'yellow': return '🕹️'; // ClutchCache gaming
      case 'purple': return '💬'; // DeskJockey chat
      case 'orange': return '⚙️'; // CloudCrafter gear
      default: return '🕵️';
    }
  };

  const borderColor = getBorderColor();

  return (
    <div className={`relative w-full max-w-xs mx-auto h-32 sm:h-96 sm:w-64 overflow-hidden transition-all duration-300 hover:scale-105 ${borderColor} border-2 rounded-3xl shadow-2xl drop-shadow-lg hover:shadow-3xl hover:drop-shadow-2xl`} style={{ backgroundColor: '#fffbef' }}>
      {/* Circuit board pattern background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 80% 20%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 20% 80%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 80% 80%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
          radial-gradient(circle at 50% 50%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
          linear-gradient(rgba(200, 200, 200, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200, 200, 200, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px, 40px 40px, 40px 40px, 40px 40px, 40px 40px, 20px 20px, 20px 20px'
      }}></div>

      {/* Mobile Layout - Horizontal inspired by user drawing */}
      <div className="md:hidden p-4 relative z-10">
        {/* Top Row: Delete, Name, Icon */}
        <div className="flex items-center gap-3 mb-3">
          {/* Delete Button (Red Circle - Left) */}
          <div className="flex-shrink-0">
            {canRemove && onRemove ? (
              <Button
                onClick={onRemove}
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0 rounded-full bg-red-100 border-2 border-red-400 text-red-600 hover:bg-red-200"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <div className="h-10 w-10"></div>
            )}
          </div>
          
          {/* Player Name (Green Rectangle - Center) */}
          <div className="flex-1">
            <Input
              value={localName}
              onChange={(e) => {
                setLocalName(e.target.value);
                if (onNameChange) onNameChange(e.target.value);
              }}
              className="text-center font-semibold text-sm bg-green-100 border-2 border-green-400 rounded-lg h-10 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-green-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              readOnly={!isEditable}
            />
          </div>
          
          {/* Player Icon (Purple Circle - Right) */}
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-purple-100 border-2 border-purple-400 flex items-center justify-center text-lg">
              {getPlayerIcon()}
            </div>
          </div>
        </div>
        
        {/* Bottom Row: Score Section */}
        <div className="flex items-center gap-2">
          {/* Minus Button (Blue Square - Left) */}
          {isEditable && onScoreChange && (
            <Button
              onClick={() => onScoreChange(-1)}
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 rounded-lg bg-blue-100 border-2 border-blue-400 text-blue-600 hover:bg-blue-200"
              type="button"
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
          {!isEditable && <div className="h-10 w-10"></div>}
          
          {/* Score Display (Yellow Rectangle - Center) */}
          <div className="flex-1 h-10 bg-yellow-100 border-2 border-yellow-400 rounded-lg flex items-center justify-center gap-2">
            <Bitcoin className="h-4 w-4 text-yellow-600" />
            <span className={`text-lg font-bold text-yellow-800 ${isLeader ? 'animate-pulse' : ''}`}>
              {score}
            </span>
          </div>
          
          {/* Plus Button (Blue Square - Right) */}
          {isEditable && onScoreChange && (
            <Button
              onClick={() => onScoreChange(1)}
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 rounded-lg bg-blue-100 border-2 border-blue-400 text-blue-600 hover:bg-blue-200"
              type="button"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {!isEditable && <div className="h-10 w-10"></div>}
        </div>
      </div>

      {/* Desktop Layout - Same size as GameCard */}
      <div className="hidden md:flex p-6 space-y-4 relative z-10 h-full flex-col" style={{ backgroundColor: '#fffbef' }}>
        {/* Remove Button - Top Right */}
        {canRemove && onRemove && (
          <Button
            onClick={onRemove}
            variant="outline"
            size="sm"
            className={`absolute top-4 right-4 ${borderColor} border-2 text-destructive hover:bg-destructive/10 h-6 w-6 p-0 z-10 rounded-xl`}
            style={{ backgroundColor: '#fffbef' }}
            type="button"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}

        {/* Player Icon Display - Same layout as GameCard */}
        <div className="text-center mt-4">
          <div className="text-4xl mb-4">{getPlayerIcon()}</div>
        </div>

        {/* Player Name - Same style as GameCard title */}
        <div className="mb-6">
          <Input
            value={localName}
            onChange={(e) => {
              setLocalName(e.target.value);
              if (onNameChange) onNameChange(e.target.value);
            }}
            className={`text-center font-black text-xl tracking-wider uppercase ${borderColor} border-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-inherit focus-visible:ring-0 focus-visible:ring-offset-0 py-2`}
            style={{ backgroundColor: '#fffbef' }}
            readOnly={!isEditable}
          />
        </div>

        {/* Bitcoin Score Display - Center area like GameCard illustration */}
        <div className="flex-1 flex flex-col items-center justify-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bitcoin className="h-6 w-6 text-yellow-400" />
            <span className="text-sm text-muted-foreground font-medium">Bitcoins Mined</span>
          </div>
          <div className={`text-5xl font-bold text-red-500 ${isLeader ? 'animate-pulse-bitcoin' : ''}`}>
            {score}
          </div>
        </div>
          
        {/* Score Controls - Bottom area like GameCard description */}
        {isEditable && onScoreChange && (
          <div className="flex justify-center gap-4 pb-4">
            <Button
              onClick={() => onScoreChange(-1)}
              variant="outline"
              size="lg"
              className={`${borderColor} border-2 text-destructive hover:bg-gray-200 hover:text-destructive px-6 py-3 rounded-xl`}
              style={{ backgroundColor: '#fffbef' }}
              type="button"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onScoreChange(1)}
              variant="outline"
              size="lg"
              className={`${borderColor} border-2 text-primary hover:bg-gray-200 hover:text-primary px-6 py-3 rounded-xl`}
              style={{ backgroundColor: '#fffbef' }}
              type="button"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
