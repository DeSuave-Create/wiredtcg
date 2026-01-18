import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SimulationIntroProps {
  onComplete: () => void;
}

export function SimulationIntro({ onComplete }: SimulationIntroProps) {
  const [phase, setPhase] = useState<'initial' | 'logo-in' | 'logo-glow' | 'logo-out'>('initial');

  useEffect(() => {
    // Start animation after a brief mount delay
    const startTimer = setTimeout(() => {
      setPhase('logo-in');
    }, 100);

    // Phase 1: Logo fades in (100-1500ms)
    const glowTimer = setTimeout(() => {
      setPhase('logo-glow');
    }, 1500);

    // Phase 2: Logo glows (1500-4000ms)
    const outTimer = setTimeout(() => {
      setPhase('logo-out');
    }, 4000);

    // Phase 3: Logo fades out and callback (4000-5000ms)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(glowTimer);
      clearTimeout(outTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Animated background glow */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-1000",
          phase === 'logo-glow' ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
        }}
      />
      
      {/* Logo container */}
      <div 
        className={cn(
          "relative transition-all duration-1000 ease-out",
          (phase === 'initial' || phase === 'logo-in') && "opacity-0 scale-90",
          phase === 'logo-glow' && "opacity-100 scale-100",
          phase === 'logo-out' && "opacity-0 scale-110"
        )}
      >
        {/* Logo glow effect */}
        <div 
          className={cn(
            "absolute inset-0 blur-2xl transition-opacity duration-500",
            phase === 'logo-glow' ? "opacity-100" : "opacity-0"
          )}
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.6) 0%, transparent 70%)',
            transform: 'scale(1.5)',
          }}
        />
        
        {/* Main logo */}
        <img 
          src="/wire-logo-official.png" 
          alt="WIRED: The Card Game"
          className={cn(
            "relative w-64 h-64 md:w-80 md:h-80 object-contain",
            phase === 'logo-glow' && "animate-pulse"
          )}
        />
        
        {/* Electric spark effects */}
        {phase === 'logo-glow' && (
          <>
            <div className="absolute top-1/4 left-0 w-2 h-2 bg-accent-green rounded-full animate-ping" />
            <div className="absolute top-3/4 right-0 w-2 h-2 bg-accent-green rounded-full animate-ping animation-delay-200" />
            <div className="absolute bottom-0 left-1/3 w-2 h-2 bg-accent-green rounded-full animate-ping animation-delay-400" />
          </>
        )}
      </div>
      
      {/* Subtitle that appears during glow */}
      <div 
        className={cn(
          "absolute bottom-1/4 text-center transition-all duration-500",
          phase === 'logo-glow' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <p className="text-accent-green/80 font-orbitron text-lg tracking-widest">
          THE CARD GAME
        </p>
      </div>
    </div>
  );
}
