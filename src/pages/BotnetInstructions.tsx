import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft, Network } from 'lucide-react';

const BotnetInstructions = () => {
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
          <div className="glass-card p-8 md:p-12 space-y-8 relative" style={{ backgroundImage: 'url(/instructions-background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {/* Hero Section */}
            <div className="highlight-box text-center space-y-4 relative overflow-hidden stripe-pattern">
              <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-white uppercase tracking-wider">
                  WIRED: The Card Game
                </h1>
                <img 
                  src="/wire-logo-official.png" 
                  alt="WIRED Logo" 
                  className="w-32 h-32 mx-auto my-4"
                />
                <p className="text-lg text-muted-foreground">
                  The fast paced computer networking game, challenging players to see who can become a bitcoin billionaire!
                </p>
              </div>
            </div>

            {/* Game Mode Title */}
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold font-orbitron text-accent-red uppercase tracking-wider">
                Game Mode: BotNet
              </h1>
              <p className="text-muted-foreground mt-2">
                4-6 players can compete against each other, coming soon in the EXPANSION.
              </p>
            </div>

            {/* Coming Soon Section */}
            <div className="card-red text-center py-12">
              <Network className="w-16 h-16 text-accent-red mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-orbitron text-accent-red mb-4">
                COMING SOON IN THE EXPANSION
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                The BotNet game mode is currently in development and will be available in the upcoming WIRED expansion pack. 
                This mode will feature intense 4-6 player battles with unique network warfare mechanics.
              </p>
            </div>

            {/* Placeholder Sections */}
            <section>
              <h2 className="text-2xl font-bold font-orbitron text-accent-red uppercase tracking-wide mb-4 pb-2 border-b-2 border-accent-red">
                Game Setup
              </h2>
              <div className="card-red">
                <p className="text-muted-foreground text-center py-8">
                  Game setup instructions will be available when the expansion is released.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-accent-red uppercase tracking-wide mb-4 pb-2 border-b-2 border-accent-red">
                How to Play
              </h2>
              <div className="card-red">
                <p className="text-muted-foreground text-center py-8">
                  Detailed gameplay instructions will be available when the expansion is released.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-accent-red uppercase tracking-wide mb-4 pb-2 border-b-2 border-accent-red">
                Card Types
              </h2>
              <div className="card-red">
                <p className="text-muted-foreground text-center py-8">
                  Specific card types and mechanics for BotNet mode will be revealed with the expansion.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-accent-red uppercase tracking-wide mb-4 pb-2 border-b-2 border-accent-red">
                Building Your Network
              </h2>
              <div className="card-red">
                <p className="text-muted-foreground text-center py-8">
                  Network building strategies for BotNet mode will be detailed in the expansion rulebook.
                </p>
              </div>
            </section>

            {/* Call to Action */}
            <div className="highlight-box text-center">
              <h3 className="text-xl font-bold text-white mb-2">Stay Updated!</h3>
              <p className="text-muted-foreground">
                Want to be notified when the BotNet expansion is released? Follow us on social media and join our community!
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BotnetInstructions;