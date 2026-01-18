import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type EventType = 'audit-success' | 'audit-blocked' | 'head-hunter' | 'seal-the-deal' | 'ai-action' | 'classification-swap' | 'attack' | 'resolution';

interface SwapAnimationData {
  stolenCardImage?: string;
  stolenCardName?: string;
  discardedCardImage?: string;
  discardedCardName?: string;
}

interface GameEventAnimationProps {
  event: EventType | null;
  message?: string;
  swapData?: SwapAnimationData;
  onComplete?: () => void;
}

// Particle component for explosive effects
function ExplosionParticles({ color, count = 12 }: { color: string; count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        const delay = Math.random() * 0.2;
        const distance = 80 + Math.random() * 60;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
              animation: `explode-particle 0.8s ease-out ${delay}s forwards`,
              '--angle': `${angle}deg`,
              '--distance': `${distance}px`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

// Shockwave ring component
function ShockwaveRing({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
      style={{
        borderColor: color,
        boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}`,
        animation: `shockwave 0.8s ease-out ${delay}s forwards`,
      }}
    />
  );
}

// Lightning bolt SVG
function LightningBolt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 40"
      className={cn("w-8 h-14 drop-shadow-lg", className)}
      style={{ filter: 'drop-shadow(0 0 8px #fbbf24) drop-shadow(0 0 16px #f59e0b)' }}
    >
      <path
        d="M12 0L4 16H10L6 40L20 12H12L18 0H12Z"
        fill="url(#lightning-gradient)"
        stroke="#fef3c7"
        strokeWidth="0.5"
      />
      <defs>
        <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Sparkle particles for pleasant effects
function SparkleParticles({ count = 20 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 1;
        const duration = 1.5 + Math.random() * 1;
        const size = 4 + Math.random() * 8;
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              bottom: '-10%',
              width: size,
              height: size,
              background: `radial-gradient(circle, #86efac 0%, #22c55e 50%, transparent 100%)`,
              boxShadow: `0 0 ${size}px #22c55e, 0 0 ${size * 2}px #22c55e`,
              animation: `float-up ${duration}s ease-out ${delay}s forwards`,
              opacity: 0,
            }}
          />
        );
      })}
    </div>
  );
}

// Pulse rings for resolution
function HealingRings() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          className="absolute w-16 h-16 rounded-full border-2 border-green-400"
          style={{
            animation: `healing-pulse 1.5s ease-out ${delay}s infinite`,
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
          }}
        />
      ))}
    </div>
  );
}

export function GameEventAnimation({ event, message, swapData, onComplete }: GameEventAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    if (event) {
      setIsVisible(true);
      setAnimationPhase('enter');
      
      // For swap animation, use longer duration
      const holdTime = event === 'classification-swap' ? 1500 : 1500;
      const exitTime = event === 'classification-swap' ? 2500 : 2000;
      
      const holdTimer = setTimeout(() => setAnimationPhase('hold'), 300);
      const exitTimer = setTimeout(() => setAnimationPhase('exit'), holdTime);
      const completeTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, exitTime);
      
      return () => {
        clearTimeout(holdTimer);
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [event, onComplete]);

  if (!event || !isVisible) return null;

  // ATTACK animation - Explosive with particles and shockwaves
  if (event === 'attack') {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
        {/* Red flash overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%)',
            animation: 'flash-red 0.5s ease-out forwards',
          }}
        />
        
        {/* Shockwaves */}
        <ShockwaveRing color="rgba(239, 68, 68, 0.8)" delay={0} />
        <ShockwaveRing color="rgba(251, 146, 60, 0.6)" delay={0.15} />
        <ShockwaveRing color="rgba(252, 211, 77, 0.4)" delay={0.3} />
        
        {/* Explosion particles */}
        <ExplosionParticles color="#ef4444" count={16} />
        <ExplosionParticles color="#fb923c" count={12} />
        
        {/* Central explosion */}
        <div
          className="relative w-32 h-32 flex items-center justify-center"
          style={{
            animation: 'explosion-scale 0.6s ease-out forwards',
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(254, 215, 170, 0.9) 0%, rgba(251, 146, 60, 0.8) 30%, rgba(239, 68, 68, 0.6) 60%, transparent 100%)',
              animation: 'pulse-glow 0.3s ease-in-out infinite alternate',
            }}
          />
          <span className="text-6xl animate-[shake_0.3s_ease-in-out_3]">💥</span>
        </div>
        
        {/* Message */}
        <div
          className="absolute top-1/3 text-center"
          style={{
            animation: 'slam-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          <span 
            className="text-3xl font-black text-red-100 tracking-wider"
            style={{
              textShadow: '0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 40px #f97316, 2px 2px 0 #991b1b',
            }}
          >
            {message || 'ATTACK!'}
          </span>
        </div>
      </div>
    );
  }

  // AUDIT animation - Aggressive with lightning and dramatic effects
  if (event === 'audit-success') {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
        {/* Dark dramatic backdrop */}
        <div 
          className="absolute inset-0 bg-black/70"
          style={{ animation: 'fade-in-fast 0.2s ease-out forwards' }}
        />
        
        {/* Yellow/amber glow pulse */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 60%)',
            animation: 'aggressive-pulse 0.3s ease-in-out infinite alternate',
          }}
        />
        
        {/* Lightning bolts */}
        <div className="absolute inset-0">
          <LightningBolt className="absolute top-0 left-1/4 animate-[lightning-flash_0.2s_ease-in-out_3]" />
          <LightningBolt className="absolute top-0 right-1/4 animate-[lightning-flash_0.2s_ease-in-out_3_0.1s]" />
          <LightningBolt className="absolute top-10 left-1/3 animate-[lightning-flash_0.2s_ease-in-out_3_0.2s]" />
          <LightningBolt className="absolute top-10 right-1/3 animate-[lightning-flash_0.2s_ease-in-out_3_0.15s]" />
        </div>
        
        {/* Screen shake effect via CSS */}
        <div 
          className="flex flex-col items-center gap-4"
          style={{ animation: 'shake-hard 0.5s ease-in-out' }}
        >
          {/* Main icon with aggressive entrance */}
          <div
            className="relative"
            style={{ animation: 'slam-down 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
          >
            <div 
              className="text-8xl"
              style={{ 
                filter: 'drop-shadow(0 0 20px #fbbf24) drop-shadow(0 0 40px #f59e0b)',
              }}
            >
              📋
            </div>
            {/* Impact ring */}
            <div 
              className="absolute inset-0 -m-4 rounded-full border-4 border-yellow-400"
              style={{
                animation: 'impact-ring 0.6s ease-out forwards',
                boxShadow: '0 0 30px rgba(251, 191, 36, 0.8)',
              }}
            />
          </div>
          
          {/* Aggressive text with glitch effect */}
          <div
            style={{ animation: 'glitch-in 0.4s ease-out 0.2s both' }}
          >
            <span 
              className="text-4xl font-black text-yellow-100 tracking-widest"
              style={{
                textShadow: '0 0 10px #fbbf24, 0 0 30px #fbbf24, 0 0 60px #f59e0b, 3px 3px 0 #92400e',
                animation: 'text-glitch 0.1s ease-in-out infinite',
              }}
            >
              {message || 'AUDIT SUCCESSFUL!'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // RESOLUTION animation - Pleasant, soothing with sparkles
  if (event === 'resolution') {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
        {/* Soft gradient backdrop */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
            animation: 'gentle-fade-in 0.5s ease-out forwards',
          }}
        />
        
        {/* Floating sparkles */}
        <SparkleParticles count={25} />
        
        {/* Healing pulse rings */}
        <HealingRings />
        
        {/* Central content with gentle entrance */}
        <div 
          className="flex flex-col items-center gap-4"
          style={{ animation: 'float-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
        >
          {/* Glowing success icon */}
          <div className="relative">
            <div 
              className="text-7xl"
              style={{ 
                filter: 'drop-shadow(0 0 15px #22c55e) drop-shadow(0 0 30px #16a34a)',
                animation: 'gentle-bounce 1s ease-in-out infinite',
              }}
            >
              ✨
            </div>
            {/* Soft glow behind */}
            <div 
              className="absolute inset-0 -m-8 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(134, 239, 172, 0.6) 0%, transparent 70%)',
                animation: 'soft-pulse 1.5s ease-in-out infinite',
              }}
            />
          </div>
          
          {/* Pleasant message with rainbow shimmer */}
          <div
            className="relative overflow-hidden px-8 py-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(16, 185, 129, 0.3) 50%, rgba(5, 150, 105, 0.3) 100%)',
              border: '2px solid rgba(134, 239, 172, 0.5)',
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.3), inset 0 0 20px rgba(134, 239, 172, 0.2)',
              animation: 'shimmer-border 2s linear infinite',
            }}
          >
            <span 
              className="text-2xl font-bold text-green-100"
              style={{
                textShadow: '0 0 10px rgba(134, 239, 172, 0.8), 0 0 20px rgba(34, 197, 94, 0.6)',
              }}
            >
              {message || 'RESOLVED! ✓'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Classification Swap Animation
  if (event === 'classification-swap' && swapData) {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-300",
          animationPhase === 'enter' ? 'opacity-0' : 'opacity-100',
          animationPhase === 'exit' && 'opacity-0'
        )} />
        
        {/* Main container */}
        <div className="relative flex items-center gap-8">
          {/* Discarded card (flies out to left) */}
          {swapData.discardedCardImage && (
            <div className={cn(
              "relative transition-all duration-500 ease-out",
              animationPhase === 'enter' && "translate-x-16 opacity-100 scale-100",
              animationPhase === 'hold' && "translate-x-0 opacity-100 scale-90",
              animationPhase === 'exit' && "-translate-x-32 opacity-0 scale-75 rotate-[-15deg]"
            )}>
              <div className="w-24 h-36 rounded-lg border-2 border-red-500 overflow-hidden shadow-lg shadow-red-500/40 relative">
                <img 
                  src={swapData.discardedCardImage} 
                  alt={swapData.discardedCardName || 'Discarded'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-red-900/40" />
              </div>
              <div className={cn(
                "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-red-400 transition-opacity duration-300",
                animationPhase === 'exit' && "opacity-0"
              )}>
                🗑️ Discarded
              </div>
            </div>
          )}
          
          {/* Swap arrows */}
          <div className={cn(
            "flex flex-col items-center gap-1 transition-all duration-500",
            animationPhase === 'enter' && "opacity-0 scale-50",
            animationPhase === 'hold' && "opacity-100 scale-100",
            animationPhase === 'exit' && "opacity-0 scale-50"
          )}>
            <span className="text-3xl animate-pulse">⚔️</span>
            <span className="text-sm text-white font-bold bg-purple-600/80 px-2 py-1 rounded">SWAP</span>
          </div>
          
          {/* Stolen card (flies in from right) */}
          {swapData.stolenCardImage && (
            <div className={cn(
              "relative transition-all duration-500 ease-out",
              animationPhase === 'enter' && "translate-x-32 opacity-0 scale-75",
              animationPhase === 'hold' && "translate-x-0 opacity-100 scale-110",
              animationPhase === 'exit' && "-translate-x-16 opacity-100 scale-100"
            )}>
              <div className={cn(
                "w-24 h-36 rounded-lg border-2 border-purple-500 overflow-hidden shadow-2xl relative",
                animationPhase === 'hold' && "shadow-purple-500/60 animate-pulse"
              )}>
                <img 
                  src={swapData.stolenCardImage} 
                  alt={swapData.stolenCardName || 'Stolen'}
                  className="w-full h-full object-cover"
                />
                {/* Glow overlay */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-purple-600/40 to-transparent transition-opacity",
                  animationPhase === 'hold' && "opacity-100",
                  animationPhase !== 'hold' && "opacity-0"
                )} />
              </div>
              <div className={cn(
                "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-purple-300 transition-opacity duration-300",
                animationPhase === 'enter' && "opacity-0"
              )}>
                🎯 Stolen!
              </div>
            </div>
          )}
        </div>
        
        {/* Title */}
        <div className={cn(
          "absolute top-1/4 left-1/2 -translate-x-1/2 text-center transition-all duration-500",
          animationPhase === 'enter' && "opacity-0 -translate-y-4",
          animationPhase === 'hold' && "opacity-100 translate-y-0",
          animationPhase === 'exit' && "opacity-0 translate-y-4"
        )}>
          <span className="text-2xl font-bold text-white drop-shadow-lg">
            {message || 'Classification Swapped!'}
          </span>
        </div>
      </div>
    );
  }

  const getEventStyles = () => {
    switch (event) {
      case 'audit-blocked':
        return {
          bg: 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90',
          border: 'border-blue-400',
          icon: '🛡️',
          glow: 'shadow-blue-500/50',
          animation: 'shield-slam',
        };
      case 'head-hunter':
        return {
          bg: 'bg-gradient-to-r from-purple-600/90 to-pink-600/90',
          border: 'border-purple-400',
          icon: '🎯',
          glow: 'shadow-purple-500/50',
          animation: 'target-lock',
        };
      case 'seal-the-deal':
        return {
          bg: 'bg-gradient-to-r from-amber-500/90 to-red-600/90',
          border: 'border-amber-400',
          icon: '💎',
          glow: 'shadow-amber-500/50',
          animation: 'diamond-shine',
        };
      case 'ai-action':
        return {
          bg: 'bg-gradient-to-r from-gray-700/90 to-gray-600/90',
          border: 'border-gray-500',
          icon: '🤖',
          glow: 'shadow-gray-500/30',
          animation: '',
        };
      default:
        return {
          bg: 'bg-gray-800/90',
          border: 'border-gray-600',
          icon: '⚡',
          glow: '',
          animation: '',
        };
    }
  };

  const styles = getEventStyles();

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div
        className={cn(
          "px-8 py-4 rounded-xl border-2 shadow-2xl",
          "animate-[scale-in_0.3s_ease-out,fade-out_0.3s_ease-in_1.7s_forwards]",
          styles.bg,
          styles.border,
          styles.glow && `shadow-2xl ${styles.glow}`
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl animate-bounce">{styles.icon}</span>
          <div>
            <span className="text-xl font-bold text-white block">
              {message || event?.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for triggering animations
export function useGameEventAnimation() {
  const [currentEvent, setCurrentEvent] = useState<{
    type: EventType;
    message?: string;
    swapData?: SwapAnimationData;
  } | null>(null);

  const triggerEvent = (type: EventType, message?: string, swapData?: SwapAnimationData) => {
    setCurrentEvent({ type, message, swapData });
  };

  const clearEvent = () => {
    setCurrentEvent(null);
  };

  return {
    currentEvent,
    triggerEvent,
    clearEvent,
  };
}