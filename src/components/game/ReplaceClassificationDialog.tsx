import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card as CardType, PlacedCard } from "@/types/game";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";

interface ReplaceClassificationDialogProps {
  isOpen: boolean;
  newCard: CardType;
  existingClassifications: PlacedCard[];
  onReplace: (discardClassificationId: string) => void;
  onCancel: () => void;
}

export function ReplaceClassificationDialog({
  isOpen,
  newCard,
  existingClassifications,
  onReplace,
  onCancel,
}: ReplaceClassificationDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedId) {
      onReplace(selectedId);
      setSelectedId(null);
    }
  };

  const handleCancel = () => {
    setSelectedId(null);
    onCancel();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent className="max-w-md bg-background/95 backdrop-blur border-accent-green/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-accent-green flex items-center gap-3">
            <img 
              src={newCard.image} 
              alt={newCard.name}
              className="w-14 h-20 object-contain rounded border border-accent-green/30"
            />
            Replace a Classification?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            You already have 2 classifications in play. Choose one to discard and replace with <span className="text-accent-green font-semibold">{newCard.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <p className="text-sm font-medium text-foreground mb-3">Select one to replace:</p>
          <div className="flex justify-center gap-4">
            {existingClassifications.map((pc) => {
              const isSelected = selectedId === pc.id;
              return (
                <button
                  key={pc.id}
                  onClick={() => setSelectedId(pc.id)}
                  className={cn(
                    "relative rounded-lg border-2 overflow-hidden transition-all p-1",
                    isSelected 
                      ? "border-destructive ring-2 ring-destructive/50 scale-105" 
                      : "border-gray-600 hover:border-yellow-400"
                  )}
                >
                  <img 
                    src={pc.card.image} 
                    alt={pc.card.name}
                    className="w-20 h-28 object-contain"
                  />
                  <div className="text-xs text-center mt-1 text-muted-foreground">
                    {pc.card.name}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-destructive rounded-full p-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        <AlertDialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedId}
            variant="destructive"
          >
            Replace Selected
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
