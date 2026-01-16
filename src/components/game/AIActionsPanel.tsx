import { AIAction } from '@/types/game';
import { Shield, Swords, Wrench, Trash2, Award, ArrowRightLeft, ShieldOff } from 'lucide-react';

interface AIActionsPanelProps {
  actions: AIAction[];
}

const getActionIcon = (type: AIAction['type'], blocked?: boolean) => {
  if (blocked) return <ShieldOff className="w-4 h-4 text-gray-500" />;
  
  switch (type) {
    case 'play':
      return <Award className="w-4 h-4 text-green-400" />;
    case 'attack':
      return <Swords className="w-4 h-4 text-red-400" />;
    case 'resolve':
      return <Wrench className="w-4 h-4 text-blue-400" />;
    case 'discard':
      return <Trash2 className="w-4 h-4 text-gray-400" />;
    case 'classification':
      return <Shield className="w-4 h-4 text-purple-400" />;
    case 'steal':
      return <ArrowRightLeft className="w-4 h-4 text-yellow-400" />;
    default:
      return null;
  }
};

const getActionLabel = (action: AIAction) => {
  const { type, card, target, blocked } = action;
  
  if (blocked) {
    return `${card.name} → BLOCKED`;
  }
  
  switch (type) {
    case 'play':
      return `Played ${card.name}`;
    case 'attack':
      return `${card.name} → ${target}`;
    case 'resolve':
      return `${card.name} → ${target}`;
    case 'discard':
      return `Discarded ${card.name}`;
    case 'classification':
      return `Activated ${card.name}`;
    case 'steal':
      return `${card.name} → ${target}`;
    default:
      return card.name;
  }
};

export function AIActionsPanel({ actions }: AIActionsPanelProps) {
  if (actions.length === 0) {
    return (
      <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
          🤖 AI's Last Turn
        </h3>
        <p className="text-xs text-gray-500 italic">No actions yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
        🤖 AI's Last Turn
        <span className="text-xs text-gray-500">({actions.length} actions)</span>
      </h3>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {actions.map((action, index) => (
          <div 
            key={index}
            className={`flex items-center gap-2 p-2 rounded-md ${
              action.blocked 
                ? 'bg-gray-800/50 border border-gray-700' 
                : 'bg-gray-800/80 border border-gray-600'
            }`}
          >
            {/* Card thumbnail */}
            <div className={`w-10 h-14 rounded overflow-hidden flex-shrink-0 ${
              action.blocked ? 'opacity-50 grayscale' : ''
            }`}>
              <img 
                src={action.card.image} 
                alt={action.card.name}
                className="w-full h-full object-contain bg-black"
              />
            </div>
            
            {/* Action info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {getActionIcon(action.type, action.blocked)}
                <span className={`text-xs font-medium ${
                  action.blocked ? 'text-gray-500 line-through' : 'text-white'
                }`}>
                  {getActionLabel(action)}
                </span>
              </div>
              {action.blocked && (
                <span className="text-[10px] text-red-400">Blocked by classification</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
