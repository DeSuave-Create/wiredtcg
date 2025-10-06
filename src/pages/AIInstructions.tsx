import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';

const AIInstructions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Gray background with circuit pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#6b7280]">
        {/* Circuit pattern - small green dots */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 10% 10%, rgba(124, 195, 66, 0.15) 2px, transparent 2px),
              radial-gradient(circle at 90% 90%, rgba(124, 195, 66, 0.15) 2px, transparent 2px)
            `,
            backgroundSize: '100px 100px',
            backgroundPosition: '0 0, 50px 50px'
          }}
        ></div>
      </div>

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
          <div className="glass-card p-8 md:p-12 space-y-8">
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
              <h1 className="text-3xl md:text-4xl font-bold font-orbitron text-accent-blue uppercase tracking-wider">
                Game Mode: A.I.
              </h1>
              <p className="text-muted-foreground mt-2">
                1-2 players can compete against each other, coming soon in the EXPANSION.
              </p>
            </div>

            {/* Coming Soon Section */}
            <div className="card-blue text-center py-12">
              <Zap className="w-16 h-16 text-accent-blue mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-orbitron text-accent-blue mb-4">
                COMING SOON IN THE EXPANSION
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                The A.I. game mode is currently in development and will be available in the upcoming WIRED expansion pack. 
                This mode will feature exciting single-player and 2-player gameplay with AI-controlled opponents.
              </p>
            </div>

            {/* Placeholder Sections */}
            <section>
              <h2 className="text-2xl font-bold font-orbitron text-accent-blue uppercase tracking-wide mb-4 pb-2 border-b-2 border-accent-blue">
                Game Setup
              </h2>
              <div className="card-blue">
                <p className="text-muted-foreground text-center py-8">
                  Game setup instructions will be available when the expansion is released.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-accent-blue uppercase tracking-wide mb-4 pb-2 border-b-2 border-accent-blue">
                How to Play
              </h2>
              <div className="card-blue">
                <p className="text-muted-foreground text-center py-8">
                  Detailed gameplay instructions will be available when the expansion is released.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-accent-blue uppercase tracking-wide mb-4 pb-2 border-b-2 border-accent-blue">
                Card Types
              </h2>
              <div className="card-blue">
                <p className="text-muted-foreground text-center py-8">
                  Specific card types and mechanics for A.I. mode will be revealed with the expansion.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-orbitron text-accent-blue uppercase tracking-wide mb-4 pb-2 border-b-2 border-accent-blue">
                Building Your Network
              </h2>
              <div className="card-blue">
                <p className="text-muted-foreground text-center py-8">
                  Network building strategies for A.I. mode will be detailed in the expansion rulebook.
                </p>
              </div>
            </section>

            {/* Call to Action */}
            <div className="highlight-box text-center">
              <h3 className="text-xl font-bold text-white mb-2">Stay Updated!</h3>
              <p className="text-muted-foreground">
                Want to be notified when the A.I. expansion is released? Follow us on social media and join our community!
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIInstructions;