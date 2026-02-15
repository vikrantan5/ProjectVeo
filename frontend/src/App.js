import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Booking from '@/pages/Booking';
import AdminDashboard from '@/pages/AdminDashboard';
import ClientsList from '@/pages/ClientsList';
import ProjectsList from '@/pages/ProjectsList';
import ProjectForm from '@/pages/ProjectForm';
import ProjectDetail from '@/pages/ProjectDetail';
import ClientProjectView from '@/pages/ClientProjectView';
import BookingsList from '@/pages/BookingsList';

import '@/App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/project/:shareLink" element={<ClientProjectView />} />
            
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/clients"
              element={
                <ProtectedRoute requireAdmin>
                  <ClientsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects"
              element={
                <ProtectedRoute requireAdmin>
                  <ProjectsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects/new"
              element={
                <ProtectedRoute requireAdmin>
                  <ProjectForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute requireAdmin>
                  <BookingsList />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;