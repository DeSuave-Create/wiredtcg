import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import { HelpCircle } from 'lucide-react';

const Solysis = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 flex justify-center flex-grow">
        <div className="w-full max-w-6xl">
          
          <ContentSection title="SOLYSIS" glowEffect>
            <div className="text-center space-y-8">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-12">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex justify-center">
                    <HelpCircle className="h-16 w-16 text-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  </div>
                ))}
              </div>

              <div className="max-w-2xl mx-auto">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Something bigger is coming...
                </p>
                
                <p className="text-sm text-muted-foreground mt-4 opacity-60">
                  The connection between WIRED and what lies beyond is not yet ready to be revealed.
                </p>
              </div>

              <div className="neon-border rounded-xl p-8 bg-card/30 backdrop-blur-sm">
                <div className="text-6xl text-primary mb-4">???</div>
                <p className="text-muted-foreground">
                  More details coming soon...
                </p>
              </div>

            </div>
          </ContentSection>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Solysis;