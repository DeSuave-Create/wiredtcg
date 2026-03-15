import { useRef, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import ElectricProgressBar from '@/components/ElectricProgressBar';
import CardInteractionTutorial from '@/components/card-tutorial/CardInteractionTutorial';
import AllCardsView from '@/components/card-tutorial/AllCardsView';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CardInfo {
  name: string;
  image: string;
  quantity: number;
}

const cardData = {
  equipment: {
    label: 'Equipment',
    color: 'border-primary',
    textColor: 'text-primary',
    cards: [
      { name: 'Computer', image: '/lovable-uploads/equipment-computer-new.png', quantity: 32 },
      { name: 'Cabling (2x)', image: '/lovable-uploads/equipment-2cable.png', quantity: 16 },
      { name: 'Cabling (3x)', image: '/lovable-uploads/equipment-3cable.png', quantity: 8 },
      { name: 'Switch', image: '/lovable-uploads/equipment-switch.png', quantity: 18 },
    ] as CardInfo[],
  },
  classification: {
    label: 'Classification',
    color: 'border-blue-500',
    textColor: 'text-blue-400',
    cards: [
      { name: 'Facilities', image: '/lovable-uploads/classification-facilities-new.png', quantity: 2 },
      { name: 'Field Tech', image: '/lovable-uploads/classification-fieldtech-new.png', quantity: 2 },
      { name: 'Supervisor', image: '/lovable-uploads/classification-supervisor.png', quantity: 2 },
      { name: 'Security Specialist', image: '/lovable-uploads/classification-security.png', quantity: 2 },
      { name: 'Head Hunter', image: '/lovable-uploads/classification-headhunter.png', quantity: 6 },
      { name: 'Seal the Deal', image: '/lovable-uploads/classification-sealthedeal.png', quantity: 1 },
    ] as CardInfo[],
  },
  attack: {
    label: 'Attack',
    color: 'border-destructive',
    textColor: 'text-destructive',
    cards: [
      { name: 'Audit', image: '/lovable-uploads/attack-audit-v2.png', quantity: 4 },
      { name: 'Hacked', image: '/lovable-uploads/attack-hacked-v3.png', quantity: 9 },
      { name: 'New Hire', image: '/lovable-uploads/attack-newhire-v3.png', quantity: 7 },
      { name: 'Power Outage', image: '/lovable-uploads/attack-poweroutage-v3.png', quantity: 7 },
    ] as CardInfo[],
  },
  resolution: {
    label: 'Resolution',
    color: 'border-yellow-500',
    textColor: 'text-yellow-400',
    cards: [
      { name: 'Helpdesk', image: '/lovable-uploads/resolution-helpdesk-v2.png', quantity: 4 },
      { name: 'Trained', image: '/lovable-uploads/resolution-trained-v3.png', quantity: 7 },
      { name: 'Powered', image: '/lovable-uploads/resolution-powered-v3.png', quantity: 7 },
      { name: 'Secured', image: '/lovable-uploads/resolution-secured-v3.png', quantity: 9 },
    ] as CardInfo[],
  },
};

const CardReference = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'tutorials' | 'all-cards'>('tutorials');

  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
      }
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const categories = Object.values(cardData);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="container mx-auto px-4 py-8 flex justify-center flex-grow">
        <div className="w-full max-w-6xl" ref={printRef}>
          {/* Back button */}
          <div className="print:hidden mb-4">
            <button
              onClick={() => navigate('/extras')}
              className="text-primary hover:text-primary/80 flex items-center gap-2 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Extras
            </button>
          </div>

          {/* PRIMARY: Interactive Tutorial Section */}
          <div className="print:hidden" id="how-cards-work">
            <ContentSection title="How Cards Work" glowEffect>
              <div className="space-y-4">
                <p className="text-muted-foreground text-center max-w-2xl mx-auto text-sm sm:text-base">
                  Learn how every card in WIRED interacts through visual gameplay examples.
                </p>

                {/* Tab switcher */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setActiveTab('tutorials')}
                    className={cn(
                      'px-4 py-2.5 rounded-full text-xs font-medium font-orbitron tracking-wide border transition-all duration-300 min-h-[44px]',
                      activeTab === 'tutorials'
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'border-muted bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground',
                    )}
                  >
                    Tutorials
                  </button>
                  <button
                    onClick={() => setActiveTab('all-cards')}
                    className={cn(
                      'px-4 py-2.5 rounded-full text-xs font-medium font-orbitron tracking-wide border transition-all duration-300 min-h-[44px]',
                      activeTab === 'all-cards'
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'border-muted bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground',
                    )}
                  >
                    All Cards
                  </button>
                </div>

                {/* Tab content */}
                <div
                  style={{
                    opacity: 1,
                    transition: 'opacity 0.3s ease-out',
                  }}
                >
                  {activeTab === 'tutorials' ? (
                    <CardInteractionTutorial />
                  ) : (
                    <AllCardsView />
                  )}
                </div>
              </div>
            </ContentSection>

            <ElectricProgressBar />
          </div>

          {/* SECONDARY: Static Card Reference */}
          <ContentSection title="Card Reference">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground max-w-2xl mx-auto">
                All 143 unique cards in the WIRED base game (Internet mode), organized by type.
              </p>
              <div className="print:hidden">
                <button
                  onClick={handlePrint}
                  className="bg-muted/30 rounded-3xl text-primary hover:bg-muted/50 neon-glow px-6 py-2 font-medium shadow-2xl drop-shadow-lg border-2 border-primary inline-flex items-center"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print / Save as PDF
                </button>
              </div>
            </div>
          </ContentSection>

          <div className="print:hidden">
            <ElectricProgressBar />
          </div>

          {categories.map((category, catIdx) => (
            <div key={category.label}>
              <ContentSection title={`${category.label} Cards`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                  {category.cards.map((card) => (
                    <div
                      key={card.name}
                      className={`bg-muted/20 rounded-xl border-2 ${category.color} p-3 flex flex-col items-center space-y-2 shadow-lg print:shadow-none print:break-inside-avoid`}
                    >
                      <div className="w-full aspect-[5/7] flex items-center justify-center overflow-hidden rounded-lg">
                        <img
                          src={card.image}
                          alt={card.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <h4 className={`text-sm font-bold font-orbitron ${category.textColor} text-center leading-tight`}>
                        {card.name}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        ×{card.quantity} in deck
                      </span>
                    </div>
                  ))}
                </div>
              </ContentSection>
              {catIdx < categories.length - 1 && (
                <div className="print:hidden">
                  <ElectricProgressBar />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default CardReference;
