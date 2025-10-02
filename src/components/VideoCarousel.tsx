import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Logo from './Logo';

interface Video {
  id: string;
  src: string;
  title: string;
  description: string;
  isYouTube?: boolean;
}

interface VideoCarouselProps {
  videos: Video[];
  className?: string;
}

interface Card {
  name: string;
  bg: string;
  image: string | null;
  borderColor: string;
  type: 'equipment' | 'attack' | 'classification';
}

const VideoCarousel = ({ videos, className = "" }: VideoCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dealtCards, setDealtCards] = useState<Card[]>([]);
  const [showDeck, setShowDeck] = useState(true);
  const isDealingRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);

  const allCards: Card[] = [
    { name: 'Computer', bg: 'bg-green-50', image: '/lovable-uploads/equipment-computer.png', borderColor: 'border-green-500', type: 'equipment' },
    { name: 'Cabling', bg: 'bg-green-50', image: '/lovable-uploads/equipment-cabling.png', borderColor: 'border-green-500', type: 'equipment' },
    { name: 'Equipment 3', bg: 'bg-gray-100', image: null, borderColor: 'border-green-500', type: 'equipment' },
    { name: 'Equipment 4', bg: 'bg-gray-100', image: null, borderColor: 'border-green-500', type: 'equipment' },
    { name: 'Equipment 5', bg: 'bg-gray-100', image: null, borderColor: 'border-green-500', type: 'equipment' },
    { name: 'Hacked', bg: 'bg-red-50', image: '/lovable-uploads/attack-hacked.png', borderColor: 'border-red-500', type: 'attack' },
    { name: 'Attack 2', bg: 'bg-gray-100', image: null, borderColor: 'border-red-500', type: 'attack' },
    { name: 'Attack 3', bg: 'bg-gray-100', image: null, borderColor: 'border-red-500', type: 'attack' },
    { name: 'Attack 4', bg: 'bg-gray-100', image: null, borderColor: 'border-red-500', type: 'attack' },
    { name: 'Attack 5', bg: 'bg-gray-100', image: null, borderColor: 'border-red-500', type: 'attack' },
    { name: 'Facilities', bg: 'bg-blue-50', image: '/lovable-uploads/classification-facilities.png', borderColor: 'border-blue-500', type: 'classification' },
    { name: 'Field Tech', bg: 'bg-blue-50', image: '/lovable-uploads/classification-fieldtech.png', borderColor: 'border-blue-500', type: 'classification' },
    { name: 'Classification 3', bg: 'bg-gray-100', image: null, borderColor: 'border-blue-500', type: 'classification' },
    { name: 'Classification 4', bg: 'bg-gray-100', image: null, borderColor: 'border-blue-500', type: 'classification' },
    { name: 'Classification 5', bg: 'bg-gray-100', image: null, borderColor: 'border-blue-500', type: 'classification' },
  ];

  const dealCards = () => {
    if (isDealingRef.current) return;
    isDealingRef.current = true;

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, 6);

    setDealtCards([]);
    
    const hideTimeout = window.setTimeout(() => {
      setShowDeck(false);
    }, 100);
    timeoutsRef.current.push(hideTimeout);

    selectedCards.forEach((card, index) => {
      const timeout = window.setTimeout(() => {
        setDealtCards(prev => [...prev, card]);
      }, 200 + index * 600);
      timeoutsRef.current.push(timeout);
    });

    const resetTimeout = window.setTimeout(() => {
      setDealtCards([]);
      
      const showDeckTimeout = window.setTimeout(() => {
        setShowDeck(true);
        isDealingRef.current = false;
        
        const restartTimeout = window.setTimeout(() => {
          dealCards();
        }, 1000);
        timeoutsRef.current.push(restartTimeout);
      }, 100);
      timeoutsRef.current.push(showDeckTimeout);
    }, 6800);
    timeoutsRef.current.push(resetTimeout);
  };

  useEffect(() => {
    const startDelay = window.setTimeout(() => {
      dealCards();
    }, 1000);

    return () => {
      clearTimeout(startDelay);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const handlePrevious = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const currentVideo = videos[currentIndex];

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

      {/* Video Display with Animated Card Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        {/* Left Side - Animated Card Deck */}
        <div className="lg:col-span-3 flex items-center justify-center">
          <div className="relative min-h-[300px] w-full flex items-center justify-center">
            {/* Deck with logo */}
            {showDeck && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative w-32 h-44 sm:w-40 sm:h-56">
                  <div className="absolute inset-0 bg-gray-100 border-4 border-primary shadow-2xl flex items-center justify-center animate-pulse-neon">
                    <img 
                      src="/wire-logo-official.png" 
                      alt="WIRED Logo" 
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain opacity-80"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Dealt cards fanning out */}
            <div className="flex justify-center items-center relative w-full" style={{ height: '300px' }}>
              {dealtCards.map((card, index) => {
                const totalCards = 6;
                const centerIndex = (totalCards - 1) / 2;
                const offset = index - centerIndex;
                const rotation = offset * 8;
                const translateY = Math.abs(offset) * 12;
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                const translateX = isMobile ? offset * 25 : offset * 40;
                const baseZIndex = 30 + index;
                const hoverZIndex = 100;

                return (
                  <div
                    key={`${card.name}-${index}`}
                    className="absolute left-1/2 top-1/2 group"
                    style={{
                      animation: 'dealCard 0.6s ease-out forwards',
                      opacity: 0,
                      zIndex: baseZIndex,
                    }}
                  >
                    <div
                      className={`w-24 h-36 sm:w-28 sm:h-40 ${card.image ? '' : `${card.bg} ${card.borderColor} border-4 rounded-xl`} shadow-2xl drop-shadow-lg overflow-hidden ${card.image ? '' : 'flex items-center justify-center'} transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-6 cursor-pointer`}
                      style={{
                        transform: `translate(-50%, -50%) translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
                        transformOrigin: 'center bottom',
                        zIndex: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement!.style.zIndex = hoverZIndex.toString();
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement!.style.zIndex = baseZIndex.toString();
                      }}
                    >
                      {card.image ? (
                        <img 
                          src={card.image} 
                          alt={card.name} 
                          className="w-full h-full object-contain" 
                          style={{ imageRendering: 'crisp-edges' }} 
                        />
                      ) : (
                        <span className="text-[10px] sm:text-xs text-muted-foreground text-center">{card.name}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Video Player */}
        <div className="lg:col-span-9 relative bg-gray-100 border-green-600 border-2 rounded-3xl overflow-hidden shadow-2xl drop-shadow-lg">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full neon-glow transition-all"
            aria-label="Previous video"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full neon-glow transition-all"
            aria-label="Next video"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Video Container */}
          {currentVideo.isYouTube && !isPlaying ? (
            <div 
              className="relative w-full h-64 md:h-96 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={handlePlay}
            >
              <div className="text-center space-y-4">
                <Logo size={100} className="mx-auto" />
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Play className="h-10 w-10" />
                  <span className="text-xl font-semibold">Play Video</span>
                </div>
              </div>
            </div>
          ) : currentVideo.isYouTube ? (
            <iframe
              src={`${currentVideo.src}?autoplay=1`}
              className="w-full h-64 md:h-96"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={currentVideo.title}
            />
          ) : (
            <video 
              controls 
              className="w-full h-auto"
              preload="metadata"
            >
              <source src={currentVideo.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {/* Video Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold neon-glow">
            {currentIndex + 1} / {videos.length}
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-3 overflow-x-auto pb-2 justify-center relative z-10">
        {videos.map((video, index) => (
          <button
            key={video.id}
            onClick={() => {
              setCurrentIndex(index);
              setIsPlaying(false);
            }}
            className={`flex-shrink-0 relative bg-gray-100 rounded-2xl overflow-hidden transition-all ${
              index === currentIndex
                ? 'border-4 border-green-600 neon-glow scale-105'
                : 'border-2 border-gray-300 hover:border-green-600 opacity-70 hover:opacity-100'
            }`}
            style={{ width: '120px', height: '80px' }}
          >
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Logo size={30} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-green-600/90 text-white text-xs px-2 py-1 truncate">
              Video {index + 1}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VideoCarousel;
