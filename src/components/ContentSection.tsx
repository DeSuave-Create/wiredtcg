
import React, { ReactNode } from 'react';

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
    <section className={`py-6 sm:py-8 ${className}`}>
      <div 
        className={`neon-border bg-card backdrop-blur-sm p-4 sm:p-6 rounded-3xl relative ${glowEffect ? 'animate-pulse-neon' : ''}`}
        style={{
          ...backgroundStyle,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : `url('/lovable-uploads/a08479d2-01b1-41b6-8666-5ded32438273.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-card/60 backdrop-blur-[1px] rounded-3xl"></div>
        <div className="relative z-10">
          {title && (
            <h2 className="text-2xl sm:text-[32px] font-bold font-orbitron text-primary mb-4 sm:mb-6 text-center tracking-wider animate-neon-flicker">
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
