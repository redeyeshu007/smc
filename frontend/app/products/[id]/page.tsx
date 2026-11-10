'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ModelViewerCanvas } from '@/components/3d/ModelViewerCanvas';
import { ARLaunchButton } from '@/components/3d/ARLaunchButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProductDetail {
  _id: string;
  title: string;
  productType: 'door' | 'window';
  description?: string;
  dimensions?: {
    defaultWidth: number;
    defaultHeight: number;
    defaultDepth: number;
    unit: string;
  };
  assets?: {
    primaryGlb?: {
      url: string;
    };
    iosUsdz?: {
      url: string;
    };
  };
}

export default function ProductViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`http://localhost:5000/api/v1/products/${id}`);
        if (res.ok) {
          const json = await res.json();
          setProduct(json.data);
        } else {
          setErrorMessage('Product not found in published catalog.');
        }
      } catch {
        setErrorMessage('Unable to connect to backend server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const glbUrl = product?.assets?.primaryGlb?.url;
  const usdzUrl = product?.assets?.iosUsdz?.url;

  return (
    <div className="container max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Button asChild variant="ghost" size="sm" className="px-0 hover:bg-transparent text-secondary hover:text-foreground">
          <Link href="/dashboard" className="inline-flex items-center space-x-1.5 text-xs">
            <span>←</span>
            <span>Back to Collection</span>
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-20 text-center text-xs text-secondary">
          Loading 3D asset metadata...
        </div>
      ) : errorMessage && !product ? (
        <Card className="p-12 text-center space-y-3 border-border">
          <p className="text-sm font-medium text-foreground">{errorMessage}</p>
          <p className="text-xs text-secondary">
            Return to the collection dashboard to choose an active door or window.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-2 text-xs">
            <Link href="/dashboard">Return to Collection</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Large 3D Model Viewer */}
          <div className="lg:col-span-8 space-y-3">
            <ModelViewerCanvas
              src={glbUrl}
              iosSrc={usdzUrl}
              alt={product?.title || '3D Model'}
              cameraControls
              autoRotate={false}
              arPlacement="wall"
              className="w-full h-[420px] sm:h-[540px] lg:h-[620px]"
            />
            <p className="text-[11px] text-secondary">
              Use your mouse or touch gestures to rotate, pan, and zoom the 3D model.
            </p>
          </div>

          {/* Product Information & AR Action */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-border p-6 bg-white space-y-6">
              {/* Product Name */}
              <div className="space-y-2 border-b border-border pb-6">
                <span className="text-[10px] uppercase tracking-widest text-primary font-semibold block">
                  {product?.productType || 'Architectural System'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-foreground">
                  {product?.title || 'Door / Window Model'}
                </h1>
                {product?.description && (
                  <p className="text-xs text-secondary leading-relaxed pt-1">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Specifications if present */}
              {product?.dimensions && (
                <div className="space-y-2 border-b border-border pb-6 text-xs">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-foreground block">
                    Dimensions
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-secondary">
                    <div>
                      Width: <span className="text-foreground">{product.dimensions.defaultWidth} mm</span>
                    </div>
                    <div>
                      Height: <span className="text-foreground">{product.dimensions.defaultHeight} mm</span>
                    </div>
                  </div>
                </div>
              )}

              {/* View in AR Button */}
              <div className="space-y-3 pt-2">
                <ARLaunchButton
                  glbUrl={glbUrl}
                  usdzUrl={usdzUrl}
                  title={product?.title || 'Architectural Model'}
                  className="w-full h-12"
                />
                <p className="text-[11px] text-secondary text-center leading-normal">
                  Launches Apple AR Quick Look on iOS and Google Scene Viewer on Android for true-scale room placement.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
