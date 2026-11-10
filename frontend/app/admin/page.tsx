'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Cloud,
  Layers,
  UploadCloud,
  FileCode,
  Database,
} from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="container max-w-7xl px-4 sm:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin & 3D Asset Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Backoffice operations for 3D GLB/USDZ models, PBR textures, S3/R2 cloud storage, and catalog configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <Cloud className="w-6 h-6 text-primary" />
              <Badge variant="outline">Cloud Storage</Badge>
            </div>
            <CardTitle className="text-base">Cloudflare R2 / AWS S3</CardTitle>
            <CardDescription className="text-xs">
              Configured via @aws-sdk/client-s3 with automatic local storage fallback for offline dev.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Default Bucket</span>
              <span className="font-mono">smc-3d-assets</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Max Model Upload</span>
              <span>50 MB</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Sharp WebP Compression</span>
              <Badge variant="success" className="text-[10px]">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <Layers className="w-6 h-6 text-primary" />
              <Badge variant="outline">Pipeline</Badge>
            </div>
            <CardTitle className="text-base">Blender Asset Protocol</CardTitle>
            <CardDescription className="text-xs">
              Export guidelines for 3D doors and windows to ensure WebXR & AR compatibility.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Target Polycount</span>
              <span>&lt; 50k triangles</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Coordinate Origin</span>
              <span>Z-Up, Wall Center</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Texture Map Pack</span>
              <span>BaseColor, ORM, Normal</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-6 h-6 text-primary" />
              <Badge variant="outline">Collections</Badge>
            </div>
            <CardTitle className="text-base">MongoDB Mongoose ODM</CardTitle>
            <CardDescription className="text-xs">
              Indexed schema collections supporting high-velocity querying.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Product Schema</span>
              <Badge variant="secondary" className="text-[10px]">Compiled</Badge>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Asset3D Schema</span>
              <Badge variant="secondary" className="text-[10px]">Compiled</Badge>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Category Schema</span>
              <Badge variant="secondary" className="text-[10px]">Compiled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Ingestion Dropzone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-primary" />
            3D Asset Ingestion Pipeline
          </CardTitle>
          <CardDescription className="text-xs">
            Directly uploads GLB/USDZ files and registers metadata in MongoDB with LOD tagging.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-xl p-8 text-center space-y-3 bg-muted/20 hover:bg-muted/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <FileCode className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Drop 3D models or textures here</p>
              <p className="text-xs text-muted-foreground">
                Supported formats: .glb, .gltf, .usdz, .hdr, .png, .webp (up to 50MB)
              </p>
            </div>
            <Button size="sm" variant="outline" className="text-xs">
              Select 3D File from Disk
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
