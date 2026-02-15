import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Mail, Phone, CheckCircle2, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`);
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/bookings/${id}/status?status=${status}`);
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="flex" data-testid="bookings-page">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2" data-testid="bookings-title">Booking Requests</h1>
          <p className="text-muted-foreground">Review and manage project inquiries</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center" data-testid="bookings-empty">
            <p className="text-muted-foreground">No booking requests yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="p-6 stat-card" data-testid={`booking-card-${booking.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-heading font-semibold text-xl">{booking.name}</h3>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{booking.email}</span>
                      </div>
                      {booking.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{booking.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Project Idea:</span>
                        <p className="text-sm text-muted-foreground mt-1">{booking.project_idea}</p>
                      </div>
                      {booking.website_type && (
                        <p className="text-sm"><span className="font-medium">Type:</span> {booking.website_type}</p>
                      )}
                      {booking.budget_range && (
                        <p className="text-sm"><span className="font-medium">Budget:</span> {booking.budget_range}</p>
                      )}
                      {booking.deadline && (
                        <p className="text-sm"><span className="font-medium">Deadline:</span> {booking.deadline}</p>
                      )}
                    </div>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex gap-2 ml-6">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateStatus(booking.id, 'accepted')}
                        data-testid={`accept-booking-${booking.id}`}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(booking.id, 'rejected')}
                        data-testid={`reject-booking-${booking.id}`}
                      >
                        <X className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
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

export default BookingsList;