import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AuditBattle, Player } from '@/types/game';
import { Monitor, Check } from 'lucide-react';

interface AuditComputerSelectionDialogProps {
  isOpen: boolean;
  auditBattle: AuditBattle;
  players: Player[];
  currentPlayerId: string;
  onToggleSelection: (computerId: string) => void;
  onConfirm: () => void;
}

export function AuditComputerSelectionDialog({
  isOpen,
  auditBattle,
  players,
  currentPlayerId,
  onToggleSelection,
  onConfirm,
}: AuditComputerSelectionDialogProps) {
  const auditor = players[auditBattle.auditorIndex];
  const target = players[auditBattle.targetIndex];
  const isAuditor = auditor.id === currentPlayerId;
  
  const availableComputers = auditBattle.availableComputers || [];
  const selectedIds = auditBattle.selectedComputerIds || [];
  const requiredCount = auditBattle.computersToReturn;
  const canConfirm = selectedIds.length === requiredCount;
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="bg-gray-900 border-yellow-500/50 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-yellow-400 flex items-center gap-2">
            <Monitor className="w-6 h-6" />
            Select Computers to Return
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {isAuditor 
              ? `Select ${requiredCount} computer(s) from ${target.name}'s network to return to their hand`
              : `${auditor.name} is selecting computers from your network...`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selection counter */}
          <div className="bg-black/50 rounded-lg p-3 text-center">
            <span className="text-2xl font-bold text-yellow-400">{selectedIds.length}</span>
            <span className="text-gray-400"> / </span>
            <span className="text-xl text-gray-300">{requiredCount}</span>
            <span className="text-sm text-gray-400 ml-2">computers selected</span>
          </div>

          {/* Available computers grid */}
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Available Computers ({availableComputers.length})</h4>
            
            {availableComputers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No computers available</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableComputers.map(comp => {
                  const isSelected = selectedIds.includes(comp.id);
                  return (
                    <button
                      key={comp.id}
                      onClick={() => isAuditor && onToggleSelection(comp.id)}
                      disabled={!isAuditor}
                      className={`relative p-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-yellow-400 bg-yellow-500/20 ring-2 ring-yellow-400/50'
                          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                      } ${isAuditor ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                    >
                      {/* Selection checkmark */}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                      )}
                      
                      {/* Computer card image */}
                      <div className="w-full aspect-[2/3] rounded overflow-hidden mb-1">
                        <img 
                          src={comp.card.image} 
                          alt="Computer"
                          className="w-full h-full object-contain bg-black"
                        />
                      </div>
                      
                      {/* Location label */}
                      <div className="text-xs text-gray-400 truncate" title={comp.location}>
                        {comp.location}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          {isAuditor && (
            <Button
              onClick={onConfirm}
              disabled={!canConfirm}
              className={`w-full ${
                canConfirm 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black font-bold' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canConfirm 
                ? `Confirm Selection (${selectedIds.length} computer${selectedIds.length !== 1 ? 's' : ''})` 
                : `Select ${requiredCount - selectedIds.length} more computer(s)`
              }
            </Button>
          )}

          {!isAuditor && (
            <div className="text-center text-gray-400 py-2">
              Waiting for {auditor.name} to select computers...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}