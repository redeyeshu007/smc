'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Box, Layers, LayoutDashboard, ShoppingBag } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: Layers },
  { href: '/catalog', label: 'Showroom Catalog', icon: ShoppingBag },
  { href: '/ar-viewer', label: 'AR Experience', icon: Box },
  { href: '/admin', label: 'Admin Hub', icon: LayoutDashboard },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
            <Box className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight">SMC Vision</span>
            <span className="text-xs text-muted-foreground">Door & Window AR</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-3">
          <Badge variant="success" className="hidden sm:inline-flex">
            AR Pipeline Ready
          </Badge>
        </div>
      </div>
    </header>
  );
}
