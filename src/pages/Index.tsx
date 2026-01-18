import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import HeroSection from '@/components/HeroSection';
import GameMechanicsSection from '@/components/GameMechanicsSection';
import StrategySection from '@/components/StrategySection';
import ElectricProgressBar from '@/components/ElectricProgressBar';
import { SimulationIntro } from '@/components/game/SimulationIntro';

const Index = () => {
  // Check if intro was already shown this session
  const hasSeenIntro = sessionStorage.getItem('hasSeenIntro') === 'true';
  const [showIntro, setShowIntro] = useState(!hasSeenIntro);
  // If intro was already seen, skip the fade overlay entirely
  const [showFadeOverlay, setShowFadeOverlay] = useState(false);

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowFadeOverlay(true);
    setShowIntro(false);
  };

  // Show intro animation first (only if not seen this session)
  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SimulationIntro onComplete={handleIntroComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Fade overlay that disappears - only shown after intro completes */}
      {showFadeOverlay && (
        <div 
          className="fixed inset-0 bg-black z-50 pointer-events-none animate-fade-out"
          style={{ animation: 'fade-out 0.7s ease-out forwards' }}
          onAnimationEnd={() => setShowFadeOverlay(false)}
        />
      )}
      
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6 lg:py-8 flex justify-center flex-grow">
        <div className="w-full max-w-6xl">
          {/* Hero Section */}
          <ContentSection glowEffect>
            <HeroSection />
          </ContentSection>

          {/* Electric Progress Bar */}
          <ElectricProgressBar />

          {/* Game Mechanics */}
          <ContentSection 
            title="Get Connected" 
            cardBackgroundImage="/lovable-uploads/63928df8-c1b1-4e1d-8fa4-5c14c990cce7.png"
          >
            <GameMechanicsSection />
          </ContentSection>

          {/* Electric Progress Bar */}
          <ElectricProgressBar />


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
