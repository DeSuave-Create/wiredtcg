import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import FounderTrophyList from '@/components/founders/FounderTrophy';

const Founders = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 flex justify-center flex-grow">
        <div className="w-full max-w-5xl space-y-8">
          
          <ContentSection title="FOUNDERS" glowEffect>
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