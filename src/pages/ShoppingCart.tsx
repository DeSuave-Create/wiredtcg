import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import { Button } from '@/components/ui/button';
import ConnectionLines from '@/components/ConnectionLines';
import { Plus, Minus, Trash2, CreditCard, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  image: string;
}

const ShoppingCartPage = () => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const getItemBorderColor = (itemName: string) => {
    if (itemName.includes('Starter Deck')) {
      return 'border-green-600';
    } else if (itemName.includes('Office Expansion Pack')) {
      return 'border-blue-600';
    }
    return 'border-green-600';
  };

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    toast({
      title: "Checkout Initiated!",
      description: "Redirecting to secure checkout...",
    });
  };

  const handleContinueShopping = () => {
    window.location.href = '/cart'; // Navigate to shop page
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 flex justify-center flex-grow">
        <div className="w-full max-w-6xl">
          {/* Page Header */}
          <ContentSection title="Shopping Cart" glowEffect>
            <div className="text-center">
              <ShoppingCart className="h-16 w-16 text-green-600 mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">
                {cartItems.length === 0 
                  ? "Your cart is empty - time to gear up for the digital battlefield!"
                  : `You have ${totalItems} item${totalItems > 1 ? 's' : ''} in your cart`
                }
              </p>
            </div>
          </ContentSection>

          {/* Connection Animation */}
          <ConnectionLines className="my-2" />

          {cartItems.length === 0 ? (
            <ContentSection>
              <div className="text-center space-y-6">
                <p className="text-lg text-muted-foreground">Your cart is currently empty.</p>
                <Button 
                  onClick={handleContinueShopping}
                  className="bg-green-600 text-white hover:bg-green-700 neon-glow"
                >
                  Continue Shopping
                </Button>
              </div>
            </ContentSection>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <ContentSection title="Cart Items">
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className={`bg-gray-100 ${getItemBorderColor(item.name)} border-2 rounded-3xl p-4 shadow-2xl drop-shadow-lg`}>
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded neon-border"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-600">{item.name}</h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => updateQuantity(item.id, -1)}
                              variant="outline"
                              size="sm"
                              className="neon-border"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <Button
                              onClick={() => updateQuantity(item.id, 1)}
                              variant="outline"
                              size="sm"
                              className="neon-border"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <Button
                              onClick={() => removeItem(item.id)}
                              variant="outline"
                              size="sm"
                              className="mt-2 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ContentSection>
                
                {/* Connection Animation */}
                <ConnectionLines className="my-2" />
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <ContentSection title="Order Summary">
                  <div className="space-y-4">
                    <div className="border-t border-primary/20 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-green-600">Items in Cart:</span>
                        <span className="text-green-600">{totalItems}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCheckout}
                      className="w-full bg-green-600 text-white hover:bg-green-700 neon-glow py-3 flex items-center justify-center"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Proceed to Checkout
                    </Button>
                    
                    <Button 
                      onClick={handleContinueShopping}
                      variant="outline" 
                      className="w-full bg-gray-100 rounded-3xl text-green-600 hover:bg-gray-200 shadow-2xl drop-shadow-lg"
                    >
                      Continue Shopping
                    </Button>
                  </div>
          </ContentSection>
          
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShoppingCartPage;