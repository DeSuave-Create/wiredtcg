

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
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <ContentSection glowEffect>
          <div className="text-center space-y-6">
            <div className="flex justify-center items-center space-x-4 mb-6">
              <Cpu className="h-12 w-12 text-primary animate-pulse" />
              <h1 className="text-5xl font-bold text-primary tracking-wider">WIRED</h1>
              <Bitcoin className="h-12 w-12 text-secondary animate-pulse" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Build your network, connect to the switch, and start mining bitcoins! Race against other players to reach the goal score first through strategic network building, cyber attacks, and cunning deals. Will you dominate through superior infrastructure or sabotage your opponents?
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={handleShopNow}
                className="bg-primary text-primary-foreground hover:bg-primary/80 neon-glow px-8 py-3"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Shop Now
              </Button>
              <Button 
                onClick={handleLearnToPlay}
                variant="outline" 
                className="neon-border px-8 py-3"
              >
                <Zap className="h-5 w-5 mr-2" />
                Learn to Play
              </Button>
            </div>
          </div>
        </ContentSection>

        {/* Game Mechanics */}
        <ContentSection title="How to Win">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-primary/50 shadow-[0_0_10px_rgba(0,255,255,0.3)] bg-card/50 p-6 rounded-lg text-center space-y-4">
              <Network className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-primary">Build Your Network</h3>
              <p className="text-muted-foreground">
                Connect your PC to the switch by using your equipment cards. The faster you make your connections, the more bitcoins you mine per turn.
              </p>
            </div>
            <div className="border border-secondary/50 shadow-[0_0_10px_rgba(255,165,0,0.3)] bg-card/50 p-6 rounded-lg text-center space-y-4">
              <Bitcoin className="h-12 w-12 text-secondary mx-auto" />
              <h3 className="text-xl font-semibold text-secondary">Mine Bitcoins</h3>
              <p className="text-muted-foreground">
                Once connected, start mining digital currency. Upgrade your network to mine more bitcoins per turn and protect it from outsiders using your specialization cards.
              </p>
            </div>
            <div className="border border-destructive/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] bg-card/50 p-6 rounded-lg text-center space-y-4">
              <Shield className="h-12 w-12 text-destructive mx-auto" />
              <h3 className="text-xl font-semibold text-destructive">Attack & Defend</h3>
              <p className="text-muted-foreground">
                Use your debuff cards to disrupt opponents' networks or negotiate deals. Protect your setup with buff cards and specialization cards.
              </p>
            </div>
          </div>
        </ContentSection>

        {/* Products */}
        <ContentSection title="Available Products" data-products>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <CardHeader>
                    {/* Playing Card Style Design */}
                    <div className={`w-full h-48 ${borderColor} border-2 rounded-lg mb-4 bg-card/80 flex flex-col justify-between p-4 relative overflow-hidden`}>
                      {/* Grid pattern background */}
                      <div className="absolute inset-0 opacity-10 grid-pattern"></div>
                      
                      {/* Top left corner */}
                      <div className="flex flex-col items-start">
                        <IconComponent className={`h-8 w-8 ${iconColor}`} />
                        <span className={`text-xs font-mono ${iconColor} mt-1`}>WIRED</span>
                      </div>
                      
                      {/* Center icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <IconComponent className={`h-16 w-16 ${iconColor} opacity-80`} />
                      </div>
                      
                      {/* Bottom right corner (rotated) */}
                      <div className="flex flex-col items-end rotate-180">
                        <IconComponent className={`h-8 w-8 ${iconColor}`} />
                        <span className={`text-xs font-mono ${iconColor} mt-1`}>WIRED</span>
                      </div>
                      
                      {/* Circuit lines decoration */}
                      <div className={`absolute top-2 right-2 w-12 h-12 border ${iconColor.replace('text-', 'border-')} opacity-30 rounded`}></div>
                      <div className={`absolute bottom-2 left-2 w-8 h-8 border ${iconColor.replace('text-', 'border-')} opacity-20 rounded`}></div>
                    </div>
                    
                    <CardTitle className="text-primary">{product.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-secondary">${product.price}</span>
                      <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/80 neon-glow"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TextSection title="Strategic Depth" accent>
              <p>Every decision matters in WIRED. Choose between investing in powerful mining rigs for steady income or cheap components to get online fast. Form temporary alliances with other players, then betray them when the time is right.</p>
            </TextSection>
            <TextSection title="Multiple Paths to Victory">
              <p>Build the ultimate mining operation, sabotage your competitors' networks, or become the dealmaker who controls the flow of resources. Each game offers different strategies for reaching the target score first.</p>
            </TextSection>
          </div>
        </ContentSection>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

