import { PlayerNetwork, SwitchNode, CableNode, PlacedCard, Card } from '@/types/game';
import { cn } from '@/lib/utils';

interface NetworkBoardProps {
  network: PlayerNetwork;
  isCurrentPlayer: boolean;
  selectedCard: Card | null;
  onPlayCable?: (switchId: string) => void;
  onPlayComputer?: (cableId: string) => void;
  label: string;
}

export function NetworkBoard({
  network,
  isCurrentPlayer,
  selectedCard,
  onPlayCable,
  onPlayComputer,
  label,
}: NetworkBoardProps) {
  const canPlayCableHere = selectedCard?.subtype === 'cable-2' || selectedCard?.subtype === 'cable-3';
  const canPlayComputerHere = selectedCard?.subtype === 'computer';

  return (
    <div className="bg-black/30 rounded-lg p-4 border border-accent-green/30">
      <h3 className="text-sm font-semibold text-accent-green mb-3">{label}</h3>
      
      {/* Internet connection point */}
      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/30">
          INTERNET
        </div>
      </div>
      
      {/* Switches */}
      <div className="space-y-4">
        {network.switches.map((sw) => (
          <SwitchComponent
            key={sw.id}
            switchNode={sw}
            isCurrentPlayer={isCurrentPlayer}
            canPlayCable={canPlayCableHere}
            canPlayComputer={canPlayComputerHere}
            onPlayCable={onPlayCable}
            onPlayComputer={onPlayComputer}
          />
        ))}
        
        {network.switches.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            {isCurrentPlayer ? 'Play a Switch card to start building!' : 'No network yet'}
          </div>
        )}
      </div>
    </div>
  );
}

interface SwitchComponentProps {
  switchNode: SwitchNode;
  isCurrentPlayer: boolean;
  canPlayCable: boolean;
  canPlayComputer: boolean;
  onPlayCable?: (switchId: string) => void;
  onPlayComputer?: (cableId: string) => void;
}

function SwitchComponent({
  switchNode,
  isCurrentPlayer,
  canPlayCable,
  canPlayComputer,
  onPlayCable,
  onPlayComputer,
}: SwitchComponentProps) {
  return (
    <div className="relative">
      {/* Connection line to Internet */}
      <div className="absolute left-1/2 -top-4 w-0.5 h-4 bg-accent-green/50" />
      
      {/* Switch card */}
      <div
        onClick={() => canPlayCable && onPlayCable?.(switchNode.id)}
        className={cn(
          "w-16 h-20 mx-auto rounded border-2 overflow-hidden",
          switchNode.isDisabled ? "border-red-500 opacity-50" : "border-green-500",
          canPlayCable && isCurrentPlayer && "cursor-pointer hover:ring-2 hover:ring-yellow-400"
        )}
      >
        <img 
          src={switchNode.card.image} 
          alt="Switch"
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Cables */}
      {switchNode.cables.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-2 pl-8">
          {switchNode.cables.map((cable) => (
            <CableComponent
              key={cable.id}
              cable={cable}
              isCurrentPlayer={isCurrentPlayer}
              canPlayComputer={canPlayComputer}
              onPlayComputer={onPlayComputer}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CableComponentProps {
  cable: CableNode;
  isCurrentPlayer: boolean;
  canPlayComputer: boolean;
  onPlayComputer?: (cableId: string) => void;
}

function CableComponent({
  cable,
  isCurrentPlayer,
  canPlayComputer,
  onPlayComputer,
}: CableComponentProps) {
  const hasSpace = cable.computers.length < cable.maxComputers;
  
  return (
    <div className="relative">
      {/* Connection line to Switch */}
      <div className="absolute left-1/2 -top-2 w-0.5 h-2 bg-green-500/50" />
      
      {/* Cable card */}
      <div
        onClick={() => canPlayComputer && hasSpace && onPlayComputer?.(cable.id)}
        className={cn(
          "w-14 h-18 rounded border-2 overflow-hidden",
          cable.isDisabled ? "border-red-500 opacity-50" : "border-green-500",
          canPlayComputer && hasSpace && isCurrentPlayer && "cursor-pointer hover:ring-2 hover:ring-yellow-400"
        )}
      >
        <img 
          src={cable.card.image} 
          alt={`Cable (${cable.maxComputers}x)`}
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Capacity indicator */}
      <div className="text-xs text-center text-muted-foreground mt-0.5">
        {cable.computers.length}/{cable.maxComputers}
      </div>
      
      {/* Computers */}
      {cable.computers.length > 0 && (
        <div className="flex gap-1 mt-1 justify-center">
          {cable.computers.map((comp) => (
            <div
              key={comp.id}
              className={cn(
                "w-10 h-12 rounded border overflow-hidden",
                comp.isDisabled ? "border-red-500 opacity-50" : "border-green-400"
              )}
            >
              <img 
                src={comp.card.image} 
                alt="Computer"
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
