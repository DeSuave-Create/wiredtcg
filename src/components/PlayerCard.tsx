import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface PlayerCardProps {
  name: string;
  score: number;
  isEditable?: boolean;
  onNameChange?: (name: string) => void;
  onScoreChange?: (change: number) => void;
}

const PlayerCard = ({ 
  name, 
  score, 
  isEditable = false, 
  onNameChange, 
  onScoreChange 
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

  return (
    <Card className="w-full max-w-sm bg-card/50 border-primary/20 backdrop-blur-sm hover:bg-card/60 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Player Name */}
          <div className="text-center w-full">
            {isEditable && isEditingName ? (
              <Input
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={handleNameKeyPress}
                className="text-center text-lg font-bold bg-background/80"
                autoFocus
              />
            ) : (
              <h3 
                className={`text-lg font-bold text-primary cursor-${isEditable ? 'pointer' : 'default'}`}
                onClick={() => isEditable && setIsEditingName(true)}
              >
                {localName}
              </h3>
            )}
          </div>

          {/* Score Display */}
          <div className="flex items-center justify-center bg-primary/10 rounded-lg px-6 py-3 min-w-[120px]">
            <span className="text-2xl font-bold text-primary">
              {score}
            </span>
          </div>

          {/* Score Controls */}
          {isEditable && onScoreChange && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScoreChange(-1)}
                className="w-10 h-10 p-0 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScoreChange(1)}
                className="w-10 h-10 p-0 border-primary/50 text-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;