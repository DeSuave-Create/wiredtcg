
import { Zap, Github, Twitter, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Footer = () => {
  const { toast } = useToast();

  const handleSocialClick = (platform: string) => {
    toast({
      title: `${platform} Coming Soon!`,
      description: `Follow us on ${platform} for updates and community content.`,
    });
  };

  return (
    <footer className="border-t neon-border bg-card/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">WIRED</span>
            </div>
            <p className="text-muted-foreground text-sm">
              The ultimate IT-themed card game. Connect, compete, and conquer the digital grid.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-primary mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/extras" className="text-muted-foreground hover:text-primary transition-colors">Game Rules</Link></li>
              <li><Link to="/extras" className="text-muted-foreground hover:text-primary transition-colors">Tutorial Video</Link></li>
              <li><Link to="/faqs" className="text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/score" className="text-muted-foreground hover:text-primary transition-colors">Score Keeper</Link></li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-primary mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Base Game</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Expansions</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Accessories</Link></li>
              <li><Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors">View Cart</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-primary mb-4">Connect</h3>
            <div className="flex space-x-4">
              <button 
                onClick={() => handleSocialClick('Twitter')}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <button 
                onClick={() => handleSocialClick('GitHub')}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
              </button>
              <button 
                onClick={() => handleSocialClick('Email')}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 WIRED Card Game. All rights reserved. | Powered by the Grid.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
