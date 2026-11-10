'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

export function Navbar() {
  const pathname = usePathname();

  // On opening page, show minimal identity or top actions
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

        {/* Minimal Nav Actions */}
        {!isAuthPage && (
          <nav className="flex items-center space-x-6 text-xs tracking-wide">
            <Link
              href="/dashboard"
              className={cn(
                'transition-colors hover:text-foreground',
                pathname === '/dashboard' ? 'text-foreground font-semibold' : 'text-secondary'
              )}
            >
              Collection
            </Link>
            <Link
              href="/admin"
              className={cn(
                'transition-colors hover:text-foreground',
                pathname === '/admin' ? 'text-foreground font-semibold' : 'text-secondary'
              )}
            >
              Admin
            </Link>
            <div className="h-4 w-px bg-border" />
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
          </nav>
        )}
      </div>
    </header>
  );
}
