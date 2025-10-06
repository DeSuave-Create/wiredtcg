import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Logo from './Logo';

const HeroSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debug: Log when component mounts
  console.log('HeroSection mounted with WIRED animation');

  const handleShopNow = () => {
    toast({
      title: "Welcome to the Shop!",
      description: "Browse our complete collection of WIRED products below.",
    });
    // Scroll to products section
    const productsSection = document.querySelector('[data-products]');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLearnToPlay = () => {
    navigate('/extras');
    toast({
      title: "Learn to Play",
      description: "Master the art of network building and bitcoin mining!",
    });
  };

  return (
    <div className="text-center space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-6 sm:mb-8">
        <Logo size={140} className="hidden sm:block animate-glow-pulse" />
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-orbitron text-primary tracking-wider animate-neon-flicker leading-tight drop-shadow-[0_0_30px_rgba(96,165,250,0.8)]">WIRED</h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-orbitron text-primary/90 tracking-wider mt-2 animate-neon-flicker drop-shadow-[0_0_20px_rgba(96,165,250,0.6)]">The Card Game</p>
        </div>
        <Logo size={140} className="hidden sm:block animate-glow-pulse" />
      </div>
      <p className="text-xs sm:text-sm md:text-base text-muted-foreground/80 max-w-xs sm:max-w-md md:max-w-lg mx-auto px-4 sm:px-0">
        Build your network, connect to the switch, and start mining bitcoin! Race against other players through strategic network building, cyber attacks, and cunning deals. Will you dominate through superior infrastructure or be sabotaged by your opponents?
      </p>
      <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
        <Button 
          onClick={handleShopNow}
          className="bg-primary text-white hover:bg-primary/90 neon-glow px-5 sm:px-6 py-2 text-sm sm:text-base w-full sm:w-auto"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Shop Now
        </Button>
        <Button 
          onClick={handleLearnToPlay}
          variant="outline" 
          className="neon-border text-primary hover:text-primary px-5 sm:px-6 py-2 text-sm sm:text-base w-full sm:w-auto"
        >
          <Zap className="h-4 w-4 mr-2" />
          Learn to Play
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;
