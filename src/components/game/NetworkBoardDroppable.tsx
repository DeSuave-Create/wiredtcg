import { PlayerNetwork, SwitchNode, CableNode, PlacedCard } from '@/types/game';
import { DroppableZone } from './DroppableZone';
import { cn } from '@/lib/utils';

interface NetworkBoardDroppableProps {
  network: PlayerNetwork;
  isCurrentPlayer: boolean;
  label: string;
  playerId: string;
}

export function NetworkBoardDroppable({
  network,
  isCurrentPlayer,
  label,
  playerId,
}: NetworkBoardDroppableProps) {
  return (
    <div className="bg-black/30 rounded-lg p-4 border border-accent-green/30">
      <h3 className="text-sm font-semibold text-accent-green mb-3">{label}</h3>
      
      {/* Internet connection point - droppable for switches */}
      <DroppableZone
        id={`${playerId}-internet`}
        type="internet"
        accepts={isCurrentPlayer ? ['switch'] : []}
        className="flex items-center justify-center mb-4"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/30">
          INTERNET
        </div>
      </DroppableZone>
      
      {/* Switches */}
      <div className="space-y-4">
        {network.switches.map((sw) => (
          <SwitchComponent
            key={sw.id}
            switchNode={sw}
            isCurrentPlayer={isCurrentPlayer}
            playerId={playerId}
          />
        ))}
        
        {network.switches.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-gray-600 rounded-lg">
            {isCurrentPlayer ? 'Drag a Switch card here to start building!' : 'No network yet'}
          </div>
        )}
      </div>
    </div>
  );
}

interface SwitchComponentProps {
  switchNode: SwitchNode;
  isCurrentPlayer: boolean;
  playerId: string;
}

function SwitchComponent({
  switchNode,
  isCurrentPlayer,
  playerId,
}: SwitchComponentProps) {
  return (
    <div className="relative">
      {/* Connection line to Internet */}
      <div className="absolute left-1/2 -top-4 w-0.5 h-4 bg-accent-green/50" />
      
      {/* Switch card - droppable for cables */}
      <DroppableZone
        id={`${playerId}-switch-${switchNode.id}`}
        type="switch"
        accepts={isCurrentPlayer ? ['cable-2', 'cable-3'] : []}
        className="w-fit mx-auto"
      >
        <div
          className={cn(
            "w-16 h-20 rounded border-2 overflow-hidden",
            switchNode.isDisabled ? "border-red-500 opacity-50" : "border-green-500"
          )}
        >
          <img 
            src={switchNode.card.image} 
            alt="Switch"
            className="w-full h-full object-contain"
          />
        </div>
      </DroppableZone>
      
      {/* Cables */}
      {switchNode.cables.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-2 pl-8">
          {switchNode.cables.map((cable) => (
            <CableComponent
              key={cable.id}
              cable={cable}
              switchId={switchNode.id}
              isCurrentPlayer={isCurrentPlayer}
              playerId={playerId}
            />
          ))}
        </div>
      )}
      
      {/* Empty cable slot hint */}
      {switchNode.cables.length === 0 && isCurrentPlayer && (
        <div className="text-center text-xs text-muted-foreground mt-2">
          ↑ Drag cables here
        </div>
      )}
    </div>
  );
}

interface CableComponentProps {
  cable: CableNode;
  switchId: string;
  isCurrentPlayer: boolean;
  playerId: string;
}

function CableComponent({
  cable,
  switchId,
  isCurrentPlayer,
  playerId,
}: CableComponentProps) {
  const hasSpace = cable.computers.length < cable.maxComputers;
  
  return (
    <div className="relative">
      {/* Connection line to Switch */}
      <div className="absolute left-1/2 -top-2 w-0.5 h-2 bg-green-500/50" />
      
      {/* Cable card - droppable for computers */}
      <DroppableZone
        id={`${playerId}-cable-${cable.id}`}
        type="cable"
        accepts={isCurrentPlayer && hasSpace ? ['computer'] : []}
        className="w-fit"
      >
        <div
          className={cn(
            "w-14 h-18 rounded border-2 overflow-hidden",
            cable.isDisabled ? "border-red-500 opacity-50" : "border-green-500"
          )}
        >
          <img 
            src={cable.card.image} 
            alt={`Cable (${cable.maxComputers}x)`}
            className="w-full h-full object-contain"
          />
        </div>
      </DroppableZone>
      
      {/* Capacity indicator */}
      <div className={cn(
        "text-xs text-center mt-0.5",
        hasSpace ? "text-muted-foreground" : "text-red-400"
      )}>
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
      
      {/* Empty computer slot hint */}
      {hasSpace && isCurrentPlayer && cable.computers.length === 0 && (
        <div className="text-center text-xs text-muted-foreground mt-1">
          ↑ Drag PC
        </div>
      )}
    </div>
  );
}
