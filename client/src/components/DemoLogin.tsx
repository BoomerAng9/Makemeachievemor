import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export function DemoLogin() {
  const [email, setEmail] = useState('demo@achievemor.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiRequest('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      toast({
        title: "Demo Login Successful",
        description: "Welcome to ACHIEVEMOR platform",
        variant: "default"
      });

      setLocation('/dashboard');
    } catch (error) {
      console.error('Demo login error:', error);
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Demo Access</CardTitle>
        <CardDescription>
          Experience the ACHIEVEMOR platform with demo credentials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDemoLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Demo Login'}
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            <p>Demo credentials are pre-filled</p>
            <p className="mt-2">
              <a href="/api/login" className="text-primary hover:underline">
                Use Replit OAuth instead
              </a>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}