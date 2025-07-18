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
    // Use a consistent player icon for all
    return '👤';
  };

  const borderColor = getBorderColor();

  return (
    <div className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${borderColor} border-2 rounded-3xl shadow-2xl drop-shadow-lg hover:shadow-3xl hover:drop-shadow-2xl`} style={{ backgroundColor: '#fffbef' }}>
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

      {/* Mobile Layout - Compact */}
      <div className="md:hidden p-3 relative z-10">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Trash Button */}
          <div className="flex-shrink-0">
            {canRemove && onRemove && (
              <Button
                onClick={onRemove}
                variant="outline"
                size="sm"
                className={`${borderColor} border-2 text-destructive hover:bg-destructive/10 h-7 w-7 p-0 bg-gray-100 rounded-xl`}
                style={{ backgroundColor: '#f3f4f6' }}
                type="button"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            {!canRemove && <div className="h-7 w-7"></div>}
          </div>
          
          {/* Player Icon */}
          <div className="flex-shrink-0">
            <div className="text-xl">{getPlayerIcon()}</div>
          </div>
          
          {/* Center: Player Name */}
          <div className="flex-1 min-w-0">
            <Input
              value={localName}
              onChange={(e) => {
                setLocalName(e.target.value);
                if (onNameChange) onNameChange(e.target.value);
              }}
              className={`text-xs font-semibold ${borderColor} border-2 h-6 px-2 text-center bg-gray-100 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-inherit focus-visible:ring-0 focus-visible:ring-offset-0`}
              style={{ backgroundColor: '#f3f4f6' }}
              readOnly={!isEditable}
            />
          </div>
          
          {/* Right: Score Controls */}
          <div className="flex-shrink-0 flex items-center gap-1">
            {isEditable && onScoreChange && (
              <Button
                onClick={() => onScoreChange(-1)}
                variant="outline"
                size="sm"
                className={`${borderColor} border-2 text-destructive hover:bg-gray-200 hover:text-destructive h-7 w-7 p-0 bg-gray-100 rounded-xl`}
                style={{ backgroundColor: '#f3f4f6' }}
                type="button"
              >
                <Minus className="h-3 w-3" />
              </Button>
            )}
            
            <div className="flex flex-col items-center min-w-[35px]">
              <Bitcoin className="h-3 w-3 text-yellow-400" />
              <div className={`text-sm font-bold text-red-500 leading-none ${isLeader ? 'animate-pulse' : ''}`}>
                {score}
              </div>
            </div>
            
            {isEditable && onScoreChange && (
              <Button
                onClick={() => onScoreChange(1)}
                variant="outline"
                size="sm"
                className={`${borderColor} border-2 text-primary hover:bg-gray-200 hover:text-primary h-7 w-7 p-0 bg-gray-100 rounded-xl`}
                style={{ backgroundColor: '#f3f4f6' }}
                type="button"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block p-6 space-y-4 relative z-10 bg-gray-100">
        {/* Remove Button - Top Right for Desktop */}
        {canRemove && onRemove && (
          <Button
            onClick={onRemove}
            variant="outline"
            size="sm"
            className={`absolute top-2 right-2 ${borderColor} border-2 text-destructive hover:bg-destructive/10 h-6 w-6 p-0 z-10 rounded-xl`}
            style={{ backgroundColor: '#fffbef' }}
            type="button"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}

        {/* Player Icon Display - EXACTLY like original */}
        <div className="text-center">
          <div className="text-4xl mb-2">{getPlayerIcon()}</div>
          {/* Removed the dropdown but keep the spacing */}
        </div>

        {/* Player Name - EXACTLY like original */}
        <Input
          value={localName}
          onChange={(e) => {
            setLocalName(e.target.value);
            if (onNameChange) onNameChange(e.target.value);
          }}
          className={`text-center font-semibold text-lg ${borderColor} border-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-inherit focus-visible:ring-0 focus-visible:ring-offset-0`}
          style={{ backgroundColor: '#fffbef' }}
          readOnly={!isEditable}
        />

        {/* Bitcoin Score Display - EXACTLY like original */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Bitcoin className="h-6 w-6 text-yellow-400" />
            <span className="text-sm text-muted-foreground">Bitcoins Mined</span>
          </div>
          <div className={`text-4xl font-bold mb-4 text-red-500 ${isLeader ? 'animate-pulse-bitcoin' : ''}`}>
            {score}
          </div>
          
          {/* Score Controls - EXACTLY like original */}
          {isEditable && onScoreChange && (
            <div className="flex flex-col xs:flex-row justify-center gap-2 xs:space-x-2 xs:space-y-0">
              <Button
                onClick={() => onScoreChange(-1)}
                variant="outline"
                size="sm"
                className={`${borderColor} border-2 text-destructive hover:bg-gray-200 hover:text-destructive w-full xs:w-auto rounded-xl`}
                style={{ backgroundColor: '#fffbef' }}
                type="button"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => onScoreChange(1)}
                variant="outline"
                size="sm"
                className={`${borderColor} border-2 text-primary hover:bg-gray-200 hover:text-primary w-full xs:w-auto rounded-xl`}
                style={{ backgroundColor: '#fffbef' }}
                type="button"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
