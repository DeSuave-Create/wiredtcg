
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import HeroSection from '@/components/HeroSection';
import GameMechanicsSection from '@/components/GameMechanicsSection';
import ProductsSection from '@/components/ProductsSection';
import StrategySection from '@/components/StrategySection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <ContentSection glowEffect>
          <HeroSection />
        </ContentSection>

        {/* Game Mechanics */}
        <ContentSection 
          title="How to Win" 
          backgroundImage="/lovable-uploads/a55043cc-ebea-42ff-813b-9a70488507db.png"
          cardBackgroundImage="/lovable-uploads/63928df8-c1b1-4e1d-8fa4-5c14c990cce7.png"
        >
          <GameMechanicsSection />
        </ContentSection>

        {/* Products */}
        <ContentSection title="Available Products" data-products>
          <ProductsSection />
        </ContentSection>

        {/* Strategy Section */}
        <ContentSection title="Master the Game">
          <StrategySection />
        </ContentSection>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
