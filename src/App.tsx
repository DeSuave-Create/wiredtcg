
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import LoadingSpinner from "@/components/LoadingSpinner";

// Lazy-load all pages
const Index = lazy(() => import("./pages/Index"));
const Extras = lazy(() => import("./pages/Extras"));
const FAQs = lazy(() => import("./pages/FAQs"));
const Cart = lazy(() => import("./pages/Cart"));
const ShoppingCart = lazy(() => import("./pages/ShoppingCart"));
const Score = lazy(() => import("./pages/Score"));
const Founders = lazy(() => import("./pages/Founders"));
const Solysis = lazy(() => import("./pages/Solysis"));
const RulebookViewer = lazy(() => import("./pages/RulebookViewer"));
const InternetInstructions = lazy(() => import("./pages/InternetInstructions"));
const AIInstructions = lazy(() => import("./pages/AIInstructions"));
const BotnetInstructions = lazy(() => import("./pages/BotnetInstructions"));
const Simulation = lazy(() => import("./pages/Simulation"));
const SimulationLog = lazy(() => import("./pages/SimulationLog"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/extras" element={<Extras />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/shop" element={<Cart />} />
              <Route path="/shopping-cart" element={<ShoppingCart />} />
              <Route path="/score" element={<Score />} />
              <Route path="/founders" element={<Founders />} />
              <Route path="/solysis" element={<Solysis />} />
              <Route path="/rulebook" element={<RulebookViewer />} />
              <Route path="/internet-instructions" element={<InternetInstructions />} />
              <Route path="/ai-instructions" element={<AIInstructions />} />
              <Route path="/botnet-instructions" element={<BotnetInstructions />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/simulation-log" element={<SimulationLog />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
