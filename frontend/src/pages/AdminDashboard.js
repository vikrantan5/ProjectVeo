import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, FolderKanban, CheckCircle2, Clock, DollarSign, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Sidebar from '@/components/Sidebar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Users, label: 'Total Clients', value: stats?.total_clients || 0, color: 'text-blue-500' },
    { icon: FolderKanban, label: 'Total Projects', value: stats?.total_projects || 0, color: 'text-purple-500' },
    { icon: Clock, label: 'Active Projects', value: stats?.active_projects || 0, color: 'text-orange-500' },
    { icon: CheckCircle2, label: 'Completed', value: stats?.completed_projects || 0, color: 'text-green-500' },
    { icon: Calendar, label: 'Pending Bookings', value: stats?.pending_bookings || 0, color: 'text-yellow-500' },
    { icon: DollarSign, label: 'Pending Payments', value: `$${stats?.pending_payments || 0}`, color: 'text-red-500' },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" data-testid="admin-dashboard">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2" data-testid="dashboard-title">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Here's your business overview</p>
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-primary">Live</span>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20 sm:py-32">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 animate-slide-up">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={idx} 
                  className="p-5 sm:p-6 stat-card relative overflow-hidden group" 
                  data-testid={`stat-card-${idx}`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                          {stat.label}
                        </p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 sm:p-3.5 rounded-xl bg-gradient-to-br ${
                        stat.color === 'text-blue-500' ? 'from-blue-500/20 to-blue-600/10' :
                        stat.color === 'text-purple-500' ? 'from-purple-500/20 to-purple-600/10' :
                        stat.color === 'text-orange-500' ? 'from-orange-500/20 to-orange-600/10' :
                        stat.color === 'text-green-500' ? 'from-green-500/20 to-green-600/10' :
                        stat.color === 'text-yellow-500' ? 'from-yellow-500/20 to-yellow-600/10' :
                        'from-red-500/20 to-red-600/10'
                      } group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          stat.color === 'text-blue-500' ? 'bg-blue-500' :
                          stat.color === 'text-purple-500' ? 'bg-purple-500' :
                          stat.color === 'text-orange-500' ? 'bg-orange-500' :
                          stat.color === 'text-green-500' ? 'bg-green-500' :
                          stat.color === 'text-yellow-500' ? 'bg-yellow-500' :
                          'bg-red-500'
                        } rounded-full transition-all duration-1000`}
                        style={{width: `${Math.min((typeof stat.value === 'number' ? stat.value : 0) * 10, 100)}%`}}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;