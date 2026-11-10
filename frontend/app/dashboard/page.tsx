'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProductItem {
  _id: string;
  title: string;
  productType: 'door' | 'window';
  description?: string;
  assets?: {
    primaryGlb?: { url?: string };
    iosUsdz?: { url?: string };
  };
}

export default function UserDashboardPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'door' | 'window'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublishedProducts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('http://localhost:5000/api/v1/products?status=published');
        if (res.ok) {
          const json = await res.json();
          setProducts(json.data || []);
        }
      } catch {
        // Handled gracefully when backend is offline
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublishedProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (filter === 'all') return true;
    return p.productType === filter;
  });

  return (
    <div className="container max-w-7xl mx-auto px-6 sm:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-foreground">
            Architectural <span className="font-semibold text-primary">Collection</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Select any published door or window to inspect its 3D model and launch in Augmented Reality.
          </p>
        </div>

        {/* Filter Selection */}
        <div className="flex items-center space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant={filter === 'door' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('door')}
            className="text-xs"
          >
            Doors
          </Button>
          <Button
            variant={filter === 'window' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('window')}
            className="text-xs"
          >
            Windows
          </Button>
        </div>
      </div>

      {/* Product Grid / List */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-secondary">
          Loading published collection...
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center space-y-3 border-border">
          <p className="text-sm font-medium text-foreground">No Published Models Found</p>
          <p className="text-xs text-secondary max-w-md mx-auto">
            There are currently no published doors or windows. Visit the Admin Dashboard to publish models.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-2 text-xs">
            <Link href="/admin">Go to Admin Dashboard</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product._id}
              href={`/products/${product._id}`}
              className="block group focus:outline-none"
            >
              <Card className="h-full border-border hover:border-primary transition-colors flex flex-col justify-between p-6">
                <CardHeader className="p-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-secondary font-medium">
                      {product.productType}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                      AR Ready
                    </span>
                  </div>
                  <CardTitle className="text-base font-medium group-hover:text-primary transition-colors">
                    {product.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0 pt-6 mt-auto flex items-center justify-between border-t border-border/60">
                  <span className="text-xs text-secondary">View 3D Model</span>
                  <span className="text-xs font-semibold text-foreground group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
