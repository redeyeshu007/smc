'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ProductItem {
  _id: string;
  title: string;
  productType: 'door' | 'window';
  status: 'draft' | 'published';
  createdAt: string;
  assets?: {
    primaryGlb?: { url?: string };
    iosUsdz?: { url?: string };
  };
}

export default function AdminDashboardPage() {
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState<'door' | 'window'>('door');
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Published products list
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Fetch published products from API
  const fetchProducts = async () => {
    try {
      setIsLoadingList(true);
      const res = await fetch('http://localhost:5000/api/v1/products');
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data || []);
      }
    } catch {
      // Graceful fallback if backend server isn't actively reachable
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setModelFile(e.target.files[0]);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!productName.trim()) {
      setNotification({ type: 'error', message: 'Please provide a product name.' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Upload 3D model if attached
      let assetId: string | undefined;
      if (modelFile) {
        const formData = new FormData();
        formData.append('file', modelFile);
        formData.append('name', productName);
        formData.append('format', modelFile.name.endsWith('.usdz') ? 'usdz' : 'glb');

        const uploadRes = await fetch('http://localhost:5000/api/v1/assets', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          assetId = uploadJson.data?._id;
        }
      }

      // Step 2: Publish product
      const res = await fetch('http://localhost:5000/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productName,
          sku: `SMC-${Date.now().toString().slice(-6)}`,
          description: `Architectural ${productType} engineered for modern residences.`,
          productType,
          subType: 'standard',
          basePrice: 1200,
          dimensions: { defaultWidth: 2100, defaultHeight: 2400, defaultDepth: 100, unit: 'mm' },
          customizable: {
            widthRange: { min: 1000, max: 3000 },
            heightRange: { min: 1800, max: 2800 },
            materials: [],
            hardware: [],
          },
          assets: assetId ? { primaryGlb: assetId } : undefined,
          status: 'published',
        }),
      });

      if (res.ok) {
        setNotification({ type: 'success', message: 'Product published successfully.' });
        setProductName('');
        setModelFile(null);
        fetchProducts();
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to publish product');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error publishing product. Ensure backend is running.';
      setNotification({
        type: 'error',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch {
      alert('Failed to delete product. Please verify API connection.');
    }
  };

  const handleEdit = (product: ProductItem) => {
    setProductName(product.title);
    setProductType(product.productType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container max-w-7xl mx-auto px-6 sm:px-8 py-10 space-y-10">
      {/* Page Title */}
      <div className="border-b border-border pb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-foreground">
          Admin <span className="font-semibold text-primary">Dashboard</span>
        </h1>
        <p className="text-xs sm:text-sm text-secondary">
          Upload 3D models and manage published architectural doors and windows.
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 border text-xs ${
            notification.type === 'success'
              ? 'border-[#C5A572]/40 bg-[#FAF7F2] text-[#202020]'
              : 'border-red-200 bg-red-50 text-red-600'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <Card className="border-border p-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base font-semibold">Publish New Model</CardTitle>
              <CardDescription>
                Attach a Blender-created 3D asset (.glb or .usdz) to publish.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePublish} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    type="text"
                    placeholder="e.g. Minimalist Aluminum Sliding Door"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="productType">Category Type</Label>
                  <select
                    id="productType"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as 'door' | 'window')}
                    className="flex h-11 w-full border border-border bg-white px-3 text-sm text-foreground focus-visible:outline-none focus-visible:border-primary"
                  >
                    <option value="door">Door</option>
                    <option value="window">Window</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="modelFile">3D Model File (.glb / .usdz)</Label>
                  <div className="border border-dashed border-border p-4 text-center space-y-2 bg-muted/40">
                    <input
                      id="modelFile"
                      type="file"
                      accept=".glb,.gltf,.usdz"
                      onChange={handleFileChange}
                      className="text-xs text-secondary file:mr-3 file:py-1.5 file:px-3 file:border file:border-border file:text-xs file:bg-white file:text-foreground cursor-pointer w-full"
                    />
                    {modelFile && (
                      <p className="text-xs text-primary font-medium truncate pt-1">
                        Selected: {modelFile.name} ({(modelFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full tracking-wider uppercase text-xs font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Product'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Published Product List Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-wider font-semibold text-foreground">
              Published Product List
            </h2>
            <span className="text-xs text-secondary">{products.length} Items</span>
          </div>

          <Card className="border-border">
            {isLoadingList ? (
              <div className="p-12 text-center text-xs text-secondary">
                Loading published products...
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="text-sm font-medium text-foreground">No Published Products</p>
                <p className="text-xs text-secondary">
                  Publish a door or window using the form to populate the live catalog.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {products.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-foreground">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border text-secondary">
                          {item.productType}
                        </span>
                      </div>
                      <p className="text-xs text-secondary">
                        Status: <span className="text-foreground capitalize">{item.status}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(item._id)}
                        className="text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
