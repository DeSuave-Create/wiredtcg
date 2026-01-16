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
import { FloatingCable } from '@/types/game';
import { cn } from '@/lib/utils';
import { Check, Monitor } from 'lucide-react';

interface ConnectCablesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  floatingCables: FloatingCable[];
  onConfirm: (selectedCableIds: string[]) => void;
}

export function ConnectCablesDialog({
  isOpen,
  onClose,
  floatingCables,
  onConfirm,
}: ConnectCablesDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleCable = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
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

  // Count total computers that would be connected
  const totalComputers = floatingCables
    .filter(c => selectedIds.includes(c.id))
    .reduce((sum, c) => sum + c.computers.length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black/95 border-accent-green/50">
        <DialogHeader>
          <DialogTitle className="text-accent-green font-orbitron">
            Connect Cables to New Switch?
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            You have {floatingCables.length} unconnected cable(s). 
            Select which ones to connect to your new switch.
            <span className="block mt-1 text-yellow-400 text-xs">
              (This is FREE and doesn't use a move!)
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {floatingCables.map((cable) => {
              const isSelected = selectedIds.includes(cable.id);
              const cableType = cable.maxComputers === 2 ? '2-Cable' : '3-Cable';
              const hasComputers = cable.computers.length > 0;
              
              return (
                <button
                  key={cable.id}
                  onClick={() => toggleCable(cable.id)}
                  className={cn(
                    "relative w-20 h-28 rounded-lg border-2 overflow-hidden transition-all flex flex-col",
                    isSelected 
                      ? "border-green-400 ring-2 ring-green-400/50 scale-105" 
                      : "border-gray-600 hover:border-yellow-400"
                  )}
                >
                  <img 
                    src={cable.card.image} 
                    alt={cable.card.name}
                    className="w-full h-16 object-contain"
                  />
                  {hasComputers && (
                    <div className="flex items-center justify-center gap-1 text-xs text-blue-400 bg-black/60 py-1">
                      <Monitor className="w-3 h-3" />
                      <span>{cable.computers.length} PC</span>
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400 text-center py-0.5">
                    {cableType}
                  </div>
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
            Selected: {selectedIds.length} cable(s)
            {totalComputers > 0 && (
              <span className="text-blue-400 ml-2">
                ({totalComputers} computer(s) will be connected!)
              </span>
            )}
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
