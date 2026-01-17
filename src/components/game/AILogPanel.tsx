import { AIAction } from '@/types/game';
import { Shield, Swords, Wrench, Trash2, Award, ArrowRightLeft, ShieldOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AILogPanelProps {
  actions: AIAction[];
}

const getActionIcon = (type: AIAction['type'], blocked?: boolean) => {
  if (blocked) return <ShieldOff className="w-3 h-3 text-gray-500" />;
  
  switch (type) {
    case 'play':
      return <Award className="w-3 h-3 text-green-400" />;
    case 'attack':
      return <Swords className="w-3 h-3 text-red-400" />;
    case 'resolve':
      return <Wrench className="w-3 h-3 text-blue-400" />;
    case 'discard':
      return <Trash2 className="w-3 h-3 text-gray-400" />;
    case 'classification':
      return <Shield className="w-3 h-3 text-purple-400" />;
    case 'steal':
      return <ArrowRightLeft className="w-3 h-3 text-yellow-400" />;
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

export function AILogPanel({ actions }: AILogPanelProps) {
  return (
    <div className="bg-gray-900/60 rounded-lg border border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-700">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">AI LOG</h2>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-400">AI's Last Turn</span>
        </div>

        {actions.length === 0 ? (
          <div className="bg-gray-800/50 rounded p-2">
            <p className="text-xs text-gray-500">No actions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {actions.map((action, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-center gap-2 p-2 rounded bg-gray-800/60",
                  "animate-[fade-in_0.3s_ease-out]"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className={cn(
                  action.blocked && "opacity-50"
                )}>
                  {getActionIcon(action.type, action.blocked)}
                </span>
                <span className={cn(
                  "text-xs",
                  action.blocked ? "text-gray-500 line-through" : "text-gray-300"
                )}>
                  {getActionLabel(action)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
