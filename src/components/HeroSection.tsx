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
    <div className="text-center space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
        <Logo size={48} />
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-orbitron text-primary tracking-wider animate-neon-flicker">WIRED</h1>
        <Logo size={48} />
      </div>
      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto px-4 sm:px-0">
        Build your network, connect to the switch, and start mining bitcoin! Race against other players through strategic network building, cyber attacks, and cunning deals. Will you dominate through superior infrastructure or be sabotaged by your opponents?
      </p>
      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
        <Button 
          onClick={handleShopNow}
          className="bg-green-600 text-white hover:bg-green-700 neon-glow px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto"
        >
          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Shop Now
        </Button>
        <Button 
          onClick={handleLearnToPlay}
          variant="outline" 
          className="neon-border px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto"
        >
          <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Learn to Play
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;
