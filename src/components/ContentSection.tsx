
import { ReactNode } from 'react';

interface ContentSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  glowEffect?: boolean;
}

const ContentSection = ({ title, children, className = "", glowEffect = false }: ContentSectionProps) => {
  return (
    <section className={`py-8 ${className}`}>
      <div className={`neon-border bg-card/30 backdrop-blur-sm p-6 rounded-lg ${glowEffect ? 'animate-pulse-neon' : ''}`}>
        {title && (
          <h2 className="text-2xl font-bold text-primary mb-6 text-center tracking-wider">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
};

export default ContentSection;
