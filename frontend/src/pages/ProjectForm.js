import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProjectForm = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    deadline: '',
    total_price: 0,
    is_portfolio: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/clients`);
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        deadline: new Date(formData.deadline).toISOString(),
        total_price: parseFloat(formData.total_price)
      };
      await axios.post(`${API}/projects`, submitData);
      toast.success('Project created successfully');
      navigate('/admin/projects');
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex" data-testid="project-form-page">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-3xl">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-3xl mb-2" data-testid="project-form-title">Create New Project</h1>
            <p className="text-muted-foreground">Add a new project to your portfolio</p>
          </div>
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="client_id">Client *</Label>
                <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })} required>
                  <SelectTrigger data-testid="project-client-select">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  data-testid="project-title-input"
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  data-testid="project-description-input"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    data-testid="project-start-date-input"
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    data-testid="project-deadline-input"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="total_price">Total Price ($)</Label>
                <Input
                  id="total_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.total_price}
                  onChange={(e) => setFormData({ ...formData, total_price: e.target.value })}
                  data-testid="project-price-input"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="is_portfolio"
                  checked={formData.is_portfolio}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_portfolio: checked })}
                  data-testid="project-portfolio-switch"
                />
                <Label htmlFor="is_portfolio" className="cursor-pointer">
                  Show in public portfolio
                </Label>
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1 glow-primary" disabled={loading} data-testid="project-submit-btn">
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin/projects')} data-testid="project-cancel-btn">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProjectForm;