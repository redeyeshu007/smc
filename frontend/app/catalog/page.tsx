'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product-service';
import { ProductCard } from '@/features/catalog/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Box, Loader2 } from 'lucide-react';

export default function CatalogPage() {
  const [selectedType, setSelectedType] = useState<'all' | 'door' | 'window'>('all');

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['products', selectedType],
    queryFn: () =>
      productService.getProducts({
        productType: selectedType === 'all' ? undefined : selectedType,
      }),
  });

  const products = response?.data || [];

  return (
    <div className="container max-w-7xl px-4 sm:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Showroom Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse doors and windows with dynamic 3D configuration, photorealistic materials, and AR in-room preview.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            All Products
          </Button>
          <Button
            variant={selectedType === 'door' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('door')}
          >
            Doors
          </Button>
          <Button
            variant={selectedType === 'window' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('window')}
          >
            Windows
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Loading catalog from MongoDB REST API...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-destructive">Unable to fetch products from backend</p>
          <p className="text-xs text-muted-foreground">
            Ensure the backend server is running on port 5000 (`npm run dev` in backend directory).
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Box className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Catalog is Ready for Ingestion</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No products are currently populated. As specified in the architecture instructions,
              products are not hardcoded and will be published via the Admin Dashboard or REST API.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Dynamic Mongoose Collection Connected
          </Badge>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
