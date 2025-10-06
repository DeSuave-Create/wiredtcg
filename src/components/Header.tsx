
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/extras', label: 'Extras' },
    { path: '/faqs', label: 'FAQs' },
    { path: '/cart', label: 'Shop' },
    { path: '/shopping-cart', label: 'Cart' },
    { path: '/score', label: 'Score Keeper' },
    { path: '/founders', label: 'Founders' },
    { path: '/solysis', label: 'Solysis' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-primary/30 bg-navbar/95 backdrop-blur-md sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Logo className="" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold font-orbitron text-primary tracking-wider animate-neon-flicker leading-tight">WIRED</span>
              <span className="text-[10px] font-orbitron text-primary/70 tracking-wide leading-tight animate-neon-flicker">The Card Game</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-2 transition-colors font-medium ${
                  isActive(item.path)
                    ? 'text-primary neon-glow'
                    : 'text-navbar-foreground hover:text-primary'
                } after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile & Tablet Menu Button */}
          <button
            className="lg:hidden p-2 text-primary hover:bg-primary/10 rounded neon-border"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile & Tablet Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-primary/20">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 transition-colors ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-navbar-foreground hover:text-primary hover:bg-primary/10'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
