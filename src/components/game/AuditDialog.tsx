import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, AuditBattle, Player } from '@/types/game';
import { Shield, Swords, Check, X } from 'lucide-react';

interface AuditDialogProps {
  isOpen: boolean;
  auditBattle: AuditBattle;
  players: Player[];
  currentPlayerId: string;
  onPlayCard: (cardId: string) => void;
  onPass: () => void;
}

export function AuditDialog({
  isOpen,
  auditBattle,
  players,
  currentPlayerId,
  onPlayCard,
  onPass,
}: AuditDialogProps) {
  const auditor = players[auditBattle.auditorIndex];
  const target = players[auditBattle.targetIndex];
  
  // Determine whose turn it is to respond
  const isTargetTurn = auditBattle.chain.length % 2 === 0; // Even = target blocks with Hacked, Odd = auditor counters with Secured
  const respondingPlayerIndex = isTargetTurn ? auditBattle.targetIndex : auditBattle.auditorIndex;
  const respondingPlayer = players[respondingPlayerIndex];
  const isMyTurn = respondingPlayer.id === currentPlayerId;
  
  // What card type can be played?
  const neededCardType = isTargetTurn ? 'hacked' : 'secured';
  const neededCardName = isTargetTurn ? 'Hacked' : 'Secured';
  
  // Find playable cards in responding player's hand
  const playableCards = respondingPlayer.hand.filter(c => c.subtype === neededCardType);
  const canRespond = playableCards.length > 0;
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="bg-gray-900 border-yellow-500/50 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-yellow-400 flex items-center gap-2">
            <Swords className="w-6 h-6" />
            Audit Battle!
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {auditor.name} is auditing {target.name} for {auditBattle.computersToReturn} computer(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Battle chain visualization */}
          <div className="bg-black/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Battle Chain</h4>
            <div className="flex flex-wrap items-center gap-2">
              {/* Initial audit card */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-22 rounded overflow-hidden border-2 border-yellow-500">
                  <img 
                    src="/lovable-uploads/attack-audit-v2.png" 
                    alt="Audit"
                    className="w-full h-full object-contain bg-black"
                  />
                </div>
                <span className="text-xs text-yellow-400 mt-1">{auditor.name}</span>
              </div>
              
              {/* Chain of responses */}
              {auditBattle.chain.map((response, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-500">→</span>
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-22 rounded overflow-hidden border-2 ${
                      response.card.subtype === 'hacked' ? 'border-red-500' : 'border-blue-500'
                    }`}>
                      <img 
                        src={response.card.image} 
                        alt={response.card.name}
                        className="w-full h-full object-contain bg-black"
                      />
                    </div>
                    <span className={`text-xs mt-1 ${
                      response.card.subtype === 'hacked' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {players[response.playerId].name}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Pending response indicator */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500">→</span>
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-22 rounded border-2 border-dashed flex items-center justify-center ${
                    isTargetTurn ? 'border-red-500/50 bg-red-500/10' : 'border-blue-500/50 bg-blue-500/10'
                  }`}>
                    <span className="text-2xl">?</span>
                  </div>
                  <span className={`text-xs mt-1 ${isTargetTurn ? 'text-red-400' : 'text-blue-400'}`}>
                    {neededCardName}?
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Current state */}
          <div className={`p-4 rounded-lg ${
            isMyTurn ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-gray-800/50'
          }`}>
            {isMyTurn ? (
              <div className="space-y-3">
                <p className="text-sm text-yellow-200">
                  <strong>Your turn!</strong> Play a <span className={isTargetTurn ? 'text-red-400' : 'text-blue-400'}>{neededCardName}</span> to {isTargetTurn ? 'block the audit' : 'counter the block'}!
                </p>
                
                {canRespond ? (
                  <div className="flex flex-wrap gap-2">
                    {playableCards.map(card => (
                      <button
                        key={card.id}
                        onClick={() => onPlayCard(card.id)}
                        className={`w-20 h-28 rounded overflow-hidden border-2 hover:scale-105 transition-transform ${
                          isTargetTurn ? 'border-red-500 hover:border-red-300' : 'border-blue-500 hover:border-blue-300'
                        }`}
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
                  <p className="text-sm text-gray-400">
                    You don't have any {neededCardName} cards to play.
                  </p>
                )}
                
                <Button
                  onClick={onPass}
                  variant="outline"
                  className={`w-full ${
                    isTargetTurn 
                      ? 'border-red-500/50 text-red-400 hover:bg-red-500/20' 
                      : 'border-blue-500/50 text-blue-400 hover:bg-blue-500/20'
                  }`}
                >
                  {isTargetTurn ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Accept Audit (Lose {auditBattle.computersToReturn} Computers)
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Let Block Succeed (Audit Fails)
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
            {isTargetTurn ? (
              <p>If the audit succeeds, {target.name} returns <strong className="text-yellow-400">{auditBattle.computersToReturn}</strong> computer(s) to hand</p>
            ) : (
              <p>If {target.name}'s block succeeds, the audit fails and {auditor.name} wastes their Audit card</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
