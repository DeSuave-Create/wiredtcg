
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'WIRED Base Game',
      price: 29.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=150&fit=crop'
    },
    {
      id: 2,
      name: 'Network Expansion Pack',
      price: 19.99,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop'
    }
  ]);

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

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <ContentSection title="Shopping Cart" glowEffect>
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">
              {cartItems.length === 0 
                ? "Your cart is empty - time to gear up for the digital battlefield!"
                : `You have ${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`
              }
            </p>
          </div>
        </ContentSection>

        {cartItems.length === 0 ? (
          <ContentSection>
            <div className="text-center space-y-6">
              <p className="text-lg text-muted-foreground">Your cart is currently empty.</p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/80 neon-glow">
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
                    <div key={item.id} className="neon-border bg-card/30 p-4 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded neon-border"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary">{item.name}</h3>
                          <p className="text-secondary font-bold">${item.price}</p>
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
                          <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
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
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <ContentSection title="Order Summary">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className="font-semibold">
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-primary/20 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-primary">Total:</span>
                      <span className="text-secondary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {subtotal < 50 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}

                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/80 neon-glow py-3">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full neon-border"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </ContentSection>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
