import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import ProductsSection from '@/components/ProductsSection';
import ElectricProgressBar from '@/components/ElectricProgressBar';

const Cart = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 flex justify-center flex-grow">
        <div className="w-full max-w-6xl">
          {/* Electric Progress Bar */}
          <ElectricProgressBar />
          
          {/* Products Section */}
          <ContentSection title="Available Products" data-products>
            <ProductsSection />
          </ContentSection>
          
          {/* Electric Progress Bar */}
          <ElectricProgressBar />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;