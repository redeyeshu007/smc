import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isArReady = Boolean(product.glbUrl);
  const displayName = product.name || product.title || 'Architectural Model';

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold line-clamp-1">
            {displayName}
          </CardTitle>
          {isArReady && (
            <span className="text-[10px] uppercase font-semibold text-primary">
              AR Ready
            </span>
          )}
        </div>
      </CardHeader>

      <CardFooter className="p-4 pt-4 gap-2 mt-auto">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/products/${product._id}`}>
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            View 3D & AR
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
