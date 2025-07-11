
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import ScoreKeeper from '@/components/ScoreKeeper';

const Score = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex justify-center flex-grow">
        <ContentSection>
          <ScoreKeeper />
        </ContentSection>
      </main>

      <Footer />
    </div>
  );
};

export default Score;
