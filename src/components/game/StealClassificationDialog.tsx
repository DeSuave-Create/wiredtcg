import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlacedCard } from '@/types/game';
import { cn } from '@/lib/utils';

interface StealClassificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  opponentClassifications: PlacedCard[];
  playerClassifications: PlacedCard[];
  cardName: string; // "Head Hunter" or "Seal the Deal"
  onSteal: (classificationId: string) => void;
}

const abilityDescriptions: Record<string, string> = {
  'security-specialist': 'Auto-resolves Hacked attacks',
  'facilities': 'Auto-resolves Power Outage attacks',
  'supervisor': 'Auto-resolves New Hire attacks',
  'field-tech': '+1 Move per turn',
  'head-hunter': 'Steals opponent classification',
  'seal-the-deal': 'Unblockable steal',
};

export function StealClassificationDialog({
  isOpen,
  onClose,
  opponentClassifications,
  playerClassifications,
  cardName,
  onSteal,
}: StealClassificationDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Check which classifications can be stolen (player doesn't already have 2 of same type)
  const canSteal = (classification: PlacedCard): boolean => {
    const subtype = classification.card.subtype;
    const playerCount = playerClassifications.filter(c => c.card.subtype === subtype).length;
    return playerCount < 2;
  };

  const stealableClassifications = opponentClassifications.filter(canSteal);
  const blockedClassifications = opponentClassifications.filter(c => !canSteal(c));

  const handleConfirm = () => {
    if (selectedId) {
      onSteal(selectedId);
      setSelectedId(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-purple-500/50">
        <DialogHeader>
          <DialogTitle className="text-purple-300 flex items-center gap-2">
            🎯 {cardName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose which opponent classification to steal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {stealableClassifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No classifications can be stolen (you already have duplicates of each type)
            </div>
          ) : (
            <div className="grid gap-3">
              {stealableClassifications.map((classification) => (
                <button
                  key={classification.id}
                  onClick={() => setSelectedId(classification.id)}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg border-2 transition-all",
                    selectedId === classification.id
                      ? "border-purple-500 bg-purple-900/40"
                      : "border-gray-700 bg-gray-800/50 hover:border-purple-500/50"
                  )}
                >
                  <div className="w-12 h-16 rounded border border-purple-500/50 overflow-hidden flex-shrink-0">
                    <img
                      src={classification.card.image}
                      alt={classification.card.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white">{classification.card.name}</div>
                    <div className="text-sm text-purple-300">
                      {abilityDescriptions[classification.card.subtype] || classification.card.description}
                    </div>
                  </div>
                  {selectedId === classification.id && (
                    <div className="text-purple-400">✓</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {blockedClassifications.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-xs text-muted-foreground mb-2">
                Cannot steal (you already have this type):
              </div>
              <div className="flex gap-2">
                {blockedClassifications.map((classification) => (
                  <div
                    key={classification.id}
                    className="w-10 h-14 rounded border border-gray-600 overflow-hidden opacity-50"
                  >
                    <img
                      src={classification.card.image}
                      alt={classification.card.name}
                      className="w-full h-full object-contain grayscale"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedId}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Steal Classification
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
