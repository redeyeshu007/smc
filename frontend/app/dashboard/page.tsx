'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { productService } from '@/services/product-service';
import { Product } from '@/types/product';

export default function UserDashboardPage() {
  const { user, isLoading: authLoading, isAdmin } = useAuth({
    requireAuth: true,
    redirectTo: '/login',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPublishedProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getPublishedProducts();
        setProducts(data);
      } catch {
        // Handled gracefully when offline
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchPublishedProducts();
    }
  }, [authLoading]);

  const filteredProducts = products.filter((p) =>
    (p.name || p.title || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim())
  );

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-8 text-xs text-secondary">
        Verifying user authentication...
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-6 sm:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-secondary">Welcome back,</span>
            <span className="text-xs font-semibold text-foreground">{user?.name}</span>
            {isAdmin && (
              <span className="text-[10px] px-1.5 py-0.2 bg-primary/10 text-primary border border-primary/20">
                Admin
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-foreground">
            Architectural <span className="font-semibold text-primary">Collection</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Select any published door or window to inspect its 3D model and launch in Augmented Reality.
          </p>
        </div>

        {/* Search Filter */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 border border-border px-3 text-xs bg-white text-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-secondary">
          Loading published collection...
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center space-y-3 border-border">
          <p className="text-sm font-medium text-foreground">No Published Models Found</p>
          <p className="text-xs text-secondary max-w-md mx-auto">
            {searchQuery
              ? 'No products matched your search term.'
              : 'There are currently no published doors or windows in the collection.'}
          </p>
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="mt-2 text-xs">
              <Link href="/admin">Go to Admin Dashboard to Upload & Publish</Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const displayName = product.name || product.title || 'Architectural Model';
            return (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                className="block group focus:outline-none"
              >
                <Card className="h-full border-border hover:border-primary transition-colors flex flex-col justify-between p-6">
                  <CardHeader className="p-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-border text-secondary">
                          GLB
                        </span>
                        {product.usdzUrl && (
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-border text-secondary">
                            iOS AR
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                        AR Ready
                      </span>
                    </div>

                    <CardTitle className="text-base font-medium group-hover:text-primary transition-colors pt-2">
                      {displayName}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-0 pt-6 mt-auto flex items-center justify-between border-t border-border/60">
                    <span className="text-xs text-secondary">View 3D Model & AR</span>
                    <span className="text-xs font-semibold text-foreground group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
