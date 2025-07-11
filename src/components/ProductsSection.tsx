
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
        const getCardStyles = () => {
          switch (product.cardColor) {
            case 'primary':
              return {
                border: 'border-green-600',
                titleColor: 'text-green-600',
                iconColor: 'text-green-600'
              };
            case 'secondary':
              return {
                border: 'border-blue-600',
                titleColor: 'text-blue-600',
                iconColor: 'text-blue-600'
              };
            case 'destructive':
              return {
                border: 'border-red-600',
                titleColor: 'text-red-600',
                iconColor: 'text-red-600'
              };
            default:
              return {
                border: 'border-primary',
                titleColor: 'text-primary',
                iconColor: 'text-primary'
              };
          }
        };

        const cardStyles = getCardStyles();
        
        return (
          <div key={product.id} className={`relative w-full h-[520px] overflow-hidden transition-all duration-300 hover:scale-105 ${cardStyles.border} border-8 rounded-3xl shadow-2xl drop-shadow-lg hover:shadow-3xl hover:drop-shadow-2xl bg-gray-100`}>
            {/* Circuit board pattern background */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
                radial-gradient(circle at 80% 20%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
                radial-gradient(circle at 20% 80%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
                radial-gradient(circle at 80% 80%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
                radial-gradient(circle at 50% 50%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
                linear-gradient(rgba(200, 200, 200, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(200, 200, 200, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px, 40px 40px, 40px 40px, 40px 40px, 40px 40px, 20px 20px, 20px 20px'
            }}></div>
            
            {/* Card content */}
            <div className="relative h-full flex flex-col p-6">
              {/* Top corner icon */}
              <div className="absolute top-4 left-4">
                <div className={`w-6 h-6 ${cardStyles.iconColor}`}>
                  <IconComponent className="w-full h-full" />
                </div>
              </div>

              {/* Title - Fixed height container */}
              <div className="mb-6 mt-8 h-16 flex items-center justify-center">
                <h2 className={`text-xl font-black text-center tracking-wider uppercase leading-tight font-sans ${cardStyles.titleColor}`}>
                  {product.name}
                </h2>
              </div>

              {/* Main icon area - Fixed height */}
              <div className="flex items-center justify-center mb-6 h-24">
                <div className={`w-24 h-24 flex items-center justify-center ${cardStyles.iconColor}`}>
                  <IconComponent className="w-full h-full" />
                </div>
              </div>

              {/* Description - Fixed height container */}
              <div className="mb-6 text-center h-24 flex items-center justify-center">
                <p className="text-sm font-mono text-black leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              {/* Price and Stock - Fixed height */}
              <div className="flex justify-between items-center mb-4 h-8">
                <span className="text-2xl font-bold text-black">$</span>
                <span className="text-sm text-gray-600 font-mono">Stock: {product.stock}</span>
              </div>

              {/* Add to Cart Button - Fixed at bottom */}
              <div className="mt-auto">
                <Button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/80 neon-glow text-base font-bold h-12"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {/* Bottom right corner icon */}
              <div className="absolute bottom-4 right-4">
                <div className={`w-4 h-4 transform rotate-180 ${cardStyles.iconColor}`}>
                  <IconComponent className="w-full h-full" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductsSection;
