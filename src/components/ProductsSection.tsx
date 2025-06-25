
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Cpu, Router, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProductsSection = () => {
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

  const handleAddToCart = (product: typeof products[0]) => {
    navigate('/cart');
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
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
          <Card key={product.id} className="neon-border bg-card/50 hover:bg-card/70 transition-all duration-300 flex flex-col h-full">
            <CardHeader className="p-4 sm:p-6 flex-shrink-0">
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
              <CardDescription className="text-muted-foreground text-sm sm:text-base min-h-[4rem] sm:min-h-[5rem]">
                {product.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 flex-shrink-0">
              <div className="flex justify-between items-center">
                <span className="text-xl sm:text-2xl font-bold text-secondary">${product.price}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">Stock: {product.stock}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 sm:p-6 pt-0 mt-auto">
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
  );
};

export default ProductsSection;
