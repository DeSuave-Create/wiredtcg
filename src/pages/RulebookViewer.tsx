import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RulebookViewer = () => {
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const totalPages = 7;

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

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/extras')}
            className="mb-4 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Extras
          </button>

          {/* Page Viewer Container */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden p-4">
            {/* Page Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <span className="text-white font-medium">
                Page {pageNumber} of {totalPages}
              </span>
              
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= totalPages}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Page Image with Watermark */}
            <div className="relative bg-white rounded-lg overflow-hidden">
              {/* Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-20 opacity-10 select-none">
                  {[...Array(9)].map((_, i) => (
                    <img
                      key={i}
                      src="/wire-logo-official.png"
                      alt="WIRED Watermark"
                      className="w-24 h-24 object-contain"
                      draggable="false"
                    />
                  ))}
                </div>
              </div>

              {/* Rulebook Page Image */}
              <img
                src={`/rulebook/page_${pageNumber}.jpg`}
                alt={`Rulebook page ${pageNumber}`}
                className="w-full h-auto select-none"
                draggable="false"
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
              />
            </div>
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
