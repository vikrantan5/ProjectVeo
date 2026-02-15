import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Login successful!');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background" data-testid="login-page">
      <Card className="w-full max-w-md p-8 glassmorphism">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2" data-testid="login-title">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="login-email-input"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="login-password-input"
            />
          </div>
          <Button type="submit" className="w-full glow-primary" disabled={loading} data-testid="login-submit-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">← Back to Home</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;