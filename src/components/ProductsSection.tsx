import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Cpu, Router, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  card_color: string;
  active: boolean;
  sort_order: number;
}

const ProductsSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id);

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image_url || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=150&fit=crop',
      });
    }

    localStorage.setItem('cartItems', JSON.stringify(existingCart));
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const getCardStyles = (color: string) => {
    switch (color) {
      case 'primary': return { border: 'border-green-600', titleColor: 'text-green-600', iconColor: 'text-green-600' };
      case 'secondary': return { border: 'border-blue-600', titleColor: 'text-blue-600', iconColor: 'text-blue-600' };
      case 'destructive': return { border: 'border-red-600', titleColor: 'text-red-600', iconColor: 'text-red-600' };
      default: return { border: 'border-primary', titleColor: 'text-primary', iconColor: 'text-primary' };
    }
  };

  const getIcon = (color: string) => {
    switch (color) {
      case 'secondary': return Router;
      case 'destructive': return Shield;
      default: return Cpu;
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No products available yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 sm:gap-12 justify-items-center max-w-4xl mx-auto">
      {products.map(product => {
        const cardStyles = getCardStyles(product.card_color);
        const IconComponent = getIcon(product.card_color);

        return (
          <div key={product.id} className={`relative w-full h-[560px] overflow-hidden transition-all duration-300 hover:scale-[1.03] ${cardStyles.border} border-2 rounded-3xl shadow-2xl drop-shadow-lg hover:shadow-3xl hover:drop-shadow-2xl bg-gray-50 dark:bg-gray-800/90 group circuit-card`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1500 ease-in-out z-20"></div>
            <div className="absolute top-4 left-4 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse z-20"></div>
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping z-20" style={{animationDelay: '0.3s'}}></div>
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

            <div className="relative h-full flex flex-col p-5">

              {/* Title */}
              <div className="mb-4 mt-6 flex items-center justify-center">
                <h2 className={`text-[36px] font-black text-center tracking-wider uppercase leading-tight font-sans ${cardStyles.titleColor}`}>
                  {product.name}
                </h2>
              </div>

              {/* Product Image — takes up ~2/3 of card */}
              <div className="flex items-center justify-center flex-1 mb-4" style={{ minHeight: '60%' }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain rounded-xl drop-shadow-lg" />
                ) : (
                  <div className={`w-28 h-28 flex items-center justify-center ${cardStyles.iconColor}`}>
                    <IconComponent className="w-full h-full" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-2 text-center">
                <p className="text-sm text-foreground leading-relaxed font-medium line-clamp-2">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-4">
                <span className={`text-2xl font-black ${cardStyles.titleColor}`}>
                  ${product.price.toFixed(2)}
                </span>
              </div>

              {/* Add to Cart */}
              <div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-primary text-white hover:bg-primary/90 neon-glow text-base font-bold h-11 flex items-center justify-center rounded-3xl"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </button>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductsSection;
