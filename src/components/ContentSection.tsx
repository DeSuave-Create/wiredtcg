
import { ReactNode } from 'react';

interface ContentSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  glowEffect?: boolean;
  backgroundImage?: string;
  cardBackgroundImage?: string;
}

const ContentSection = ({ title, children, className = "", glowEffect = false, backgroundImage, cardBackgroundImage }: ContentSectionProps) => {
  const backgroundStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  // Clone children and pass cardBackgroundImage if it's GameMechanicsSection
  const childrenWithProps = React.cloneElement(children as React.ReactElement, {
    cardBackgroundImage
  });

  return (
    <section className={`py-8 ${className}`}>
      <div 
        className={`neon-border bg-card/30 backdrop-blur-sm p-6 rounded-lg ${glowEffect ? 'animate-pulse-neon' : ''} ${backgroundImage ? 'relative' : ''}`}
        style={backgroundStyle}
      >
        {backgroundImage && (
          <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
        )}
        <div className="relative z-10">
          {title && (
            <h2 className="text-2xl font-bold text-primary mb-6 text-center tracking-wider">
              {title}
            </h2>
          )}
          {cardBackgroundImage ? childrenWithProps : children}
        </div>
      </div>
    </section>
  );
};

export default ContentSection;
