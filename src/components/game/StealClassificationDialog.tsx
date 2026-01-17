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
  onSteal: (classificationId: string, discardClassificationId?: string) => void;
}

const abilityDescriptions: Record<string, string> = {
  'security-specialist': 'Auto-resolves Hacked attacks',
  'facilities': 'Auto-resolves Power Outage attacks',
  'supervisor': 'Auto-resolves New Hire attacks',
  'field-tech': '+1 Move per turn',
  'head-hunter': 'Steals opponent classification',
  'seal-the-deal': 'Unblockable steal',
};

type DialogStep = 'select-steal' | 'confirm-swap' | 'select-discard';

export function StealClassificationDialog({
  isOpen,
  onClose,
  opponentClassifications,
  playerClassifications,
  cardName,
  onSteal,
}: StealClassificationDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState<DialogStep>('select-steal');
  const [discardId, setDiscardId] = useState<string | null>(null);

  const playerAtMax = playerClassifications.length >= 2;
  const selectedCard = opponentClassifications.find(c => c.id === selectedId);

  // Check which classifications can be stolen (player doesn't already have same type, OR player will swap)
  const canSteal = (classification: PlacedCard): boolean => {
    const subtype = classification.card.subtype;
    const playerCount = playerClassifications.filter(c => c.card.subtype === subtype).length;
    // Can steal if player has less than 2 of this type (can have duplicates for protection)
    // OR if player is at max and will swap one out
    if (playerAtMax) {
      // When at max, can steal if at least one of player's classifications is a different type
      // (they can discard that one to make room)
      return playerClassifications.some(c => c.card.subtype !== subtype) || playerCount < 2;
    }
    return playerCount < 2;
  };

  const stealableClassifications = opponentClassifications.filter(canSteal);
  const blockedClassifications = opponentClassifications.filter(c => !canSteal(c));

  const handleConfirmSteal = () => {
    if (!selectedId) return;
    
    if (playerAtMax) {
      // Move to confirm swap step
      setStep('confirm-swap');
    } else {
      // Direct steal - no swap needed
      onSteal(selectedId);
      handleReset();
    }
  };

  const handleConfirmSwap = (wantToPlay: boolean) => {
    if (!wantToPlay) {
      // Steal but discard immediately (don't play it)
      onSteal(selectedId!, undefined);
      handleReset();
    } else {
      // Move to select which card to discard
      setStep('select-discard');
    }
  };

  const handleConfirmDiscard = () => {
    if (!selectedId || !discardId) return;
    onSteal(selectedId, discardId);
    handleReset();
  };

  const handleReset = () => {
    setSelectedId(null);
    setStep('select-steal');
    setDiscardId(null);
    onClose();
  };

  const handleBack = () => {
    if (step === 'confirm-swap') {
      setStep('select-steal');
    } else if (step === 'select-discard') {
      setStep('confirm-swap');
      setDiscardId(null);
    }
  };

  const renderSelectSteal = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-purple-300 flex items-center gap-2">
          🎯 {cardName}
        </DialogTitle>
        <DialogDescription className="text-gray-400">
          Choose which opponent classification to steal
          {playerAtMax && (
            <span className="block mt-1 text-yellow-400">
              ⚠️ You have 2 classifications - you'll need to discard one to play the stolen card
            </span>
          )}
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
                <div className="w-16 h-24 rounded border border-purple-500/50 overflow-hidden flex-shrink-0">
                  <img
                    src={classification.card.image}
                    alt={classification.card.name}
                    className="w-full h-full object-cover"
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
                  className="w-12 h-18 rounded border border-gray-600 overflow-hidden opacity-50"
                >
                  <img
                    src={classification.card.image}
                    alt={classification.card.name}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirmSteal}
          disabled={!selectedId}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {playerAtMax ? 'Next' : 'Steal Classification'}
        </Button>
      </div>
    </>
  );

  const renderConfirmSwap = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-yellow-300 flex items-center gap-2">
          ⚠️ Play Stolen Card?
        </DialogTitle>
        <DialogDescription className="text-gray-400">
          You're stealing <span className="text-purple-300 font-medium">{selectedCard?.card.name}</span>.
          <br />
          You already have 2 classifications. Do you want to play the stolen card?
        </DialogDescription>
      </DialogHeader>

      <div className="py-6 flex justify-center">
        {selectedCard && (
          <div className="w-28 h-40 rounded-lg border-2 border-purple-500 overflow-hidden shadow-lg shadow-purple-500/30">
            <img
              src={selectedCard.card.image}
              alt={selectedCard.card.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => handleConfirmSwap(true)}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          ✅ Yes, play it (discard one of mine)
        </Button>
        <Button
          onClick={() => handleConfirmSwap(false)}
          variant="outline"
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          ❌ No, just steal and discard it
        </Button>
        <Button
          onClick={handleBack}
          variant="ghost"
          className="w-full"
        >
          ← Back
        </Button>
      </div>
    </>
  );

  const renderSelectDiscard = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-red-300 flex items-center gap-2">
          🗑️ Choose Classification to Discard
        </DialogTitle>
        <DialogDescription className="text-gray-400">
          Select which of your classifications to discard to make room for{' '}
          <span className="text-purple-300 font-medium">{selectedCard?.card.name}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <div className="grid gap-3">
          {playerClassifications.map((classification) => (
            <button
              key={classification.id}
              onClick={() => setDiscardId(classification.id)}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg border-2 transition-all",
                discardId === classification.id
                  ? "border-red-500 bg-red-900/40"
                  : "border-gray-700 bg-gray-800/50 hover:border-red-500/50"
              )}
            >
              <div className="w-16 h-24 rounded border border-red-500/50 overflow-hidden flex-shrink-0">
                <img
                  src={classification.card.image}
                  alt={classification.card.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-white">{classification.card.name}</div>
                <div className="text-sm text-red-300">
                  {abilityDescriptions[classification.card.subtype] || classification.card.description}
                </div>
              </div>
              {discardId === classification.id && (
                <div className="text-red-400">🗑️</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-2">
        <Button variant="ghost" onClick={handleBack}>
          ← Back
        </Button>
        <Button
          onClick={handleConfirmDiscard}
          disabled={!discardId}
          className="bg-red-600 hover:bg-red-700"
        >
          Discard & Play Stolen
        </Button>
      </div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-purple-500/50">
        {step === 'select-steal' && renderSelectSteal()}
        {step === 'confirm-swap' && renderConfirmSwap()}
        {step === 'select-discard' && renderSelectDiscard()}
      </DialogContent>
    </Dialog>
  );
}
