
import { useState } from 'react';
import { Play } from 'lucide-react';
import Logo from './Logo';

interface VideoSectionProps {
  src: string;
  title?: string;
  description?: string;
  className?: string;
  isYouTube?: boolean;
  useLogoThumbnail?: boolean;
}

const VideoSection = ({ src, title, description, className = "", isYouTube = false, useLogoThumbnail = false }: VideoSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {title && <h3 className="text-xl font-semibold text-primary">{title}</h3>}
      <div className="neon-border rounded-lg overflow-hidden">
        {isYouTube && useLogoThumbnail && !isPlaying ? (
          <div 
            className="relative w-full h-64 md:h-80 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={handlePlay}
          >
            <div className="text-center space-y-4">
              <Logo size={80} className="mx-auto" />
              <div className="flex items-center justify-center space-x-2 text-primary">
                <Play className="h-8 w-8" />
                <span className="text-lg font-semibold">Play Tutorial</span>
              </div>
            </div>
          </div>
        ) : isYouTube ? (
          <iframe
            src={`${src}?autoplay=1`}
            className="w-full h-64 md:h-80"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || "Video"}
          />
        ) : (
          <video 
            controls 
            className="w-full h-auto"
            preload="metadata"
          >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};

export default VideoSection;
