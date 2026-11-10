import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDimension } from '@/utils/formatters';
import { Box, Eye, Layers } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isArReady = Boolean(product.assets?.primaryGlb);

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/3] bg-muted/40 overflow-hidden flex items-center justify-center">
        {product.assets?.thumbnailUrl ? (
          <img
            src={product.assets.thumbnailUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/60 space-y-2">
            <Box className="w-12 h-12 stroke-[1.5]" />
            <span className="text-xs">3D Preview Pending</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="bg-background/80 backdrop-blur text-xs capitalize">
            {product.productType}
          </Badge>
          {isArReady && (
            <Badge variant="success" className="text-xs">
              AR Ready
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold line-clamp-1">
            {product.title}
          </CardTitle>
          <span className="text-sm font-bold text-primary whitespace-nowrap">
            {formatCurrency(product.basePrice, product.currency)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {product.description}
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-1 flex-1">
        <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-2">
          <div className="flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5" />
            <span>
              {formatDimension(product.dimensions.defaultWidth)} ×{' '}
              {formatDimension(product.dimensions.defaultHeight)}
            </span>
          </div>
          <span>•</span>
          <span className="capitalize">{product.subType}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/catalog/${product.slug}`}>
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Customize & View 3D
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

