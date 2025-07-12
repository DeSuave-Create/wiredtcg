import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import ImageSection from '@/components/ImageSection';
import VideoSection from '@/components/VideoSection';
import ConnectionLines from '@/components/ConnectionLines';
import TextSection from '@/components/TextSection';
import { Button } from '@/components/ui/button';
import { Download, Play, BookOpen, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Extras = () => {
  const { toast } = useToast();

  const handleWatchTutorial = () => {
    toast({
      title: "Tutorial Video",
      description: "Loading the complete gameplay tutorial...",
    });
  };

  const handleDownload = (item: string) => {
    toast({
      title: `Downloading ${item}`,
      description: "Your download will begin shortly.",
    });
  };

  const handleViewOnline = () => {
    toast({
      title: "Online Rulebook",
      description: "Opening the interactive rulebook...",
    });
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

          {/* Gameplay Video Section */}
          <ContentSection title="How to Play">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <VideoSection
                src="https://www.youtube.com/embed/Aq5WXmQQooo"
                title="Official Gameplay Tutorial"
                description="Learn the basics of WIRED in this comprehensive tutorial covering setup, gameplay mechanics, and winning strategies."
                isYouTube={true}
                useLogoThumbnail={true}
              />
            </div>
              <div className="space-y-6">
                <TextSection title="Quick Start Guide">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Dealer shuffles and deals out 6 cards to each player.</li>
                    <li>Player to the left of Dealer goes first</li>
                    <li>Player turn goes as follows: Trade, 3 Moves, Discard, Draw</li>
                    <li>Players take turns building their networks and disabling other players networks.</li>
                    <li>First player to 25 points wins</li>
                  </ol>
                </TextSection>
                <Button 
                  onClick={handleWatchTutorial}
                  className="bg-green-600 text-white hover:bg-green-700 neon-glow"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Watch Full Tutorial
                </Button>
              </div>
            </div>
          </ContentSection>
          
          {/* Connection Animation */}
          <ConnectionLines className="my-2" />

          {/* Rule Book Section */}
          <ContentSection title="Official Rulebook">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <ImageSection
                  src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop"
                  alt="WIRED Rulebook Cover"
                  title="Complete Game Manual"
                  description="The comprehensive 24-page rulebook includes advanced strategies, variant game modes, and tournament rules."
                />
              </div>
              <div className="space-y-6">
                <TextSection title="What's Included">
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Basic gameplay rules and setup instructions</li>
                    <li>Advanced strategies for network optimization</li>
                    <li>Card reference guide with all abilities</li>
                    <li>Tournament and competitive play rules</li>
                    <li>Variant game modes for 1-6 players</li>
                    <li>Troubleshooting and FAQ section</li>
                  </ul>
                </TextSection>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => handleDownload('Rulebook PDF')}
                    className="bg-gray-100 rounded-3xl text-green-600 hover:bg-gray-200 neon-glow px-6 py-2 font-medium shadow-2xl drop-shadow-lg border-2 border-green-600 flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </button>
                  <button 
                    onClick={handleViewOnline}
                    className="bg-gray-100 rounded-3xl text-green-600 hover:bg-gray-200 neon-glow px-6 py-2 font-medium shadow-2xl drop-shadow-lg border-2 border-green-600 flex items-center justify-center"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Online
                  </button>
                </div>
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
                <p className="text-sm text-muted-foreground flex-grow">Complete game rules and strategies (PDF, 2.4MB)</p>
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