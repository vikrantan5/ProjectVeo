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
    <div className="flex" data-testid="admin-dashboard">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2" data-testid="dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your business</p>
        </div>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="p-6 stat-card" data-testid={`stat-card-${idx}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-primary/10`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
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