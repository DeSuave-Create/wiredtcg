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
function SparkleParticles({ count = 20, color = '#22c55e' }: { count?: number; color?: string }) {
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
              background: `radial-gradient(circle, ${color} 0%, ${color}80 50%, transparent 100%)`,
              boxShadow: `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}`,
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

// Crosshair targeting reticle for Head Hunter
function TargetingReticle() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* Rotating outer ring */}
      <div 
        className="absolute w-48 h-48 border-4 border-purple-400 rounded-full"
        style={{
          borderStyle: 'dashed',
          animation: 'spin-slow 3s linear infinite',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.5), inset 0 0 20px rgba(168, 85, 247, 0.3)',
        }}
      />
      {/* Inner targeting circle */}
      <div 
        className="absolute w-32 h-32 border-2 border-pink-400 rounded-full"
        style={{
          animation: 'spin-reverse 2s linear infinite',
          boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)',
        }}
      />
      {/* Crosshairs */}
      <div className="absolute w-40 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" 
        style={{ animation: 'pulse-opacity 0.5s ease-in-out infinite alternate' }} />
      <div className="absolute w-1 h-40 bg-gradient-to-b from-transparent via-purple-500 to-transparent"
        style={{ animation: 'pulse-opacity 0.5s ease-in-out infinite alternate' }} />
      {/* Corner brackets */}
      {[0, 90, 180, 270].map((rotation) => (
        <div
          key={rotation}
          className="absolute w-8 h-8 border-l-4 border-t-4 border-purple-400"
          style={{
            transform: `rotate(${rotation}deg) translate(50px, 50px)`,
            animation: `bracket-pulse 0.8s ease-in-out infinite ${rotation / 360}s`,
          }}
        />
      ))}
    </div>
  );
}

// Diamond crystal effect for Seal the Deal
function DiamondCrystal() {
  return (
    <div className="relative">
      {/* Rotating crystal facets */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: 'crystal-rotate 2s ease-in-out infinite' }}
      >
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <div
            key={angle}
            className="absolute w-4 h-16"
            style={{
              background: 'linear-gradient(to bottom, #fcd34d, #f59e0b, #dc2626)',
              transform: `rotate(${angle}deg) translateY(-20px)`,
              clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
              opacity: 0.8,
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)',
            }}
          />
        ))}
      </div>
      {/* Central diamond */}
      <div 
        className="relative text-7xl"
        style={{ 
          filter: 'drop-shadow(0 0 20px #fbbf24) drop-shadow(0 0 40px #f59e0b) drop-shadow(0 0 60px #dc2626)',
          animation: 'diamond-pulse 0.5s ease-in-out infinite alternate',
        }}
      >
        💎
      </div>
    </div>
  );
}

// Swirling vortex particles
function VortexParticles({ color, count = 16 }: { color: string; count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const delay = (i / count) * 2;
        const size = 6 + Math.random() * 6;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: size,
              height: size,
              background: color,
              boxShadow: `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}`,
              animation: `vortex-spin 2s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
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

  // HEAD HUNTER animation - Stealthy targeting with vortex and crosshairs
  if (event === 'head-hunter') {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
        {/* Dark purple backdrop with vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, rgba(88, 28, 135, 0.4) 0%, rgba(0, 0, 0, 0.8) 70%)',
            animation: 'fade-in-fast 0.3s ease-out forwards',
          }}
        />
        
        {/* Swirling vortex particles */}
        <VortexParticles color="#a855f7" count={20} />
        <VortexParticles color="#ec4899" count={12} />
        
        {/* Targeting reticle */}
        <TargetingReticle />
        
        {/* Central content */}
        <div 
          className="flex flex-col items-center gap-6"
          style={{ animation: 'target-lock-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
        >
          {/* Main icon with lock-on effect */}
          <div className="relative">
            <div 
              className="text-8xl"
              style={{ 
                filter: 'drop-shadow(0 0 20px #a855f7) drop-shadow(0 0 40px #ec4899)',
                animation: 'target-pulse 0.3s ease-in-out infinite alternate',
              }}
            >
              🎯
            </div>
            {/* Lock-on rings */}
            <div 
              className="absolute inset-0 -m-6 rounded-full border-4 border-purple-500"
              style={{
                animation: 'lock-on-ring 0.4s ease-out forwards',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)',
              }}
            />
            <div 
              className="absolute inset-0 -m-10 rounded-full border-2 border-pink-400"
              style={{
                animation: 'lock-on-ring 0.4s ease-out 0.1s forwards',
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)',
              }}
            />
          </div>
          
          {/* Text with glitch effect */}
          <div
            className="relative"
            style={{ animation: 'glitch-in 0.4s ease-out 0.3s both' }}
          >
            <span 
              className="text-3xl font-black text-purple-100 tracking-widest"
              style={{
                textShadow: '0 0 10px #a855f7, 0 0 30px #a855f7, 0 0 50px #ec4899, 2px 2px 0 #581c87',
              }}
            >
              {message || 'TARGET ACQUIRED!'}
            </span>
            {/* Scan line effect */}
            <div 
              className="absolute inset-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
              style={{ animation: 'scan-down 0.8s ease-in-out infinite' }}
            />
          </div>
        </div>
        
        {/* Corner scan lines */}
        <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-purple-500 to-transparent" 
          style={{ animation: 'slide-in-left 0.3s ease-out forwards' }} />
        <div className="absolute top-0 left-0 w-1 h-32 bg-gradient-to-b from-purple-500 to-transparent"
          style={{ animation: 'slide-in-top 0.3s ease-out forwards' }} />
        <div className="absolute bottom-0 right-0 w-32 h-1 bg-gradient-to-l from-pink-500 to-transparent"
          style={{ animation: 'slide-in-right 0.3s ease-out forwards' }} />
        <div className="absolute bottom-0 right-0 w-1 h-32 bg-gradient-to-t from-pink-500 to-transparent"
          style={{ animation: 'slide-in-bottom 0.3s ease-out forwards' }} />
      </div>
    );
  }

  // SEAL THE DEAL animation - Luxurious diamond with golden rays
  if (event === 'seal-the-deal') {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
        {/* Rich golden backdrop */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(220, 38, 38, 0.2) 40%, rgba(0, 0, 0, 0.9) 80%)',
            animation: 'fade-in-fast 0.3s ease-out forwards',
          }}
        />
        
        {/* Golden ray bursts */}
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1 origin-left"
              style={{
                width: '50%',
                left: '50%',
                background: `linear-gradient(to right, rgba(251, 191, 36, 0.8), rgba(251, 191, 36, 0.2), transparent)`,
                transform: `rotate(${(360 / 12) * i}deg)`,
                animation: `ray-burst 0.5s ease-out ${i * 0.05}s forwards`,
                opacity: 0,
              }}
            />
          ))}
        </div>
        
        {/* Floating sparkles */}
        <SparkleParticles count={30} color="#fbbf24" />
        
        {/* UNBLOCKABLE badge */}
        <div 
          className="absolute top-1/4"
          style={{ animation: 'badge-slam 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
        >
          <div 
            className="px-6 py-2 rounded-full border-2 border-red-500"
            style={{
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%)',
              boxShadow: '0 0 20px rgba(220, 38, 38, 0.6), 0 0 40px rgba(220, 38, 38, 0.3)',
              animation: 'pulse-glow 0.5s ease-in-out infinite alternate',
            }}
          >
            <span className="text-lg font-black text-white tracking-widest">⚡ UNBLOCKABLE ⚡</span>
          </div>
        </div>
        
        {/* Central diamond with crystal effect */}
        <div 
          className="flex flex-col items-center gap-6"
          style={{ animation: 'diamond-entrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
        >
          <DiamondCrystal />
          
          {/* Luxurious text */}
          <div
            className="relative px-8 py-3 rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.3) 50%, rgba(220, 38, 38, 0.3) 100%)',
              border: '2px solid rgba(251, 191, 36, 0.6)',
              boxShadow: '0 0 30px rgba(251, 191, 36, 0.4), inset 0 0 20px rgba(251, 191, 36, 0.2)',
            }}
          >
            {/* Shimmer effect */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                animation: 'shimmer-sweep 1.5s ease-in-out infinite',
              }}
            />
            <span 
              className="relative text-3xl font-black text-amber-100 tracking-wider"
              style={{
                textShadow: '0 0 10px #fbbf24, 0 0 20px #f59e0b, 0 0 40px #dc2626, 2px 2px 0 #92400e',
              }}
            >
              {message || 'SEAL THE DEAL! 💎'}
            </span>
          </div>
        </div>
        
        {/* Decorative corner diamonds */}
        {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) => (
          <div
            key={pos}
            className={`absolute ${pos} text-2xl`}
            style={{
              animation: `corner-diamond 0.4s ease-out ${0.3 + i * 0.1}s both`,
              filter: 'drop-shadow(0 0 10px #fbbf24)',
            }}
          >
            💎
          </div>
        ))}
      </div>
    );
  }

  // AUDIT BLOCKED animation - Defensive shield with energy barrier
  if (event === 'audit-blocked') {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
        {/* Blue energy backdrop */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(6, 182, 212, 0.2) 40%, rgba(0, 0, 0, 0.8) 80%)',
            animation: 'fade-in-fast 0.2s ease-out forwards',
          }}
        />
        
        {/* Energy shield ripples */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div
              key={i}
              className="absolute w-32 h-32 rounded-full border-4 border-cyan-400"
              style={{
                animation: `shield-ripple 1s ease-out ${delay}s infinite`,
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.5), inset 0 0 30px rgba(6, 182, 212, 0.3)',
              }}
            />
          ))}
        </div>
        
        {/* Hexagon shield pattern */}
        <div 
          className="absolute w-48 h-48 flex items-center justify-center"
          style={{ animation: 'shield-form 0.4s ease-out forwards' }}
        >
          <div 
            className="w-full h-full"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.4) 0%, rgba(6, 182, 212, 0.6) 100%)',
              border: '3px solid rgba(147, 197, 253, 0.8)',
              boxShadow: '0 0 40px rgba(59, 130, 246, 0.5), inset 0 0 40px rgba(6, 182, 212, 0.3)',
              animation: 'shield-pulse 0.5s ease-in-out infinite alternate',
            }}
          />
        </div>
        
        {/* Central content */}
        <div 
          className="flex flex-col items-center gap-4"
          style={{ animation: 'shield-slam-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
        >
          <div 
            className="text-8xl"
            style={{ 
              filter: 'drop-shadow(0 0 20px #3b82f6) drop-shadow(0 0 40px #06b6d4)',
              animation: 'shield-bounce 0.5s ease-out',
            }}
          >
            🛡️
          </div>
          
          <div
            className="px-6 py-2 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(6, 182, 212, 0.8) 100%)',
              border: '2px solid rgba(147, 197, 253, 0.8)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
            }}
          >
            <span 
              className="text-2xl font-black text-blue-100 tracking-wider"
              style={{
                textShadow: '0 0 10px #3b82f6, 0 0 20px #06b6d4',
              }}
            >
              {message || 'BLOCKED!'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const getEventStyles = () => {
    switch (event) {
      case 'ai-action':
        return {
          bg: 'bg-gradient-to-r from-gray-700/90 to-gray-600/90',
          border: 'border-gray-500',
          icon: '🤖',
          glow: 'shadow-gray-500/30',
        };
      default:
        return {
          bg: 'bg-gray-800/90',
          border: 'border-gray-600',
          icon: '⚡',
          glow: '',
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