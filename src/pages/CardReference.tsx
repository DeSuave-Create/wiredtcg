import { useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import ElectricProgressBar from '@/components/ElectricProgressBar';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CardInfo {
  name: string;
  image: string;
  quantity: number;
}

const cardData = {
  equipment: {
    label: 'Equipment',
    color: 'border-green-500',
    textColor: 'text-green-500',
    cards: [
      { name: 'Computer', image: '/lovable-uploads/equipment-computer-new.png', quantity: 32 },
      { name: 'Cabling (2x)', image: '/lovable-uploads/equipment-2cable.png', quantity: 16 },
      { name: 'Cabling (3x)', image: '/lovable-uploads/equipment-3cable.png', quantity: 9 },
      { name: 'Switch', image: '/lovable-uploads/equipment-switch.png', quantity: 18 },
    ] as CardInfo[],
  },
  classification: {
    label: 'Classification',
    color: 'border-blue-500',
    textColor: 'text-blue-500',
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
    color: 'border-red-500',
    textColor: 'text-red-500',
    cards: [
      { name: 'Audit', image: '/lovable-uploads/attack-audit-v2.png', quantity: 4 },
      { name: 'Hacked', image: '/lovable-uploads/attack-hacked-v2.png', quantity: 9 },
      { name: 'New Hire', image: '/lovable-uploads/attack-newhire-v2.png', quantity: 7 },
      { name: 'Power Outage', image: '/lovable-uploads/attack-poweroutage-v2.png', quantity: 7 },
    ] as CardInfo[],
  },
  resolution: {
    label: 'Resolution',
    color: 'border-purple-500',
    textColor: 'text-purple-500',
    cards: [
      { name: 'Helpdesk', image: '/lovable-uploads/resolution-helpdesk-v2.png', quantity: 4 },
      { name: 'Trained', image: '/lovable-uploads/resolution-trained-v2.png', quantity: 7 },
      { name: 'Powered', image: '/lovable-uploads/resolution-powered-v2.png', quantity: 7 },
      { name: 'Secured', image: '/lovable-uploads/resolution-secured-v2.png', quantity: 9 },
    ] as CardInfo[],
  },
};

const CardReference = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

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
          {/* Back button - hide on print */}
          <div className="print:hidden mb-4">
            <button
              onClick={() => navigate('/extras')}
              className="text-primary hover:text-primary/80 flex items-center gap-2 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Extras
            </button>
          </div>

          <ContentSection title="Card Reference" glowEffect>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground max-w-2xl mx-auto">
                All 145 unique cards in the WIRED base game (Internet mode), organized by type.
              </p>
              <div className="print:hidden">
                <button
                  onClick={handlePrint}
                  className="bg-gray-50 dark:bg-gray-800/90 rounded-3xl text-primary hover:bg-gray-200 dark:hover:bg-gray-700/90 neon-glow px-6 py-2 font-medium shadow-2xl drop-shadow-lg border-2 border-primary inline-flex items-center"
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
                      className={`bg-gray-50 dark:bg-gray-800/90 rounded-xl border-2 ${category.color} p-3 flex flex-col items-center space-y-2 shadow-lg print:shadow-none print:break-inside-avoid`}
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
