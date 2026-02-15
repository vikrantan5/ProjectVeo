import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Booking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    project_idea: '',
    budget_range: '',
    deadline: '',
    website_type: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/bookings`, formData);
      toast.success('Booking submitted successfully! We\'ll contact you soon.');
      navigate('/');
    } catch (error) {
      toast.error('Failed to submit booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-24" data-testid="booking-form-page">
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-4xl mb-4" data-testid="booking-title">Start Your Project</h1>
          <p className="text-lg text-muted-foreground">Tell us about your project and we'll get back to you within 24 hours</p>
        </div>
        <Card className="p-8 glassmorphism">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  data-testid="booking-name-input"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  data-testid="booking-email-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                data-testid="booking-phone-input"
              />
            </div>
            <div>
              <Label htmlFor="project_idea">Project Description *</Label>
              <Textarea
                id="project_idea"
                rows={5}
                value={formData.project_idea}
                onChange={(e) => handleChange('project_idea', e.target.value)}
                placeholder="Tell us about your project..."
                required
                data-testid="booking-idea-input"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="website_type">Website Type</Label>
                <Select value={formData.website_type} onValueChange={(value) => handleChange('website_type', value)}>
                  <SelectTrigger data-testid="booking-type-select">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portfolio">Portfolio</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget_range">Budget Range</Label>
                <Select value={formData.budget_range} onValueChange={(value) => handleChange('budget_range', value)}>
                  <SelectTrigger data-testid="booking-budget-select">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<$1000">Less than $1,000</SelectItem>
                    <SelectItem value="$1000-$5000">$1,000 - $5,000</SelectItem>
                    <SelectItem value="$5000-$10000">$5,000 - $10,000</SelectItem>
                    <SelectItem value="$10000+">$10,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="deadline">Preferred Deadline</Label>
              <Input
                id="deadline"
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                placeholder="e.g., 2 months, ASAP, Flexible"
                data-testid="booking-deadline-input"
              />
            </div>
            <Button type="submit" className="w-full glow-primary" disabled={loading} data-testid="booking-submit-btn">
              {loading ? 'Submitting...' : 'Submit Project Request'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Booking;