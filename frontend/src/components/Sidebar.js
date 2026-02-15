import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, Calendar, FileText, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Clients', path: '/admin/clients' },
    { icon: FolderKanban, label: 'Projects', path: '/admin/projects' },
    { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
  ];

  return (
    <div className={`h-screen sticky top-0 bg-card border-r border-border transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!collapsed && (
            <h2 className="font-heading font-bold text-xl" data-testid="sidebar-title">ClientFlow</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            data-testid="sidebar-toggle-btn"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 ${
                    isActive ? 'glow-primary' : ''
                  }`}
                  data-testid={`sidebar-${item.label.toLowerCase()}-link`}
                >
                  <Icon className="w-5 h-5" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={logout}
            data-testid="sidebar-logout-btn"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;