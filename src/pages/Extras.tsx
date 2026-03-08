import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import VideoCarousel from '@/components/VideoCarousel';
import ElectricProgressBar from '@/components/ElectricProgressBar';
import { Button } from '@/components/ui/button';
import { Download, BookOpen, FileText, Video, Gamepad2, FolderDown, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Extras = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [gameModeIndex, setGameModeIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('videos');

  const sections = [
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'rulebook', label: 'Rulebook', icon: BookOpen },
    { id: 'downloads', label: 'Downloads', icon: FolderDown },
  ] as const;

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const assignRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  useEffect(() => {
    const els = Object.entries(sectionRefs.current).filter(([, el]) => el) as [string, HTMLDivElement][];
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSection(visible[0].target.getAttribute('data-section') || 'videos');
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    els.forEach(([, el]) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const tutorialVideos = [
    {
      id: '1',
      src: 'https://www.youtube.com/embed/UzE9E9ukdGk',
      title: 'Official Gameplay Tutorial',
      description: 'Learn the basics of WIRED in this comprehensive video covering setup, gameplay mechanics, and winning strategies.',
      isYouTube: true
    },
    {
      id: '2',
      src: '/videos/Wired-Intro2.mp4',
      title: 'WIRED Intro Part 2',
      description: 'Continue exploring WIRED gameplay with advanced strategies and techniques.',
      isYouTube: false
    },
    {
      id: '3',
      src: '/videos/Wired-Intro3.mp4',
      title: 'WIRED Intro Part 3',
      description: 'Master the game with expert tips and winning tactics.',
      isYouTube: false
    },
    {
      id: '4',
      src: '/videos/Wired-Intro.mp4',
      title: 'WIRED Intro',
      description: 'Watch a full game in action and see how strategies unfold in real-time.',
      isYouTube: false
    }
  ];

  const handleDownload = (item: string) => {
    if (item === 'Rulebook PDF' || item === 'Official Rulebook') {
      const link = document.createElement('a');
      link.href = '/WIRED_Instructions.pdf';
      link.download = 'WIRED_Instructions.pdf';
      link.click();
      toast({
        title: "Downloading Rulebook",
        description: "Your download has started!",
      });
    } else {
      toast({
        title: `Downloading ${item}`,
        description: "Your download will begin shortly.",
      });
    }
  };

  const handleViewOnline = () => {
    window.location.href = '/rulebook';
  };

  // Game modes data
  const gameModes = [
    { name: 'Internet', image: '/lovable-uploads/gamemode-internet.png', players: '2-6 Players', borderColor: 'border-green-600' },
    { name: 'A.I.', image: '/lovable-uploads/gamemode-ai.png', players: 'TBA', borderColor: 'border-blue-600' },
    { name: 'BotNet', image: '/lovable-uploads/gamemode-botnet.png', players: 'TBA', borderColor: 'border-red-600' }
  ];

  const cycleGameMode = () => {
    setGameModeIndex((prev) => (prev + 1) % gameModes.length);
  };

  const handleGameModeClick = () => {
    cycleGameMode();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Secondary Section Nav - always visible */}
      <div className="sticky top-16 z-40 border-b border-muted/30 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center gap-1 sm:gap-2 py-2 overflow-x-auto scrollbar-hide">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium font-orbitron tracking-wide transition-colors duration-200 whitespace-nowrap min-h-[36px]',
                  activeSection === id
                    ? 'bg-primary/20 text-primary border border-primary/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 flex justify-center flex-grow">
        <div className="w-full max-w-6xl [&_[data-section]]:scroll-mt-28">
          {/* Page Header */}
          <ContentSection title="Game Extras & Resources" glowEffect>
            <div className="text-center">
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to master WIRED - from gameplay videos to official rules and downloads.
              </p>
            </div>
          </ContentSection>
          
          <ElectricProgressBar />

          {/* Video Carousel Section */}
          <div ref={assignRef('videos')} data-section="videos">
            <ContentSection title={`"Wired: The Card Game": Videos`}>
              <VideoCarousel videos={tutorialVideos} />
            </ContentSection>
          </div>
          
          <ElectricProgressBar />

          {/* Rule Book Section */}
          <div ref={assignRef('rulebook')} data-section="rulebook">
          <ContentSection title="Official Rulebook">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold font-orbitron text-primary">Complete Game Manual</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  The comprehensive 7-page rulebook includes everything you need to master WIRED.
                </p>
              </div>

              {/* Game Modes Card Deck */}
              <div className="flex justify-center items-center min-h-[200px] sm:min-h-[240px] lg:min-h-[300px] relative py-2 sm:py-3 lg:py-4">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <img 
                    src="/wire-logo-official.png" 
                    alt="WIRED Ghost Logo" 
                    className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[480px] lg:h-[480px] object-contain opacity-10"
                  />
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div 
                    className="relative w-28 h-40 sm:w-36 sm:h-52 lg:w-44 lg:h-64 xl:w-52 xl:h-80 group cursor-pointer transition-transform duration-300 hover:scale-105"
                    onClick={handleGameModeClick}
                  >
                    {gameModes.map((card, idx) => {
                      const offset = (idx - gameModeIndex + gameModes.length) % gameModes.length;
                      const rotation = offset === 0 ? 'group-hover:rotate-12' : offset === 1 ? '' : 'group-hover:-rotate-12';
                      const translation = offset === 0 ? 'group-hover:translate-x-3' : offset === 1 ? 'translate-x-1 translate-y-1' : 'translate-x-2 translate-y-2 group-hover:-translate-x-3';
                      const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
                      
                      return (
                        <div
                          key={idx}
                          className={`absolute inset-0 ${card.borderColor} border-4 rounded-lg shadow-lg transition-all duration-300 transform ${translation} ${rotation} ${zIndex} overflow-hidden`}
                        >
                          <img 
                            src={card.image} 
                            alt={card.name} 
                            className="w-full h-full object-cover rounded-md"
                            style={{ imageRendering: 'crisp-edges' }}
                          />
                        </div>
                      );
                    })}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                      {gameModes.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            idx === gameModeIndex ? 'bg-primary' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Centered Buttons */}
              <div className="flex flex-col items-center gap-6 pt-4">
                <div className="w-full max-w-2xl">
                  <h3 className="text-lg font-semibold font-orbitron text-primary text-center mb-4">Select Game Mode Instructions:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button 
                      onClick={() => navigate('/internet-instructions')}
                      className="bg-gray-50 dark:bg-gray-800/90 rounded-xl text-green-500 hover:bg-gray-200 dark:hover:bg-gray-700/90 px-6 py-4 font-medium shadow-lg border-2 border-green-500 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105"
                      style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}
                    >
                      <BookOpen className="h-6 w-6 mb-2 text-green-500" />
                      <span className="font-bold text-green-500">Internet Mode</span>
                      <span className="text-xs mt-1 text-green-500">2-6 Players</span>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/ai-instructions')}
                      className="bg-gray-50 dark:bg-gray-800/90 rounded-xl text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700/90 px-6 py-4 font-medium shadow-lg border-2 border-blue-500 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105"
                      style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
                    >
                      <BookOpen className="h-6 w-6 mb-2 text-blue-500" />
                      <span className="font-bold text-blue-500">A.I. Mode</span>
                      <span className="text-xs mt-1 text-blue-500">TBA</span>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/botnet-instructions')}
                      className="bg-gray-50 dark:bg-gray-800/90 rounded-xl text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700/90 px-6 py-4 font-medium shadow-lg border-2 border-red-500 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105"
                      style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}
                    >
                      <BookOpen className="h-6 w-6 mb-2 text-red-500" />
                      <span className="font-bold text-red-500">BotNet Mode</span>
                      <span className="text-xs mt-1 text-red-500">TBA</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button 
                    onClick={() => handleDownload('Rulebook PDF')}
                    className="bg-gray-50 dark:bg-gray-800/90 rounded-3xl text-primary hover:bg-gray-200 dark:hover:bg-gray-700/90 neon-glow px-8 py-3 font-medium shadow-2xl drop-shadow-lg border-2 border-primary flex items-center justify-center transition-all duration-300 hover:scale-105"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download PDF
                  </button>
                  <button 
                    onClick={handleViewOnline}
                    className="bg-gray-50 dark:bg-gray-800/90 rounded-3xl text-primary hover:bg-gray-200 dark:hover:bg-gray-700/90 neon-glow px-8 py-3 font-medium shadow-2xl drop-shadow-lg border-2 border-primary flex items-center justify-center transition-all duration-300 hover:scale-105"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    View PDF Online
                  </button>
                </div>
              </div>
            </div>
          </ContentSection>
          </div>
          
          <ElectricProgressBar />

          {/* Downloads & Resources Section */}
          <div ref={assignRef('downloads')} data-section="downloads">
            <ContentSection title="Downloads & Resources">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* Score Sheets */}
                <div className="bg-muted/10 border-2 border-primary rounded-3xl p-6 text-center space-y-4 shadow-lg flex flex-col">
                  <FileText className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold font-orbitron text-primary">Score Sheets</h3>
                  <p className="text-sm text-muted-foreground flex-grow">Printable score tracking sheets matching our digital Score Keeper design</p>
                  <button 
                    onClick={() => handleDownload('Score Sheets')}
                    className="bg-muted/20 rounded-3xl text-primary hover:bg-muted/40 neon-glow px-6 py-2 font-medium shadow-lg w-full border-2 border-primary mt-auto flex items-center justify-center transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>

                {/* Card Reference */}
                <div className="bg-muted/10 border-2 border-primary rounded-3xl p-6 text-center space-y-4 shadow-lg flex flex-col">
                  <Layers className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold font-orbitron text-primary">Card Reference</h3>
                  <p className="text-sm text-muted-foreground flex-grow">All 145 unique cards organized by type</p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                    <button 
                      onClick={() => navigate('/card-reference')}
                      className="bg-muted/20 rounded-3xl text-primary hover:bg-muted/40 neon-glow px-4 py-2 font-medium shadow-lg w-full border-2 border-primary flex items-center justify-center transition-colors"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      View
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/card-reference');
                        setTimeout(() => window.print(), 1000);
                      }}
                      className="bg-muted/20 rounded-3xl text-primary hover:bg-muted/40 neon-glow px-4 py-2 font-medium shadow-lg w-full border-2 border-primary flex items-center justify-center transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Print
                    </button>
                  </div>
                </div>

                {/* Interactive Guide */}
                <div className="bg-muted/10 border-2 border-primary rounded-3xl p-6 text-center space-y-4 shadow-lg flex flex-col">
                  <Gamepad2 className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold font-orbitron text-primary">Interactive Guide</h3>
                  <p className="text-sm text-muted-foreground flex-grow">Learn how every card interacts through visual gameplay examples</p>
                  <button 
                    onClick={() => navigate('/card-reference')}
                    className="bg-muted/20 rounded-3xl text-primary hover:bg-muted/40 neon-glow px-6 py-2 font-medium shadow-lg w-full border-2 border-primary mt-auto flex items-center justify-center transition-colors"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Launch Tutorial
                  </button>
                </div>
              </div>
            </ContentSection>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Extras;
