
import { ReactNode } from 'react';

interface TextSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  accent?: boolean;
}

const TextSection = ({ title, children, className = "", accent = false }: TextSectionProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className={`text-xl font-semibold ${accent ? 'text-secondary' : 'text-primary'}`}>
          {title}
        </h3>
      )}
      <div className="text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default TextSection;
