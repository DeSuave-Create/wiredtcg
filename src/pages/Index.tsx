
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import TextSection from '@/components/TextSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Zap, Cpu, Network, Bitcoin, Shield, Users, Server, Router, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const products = [{
    id: 1,
    name: 'WIRED Base Game',
    price: 29.99,
    description: 'Build your network, mine bitcoins, and dominate the competition. Contains PC cards, network cables, switch cards, and bitcoin mining cards.',
    cardIcon: Cpu,
    cardColor: 'primary',
    stock: 15
  }, {
    id: 2,
    name: 'Network Expansion Pack',
    price: 19.99,
    description: 'Expand your infrastructure with router cards, server cards, and advanced networking components for faster mining operations.',
    cardIcon: Router,
    cardColor: 'secondary',
    stock: 8
  }, {
    id: 3,
    name: 'Security Protocol Pack',
    price: 24.99,
    description: 'Defend your network with firewall cards and attack other players with virus cards, DDoS attack cards, and cyber warfare tactics.',
    cardIcon: Shield,
    cardColor: 'destructive',
    stock: 12
  }];

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

  const handleAddToCart = (product: typeof products[0]) => {
    navigate('/cart');
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <ContentSection glowEffect>
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
              <Cpu className="h-8 w-8 sm:h-10 md:h-12 lg:w-12 text-primary animate-pulse" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-wider">WIRED</h1>
              <Bitcoin className="h-8 w-8 sm:h-10 md:h-12 lg:w-12 text-secondary animate-pulse" />
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto px-4 sm:px-0">
              Build your network, connect to the switch, and start mining bitcoins! Race against other players to reach the goal score first through strategic network building, cyber attacks, and cunning deals. Will you dominate through superior infrastructure or sabotage your opponents?
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
              <Button 
                onClick={handleShopNow}
                className="bg-primary text-primary-foreground hover:bg-primary/80 neon-glow px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto"
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
        </ContentSection>

        {/* Game Mechanics */}
        <ContentSection title="How to Win">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="border border-primary/50 shadow-[0_0_10px_rgba(0,255,255,0.3)] bg-card/50 p-4 sm:p-6 rounded-lg text-center space-y-3 sm:space-y-4">
              <Network className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary mx-auto" />
              <h3 className="text-lg sm:text-xl font-semibold text-primary">Build Your Network</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Connect your PC to the switch by using your equipment cards. The faster you make your connections, the more bitcoins you mine per turn.
              </p>
            </div>
            <div className="border border-secondary/50 shadow-[0_0_10px_rgba(255,165,0,0.3)] bg-card/50 p-4 sm:p-6 rounded-lg text-center space-y-3 sm:space-y-4">
              <Bitcoin className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-secondary mx-auto" />
              <h3 className="text-lg sm:text-xl font-semibold text-secondary">Mine Bitcoins</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Once connected, start mining digital currency. Upgrade your network to mine more bitcoins per turn and protect it from outsiders using your specialization cards.
              </p>
            </div>
            <div className="border border-destructive/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] bg-card/50 p-4 sm:p-6 rounded-lg text-center space-y-3 sm:space-y-4 lg:col-span-1 col-span-1">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-destructive mx-auto" />
              <h3 className="text-lg sm:text-xl font-semibold text-destructive">Attack & Defend</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Use your debuff cards to disrupt opponents' networks or negotiate deals. Protect your setup with buff cards and specialization cards.
              </p>
            </div>
          </div>
        </ContentSection>

        {/* Products */}
        <ContentSection title="Available Products" data-products>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {products.map(product => {
              const IconComponent = product.cardIcon;
              const borderColor = product.cardColor === 'primary' ? 'border-primary/50 shadow-[0_0_10px_rgba(0,255,255,0.3)]' :
                                  product.cardColor === 'secondary' ? 'border-secondary/50 shadow-[0_0_10px_rgba(255,165,0,0.3)]' :
                                  'border-destructive/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
              const iconColor = product.cardColor === 'primary' ? 'text-primary' :
                               product.cardColor === 'secondary' ? 'text-secondary' :
                               'text-destructive';
              
              return (
                <Card key={product.id} className="neon-border bg-card/50 hover:bg-card/70 transition-all duration-300">
                  <CardHeader className="p-4 sm:p-6">
                    {/* Playing Card Style Design */}
                    <div className={`w-full h-36 sm:h-40 md:h-48 ${borderColor} border-2 rounded-lg mb-3 sm:mb-4 bg-card/80 flex flex-col justify-between p-3 sm:p-4 relative overflow-hidden`}>
                      {/* Grid pattern background */}
                      <div className="absolute inset-0 opacity-10 grid-pattern"></div>
                      
                      {/* Top left corner */}
                      <div className="flex flex-col items-start">
                        <IconComponent className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColor}`} />
                        <span className={`text-xs font-mono ${iconColor} mt-1`}>WIRED</span>
                      </div>
                      
                      {/* Center icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <IconComponent className={`h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 ${iconColor} opacity-80`} />
                      </div>
                      
                      {/* Bottom right corner (rotated) */}
                      <div className="flex flex-col items-end rotate-180">
                        <IconComponent className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColor}`} />
                        <span className={`text-xs font-mono ${iconColor} mt-1`}>WIRED</span>
                      </div>
                      
                      {/* Circuit lines decoration */}
                      <div className={`absolute top-2 right-2 w-8 h-8 sm:w-12 sm:h-12 border ${iconColor.replace('text-', 'border-')} opacity-30 rounded`}></div>
                      <div className={`absolute bottom-2 left-2 w-6 h-6 sm:w-8 sm:h-8 border ${iconColor.replace('text-', 'border-')} opacity-20 rounded`}></div>
                    </div>
                    
                    <CardTitle className="text-primary text-base sm:text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm sm:text-base">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xl sm:text-2xl font-bold text-secondary">${product.price}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">Stock: {product.stock}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 sm:p-6 pt-0">
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/80 neon-glow text-sm sm:text-base"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </ContentSection>

        {/* Strategy Section */}
        <ContentSection title="Master the Game">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <TextSection title="Strategic Depth" accent>
              <p className="text-sm sm:text-base">Every decision matters in WIRED. Choose your strategy wisely.</p>
              <p className="text-sm sm:text-base">Do you want to focus on expanding or attacking?</p>
              <p className="text-sm sm:text-base">Form temporary alliances with other players and come up with your own strategy.</p>
            </TextSection>
            <TextSection title="Multiple Paths to Victory">
              <p className="text-sm sm:text-base">Build the ultimate mining operation, sabotage your competitors' networks, or become the dealmaker who controls the flow of resources. Each game offers different strategies for reaching the target score first.</p>
            </TextSection>
          </div>
        </ContentSection>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
