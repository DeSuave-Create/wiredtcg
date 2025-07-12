import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import { HelpCircle, BookOpen } from 'lucide-react';

const Solysis = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 flex justify-center flex-grow">
        <div className="w-full max-w-6xl">
          
          <ContentSection title="SOLYSIS" glowEffect>
            <div className="relative">
              {/* Book-like container */}
              <div className="relative bg-gradient-to-r from-amber-50 to-amber-100 rounded-3xl p-8 shadow-2xl">
                
                {/* Book spine effect */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-amber-800 transform -translate-x-1/2 shadow-lg"></div>
                
                {/* Left page */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                  <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl shadow-lg transform -rotate-1 border-l-4 border-amber-600">
                    <div className="absolute top-2 left-2 w-3 h-3 bg-amber-300 rounded-full"></div>
                    <div className="absolute top-2 left-7 w-3 h-3 bg-amber-300 rounded-full"></div>
                    <div className="absolute top-2 left-12 w-3 h-3 bg-amber-300 rounded-full"></div>
                    
                    <div className="text-center space-y-6 mt-4">
                      <BookOpen className="h-12 w-12 text-amber-700 mx-auto animate-pulse" />
                      <div className="space-y-2">
                        <div className="text-6xl text-amber-800 font-serif">?</div>
                        <div className="text-4xl text-amber-700 font-serif">?</div>
                        <div className="text-2xl text-amber-600 font-serif">?</div>
                      </div>
                      <div className="h-16 border-2 border-dashed border-amber-400 rounded-lg flex items-center justify-center">
                        <span className="text-amber-600 text-sm italic">Chapter awaiting...</span>
                      </div>
                    </div>
                  </div>

                  {/* Right page */}
                  <div className="relative bg-gradient-to-bl from-amber-50 to-amber-100 p-6 rounded-2xl shadow-lg transform rotate-1 border-r-4 border-amber-600">
                    <div className="absolute top-2 right-2 w-3 h-3 bg-amber-300 rounded-full"></div>
                    <div className="absolute top-2 right-7 w-3 h-3 bg-amber-300 rounded-full"></div>
                    <div className="absolute top-2 right-12 w-3 h-3 bg-amber-300 rounded-full"></div>
                    
                    <div className="text-center space-y-6 mt-4">
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <HelpCircle 
                            key={i} 
                            className="h-8 w-8 text-amber-600 animate-pulse" 
                            style={{ animationDelay: `${i * 0.3}s` }} 
                          />
                        ))}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="h-2 bg-amber-300 rounded w-3/4 mx-auto opacity-60"></div>
                        <div className="h-2 bg-amber-300 rounded w-full mx-auto opacity-40"></div>
                        <div className="h-2 bg-amber-300 rounded w-1/2 mx-auto opacity-60"></div>
                        <div className="h-2 bg-amber-300 rounded w-5/6 mx-auto opacity-40"></div>
                      </div>
                      
                      <div className="h-16 border-2 border-dashed border-amber-400 rounded-lg flex items-center justify-center">
                        <span className="text-amber-600 text-sm italic">Story unfolding...</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center mysterious glow */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
              </div>

              {/* Bottom teaser section */}
              <div className="mt-8 text-center space-y-4">
                <div className="max-w-2xl mx-auto neon-border rounded-xl p-6 bg-card/30 backdrop-blur-sm">
                  <p className="text-lg text-muted-foreground leading-relaxed font-serif italic">
                    "The networks we build in WIRED are more than mere connections... they are pathways to understanding the deeper mysteries that bind our digital and physical worlds."
                  </p>
                  
                  <div className="mt-4 text-sm text-muted-foreground opacity-70">
                    <p>A glimpse into the lore that connects the card game to something greater...</p>
                  </div>
                </div>

                <div className="flex justify-center space-x-2 mt-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 h-2 bg-primary rounded-full animate-pulse" 
                      style={{ animationDelay: `${i * 0.4}s` }}
                    ></div>
                  ))}
                </div>
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