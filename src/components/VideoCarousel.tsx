import { useState, useRef, useEffect } from 'react';
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

const VideoCarousel = ({ videos, className = "" }: VideoCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [equipmentCardIndex, setEquipmentCardIndex] = useState(0);
  const [classificationCardIndex, setClassificationCardIndex] = useState(0);
  const [attackCardIndex, setAttackCardIndex] = useState(0);
  const [resolutionCardIndex, setResolutionCardIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pause video when switching
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, [currentIndex]);

  const equipmentCards = [
    { name: 'Computer', bg: 'bg-green-50', image: '/lovable-uploads/equipment-computer-new.png' },
    { name: 'Cabling (3x)', bg: 'bg-green-50', image: '/lovable-uploads/equipment-3cable.png' },
    { name: 'Cabling (2x)', bg: 'bg-green-50', image: '/lovable-uploads/equipment-2cable.png' },
    { name: 'Switch', bg: 'bg-green-50', image: '/lovable-uploads/equipment-switch.png' }
  ];

  const classificationCards = [
    { name: 'Facilities', bg: 'bg-blue-50', image: '/lovable-uploads/classification-facilities-new.png' },
    { name: 'Field Tech', bg: 'bg-blue-50', image: '/lovable-uploads/classification-fieldtech-new.png' },
    { name: 'Supervisor', bg: 'bg-blue-50', image: '/lovable-uploads/classification-supervisor.png' },
    { name: 'Security Specialist', bg: 'bg-blue-50', image: '/lovable-uploads/classification-security.png' },
    { name: 'Head Hunter', bg: 'bg-blue-50', image: '/lovable-uploads/classification-headhunter.png' },
    { name: 'Seal the Deal', bg: 'bg-blue-50', image: '/lovable-uploads/classification-sealthedeal.png' }
  ];

  const attackCards = [
    { name: 'Hacked', bg: 'bg-red-50', image: '/lovable-uploads/attack-hacked-new.png' },
    { name: 'New Hire', bg: 'bg-red-50', image: '/lovable-uploads/attack-newhire.png' },
    { name: 'Power Outage', bg: 'bg-red-50', image: '/lovable-uploads/attack-poweroutage.png' },
    { name: 'Audit', bg: 'bg-red-50', image: '/lovable-uploads/attack-audit.png' }
  ];

  const resolutionCards = [
    { name: 'Trained', bg: 'bg-red-50', image: '/lovable-uploads/resolution-trained.png' },
    { name: 'Helpdesk', bg: 'bg-red-50', image: '/lovable-uploads/resolution-helpdesk.png' },
    { name: 'Powered', bg: 'bg-red-50', image: '/lovable-uploads/resolution-powered.png' },
    { name: 'Secured', bg: 'bg-red-50', image: '/lovable-uploads/resolution-secured.png' }
  ];

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

  const cycleEquipmentCard = () => {
    setEquipmentCardIndex((prev) => (prev + 1) % equipmentCards.length);
  };

  const cycleClassificationCard = () => {
    setClassificationCardIndex((prev) => (prev + 1) % classificationCards.length);
  };

  const cycleAttackCard = () => {
    setAttackCardIndex((prev) => (prev + 1) % attackCards.length);
  };

  const cycleResolutionCard = () => {
    setResolutionCardIndex((prev) => (prev + 1) % resolutionCards.length);
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

      {/* Mobile: Cards in 2x2 Grid Above Video */}
      <div className="grid grid-cols-2 gap-4 mb-4 md:hidden">
        {/* Equipment Cards - Top Left */}
        <div className="flex justify-center">
          <div 
            className="relative w-24 h-32 group cursor-pointer transition-transform duration-300 hover:scale-150 hover:z-50"
            onClick={cycleEquipmentCard}
          >
            {equipmentCards.map((card, idx) => {
              const offset = (idx - equipmentCardIndex + equipmentCards.length) % equipmentCards.length;
              const rotation = offset === 0 ? 'group-hover:rotate-12' : offset === 1 ? '' : 'group-hover:-rotate-12';
              const translation = offset === 0 ? 'group-hover:translate-x-2' : offset === 1 ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-1 translate-y-1 group-hover:-translate-x-2';
              const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
              
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 ${card.image ? '' : card.bg} border-green-600 border-3 shadow-lg overflow-hidden transition-all duration-300 transform ${translation} ${rotation} ${zIndex} ${card.image ? '' : 'rounded-xl flex items-center justify-center'}`}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{card.name}</span>
                  )}
                </div>
              );
            })}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {equipmentCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === equipmentCardIndex ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Resolution Cards - Top Right */}
        <div className="flex justify-center">
          <div 
            className="relative w-24 h-32 group cursor-pointer transition-transform duration-300 hover:scale-150 hover:z-50"
            onClick={cycleResolutionCard}
          >
            {resolutionCards.map((card, idx) => {
              const offset = (idx - resolutionCardIndex + resolutionCards.length) % resolutionCards.length;
              const rotation = offset === 0 ? 'group-hover:-rotate-12' : offset === 1 ? '' : 'group-hover:rotate-12';
              const translation = offset === 0 ? 'group-hover:-translate-x-2' : offset === 1 ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-1 translate-y-1 group-hover:translate-x-2';
              const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
              
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 ${card.image ? '' : card.bg} border-red-700 border-3 shadow-lg overflow-hidden transition-all duration-300 transform ${translation} ${rotation} ${zIndex} ${card.image ? '' : 'rounded-xl flex items-center justify-center'}`}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{card.name}</span>
                  )}
                </div>
              );
            })}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {resolutionCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === resolutionCardIndex ? 'bg-red-700' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Attack Cards - Bottom Left */}
        <div className="flex justify-center">
          <div 
            className="relative w-24 h-32 group cursor-pointer transition-transform duration-300 hover:scale-150 hover:z-50"
            onClick={cycleAttackCard}
          >
            {attackCards.map((card, idx) => {
              const offset = (idx - attackCardIndex + attackCards.length) % attackCards.length;
              const rotation = offset === 0 ? 'group-hover:rotate-12' : offset === 1 ? '' : 'group-hover:-rotate-12';
              const translation = offset === 0 ? 'group-hover:translate-x-2' : offset === 1 ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-1 translate-y-1 group-hover:-translate-x-2';
              const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
              
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 ${card.image ? '' : card.bg} border-red-600 border-3 shadow-lg overflow-hidden transition-all duration-300 transform ${translation} ${rotation} ${zIndex} ${card.image ? '' : 'rounded-xl flex items-center justify-center'}`}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{card.name}</span>
                  )}
                </div>
              );
            })}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {attackCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === attackCardIndex ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Classification Cards - Bottom Right */}
        <div className="flex justify-center">
          <div 
            className="relative w-24 h-32 group cursor-pointer transition-transform duration-300 hover:scale-150 hover:z-50"
            onClick={cycleClassificationCard}
          >
            {classificationCards.map((card, idx) => {
              const offset = (idx - classificationCardIndex + classificationCards.length) % classificationCards.length;
              const rotation = offset === 0 ? 'group-hover:-rotate-12' : offset === 1 ? '' : 'group-hover:rotate-12';
              const translation = offset === 0 ? 'group-hover:-translate-x-2' : offset === 1 ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-1 translate-y-1 group-hover:translate-x-2';
              const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
              
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 ${card.image ? '' : card.bg} border-blue-600 border-3 shadow-lg overflow-hidden transition-all duration-300 transform ${translation} ${rotation} ${zIndex} ${card.image ? '' : 'rounded-xl flex items-center justify-center'}`}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{card.name}</span>
                  )}
                </div>
              );
            })}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {classificationCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === classificationCardIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tablet: Cards in Single Horizontal Line Above Video */}
      <div className="hidden md:flex lg:hidden justify-center gap-4 mb-4 pb-4">
        {/* Equipment Cards */}
        <div className="flex justify-center">
          <div 
            className="relative w-24 h-32 group cursor-pointer transition-transform duration-300 hover:scale-150 hover:z-50"
            onClick={cycleEquipmentCard}
          >
            {equipmentCards.map((card, idx) => {
              const offset = (idx - equipmentCardIndex + equipmentCards.length) % equipmentCards.length;
              const rotation = offset === 0 ? 'group-hover:rotate-12' : offset === 1 ? '' : 'group-hover:-rotate-12';
              const translation = offset === 0 ? 'group-hover:translate-x-2' : offset === 1 ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-1 translate-y-1 group-hover:-translate-x-2';
              const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
              
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 ${card.image ? '' : card.bg} border-green-600 border-3 shadow-lg overflow-hidden transition-all duration-300 transform ${translation} ${rotation} ${zIndex} ${card.image ? '' : 'rounded-xl flex items-center justify-center'}`}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{card.name}</span>
                  )}
                </div>
              );
            })}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {equipmentCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === equipmentCardIndex ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Classification Cards */}
        <div className="flex justify-center">
          <div 
            className="relative w-24 h-32 group cursor-pointer transition-transform duration-300 hover:scale-150 hover:z-50"
            onClick={cycleClassificationCard}
          >
            {classificationCards.map((card, idx) => {
              const offset = (idx - classificationCardIndex + classificationCards.length) % classificationCards.length;
              const rotation = offset === 0 ? 'group-hover:-rotate-12' : offset === 1 ? '' : 'group-hover:rotate-12';
              const translation = offset === 0 ? 'group-hover:-translate-x-2' : offset === 1 ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-1 translate-y-1 group-hover:translate-x-2';
              const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
              
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 ${card.image ? '' : card.bg} border-blue-600 border-3 shadow-lg overflow-hidden transition-all duration-300 transform ${translation} ${rotation} ${zIndex} ${card.image ? '' : 'rounded-xl flex items-center justify-center'}`}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{card.name}</span>
                  )}
                </div>
              );
            })}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {classificationCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === classificationCardIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Attack Cards */}
        <div className="flex justify-center">
          <div 
            className="relative w-24 h-32 group cursor-pointer transition-transform duration-300 hover:scale-150 hover:z-50"
            onClick={cycleAttackCard}
          >
            {attackCards.map((card, idx) => {
              const offset = (idx - attackCardIndex + attackCards.length) % attackCards.length;
              const rotation = offset === 0 ? 'group-hover:rotate-12' : offset === 1 ? '' : 'group-hover:-rotate-12';
              const translation = offset === 0 ? 'group-hover:translate-x-2' : offset === 1 ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-1 translate-y-1 group-hover:-translate-x-2';
              const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
              
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 ${card.image ? '' : card.bg} border-red-600 border-3 shadow-lg overflow-hidden transition-all duration-300 transform ${translation} ${rotation} ${zIndex} ${card.image ? '' : 'rounded-xl flex items-center justify-center'}`}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{card.name}</span>
                  )}
                </div>
              );
            })}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {attackCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === attackCardIndex ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Resolution Cards */}
        <div className="flex justify-center">
          <div 
            className="relative w-24 h-32 group cursor-pointer transition-transform duration-300 hover:scale-150 hover:z-50"
            onClick={cycleResolutionCard}
          >
            {resolutionCards.map((card, idx) => {
              const offset = (idx - resolutionCardIndex + resolutionCards.length) % resolutionCards.length;
              const rotation = offset === 0 ? 'group-hover:-rotate-12' : offset === 1 ? '' : 'group-hover:rotate-12';
              const translation = offset === 0 ? 'group-hover:-translate-x-2' : offset === 1 ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-1 translate-y-1 group-hover:translate-x-2';
              const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
              
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 ${card.image ? '' : card.bg} border-red-700 border-3 shadow-lg overflow-hidden transition-all duration-300 transform ${translation} ${rotation} ${zIndex} ${card.image ? '' : 'rounded-xl flex items-center justify-center'}`}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{card.name}</span>
                  )}
                </div>
              );
            })}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {resolutionCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === resolutionCardIndex ? 'bg-red-700' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Original Grid Layout with Cards on Sides */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 relative z-10">
        {/* Left Card Stacks */}
        <div className="lg:col-span-2 flex flex-col justify-between gap-4 py-4">
          {/* Top Left - Green Equipment Cards */}
          <div 
            className="relative w-24 h-32 lg:w-28 lg:h-40 group cursor-pointer transition-transform duration-300 hover:scale-150 hover:z-50"
            onClick={cycleEquipmentCard}
          >
            {equipmentCards.map((card, idx) => {
              const offset = (idx - equipmentCardIndex + equipmentCards.length) % equipmentCards.length;
              const rotation = offset === 0 ? 'group-hover:rotate-12' : offset === 1 ? '' : 'group-hover:-rotate-12';
              const translation = offset === 0 ? 'group-hover:translate-x-2' : offset === 1 ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-1 translate-y-1 group-hover:-translate-x-2';
              const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
              
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 ${card.image ? '' : card.bg} border-green-600 border-3 shadow-lg overflow-hidden transition-all duration-300 transform ${translation} ${rotation} ${zIndex} ${card.image ? '' : 'rounded-xl flex items-center justify-center'}`}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{card.name}</span>
                  )}
                </div>
              );
            })}
            {/* Card indicator dots */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {equipmentCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === equipmentCardIndex ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Bottom Left - Red Attack Cards */}
          <div 
            className="relative w-24 h-32 lg:w-28 lg:h-40 group cursor-pointer transition-transform duration-300 hover:scale-150 hover:z-50"
            onClick={cycleAttackCard}
          >
            {attackCards.map((card, idx) => {
              const offset = (idx - attackCardIndex + attackCards.length) % attackCards.length;
              const rotation = offset === 0 ? 'group-hover:rotate-12' : offset === 1 ? '' : 'group-hover:-rotate-12';
              const translation = offset === 0 ? 'group-hover:translate-x-2' : offset === 1 ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-1 translate-y-1 group-hover:-translate-x-2';
              const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
              
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 ${card.image ? '' : card.bg} border-red-600 border-3 shadow-lg overflow-hidden transition-all duration-300 transform ${translation} ${rotation} ${zIndex} ${card.image ? '' : 'rounded-xl flex items-center justify-center'}`}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{card.name}</span>
                  )}
                </div>
              );
            })}
            {/* Card indicator dots */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {attackCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === attackCardIndex ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Center Video Player */}
        <div className="lg:col-span-8 relative bg-gray-100 border-green-600 border-2 rounded-3xl overflow-hidden shadow-2xl drop-shadow-lg">
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

        {/* Right Card Stacks */}
        <div className="lg:col-span-2 flex flex-col justify-between gap-4 py-4 items-end">
          {/* Top Right - Red Resolution Cards */}
          <div 
            className="relative w-24 h-32 lg:w-28 lg:h-40 group cursor-pointer transition-transform duration-300 hover:scale-150 hover:z-50"
            onClick={cycleResolutionCard}
          >
            {resolutionCards.map((card, idx) => {
              const offset = (idx - resolutionCardIndex + resolutionCards.length) % resolutionCards.length;
              const rotation = offset === 0 ? 'group-hover:-rotate-12' : offset === 1 ? '' : 'group-hover:rotate-12';
              const translation = offset === 0 ? 'group-hover:-translate-x-2' : offset === 1 ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-1 translate-y-1 group-hover:translate-x-2';
              const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
              
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 ${card.image ? '' : card.bg} border-red-700 border-3 shadow-lg overflow-hidden transition-all duration-300 transform ${translation} ${rotation} ${zIndex} ${card.image ? '' : 'rounded-xl flex items-center justify-center'}`}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{card.name}</span>
                  )}
                </div>
              );
            })}
            {/* Card indicator dots */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {resolutionCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === resolutionCardIndex ? 'bg-red-700' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Bottom Right - Blue Classification Cards */}
          <div 
            className="relative w-24 h-32 lg:w-28 lg:h-40 group cursor-pointer transition-transform duration-300 hover:scale-150 hover:z-50"
            onClick={cycleClassificationCard}
          >
            {classificationCards.map((card, idx) => {
              const offset = (idx - classificationCardIndex + classificationCards.length) % classificationCards.length;
              const rotation = offset === 0 ? 'group-hover:-rotate-12' : offset === 1 ? '' : 'group-hover:rotate-12';
              const translation = offset === 0 ? 'group-hover:-translate-x-2' : offset === 1 ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-1 translate-y-1 group-hover:translate-x-2';
              const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
              
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 ${card.image ? '' : card.bg} border-blue-600 border-3 shadow-lg overflow-hidden transition-all duration-300 transform ${translation} ${rotation} ${zIndex} ${card.image ? '' : 'rounded-xl flex items-center justify-center'}`}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{card.name}</span>
                  )}
                </div>
              );
            })}
            {/* Card indicator dots */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {classificationCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === classificationCardIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Video Player */}
      <div className="lg:hidden relative bg-gray-100 border-green-600 border-2 rounded-3xl overflow-hidden shadow-2xl drop-shadow-lg z-10">
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
            ref={videoRef}
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
