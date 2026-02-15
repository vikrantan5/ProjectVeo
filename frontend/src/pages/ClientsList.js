import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/clients`);
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await axios.put(`${API}/clients/${editingClient.id}`, formData);
        toast.success('Client updated successfully');
      } else {
        await axios.post(`${API}/clients`, formData);
        toast.success('Client added successfully');
      }
      setDialogOpen(false);
      setFormData({ name: '', email: '', phone: '', company: '' });
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axios.delete(`${API}/clients/${id}`);
        toast.success('Client deleted');
        fetchClients();
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  const openDialog = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({ name: client.name, email: client.email, phone: client.phone || '', company: client.company || '' });
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', company: '' });
    }
    setDialogOpen(true);
  };

  return (
    <div className="flex" data-testid="clients-page">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2" data-testid="clients-title">Clients</h1>
            <p className="text-muted-foreground">Manage your client relationships</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()} className="glow-primary" data-testid="add-client-btn">
                <Plus className="w-4 h-4 mr-2" /> Add Client
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="client-dialog">
              <DialogHeader>
                <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="client-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="client-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="client-phone-input"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    data-testid="client-company-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="client-submit-btn">
                  {editingClient ? 'Update Client' : 'Add Client'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : clients.length === 0 ? (
          <Card className="p-12 text-center" data-testid="clients-empty">
            <p className="text-muted-foreground">No clients yet. Add your first client to get started.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <Card key={client.id} className="p-6 stat-card" data-testid={`client-card-${client.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-heading font-semibold text-xl">{client.name}</h3>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => openDialog(client)} data-testid={`edit-client-${client.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(client.id)} data-testid={`delete-client-${client.id}`}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.company && (
                    <p className="text-muted-foreground">Company: {client.company}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientsList;