import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import FounderTrophyList from '@/components/founders/FounderTrophy';

const tierColors = [
  'rgb(168, 85, 247)',   // Purple - Legendary
  'rgb(234, 179, 8)',    // Yellow - Gold
  'rgb(239, 68, 68)',    // Red - Vanguard
  'rgb(59, 130, 246)',   // Blue - Beta
  'rgb(34, 197, 94)',    // Green - Alpha
];

const Founders = () => {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % tierColors.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 flex justify-center flex-grow">
        <div className="w-full max-w-5xl space-y-8">
          
          <ContentSection title="" glowEffect>
            <h2
              className="text-3xl sm:text-4xl font-bold font-orbitron tracking-wider text-center mb-4 transition-colors duration-1000"
              style={{ color: tierColors[colorIndex] }}
            >
              FOUNDERS
            </h2>
            <div className="text-center mb-8">
              <p className="text-lg text-muted-foreground">
                Honoring the visionaries who helped bring WIRED to life.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This page will be updated as our Kickstarter campaign progresses.
              </p>
            </div>

            <FounderTrophyList />

            <div className="text-center mt-8 p-6 neon-border rounded-xl bg-primary/10">
              <h3 className="text-xl font-bold font-orbitron text-primary mb-2">Want to become a Founder?</h3>
              <p className="text-muted-foreground">
                Stay tuned for our upcoming Kickstarter campaign where you can support WIRED and earn your place among our founding supporters.
              </p>
            </div>
          </ContentSection>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Founders;