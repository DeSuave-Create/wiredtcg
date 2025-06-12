
interface ImageSectionProps {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  className?: string;
}

const ImageSection = ({ src, alt, title, description, className = "" }: ImageSectionProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && <h3 className="text-xl font-semibold text-primary">{title}</h3>}
      <div className="neon-border rounded-lg overflow-hidden">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};

export default ImageSection;
