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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Internet Mode */}
                <div className="bg-gray-100 border-green-600 border-8 rounded-3xl p-6 text-center space-y-4 shadow-2xl drop-shadow-lg flex flex-col hover:scale-105 transition-all duration-300">
                  <div className="h-48 flex items-center justify-center">
                    <img 
                      src="/lovable-uploads/gamemode-internet.png" 
                      alt="Internet Mode" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-black text-green-600 uppercase tracking-wider">Internet</h3>
                  <p className="text-sm text-black font-medium">2-6 Players</p>
                </div>

                {/* AI Mode */}
                <div className="bg-gray-100 border-green-600 border-8 rounded-3xl p-6 text-center space-y-4 shadow-2xl drop-shadow-lg flex flex-col hover:scale-105 transition-all duration-300">
                  <div className="h-48 flex items-center justify-center">
                    <img 
                      src="/lovable-uploads/gamemode-ai.png" 
                      alt="AI Mode" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-black text-green-600 uppercase tracking-wider">A.I.</h3>
                  <p className="text-sm text-black font-medium">1-2 Players</p>
                </div>

                {/* BotNet Mode */}
                <div className="bg-gray-100 border-green-600 border-8 rounded-3xl p-6 text-center space-y-4 shadow-2xl drop-shadow-lg flex flex-col hover:scale-105 transition-all duration-300">
                  <div className="h-48 flex items-center justify-center">
                    <img 
                      src="/lovable-uploads/gamemode-botnet.png" 
                      alt="BotNet Mode" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-black text-green-600 uppercase tracking-wider">BotNet</h3>
                  <p className="text-sm text-black font-medium">4-6 Players</p>
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