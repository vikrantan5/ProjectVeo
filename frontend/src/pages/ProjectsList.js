import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, FolderKanban, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, clientsRes] = await Promise.all([
        axios.get(`${API}/projects`),
        axios.get(`${API}/clients`)
      ]);
      setProjects(projectsRes.data);
      const clientsMap = {};
      clientsRes.data.forEach(c => clientsMap[c.id] = c);
      setClients(clientsMap);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'not_started': 'bg-gray-500',
      'designing': 'bg-blue-500',
      'development': 'bg-purple-500',
      'testing': 'bg-orange-500',
      'revision': 'bg-yellow-500',
      'completed': 'bg-green-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="flex" data-testid="projects-page">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2" data-testid="projects-title">Projects</h1>
            <p className="text-muted-foreground">Track and manage all your projects</p>
          </div>
          <Link to="/admin/projects/new">
            <Button className="glow-primary" data-testid="add-project-btn">
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center" data-testid="projects-empty">
            <p className="text-muted-foreground">No projects yet. Create your first project to get started.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => {
              const client = clients[project.client_id];
              const remaining = project.total_price - project.amount_paid;
              return (
                <Link key={project.id} to={`/admin/projects/${project.id}`} data-testid={`project-card-${project.id}`}>
                  <Card className="p-6 stat-card hover:border-primary/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FolderKanban className="w-5 h-5 text-primary" />
                          <h3 className="font-heading font-semibold text-xl">{project.title}</h3>
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusLabel(project.status)}
                          </Badge>
                          {project.is_portfolio && (
                            <Badge variant="outline" className="border-primary text-primary">Portfolio</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Client: {client?.name || 'Unknown'}
                        </p>
                        <div className="space-y-2">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-mono font-semibold">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 text-right space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-mono">₹{project.total_price}</span>
                        </div>
                        {remaining > 0 && (
                          <p className="text-xs text-red-500">Due: ₹{remaining}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectsList;