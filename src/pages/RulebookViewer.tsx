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

            {/* PDF Embed with fallback */}
            <object
              data="/WIRED_Instructions.pdf#toolbar=0&navpanes=0&scrollbar=0"
              type="application/pdf"
              className="w-full h-full"
              style={{
                border: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            >
              <div className="flex flex-col items-center justify-center h-full text-white p-8">
                <p className="text-lg mb-4">Unable to display PDF in browser.</p>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/WIRED_Instructions.pdf';
                    link.download = 'WIRED_Instructions.pdf';
                    link.click();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Download Rulebook Instead
                </button>
              </div>
            </object>
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
