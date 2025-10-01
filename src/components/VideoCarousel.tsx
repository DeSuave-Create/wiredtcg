import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Logo from './Logo';

interface Video {
  id: string;
  src: string;
  title: string;
  description: string;
  isYouTube?: boolean;
}

interface VideoCarouselProps {
  videos: Video[];
  className?: string;
}

const VideoCarousel = ({ videos, className = "" }: VideoCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePrevious = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const currentVideo = videos[currentIndex];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Video Display with Card Images */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Card Stacks */}
        <div className="lg:col-span-2 flex flex-col justify-between gap-4 py-4">
          {/* Top Left - Green Equipment Cards */}
          <div className="relative w-20 h-28 lg:w-24 lg:h-32 group cursor-pointer">
            <div className="absolute inset-0 bg-gray-100 border-green-600 border-3 rounded-xl shadow-lg flex items-center justify-center text-[10px] text-muted-foreground transition-all duration-300 transform translate-x-1 translate-y-1 group-hover:-rotate-12 group-hover:-translate-x-2">
              Equipment
            </div>
            <div className="absolute inset-0 bg-gray-100 border-green-600 border-3 rounded-xl shadow-lg flex items-center justify-center text-[10px] text-muted-foreground transition-all duration-300 transform translate-x-0.5 translate-y-0.5 z-10">
              Equipment
            </div>
            <div className="absolute inset-0 bg-gray-100 border-green-600 border-3 rounded-xl shadow-lg flex items-center justify-center text-[10px] text-muted-foreground transition-all duration-300 z-20 group-hover:rotate-12 group-hover:translate-x-2">
              Equipment
            </div>
          </div>
          
          {/* Bottom Left - Blue Classification Cards */}
          <div className="relative w-20 h-28 lg:w-24 lg:h-32 group cursor-pointer">
            <div className="absolute inset-0 bg-gray-100 border-blue-600 border-3 rounded-xl shadow-lg flex items-center justify-center text-[10px] text-muted-foreground transition-all duration-300 transform translate-x-1 translate-y-1 group-hover:-rotate-12 group-hover:-translate-x-2">
              Classification
            </div>
            <div className="absolute inset-0 bg-gray-100 border-blue-600 border-3 rounded-xl shadow-lg flex items-center justify-center text-[10px] text-muted-foreground transition-all duration-300 transform translate-x-0.5 translate-y-0.5 z-10">
              Classification
            </div>
            <div className="absolute inset-0 bg-gray-100 border-blue-600 border-3 rounded-xl shadow-lg flex items-center justify-center text-[10px] text-muted-foreground transition-all duration-300 z-20 group-hover:rotate-12 group-hover:translate-x-2">
              Classification
            </div>
          </div>
        </div>

        {/* Center Video Player */}
        <div className="lg:col-span-8 relative bg-gray-100 border-green-600 border-8 rounded-3xl overflow-hidden shadow-2xl drop-shadow-lg">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full neon-glow transition-all"
            aria-label="Previous video"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full neon-glow transition-all"
            aria-label="Next video"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Video Container */}
          {currentVideo.isYouTube && !isPlaying ? (
            <div 
              className="relative w-full h-64 md:h-96 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={handlePlay}
            >
              <div className="text-center space-y-4">
                <Logo size={100} className="mx-auto" />
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Play className="h-10 w-10" />
                  <span className="text-xl font-semibold">Play Video</span>
                </div>
              </div>
            </div>
          ) : currentVideo.isYouTube ? (
            <iframe
              src={`${currentVideo.src}?autoplay=1`}
              className="w-full h-64 md:h-96"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={currentVideo.title}
            />
          ) : (
            <video 
              controls 
              className="w-full h-auto"
              preload="metadata"
            >
              <source src={currentVideo.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {/* Video Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold neon-glow">
            {currentIndex + 1} / {videos.length}
          </div>
        </div>

        {/* Right Card Stacks */}
        <div className="lg:col-span-2 flex flex-col justify-between gap-4 py-4 items-end">
          {/* Top Right - Red Attack Cards */}
          <div className="relative w-20 h-28 lg:w-24 lg:h-32 group cursor-pointer">
            <div className="absolute inset-0 bg-gray-100 border-red-600 border-3 rounded-xl shadow-lg flex items-center justify-center text-[10px] text-muted-foreground transition-all duration-300 transform translate-x-1 translate-y-1 group-hover:rotate-12 group-hover:translate-x-2">
              Attack
            </div>
            <div className="absolute inset-0 bg-gray-100 border-red-600 border-3 rounded-xl shadow-lg flex items-center justify-center text-[10px] text-muted-foreground transition-all duration-300 transform translate-x-0.5 translate-y-0.5 z-10">
              Attack
            </div>
            <div className="absolute inset-0 bg-gray-100 border-red-600 border-3 rounded-xl shadow-lg flex items-center justify-center text-[10px] text-muted-foreground transition-all duration-300 z-20 group-hover:-rotate-12 group-hover:-translate-x-2">
              Attack
            </div>
          </div>
          
          {/* Bottom Right - Red Resolution Cards */}
          <div className="relative w-20 h-28 lg:w-24 lg:h-32 group cursor-pointer">
            <div className="absolute inset-0 bg-gray-100 border-red-700 border-3 rounded-xl shadow-lg flex items-center justify-center text-[10px] text-muted-foreground transition-all duration-300 transform translate-x-1 translate-y-1 group-hover:rotate-12 group-hover:translate-x-2">
              Resolution
            </div>
            <div className="absolute inset-0 bg-gray-100 border-red-700 border-3 rounded-xl shadow-lg flex items-center justify-center text-[10px] text-muted-foreground transition-all duration-300 transform translate-x-0.5 translate-y-0.5 z-10">
              Resolution
            </div>
            <div className="absolute inset-0 bg-gray-100 border-red-700 border-3 rounded-xl shadow-lg flex items-center justify-center text-[10px] text-muted-foreground transition-all duration-300 z-20 group-hover:-rotate-12 group-hover:-translate-x-2">
              Resolution
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="bg-gray-100 border-green-600 border-8 rounded-3xl p-6 shadow-2xl drop-shadow-lg">
        <h3 className="text-2xl font-bold text-green-600 mb-3">{currentVideo.title}</h3>
        <p className="text-muted-foreground">{currentVideo.description}</p>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {videos.map((video, index) => (
          <button
            key={video.id}
            onClick={() => {
              setCurrentIndex(index);
              setIsPlaying(false);
            }}
            className={`flex-shrink-0 relative bg-gray-100 rounded-2xl overflow-hidden transition-all ${
              index === currentIndex
                ? 'border-4 border-green-600 neon-glow scale-105'
                : 'border-2 border-gray-300 hover:border-green-600 opacity-70 hover:opacity-100'
            }`}
            style={{ width: '120px', height: '80px' }}
          >
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Logo size={30} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-green-600/90 text-white text-xs px-2 py-1 truncate">
              Video {index + 1}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VideoCarousel;
