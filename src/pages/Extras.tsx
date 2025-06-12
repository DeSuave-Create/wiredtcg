
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import ImageSection from '@/components/ImageSection';
import VideoSection from '@/components/VideoSection';
import TextSection from '@/components/TextSection';
import { Button } from '@/components/ui/button';
import { Download, Play, BookOpen, FileText } from 'lucide-react';

const Extras = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <ContentSection title="Game Extras & Resources" glowEffect>
          <div className="text-center">
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to master WIRED - from gameplay tutorials to official rules and downloads.
            </p>
          </div>
        </ContentSection>

        {/* Gameplay Video Section */}
        <ContentSection title="How to Play">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <VideoSection
                src="/placeholder-video.mp4"
                title="Official Gameplay Tutorial"
                description="Learn the basics of WIRED in this comprehensive 10-minute tutorial covering setup, gameplay mechanics, and winning strategies."
              />
            </div>
            <div className="space-y-6">
              <TextSection title="Quick Start Guide">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Each player starts with 5 Computer cards and 3 Wire cards</li>
                  <li>Place Switch cards in the center of the play area</li>
                  <li>Players take turns deploying cards to build their network</li>
                  <li>Connect Computers with Wires to create processing chains</li>
                  <li>Use Switches to redirect opponent's connections</li>
                  <li>First player to complete a full network loop wins!</li>
                </ol>
              </TextSection>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/80 neon-glow">
                <Play className="h-4 w-4 mr-2" />
                Watch Full Tutorial
              </Button>
            </div>
          </div>
        </ContentSection>

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
                  <li>Variant game modes for 2-5 players</li>
                  <li>Troubleshooting and FAQ section</li>
                </ul>
              </TextSection>
              <div className="flex space-x-4">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/80 neon-glow">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="neon-border">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Online
                </Button>
              </div>
            </div>
          </div>
        </ContentSection>

        {/* Downloads Section */}
        <ContentSection title="Downloads & Resources">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Rulebook Download */}
            <div className="neon-border bg-card/30 p-6 rounded-lg text-center space-y-4">
              <FileText className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold text-primary">Official Rulebook</h3>
              <p className="text-sm text-muted-foreground">Complete game rules and strategies (PDF, 2.4MB)</p>
              <Button variant="outline" className="neon-border w-full">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Score Sheets */}
            <div className="neon-border bg-card/30 p-6 rounded-lg text-center space-y-4">
              <FileText className="h-12 w-12 text-secondary mx-auto" />
              <h3 className="text-lg font-semibold text-primary">Score Sheets</h3>
              <p className="text-sm text-muted-foreground">Printable score tracking sheets (PDF, 0.5MB)</p>
              <Button variant="outline" className="neon-border w-full">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Card Reference */}
            <div className="neon-border bg-card/30 p-6 rounded-lg text-center space-y-4">
              <FileText className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold text-primary">Card Reference</h3>
              <p className="text-sm text-muted-foreground">Quick reference for all cards (PDF, 1.1MB)</p>
              <Button variant="outline" className="neon-border w-full">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </ContentSection>

        {/* Community Section */}
        <ContentSection title="Join the Community">
          <TextSection>
            <div className="text-center space-y-4">
              <p className="text-lg">
                Connect with other WIRED players, share strategies, and stay updated on tournaments and new releases.
              </p>
              <div className="flex justify-center space-x-4">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/80 neon-glow">
                  Join Discord
                </Button>
                <Button variant="outline" className="neon-border">
                  Follow on Twitter
                </Button>
              </div>
            </div>
          </TextSection>
        </ContentSection>
      </main>

      <Footer />
    </div>
  );
};

export default Extras;
