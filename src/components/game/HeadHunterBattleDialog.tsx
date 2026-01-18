import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, HeadHunterBattle, Player } from '@/types/game';
import { Target, Shield, Check, X } from 'lucide-react';

interface HeadHunterBattleDialogProps {
  isOpen: boolean;
  battle: HeadHunterBattle;
  players: Player[];
  currentPlayerId: string;
  onPlayCard: (cardId: string) => void;
  onPass: () => void;
}

export function HeadHunterBattleDialog({
  isOpen,
  battle,
  players,
  currentPlayerId,
  onPlayCard,
  onPass,
}: HeadHunterBattleDialogProps) {
  const attacker = players[battle.attackerIndex];
  const defender = players[battle.defenderIndex];
  
  // Find the classification being stolen
  const targetClassification = defender.classificationCards.find(c => c.id === battle.targetClassificationId);
  
  // Determine whose turn it is to respond
  // Even chain length = defender can block, Odd = attacker can counter
  const isDefenderTurn = battle.chain.length % 2 === 0;
  const respondingPlayerIndex = isDefenderTurn ? battle.defenderIndex : battle.attackerIndex;
  const respondingPlayer = players[respondingPlayerIndex];
  const isMyTurn = respondingPlayer.id === currentPlayerId;
  
  // Find playable Head Hunters in responding player's hand
  const playableCards = respondingPlayer.hand.filter(c => c.subtype === 'head-hunter');
  const canRespond = playableCards.length > 0;
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="bg-gray-900 border-purple-500/50 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-400 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Head Hunter Battle!
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {attacker.name} is trying to steal {targetClassification?.card.name || 'classification'} from {defender.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Target classification display */}
          <div className="flex justify-center">
            <div className="text-center">
              <span className="text-sm text-gray-400 mb-2 block">Target:</span>
              <div className="w-20 h-28 rounded overflow-hidden border-2 border-purple-500 mx-auto">
                <img 
                  src={targetClassification?.card.image || ''} 
                  alt={targetClassification?.card.name || 'Classification'}
                  className="w-full h-full object-contain bg-black"
                />
              </div>
              <span className="text-xs text-purple-400 mt-1 block">{targetClassification?.card.name}</span>
            </div>
          </div>

          {/* Battle chain visualization */}
          <div className="bg-black/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Battle Chain</h4>
            <div className="flex flex-wrap items-center gap-2 justify-center">
              {/* Initial Head Hunter */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-22 rounded overflow-hidden border-2 border-purple-500">
                  <img 
                    src="/lovable-uploads/classification-headhunter.png" 
                    alt="Head Hunter"
                    className="w-full h-full object-contain bg-black"
                  />
                </div>
                <span className="text-xs text-purple-400 mt-1">{attacker.name}</span>
              </div>
              
              {/* Chain of responses */}
              {battle.chain.map((response, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-500">→</span>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-22 rounded overflow-hidden border-2 border-purple-500">
                      <img 
                        src={response.card.image} 
                        alt={response.card.name}
                        className="w-full h-full object-contain bg-black"
                      />
                    </div>
                    <span className="text-xs text-purple-400 mt-1">
                      {players[response.playerId].name}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Pending response indicator */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500">→</span>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-22 rounded border-2 border-dashed border-purple-500/50 bg-purple-500/10 flex items-center justify-center">
                    <span className="text-2xl">?</span>
                  </div>
                  <span className="text-xs text-purple-400 mt-1">
                    Block?
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Current state */}
          <div className={`p-4 rounded-lg ${
            isMyTurn ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-gray-800/50'
          }`}>
            {isMyTurn ? (
              <div className="space-y-3">
                <p className="text-sm text-purple-200">
                  <strong>Your turn!</strong> Play a <span className="text-purple-400">Head Hunter</span> to {isDefenderTurn ? 'block the steal' : 'counter the block'}!
                </p>
                
                {canRespond ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {playableCards.map(card => (
                      <button
                        key={card.id}
                        onClick={() => onPlayCard(card.id)}
                        className="w-20 h-28 rounded overflow-hidden border-2 border-purple-500 hover:border-purple-300 hover:scale-105 transition-transform"
                      >
                        <img 
                          src={card.image} 
                          alt={card.name}
                          className="w-full h-full object-contain bg-black"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center">
                    You don't have any Head Hunter cards to play.
                  </p>
                )}
                
                <Button
                  onClick={onPass}
                  variant="outline"
                  className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                >
                  {isDefenderTurn ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Accept Steal (Lose Classification)
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Let Block Succeed (Steal Fails)
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-400">
                  Waiting for <span className="text-white font-medium">{respondingPlayer.name}</span> to respond...
                </p>
              </div>
            )}
          </div>

          {/* Stakes */}
          <div className="text-center text-sm text-gray-400">
            {isDefenderTurn ? (
              <p>If the steal succeeds, {attacker.name} takes <strong className="text-purple-400">{targetClassification?.card.name}</strong></p>
            ) : (
              <p>If {defender.name}'s block succeeds, the steal fails and {attacker.name} loses their Head Hunter</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
