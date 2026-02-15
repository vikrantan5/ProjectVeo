import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-2xl" data-testid="navbar-logo">
            ClientFlow
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/#services" className="text-muted-foreground hover:text-foreground transition-colors">
              Services
            </Link>
            <Link to="/#portfolio" className="text-muted-foreground hover:text-foreground transition-colors">
              Portfolio
            </Link>
            <Link to="/booking" data-testid="navbar-booking-btn">
              <Button className="glow-primary" data-testid="navbar-cta-btn">
                Start Your Project
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" data-testid="navbar-login-btn">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;