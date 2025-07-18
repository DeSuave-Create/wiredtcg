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
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    setLocalName(name);
  }, [name]);

  const handleNameSubmit = () => {
    if (onNameChange && localName.trim()) {
      onNameChange(localName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setLocalName(name);
      setIsEditingName(false);
    }
  };

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
    // Cycle through different player icons based on card color
    switch (cardColor) {
      case 'green': return '👤';
      case 'blue': return '🎮';
      case 'red': return '⚡';
      case 'yellow': return '🌟';
      case 'purple': return '🔮';
      case 'orange': return '🔥';
      default: return '👤';
    }
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
            {isEditable && isEditingName ? (
              <Input
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={handleNameKeyPress}
                className={`text-xs font-semibold ${borderColor} border-2 h-6 px-2 text-center bg-gray-100 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-inherit focus-visible:ring-0 focus-visible:ring-offset-0`}
                style={{ backgroundColor: '#f3f4f6' }}
                autoFocus
              />
            ) : (
              <div 
                className={`text-xs font-semibold text-center cursor-${isEditable ? 'pointer' : 'default'} py-1`}
                onClick={() => isEditable && setIsEditingName(true)}
              >
                {localName}{isLeader && ' 👑'}
              </div>
            )}
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
      <div className="hidden md:block p-6 space-y-4 relative z-10" style={{ backgroundColor: '#fffbef' }}>
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

        {/* Player Icon Display */}
        <div className="text-center">
          <div className="text-4xl mb-2">{getPlayerIcon()}</div>
          <div className="text-sm text-muted-foreground">Custom Player</div>
        </div>

        {/* Player Name */}
        {isEditable && isEditingName ? (
          <Input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleNameKeyPress}
            className={`text-center font-semibold text-lg ${borderColor} border-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-inherit focus-visible:ring-0 focus-visible:ring-offset-0`}
            style={{ backgroundColor: '#fffbef' }}
            autoFocus
          />
        ) : (
          <div
            className={`text-center font-semibold text-lg cursor-${isEditable ? 'pointer' : 'default'} py-2`}
            onClick={() => isEditable && setIsEditingName(true)}
          >
            {localName}{isLeader && ' 👑'}
          </div>
        )}

        {/* Bitcoin Score Display */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Bitcoin className="h-6 w-6 text-yellow-400" />
            <span className="text-sm text-muted-foreground">Bitcoins Mined</span>
          </div>
          <div className={`text-4xl font-bold mb-4 text-red-500 ${isLeader ? 'animate-pulse' : ''}`}>
            {score}
          </div>
          
          {/* Score Controls */}
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