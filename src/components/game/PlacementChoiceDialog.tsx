import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SwitchNode, CableNode, FloatingCable } from "@/types/game";
import { cn } from "@/lib/utils";

interface PlacementTarget {
  id: string;
  name: string;
  image: string;
  capacity?: string; // e.g., "2/3 slots used"
  issues?: string; // e.g., "hacked" or "hacked, power-outage"
}

interface PlacementChoiceDialogProps {
  isOpen: boolean;
  cardType: 'cable' | 'computer';
  cardImage: string;
  cardName: string;
  availableTargets: PlacementTarget[];
  onPlaceFloating: () => void;
  onConnectTo: (targetId: string) => void;
  onCancel: () => void;
}

export function PlacementChoiceDialog({
  isOpen,
  cardType,
  cardImage,
  cardName,
  availableTargets,
  onPlaceFloating,
  onConnectTo,
  onCancel,
}: PlacementChoiceDialogProps) {
  const targetLabel = cardType === 'cable' ? 'Switch' : 'Cable';
  
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-lg bg-background/95 backdrop-blur border-accent-green/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-accent-green flex items-center gap-3">
            <img 
              src={cardImage} 
              alt={cardName}
              className="w-12 h-16 object-contain rounded border border-accent-green/30"
            />
            Where do you want to place this {cardName}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            You have {availableTargets.length > 1 ? `${availableTargets.length} ${targetLabel.toLowerCase()}es` : `a ${targetLabel.toLowerCase()}`} available. 
            Do you want to connect directly or place it unconnected?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 py-4">
          {/* Connect options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Connect to {targetLabel}:</p>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
              {availableTargets.map((target) => (
                <Button
                  key={target.id}
                  variant="outline"
                  className="h-auto p-2 flex flex-col items-center gap-1 hover:border-accent-green hover:bg-accent-green/10"
                  onClick={() => onConnectTo(target.id)}
                >
                  <img 
                    src={target.image} 
                    alt={target.name}
                    className="w-10 h-14 object-contain"
                  />
                  <span className="text-xs">{target.name}</span>
                  {target.capacity && (
                    <span className="text-[10px] text-muted-foreground">{target.capacity}</span>
                  )}
                  {target.issues && (
                    <span className="text-[10px] text-destructive">Under attack: {target.issues}</span>
                  )}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Floating option */}
          <div className="border-t border-border pt-3">
            <Button
              variant="secondary"
              className="w-full flex items-center gap-2 border-dashed border-2 border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20"
              onClick={onPlaceFloating}
            >
              <span className="text-yellow-500">⚡</span>
              Place Unconnected (Floating)
              <span className="text-xs text-muted-foreground ml-auto">Won't score until connected</span>
            </Button>
          </div>
        </div>
        
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Helper to convert switches to placement targets (includes disabled for strategic play)
export function switchesToPlacementTargets(switches: SwitchNode[]): PlacementTarget[] {
  return switches.map((sw, index) => ({
    id: sw.id,
    name: `Switch ${index + 1}${sw.isDisabled ? ' ⚠️' : ''}`,
    image: sw.card.image,
    capacity: sw.isDisabled ? '(disabled)' : undefined,
    issues: sw.attachedIssues.length ? sw.attachedIssues.map(i => i.subtype).join(', ') : undefined,
  }));
}

// Helper to convert cables to placement targets (includes disabled for strategic play)
export function cablesToPlacementTargets(
  switches: SwitchNode[],
  floatingCables: FloatingCable[]
): PlacementTarget[] {
  const targets: PlacementTarget[] = [];
  
  // Connected cables (include disabled ones)
  switches.forEach((sw, switchIndex) => {
    sw.cables.forEach((cable, cableIndex) => {
      const available = cable.maxComputers - cable.computers.length;
      if (available > 0) {
        targets.push({
          id: cable.id,
          name: `Cable ${switchIndex + 1}-${cableIndex + 1}${cable.isDisabled ? ' ⚠️' : ''}`,
          image: cable.card.image,
          capacity: cable.isDisabled 
            ? `${cable.computers.length}/${cable.maxComputers} (disabled)` 
            : `${cable.computers.length}/${cable.maxComputers} used`,
          issues: cable.attachedIssues.length ? cable.attachedIssues.map(i => i.subtype).join(', ') : undefined,
        });
      }
    });
  });
  
  // Include floating cables with available capacity (include disabled)
  floatingCables.forEach((fc, index) => {
    const available = fc.maxComputers - fc.computers.length;
    if (available > 0) {
      targets.push({
        id: fc.id,
        name: `Floating Cable ${index + 1}${fc.isDisabled ? ' ⚠️' : ''}`,
        image: fc.card.image,
        capacity: fc.isDisabled 
          ? `${fc.computers.length}/${fc.maxComputers} (disabled)` 
          : `${fc.computers.length}/${fc.maxComputers} used (unconnected)`,
        issues: fc.attachedIssues.length ? fc.attachedIssues.map(i => i.subtype).join(', ') : undefined,
      });
    }
  });
  
  return targets;
}
