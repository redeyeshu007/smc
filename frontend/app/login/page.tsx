'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      // Prepared for API authentication
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.data?.token) {
        localStorage.setItem('smc_auth_token', data.data.token);
        localStorage.setItem('smc_user', JSON.stringify(data.data.user));
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md border-border p-2 sm:p-4">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-light tracking-tight">
            Account <span className="font-semibold text-primary">Login</span>
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the 3D & AR collection
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="border border-red-200 bg-red-50/50 p-3 text-xs text-red-600">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="architect@studio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full tracking-wider uppercase text-xs font-semibold mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Login'}
            </Button>

            <div className="text-center pt-4 border-t border-border">
              <p className="text-xs text-secondary">
                Do not have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
