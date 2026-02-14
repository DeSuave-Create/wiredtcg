
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Extras from "./pages/Extras";
import FAQs from "./pages/FAQs";
import Cart from "./pages/Cart";
import ShoppingCart from "./pages/ShoppingCart";
import Score from "./pages/Score";
import Founders from "./pages/Founders";
import Solysis from "./pages/Solysis";
import RulebookViewer from "./pages/RulebookViewer";
import InternetInstructions from "./pages/InternetInstructions";
import AIInstructions from "./pages/AIInstructions";
import BotnetInstructions from "./pages/BotnetInstructions";
import Simulation from "./pages/Simulation";
import SimulationLog from "./pages/SimulationLog";
import AdminProducts from "./pages/AdminProducts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
