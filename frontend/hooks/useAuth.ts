'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService, UserProfile } from '@/services/auth-service';

export function useAuth(options?: {
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'user';
  redirectTo?: string;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const storedUser = authService.getStoredUser();
    const storedToken = authService.getStoredToken();

    setUser(storedUser);
    setToken(storedToken);
    setIsLoading(false);

    if (options?.requireAuth) {
      if (!storedToken || !storedUser) {
        router.push(options.redirectTo || '/login');
        return;
      }

      if (options.requiredRole && storedUser.role !== options.requiredRole) {
        // Non-admin attempting admin page -> redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [options?.requireAuth, options?.requiredRole, options?.redirectTo, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      authService.clearSession();
    } finally {
      setUser(null);
      setToken(null);
      router.push('/login');
    }
  };

  return {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'admin',
    isLoading,
    logout,
    checkAuth,
  };
}
