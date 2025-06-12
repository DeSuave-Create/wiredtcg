
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import TextSection from '@/components/TextSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Zap, Cpu, Network } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const products = [{
    id: 1,
    name: 'WIRED Base Game',
    price: 29.99,
    description: 'The complete IT card game experience with computers, wires, and switches.',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop',
    stock: 15
  }, {
    id: 2,
    name: 'Network Expansion Pack',
    price: 19.99,
    description: 'Expand your grid with routers, servers, and advanced networking cards.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    stock: 8
  }, {
    id: 3,
    name: 'Security Protocol Pack',
    price: 24.99,
    description: 'Add firewalls, encryption, and cybersecurity elements to your game.',
    image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=300&fit=crop',
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
      description: "Check out our tutorials and game rules!",
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
              <Network className="h-12 w-12 text-secondary animate-pulse" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Ready to get Wired? 
Experience the ultimate IT strategy game where every move counts and every connection matters. Build your network, outsmart your opponents, make shady one sided deals, and become the master of the digital currency.</p>
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

        {/* Products */}
        <ContentSection title="Available Products" data-products>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <Card key={product.id} className="neon-border bg-card/50 hover:bg-card/70 transition-all duration-300">
                <CardHeader>
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
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
            ))}
          </div>
        </ContentSection>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
