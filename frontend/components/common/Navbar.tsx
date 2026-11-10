'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <header className="w-full border-b border-border bg-white sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-6 sm:px-8">
        {/* Simple Website Identity */}
        <Link href="/" className="flex items-center space-x-3 group">
          <span className="w-2 h-2 bg-primary inline-block" />
          <span className="text-sm font-semibold tracking-wider text-foreground uppercase">
            SMC <span className="font-light text-secondary">Doors & Windows</span>
          </span>
        </Link>

        {/* Dynamic Auth Navigation */}
        {!isAuthPage && (
          <nav className="flex items-center space-x-5 text-xs tracking-wide">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    'transition-colors hover:text-foreground',
                    pathname === '/dashboard' ? 'text-foreground font-semibold' : 'text-secondary'
                  )}
                >
                  Collection
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={cn(
                      'transition-colors hover:text-foreground',
                      pathname === '/admin' ? 'text-foreground font-semibold' : 'text-secondary'
                    )}
                  >
                    Admin Hub
                  </Link>
                )}

                <div className="h-4 w-px bg-border hidden sm:block" />

                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-secondary truncate max-w-[120px]">{user?.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 border border-border text-foreground font-medium uppercase">
                    {user?.role}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="text-secondary hover:text-red-600 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    'transition-colors hover:text-foreground',
                    pathname === '/login' ? 'text-foreground font-semibold' : 'text-secondary'
                  )}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  Create Account
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
