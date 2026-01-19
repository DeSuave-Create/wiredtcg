import { Card } from '@/types/game';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SelectedCardSource } from '@/contexts/MobileGameContext';

interface MobileSelectionBarProps {
  selectedCard: Card | null;
  selectedCardSource: SelectedCardSource;
  onCancel: () => void;
}

export function MobileSelectionBar({ 
  selectedCard, 
  selectedCardSource,
  onCancel 
}: MobileSelectionBarProps) {
  if (!selectedCard) return null;

  const getSourceLabel = () => {
    switch (selectedCardSource) {
      case 'hand': return 'From Hand';
      case 'classification': return 'Classification';
      case 'placed': return 'Equipment';
      case 'audited': return 'Audited';
      default: return '';
    }
  };

  const getPlacementHint = () => {
    const subtype = selectedCard.subtype;
    switch (subtype) {
      case 'switch':
        return 'Tap your network to place';
      case 'cable-2':
      case 'cable-3':
        return 'Tap a switch or network board';
      case 'computer':
        return 'Tap a cable or network board';
      case 'hacked':
      case 'power-outage':
      case 'new-hire':
        return "Tap opponent's equipment";
      case 'audit':
        return "Tap opponent's network";
      case 'secured':
      case 'powered':
      case 'trained':
      case 'helpdesk':
        return 'Tap your disabled equipment';
      case 'security-specialist':
      case 'facilities':
      case 'supervisor':
      case 'field-tech':
        return 'Tap your classification zone';
      case 'head-hunter':
      case 'seal-the-deal':
        return "Tap opponent's classification";
      default:
        return 'Tap a valid target';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 border-t-2 border-accent-green/50 backdrop-blur-sm safe-area-inset-bottom">
      <div className="flex items-center gap-3 p-3 max-w-screen-lg mx-auto">
        {/* Card Preview */}
        <div className="w-12 h-16 rounded border-2 border-accent-green overflow-hidden flex-shrink-0">
          <img 
            src={selectedCard.image} 
            alt={selectedCard.name}
            className="w-full h-full object-contain bg-black"
          />
        </div>

        {/* Card Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-accent-green truncate">
              {selectedCard.name}
            </span>
            <span className="text-[10px] text-muted-foreground bg-gray-800 px-1.5 py-0.5 rounded">
              {getSourceLabel()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {getPlacementHint()}
          </p>
        </div>

        {/* Cancel Button */}
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className={cn(
            "border-red-500/50 text-red-400 hover:bg-red-500/20 px-3",
            "min-h-[44px] min-w-[44px]" // Touch target
          )}
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
