import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, Calendar, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Clients', path: '/admin/clients' },
    { icon: FolderKanban, label: 'Projects', path: '/admin/projects' },
    { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-heading font-bold text-xl" data-testid="sidebar-title">ProjectVeo</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 h-screen bg-card border-r border-border z-40
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-72 lg:w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Desktop Header */}
          <div className="hidden lg:flex p-6 border-b border-border items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-xl mb-1" data-testid="sidebar-title">ProjectVeo</h2>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </div>

          {/* Mobile Header Spacing */}
          <div className="lg:hidden h-16" />

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start gap-3 h-12 text-base ${
                      isActive ? 'glow-primary bg-gradient-to-r from-primary to-accent' : 'hover:bg-muted'
                    }`}
                    data-testid={`sidebar-${item.label.toLowerCase()}-link`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="mb-3 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
              <p className="text-sm font-medium truncate">Admin User</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-base hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              data-testid="sidebar-logout-btn"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;