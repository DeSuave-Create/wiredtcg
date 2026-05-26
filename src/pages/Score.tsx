
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import ScoreKeeper from '@/components/ScoreKeeper';
import MusicPlayer from '@/components/MusicPlayer';

const Score = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex justify-center flex-grow">
        <ContentSection className="w-full">
          <ScoreKeeper />
        </ContentSection>
      </main>

      <Footer />
      <MusicPlayer />
    </div>
  );
};

export default Score;
