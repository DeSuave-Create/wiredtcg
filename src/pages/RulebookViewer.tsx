import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RulebookViewer = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable common keyboard shortcuts for saving/printing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) && 
        (e.key === 's' || e.key === 'p' || e.key === 'S' || e.key === 'P')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/extras')}
            className="mb-4 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Extras
          </button>

          {/* PDF Viewer Container */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
            {/* Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-32 opacity-10 select-none">
                {[...Array(8)].map((_, i) => (
                  <img
                    key={i}
                    src="/wire-logo-official.png"
                    alt="WIRED Watermark"
                    className="w-32 h-32 object-contain"
                    draggable="false"
                  />
                ))}
              </div>
            </div>

            {/* PDF Iframe */}
            <iframe
              src="/WIRED_Instructions.pdf"
              className="w-full h-full select-none"
              title="WIRED Official Rulebook"
              style={{
                border: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            />
          </div>

          {/* Notice */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>© WIRED Trading Card Game. All rights reserved.</p>
            <p className="mt-1">This rulebook is for personal use only. Unauthorized distribution is prohibited.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RulebookViewer;
