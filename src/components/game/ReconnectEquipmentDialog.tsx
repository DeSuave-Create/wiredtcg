import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SwitchNode, CableNode, FloatingCable, PlacedCard } from "@/types/game";

interface ReconnectTarget {
  id: string;
  name: string;
  image: string;
  capacity?: string;
}

interface ReconnectEquipmentDialogProps {
  isOpen: boolean;
  equipmentType: 'cable' | 'computer';
  equipmentImage: string;
  equipmentName: string;
  availableTargets: ReconnectTarget[];
  onReconnect: (targetId: string) => void;
  onCancel: () => void;
}

export function ReconnectEquipmentDialog({
  isOpen,
  equipmentType,
  equipmentImage,
  equipmentName,
  availableTargets,
  onReconnect,
  onCancel,
}: ReconnectEquipmentDialogProps) {
  const targetLabel = equipmentType === 'cable' ? 'Switch' : 'Cable';
  
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-lg bg-background/95 backdrop-blur border-accent-green/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-accent-green flex items-center gap-3">
            <img 
              src={equipmentImage} 
              alt={equipmentName}
              className="w-12 h-16 object-contain rounded border border-accent-green/30"
            />
            Connect this {equipmentType}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            You have {availableTargets.length > 1 ? `${availableTargets.length} ${targetLabel.toLowerCase()}${targetLabel === 'Switch' ? 'es' : 's'}` : `a ${targetLabel.toLowerCase()}`} available. 
            Would you like to connect this {equipmentType}?
            <span className="block mt-1 text-yellow-400 text-xs">
              (This is FREE and doesn't use a move!)
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Connect to {targetLabel}:</p>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
              {availableTargets.map((target) => (
                <Button
                  key={target.id}
                  variant="outline"
                  className="h-auto p-2 flex flex-col items-center gap-1 hover:border-accent-green hover:bg-accent-green/10"
                  onClick={() => onReconnect(target.id)}
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
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Keep Floating
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Helper to convert switches to reconnect targets
export function switchesToReconnectTargets(switches: SwitchNode[]): ReconnectTarget[] {
  return switches
    .filter(sw => !sw.isDisabled)
    .map((sw, index) => ({
      id: sw.id,
      name: `Switch ${index + 1}`,
      image: sw.card.image,
    }));
}

// Helper to convert cables to reconnect targets (only those with available capacity)
export function cablesToReconnectTargets(
  switches: SwitchNode[],
  floatingCables: FloatingCable[]
): ReconnectTarget[] {
  const targets: ReconnectTarget[] = [];
  
  // Connected cables
  switches.forEach((sw, switchIndex) => {
    if (sw.isDisabled) return;
    sw.cables.forEach((cable, cableIndex) => {
      if (cable.isDisabled) return;
      const available = cable.maxComputers - cable.computers.length;
      if (available > 0) {
        targets.push({
          id: cable.id,
          name: `Cable ${switchIndex + 1}-${cableIndex + 1}`,
          image: cable.card.image,
          capacity: `${cable.computers.length}/${cable.maxComputers} used`,
        });
      }
    });
  });
  
  // Include floating cables with available capacity
  floatingCables.forEach((fc, index) => {
    if (fc.isDisabled) return;
    const available = fc.maxComputers - fc.computers.length;
    if (available > 0) {
      targets.push({
        id: fc.id,
        name: `Floating Cable ${index + 1}`,
        image: fc.card.image,
        capacity: `${fc.computers.length}/${fc.maxComputers} used`,
      });
    }
  });
  
  return targets;
}
