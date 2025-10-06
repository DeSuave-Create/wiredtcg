import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const InternetInstructions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex justify-center flex-grow">
        <div className="w-full max-w-4xl">
          {/* Back button */}
          <Link 
            to="/extras" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Extras
          </Link>

          {/* Main container */}
          <div className="glass-card p-8 md:p-12 space-y-8 relative">
            {/* Hero Section */}
            <div 
              className="highlight-box text-center space-y-4 relative overflow-hidden stripe-pattern"
              style={{ 
                borderLeft: '3px solid hsl(var(--accent-green))',
                background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.1) 0%, transparent 100%)'
              }}
            >
              <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-white uppercase tracking-wider animate-neon-flicker">
                  WIRED: The Card Game
                </h1>
                <div className="my-4">
                  <Logo size={128} className="mx-auto" />
                </div>
                <p className="text-lg text-muted-foreground">
                  The fast paced computer networking game, challenging players to see who can become a bitcoin billionaire!
                </p>
              </div>
            </div>

            {/* Game Mode Title */}
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold font-orbitron uppercase tracking-wider" style={{ color: 'hsl(var(--accent-green))' }}>
                Game Mode: Internet
              </h1>
              <p className="text-muted-foreground mt-2">
                Anywhere from 2-6 players can compete against each other, engage in trade and see who can mine 25 bitcoin (points) first.
              </p>
            </div>

            {/* Game Setup */}
            <section>
              <h2 className="text-2xl font-bold font-orbitron text-accent-green uppercase tracking-wide mb-4 pb-2 border-b-2 border-accent-green">
                Game Setup
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Place the 'INTERNET' card in the center of the table, this designates which game type you will be playing. One player deals 6 cards to each player, and places the rest of the cards next to the 'INTERNET' card as the DRAW pile. The DISCARD pile is on the opposite side of the 'INTERNET' card from the DRAW pile. Each player chooses a company name they will champion for fun. The player to the left of the dealer goes first.
              </p>
              <p className="text-muted-foreground">
                Visit <Link to="/score" className="text-primary hover:text-primary/80 underline">wiredtcg.com/score</Link> to keep score of your game.
              </p>
            </section>

            {/* How to Play */}
            <section>
              <h2 className="text-2xl font-bold font-orbitron text-accent-green uppercase tracking-wide mb-4 pb-2 border-b-2 border-accent-green">
                How to Play
              </h2>
              <p className="text-muted-foreground font-semibold mb-4">Each player's turn proceeds as follows:</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-accent-green mb-2">TRADE phase</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The player may trade with any other player. All trades are considered legitimate as long as both parties agree to the trade. Once terms are agreed upon by the two players the trade is binding and must be followed through by both players. If one player fails to follow through with their portion of the trade, they immediately lose the game, the other players are deputized by the 'Party Foul' police, and escort the offending player to the 'Corner of Shame'. The only items that can't be traded are bitcoin (points) and EQUIPMENT cards already in play. Trading is also stopped once a player reaches 20 points.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-accent-green mb-2">3 MOVES phase</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The player then performs 0 to 3 MOVES at their discretion. Each card they play from their hand counts as one MOVE. Cards played from a player's hand in response to an EVENT do not count as a MOVE. Each EQUIPMENT DISCONNECT/RECONNECT made to the players network counts as one MOVE. For example, moving a Cable card from one SWITCH to another SWITCH counts as one MOVE.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-accent-green mb-2">DISCARD phase</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The player may discard as many cards from their hand as they choose.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-accent-green mb-2">DRAW phase</h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    Once the player takes a card from the DRAW pile, their turn is officially over and they can take no more actions. The player can DRAW up to 6 cards unless this number has been modified by a card in play. If the player already has 6 or more cards, they do NOT DRAW. When a player DRAWs, this signals to the player to the left that it is now their turn.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground ml-4">
                    <li>If the last card is taken from the DRAW pile, the dealer shuffles the DISCARD pile and adds it back as the DRAW pile.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-accent-green mb-2">SCORE phase</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Each COMPUTER in the players network that can connect to the 'INTERNET' successfully adds an additional bitcoin (point) to their overall score. Scoring is cumulative, so if you had one COMPUTER on your first turn that scored a point, and the same COMPUTER on your second turn scoring a bitcoin (point), your score would be '2'.
                  </p>
                </div>
              </div>

              {/* How to Win */}
              <div className="highlight-box mt-6">
                <p className="font-bold text-white text-lg mb-2">How to win:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>2-3 player game: First person to reach 25 bitcoin (points) wins! Gameplay ends.</li>
                  <li>
                    4-6 player game: First person to reach 25 bitcoin (points) ends the game for themselves. Each player after them gets one more turn to try and surpass their score. After each player takes their final turn, gameplay ends and the highest score wins.
                    <ul className="list-disc list-inside ml-6 mt-2">
                      <li>
                        If the highest score is shared by more than one player, tie breakers are determined as follows:
                        <ol className="list-decimal list-inside ml-6 mt-2 space-y-1">
                          <li>1st tie breaker: Highest number of ACTIVE COMPUTERS</li>
                          <li>2nd tie breaker: Highest number of TOTAL COMPUTERS</li>
                          <li>3rd tie breaker: Highest number of ACTIVE EQUIPMENT</li>
                          <li>4th tie breaker: Highest number of TOTAL EQUIPMENT</li>
                          <li>5th tie breaker: Thunderdome</li>
                        </ol>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>

            {/* Card Types */}
            <section>
              <h2 className="text-2xl font-bold font-orbitron text-accent-green uppercase tracking-wide mb-4 pb-2 border-b-2 border-accent-green">
                Card Types
              </h2>

              {/* Equipment Cards */}
              <div className="card-green mb-6">
                <h3 className="text-xl font-bold text-accent-green mb-3">Equipment (Green):</h3>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  Use EQUIPMENT cards to build your company's network: (See '<em>Building your network</em>')
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>SWITCH cards connect to the 'INTERNET', you can have as many SWITCH cards as you like.</li>
                  <li>CABLE cards connect to SWITCH cards, you can connect as many CABLE cards to a SWITCH card as you like.</li>
                  <li>COMPUTER cards connect to CABLE cards. CABLE cards only support 2 or 3 computers depending on the CABLE card.</li>
                </ul>
              </div>

              {/* Action Cards */}
              <div className="card-red mb-6">
                <h3 className="text-xl font-bold text-accent-red mb-3">Action (Red):</h3>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  Use action cards to disable a rival company's network or resolve issues on your network:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>HACKED</strong> -- Disable target players EQUIPMENT card.</li>
                  <li><strong>POWER OUTAGE</strong> - Disable target players EQUIPMENT card.</li>
                  <li><strong>NEW HIRE</strong> - Disable target players EQUIPMENT card.</li>
                  <li><strong>HELPDESK</strong> - Resolve all issues on the target EQUIPMENT card.</li>
                  <li><strong>SECURED</strong> - Resolve a single HACKED card on a target EQUIPMENT card.</li>
                  <li><strong>POWERED</strong> - Resolve a single POWER OUTAGE card on target EQUIPMENT card.</li>
                  <li><strong>TRAINED</strong> - Resolve a single NEW HIRE card on target EQUIPMENT card.</li>
                  <li><strong>AUDIT (EVENT)</strong> -- Played against an opponent, the target of the AUDIT is required to return half of their computers in play, rounded up, back into their hand. The player using the AUDIT card gets to choose which COMPUTER cards are returned to the hand of the player being targeted. The AUDIT card can be countered by ANY player that plays a HACKED card, which can be countered with a SECURED card, which can be countered by a HACKED card and so forth. This back and forth between HACKED and SECURED can continue until no more cards are played. Once it is determined whether or not the AUDIT will proceed, the EVENT is over, and all players who played cards outside of their turn may draw back to a full hand.</li>
                </ul>
              </div>

              {/* Classification Cards */}
              <div className="card-blue">
                <h3 className="text-xl font-bold text-accent-blue mb-3">Classification (Blue):</h3>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  Use CLASSIFICATION cards to hire employees to work for your company. Only 2 CLASSIFICATION cards can be in play for a player at any time. If a new CLASSIFICATION card is played from the active player's hand OR stolen by a HEAD HUNTER card, the active player must choose which two will stay in play and discard the rest. When a Classification card is played by a player OR is in play and traded from one player to another, its effects are made available immediately. The only exception to this is the HEAD HUNTER card, which is discarded after it is played:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>SECURITY SPECIALIST</strong> - Resolves all HACKED cards on players network. No new HACKED cards can be played against this player while this card is in play. This does NOT stop HACKED cards from being played on AUDIT cards.</li>
                  <li><strong>FACILITIES</strong> - Resolves all POWER OUTAGE cards on players network. No new POWER OUTAGE cards can be played against this player while this card is in play.</li>
                  <li><strong>SUPERVISOR</strong> - Resolves all NEW HIRE cards on players network. No new NEW HIRE cards can be played against this player while this card is in play.</li>
                  <li><strong>FIELD TECH</strong> - Owning player can tap this card once per turn and receive one additional EQUIPMENT MOVE. The player can play one additional EQUIPMENT card from their hand or DISCONNECT/RECONNECT EQUIPMENT on their network in addition to their regular 3 MOVES.</li>
                  <li><strong>HEAD HUNTER</strong> - (EVENT) - Player targets an opponents CLASSIFICATION card that is in play and steals it, moving it over to their network. This stolen card must either stay in play OR be discarded. The player who is targeted by this card can counter it with another HEAD HUNTER card. Each player may counter the other until one stops playing HEAD HUNTER cards. Once it is determined whether or not the initial HEAD HUNTER was successful or not, the EVENT is over, and the player who played cards outside of their turn may draw back to a full hand.</li>
                  <li><strong>SEAL THE DEAL: HEAD HUNTER</strong> - Same as the HEAD HUNTER card, but cannot be blocked.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  When a CLASSIFICATION card is played by a player OR is in play and traded from one player to another, its effects are made available immediately. The only exception to this is the HEAD HUNTER card, which is discarded after it is played.
                </p>
              </div>
            </section>

            {/* Building Your Network */}
            <section>
              <h2 className="text-2xl font-bold font-orbitron text-accent-green uppercase tracking-wide mb-4 pb-2 border-b-2 border-accent-green">
                Building Your Network
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>All players are trying to be the first to score 25 bitcoin (points) and win!</p>
                
                <p>SWITCH cards connect to the INTERNET card at the center of the table, you can have as many SWITCH cards as you like.</p>
                
                <p>CABLE cards connect to SWITCH cards, you can connect as many CABLE cards to a SWITCH card as you like.</p>
                
                <p>COMPUTER cards connect to CABLE cards. CABLE cards only support 2 or 3 COMPUTERS depending on the CABLE card type, 2 or 3.</p>
                
                <p>During the active player's turn a player can use a MOVE to either play an EQUIPMENT card from their hand OR DISCONNECT/RECONNECT an EQUIPMENT card already on the table. An example of moving an EQUIPMENT card on the table with a single MOVE would be: a CABLE card can be moved from one SWITCH to another SWITCH.</p>
                
                <p>If a CABLE card is moved from one SWITCH to another SWITCH, and it has COMPUTERS attached to it, this only counts as 1 MOVE for the player, since the DISCONNECT/RECONNECT only involves 1 card. If in this example the player moved the COMPUTER cards instead, it would cost 1 MOVE for each card moved.</p>
                
                <p>On the players first turn, they could use all 3 of their MOVEs by connecting a SWITCH to the 'INTERNET', a CABLE card to the SWITCH and a COMPUTER to the CABLE Card, ending their turn and scoring a point.</p>
                
                <p><strong>Floating Equipment</strong> -- These are cards that are played and not connected to another piece of EQUIPMENT OR are disconnected from EQUIPMENT and deliberately left unattached. When EQUIPMENT cards are played from the player's hand, floating cards may be <strong>automatically</strong> attached to these EQUIPMENT cards coming into play.</p>
              </div>
            </section>

            {/* House Rules */}
            <section>
              <h2 className="text-2xl font-bold font-orbitron text-accent-green uppercase tracking-wide mb-4 pb-2 border-b-2 border-accent-green">
                Some House Rules to Mix Things Up...
              </h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Gemini Rule:</strong> Having two of the same CLASSIFICATION cards in play protects both from HEAD HUNTER cards.</li>
                <li><strong>Kingmaker Rule:</strong> Trading doesn't stop when a player reaches 20 bitcoin (points), it can continue until the end of the game.</li>
                <li><strong>Peel Out Rule:</strong> Players turn ends after 5 seconds.</li>
                <li><strong>King Seal Rule:</strong> When 'Seal the Deal: Head Hunter' is played, the card that it steals cannot be stolen again.</li>
                <li><strong>Switcheroo Rule:</strong> You can play over the top of disabled equipment in your network with EQUIPMENT cards of the same type.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InternetInstructions;