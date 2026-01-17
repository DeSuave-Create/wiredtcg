import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AIDifficulty } from '@/utils/ai';
import { Bot, Cpu, BrainCircuit } from 'lucide-react';

interface DifficultySelectorProps {
  isOpen: boolean;
  onSelect: (difficulty: AIDifficulty) => void;
  onClose: () => void;
}

const difficulties: { 
  id: AIDifficulty; 
  name: string; 
  icon: React.ElementType;
  description: string; 
  details: string[];
  color: string;
}[] = [
  {
    id: 'easy',
    name: 'Easy',
    icon: Bot,
    description: 'Beginner-friendly opponent',
    details: [
      'Plays cards immediately',
      'Minimal strategic planning',
      'Makes occasional mistakes',
      'Good for learning the game',
    ],
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'normal',
    name: 'Normal',
    icon: Cpu,
    description: 'Balanced challenge',
    details: [
      'Holds attacks for timing',
      'Basic counter estimation',
      'Builds network redundancy',
      'Balanced offense/defense',
    ],
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'hard',
    name: 'Hard',
    icon: BrainCircuit,
    description: 'Expert AI opponent',
    details: [
      'Deep strategic planning',
      'Tracks your card usage',
      'Uses baiting and traps',
      'Aggressive when behind',
    ],
    color: 'from-red-500 to-rose-600',
  },
];

export function DifficultySelector({ isOpen, onSelect, onClose }: DifficultySelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-black/95 border-accent-green/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron text-accent-green text-center">
            Select AI Difficulty
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Choose your opponent's skill level
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {difficulties.map((diff) => {
            const Icon = diff.icon;
            return (
              <button
                key={diff.id}
                onClick={() => onSelect(diff.id)}
                className="group relative p-4 rounded-lg border border-gray-700 hover:border-accent-green/50 
                           bg-gray-900/50 hover:bg-gray-800/70 transition-all duration-300
                           flex flex-col items-center text-center"
              >
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${diff.color} opacity-0 
                                group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${diff.color} 
                                flex items-center justify-center mb-3 
                                group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Name */}
                <h3 className="text-lg font-bold text-white mb-1 font-orbitron">
                  {diff.name}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-gray-400 mb-3">
                  {diff.description}
                </p>
                
                {/* Details */}
                <ul className="text-xs text-gray-500 space-y-1">
                  {diff.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <span className="text-accent-green">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
                
                {/* Select button appears on hover */}
                <div className="absolute bottom-3 left-0 right-0 opacity-0 group-hover:opacity-100 
                                transition-opacity duration-300">
                  <Button 
                    size="sm" 
                    className={`bg-gradient-to-r ${diff.color} text-white border-0 hover:opacity-90`}
                  >
                    Select {diff.name}
                  </Button>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Quick start option */}
        <div className="mt-4 text-center">
          <button 
            onClick={() => onSelect('normal')}
            className="text-sm text-gray-500 hover:text-accent-green transition-colors"
          >
            Press Enter for Normal difficulty
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
