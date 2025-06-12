
interface VideoSectionProps {
  src: string;
  title?: string;
  description?: string;
  className?: string;
}

const VideoSection = ({ src, title, description, className = "" }: VideoSectionProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && <h3 className="text-xl font-semibold text-primary">{title}</h3>}
      <div className="neon-border rounded-lg overflow-hidden">
        <video 
          controls 
          className="w-full h-auto"
          preload="metadata"
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};

export default VideoSection;
