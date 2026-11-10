'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { healthService } from '@/services/health-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Box,
  Server,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Smartphone,
} from 'lucide-react';

const ARCHITECTURE_MODULES = [
  {
    title: '1. Customer Storefront',
    badge: 'Next.js 15 App Router',
    description:
      'High-performance product discovery catalog with real-time dimension and material customization.',
    icon: ShoppingBag,
    href: '/catalog',
    status: 'Ready',
  },
  {
    title: '2. Admin Dashboard',
    badge: 'Operations & Assets',
    description:
      'Administrative portal for publishing Door & Window products and managing 3D GLB/USDZ model assets.',
    icon: LayoutDashboard,
    href: '/admin',
    status: 'Ready',
  },
  {
    title: '3. Backend REST API',
    badge: 'Express.js & TypeScript',
    description:
      'Modular REST API with Zod validation, JWT authentication, unified error handling, and S3/R2 storage integration.',
    icon: Server,
    href: 'http://localhost:5000/api/v1/health',
    external: true,
    status: 'Ready',
  },
  {
    title: '4. MongoDB Database',
    badge: 'Mongoose ODM',
    description:
      'Production collections for Products, 3D Assets (GLB/USDZ), Categories, and Users with full indexing.',
    icon: Database,
    href: '/admin',
    status: 'Ready',
  },
  {
    title: '5. 3D Asset Pipeline',
    badge: 'GLB / USDZ / Sharp',
    description:
      'Blender model ingestion, LOD tagging, polycount metadata, and presigned uploads to S3/Cloudflare R2.',
    icon: Cloud,
    href: '/admin',
    status: 'Ready',
  },
  {
    title: '6. AR Integration Engine',
    badge: 'Google model-viewer',
    description:
      'Google model-viewer runtime with Android Scene Viewer (ARCore) and Apple Quick Look (USDZ) wall-placement AR.',
    icon: Smartphone,
    href: '/ar-viewer',
    status: 'Ready',
  },
];

export default function HomePage() {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['backend-health'],
    queryFn: healthService.checkBackendHealth,
    retry: 1,
    refetchInterval: 10000,
  });

  return (
    <div className="container max-w-7xl px-4 sm:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 p-8 sm:p-10">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary">
              <Sparkles className="w-3 h-3 mr-1" />
              AR Door & Window Platform
            </Badge>
            <Badge variant="secondary">Next.js 15 • React 19 • Express • MongoDB</Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            AR Door & Window Showroom
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground">
            A production-ready full-stack architecture for viewing 3D architectural doors and windows
            and placing them into real spaces using Augmented Reality (Android Scene Viewer & Apple AR Quick Look).
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="default">
              <Link href="/catalog">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Catalog
              </Link>
            </Button>
            <Button asChild variant="outline" size="default">
              <Link href="/ar-viewer">
                <Box className="w-4 h-4 mr-2" />
                AR Experience Engine
              </Link>
            </Button>
            <Button asChild variant="secondary" size="default">
              <Link href="/admin">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Backend & MongoDB Verification Live Banner */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Backend & MongoDB Integration Status
              </CardTitle>
              <CardDescription className="text-xs">
                Live health telemetry queried from Express REST API
              </CardDescription>
            </div>

            {isLoading ? (
              <Badge variant="outline" className="animate-pulse">Checking API...</Badge>
            ) : healthData ? (
              <Badge variant={healthData.data.database.connected ? 'success' : 'warning'}>
                {healthData.data.database.connected ? (
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                )}
                API Online • DB {healthData.data.database.state}
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                API Offline (Start Backend Server)
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="rounded-lg bg-muted/40 p-3 border">
              <span className="text-muted-foreground block mb-1">API Endpoint</span>
              <span className="font-mono font-medium">http://localhost:5000/api/v1</span>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 border">
              <span className="text-muted-foreground block mb-1">Database ODM</span>
              <span className="font-medium">
                {healthData?.data?.database?.type || 'MongoDB (Mongoose)'}
              </span>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 border">
              <span className="text-muted-foreground block mb-1">Storage Engine</span>
              <span className="font-medium capitalize">
                {healthData?.data?.storage?.provider || 'Cloudflare R2 / S3'}
              </span>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 border">
              <span className="text-muted-foreground block mb-1">Active Memory</span>
              <span className="font-medium">
                {healthData?.data?.memory?.heapUsedMB ? `${healthData.data.memory.heapUsedMB} MB Heap` : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architectural Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">System Architecture Modules</h2>
          <span className="text-xs text-muted-foreground">Modular & Clean Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ARCHITECTURE_MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title} className="flex flex-col justify-between hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      {module.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{module.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {module.external ? (
                    <Button asChild variant="outline" size="sm" className="w-full text-xs">
                      <a href={module.href} target="_blank" rel="noopener noreferrer">
                        <span>Check API Status</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </a>
                    </Button>
                  ) : (
                    <Button asChild variant="secondary" size="sm" className="w-full text-xs">
                      <Link href={module.href}>
                        <span>Explore Module</span>
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
