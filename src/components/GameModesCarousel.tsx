import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GameMode {
  id: string;
  name: string;
  image: string;
  players: string;
  description: string;
}

interface GameModesCarouselProps {
  gameModes: GameMode[];
  className?: string;
}

const GameModesCarousel = ({ gameModes, className = "" }: GameModesCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? gameModes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === gameModes.length - 1 ? 0 : prev + 1));
  };

  const currentMode = gameModes[currentIndex];

  return (
    <div className={`space-y-6 ${className} relative`}>
      {/* Ghost Logo Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 z-0" style={{ width: '100%', height: '120%' }}>
        <img 
          src="/wire-logo-official.png" 
          alt="WIRED Background Logo" 
          className="w-full h-full object-fill"
        />
      </div>

      {/* Game Mode Card Display */}
      <div className="relative bg-gray-100 border-green-600 border-8 rounded-3xl overflow-hidden shadow-2xl drop-shadow-lg p-8 min-h-[400px] flex items-center justify-center">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full neon-glow transition-all"
          aria-label="Previous game mode"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full neon-glow transition-all"
          aria-label="Next game mode"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Game Mode Content */}
        <div className="text-center space-y-6 max-w-md mx-auto relative z-10">
          <div className="h-64 flex items-center justify-center">
            <img 
              src={currentMode.image} 
              alt={currentMode.name} 
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-3xl font-black text-green-600 uppercase tracking-wider">{currentMode.name}</h3>
          <p className="text-lg text-black font-bold">{currentMode.players}</p>
          <p className="text-sm text-muted-foreground">{currentMode.description}</p>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="flex justify-center gap-2 relative z-10">
        {gameModes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex ? 'bg-green-600 w-8' : 'bg-gray-400'
            }`}
            aria-label={`Go to game mode ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default GameModesCarousel;
