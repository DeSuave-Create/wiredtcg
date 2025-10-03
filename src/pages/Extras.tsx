import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import ImageSection from '@/components/ImageSection';
import VideoCarousel from '@/components/VideoCarousel';
import ConnectionLines from '@/components/ConnectionLines';
import TextSection from '@/components/TextSection';
import { Button } from '@/components/ui/button';
import { Download, BookOpen, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Extras = () => {
  const { toast } = useToast();
  const [gameModeIndex, setGameModeIndex] = useState(0);

  // Mock video data for the carousel
  const tutorialVideos = [
    {
      id: '1',
      src: 'https://www.youtube.com/embed/Aq5WXmQQooo',
      title: 'Official Gameplay Tutorial',
      description: 'Learn the basics of WIRED in this comprehensive tutorial covering setup, gameplay mechanics, and winning strategies.',
      isYouTube: true
    },
    {
      id: '2',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: 'Advanced Strategies',
      description: 'Master advanced network building techniques and learn how to counter your opponents effectively.',
      isYouTube: true
    },
    {
      id: '3',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: 'Card Abilities Guide',
      description: 'Detailed breakdown of all card types, their abilities, and optimal usage scenarios for competitive play.',
      isYouTube: true
    },
    {
      id: '4',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: 'Tournament Tips',
      description: 'Pro tips for tournament play including deck optimization, timing strategies, and reading your opponents.',
      isYouTube: true
    },
    {
      id: '5',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: 'Multiplayer Modes',
      description: 'Explore different multiplayer variants and team play strategies for 3-6 players.',
      isYouTube: true
    }
  ];

  const handleDownload = (item: string) => {
    if (item === 'Rulebook PDF' || item === 'Official Rulebook') {
      // Download the actual rulebook
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
    // Navigate to the protected viewer page
    window.location.href = '/rulebook';
  };

  const handleJoinDiscord = () => {
    toast({
      title: "Join Our Community",
      description: "Connect with other WIRED players on Discord!",
    });
  };

  const handleFollowUpdates = () => {
    toast({
      title: "Follow Us",
      description: "Stay updated with the latest WIRED news!",
    });
  };

  // Game modes data
  const gameModes = [
    { name: 'Internet', image: '/lovable-uploads/gamemode-internet.png', players: '2-6 Players' },
    { name: 'A.I.', image: '/lovable-uploads/gamemode-ai.png', players: '1-2 Players' },
    { name: 'BotNet', image: '/lovable-uploads/gamemode-botnet.png', players: '4-6 Players' }
  ];

  const cycleGameMode = () => {
    setGameModeIndex((prev) => (prev + 1) % gameModes.length);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex justify-center flex-grow">
        <div className="w-full max-w-6xl">
          {/* Page Header */}
          <ContentSection title="Game Extras & Resources" glowEffect>
            <div className="text-center">
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to master WIRED - from gameplay tutorials to official rules and downloads.
              </p>
            </div>
          </ContentSection>
          
          {/* Connection Animation */}
          <ConnectionLines className="my-2" />

          {/* Video Carousel Section */}
          <ContentSection title="Video Tutorials">
            <VideoCarousel videos={tutorialVideos} />
          </ContentSection>
          
          {/* Connection Animation */}
          <ConnectionLines className="my-2" />

          {/* Rule Book Section */}
          <ContentSection title="Official Rulebook">
            <div className="space-y-8">
              {/* Centered Title and Description */}
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-primary">Complete Game Manual</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  The comprehensive 7-page rulebook includes everything you need to master WIRED.
                </p>
              </div>

              {/* Game Modes Card Deck */}
              <div className="flex justify-center items-center min-h-[292px] sm:min-h-[333px] lg:min-h-[417px] relative py-4 sm:py-6 lg:py-8">
                {/* Ghost logo background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <img 
                    src="/wire-logo-official.png" 
                    alt="WIRED Ghost Logo" 
                    className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[480px] lg:h-[480px] object-contain opacity-10"
                  />
                </div>

                {/* Card Deck with same container as Card back */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div 
                    className="relative w-28 h-40 sm:w-36 sm:h-52 lg:w-44 lg:h-64 xl:w-52 xl:h-80 shadow-2xl drop-shadow-lg overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-110"
                    onClick={cycleGameMode}
                  >
                    {gameModes.map((card, idx) => {
                      const offset = (idx - gameModeIndex + gameModes.length) % gameModes.length;
                      const rotation = offset === 0 ? 'group-hover:rotate-6' : offset === 1 ? '' : 'group-hover:-rotate-6';
                      const translation = offset === 0 ? 'group-hover:translate-x-4' : offset === 1 ? 'translate-x-1 translate-y-1' : 'translate-x-2 translate-y-2 group-hover:-translate-x-4';
                      const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
                      
                      return (
                        <div
                          key={idx}
                          className={`absolute inset-0 transition-all duration-300 transform ${translation} ${rotation} ${zIndex}`}
                        >
                          <img 
                            src={card.image} 
                            alt={card.name} 
                            className="w-full h-full object-contain"
                            style={{ imageRendering: 'crisp-edges' }}
                          />
                        </div>
                      );
                    })}
                    {/* Card indicator dots */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                      {gameModes.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            idx === gameModeIndex ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Centered Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <button 
                  onClick={() => handleDownload('Rulebook PDF')}
                  className="bg-gray-100 rounded-3xl text-green-600 hover:bg-gray-200 neon-glow px-8 py-3 font-medium shadow-2xl drop-shadow-lg border-2 border-green-600 flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download PDF
                </button>
                <button 
                  onClick={handleViewOnline}
                  className="bg-gray-100 rounded-3xl text-green-600 hover:bg-gray-200 neon-glow px-8 py-3 font-medium shadow-2xl drop-shadow-lg border-2 border-green-600 flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  View Online
                </button>
              </div>
            </div>
          </ContentSection>
          
          {/* Connection Animation */}
          <ConnectionLines className="my-2" />

          {/* Downloads Section */}
          <ContentSection title="Downloads & Resources">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Rulebook Download */}
              <div className="bg-gray-100 border-green-600 border-8 rounded-3xl p-6 text-center space-y-4 shadow-2xl drop-shadow-lg flex flex-col">
                <FileText className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold text-green-600">Official Rulebook</h3>
                <p className="text-sm text-muted-foreground flex-grow">Complete game rules and strategies (PDF, 7 pages)</p>
                <button
                  onClick={() => handleDownload('Official Rulebook')}
                  className="bg-gray-100 rounded-3xl text-green-600 hover:bg-gray-200 neon-glow px-6 py-2 font-medium shadow-2xl drop-shadow-lg w-full border-2 border-green-600 mt-auto flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
              </div>

              {/* Score Sheets */}
              <div className="bg-gray-100 border-green-600 border-8 rounded-3xl p-6 text-center space-y-4 shadow-2xl drop-shadow-lg flex flex-col">
                <FileText className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold text-green-600">Score Sheets</h3>
                <p className="text-sm text-muted-foreground flex-grow">Printable score tracking sheets (PDF, 0.5MB)</p>
                <button 
                  onClick={() => handleDownload('Score Sheets')}
                  className="bg-gray-100 rounded-3xl text-green-600 hover:bg-gray-200 neon-glow px-6 py-2 font-medium shadow-2xl drop-shadow-lg w-full border-2 border-green-600 mt-auto flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
              </div>

              {/* Card Reference */}
              <div className="bg-gray-100 border-green-600 border-8 rounded-3xl p-6 text-center space-y-4 shadow-2xl drop-shadow-lg flex flex-col">
                <FileText className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold text-green-600">Card Reference</h3>
                <p className="text-sm text-muted-foreground flex-grow">Quick reference for all cards (PDF, 1.1MB)</p>
                <button 
                  onClick={() => handleDownload('Card Reference')}
                  className="bg-gray-100 rounded-3xl text-green-600 hover:bg-gray-200 neon-glow px-6 py-2 font-medium shadow-2xl drop-shadow-lg w-full border-2 border-green-600 mt-auto flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          </ContentSection>
          
          {/* Connection Animation */}
          <ConnectionLines className="my-2" />
          
          {/* Community Section */}
          <ContentSection title="Join the Community">
            <TextSection>
              <div className="text-center space-y-4">
                <p className="text-lg">
                  Connect with other WIRED players, share strategies, and stay updated on tournaments and new releases.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={handleJoinDiscord}
                    className="bg-green-600 text-white hover:bg-green-700 neon-glow"
                  >
                    Join Discord
                  </Button>
                  <Button 
                    onClick={handleFollowUpdates}
                    variant="outline" 
                    className="neon-border"
                  >
                    Follow Updates
                  </Button>
                </div>
              </div>
            </TextSection>
          </ContentSection>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Extras;