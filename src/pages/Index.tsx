
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import HeroSection from '@/components/HeroSection';
import GameMechanicsSection from '@/components/GameMechanicsSection';
import StrategySection from '@/components/StrategySection';
import ConnectionLines from '@/components/ConnectionLines';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 flex justify-center flex-grow">
        <div className="w-full max-w-6xl">
          {/* Hero Section */}
          <ContentSection glowEffect>
            <HeroSection />
          </ContentSection>

          {/* Connection Animation */}
          <ConnectionLines className="my-2" />

          {/* Game Mechanics */}
          <ContentSection 
            title="How to Win" 
            cardBackgroundImage="/lovable-uploads/63928df8-c1b1-4e1d-8fa4-5c14c990cce7.png"
          >
            <GameMechanicsSection />
          </ContentSection>

          {/* Connection Animation */}
          <ConnectionLines className="my-2" />


          {/* Strategy Section */}
          <ContentSection title="Master the Game">
            <StrategySection />
          </ContentSection>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
