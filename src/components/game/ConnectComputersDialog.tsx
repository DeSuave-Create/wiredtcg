import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlacedCard } from '@/types/game';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ConnectComputersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  floatingComputers: PlacedCard[];
  maxConnections: number;
  cableType: string;
  onConfirm: (selectedComputerIds: string[]) => void;
}

export function ConnectComputersDialog({
  isOpen,
  onClose,
  floatingComputers,
  maxConnections,
  cableType,
  onConfirm,
}: ConnectComputersDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleComputer = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= maxConnections) {
        // Replace the first selected with this one
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
    setSelectedIds([]);
  };

  const handleSkip = () => {
    onConfirm([]);
    setSelectedIds([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black/95 border-accent-green/50">
        <DialogHeader>
          <DialogTitle className="text-accent-green font-orbitron">
            Connect Computers?
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            You have {floatingComputers.length} floating computer(s). 
            Select up to {maxConnections} to connect to your new {cableType === 'cable-2' ? '2-port' : '3-port'} cable.
            <span className="block mt-1 text-yellow-400 text-xs">
              (This is FREE and doesn't use a move!)
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {floatingComputers.map((comp) => {
              const isSelected = selectedIds.includes(comp.id);
              return (
                <button
                  key={comp.id}
                  onClick={() => toggleComputer(comp.id)}
                  className={cn(
                    "relative w-16 h-20 rounded-lg border-2 overflow-hidden transition-all",
                    isSelected 
                      ? "border-green-400 ring-2 ring-green-400/50 scale-105" 
                      : "border-gray-600 hover:border-yellow-400"
                  )}
                >
                  <img 
                    src={comp.card.image} 
                    alt={comp.card.name}
                    className="w-full h-full object-contain"
                  />
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-green-500 rounded-bl p-0.5">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="text-center mt-3 text-sm text-gray-400">
            Selected: {selectedIds.length}/{maxConnections}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Skip
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            className="bg-accent-green hover:bg-accent-green/80 text-black font-bold"
          >
            Connect {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
