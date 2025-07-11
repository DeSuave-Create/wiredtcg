
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
    name: 'Starter Deck',
    price: 29.99,
    description: 'Build your network, mine bitcoins, and dominate the competition. Contains PC cards, network cables, switch cards, and bitcoin mining cards.',
    cardIcon: Cpu,
    cardColor: 'primary'
  }, {
    id: 2,
    name: 'Office Expansion Pack',
    price: 19.99,
    description: 'Expand your infrastructure with router cards, server cards, and advanced networking components for faster mining operations.',
    cardIcon: Router,
    cardColor: 'secondary'
  }];

  const handleAddToCart = (product: typeof products[0]) => {
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 sm:gap-12 justify-items-center max-w-4xl mx-auto">
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
          <div key={product.id} className={`relative w-full h-[347px] overflow-hidden transition-all duration-300 hover:scale-105 ${cardStyles.border} border-6 rounded-3xl shadow-2xl drop-shadow-lg hover:shadow-3xl hover:drop-shadow-2xl bg-gray-100`}>
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
            <div className="relative h-full flex flex-col p-4">
              {/* Top corner icon */}
              <div className="absolute top-3 left-3">
                <div className={`w-4 h-4 ${cardStyles.iconColor}`}>
                  <IconComponent className="w-full h-full" />
                </div>
              </div>

              {/* Title - Fixed height container */}
              <div className="mb-4 mt-6 h-11 flex items-center justify-center">
                <h2 className={`text-lg font-black text-center tracking-wider uppercase leading-tight font-sans ${cardStyles.titleColor}`}>
                  {product.name}
                </h2>
              </div>

              {/* Main icon area - Fixed height */}
              <div className="flex items-center justify-center mb-4 h-16">
                <div className={`w-16 h-16 flex items-center justify-center ${cardStyles.iconColor}`}>
                  <IconComponent className="w-full h-full" />
                </div>
              </div>

              {/* Description - Fixed height container */}
              <div className="mb-4 text-center h-16 flex items-center justify-center">
                <p className="text-xs text-black leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              {/* Price - Fixed height */}
              <div className="flex justify-center items-center mb-3 h-6">
                <span className="text-xl font-bold text-black">$</span>
              </div>

              {/* Add to Cart Button - Fixed at bottom */}
              <div className="mt-auto">
                <Button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-green-600 text-white hover:bg-green-700 neon-glow text-sm font-bold h-8"
                >
                  <ShoppingCart className="h-3 w-3 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {/* Bottom right corner icon */}
              <div className="absolute bottom-3 right-3">
                <div className={`w-3 h-3 transform rotate-180 ${cardStyles.iconColor}`}>
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
