import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AIDifficulty } from '@/utils/ai';

interface DifficultySelectorProps {
  isOpen: boolean;
  onSelect: (difficulty: AIDifficulty) => void;
  onClose: () => void;
}

const difficulties: { 
  id: AIDifficulty; 
  name: string; 
  image: string;
  description: string; 
  details: string[];
  color: string;
}[] = [
  {
    id: 'easy',
    name: 'Easy',
    image: '/lovable-uploads/equipment-switch.png',
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
    image: '/lovable-uploads/classification-supervisor.png',
    description: 'Balanced challenge',
    details: [
      'Holds attacks for timing',
      'Basic counter estimation',
      'Builds network redundancy',
      'Balanced offense/defense',
    ],
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'hard',
    name: 'Hard',
    image: '/lovable-uploads/attack-hacked-v2.png',
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
            return (
              <button
                key={diff.id}
                onClick={() => onSelect(diff.id)}
                className="group relative p-4 rounded-lg border border-gray-700 hover:border-accent-green/50 
                           bg-gray-900/50 hover:bg-gray-800/70 transition-all duration-300
                           flex flex-col items-center text-center h-full"
              >
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${diff.color} opacity-0 
                                group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Card Image */}
                <div className={`w-20 h-28 rounded-lg bg-gradient-to-br ${diff.color} p-0.5
                                group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <img 
                    src={diff.image} 
                    alt={diff.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                
                {/* Name */}
                <h3 className="text-lg font-bold text-white mb-1 font-orbitron mt-3">
                  {diff.name}
                </h3>
                
                {/* Description - fixed height for alignment */}
                <p className="text-sm text-gray-400 mb-3 h-5">
                  {diff.description}
                </p>
                
                {/* Details - fixed height container for alignment */}
                <ul className="text-xs text-gray-500 space-y-1 text-left w-full flex-1 mt-4 pt-3 border-t border-gray-700/50">
                  {diff.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-accent-green flex-shrink-0">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Select indicator appears on hover */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span 
                    className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r ${diff.color} text-white`}
                  >
                    Select {diff.name}
                  </span>
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
